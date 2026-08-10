import { NextRequest, NextResponse } from "next/server";
import { login, isAuthenticated } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Lock out after 5 failed attempts per IP in 15 minutes
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

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
    const ip = getClientIp(req);
    if (!rateLimit(ip, LOGIN_LIMIT, LOGIN_WINDOW_MS)) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const password = typeof body?.password === "string" ? body.password : "";
    if (!password) {
      return NextResponse.json({ success: false, error: "Password is required." }, { status: 400 });
    }
    const result = await login(password);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Invalid password." },
        { status: 401 },
      );
    }
    return NextResponse.json({ success: true, token: result.token });
  } catch (err) {
    console.error("Auth POST error:", err);
    return NextResponse.json(
      { success: false, error: "Authentication failed." },
      { status: 500 },
    );
  }
}
