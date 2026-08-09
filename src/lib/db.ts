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
 * Ensure database tables and columns match the current Prisma schema.
 * On Vercel we can't run `prisma db push`, so we do it via raw SQL.
 *
 * Uses CREATE IF NOT EXISTS + ALTER TABLE ADD COLUMN IF NOT EXISTS so:
 * - Missing tables are created with the correct schema
 * - Existing tables get any missing columns added
 * - Existing data is never destroyed
 * - The function is fully idempotent — safe to call on EVERY request
 *
 * No caching flag: the SQL uses IF NOT EXISTS everywhere so it's a
 * fast no-op when the schema is already correct. This guarantees the
 * schema is always right even after external database changes or warm
 * serverless instances that skipped a previous migration.
 */
const MIGRATION_SQL = `
  -- ===== Project =====
  CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "site" TEXT NOT NULL DEFAULT 'elux-design',
    "title" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '/project-1.png',
    "images" TEXT NOT NULL DEFAULT '[]',
    "client" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "site" TEXT NOT NULL DEFAULT 'elux-design';
  ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "images" TEXT NOT NULL DEFAULT '[]';
  ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "client" TEXT NOT NULL DEFAULT '';
  ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
  ALTER TABLE "Project" ALTER COLUMN "client" SET DEFAULT '';

  -- ===== Testimonial =====
  CREATE TABLE IF NOT EXISTS "Testimonial" (
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
  ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "site" TEXT NOT NULL DEFAULT 'elux-design';
  ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;

  -- ===== Service =====
  CREATE TABLE IF NOT EXISTS "Service" (
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
  ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "site" TEXT NOT NULL DEFAULT 'elux-design';
  ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "iconKey" TEXT NOT NULL DEFAULT 'building';
  ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;

  -- ===== AboutContent =====
  CREATE TABLE IF NOT EXISTS "AboutContent" (
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

  -- ===== SiteSettings =====
  CREATE TABLE IF NOT EXISTS "SiteSettings" (
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
`;

export async function ensureMigrated() {
  try {
    await db.$executeRawUnsafe(MIGRATION_SQL);
  } catch (e) {
    console.error('[ensureMigrated] Migration failed — this should not happen with IF NOT EXISTS:', e);
    throw e; // Let callers know — never swallow this error
  }
}
