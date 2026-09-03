import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SITE_ID } from "@/lib/site";
import { seedIfEmpty } from "@/app/api/seed/route";

export const dynamic = "force-dynamic";

/**
 * Single batched endpoint that returns ALL public-facing content
 * in one DB round trip. No ensureTablesExist() — tables are created
 * by /api/seed during initial setup.
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
    const cover = img.startsWith("data:") && img.length > 50_000
      ? "/project-1.png"
      : img;
    return {
      ...p,
      image: cover,
      images: images,
    };
  });
}

/** Parse the images field from JSON string → array for frontend consumption */
function parseProjectImages(projects: Record<string, unknown>[]) {
  return projects.map((p) => ({
    ...p,
    images: typeof p.images === "string" ? safeJsonParse(p.images) : Array.isArray(p.images) ? p.images : [],
  }));
}

function safeJsonParse(val: string): unknown[] {
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    // NO ensureTablesExist() — go straight to queries.
    // If tables don't exist, Prisma will error and we return empty data.
    const [about, services, projects, testimonials, settings] =
      await Promise.all([
        db.aboutContent.findFirst({ where: { id: SITE_ID } }).catch(() => null),
        db.service
          .findMany({
            where: { site: SITE_ID, active: true },
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          })
          .catch(() => []),
        db.project
          .findMany({
            where: { site: SITE_ID, active: true },
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          })
          .catch(() => []),
        db.testimonial
          .findMany({
            where: { site: SITE_ID, active: true },
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          })
          .catch(() => []),
        db.siteSettings.findFirst({ where: { id: SITE_ID } }).catch(() => null),
      ]);

    // If ALL collections are empty, trigger seed once
    const allEmpty = !about && services.length === 0 && projects.length === 0 && testimonials.length === 0;
    if (allEmpty) {
      console.log("[/api/content] All collections empty, triggering seed...");
      try {
        await seedIfEmpty();
      } catch (e) {
        console.error("[/api/content] Seed failed:", e);
      }
      // Re-fetch after seed
      const [sAbout, sServices, sProjects, sTestimonials, sSettings] =
        await Promise.all([
          db.aboutContent.findFirst({ where: { id: SITE_ID } }).catch(() => null),
          db.service.findMany({ where: { site: SITE_ID, active: true }, orderBy: [{ order: "asc" }] }).catch(() => []),
          db.project.findMany({ where: { site: SITE_ID, active: true }, orderBy: [{ order: "asc" }] }).catch(() => []),
          db.testimonial.findMany({ where: { site: SITE_ID, active: true }, orderBy: [{ order: "asc" }] }).catch(() => []),
          db.siteSettings.findFirst({ where: { id: SITE_ID } }).catch(() => null),
        ]);

      const { adminPassword: _ap2, ...safeSettings2 } = (sSettings || {}) as Record<string, unknown>;
      return NextResponse.json({
        about: sAbout,
        services: sServices,
        projects: parseProjectImages(stripHeavyImages(sProjects as Record<string, unknown>[])),
        testimonials: sTestimonials,
        settings: safeSettings2,
      });
    }

    // Reactivate inactive testimonials if no active ones exist
    let finalTestimonials = testimonials;
    if (finalTestimonials.length === 0) {
      try {
        const totalCount = await db.testimonial.count({ where: { site: SITE_ID } });
        if (totalCount > 0) {
          await db.testimonial.updateMany({ where: { site: SITE_ID, active: false }, data: { active: true } });
          finalTestimonials = await db.testimonial.findMany({
            where: { site: SITE_ID, active: true },
            orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          });
        }
      } catch (e) {
        console.error("[/api/content] Testimonial reactivation failed:", e);
      }
    }

    const { adminPassword: _ap, ...safeSettings } = (settings || {}) as Record<string, unknown>;
    return NextResponse.json({
      about,
      services,
      projects: parseProjectImages(stripHeavyImages(projects as Record<string, unknown>[])),
      testimonials: finalTestimonials,
      settings: safeSettings,
    });
  } catch (err) {
    console.error("[/api/content] GET failed:", err);
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}
