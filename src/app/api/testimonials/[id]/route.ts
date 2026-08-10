import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const testimonial = await db.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json(testimonial);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch testimonial." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { id } = await ctx.params;
    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const data: Record<string, unknown> = {};
    for (const key of ["quote", "name", "role"]) {
      if (typeof body[key] === "string") data[key] = body[key];
    }
    if (typeof body.order === "number") data.order = body.order;
    if (typeof body.active === "boolean") data.active = body.active;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const updated = await db.testimonial.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update testimonial." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { id } = await ctx.params;
    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    await db.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete testimonial." }, { status: 500 });
  }
}
