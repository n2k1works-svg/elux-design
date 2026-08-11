"use client";

import { useEffect } from "react";

export default function TermsOfService() {
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
            Terms of <span className="text-[#C9A84C]">Service</span>
          </h1>
          <p className="text-sm text-[#8A8478] mt-4">Last updated: August 11, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-10 text-[#F5F0E8]/80 font-light leading-relaxed">
          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Elux Design website (eluxfiji.com), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our website or services. These Terms apply to all visitors, users, clients, and others who access or use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">2. Services Description</h2>
            <p>
              Elux Design provides architectural design, building design, 3D visualization, project oversight, and property refurbishment services in Nadi, Fiji, and surrounding areas including Lautoka, Coral Coast, Suva, and all Fiji islands. Our website serves as an informational platform showcasing our portfolio, services, and contact details. The information provided on this website is for general informational purposes only and does not constitute a binding offer or contract for services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">3. Intellectual Property</h2>
            <p>
              All content on this website, including but not limited to text, graphics, logos, images, photographs, 3D renders, architectural drawings, design plans, icons, audio clips, digital downloads, and data compilations, is the property of Elux Design or its content suppliers and is protected by Fiji and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the website and its content for personal, non-commercial purposes only.
            </p>
            <p className="mt-3">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website without prior written consent from Elux Design, except as expressly permitted by these Terms. Architectural designs, 3D renders, and project images displayed on this website are the exclusive intellectual property of Elux Design and may not be copied, reproduced, or used for any purpose without explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">4. User Conduct</h2>
            <p>When using our website, you agree not to:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
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
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">5. Contact Form and Submissions</h2>
            <p>
              When you submit information through our contact form, you grant Elux Design a non-exclusive, worldwide, royalty-free license to use, reproduce, and process that information for the purpose of responding to your inquiry and providing our services. We will not sell your personal information to third parties. Any project specifications, design briefs, or other materials you submit through our website will be treated as confidential and used solely for the purpose of evaluating and potentially providing our services to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">6. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Elux Design shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the website or any content on the website. The information on this website is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">7. Accuracy of Information</h2>
            <p>
              While Elux Design strives to ensure that all information on this website is accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the website or the information, products, services, or related graphics contained on the website for any purpose. Project images, 3D renders, and descriptions on this website are representative examples of our work and may not exactly reflect the final outcome of any future project. Any reliance you place on such information is therefore strictly at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites or services that are not owned or controlled by Elux Design. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services. We strongly advise you to read the terms and conditions and privacy policies of any third-party websites or services that you visit. The inclusion of any link does not imply endorsement by Elux Design.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">9. Modifications to Terms</h2>
            <p>
              Elux Design reserves the right to update or modify these Terms at any time without prior notice. Any changes will be effective immediately upon posting to this website. Your continued use of the website after any such changes constitutes your acceptance of the new Terms. We encourage you to review these Terms periodically for any updates. The "Last updated" date at the top of this page indicates when these Terms were last revised.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of Fiji, without regard to its conflict of law provisions. Any disputes arising from or relating to these Terms or your use of the website shall be resolved exclusively in the courts of Fiji located in the Western Division. You agree to submit to the personal jurisdiction of such courts and waive any objection to venue therein.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-normal text-[#C9A84C] mb-4">11. Contact Information</h2>
            <p>
              If you have any questions or concerns about these Terms of Service, please contact us at:
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
