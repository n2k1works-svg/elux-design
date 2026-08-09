import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const SITE_URL = "https://www.eluxfiji.com";

export const metadata: Metadata = {
  title: "Elux Design | Architect & Building Design | Nadi, Fiji",
  description:
    "Elux Design — premier architect and building design firm in Nadi, Fiji. 15+ years designing luxury homes, waterfront villas, commercial buildings, and 3D visualization. Serving Nadi, Lautoka, Coral Coast, Suva & all Fiji islands. Free consultations available.",
  keywords: [
    "architect Fiji",
    "architect near me",
    "building designer Fiji",
    "Elux Design",
    "architecture Nadi",
    "architecture Lautoka",
    "architecture Fiji",
    "sustainable architecture Fiji",
    "3D visualization Fiji",
    "luxury homes Fiji",
    "waterfront villa design Fiji",
    "residential architect Fiji",
    "commercial architect Fiji",
    "house design Fiji",
    "building plans Fiji",
    "architectural design South Pacific",
    "Coral Coast architect",
    "Suva architect",
    "home design Nadi",
    "property refurbishment Fiji",
  ],
  authors: [{ name: "Elux Design" }],
  icons: {
    icon: "/elux-final.png",
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Elux Design | Architect & Building Design | Nadi, Fiji",
    description:
      "Premium architect and building design firm in Nadi, Fiji. 15+ years crafting luxury homes, waterfront villas & commercial buildings with photorealistic 3D visualization.",
    siteName: "Elux Design",
    type: "website",
    url: SITE_URL,
    locale: "en_FJ",
    images: [
      {
        url: `${SITE_URL}/elux-final.png`,
        width: 512,
        height: 512,
        alt: "Elux Design - Architecture & 3D Visualization, Nadi Fiji",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elux Design | Architect & Building Design | Nadi, Fiji",
    description:
      "Premium architect and building design firm in Nadi, Fiji. Luxury homes, waterfront villas & 3D visualization.",
    images: [`${SITE_URL}/elux-final.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "",
  },
};

/* JSON-LD Structured Data for Local Business */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ArchitecturalFirm",
  name: "Elux Design",
  description: "Premier building design and 3D visualization firm based in Nadi, Fiji with over 15 years of experience in sustainable architecture, luxury residential design, and commercial developments.",
  url: SITE_URL,
  logo: `${SITE_URL}/elux-final.png`,
  image: `${SITE_URL}/elux-final.png`,
  telephone: "+679 000 0000",
  email: "hello@eluxdesign.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Nadi",
    addressLocality: "Nadi",
    addressRegion: "Western Division",
    addressCountry: "FJ",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -17.8044,
    longitude: 177.4189,
  },
  areaServed: [
    { "@type": "City", name: "Nadi" },
    { "@type": "City", name: "Lautoka" },
    { "@type": "City", name: "Suva" },
    { "@type": "Place", name: "Coral Coast, Fiji" },
    { "@type": "Country", name: "Fiji" },
  ],
  serviceType: [
    "Building Design",
    "Architectural Design",
    "3D Visualization",
    "Residential Architecture",
    "Commercial Architecture",
    "Property Refurbishment",
    "Project Oversight",
  ],
  priceRange: "$$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "17:00",
  },
  sameAs: [
    "https://facebook.com/EluxDesign",
    "https://instagram.com/EluxDesign",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: "3",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Architecture Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Building Design",
          description: "Custom residential homes, waterfront properties, and high-end property refurbishments blending luxury with sustainability.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "3D Visualization",
          description: "Photorealistic 3D renders and immersive virtual walkthroughs of architectural designs before construction.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Project Oversight",
          description: "End-to-end project management from concept through construction with quality control and timeline adherence.",
        },
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#0A0A0A] text-[#F5F0E8]">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var u=navigator.userAgent;if(/SamsungBrowser/i.test(u)||(/Android/i.test(u)&&/Version\/\d\.\d/i.test(u)&&!/Chrome/i.test(u))){document.documentElement.classList.add('poor-shimmer')}})()`,
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
