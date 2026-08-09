import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SITE_ID } from "@/lib/site";
import { isAuthenticated } from "@/lib/auth";
import { seedIfEmpty } from "@/app/api/seed/route";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const all = url.searchParams.get("all") === "1";
    // Showing hidden items requires authentication
    const showAll = all && (await isAuthenticated());
    let services = await db.service.findMany({
      where: { site: SITE_ID, ...(showAll ? {} : { active: true }) },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    // Auto-seed if this site has no services at all
    if (services.length === 0 && !showAll) {
      await seedIfEmpty();
      services = await db.service.findMany({
        where: { site: SITE_ID, active: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });
    }
    return NextResponse.json(services);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const body = await req.json();
    const { title, description, iconKey, order, active } = body;
    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }
    const service = await db.service.create({
      data: { site: SITE_ID, title, description, iconKey: iconKey || "building", order: order ?? 0, active: active ?? true },
    });
    return NextResponse.json(service, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create service." }, { status: 500 });
  }
}
