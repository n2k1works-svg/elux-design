import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SITE_ID } from "@/lib/site";
import { isAuthenticated } from "@/lib/auth";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/migrate-images
 *
 * One-time migration: walks every project in the DB, finds image fields that
 * are still base64 data URLs (the old storage strategy that bloated API
 * responses and broke uploads on Vercel's ephemeral filesystem), uploads
 * them to Vercel Blob, and replaces the field with the resulting CDN URL.
 *
 * Idempotent — safe to run multiple times. Already-migrated URLs (starting
 * with http:// or https://) are skipped.
 *
 * Auth required: admin only.
 */
export async function POST() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not set. Link a Blob store to this project first." },
      { status: 500 },
    );
  }

  const result = {
    projectsScanned: 0,
    coverMigrated: 0,
    galleryMigrated: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    const projects = await db.project.findMany({ where: { site: SITE_ID } });
    result.projectsScanned = projects.length;

    for (const p of projects) {
      try {
        const updates: { image?: string; images?: string } = {};

        // Migrate cover image if it's a base64 data URL
        if (p.image && p.image.startsWith("data:")) {
          try {
            const url = await uploadBase64ToBlob(p.image, `project-${p.id}-cover`);
            updates.image = url;
            result.coverMigrated++;
          } catch (e) {
            result.errors.push(`Cover for "${p.title}": ${(e as Error).message}`);
          }
        }

        // Migrate gallery images (stored as JSON string in DB)
        let galleryChanged = false;
        let parsedImages: unknown[] = [];
        try {
          parsedImages = p.images ? JSON.parse(p.images) : [];
          if (!Array.isArray(parsedImages)) parsedImages = [];
        } catch {
          parsedImages = [];
        }

        const newGallery: string[] = [];
        for (let i = 0; i < parsedImages.length; i++) {
          const item = parsedImages[i];
          if (typeof item === "string" && item.startsWith("data:")) {
            try {
              const url = await uploadBase64ToBlob(item, `project-${p.id}-gallery-${i}`);
              newGallery.push(url);
              result.galleryMigrated++;
              galleryChanged = true;
            } catch (e) {
              result.errors.push(
                `Gallery[${i}] for "${p.title}": ${(e as Error).message}`,
              );
              // Keep the original base64 in place — better than losing the image entirely
              newGallery.push(item);
            }
          } else if (typeof item === "string") {
            // Already a URL — skip
            newGallery.push(item);
          }
        }

        if (galleryChanged) {
          updates.images = JSON.stringify(newGallery);
        }

        // Apply updates if anything changed
        if (Object.keys(updates).length > 0) {
          await db.project.update({ where: { id: p.id }, data: updates });
        } else if (!p.image?.startsWith("data:")) {
          result.skipped++;
        }
      } catch (e) {
        result.errors.push(`Project "${p.title}": ${(e as Error).message}`);
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
      message:
        result.coverMigrated + result.galleryMigrated > 0
          ? `Migrated ${result.coverMigrated} cover image(s) and ${result.galleryMigrated} gallery image(s) to Vercel Blob.`
          : "Nothing to migrate — all images already use CDN URLs.",
    });
  } catch (err) {
    console.error("[/api/admin/migrate-images] failed:", err);
    return NextResponse.json(
      { error: "Migration failed.", details: String(err) },
      { status: 500 },
    );
  }
}

/**
 * Parse a base64 data URL and upload the bytes to Vercel Blob.
 * Returns the resulting public CDN URL.
 */
async function uploadBase64ToBlob(dataUrl: string, filenameBase: string): Promise<string> {
  // Parse "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
  const match = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  if (!match) {
    throw new Error("Invalid data URL format");
  }
  const [, mimeType, base64] = match;
  const ext =
    mimeType === "image/png"
      ? "png"
      : mimeType === "image/jpeg"
        ? "jpg"
        : mimeType === "image/webp"
          ? "webp"
          : mimeType === "image/gif"
            ? "gif"
            : mimeType === "image/svg+xml"
              ? "svg"
              : "bin";

  const buffer = Buffer.from(base64, "base64");
  const filename = `uploads/migrated/${filenameBase}.${ext}`;

  const blob = await put(filename, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType: mimeType,
  });

  return blob.url;
}
