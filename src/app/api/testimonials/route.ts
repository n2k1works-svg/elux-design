import { NextRequest, NextResponse } from "next/server";
import { db, ensureMigrated } from "@/lib/db";
import { SITE_ID } from "@/lib/site";
import { isAuthenticated } from "@/lib/auth";
import { seedIfEmpty } from "@/app/api/seed/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await ensureMigrated();
    const url = new URL(req.url);
    const all = url.searchParams.get("all") === "1";
    const showAll = all && (await isAuthenticated());
    let testimonials = await db.testimonial.findMany({
      where: { site: SITE_ID, ...(showAll ? {} : { active: true }) },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    // Auto-seed if this site has no testimonials at all
    if (testimonials.length === 0) {
      // Check if testimonials exist but are all inactive — reactivate them
      const totalCount = await db.testimonial.count({ where: { site: SITE_ID } });
      if (totalCount > 0) {
        console.log(`[/api/testimonials] Found ${totalCount} inactive testimonial(s), reactivating...`);
        await db.testimonial.updateMany({ where: { site: SITE_ID, active: false }, data: { active: true } });
      } else {
        console.log('[/api/testimonials] No testimonials found, triggering seed...');
        await seedIfEmpty();
      }
      testimonials = await db.testimonial.findMany({
        where: { site: SITE_ID, ...(showAll ? {} : { active: true }) },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });
    }
    console.log(`[/api/testimonials] Returning ${testimonials.length} testimonial(s)`);
    return NextResponse.json(testimonials);
  } catch (err) {
    console.error('[/api/testimonials] GET failed:', err);
    return NextResponse.json({ error: 'Failed to load testimonials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const quote = String(body.quote || "");
    const name = String(body.name || "");
    const role = String(body.role || "");
    const order = typeof body.order === "number" ? body.order : 0;
    const active = typeof body.active === "boolean" ? body.active : true;

    if (!quote || !name || !role) {
      return NextResponse.json(
        { error: "Quote, name and role are required." },
        { status: 400 },
      );
    }

    const testimonial = await db.testimonial.create({
      data: { site: SITE_ID, quote, name, role, order, active },
    });
    return NextResponse.json(testimonial, { status: 201 });
  } catch (err) {
    console.error('[/api/testimonials] POST failed:', err);
    return NextResponse.json({ error: "Failed to create testimonial." }, { status: 500 });
  }
}
