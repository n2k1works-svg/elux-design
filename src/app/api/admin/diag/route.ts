import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SITE_ID } from "@/lib/site";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Diagnostic endpoint — hit /api/admin/diag to see exactly where
 * time is spent on a cold start. No ensureTablesExist, no image
 * processing. Returns a timing breakdown.
 */
export async function GET() {
  const t = { start: Date.now(), auth: 0, query1: 0, query2: 0, query3: 0, query4: 0, query5: 0, end: 0 };

  try {
    const authed = await isAuthenticated();
    t.auth = Date.now();
    if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Query 1: simple count (tests DB connection)
    const count = await db.project.count({ where: { site: SITE_ID } });
    t.query1 = Date.now();

    // Query 2: findMany (tests data transfer)
    const projects = await db.project.findMany({
      where: { site: SITE_ID },
      orderBy: [{ order: "asc" }],
      take: 5,
    });
    t.query2 = Date.now();

    // Query 3: another table
    const services = await db.service.findMany({
      where: { site: SITE_ID },
      orderBy: [{ order: "asc" }],
    });
    t.query3 = Date.now();

    // Query 4: findFirst
    const about = await db.aboutContent.findFirst({ where: { id: SITE_ID } });
    t.query4 = Date.now();

    // Query 5: settings
    const settings = await db.siteSettings.findFirst({ where: { id: SITE_ID } });
    t.query5 = Date.now();

    t.end = Date.now();

    return NextResponse.json({
      timing: {
        auth_ms: t.auth - t.start,
        query1_count_ms: t.query1 - t.auth,
        query2_projects_ms: t.query2 - t.query1,
        query3_services_ms: t.query3 - t.query2,
        query4_about_ms: t.query4 - t.query3,
        query5_settings_ms: t.query5 - t.query4,
        total_ms: t.end - t.start,
      },
      data: {
        projectCount: count,
        serviceCount: services.length,
        hasAbout: !!about,
        hasSettings: !!settings,
        dbUrl: process.env.DATABASE_URL
          ? process.env.DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, "//[REDACTED]@")
          : "NOT SET",
        neonPooler: process.env.DATABASE_URL?.includes('-pooler.') ? 'YES' : 'NO',
      },
      note: "Hit this twice — first is cold start (slow), second is warm (fast). Compare the two to see cold start overhead.",
    });
  } catch (err) {
    t.end = Date.now();
    return NextResponse.json({
      error: String(err),
      timing: { total_ms: t.end - t.start, auth_ms: t.auth - t.start },
      dbUrl: process.env.DATABASE_URL ? "SET (redacted)" : "NOT SET",
    }, { status: 500 });
  }
}
