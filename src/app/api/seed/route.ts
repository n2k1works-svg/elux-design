import { NextResponse } from "next/server";
import { db, ensureMigrated } from "@/lib/db";
import { SITE_ID } from "@/lib/site";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SEED_PROJECTS = [
  {
    title: "Fantasy Island Villa",
    location: "Fantasy Island, Fiji",
    category: "Luxury Waterfront Residence",
    description:
      "A breathtaking waterfront villa that seamlessly merges indoor and outdoor living. Featuring panoramic ocean views, sustainable timber construction, and an infinity pool that dissolves into the horizon. This project exemplifies Elux Design's commitment to luxury that respects its natural surroundings.",
    image: "/project-1.png",
    client: "",
    order: 0,
  },
  {
    title: "Lautoka Modern Retreat",
    location: "Lautoka, Fiji",
    category: "Modern Residential",
    description:
      "A contemporary family residence in Lautoka that redefines tropical modernism. Clean geometric lines, expansive glass facades, and natural ventilation systems create a home that is both architecturally striking and deeply comfortable in Fiji's warm climate.",
    image: "/project-2.png",
    client: "",
    order: 1,
  },
  {
    title: "Coral Coast Estate",
    location: "Coral Coast, Fiji",
    category: "High-End Property Refurbishment",
    description:
      "A complete transformation of an existing coastal property into a world-class estate. The refurbishment preserved the structure's heritage character while introducing modern amenities, energy-efficient systems, and a redesigned landscape that frames stunning lagoon views.",
    image: "/project-3.png",
    client: "",
    order: 2,
  },
];

const SEED_TESTIMONIALS = [
  {
    quote:
      "Elux Design transformed our vision of a waterfront dream home into a reality that exceeded every expectation. The 3D walkthrough alone saved us from costly design changes before construction even began. Their understanding of Fiji's climate and materials is unmatched in the region.",
    name: "James & Sarah Mitchell",
    role: "Homeowners, Fantasy Island Villa",
    order: 0,
  },
  {
    quote:
      "Working with Elux Design was a seamless experience from concept to completion. Their project oversight meant we never had to worry about coordination between contractors and designers. The final result is a home that feels both luxurious and deeply connected to its surroundings.",
    name: "Rajesh Kumar",
    role: "Property Developer, Lautoka",
    order: 1,
  },
  {
    quote:
      "The refurbishment of our Coral Coast property was handled with remarkable sensitivity to its original character while bringing it firmly into the 21st century. The sustainable design elements have reduced our energy costs significantly. We could not be happier with the outcome.",
    name: "Dr. Emily Chen",
    role: "Homeowner, Coral Coast Estate",
    order: 2,
  },
];

const SEED_SERVICES = [
  {
    title: "Building Design",
    description:
      "We craft custom residential homes, waterfront properties, and high-end property refurbishments that blend luxury living with environmental responsibility. Each design is a unique response to its site, climate, and the vision of its owner, ensuring spaces that feel both timeless and unmistakably modern.",
    iconKey: "building",
    order: 0,
  },
  {
    title: "3D Visualization",
    description:
      "Our cutting-edge 3D rendering and visual walkthroughs transform architectural concepts into photorealistic experiences. Clients can explore every corner of their future home before a single foundation is poured, making design decisions with confidence and clarity that traditional blueprints simply cannot provide.",
    iconKey: "3d",
    order: 1,
  },
  {
    title: "Project Oversight",
    description:
      "From initial concept through to final handover, we manage and document every phase of your project. Our comprehensive oversight ensures quality control, timeline adherence, and seamless communication between all stakeholders, delivering results that match the original design vision with precision.",
    iconKey: "oversight",
    order: 2,
  },
];

const SEED_ABOUT = {
  paragraph1: "Elux Design is a premier building design and 3D visualization firm based in Nadi, Fiji. For over 15 years, we have been at the forefront of architectural innovation in the South Pacific, delivering projects that range from luxury waterfront residences to large-scale commercial developments across the region.",
  paragraph2: "Our philosophy is rooted in the belief that great architecture should work in harmony with its environment. Fiji's tropical climate, stunning landscapes, and rich cultural heritage serve as both our inspiration and our guide. Every project we undertake is a unique response to its site, its climate, and the vision of its owner.",
  paragraph3: "From the concept sketches to the final walkthrough, our integrated approach ensures that design intent is preserved at every stage, resulting in spaces that are not only beautiful but enduringly functional and deeply connected to their Pacific island context.",
  statYears: 15,
  statProjects: 50,
  statSpecializations: 3,
  statSatisfaction: 100,
  statYearsLabel: "Years of Experience",
  statProjectsLabel: "Projects Completed",
  statSpecLabel: "Core Specializations",
  statSatLabel: "Client Satisfaction",
};

// Exported so GET endpoints can call it for auto-seeding.
// NOTE: Do NOT call ensureMigrated() here — the caller already ran it.
export async function seedIfEmpty() {
  const result: Record<string, string> = {};

  // Settings
  try {
    await db.siteSettings.upsert({
      where: { id: SITE_ID },
      update: {},
      create: { id: SITE_ID },
    });
    result.settings = "ok";
  } catch (e) {
    result.settings = String(e);
  }

  // Projects
  try {
    const count = await db.project.count({ where: { site: SITE_ID } });
    if (count === 0) {
      for (const p of SEED_PROJECTS)
        await db.project.create({ data: { ...p, site: SITE_ID } });
      result.projects = "seeded 3";
    } else {
      result.projects = `already has ${count}`;
    }
  } catch (e) {
    result.projects = "error: " + String(e);
  }

  // Testimonials
  try {
    const count = await db.testimonial.count({ where: { site: SITE_ID } });
    if (count === 0) {
      for (const t of SEED_TESTIMONIALS)
        await db.testimonial.create({ data: { ...t, site: SITE_ID } });
      result.testimonials = "seeded 3";
    } else {
      result.testimonials = `already has ${count}`;
    }
  } catch (e) {
    result.testimonials = "error: " + String(e);
  }

  // Services
  try {
    const count = await db.service.count({ where: { site: SITE_ID } });
    if (count === 0) {
      for (const s of SEED_SERVICES)
        await db.service.create({ data: { ...s, site: SITE_ID } });
      result.services = "seeded 3";
    } else {
      result.services = `already has ${count}`;
    }
  } catch (e) {
    result.services = "error: " + String(e);
  }

  // About
  try {
    const existing = await db.aboutContent.findUnique({ where: { id: SITE_ID } });
    if (!existing || !existing.paragraph1) {
      await db.aboutContent.upsert({
        where: { id: SITE_ID },
        update: SEED_ABOUT,
        create: { id: SITE_ID, ...SEED_ABOUT },
      });
      result.about = "seeded";
    } else {
      result.about = "already exists";
    }
  } catch (e) {
    result.about = "error: " + String(e);
  }

  return result;
}

// GET /api/seed — returns DB status + triggers seed if empty (no auth needed)
export async function GET() {
  try {
    await ensureMigrated();
    const result = await seedIfEmpty();
    return NextResponse.json({ site: SITE_ID, result });
  } catch (err) {
    return NextResponse.json({ site: SITE_ID, error: String(err) }, { status: 500 });
  }
}

// POST /api/seed — same but requires admin auth
export async function POST() {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    await ensureMigrated();
    const result = await seedIfEmpty();
    return NextResponse.json({ success: true, result });
  } catch (err) {
    return NextResponse.json({ error: "Seeding failed." }, { status: 500 });
  }
}
