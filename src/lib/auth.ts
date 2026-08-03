import { db } from "@/lib/db";
import { cookies } from "next/headers";

const COOKIE_NAME = "elux_admin_token";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Encode a simple base64 token containing a timestamp.
 * Not JWT - intentionally simple per project requirements.
 */
function encodeToken(timestamp: number): string {
  const payload = JSON.stringify({ ts: timestamp, sig: "elux-admin" });
  return Buffer.from(payload, "utf-8").toString("base64");
}

/**
 * Decode a token and validate that it is less than 24 hours old.
 */
function decodeToken(token: string): { valid: boolean; ts?: number } {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    if (parsed.sig !== "elux-admin" || typeof parsed.ts !== "number") {
      return { valid: false };
    }
    const age = Date.now() - parsed.ts;
    if (age > TOKEN_TTL_MS || age < 0) {
      return { valid: false };
    }
    return { valid: true, ts: parsed.ts };
  } catch {
    return { valid: false };
  }
}

/**
 * Verify that the current request is authenticated.
 * Reads the token from cookies and checks timestamp validity.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const { valid } = decodeToken(token);
    return valid;
  } catch {
    return false;
  }
}

/**
 * Attempt to log in. Returns true if password matches.
 * On success, sets the auth cookie.
 */
export async function login(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    let settings = await db.siteSettings.findUnique({ where: { id: "main" } });
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: "main" } });
    }
    if (password !== settings.adminPassword) {
      return { success: false, error: "Invalid password." };
    }
    const token = encodeToken(Date.now());
    try {
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: TOKEN_TTL_MS / 1000,
      });
    } catch (cookieErr) {
      console.error("Cookie set error:", cookieErr);
      // Return token even if cookie fails — frontend can handle it
      return { success: true, token };
    }
    return { success: true, token };
  } catch (dbErr) {
    console.error("Login DB error:", dbErr);
    return { success: false, error: "Database error during login." };
  }
}

/**
 * Log out by clearing the auth cookie.
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Change the admin password. Requires current password verification.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  let settings = await db.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings) {
    settings = await db.siteSettings.create({ data: { id: "main" } });
  }
  if (currentPassword !== settings.adminPassword) {
    return { success: false, error: "Current password is incorrect." };
  }
  if (!newPassword || newPassword.length < 4) {
    return { success: false, error: "New password must be at least 4 characters." };
  }
  await db.siteSettings.update({
    where: { id: "main" },
    data: { adminPassword: newPassword },
  });
  return { success: true };
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
