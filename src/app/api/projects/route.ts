import { NextRequest, NextResponse } from "next/server";
import { db, ensureMigrated } from "@/lib/db";
import { SITE_ID } from "@/lib/site";
import { isAuthenticated } from "@/lib/auth";
import { seedIfEmpty } from "@/app/api/seed/route";

function parseImages(p: { images: string | null }): string[] {
  try {
    const parsed = p.images ? JSON.parse(p.images) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
 try {
    await ensureMigrated();
    const url = new URL(req.url);
    const all = url.searchParams.get("all") === "1";
    // Showing hidden items requires authentication
    const showAll = all && (await isAuthenticated());
    let projects = await db.project.findMany({
      where: { site: SITE_ID, ...(showAll ? {} : { active: true }) },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    // Auto-seed if this site has no projects at all
    if (projects.length === 0 && !showAll) {
      await seedIfEmpty();
      projects = await db.project.findMany({
        where: { site: SITE_ID, active: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });
    }
    return NextResponse.json(projects.map(p => ({ ...p, images: parseImages(p) })));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Projects GET error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const formData = await req.formData();
    const title = String(formData.get("title") || "");
    const location = String(formData.get("location") || "");
    const category = String(formData.get("category") || "");
    const description = String(formData.get("description") || "");
    const image = String(formData.get("image") || "/project-1.png");
    const imagesRaw = formData.get("images");
    const imagesArr = imagesRaw ? JSON.parse(String(imagesRaw)) : [];
    const orderRaw = formData.get("order");
    const order = orderRaw ? parseInt(String(orderRaw), 10) || 0 : 0;
    const activeRaw = formData.get("active");
    const active = activeRaw == null ? true : String(activeRaw) !== "false";

    if (!title || !location || !category || !description) {
      return NextResponse.json(
        { error: "Title, location, category and description are required." },
        { status: 400 },
      );
    }

    const project = await db.project.create({
      data: { site: SITE_ID, title, location, category, description, image, images: JSON.stringify(imagesArr), order, active },
    });
    return NextResponse.json({ ...project, images: imagesArr }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create project." }, { status: 500 });
  }
}
