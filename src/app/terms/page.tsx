"use client";

import { useEffect, useState } from "react";

export default function TermsOfService() {
  const [content, setContent] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/legal/terms?_t=" + Date.now())
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data && typeof data === "object" && !("error" in data)) {
          setContent(data.content ?? "");
          setLastUpdated(data.lastUpdated ?? "");
        }
      })
      .catch(() => { /* keep empty on error */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
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
          {lastUpdated && (
            <p className="text-sm text-[#8A8478] mt-4">Last updated: {lastUpdated}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {loading ? (
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-[#8A8478]/10 rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
        ) : content ? (
          <div
            className="legal-content space-y-10 text-[#F5F0E8]/80 font-light leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="text-[#8A8478]">Content not available.</p>
        )}
      </div>

      <div className="h-24" />
    </div>
  );
}
