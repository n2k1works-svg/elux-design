import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const all = url.searchParams.get("all") === "1";
    // Showing hidden items requires authentication
    const showAll = all && (await isAuthenticated());
    const testimonials = await db.testimonial.findMany({
      where: showAll ? undefined : { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(testimonials);
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
      data: { quote, name, role, order, active },
    });
    return NextResponse.json(testimonial, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create testimonial." }, { status: 500 });
  }
}
