import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

const MAX_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

/**
 * Upload an image to Vercel Blob and return its public URL.
 *
 * Vercel Blob is a persistent object store backed by Vercel's CDN — unlike
 * writing to `public/uploads/` on the serverless filesystem, files uploaded
 * here survive cold starts and are served globally with caching.
 *
 * Required env: BLOB_READ_WRITE_TOKEN (set automatically when the Blob store
 * is linked to the project via the Vercel dashboard).
 *
 * Auth required: only logged-in admins can upload.
 */
export async function POST(req: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Vercel Blob requires a token. Without it we return a clear, actionable error.
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            "BLOB_READ_WRITE_TOKEN is not set. Create a Blob store in the Vercel dashboard (Storage → Blob → Create) and link it to this project. See https://vercel.com/docs/storage/vercel-blob for details.",
        },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Use PNG, JPG, WEBP, GIF, or SVG.`,
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max 15MB.`,
        },
        { status: 400 },
      );
    }

    // Generate a unique, path-traversal-safe filename.
    // Vercel Blob uses the filename as the URL slug, so we want it unique but readable.
    const ext = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeExt = ext.length >= 2 && ext.length <= 5 ? `.${ext}` : "";
    const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;

    // Read file into a Buffer for Vercel Blob's put().
    // (Vercel Blob also accepts a File or Blob directly, but Buffer is safe in
    // all Next.js server runtimes — Node.js edge doesn't have File.)
    const buffer = Buffer.from(await file.arrayBuffer());

    const blob = await put(filename, buffer, {
      access: "public",
      addRandomSuffix: false, // we already added a random suffix above
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
