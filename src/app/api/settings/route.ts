import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    let settings = await db.siteSettings.findUnique({ where: { id: "main" } });
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: "main" } });
    }
    // Strip adminPassword before returning to the public
    const { adminPassword: _ap, ...safe } = settings;
    return NextResponse.json(safe);
  } catch (err) {
    return NextResponse.json(
      {
        id: "main",
        phone: "+679 000 0000",
        email: "hello@eluxdesign.com",
        location: "Nadi, Fiji",
        facebook: "https://facebook.com/EluxDesign",
        instagram: "https://instagram.com/EluxDesign",
        linkedin: "",
        updatedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
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
      where: { id: "main" },
      update: data,
      create: { id: "main", ...data },
    });

    const { adminPassword: _ap, ...safe } = updated;
    return NextResponse.json(safe);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  // Patch used for password change
  try {
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
    let settings = await db.siteSettings.findUnique({ where: { id: "main" } });
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: "main" } });
    }
    if (currentPassword !== settings.adminPassword) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: "New password must be at least 4 characters." },
        { status: 400 },
      );
    }
    await db.siteSettings.update({
      where: { id: "main" },
      data: { adminPassword: newPassword },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to change password." }, { status: 500 });
  }
}
