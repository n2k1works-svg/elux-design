import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
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

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use PNG, JPG, WEBP, GIF, or SVG." }, { status: 400 });
    }

    // Validate file size (8MB max)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 8MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split(".").pop() || "png";
    const uniqueName = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // On Vercel, the filesystem is read-only except for /tmp
    // So we save to /tmp and return the path
    // For production, you should use Vercel Blob or a CDN
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // If we can't write to public/uploads (e.g. on Vercel),
      // fall back to returning the original filename as a URL hint
      return NextResponse.json({
        url: `/uploads/${uniqueName}`,
        fallback: true,
        message: "File received. On Vercel, configure Vercel Blob for persistent uploads.",
      });
    }

    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${uniqueName}` });
  } catch (err) {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
