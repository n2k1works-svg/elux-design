"use client";

import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8]">
      {/* Header */}
      <div className="border-b border-[rgba(201,168,76,0.1)]">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-[#8A8478] hover:text-[#C9A84C] transition-colors duration-300 mb-8"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </a>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight">
            Privacy <span className="text-[#C9A84C]">Policy</span>
          </h1>
          <p className="text-sm text-[#8A8478] mt-4">Last updated: August 11, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-10 text-[#F5F0E8]/80 font-light leading-relaxed">
          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">1. Introduction</h2>
            <p>
              Elux Design ("we", "us", or "our") is committed to protecting the privacy of our website visitors and clients. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at eluxfiji.com. Please read this Privacy Policy carefully. By accessing or using our website, you acknowledge that you have read, understood, and agree to be bound by the terms of this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access the website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">2. Information We Collect</h2>
            <p className="mb-3"><strong className="text-[#F5F0E8] font-normal">Information You Provide:</strong></p>
            <p>
              We may collect information that you voluntarily provide to us when you use our website, including but not limited to your name, email address, phone number, and any messages or project details you submit through our contact form. This information is provided at your discretion and is used solely for the purpose of responding to your inquiries and providing our architectural and design services.
            </p>
            <p className="mt-4 mb-3"><strong className="text-[#F5F0E8] font-normal">Information Collected Automatically:</strong></p>
            <p>
              When you visit our website, we may automatically collect certain information about your device and browsing activity. This includes your IP address, browser type and version, operating system, referring URLs, pages viewed, links clicked, the date and time of your visit, and the time spent on individual pages. We collect this information through cookies and similar tracking technologies as described in Section 5 below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
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
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">4. Information Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li><strong className="text-[#F5F0E8] font-normal">Service Providers:</strong> We may share your information with trusted third-party service providers who assist us in operating our website, conducting our business, or serving you, so long as those parties agree to keep this information confidential</li>
              <li><strong className="text-[#F5F0E8] font-normal">Legal Requirements:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities</li>
              <li><strong className="text-[#F5F0E8] font-normal">Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction</li>
              <li><strong className="text-[#F5F0E8] font-normal">With Your Consent:</strong> We may disclose your personal information for any other purpose with your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">5. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some features of our website. We use the following types of cookies:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li><strong className="text-[#F5F0E8] font-normal">Essential Cookies:</strong> Required for the website to function properly, including authentication and security cookies for our admin dashboard</li>
              <li><strong className="text-[#F5F0E8] font-normal">Analytics Cookies:</strong> Help us understand how visitors interact with our website by collecting and reporting information anonymously</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include secure server hosting, encrypted data transmission (SSL/TLS), and restricted access to personal data. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security. We encourage you to be aware of this when providing information online.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">7. Data Retention</h2>
            <p>
              We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. Contact form submissions and project inquiries are retained for a period of up to 24 months after the last communication, after which they are securely deleted unless we are required by law to retain them for a longer period. Website analytics data is retained for up to 26 months in accordance with standard analytics practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">8. Your Rights</h2>
            <p>
              Depending on your location and applicable law, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li>The right to access and receive a copy of your personal information we hold</li>
              <li>The right to request correction of any inaccurate or incomplete personal information</li>
              <li>The right to request deletion of your personal information, subject to certain exceptions</li>
              <li>The right to object to or restrict the processing of your personal information</li>
              <li>The right to data portability, where technically feasible</li>
              <li>The right to withdraw consent at any time where we rely on consent to process your data</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us using the details provided in Section 10 below. We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">9. Children's Privacy</h2>
            <p>
              Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately, and we will take steps to delete such information from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">10. Contact Information</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 p-6 rounded-lg bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.1)]">
              <p className="text-[#C9A84C] font-normal">Elux Design</p>
              <p className="mt-1">Nadi, Fiji</p>
              <p>Email: hello@eluxdesign.com</p>
            </div>
          </section>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-24" />
    </div>
  );
}
