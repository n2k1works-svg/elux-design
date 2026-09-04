import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY debug endpoint — verifies whether BLOB_READ_WRITE_TOKEN is
 * actually visible to the running Vercel deployment.
 *
 * Will be deleted once the upload flow is confirmed working.
 */
export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return NextResponse.json({
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenPrefix: token ? token.slice(0, 10) + "..." : "NONE",
    blobRelatedEnvKeys: Object.keys(process.env).filter((k) => k.includes("BLOB")),
    nodeEnv: process.env.NODE_ENV,
  });
}
