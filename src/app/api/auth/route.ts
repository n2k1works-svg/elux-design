import { NextRequest, NextResponse } from "next/server";
import { login, isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const authed = await isAuthenticated();
    return NextResponse.json({ authenticated: authed });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = typeof body?.password === "string" ? body.password : "";
    if (!password) {
      return NextResponse.json({ success: false, error: "Password is required." }, { status: 400 });
    }
    const result = await login(password);
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Invalid password." }, { status: 401 });
    }
    return NextResponse.json({ success: true, token: result.token });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Authentication failed." },
      { status: 500 },
    );
  }
}
