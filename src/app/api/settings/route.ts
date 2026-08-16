import { NextResponse } from "next/server";
import { db, ensureTablesExist } from "@/lib/db";
import { SITE_ID } from "@/lib/site";
import { isAuthenticated, verifyPassword, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureTablesExist();
    let settings = await db.siteSettings.findUnique({ where: { id: SITE_ID } });
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: SITE_ID } });
    }
    const { adminPassword: _ap, ...safe } = settings;
    return NextResponse.json(safe);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load settings." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await ensureTablesExist();
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));

    const data = {
      phone: typeof body.phone === "string" ? body.phone : "",
      email: typeof body.email === "string" ? body.email : "",
      location: typeof body.location === "string" ? body.location : "",
      facebook: typeof body.facebook === "string" ? body.facebook : "",
      instagram: typeof body.instagram === "string" ? body.instagram : "",
      linkedin: typeof body.linkedin === "string" ? body.linkedin : "",
    };

    const updated = await db.siteSettings.upsert({
      where: { id: SITE_ID },
      update: data,
      create: { id: SITE_ID, ...data },
    });

    const { adminPassword: _ap, ...safe } = updated;
    return NextResponse.json(safe);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await ensureTablesExist();
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current and new password are required." },
        { status: 400 },
      );
    }
    let settings = await db.siteSettings.findUnique({ where: { id: SITE_ID } });
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: SITE_ID } });
    }
    const valid = await verifyPassword(currentPassword, settings.adminPassword || "");
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 },
      );
    }
    const hash = await hashPassword(newPassword);
    await db.siteSettings.update({
      where: { id: SITE_ID },
      data: { adminPassword: hash },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to change password." }, { status: 500 });
  }
}
