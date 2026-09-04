import { NextResponse } from "next/server";

/**
 * GET /api
 *
 * Public health-check endpoint. Used by uptime monitors, load balancers,
 * and curious humans to verify the deployment is live and reachable.
 *
 * Returns minimal info — no secrets, no DB queries, no auth required.
 * For an authenticated diagnostic, see /api/admin/diag.
 */
export async function GET() {
  return NextResponse.json({
    name: "Elux Design API",
    status: "ok",
    time: new Date().toISOString(),
  });
}
