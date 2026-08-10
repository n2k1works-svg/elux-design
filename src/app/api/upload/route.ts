import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = new Set([
  "image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml",
]);

/**
 * Convert a File/Buffer to a base64 data URL.
 * No external storage — images live as data URLs in the database.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Use PNG, JPG, WEBP, GIF, or SVG.` },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max 15MB.` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ url: dataUrl });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
