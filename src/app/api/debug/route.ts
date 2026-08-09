import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SITE_ID } from "@/lib/site";

// GET /api/debug — shows DB state without requiring auth
// This helps diagnose why admin shows 0 projects
export async function GET() {
  try {
    const [projectCount, allProjects, testimonialCount, serviceCount, settings, about] =
      await Promise.all([
        db.project.count({ where: { site: SITE_ID } }),
        db.project.findMany({ where: { site: SITE_ID }, select: { id: true, title: true, site: true } }),
        db.testimonial.count({ where: { site: SITE_ID } }),
        db.service.count({ where: { site: SITE_ID } }),
        db.siteSettings.findUnique({ where: { id: SITE_ID } }),
        db.aboutContent.findUnique({ where: { id: SITE_ID } }),
      ]);

    // Also count ALL records (no site filter) to see if there's data from other sites
    const [allProjectCount, allServiceCount, allTestimonialCount] =
      await Promise.all([
        db.project.count(),
        db.service.count(),
        db.testimonial.count(),
      ]);

    return NextResponse.json({
      siteId: SITE_ID,
      databaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, "//[REDACTED]@") : "NOT SET",
      elux: {
        projects: { count: projectCount, items: allProjects },
        testimonials: testimonialCount,
        services: serviceCount,
        settings: settings ? "exists" : "MISSING",
        about: about ? "exists" : "MISSING",
      },
      allSites: {
        projects: allProjectCount,
        services: allServiceCount,
        testimonials: allTestimonialCount,
      },
    });
  } catch (err) {
    return NextResponse.json({
      error: String(err),
      siteId: SITE_ID,
      databaseUrl: process.env.DATABASE_URL ? "SET (redacted)" : "NOT SET",
    }, { status: 500 });
  }
}
