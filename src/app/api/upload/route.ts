import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import sharp from "sharp";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"];
const MAX_INPUT_SIZE = 15 * 1024 * 1024; // 15MB per image
const MAX_OUTPUT_PIXELS = 1600; // Max width/height — keeps data URL reasonable

export async function POST(req: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use PNG, JPG, WEBP, GIF, or SVG." }, { status: 400 });
    }

    if (file.size > MAX_INPUT_SIZE) {
      return NextResponse.json({ error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 15MB per image.` }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Compress and resize with sharp
    const pipeline = sharp(bytes);
    const metadata = await pipeline.metadata();

    let processed: Buffer;
    if (metadata.width && metadata.width > MAX_OUTPUT_PIXELS) {
      processed = await pipeline
        .resize(MAX_OUTPUT_PIXELS, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } else {
      processed = await pipeline
        .jpeg({ quality: 80 })
        .toBuffer();
    }

    const dataUrl = `data:image/jpeg;base64,${processed.toString("base64")}`;

    return NextResponse.json({ url: dataUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed: " + (err instanceof Error ? err.message : "Unknown error") }, { status: 500 });
  }
}
