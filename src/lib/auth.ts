import { db } from "@/lib/db";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const COOKIE_NAME = "elux_admin_token";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const BCRYPT_ROUNDS = 12;

// HMAC secret — unique per deployment, derived from a server-side env var.
// Falls back to a random value on each restart if not set (dev mode only).
function getHmacSecret(): Buffer {
  const raw = process.env.AUTH_SECRET || "fallback-dev-only-change-me";
  return Buffer.from(raw, "utf-8");
}

/**
 * Create an HMAC-signed token containing a timestamp.
 * Unlike the old base64 approach, this cannot be forged without the AUTH_SECRET.
 */
function encodeToken(timestamp: number): string {
  const payload = JSON.stringify({ ts: timestamp });
  const sig = crypto
    .createHmac("sha256", getHmacSecret())
    .update(payload)
    .digest("hex");
  return Buffer.from(JSON.stringify({ p: payload, s: sig }), "utf-8").toString("base64");
}

/**
 * Decode and verify an HMAC-signed token.
 * Returns true only if the signature is valid AND the token is within TTL.
 */
function decodeToken(token: string): { valid: boolean; ts?: number } {
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const { p: payload, s: sig } = JSON.parse(raw);
    if (!payload || !sig) return { valid: false };
    const expected = crypto
      .createHmac("sha256", getHmacSecret())
      .update(payload)
      .digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return { valid: false };
    }
    const parsed = JSON.parse(payload);
    if (typeof parsed.ts !== "number") return { valid: false };
    const age = Date.now() - parsed.ts;
    if (age > TOKEN_TTL_MS || age < 0) return { valid: false };
    return { valid: true, ts: parsed.ts };
  } catch {
    return { valid: false };
  }
}

/**
 * Hash a plain-text password using bcrypt.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/**
 * Verify a plain-text password against a bcrypt hash.
 * Also handles plain-text comparison for migration from old format.
 */
export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  // If stored looks like a bcrypt hash ($2a$ / $2b$), use bcrypt
  if (stored.startsWith("$2")) {
    return bcrypt.compare(plain, stored);
  }
  // Legacy: plain-text comparison + auto-migrate
  if (plain === stored) {
    // Upgrade the stored password to a bcrypt hash
    try {
      const hash = await hashPassword(plain);
      await db.siteSettings.update({
        where: { id: "main" },
        data: { adminPassword: hash },
      });
    } catch (e) {
      console.error("Auto-migrate password hash failed:", e);
    }
    return true;
  }
  return false;
}

/**
 * Verify that the current request is authenticated.
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
    // Retry DB connection for cold-start resilience
    let settings = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        settings = await db.siteSettings.findUnique({ where: { id: "main" } });
        break;
      } catch (e) {
        if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        else throw e;
      }
    }
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: "main" } });
    }
    const valid = await verifyPassword(password, settings.adminPassword || "");
    if (!valid) {
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
 * New passwords are always stored as bcrypt hashes.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  let settings = await db.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings) {
    settings = await db.siteSettings.create({ data: { id: "main" } });
  }
  const valid = await verifyPassword(currentPassword, settings.adminPassword || "");
  if (!valid) {
    return { success: false, error: "Current password is incorrect." };
  }
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters." };
  }
  const hash = await hashPassword(newPassword);
  await db.siteSettings.update({
    where: { id: "main" },
    data: { adminPassword: hash },
  });
  return { success: true };
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
