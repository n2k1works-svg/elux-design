/**
 * Simple in-memory rate limiter for serverless environments.
 * Tracks IP addresses and limits requests within a sliding window.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Clean up expired entries every 5 minutes to prevent memory leaks
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}

/**
 * Rate limit a request by IP.
 * @param ip - Client IP address
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if the request is allowed, false if rate limited
 */
export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  cleanup();
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now >= entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Get the client IP from a Next.js request.
 * Checks X-Forwarded-For (Vercel sets this) then falls back to X-Real-IP.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}
