import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY debug endpoint — verifies whether BLOB_READ_WRITE_TOKEN is
 * actually visible to the running Vercel deployment, AND tries to list
 * existing blobs in the connected store to confirm the token actually
 * works against a real store.
 *
 * Will be deleted once the upload flow is confirmed working.
 */
export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const storeId = process.env.BLOB_STORE_ID;

  // Try to list blobs (limited to 1) to verify the token actually works
  // against the connected store.
  let listResult: { ok: boolean; error?: string; count?: number } = { ok: false };
  try {
    const result = await list({ limit: 1 });
    listResult = { ok: true, count: result.blobs.length };
  } catch (e) {
    listResult = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  return NextResponse.json({
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenPrefix: token ? token.slice(0, 10) + "..." : "NONE",
    storeId: storeId ? storeId.slice(0, 12) + "..." : "NOT SET",
    blobRelatedEnvKeys: Object.keys(process.env).filter((k) => k.includes("BLOB")),
    listProbe: listResult,
    nodeEnv: process.env.NODE_ENV,
  });
}
