import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SITE_ID } from "@/lib/site";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["terms", "privacy"] as const;

/* ---------- Seed content (used once) ---------- */
const SEED_CONTENT: Record<string, string> = {
  terms: `<section>
  <h2>1. Acceptance of Terms</h2>
  <p>By accessing or using the Elux Design website (eluxfiji.com), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to these Terms, please do not use our website or services. These Terms apply to all visitors, users, clients, and others who access or use our website and services.</p>
</section>

<section>
  <h2>2. Services Description</h2>
  <p>Elux Design provides architectural design, building design, 3D visualization, project oversight, and property refurbishment services in Nadi, Fiji, and surrounding areas including Lautoka, Coral Coast, Suva, and all Fiji islands. Our website serves as an informational platform showcasing our portfolio, services, and contact details. The information provided on this website is for general informational purposes only and does not constitute a binding offer or contract for services.</p>
</section>

<section>
  <h2>3. Intellectual Property</h2>
  <p>All content on this website, including but not limited to text, graphics, logos, images, photographs, 3D renders, architectural drawings, design plans, icons, audio clips, digital downloads, and data compilations, is the property of Elux Design or its content suppliers and is protected by Fiji and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the website and its content for personal, non-commercial purposes only.</p>
  <p>You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website without prior written consent from Elux Design, except as expressly permitted by these Terms. Architectural designs, 3D renders, and project images displayed on this website are the exclusive intellectual property of Elux Design and may not be copied, reproduced, or used for any purpose without explicit written permission.</p>
</section>

<section>
  <h2>4. User Conduct</h2>
  <p>When using our website, you agree not to:</p>
  <ul>
    <li>Use the website for any unlawful purpose or in violation of any applicable laws or regulations</li>
    <li>Submit false, misleading, or defamatory content through our contact forms or any other communication channels</li>
    <li>Attempt to gain unauthorized access to any portion of the website, including the admin dashboard, or any systems or networks connected to the website</li>
    <li>Interfere with or disrupt the website or servers or networks connected to the website</li>
    <li>Use any automated means, including bots, scrapers, or spiders, to access or collect data from the website</li>
    <li>Use the website to transmit any viruses, malware, or other harmful code</li>
    <li>Impersonate any person or entity or falsely represent your affiliation with any person or entity</li>
  </ul>
</section>

<section>
  <h2>5. Contact Form and Submissions</h2>
  <p>When you submit information through our contact form, you grant Elux Design a non-exclusive, worldwide, royalty-free license to use, reproduce, and process that information for the purpose of responding to your inquiry and providing our services. We will not sell your personal information to third parties. Any project specifications, design briefs, or other materials you submit through our website will be treated as confidential and used solely for the purpose of evaluating and potentially providing our services to you.</p>
</section>

<section>
  <h2>6. Limitation of Liability</h2>
  <p>To the fullest extent permitted by applicable law, Elux Design shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the website or any content on the website. The information on this website is provided \"as is\" and \"as available\" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
</section>

<section>
  <h2>7. Accuracy of Information</h2>
  <p>While Elux Design strives to ensure that all information on this website is accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the website or the information, products, services, or related graphics contained on the website for any purpose. Project images, 3D renders, and descriptions on this website are representative examples of our work and may not exactly reflect the final outcome of any future project. Any reliance you place on such information is therefore strictly at your own risk.</p>
</section>

<section>
  <h2>8. Third-Party Links</h2>
  <p>Our website may contain links to third-party websites or services that are not owned or controlled by Elux Design. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services. We strongly advise you to read the terms and conditions and privacy policies of any third-party websites or services that you visit. The inclusion of any link does not imply endorsement by Elux Design.</p>
</section>

<section>
  <h2>9. Modifications to Terms</h2>
  <p>Elux Design reserves the right to update or modify these Terms at any time without prior notice. Any changes will be effective immediately upon posting to this website. Your continued use of the website after any such changes constitutes your acceptance of the new Terms. We encourage you to review these Terms periodically for any updates. The \"Last updated\" date at the top of this page indicates when these Terms were last revised.</p>
</section>

<section>
  <h2>10. Governing Law</h2>
  <p>These Terms shall be governed by and construed in accordance with the laws of the Republic of Fiji, without regard to its conflict of law provisions. Any disputes arising from or relating to these Terms or your use of the website shall be resolved exclusively in the courts of Fiji located in the Western Division. You agree to submit to the personal jurisdiction of such courts and waive any objection to venue therein.</p>
</section>

<section>
  <h2>11. Contact Information</h2>
  <p>If you have any questions or concerns about these Terms of Service, please contact us at:</p>
  <div class=\"contact-box\">
    <p><strong>Elux Design</strong></p>
    <p>Nadi, Fiji</p>
    <p>Email: hello@eluxdesign.com</p>
  </div>
</section>`,

  privacy: `<section>
  <h2>1. Introduction</h2>
  <p>Elux Design (\"we\", \"us\", or \"our\") is committed to protecting the privacy of our website visitors and clients. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at eluxfiji.com. Please read this Privacy Policy carefully. By accessing or using our website, you acknowledge that you have read, understood, and agree to be bound by the terms of this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access the website.</p>
</section>

<section>
  <h2>2. Information We Collect</h2>
  <p><strong>Information You Provide:</strong></p>
  <p>We may collect information that you voluntarily provide to us when you use our website, including but not limited to your name, email address, phone number, and any messages or project details you submit through our contact form. This information is provided at your discretion and is used solely for the purpose of responding to your inquiries and providing our architectural and design services.</p>
  <p><strong>Information Collected Automatically:</strong></p>
  <p>When you visit our website, we may automatically collect certain information about your device and browsing activity. This includes your IP address, browser type and version, operating system, referring URLs, pages viewed, links clicked, the date and time of your visit, and the time spent on individual pages. We collect this information through cookies and similar tracking technologies as described in Section 5 below.</p>
</section>

<section>
  <h2>3. How We Use Your Information</h2>
  <p>We use the information we collect for the following purposes:</p>
  <ul>
    <li>To respond to your inquiries and contact form submissions</li>
    <li>To provide, operate, and maintain our website and services</li>
    <li>To improve our website, services, and user experience</li>
    <li>To analyze website usage and trends to understand how visitors interact with our website</li>
    <li>To detect, prevent, and address technical issues or security threats</li>
    <li>To communicate with you about our services, projects, or updates if you have provided your contact information</li>
    <li>To comply with applicable legal requirements and regulations</li>
  </ul>
</section>

<section>
  <h2>4. Information Sharing and Disclosure</h2>
  <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
  <ul>
    <li><strong>Service Providers:</strong> We may share your information with trusted third-party service providers who assist us in operating our website, conducting our business, or serving you, so long as those parties agree to keep this information confidential</li>
    <li><strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities</li>
    <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction</li>
    <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your explicit consent</li>
  </ul>
</section>

<section>
  <h2>5. Cookies and Tracking Technologies</h2>
  <p>We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some features of our website. We use the following types of cookies:</p>
  <ul>
    <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security cookies for our admin dashboard</li>
    <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website by collecting and reporting information anonymously</li>
  </ul>
</section>

<section>
  <h2>6. Data Security</h2>
  <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include secure server hosting, encrypted data transmission (SSL/TLS), and restricted access to personal data. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security. We encourage you to be aware of this when providing information online.</p>
</section>

<section>
  <h2>7. Data Retention</h2>
  <p>We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. Contact form submissions and project inquiries are retained for a period of up to 24 months after the last communication, after which they are securely deleted unless we are required by law to retain them for a longer period. Website analytics data is retained for up to 26 months in accordance with standard analytics practices.</p>
</section>

<section>
  <h2>8. Your Rights</h2>
  <p>Depending on your location and applicable law, you may have the following rights regarding your personal information:</p>
  <ul>
    <li>The right to access and receive a copy of your personal information we hold</li>
    <li>The right to request correction of any inaccurate or incomplete personal information</li>
    <li>The right to request deletion of your personal information, subject to certain exceptions</li>
    <li>The right to object to or restrict the processing of your personal information</li>
    <li>The right to data portability, where technically feasible</li>
    <li>The right to withdraw consent at any time where we rely on consent to process your data</li>
  </ul>
  <p>To exercise any of these rights, please contact us using the details provided in Section 10 below. We will respond to your request within 30 days.</p>
</section>

<section>
  <h2>9. Children's Privacy</h2>
  <p>Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately, and we will take steps to delete such information from our systems.</p>
</section>

<section>
  <h2>10. Contact Information</h2>
  <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:</p>
  <div class=\"contact-box\">
    <p><strong>Elux Design</strong></p>
    <p>Nadi, Fiji</p>
    <p>Email: hello@eluxdesign.com</p>
  </div>
</section>`,
};

/* ---------- GET /api/legal/[type] ---------- */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
      return NextResponse.json({ error: "Invalid type. Use 'terms' or 'privacy'." }, { status: 400 });
    }

    let row = await db.legalContent.findUnique({ where: { type } });

    // Auto-seed if empty
    if (!row || !row.content) {
      const seedHtml = SEED_CONTENT[type] ?? "";
      const today = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      });
      row = await db.legalContent.upsert({
        where: { type },
        update: { content: seedHtml, lastUpdated: today, site: SITE_ID },
        create: { type, site: SITE_ID, content: seedHtml, lastUpdated: today },
      });
    }

    return NextResponse.json({
      type: row.type,
      content: row.content,
      lastUpdated: row.lastUpdated,
    });
  } catch (err) {
    console.error(`[/api/legal] GET failed:`, err);
    return NextResponse.json({ error: "Failed to load content." }, { status: 500 });
  }
}

/* ---------- PUT /api/legal/[type] ---------- */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { type } = await params;
    if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
      return NextResponse.json({ error: "Invalid type. Use 'terms' or 'privacy'." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const content = String(body.content ?? "");
    if (!content.trim()) {
      return NextResponse.json({ error: "Content cannot be empty." }, { status: 400 });
    }

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    const row = await db.legalContent.upsert({
      where: { type },
      update: { content, lastUpdated: today, site: SITE_ID },
      create: { type, site: SITE_ID, content, lastUpdated: today },
    });

    return NextResponse.json({ type: row.type, lastUpdated: row.lastUpdated });
  } catch (err) {
    console.error(`[/api/legal] PUT failed:`, err);
    return NextResponse.json({ error: "Failed to save content." }, { status: 500 });
  }
}
