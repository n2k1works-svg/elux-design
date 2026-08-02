import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// Only these fields are updatable
const ALLOWED_FIELDS = [
  "paragraph1", "paragraph2", "paragraph3",
  "statYears", "statProjects", "statSpecializations", "statSatisfaction",
  "statYearsLabel", "statProjectsLabel", "statSpecLabel", "statSatLabel",
];

function sanitizeBody(body: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) {
      clean[key] = body[key];
    }
  }
  return clean;
}

export async function GET() {
  try {
    let about = await db.aboutContent.findUnique({ where: { id: "main" } });
    if (!about) {
      about = await db.aboutContent.create({ data: { id: "main" } });
    }
    return NextResponse.json(about);
  } catch (err) {
    console.error("[GET /api/about]", err);
    return NextResponse.json({ error: "Failed to load." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const body = await req.json();
    const data = sanitizeBody(body);
    const about = await db.aboutContent.upsert({
      where: { id: "main" },
      update: data,
      create: { id: "main", ...data },
    });
    return NextResponse.json(about);
  } catch (err) {
    console.error("[PUT /api/about]", err);
    return NextResponse.json({ error: "Failed to update." }, { status: 500 });
  }
}
