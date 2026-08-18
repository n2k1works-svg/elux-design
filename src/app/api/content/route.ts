import { NextResponse } from "next/server";
import { db, ensureTablesExist } from "@/lib/db";
import { SITE_ID } from "@/lib/site";
import { seedIfEmpty } from "@/app/api/seed/route";

export const dynamic = "force-dynamic";

/**
 * Single batched endpoint that returns ALL public-facing content
 * in one DB round trip. This replaces 6+ separate API calls
 * (about, services, projects, testimonials, settings) that each
 * incurred their own serverless cold-start + DB latency.
 *
 * STRIP base64 images from project responses — they bloat the
 * payload from ~10KB to 2MB+. The frontend only needs the first
 * image thumbnail for the card grid; full images load on-demand
 * via /api/projects/[id] when the user opens the lightbox.
 */
function stripHeavyImages(projects: Record<string, unknown>[]) {
  return projects.map((p) => {
    const img = String(p.image || "");
    // For the images array: only keep non-base64 entries.
    // The lightbox falls back to [project.image] when images is empty.
    const images: string[] = [];
    try {
      const parsed = p.images ? JSON.parse(String(p.images)) : [];
      if (Array.isArray(parsed)) {
        for (const x of parsed) {
          if (typeof x === "string" && !x.startsWith("data:")) images.push(x);
        }
      }
    } catch { /* ignore */ }
    // Keep cover image if it's a URL or small base64 (<50KB).
    // Large base64 cover → placeholder (frontend shows fallback image).
    const cover = img.startsWith("data:") && img.length > 50_000
      ? "/project-1.png"
      : img;
    return {
      ...p,
      image: cover,
      images: JSON.stringify(images),
    };
  });
}

export async function GET() {
  try {
    await ensureTablesExist();

    // Fire all queries in parallel — one cold start, one migration check,
    // but all DB reads happen concurrently
    const [about, services, projects, testimonials, settings] =
      await Promise.all([
        // About
        db.aboutContent.findFirst({ where: { id: SITE_ID } }).catch(() => null),

        // Services
        db.service
          .findMany({
            where: { site: SITE_ID, active: true },
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          })
          .catch(() => []),

        // Projects
        db.project
          .findMany({
            where: { site: SITE_ID, active: true },
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          })
          .catch(() => []),

        // Testimonials
        db.testimonial
          .findMany({
            where: { site: SITE_ID, active: true },
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          })
          .catch(() => []),

        // Settings
        db.siteSettings.findFirst({ where: { id: SITE_ID } }).catch(() => null),
      ]);

    // Auto-seed if completely empty
    if (
      !about &&
      services.length === 0 &&
      projects.length === 0 &&
      testimonials.length === 0
    ) {
      console.log("[/api/content] No data found, triggering seed...");
      await seedIfEmpty();

      // Re-fetch after seed (single batch again)
      const [sAbout, sServices, sProjects, sTestimonials, sSettings] =
        await Promise.all([
          db.aboutContent.findFirst({ where: { id: SITE_ID } }).catch(() => null),
          db.service.findMany({ where: { site: SITE_ID, active: true }, orderBy: [{ order: "asc" }] }).catch(() => []),
          db.project.findMany({ where: { site: SITE_ID, active: true }, orderBy: [{ order: "asc" }] }).catch(() => []),
          db.testimonial.findMany({ where: { site: SITE_ID, active: true }, orderBy: [{ order: "asc" }] }).catch(() => []),
          db.siteSettings.findFirst({ where: { id: SITE_ID } }).catch(() => null),
        ]);

      return NextResponse.json({
        about: sAbout,
        services: sServices,
        projects: stripHeavyImages(sProjects),
        testimonials: sTestimonials,
        settings: sSettings,
      });
    }

    return NextResponse.json({
      about,
      services,
      projects: stripHeavyImages(projects as Record<string, unknown>[]),
      testimonials,
      settings,
    });
  } catch (err) {
    console.error("[/api/content] GET failed:", err);
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}
