import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Elux Design | Sustainable Architecture & 3D Visualization | Nadi, Fiji",
  description:
    "Elux Design is a premier building design and 3D visualization firm based in Nadi, Fiji, specializing in sustainable architecture, innovative modern spaces, and luxury residential projects with over 15 years of experience.",
  keywords: [
    "Elux Design",
    "architecture",
    "Fiji",
    "Nadi",
    "sustainable design",
    "3D visualization",
    "luxury homes",
    "waterfront properties",
    "building design Fiji",
  ],
  authors: [{ name: "Elux Design" }],
  icons: {
    icon: "/elux-final.png",
  },
  openGraph: {
    title: "Elux Design | Sustainable Architecture & 3D Visualization",
    description:
      "Premium building design and 3D visualization firm in Nadi, Fiji. Over 15 years crafting sustainable, innovative modern spaces.",
    siteName: "Elux Design",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[#0A0A0A] text-[#F5F0E8]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
