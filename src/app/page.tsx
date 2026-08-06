"use client";

import { useState, useEffect, useRef, useCallback, type FormEvent, type DragEvent } from "react";
import Image from "next/image";

/* ========================================================================
   TYPES
   ======================================================================== */

type ProjectT = {
  id: string;
  title: string;
  location: string;
  category: string;
  description: string;
  image: string;
  order: number;
  active: boolean;
};

type TestimonialT = {
  id: string;
  quote: string;
  name: string;
  role: string;
  active: boolean;
  order: number;
};

type ServiceT = {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  order: number;
  active: boolean;
};

type AboutContentT = {
  id: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  statYears: number;
  statProjects: number;
  statSpecializations: number;
  statSatisfaction: number;
  statYearsLabel: string;
  statProjectsLabel: string;
  statSpecLabel: string;
  statSatLabel: string;
};

type SettingsT = {
  phone: string;
  email: string;
  location: string;
  facebook: string;
  instagram: string;
  linkedin: string;
};

/* ========================================================================
   DATA
   ======================================================================== */

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Projects", href: "#projects" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
] as const;

const SERVICES = [
  {
    title: "Building Design",
    description:
      "We craft custom residential homes, waterfront properties, and high-end property refurbishments that blend luxury living with environmental responsibility. Each design is a unique response to its site, climate, and the vision of its owner, ensuring spaces that feel both timeless and unmistakably modern.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    title: "3D Visualization",
    description:
      "Our cutting-edge 3D rendering and visual walkthroughs transform architectural concepts into photorealistic experiences. Clients can explore every corner of their future home before a single foundation is poured, making design decisions with confidence and clarity that traditional blueprints simply cannot provide.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    title: "Project Oversight",
    description:
      "From initial concept through to final handover, we manage and document every phase of your project. Our comprehensive oversight ensures quality control, timeline adherence, and seamless communication between all stakeholders, delivering results that match the original design vision with precision.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Consultation",
    description:
      "We begin every project with an in-depth conversation to understand your vision, lifestyle, site conditions, and budget. This foundational step ensures every subsequent design decision is grounded in your unique requirements and aspirations for the space.",
  },
  {
    step: "02",
    title: "Concept Design",
    description:
      "Our architects develop initial design concepts that respond to the site, climate, and your brief. We explore spatial layouts, material palettes, and architectural language through sketches and preliminary drawings, refining the direction collaboratively with you.",
  },
  {
    step: "03",
    title: "3D Visualization",
    description:
      "Approved concepts are brought to life through photorealistic 3D renders and immersive virtual walkthroughs. You experience the space in vivid detail before construction begins, enabling informed decisions on finishes, lighting, and spatial arrangements.",
  },
  {
    step: "04",
    title: "Build & Deliver",
    description:
      "We manage the entire construction phase with rigorous oversight, regular site visits, and detailed documentation. From contractor coordination to final quality inspections, we ensure the built result faithfully realizes the design vision.",
  },
];

const VALUE_PROPS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
    title: "Tropical Expertise",
    description: "Deep understanding of Fiji's climate, materials, and building practices ensures designs that are beautiful, durable, and perfectly adapted to Pacific island living.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Sustainable Design",
    description: "Every project integrates passive cooling, natural ventilation, and locally sourced materials to minimize environmental impact while maximizing comfort and longevity.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
    title: "Photorealistic Previews",
    description: "Our advanced 3D visualization lets you walk through your future home before construction begins, eliminating surprises and ensuring every detail meets your expectations.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l6-6m4.5 9.75l-6 6m6-6H5.25" />
      </svg>
    ),
    title: "End-to-End Delivery",
    description: "From the first sketch to the final handover, we manage every detail. Our integrated approach ensures design intent is preserved at every stage of the build process.",
  },
];

const FALLBACK_TESTIMONIALS: TestimonialT[] = [
  {
    id: "fb-t-1",
    quote: "Elux Design transformed our vision of a waterfront dream home into a reality that exceeded every expectation. The 3D walkthrough alone saved us from costly design changes before construction even began. Their understanding of Fiji's climate and materials is unmatched in the region.",
    name: "James & Sarah Mitchell",
    role: "Homeowners, Fantasy Island Villa",
    active: true,
    order: 0,
  },
  {
    id: "fb-t-2",
    quote: "Working with Elux Design was a seamless experience from concept to completion. Their project oversight meant we never had to worry about coordination between contractors and designers. The final result is a home that feels both luxurious and deeply connected to its surroundings.",
    name: "Rajesh Kumar",
    role: "Property Developer, Lautoka",
    active: true,
    order: 1,
  },
  {
    id: "fb-t-3",
    quote: "The refurbishment of our Coral Coast property was handled with remarkable sensitivity to its original character while bringing it firmly into the 21st century. The sustainable design elements have reduced our energy costs significantly. We could not be happier with the outcome.",
    name: "Dr. Emily Chen",
    role: "Homeowner, Coral Coast Estate",
    active: true,
    order: 2,
  },
];

const FALLBACK_PROJECTS: ProjectT[] = [
  {
    id: "fb-p-1",
    title: "Fantasy Island Villa",
    location: "Fantasy Island, Fiji",
    category: "Luxury Waterfront Residence",
    description:
      "A breathtaking waterfront villa that seamlessly merges indoor and outdoor living. Featuring panoramic ocean views, sustainable timber construction, and an infinity pool that dissolves into the horizon. This project exemplifies Elux Design's commitment to luxury that respects its natural surroundings.",
    image: "/project-1.png",
    order: 0,
    active: true,
  },
  {
    id: "fb-p-2",
    title: "Lautoka Modern Retreat",
    location: "Lautoka, Fiji",
    category: "Modern Residential",
    description:
      "A contemporary family residence in Lautoka that redefines tropical modernism. Clean geometric lines, expansive glass facades, and natural ventilation systems create a home that is both architecturally striking and deeply comfortable in Fiji's warm climate.",
    image: "/project-2.png",
    order: 1,
    active: true,
  },
  {
    id: "fb-p-3",
    title: "Coral Coast Estate",
    location: "Coral Coast, Fiji",
    category: "High-End Property Refurbishment",
    description:
      "A complete transformation of an existing coastal property into a world-class estate. The refurbishment preserved the structure's heritage character while introducing modern amenities, energy-efficient systems, and a redesigned landscape that frames stunning lagoon views.",
    image: "/project-3.png",
    order: 2,
    active: true,
  },
];

const FALLBACK_SETTINGS: SettingsT = {
  phone: "+679 000 0000",
  email: "hello@eluxdesign.com",
  location: "Nadi, Fiji",
  facebook: "https://facebook.com/EluxDesign",
  instagram: "https://instagram.com/EluxDesign",
  linkedin: "",
};

/* ========================================================================
   HOOKS
   ======================================================================== */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCountUp(end: number, duration = 2000, trigger = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration, trigger]);
  return count;
}

/* ========================================================================
   COMPONENTS
   ======================================================================== */

/* ---------- Page Loader ---------- */
function PageLoader() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`page-loader ${loaded ? "loaded" : ""}`}>
      <div className="loader-logo">
        <img src="/elux-final.png" alt="Elux Design" className="h-16 w-auto object-contain" />
      </div>
      <div className="loader-bar">
        <div className="loader-bar-fill" />
      </div>
      <p className="mt-4 text-[0.65rem] tracking-[0.4em] uppercase text-[#8A8478]">Loading Experience</p>
    </div>
  );
}

/* ---------- Scroll Progress ---------- */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handle = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

/* ---------- Navbar ---------- */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => l.href.replace("#", ""));
    const handle = () => {
      const scrollY = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(sections[i]);
          return;
        }
      }
      setActiveSection(sections[0]);
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "navbar-glass py-3" : "py-5"}`}>
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#home" className="flex items-center group">
          <span className="text-xl font-semibold tracking-[0.15em] uppercase gold-shimmer">Elux Design</span>
        </a>
        <ul className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={`nav-link ${activeSection === link.href.replace("#", "") ? "active" : ""}`}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation menu">
          <span className={`block w-6 h-px bg-[#C9A84C] transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
          <span className={`block w-6 h-px bg-[#C9A84C] transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-px bg-[#C9A84C] transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
        </button>
      </nav>
      {mobileOpen && (
        <div className="lg:hidden navbar-glass mobile-menu-enter mt-2 mx-4 rounded-2xl overflow-hidden">
          <ul className="flex flex-col py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`block px-8 py-3 text-sm tracking-[0.1em] uppercase transition-colors duration-300 ${
                    activeSection === link.href.replace("#", "")
                      ? "text-[#C9A84C] bg-[rgba(201,168,76,0.06)]"
                      : "text-[#F5F0E8]/60 hover:text-[#C9A84C] hover:bg-[rgba(201,168,76,0.04)]"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

/* ---------- Hero with Parallax ---------- */
function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handle = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.querySelectorAll(".parallax-orb").forEach((orb, i) => {
        const factor = (i + 1) * 15;
        (orb as HTMLElement).style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    };
    el.addEventListener("mousemove", handle);
    return () => el.removeEventListener("mousemove", handle);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center hero-gradient overflow-hidden" ref={heroRef}>
      <div className="orb orb-slow parallax-orb w-[500px] h-[500px] bg-[#C9A84C] top-[-10%] left-[-10%] opacity-20" />
      <div className="orb orb-medium parallax-orb w-[400px] h-[400px] bg-[#D4AF37] bottom-[10%] right-[-5%] opacity-15" />
      <div className="orb orb-fast parallax-orb w-[300px] h-[300px] bg-[#A07C1C] top-[40%] left-[60%] opacity-10" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-24 pb-16">
        <div className="flex flex-col items-center text-center">
            <div className="animate-fade-in-up mb-10 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-52 h-52 md:w-64 md:h-64 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_70%)]" />
              </div>
              <img src="/elux-final.png" alt="Elux Design" className="relative z-10 h-40 md:h-52 w-auto object-contain drop-shadow-[0_0_80px_rgba(201,168,76,0.12)]" />
            </div>
            <div className="animate-fade-in-up animate-delay-100 mb-8">
              <p className="text-[#C9A84C] tracking-[0.4em] uppercase text-xs md:text-sm font-light">
                Nadi, Fiji &middot; Est. 2009
              </p>
            </div>
            <h1 className="animate-fade-in-up animate-delay-100 font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-light leading-[0.95] mb-8">
              <span className="gold-shimmer">Designing</span>
              <br />
              <span className="text-[#F5F0E8]">Tomorrow&apos;s Spaces</span>
            </h1>
            <p className="animate-fade-in-up animate-delay-200 text-[#8A8478] text-base md:text-lg max-w-xl mb-10 font-light leading-relaxed">
              Where sustainable architecture meets luxury living. Over 15 years of
              crafting innovative, modern spaces that honour Fiji&apos;s natural beauty
              through thoughtful design and cutting-edge visualization.
            </p>
            <div className="animate-fade-in-up animate-delay-300 flex flex-col sm:flex-row items-center gap-4">
              <a href="#projects" className="btn-gold px-10 py-4 rounded-full text-sm tracking-[0.15em]">
                View Our Work
              </a>
              <a href="#contact" className="px-10 py-4 rounded-full text-sm tracking-[0.15em] uppercase border border-[rgba(201,168,76,0.3)] text-[#C9A84C] hover:bg-[rgba(201,168,76,0.08)] transition-all duration-300">
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in-up animate-delay-500">
        <div className="w-px h-12 bg-gradient-to-b from-[#C9A84C]/50 to-transparent" />
      </div>
    </section>
  );
}

/* ---------- About ---------- */
function AboutSection() {
  const { ref, inView } = useInView();
  const count1 = useCountUp(15, 1800, inView);
  const count2 = useCountUp(50, 2000, inView);
  const count3 = useCountUp(3, 1200, inView);
  const count4 = useCountUp(100, 2200, inView);
  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden">
      <div className="orb orb-slow w-[350px] h-[350px] bg-[#C9A84C] top-[20%] right-[-8%] opacity-10" />
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-[#C9A84C] tracking-[0.3em] uppercase text-xs mb-4">Who We Are</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-6">
            Crafting <span className="gold-shimmer">Excellence</span> in
            <br className="hidden md:block" /> Pacific Architecture
          </h2>
          <div className="section-divider w-24 mb-12" />
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className={`transition-all duration-700 delay-200 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-[#F5F0E8]/80 leading-relaxed mb-6 font-light">
              Elux Design is a premier building design and 3D visualization firm based in Nadi, Fiji. For over 15 years, we have been at the forefront of architectural innovation in the South Pacific, delivering projects that range from luxury waterfront residences to large-scale commercial developments across the region.
            </p>
            <p className="text-[#F5F0E8]/80 leading-relaxed mb-6 font-light">
              Our philosophy is rooted in the belief that great architecture should work in harmony with its environment. Fiji&apos;s tropical climate, stunning landscapes, and rich cultural heritage serve as both our inspiration and our guide. Every project we undertake is a unique response to its site, its climate, and the vision of its owner.
            </p>
            <p className="text-[#F5F0E8]/60 leading-relaxed font-light">
              From the concept sketches to the final walkthrough, our integrated approach ensures that design intent is preserved at every stage, resulting in spaces that are not only beautiful but enduringly functional and deeply connected to their Pacific island context.
            </p>
          </div>
          <div className={`transition-all duration-700 delay-300 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="liquid-glass-strong rounded-2xl p-8 space-y-8">
              <StatItem number={`${count1}+`} label="Years of Experience" />
              <div className="section-divider" />
              <StatItem number={`${count2}+`} label="Projects Completed" />
              <div className="section-divider" />
              <StatItem number={`${count3}`} label="Core Specializations" />
              <div className="section-divider" />
              <StatItem number={`${count4}%`} label="Client Satisfaction" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-6">
      <span className="font-display text-4xl md:text-5xl font-light gold-shimmer whitespace-nowrap">{number}</span>
      <span className="text-[#8A8478] text-sm tracking-[0.08em] uppercase font-light">{label}</span>
    </div>
  );
}

/* ---------- Services ---------- */
function ServicesSection() {
  const { ref, inView } = useInView();
  return (
    <section id="services" className="relative py-24 md:py-32 overflow-hidden">
      <div className="orb orb-medium w-[400px] h-[400px] bg-[#D4AF37] bottom-[5%] left-[-10%] opacity-10" />
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-[#C9A84C] tracking-[0.3em] uppercase text-xs mb-4">What We Do</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-6">
            Our <span className="gold-shimmer">Services</span>
          </h2>
          <div className="section-divider w-24 mx-auto" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => (
            <div key={service.title} className={`service-card liquid-glass rounded-2xl p-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${(i + 1) * 150}ms` }}>
              <div className="text-[#C9A84C] mb-6">{service.icon}</div>
              <h3 className="font-display text-2xl font-light mb-4 text-[#F5F0E8]">{service.title}</h3>
              <p className="text-[#8A8478] leading-relaxed font-light text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Process ---------- */
function ProcessSection() {
  const { ref, inView } = useInView(0.1);
  return (
    <section id="process" className="relative py-24 md:py-32 overflow-hidden">
      <div className="orb orb-fast w-[300px] h-[300px] bg-[#C9A84C] top-[30%] right-[10%] opacity-8" />
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-[#C9A84C] tracking-[0.3em] uppercase text-xs mb-4">How We Work</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-6">
            Our <span className="gold-shimmer">Process</span>
          </h2>
          <p className="text-[#8A8478] max-w-2xl mx-auto font-light">
            A proven four-phase approach that transforms your vision from initial concept into a beautifully realized space, with clarity and confidence at every step.
          </p>
          <div className="section-divider w-24 mx-auto mt-6" />
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {PROCESS_STEPS.map((step, i) => (
            <div key={step.step} className={`process-step transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${(i + 1) * 200}ms` }}>
              <div className="liquid-glass rounded-2xl p-6 text-center h-full flex flex-col">
                <div className="w-14 h-14 rounded-full border border-[rgba(201,168,76,0.3)] flex items-center justify-center mx-auto mb-5 bg-[rgba(201,168,76,0.06)]">
                  <span className="font-display text-xl gold-shimmer">{step.step}</span>
                </div>
                <h3 className="font-display text-xl font-light text-[#F5F0E8] mb-3">{step.title}</h3>
                <p className="text-[#8A8478] leading-relaxed font-light text-sm flex-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Why Elux ---------- */
function WhyEluxSection() {
  const { ref, inView } = useInView(0.1);
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="orb orb-slow w-[400px] h-[400px] bg-[#D4AF37] bottom-[0%] left-[50%] opacity-8" />
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-[#C9A84C] tracking-[0.3em] uppercase text-xs mb-4">Why Choose Us</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-6">
            The Elux <span className="gold-shimmer">Advantage</span>
          </h2>
          <div className="section-divider w-24 mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUE_PROPS.map((prop, i) => (
            <div key={prop.title} className={`value-card liquid-glass rounded-2xl p-6 text-center transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${(i + 1) * 120}ms` }}>
              <div className="value-icon w-14 h-14 rounded-xl liquid-glass-subtle flex items-center justify-center mx-auto mb-5 text-[#C9A84C]">{prop.icon}</div>
              <h3 className="font-display text-lg font-light text-[#F5F0E8] mb-3">{prop.title}</h3>
              <p className="text-[#8A8478] leading-relaxed font-light text-xs">{prop.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Projects ---------- */
function ProjectsSection() {
  const { ref, inView } = useInView(0.05);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectT[]>(FALLBACK_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PER_PAGE_DESKTOP = 3;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data: ProjectT[]) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch(() => { /* keep fallback */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const totalPages = Math.max(1, Math.ceil(projects.length / PER_PAGE_DESKTOP));
  const goToPage = (p: number) => {
    if (p < 0) p = totalPages - 1;
    if (p >= totalPages) p = 0;
    setPage(p);
    setSelectedProject(null);
  };
  // All projects rendered in a single flex row — carousel handles visibility

  return (
    <>
      <section id="projects" className="relative py-24 md:py-32 overflow-hidden">
        <div className="orb orb-slow w-[450px] h-[450px] bg-[#C9A84C] top-[10%] right-[-12%] opacity-10" />
        <div className="max-w-7xl mx-auto px-6" ref={ref}>
          <div className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-[#C9A84C] tracking-[0.3em] uppercase text-xs mb-4">Portfolio</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-6">
              Featured <span className="gold-shimmer">Projects</span>
            </h2>
            <p className="text-[#8A8478] max-w-2xl mx-auto font-light">
              A curated selection of our most impactful work across Fiji&apos;s most sought-after locations. Click any image to view full-size.
            </p>
            <div className="section-divider w-24 mx-auto mt-6" />
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="md:hidden flex gap-5 overflow-x-auto projects-scroll-mobile pb-4 snap-x snap-mandatory -mx-6 px-6">
            {loading && projects.length === 0 ? (
              <div className="min-w-[280px] h-[420px] rounded-2xl liquid-glass animate-pulse" />
            ) : null}
            {projects.map((project, i) => (
              <div
                key={project.id}
                className={`project-card liquid-glass rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 min-w-[280px] snap-center flex-shrink-0 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${loading ? "animate-pulse" : ""}`}
                style={{ transitionDelay: `${(i + 1) * 150}ms` }}
                onClick={() => setSelectedProject(selectedProject === i ? null : i)}
              >
                <ProjectCardContent project={project} index={i} selected={selectedProject === i} onSelect={setSelectedProject} onImageClick={setLightboxImage} />
              </div>
            ))}
          </div>

          {/* Desktop: sliding carousel — 3 cards per page */}
          <div className="hidden md:block">
            <div className="overflow-hidden">
              <div
                className="flex gap-6 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${page * 100}%)` }}
              >
                {loading && projects.length === 0 ? (
                  <>
                    <div className="h-[420px] rounded-2xl liquid-glass animate-pulse flex-shrink-0" style={{ width: 'calc(33.333% - 1rem)' }} />
                    <div className="h-[420px] rounded-2xl liquid-glass animate-pulse flex-shrink-0" style={{ width: 'calc(33.333% - 1rem)' }} />
                    <div className="h-[420px] rounded-2xl liquid-glass animate-pulse flex-shrink-0" style={{ width: 'calc(33.333% - 1rem)' }} />
                  </>
                ) : null}
                {projects.map((project, i) => (
                  <div
                    key={project.id}
                    className={`project-card liquid-glass rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 flex-shrink-0 ${loading ? "animate-pulse" : ""}`}
                    style={{ width: 'calc(33.333% - 1rem)' }}
                    onClick={() => setSelectedProject(selectedProject === i ? null : i)}
                  >
                    <ProjectCardContent project={project} index={i} selected={selectedProject === i} onSelect={setSelectedProject} onImageClick={setLightboxImage} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation: arrows + page counter */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-5 mt-10">
                <button
                  onClick={() => goToPage(page - 1)}
                  className="w-10 h-10 rounded-full border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C]/70 hover:text-[#C9A84C] hover:border-[#C9A84C]/60 hover:bg-[#C9A84C]/10 transition-all duration-300 cursor-pointer"
                  aria-label="Previous projects"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${i === page ? "bg-[#C9A84C] w-6" : "bg-[#C9A84C]/30 hover:bg-[#C9A84C]/50"}`}
                      aria-label={`Go to page ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => goToPage(page + 1)}
                  className="w-10 h-10 rounded-full border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C]/70 hover:text-[#C9A84C] hover:border-[#C9A84C]/60 hover:bg-[#C9A84C]/10 transition-all duration-300 cursor-pointer"
                  aria-label="Next projects"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 lightbox-overlay"
          style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)" }}
          onClick={() => setLightboxImage(null)}
        >
          <button className="absolute top-6 right-6 w-10 h-10 rounded-full liquid-glass-subtle flex items-center justify-center text-[#C9A84C] hover:bg-[rgba(201,168,76,0.15)] transition-all z-10" onClick={() => setLightboxImage(null)} aria-label="Close image viewer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="lightbox-content max-w-5xl w-full max-h-[85vh] rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {lightboxImage.startsWith('data:') ? (
              <img src={lightboxImage} alt="Project full view" className="w-full h-auto object-contain" />
            ) : (
              <Image src={lightboxImage} alt="Project full view" width={1200} height={800} className="w-full h-auto object-contain" />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ProjectCardContent({ project, index, selected, onSelect, onImageClick }: {
  project: ProjectT;
  index: number;
  selected: boolean;
  onSelect: (i: number | null) => void;
  onImageClick: (src: string) => void;
}) {
  return (
    <>
      <div
        className="relative h-56 overflow-hidden cursor-zoom-in"
        onClick={(e) => { e.stopPropagation(); onImageClick(project.image); }}
      >
        {project.image.startsWith('data:') ? (
          <img src={project.image} alt={project.title} className="card-image object-cover absolute inset-0 w-full h-full" />
        ) : (
          <Image src={project.image} alt={project.title} fill className="card-image object-cover" sizes="(max-width: 768px) 80vw, 33vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="text-[0.65rem] tracking-[0.15em] uppercase px-3 py-1 rounded-full border border-[rgba(201,168,76,0.3)] text-[#C9A84C] bg-[rgba(10,10,10,0.6)] backdrop-blur-sm">
            {project.category}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-light text-[#F5F0E8] mb-1">{project.title}</h3>
        <p className="text-[#C9A84C] text-xs tracking-[0.1em] uppercase mb-3">{project.location}</p>
        {selected && (
          <p className="text-[#8A8478] text-sm font-light leading-relaxed mt-3 pt-3 border-t border-[rgba(201,168,76,0.1)]">{project.description}</p>
        )}
        <p className="text-[#8A8478] text-xs mt-3 font-light">
          {selected ? "Click to collapse" : "Click to view details"}
        </p>
      </div>
    </>
  );
}

/* ---------- Testimonials ---------- */
function TestimonialsSection() {
  const { ref, inView } = useInView(0.15);
  const [active, setActive] = useState(0);
  const [testimonials, setTestimonials] = useState<TestimonialT[]>(FALLBACK_TESTIMONIALS);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((data: TestimonialT[]) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
          setActive(0);
        }
      })
      .catch(() => { /* keep fallback */ });
    return () => { cancelled = true; };
  }, []);

  const goTo = (i: number) => {
    setActive(i);
  };

  if (testimonials.length === 0) {
    return (
      <section id="testimonials" className="relative py-24 md:py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center text-[#8A8478] font-light">
          No testimonials available.
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="relative py-24 md:py-32 overflow-hidden">
      <div className="orb orb-medium w-[380px] h-[380px] bg-[#C9A84C] top-[15%] left-[-8%] opacity-8" />
      <div className="max-w-5xl mx-auto px-6" ref={ref}>
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-[#C9A84C] tracking-[0.3em] uppercase text-xs mb-4">Client Voices</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-6">
            What They <span className="gold-shimmer">Say</span>
          </h2>
          <div className="section-divider w-24 mx-auto" />
        </div>

        <div className={`transition-all duration-700 delay-200 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="liquid-glass-strong rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="quote-mark">&ldquo;</div>
            <div className="overflow-hidden">
              <div className="testimonial-track" style={{ transform: `translateX(-${active * 100}%)` }}>
                {testimonials.map((t, i) => (
                  <div key={t.id || i} className="w-full flex-shrink-0">
                    <blockquote className="font-display text-xl md:text-2xl font-light leading-relaxed text-[#F5F0E8]/90 mb-8 pt-8 pl-2">
                      {t.quote}
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full liquid-glass-subtle flex items-center justify-center text-[#C9A84C] font-display text-lg font-light">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[#F5F0E8] font-light text-sm">{t.name}</p>
                        <p className="text-[#8A8478] text-xs tracking-[0.05em]">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation: left arrow + dots + right arrow */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => goTo((active - 1 + testimonials.length) % testimonials.length)}
                className="w-9 h-9 rounded-full border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C]/70 hover:text-[#C9A84C] hover:border-[#C9A84C]/60 hover:bg-[#C9A84C]/10 transition-all duration-300 cursor-pointer"
                aria-label="Previous testimonial"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>

              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`testimonial-dot ${i === active ? "active" : ""}`}
                    onClick={() => goTo(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => goTo((active + 1) % testimonials.length)}
                className="w-9 h-9 rounded-full border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C]/70 hover:text-[#C9A84C] hover:border-[#C9A84C]/60 hover:bg-[#C9A84C]/10 transition-all duration-300 cursor-pointer"
                aria-label="Next testimonial"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Contact ---------- */
function ContactSection() {
  const { ref, inView } = useInView();
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState<SettingsT>(FALLBACK_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Partial<SettingsT>) => {
        if (cancelled) return;
        if (data && typeof data === "object") {
          setSettings((prev) => ({
            phone: data.phone ?? prev.phone,
            email: data.email ?? prev.email,
            location: data.location ?? prev.location,
            facebook: data.facebook ?? prev.facebook,
            instagram: data.instagram ?? prev.instagram,
            linkedin: data.linkedin ?? prev.linkedin,
          }));
        }
      })
      .catch(() => { /* keep fallback */ });
    return () => { cancelled = true; };
  }, []);

  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (r.ok && data.ok) {
        setSubmitted(true);
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setFormError(data.error || "Failed to send. Please try again.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
      <div className="orb orb-fast w-[350px] h-[350px] bg-[#A07C1C] top-[20%] left-[-5%] opacity-10" />
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-[#C9A84C] tracking-[0.3em] uppercase text-xs mb-4">Reach Out</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-6">
            Let&apos;s <span className="gold-shimmer">Connect</span>
          </h2>
          <p className="text-[#8A8478] max-w-xl mx-auto font-light">Ready to bring your vision to life? Get in touch and let&apos;s discuss your next project.</p>
          <div className="section-divider w-24 mx-auto mt-6" />
        </div>
        <div className="grid md:grid-cols-5 gap-8 max-w-6xl mx-auto">
          <div className={`md:col-span-2 transition-all duration-700 delay-100 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="liquid-glass-strong rounded-2xl p-8 h-full">
              <h3 className="font-display text-2xl font-light mb-8 text-[#F5F0E8]">Contact Details</h3>
              <div className="space-y-6">
                <ContactInfoItem icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>} label="Location" value={settings.location} />
                <ContactInfoItem icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>} label="Email" value={settings.email} />
                <ContactInfoItem icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>} label="Phone" value={settings.phone} />
              </div>
              <div className="section-divider my-8" />
              <h4 className="text-xs tracking-[0.2em] uppercase text-[#8A8478] mb-4">Follow Us</h4>
              <div className="flex gap-4">
                {settings.facebook ? (
                  <SocialLink href={settings.facebook} label="Facebook"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></SocialLink>
                ) : null}
                {settings.instagram ? (
                  <SocialLink href={settings.instagram} label="Instagram"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg></SocialLink>
                ) : null}
                {settings.linkedin ? (
                  <SocialLink href={settings.linkedin} label="LinkedIn"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></SocialLink>
                ) : null}
              </div>
            </div>
          </div>
          <div className={`md:col-span-3 transition-all duration-700 delay-200 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="liquid-glass-strong rounded-2xl p-8">
              <h3 className="font-display text-2xl font-light mb-8 text-[#F5F0E8]">Send an Inquiry</h3>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-[#C9A84C] flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <h4 className="font-display text-xl text-[#F5F0E8] mb-2">Thank You</h4>
                  <p className="text-[#8A8478] font-light text-sm">We&apos;ve received your inquiry and will be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div><label htmlFor="name" className="block text-xs tracking-[0.15em] uppercase text-[#8A8478] mb-2">Full Name</label><input id="name" name="name" type="text" required placeholder="Your name" className="form-input-glass w-full px-4 py-3 rounded-xl text-sm" /></div>
                    <div><label htmlFor="email" className="block text-xs tracking-[0.15em] uppercase text-[#8A8478] mb-2">Email Address</label><input id="email" name="email" type="email" required placeholder="your@email.com" className="form-input-glass w-full px-4 py-3 rounded-xl text-sm" /></div>
                  </div>
                  <div><label htmlFor="subject" className="block text-xs tracking-[0.15em] uppercase text-[#8A8478] mb-2">Subject</label><select id="subject" name="subject" className="form-input-glass w-full px-4 py-3 rounded-xl text-sm appearance-none" defaultValue=""><option value="" disabled>Select a service</option><option value="building-design">Building Design</option><option value="3d-visualization">3D Visualization</option><option value="project-oversight">Project Oversight</option><option value="other">Other Inquiry</option></select></div>
                  <div><label htmlFor="message" className="block text-xs tracking-[0.15em] uppercase text-[#8A8478] mb-2">Message</label><textarea id="message" name="message" rows={5} required placeholder="Tell us about your project..." className="form-input-glass w-full px-4 py-3 rounded-xl text-sm resize-none" /></div>
                  <button type="submit" disabled={sending} className="btn-gold w-full py-4 rounded-xl text-sm tracking-[0.15em] disabled:opacity-60">{sending ? "Sending..." : "Send Inquiry"}</button>
                  {formError && <p className="text-red-400 text-xs text-center mt-3">{formError}</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactInfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-[#C9A84C] mt-0.5">{icon}</div>
      <div><p className="text-xs tracking-[0.15em] uppercase text-[#8A8478] mb-1">{label}</p><p className="text-[#F5F0E8] font-light text-sm">{value}</p></div>
    </div>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-10 h-10 rounded-full liquid-glass-subtle flex items-center justify-center text-[#C9A84C] hover:bg-[rgba(201,168,76,0.15)] transition-all duration-300">{children}</a>
  );
}

/* ---------- Back to Top ---------- */
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handle = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);
  const scrollToTop = useCallback(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  return (
    <button onClick={scrollToTop} aria-label="Back to top" className={`back-to-top fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full liquid-glass flex items-center justify-center text-[#C9A84C] hover:bg-[rgba(201,168,76,0.12)] transition-all duration-300 ${visible ? "visible" : "hidden"}`}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
    </button>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="border-t border-[rgba(201,168,76,0.1)]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/elux-final.png" alt="Elux Design" className="h-8 w-auto object-contain" />
            <span className="text-sm text-[#8A8478] font-light">&copy; {new Date().getFullYear()} Elux Design. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-xs tracking-[0.1em] uppercase text-[#8A8478] hover:text-[#C9A84C] transition-colors duration-300">{link.label}</a>
            ))}
          </div>
        </div>
        <div className="section-divider mt-8 mb-6" />
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-xs text-[#8A8478]/60 font-light">Building Design &middot; 3D Visualization &middot; Project Oversight &middot; Nadi, Fiji</p>
          <p className="text-center text-xs text-[#C9A84C]/70 font-light hover:text-[#C9A84C] transition-colors duration-300">Developed by <span className="font-semibold tracking-wide">N2K Labs</span></p>
        </div>
      </div>
    </footer>
  );
}

/* ========================================================================
   ADMIN PANEL
   ======================================================================== */

/* ---------- Admin Panel root (handles auth state + close) ---------- */
function AdminPanel({ onClose }: { onClose: () => void }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check whether we already have a valid session cookie
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth", { method: "GET" })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean }) => {
        if (cancelled) return;
        setAuthed(!!data.authenticated);
      })
      .catch(() => { if (!cancelled) setAuthed(false); })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-[#0A0A0A]/95 backdrop-blur-xl overflow-y-auto admin-scroll">
      <button
        onClick={onClose}
        aria-label="Close admin panel"
        className="fixed top-5 right-5 z-[210] w-11 h-11 rounded-full liquid-glass-subtle flex items-center justify-center text-[#C9A84C] hover:bg-[rgba(201,168,76,0.18)] transition-all duration-300"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {checking ? (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
          <div className="w-12 h-12 rounded-full border-2 border-[rgba(201,168,76,0.2)] border-t-[#C9A84C] animate-spin mb-6" />
          <p className="text-xs tracking-[0.3em] uppercase text-[#8A8478]">Loading Admin</p>
        </div>
      ) : authed ? (
        <AdminDashboard onLogout={() => setAuthed(false)} onClose={onClose} />
      ) : (
        <AdminLogin onSuccess={() => setAuthed(true)} onClose={onClose} />
      )}
    </div>
  );
}

/* ---------- Admin Login ---------- */
function AdminLogin({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data.success) {
        onSuccess();
      } else {
        setError(data.error || "Invalid password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img src="/elux-final.png" alt="Elux Design" className="h-16 w-auto object-contain mx-auto mb-6" />
          <p className="text-[#C9A84C] tracking-[0.4em] uppercase text-xs mb-3">Admin Access</p>
          <h1 className="font-display text-3xl md:text-4xl font-light text-[#F5F0E8] mb-2">
            Welcome <span className="gold-shimmer">Back</span>
          </h1>
          <p className="text-[#8A8478] text-sm font-light">Enter your password to manage site content.</p>
        </div>
        <form onSubmit={handleSubmit} className="liquid-glass-strong rounded-2xl p-8 space-y-5">
          <div>
            <label htmlFor="admin-password" className="block text-xs tracking-[0.15em] uppercase text-[#8A8478] mb-2">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              placeholder="Enter admin password"
              className="form-input-glass w-full px-4 py-3 rounded-xl text-sm"
            />
          </div>
          {error && (
            <p className="text-red-400/80 text-xs font-light bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3.5 rounded-xl text-sm tracking-[0.15em] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={onClose} className="text-xs text-[#8A8478] hover:text-[#C9A84C] transition-colors">
              &larr; Back to site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Admin Dashboard ---------- */
type AdminTab = "projects" | "testimonials" | "services" | "about" | "settings" | "password";

function AdminDashboard({ onLogout, onClose }: { onLogout: () => void; onClose: () => void }) {
  const [tab, setTab] = useState<AdminTab>("projects");
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    } finally {
      setLoggingOut(false);
      onLogout();
    }
  };

  const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "projects", label: "Projects",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zm9.75 0A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75 0a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
    },
    {
      id: "testimonials", label: "Testimonials",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
    },
    {
      id: "services", label: "Services",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.58-3.07a.75.75 0 010-1.32l5.58-3.07a.75.75 0 01.75 0l5.58 3.07a.75.75 0 010 1.32l-5.58 3.07a.75.75 0 01-.75 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0l-1.232 3.458M3.75 7.5l1.232 3.458" /></svg>,
    },
    {
      id: "about", label: "About",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>,
    },
    {
      id: "settings", label: "Settings",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      id: "password", label: "Password",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-[200] bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[rgba(201,168,76,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/elux-final.png" alt="Elux Design" className="h-8 w-auto object-contain" />
            <div className="hidden sm:block">
              <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#8A8478]">Elux Design</p>
              <p className="font-display text-base text-[#F5F0E8] -mt-0.5">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs tracking-[0.1em] uppercase text-[#8A8478] hover:text-[#C9A84C] transition-colors px-3 py-2 rounded-lg hover:bg-[rgba(201,168,76,0.06)]"
            >
              View Site
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-xs tracking-[0.1em] uppercase text-[#C9A84C] px-3 py-2 rounded-lg border border-[rgba(201,168,76,0.25)] hover:bg-[rgba(201,168,76,0.08)] transition-all disabled:opacity-60"
            >
              {loggingOut ? "..." : "Logout"}
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 pb-3">
          <div className="flex gap-1 overflow-x-auto admin-scroll -mx-1 px-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase font-light transition-all duration-300 whitespace-nowrap ${
                  tab === t.id
                    ? "bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)]"
                    : "text-[#8A8478] hover:text-[#F5F0E8] hover:bg-[rgba(201,168,76,0.05)] border border-transparent"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {tab === "projects" && <AdminProjectsTab />}
        {tab === "testimonials" && <AdminTestimonialsTab />}
        {tab === "services" && <AdminServicesTab />}
        {tab === "about" && <AdminAboutTab />}
        {tab === "settings" && <AdminSettingsTab />}
        {tab === "password" && <AdminPasswordTab />}
      </div>
    </div>
  );
}

/* ---------- Shared admin UI helpers ---------- */
function AdminButton({ children, variant = "primary", className = "", ...rest }: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = "inline-flex items-center justify-center gap-2 text-xs tracking-[0.1em] uppercase font-medium rounded-lg px-4 py-2.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "btn-gold",
    ghost: "border border-[rgba(201,168,76,0.25)] text-[#C9A84C] hover:bg-[rgba(201,168,76,0.08)]",
    danger: "border border-red-500/30 text-red-400/90 hover:bg-red-500/10",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

function AdminField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs tracking-[0.15em] uppercase text-[#8A8478] mb-2">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-[0.7rem] text-[#8A8478]/60 font-light">{hint}</p>}
    </div>
  );
}

const adminInputCls = "form-input-glass w-full px-4 py-2.5 rounded-lg text-sm";

function AdminToast({ message, kind = "success" }: { message: string; kind?: "success" | "error" }) {
  const colors = kind === "success"
    ? "border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.08)] text-[#C9A84C]"
    : "border-red-500/30 bg-red-500/10 text-red-300";
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-xl border text-xs tracking-[0.1em] uppercase font-medium ${colors} backdrop-blur-md`}>
      {message}
    </div>
  );
}

function useAdminToast() {
  const [toast, setToast] = useState<{ message: string; kind: "success" | "error" } | null>(null);
  const showToast = useCallback((message: string, kind: "success" | "error" = "success") => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, showToast };
}

/* ---------- Admin Projects Tab ---------- */
function AdminProjectsTab() {
  const { toast, showToast } = useAdminToast();
  const [projects, setProjects] = useState<ProjectT[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProjectT | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/projects?all=1");
      const data = await r.json();
      if (Array.isArray(data)) setProjects(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (p: ProjectT) => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      const r = await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      showToast("Project deleted.");
      load();
    } catch {
      showToast("Delete failed.", "error");
    }
  };

  const handleToggleActive = async (p: ProjectT) => {
    try {
      const r = await fetch(`/api/projects/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !p.active }),
      });
      if (!r.ok) throw new Error();
      showToast(p.active ? "Project hidden." : "Project published.");
      load();
    } catch {
      showToast("Update failed.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-light text-[#F5F0E8]">Projects</h2>
          <p className="text-xs text-[#8A8478] mt-1 font-light">{projects.length} project(s) total</p>
        </div>
        <AdminButton onClick={() => setCreating(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add New Project
        </AdminButton>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl liquid-glass animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="liquid-glass rounded-2xl p-10 text-center">
          <p className="text-[#8A8478] font-light text-sm">No projects yet. Click &quot;Add New Project&quot; to create one.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="liquid-glass rounded-xl p-4 flex gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[rgba(201,168,76,0.05)]">
                {p.image ? (
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-light text-[#F5F0E8] truncate">{p.title}</h3>
                    <p className="text-[#C9A84C] text-[0.7rem] tracking-[0.1em] uppercase truncate">{p.location}</p>
                  </div>
                  <span className={`text-[0.6rem] tracking-[0.15em] uppercase px-2 py-1 rounded-full border whitespace-nowrap ${p.active ? "border-[rgba(201,168,76,0.4)] text-[#C9A84C]" : "border-[rgba(138,132,120,0.3)] text-[#8A8478]"}`}>
                    {p.active ? "Published" : "Hidden"}
                  </span>
                </div>
                <p className="text-[#8A8478] text-xs font-light mt-1 line-clamp-2">{p.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <AdminButton variant="ghost" className="!px-3 !py-1.5 !text-[0.65rem]" onClick={() => setEditing(p)}>Edit</AdminButton>
                  <AdminButton variant="ghost" className="!px-3 !py-1.5 !text-[0.65rem]" onClick={() => handleToggleActive(p)}>
                    {p.active ? "Hide" : "Publish"}
                  </AdminButton>
                  <AdminButton variant="danger" className="!px-3 !py-1.5 !text-[0.65rem]" onClick={() => handleDelete(p)}>Delete</AdminButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <ProjectFormModal
          project={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); showToast(editing ? "Project updated." : "Project created."); }}
          onError={(msg) => showToast(msg, "error")}
        />
      )}

      {toast && <AdminToast message={toast.message} kind={toast.kind} />}
    </div>
  );
}

/* ---------- Project Form Modal ---------- */
function ProjectFormModal({ project, onClose, onSaved, onError }: {
  project: ProjectT | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [title, setTitle] = useState(project?.title || "");
  const [location, setLocation] = useState(project?.location || "");
  const [category, setCategory] = useState(project?.category || "");
  const [description, setDescription] = useState(project?.description || "");
  const [image, setImage] = useState(project?.image || "");
  const [order, setOrder] = useState(project?.order ?? 0);
  const [active, setActive] = useState(project?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!project;

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      onError("Please select an image file.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Upload failed");
      setImage(data.url);
    } catch {
      onError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadFile(f);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadFile(f);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !location || !category || !description) {
      onError("All fields are required.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("location", location);
      fd.append("category", category);
      fd.append("description", description);
      fd.append("image", image || "/project-1.png");
      fd.append("order", String(order));
      fd.append("active", String(active));

      const url = isEdit ? `/api/projects/${project!.id}` : "/api/projects";
      const method = isEdit ? "PUT" : "POST";
      const r = await fetch(url, { method, body: fd });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="liquid-glass-strong rounded-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto admin-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-[#0A0A0A]/80 backdrop-blur-md px-6 py-4 border-b border-[rgba(201,168,76,0.1)] flex items-center justify-between">
          <h3 className="font-display text-xl font-light text-[#F5F0E8]">
            {isEdit ? "Edit Project" : "New Project"}
          </h3>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-[#C9A84C] hover:bg-[rgba(201,168,76,0.18)] transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <AdminField label="Title">
              <input className={adminInputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fantasy Island Villa" required />
            </AdminField>
            <AdminField label="Location">
              <input className={adminInputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Fantasy Island, Fiji" required />
            </AdminField>
          </div>
          <AdminField label="Category">
            <input className={adminInputCls} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Luxury Waterfront Residence" required />
          </AdminField>
          <AdminField label="Description">
            <textarea className={`${adminInputCls} resize-none`} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project description..." required />
          </AdminField>

          {/* Image: upload or paste URL */}
          <AdminField label="Project Image" hint="Upload a file or paste an image URL below.">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-all ${
                dragOver ? "border-[#C9A84C] bg-[rgba(201,168,76,0.08)]" : "border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)]"
              }`}
            >
              {image ? (
                <div className="flex items-center gap-4">
                  <img src={image} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs text-[#C9A84C] truncate">{image}</p>
                    <p className="text-[0.7rem] text-[#8A8478] mt-1">Click to replace</p>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <svg className="w-8 h-8 mx-auto text-[#C9A84C]/60 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                  <p className="text-xs text-[#8A8478]">{uploading ? "Uploading..." : "Drop image here or click to browse"}</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
            <div className="mt-2 flex gap-2">
              <input
                className={`${adminInputCls} flex-1 text-xs`}
                placeholder="Or paste image URL here..."
                value={image.startsWith("http") || image.startsWith("/") ? image : ""}
                onChange={(e) => setImage(e.target.value)}
              />\n              <button
                type="button"
                onClick={() => setImage("/project-1.png")}
                className="text-[0.65rem] px-3 py-2 rounded-lg border border-[rgba(201,168,76,0.2)] text-[#8A8478] hover:text-[#C9A84C] hover:border-[rgba(201,168,76,0.4)] transition-all whitespace-nowrap"
              >
                Reset
              </button>
            </div>
          </AdminField>

          <div className="grid sm:grid-cols-2 gap-4">
            <AdminField label="Display Order" hint="Lower numbers appear first.">
              <input type="number" className={adminInputCls} value={order} onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)} min={0} />
            </AdminField>
            <AdminField label="Visibility">
              <label className="flex items-center gap-3 px-4 py-2.5 rounded-lg liquid-glass-subtle cursor-pointer">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#C9A84C] w-4 h-4" />
                <span className="text-sm text-[#F5F0E8] font-light">{active ? "Published (visible)" : "Hidden (draft)"}</span>
              </label>
            </AdminField>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(201,168,76,0.1)]">
            <AdminButton variant="ghost" type="button" onClick={onClose}>Cancel</AdminButton>
            <AdminButton type="submit" disabled={saving || uploading}>
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Admin Testimonials Tab ---------- */
function AdminTestimonialsTab() {
  const { toast, showToast } = useAdminToast();
  const [testimonials, setTestimonials] = useState<TestimonialT[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TestimonialT | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/testimonials?all=1");
      const data = await r.json();
      if (Array.isArray(data)) setTestimonials(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (t: TestimonialT) => {
    if (!confirm(`Delete testimonial from "${t.name}"?`)) return;
    try {
      const r = await fetch(`/api/testimonials/${t.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      showToast("Testimonial deleted.");
      load();
    } catch {
      showToast("Delete failed.", "error");
    }
  };

  const handleToggleActive = async (t: TestimonialT) => {
    try {
      const r = await fetch(`/api/testimonials/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !t.active }),
      });
      if (!r.ok) throw new Error();
      showToast(t.active ? "Testimonial hidden." : "Testimonial published.");
      load();
    } catch {
      showToast("Update failed.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-light text-[#F5F0E8]">Testimonials</h2>
          <p className="text-xs text-[#8A8478] mt-1 font-light">{testimonials.length} testimonial(s) total</p>
        </div>
        <AdminButton onClick={() => setCreating(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add New Testimonial
        </AdminButton>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-xl liquid-glass animate-pulse" />)}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="liquid-glass rounded-2xl p-10 text-center">
          <p className="text-[#8A8478] font-light text-sm">No testimonials yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div key={t.id} className="liquid-glass rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="min-w-0">
                  <p className="font-display text-base text-[#F5F0E8]">{t.name}</p>
                  <p className="text-[#C9A84C] text-[0.7rem] tracking-[0.1em] uppercase">{t.role}</p>
                </div>
                <span className={`text-[0.6rem] tracking-[0.15em] uppercase px-2 py-1 rounded-full border whitespace-nowrap ${t.active ? "border-[rgba(201,168,76,0.4)] text-[#C9A84C]" : "border-[rgba(138,132,120,0.3)] text-[#8A8478]"}`}>
                  {t.active ? "Published" : "Hidden"}
                </span>
              </div>
              <p className="text-[#8A8478] text-sm font-light italic line-clamp-3">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-2 mt-4">
                <AdminButton variant="ghost" className="!px-3 !py-1.5 !text-[0.65rem]" onClick={() => setEditing(t)}>Edit</AdminButton>
                <AdminButton variant="ghost" className="!px-3 !py-1.5 !text-[0.65rem]" onClick={() => handleToggleActive(t)}>
                  {t.active ? "Hide" : "Publish"}
                </AdminButton>
                <AdminButton variant="danger" className="!px-3 !py-1.5 !text-[0.65rem]" onClick={() => handleDelete(t)}>Delete</AdminButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <TestimonialFormModal
          testimonial={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); showToast(editing ? "Testimonial updated." : "Testimonial created."); }}
          onError={(msg) => showToast(msg, "error")}
        />
      )}

      {toast && <AdminToast message={toast.message} kind={toast.kind} />}
    </div>
  );
}

/* ---------- Testimonial Form Modal ---------- */
function TestimonialFormModal({ testimonial, onClose, onSaved, onError }: {
  testimonial: TestimonialT | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [quote, setQuote] = useState(testimonial?.quote || "");
  const [name, setName] = useState(testimonial?.name || "");
  const [role, setRole] = useState(testimonial?.role || "");
  const [order, setOrder] = useState(testimonial?.order ?? 0);
  const [active, setActive] = useState(testimonial?.active ?? true);
  const [saving, setSaving] = useState(false);
  const isEdit = !!testimonial;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!quote || !name || !role) {
      onError("All fields are required.");
      return;
    }
    setSaving(true);
    try {
      const body = { quote, name, role, order, active };
      const url = isEdit ? `/api/testimonials/${testimonial!.id}` : "/api/testimonials";
      const method = isEdit ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="liquid-glass-strong rounded-2xl w-full max-w-xl my-8 max-h-[90vh] overflow-y-auto admin-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-[#0A0A0A]/80 backdrop-blur-md px-6 py-4 border-b border-[rgba(201,168,76,0.1)] flex items-center justify-between">
          <h3 className="font-display text-xl font-light text-[#F5F0E8]">
            {isEdit ? "Edit Testimonial" : "New Testimonial"}
          </h3>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-[#C9A84C] hover:bg-[rgba(201,168,76,0.18)] transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <AdminField label="Quote">
            <textarea className={`${adminInputCls} resize-none`} rows={5} value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Client testimonial..." required />
          </AdminField>
          <div className="grid sm:grid-cols-2 gap-4">
            <AdminField label="Client Name">
              <input className={adminInputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="James & Sarah Mitchell" required />
            </AdminField>
            <AdminField label="Role / Title">
              <input className={adminInputCls} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Homeowners, Fantasy Island Villa" required />
            </AdminField>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <AdminField label="Display Order">
              <input type="number" className={adminInputCls} value={order} onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)} min={0} />
            </AdminField>
            <AdminField label="Visibility">
              <label className="flex items-center gap-3 px-4 py-2.5 rounded-lg liquid-glass-subtle cursor-pointer">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#C9A84C] w-4 h-4" />
                <span className="text-sm text-[#F5F0E8] font-light">{active ? "Published" : "Hidden"}</span>
              </label>
            </AdminField>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(201,168,76,0.1)]">
            <AdminButton variant="ghost" type="button" onClick={onClose}>Cancel</AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Testimonial"}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Admin Settings Tab ---------- */
function AdminSettingsTab() {
  const { toast, showToast } = useAdminToast();
  const [settings, setSettings] = useState<SettingsT>(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Partial<SettingsT>) => {
        if (data && typeof data === "object") {
          setSettings({
            phone: data.phone ?? "",
            email: data.email ?? "",
            location: data.location ?? "",
            facebook: data.facebook ?? "",
            instagram: data.instagram ?? "",
            linkedin: data.linkedin ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      showToast("Settings saved.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl liquid-glass animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-light text-[#F5F0E8]">Site Settings</h2>
        <p className="text-xs text-[#8A8478] mt-1 font-light">Manage contact details and social links shown across the site.</p>
      </div>

      <form onSubmit={handleSubmit} className="liquid-glass rounded-2xl p-6 space-y-5 max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <AdminField label="Phone">
            <input className={adminInputCls} value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} placeholder="+679 000 0000" />
          </AdminField>
          <AdminField label="Email">
            <input className={adminInputCls} type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} placeholder="hello@eluxdesign.com" />
          </AdminField>
        </div>
        <AdminField label="Location">
          <input className={adminInputCls} value={settings.location} onChange={(e) => setSettings({ ...settings, location: e.target.value })} placeholder="Nadi, Fiji" />
        </AdminField>
        <div className="section-divider" />
        <p className="text-xs tracking-[0.2em] uppercase text-[#8A8478]">Social Links</p>
        <AdminField label="Facebook URL">
          <input className={adminInputCls} value={settings.facebook} onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} placeholder="https://facebook.com/EluxDesign" />
        </AdminField>
        <AdminField label="Instagram URL">
          <input className={adminInputCls} value={settings.instagram} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} placeholder="https://instagram.com/EluxDesign" />
        </AdminField>
        <AdminField label="LinkedIn URL" hint="Leave blank to hide the LinkedIn icon.">
          <input className={adminInputCls} value={settings.linkedin} onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })} placeholder="https://linkedin.com/company/EluxDesign" />
        </AdminField>

        <div className="flex items-center justify-end pt-4 border-t border-[rgba(201,168,76,0.1)]">
          <AdminButton type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </AdminButton>
        </div>
      </form>

      {toast && <AdminToast message={toast.message} kind={toast.kind} />}
    </div>
  );
}

/* ---------- Admin Password Tab ---------- */
function AdminPasswordTab() {
  const { toast, showToast } = useAdminToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (next !== confirmPwd) {
      showToast("New passwords do not match.", "error");
      return;
    }
    if (next.length < 8) {
      showToast("New password must be at least 8 characters.", "error");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(data.error || "Failed to change password.");
      }
      showToast("Password updated.");
      setCurrent("");
      setNext("");
      setConfirmPwd("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to change password.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-light text-[#F5F0E8]">Change Password</h2>
        <p className="text-xs text-[#8A8478] mt-1 font-light">Update your admin password. You will need to log in again after changing.</p>
      </div>

      <form onSubmit={handleSubmit} className="liquid-glass rounded-2xl p-6 space-y-5 max-w-md">
        <AdminField label="Current Password">
          <input className={adminInputCls} type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required autoFocus />
        </AdminField>
        <AdminField label="New Password">
          <input className={adminInputCls} type="password" value={next} onChange={(e) => setNext(e.target.value)} required />
        </AdminField>
        <AdminField label="Confirm New Password">
          <input className={adminInputCls} type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required />
        </AdminField>
        <div className="flex items-center justify-end pt-4 border-t border-[rgba(201,168,76,0.1)]">
          <AdminButton type="submit" disabled={saving}>
            {saving ? "Updating..." : "Update Password"}
          </AdminButton>
        </div>
      </form>

      {toast && <AdminToast message={toast.message} kind={toast.kind} />}
    </div>
  );
}

/* ========================================================================
   ADMIN SERVICES TAB
   ======================================================================== */
function AdminServicesTab() {
  const { toast, showToast } = useAdminToast();
  const [items, setItems] = useState<{ id: string; title: string; description: string; iconKey: string; order: number; active: boolean }[]>([]);
  const [editing, setEditing] = useState<typeof items[number] | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const r = await fetch("/api/services?all=1");
      const data = await r.json();
      if (Array.isArray(data)) setItems(data);
    } catch { /* use empty */ }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (item: typeof items[number]) => {
    setSaving(true);
    try {
      const r = await fetch(`/api/services/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!r.ok) throw new Error();
      showToast("Service updated.");
      setEditing(null);
      await load();
    } catch {
      showToast("Failed to update.", "error");
    } finally { setSaving(false); }
  };

  const handleCreate = async (data: { title: string; description: string; iconKey: string }) => {
    setSaving(true);
    try {
      const r = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error();
      showToast("Service created.");
      setCreating(false);
      await load();
    } catch {
      showToast("Failed to create.", "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await fetch(`/api/services/${id}`, { method: "DELETE" });
      showToast("Service deleted.");
      await load();
    } catch {
      showToast("Failed to delete.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-light text-[#F5F0E8]">Services</h2>
          <p className="text-xs text-[#8A8478] mt-1 font-light">Manage your service offerings</p>
        </div>
        <AdminButton onClick={() => setCreating(true)}>+ Add Service</AdminButton>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="liquid-glass rounded-xl p-5">
            {editing?.id === item.id ? (
              <ServiceForm initial={editing} saving={saving} onSave={handleSave} onCancel={() => setEditing(null)} />
            ) : (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-[#F5F0E8] truncate">{item.title}</h3>
                      <span className={`text-[0.6rem] px-2 py-0.5 rounded-full ${item.active ? "bg-[rgba(201,168,76,0.15)] text-[#C9A84C]" : "bg-[rgba(255,255,255,0.05)] text-[#8A8478]"}`}>
                        {item.active ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-xs text-[#8A8478] font-light line-clamp-2">{item.description}</p>
                    <p className="text-[0.6rem] text-[#8A8478]/60 mt-2">Icon: {item.iconKey} · Order: {item.order}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <AdminButton variant="ghost" onClick={() => setEditing(item)}>Edit</AdminButton>
                    <AdminButton variant="ghost" onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300">Delete</AdminButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {creating && (
        <div className="liquid-glass rounded-xl p-5">
          <ServiceForm saving={saving} onSave={(data) => handleCreate(data as unknown as typeof items[number])} onCancel={() => setCreating(false)} />
        </div>
      )}

      {toast && <AdminToast message={toast.message} kind={toast.kind} />}
    </div>
  );
}

function ServiceForm({ initial, saving, onSave, onCancel }: { initial?: any; saving: boolean; onSave: (s: any) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [iconKey, setIconKey] = useState(initial?.iconKey || "building");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [active, setActive] = useState(initial?.active ?? true);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (initial) {
      onSave({ ...initial, title, description, iconKey, order, active });
    } else {
      onSave({ id: "", title, description, iconKey, order, active } as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AdminField label="Title"><input className={adminInputCls} value={title} onChange={(e) => setTitle(e.target.value)} required /></AdminField>
      <AdminField label="Description"><textarea className={`${adminInputCls} min-h-[80px] resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} /></AdminField>
      <div className="grid grid-cols-2 gap-4">
        <AdminField label="Icon Key">
          <select className={adminInputCls} value={iconKey} onChange={(e) => setIconKey(e.target.value)}>
            <option value="building">Building</option>
            <option value="3d">3D</option>
            <option value="oversight">Oversight</option>
          </select>
        </AdminField>
        <AdminField label="Order"><input className={adminInputCls} type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} /></AdminField>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#C9A84C]" />
        <span className="text-xs text-[#8A8478]">Active (visible on website)</span>
      </label>
      <div className="flex justify-end gap-3 pt-3 border-t border-[rgba(201,168,76,0.1)]">
        <AdminButton variant="ghost" type="button" onClick={onCancel}>Cancel</AdminButton>
        <AdminButton type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</AdminButton>
      </div>
    </form>
  );
}

/* ========================================================================
   ADMIN ABOUT TAB
   ======================================================================== */
function AdminAboutTab() {
  const { toast, showToast } = useAdminToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    paragraph1: "", paragraph2: "", paragraph3: "",
    statYears: 15, statProjects: 50, statSpecializations: 3, statSatisfaction: 100,
    statYearsLabel: "Years of Experience", statProjectsLabel: "Projects Completed",
    statSpecLabel: "Core Specializations", statSatLabel: "Client Satisfaction %",
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/about").then((r) => r.json()).then((data) => {
      if (data && data.id) {
        setForm({
          paragraph1: data.paragraph1 || "", paragraph2: data.paragraph2 || "", paragraph3: data.paragraph3 || "",
          statYears: data.statYears ?? 15, statProjects: data.statProjects ?? 50,
          statSpecializations: data.statSpecializations ?? 3, statSatisfaction: data.statSatisfaction ?? 100,
          statYearsLabel: data.statYearsLabel || "Years of Experience",
          statProjectsLabel: data.statProjectsLabel || "Projects Completed",
          statSpecLabel: data.statSpecLabel || "Core Specializations",
          statSatLabel: data.statSatLabel || "Client Satisfaction %",
        });
        setLoaded(true);
      }
    }).catch(() => setLoaded(true));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      showToast("About section updated.");
    } catch {
      showToast("Failed to save.", "error");
    } finally { setSaving(false); }
  };

  const update = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-light text-[#F5F0E8]">About Section</h2>
        <p className="text-xs text-[#8A8478] mt-1 font-light">Edit the about section text and statistics</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="liquid-glass rounded-2xl p-6 space-y-5">
          <h3 className="text-sm tracking-[0.15em] uppercase text-[#C9A84C] font-light">Paragraphs</h3>
          <AdminField label="Paragraph 1"><textarea className={`${adminInputCls} min-h-[100px] resize-none`} value={form.paragraph1} onChange={(e) => update("paragraph1", e.target.value)} rows={4} /></AdminField>
          <AdminField label="Paragraph 2"><textarea className={`${adminInputCls} min-h-[100px] resize-none`} value={form.paragraph2} onChange={(e) => update("paragraph2", e.target.value)} rows={4} /></AdminField>
          <AdminField label="Paragraph 3"><textarea className={`${adminInputCls} min-h-[100px] resize-none`} value={form.paragraph3} onChange={(e) => update("paragraph3", e.target.value)} rows={4} /></AdminField>
        </div>

        <div className="liquid-glass rounded-2xl p-6 space-y-5">
          <h3 className="text-sm tracking-[0.15em] uppercase text-[#C9A84C] font-light">Counter Statistics</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="grid grid-cols-2 gap-3 items-end">
              <AdminField label="Number"><input className={adminInputCls} type="number" value={form.statYears} onChange={(e) => update("statYears", parseInt(e.target.value) || 0)} /></AdminField>
              <AdminField label="Label"><input className={adminInputCls} value={form.statYearsLabel} onChange={(e) => update("statYearsLabel", e.target.value)} /></AdminField>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <AdminField label="Number"><input className={adminInputCls} type="number" value={form.statProjects} onChange={(e) => update("statProjects", parseInt(e.target.value) || 0)} /></AdminField>
              <AdminField label="Label"><input className={adminInputCls} value={form.statProjectsLabel} onChange={(e) => update("statProjectsLabel", e.target.value)} /></AdminField>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <AdminField label="Number"><input className={adminInputCls} type="number" value={form.statSpecializations} onChange={(e) => update("statSpecializations", parseInt(e.target.value) || 0)} /></AdminField>
              <AdminField label="Label"><input className={adminInputCls} value={form.statSpecLabel} onChange={(e) => update("statSpecLabel", e.target.value)} /></AdminField>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <AdminField label="Number"><input className={adminInputCls} type="number" value={form.statSatisfaction} onChange={(e) => update("statSatisfaction", parseInt(e.target.value) || 0)} /></AdminField>
              <AdminField label="Label"><input className={adminInputCls} value={form.statSatLabel} onChange={(e) => update("statSatLabel", e.target.value)} /></AdminField>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <AdminButton type="submit" disabled={saving}>{saving ? "Saving..." : "Save About Section"}</AdminButton>
        </div>
      </form>

      {toast && <AdminToast message={toast.message} kind={toast.kind} />}
    </div>
  );
}

/* ========================================================================
   PAGE
   ======================================================================== */

export default function HomePage() {
  const [adminOpen, setAdminOpen] = useState(false);

  // Keyboard shortcut: Ctrl + Shift + A toggles the admin panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setAdminOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setAdminOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <PageLoader />
      <ScrollProgress />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <div className="section-divider" />
        <AboutSection />
        <div className="section-divider" />
        <ServicesSection />
        <div className="section-divider" />
        <ProcessSection />
        <div className="section-divider" />
        <WhyEluxSection />
        <div className="section-divider" />
        <ProjectsSection />
        <div className="section-divider" />
        <TestimonialsSection />
        <div className="section-divider" />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </div>
  );
}
