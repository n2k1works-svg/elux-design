import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

const ALLOWED = ["title", "description", "iconKey", "order", "active"] as const;

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const service = await db.service.findUnique({ where: { id } });
    if (!service) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ error: "Failed to fetch service." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const authed = await isAuthenticated();
    if (!authed) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id } = await ctx.params;
    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const key of ALLOWED) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const updated = await db.service.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update service." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const authed = await isAuthenticated();
    if (!authed) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id } = await ctx.params;
    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
    await db.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete service." }, { status: 500 });
  }
}
