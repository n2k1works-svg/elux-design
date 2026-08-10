import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function parseImages(p: { images: string | null }): string[] {
  try {
    const parsed = p.images ? JSON.parse(p.images) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const project = await db.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ ...project, images: parseImages(project) });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch project." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { id } = await ctx.params;
    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";
    let data: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      for (const key of ["title", "location", "category", "description", "image"]) {
        const v = formData.get(key);
        if (v != null) data[key] = String(v);
      }
      const imagesRaw = formData.get("images");
      if (imagesRaw != null) {
        try {
          const arr = JSON.parse(String(imagesRaw));
          if (Array.isArray(arr)) data.images = JSON.stringify(arr);
        } catch { /* ignore */ }
      }
      const orderRaw = formData.get("order");
      if (orderRaw != null) data.order = parseInt(String(orderRaw), 10) || 0;
      const activeRaw = formData.get("active");
      if (activeRaw != null) data.active = String(activeRaw) !== "false";
    } else {
      const body = await req.json().catch(() => ({}));
      for (const key of ["title", "location", "category", "description", "image"]) {
        if (typeof body[key] === "string") data[key] = body[key];
      }
      if (Array.isArray(body.images)) data.images = JSON.stringify(body.images);
      if (typeof body.order === "number") data.order = body.order;
      if (typeof body.active === "boolean") data.active = body.active;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const updated = await db.project.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { id } = await ctx.params;
    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    await db.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete project." }, { status: 500 });
  }
}
