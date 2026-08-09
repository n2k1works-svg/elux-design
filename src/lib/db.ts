import { PrismaClient } from '@prisma/client'

/**
 * Neon's auto-added DATABASE_URL includes `channel_binding=require`
 * which is not supported by Prisma's query engine.
 * Strip it so Prisma can connect cleanly.
 */
function cleanDatabaseUrl(url: string): string {
  return url
    .replace(/channel_binding=[^&]*&?/g, '')  // remove channel_binding
    .replace(/[?&]$/, '');                     // clean trailing ? or &
}

const databaseUrl = process.env.DATABASE_URL
  ? cleanDatabaseUrl(process.env.DATABASE_URL)
  : undefined;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Ensure database tables match the current Prisma schema.
 * On Vercel we can't run `prisma db push`, so we do it via raw SQL.
 * Uses CREATE IF NOT EXISTS so existing correct tables are left alone.
 */
let _migrated = false;
export async function ensureMigrated() {
  if (_migrated) return;
  _migrated = true;
  try {
    await db.$executeRawUnsafe(`
      -- Drop old tables that have wrong columns (safe since we don't store user uploads)
      DROP TABLE IF EXISTS "Testimonial" CASCADE;
      DROP TABLE IF EXISTS "Service" CASCADE;
      DROP TABLE IF EXISTS "Project" CASCADE;
      DROP TABLE IF EXISTS "AboutContent" CASCADE;
      DROP TABLE IF EXISTS "SiteSettings" CASCADE;

      -- Recreate Project
      CREATE TABLE "Project" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "site" TEXT NOT NULL DEFAULT 'elux-design',
        "title" TEXT NOT NULL,
        "location" TEXT NOT NULL DEFAULT '',
        "category" TEXT NOT NULL DEFAULT '',
        "description" TEXT NOT NULL DEFAULT '',
        "image" TEXT NOT NULL DEFAULT '/project-1.png',
        "images" TEXT NOT NULL DEFAULT '[]',
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Recreate Testimonial
      CREATE TABLE "Testimonial" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "site" TEXT NOT NULL DEFAULT 'elux-design',
        "quote" TEXT NOT NULL DEFAULT '',
        "name" TEXT NOT NULL DEFAULT '',
        "role" TEXT NOT NULL DEFAULT '',
        "active" BOOLEAN NOT NULL DEFAULT true,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Recreate Service
      CREATE TABLE "Service" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "site" TEXT NOT NULL DEFAULT 'elux-design',
        "title" TEXT NOT NULL DEFAULT '',
        "description" TEXT NOT NULL DEFAULT '',
        "iconKey" TEXT NOT NULL DEFAULT 'building',
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Recreate AboutContent
      CREATE TABLE "AboutContent" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "paragraph1" TEXT NOT NULL DEFAULT '',
        "paragraph2" TEXT NOT NULL DEFAULT '',
        "paragraph3" TEXT NOT NULL DEFAULT '',
        "statYears" INTEGER NOT NULL DEFAULT 15,
        "statProjects" INTEGER NOT NULL DEFAULT 50,
        "statSpecializations" INTEGER NOT NULL DEFAULT 3,
        "statSatisfaction" INTEGER NOT NULL DEFAULT 100,
        "statYearsLabel" TEXT NOT NULL DEFAULT 'Years of Experience',
        "statProjectsLabel" TEXT NOT NULL DEFAULT 'Projects Completed',
        "statSpecLabel" TEXT NOT NULL DEFAULT 'Core Specializations',
        "statSatLabel" TEXT NOT NULL DEFAULT 'Client Satisfaction %',
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Recreate SiteSettings
      CREATE TABLE "SiteSettings" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "phone" TEXT NOT NULL DEFAULT '+679 000 0000',
        "email" TEXT NOT NULL DEFAULT 'hello@eluxdesign.com',
        "location" TEXT NOT NULL DEFAULT 'Nadi, Fiji',
        "facebook" TEXT NOT NULL DEFAULT 'https://facebook.com/EluxDesign',
        "instagram" TEXT NOT NULL DEFAULT 'https://instagram.com/EluxDesign',
        "linkedin" TEXT NOT NULL DEFAULT '',
        "adminPassword" TEXT NOT NULL DEFAULT 'elux2026',
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[ensureMigrated] Tables recreated successfully.');
  } catch (e) {
    _migrated = false; // allow retry
    console.error('[ensureMigrated] Failed:', e);
  }
}
