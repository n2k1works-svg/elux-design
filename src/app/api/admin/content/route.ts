import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SITE_ID } from "@/lib/site";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Batch admin endpoint — returns ALL data the admin dashboard needs
 * in a SINGLE API call. This replaces 5 separate round-trips that each
 * triggered their own serverless cold start + DB connection.
 *
 * Strips heavy base64 images from projects — the list view only needs
 * thumbnails. Full images load on-demand when editing a single project.
 */
function stripHeavyImages(projects: Record<string, unknown>[]) {
  return projects.map((p) => {
    const img = String(p.image || "");
    const images: string[] = [];
    try {
      const parsed = p.images ? JSON.parse(String(p.images)) : [];
      if (Array.isArray(parsed)) {
        for (const x of parsed) {
          if (typeof x === "string" && !x.startsWith("data:")) images.push(x);
        }
      }
    } catch { /* ignore */ }
    const cover = img.startsWith("data:") && img.length > 20_000
      ? "/project-1.png"
      : img;
    return {
      ...p,
      image: cover,
      images, // Already a string[] — no need to stringify + re-parse
    };
  });
}

export async function GET() {
  const t0 = Date.now();
  try {
    // Single auth check for the whole batch
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const t1 = Date.now();

    // ALL queries in parallel — one cold start, one migration check
    const [projects, services, testimonials, settings, about] =
      await Promise.all([
        db.project
          .findMany({
            where: { site: SITE_ID },
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          })
          .catch((e) => { console.error("[admin/content] projects:", e); return []; }),

        db.service
          .findMany({
            where: { site: SITE_ID },
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          })
          .catch((e) => { console.error("[admin/content] services:", e); return []; }),

        db.testimonial
          .findMany({
            where: { site: SITE_ID },
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          })
          .catch((e) => { console.error("[admin/content] testimonials:", e); return []; }),

        db.siteSettings
          .findFirst({ where: { id: SITE_ID } })
          .catch((e) => { console.error("[admin/content] settings:", e); return null; }),

        db.aboutContent
          .findUnique({ where: { id: SITE_ID } })
          .catch((e) => { console.error("[admin/content] about:", e); return null; }),
      ]);

    const t2 = Date.now();
    console.log(
      `[admin/content] total=${t2 - t0}ms auth=${t1 - t0}ms queries=${t2 - t1}ms projects=${projects.length} services=${services.length} testimonials=${testimonials.length}`
    );

    // Strip base64 images from project list to keep payload small
    // stripHeavyImages already returns images as string[]
    const lightProjects = stripHeavyImages(projects as Record<string, unknown>[]);

    // Remove password from settings
    const { adminPassword: _ap, ...safeSettings } = (settings || {}) as Record<string, unknown>;

    return NextResponse.json({
      projects: lightProjects,
      services,
      testimonials,
      settings: safeSettings,
      about,
    });
  } catch (err) {
    console.error("[admin/content] GET failed:", err);
    return NextResponse.json(
      { error: "Failed to load admin data" },
      { status: 500 }
    );
  }
}
