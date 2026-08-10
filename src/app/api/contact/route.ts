import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Allow 3 contact form submissions per IP per hour
const CONTACT_LIMIT = 3;
const CONTACT_WINDOW_MS = 60 * 60 * 1000;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(ip, CONTACT_LIMIT, CONTACT_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
    }
    const toEmail = process.env.CONTACT_EMAIL || "hello@eluxdesign.com";

    const resend = new Resend(apiKey);

    const safeName = esc(String(name).slice(0, 200));
    const safeEmail = esc(String(email).slice(0, 200));
    const safeSubject = esc(String(subject || "").slice(0, 200));
    const safeMessage = esc(String(message).slice(0, 5000));

    const subjectLine = subject
      ? `[Elux Design] ${String(subject).slice(0, 200)} — from ${String(name).slice(0, 100)}`
      : `[Elux Design] New Inquiry from ${String(name).slice(0, 100)}`;

    const { error } = await resend.emails.send({
      from: "Elux Design Website <noreply@eluxfiji.com>",
      to: toEmail,
      replyTo: String(email).slice(0, 200),
      subject: subjectLine,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #C9A84C; margin-bottom: 20px;">New Inquiry from Elux Design Website</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #888; width: 120px;">Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #888;">Email</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${safeEmail}" style="color: #C9A84C;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #888;">Service</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${safeSubject || "—"}</td>
            </tr>
          </table>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
            <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px;">Message</p>
            <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
