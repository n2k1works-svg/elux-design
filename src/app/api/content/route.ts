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
 */
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
        projects: sProjects,
        testimonials: sTestimonials,
        settings: sSettings,
      });
    }

    return NextResponse.json({ about, services, projects, testimonials, settings });
  } catch (err) {
    console.error("[/api/content] GET failed:", err);
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}
