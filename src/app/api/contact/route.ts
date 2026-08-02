import { NextResponse } from "next/server";
import { Resend } from "resend";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
    }
    const toEmail = process.env.CONTACT_EMAIL || "hello@eluxdesign.com";

    const resend = new Resend(apiKey);

    const safeName = esc(String(name));
    const safeEmail = esc(String(email));
    const safeSubject = esc(String(subject || ""));
    const safeMessage = esc(String(message));

    const subjectLine = subject
      ? `[Elux Design] ${String(subject)} — from ${String(name)}`
      : `[Elux Design] New Inquiry from ${String(name)}`;

    const { error } = await resend.emails.send({
      from: "Elux Design Website <onboarding@resend.dev>",
      to: toEmail,
      replyTo: String(email),
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
