import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const all = url.searchParams.get("all") === "1";
    // Showing hidden items requires authentication
    const showAll = all && (await isAuthenticated());
    const projects = await db.project.findMany({
      where: showAll ? undefined : { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(projects);
  } catch (err) {
    return NextResponse.json([], { status: 500 });
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
      data: { title, location, category, description, image, order, active },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create project." }, { status: 500 });
  }
}
