import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import path from "node:path";
import fs from "node:fs/promises";

export const dynamic = "force-dynamic";

const MAX_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

/**
 * Upload an image file and return a URL that can be stored on a Project.
 *
 * Stores the file under /public/uploads/ so it is served statically by Next.js.
 * This avoids bloating the database with multi-MB base64 strings (which caused
 * 5-minute admin load times — see worklog Task ID 1).
 *
 * Auth required: only logged-in admins can upload.
 */
export async function POST(req: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Use PNG, JPG, WEBP, GIF, or SVG.`,
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max 15MB.`,
        },
        { status: 400 },
      );
    }

    // Read file into a Buffer. The request body is already in memory at this
    // point (formData() consumed it), so we don't need streaming for 15MB.
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate a unique filename to avoid collisions and path traversal.
    // Format: <timestamp>-<random>.<ext>
    const ext = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeExt = ext.length >= 2 && ext.length <= 5 ? `.${ext}` : "";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;

    // Write to /public/uploads/ → served at /uploads/<filename>
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const fullPath = path.join(uploadDir, filename);
    await fs.writeFile(fullPath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
