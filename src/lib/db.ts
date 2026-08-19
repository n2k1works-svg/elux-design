import { PrismaClient } from '@prisma/client'

/**
 * Neon's auto-added DATABASE_URL includes `channel_binding=require`
 * which is not supported by Prisma's query engine.
 * Strip it so Prisma can connect cleanly.
 *
 * Also adds connect_timeout=10 to prevent infinite hangs.
 */
function cleanDatabaseUrl(url: string): string {
  let clean = url
    .replace(/channel_binding=[^&]*&?/g, '')  // remove channel_binding
    .replace(/[?&]$/, '');                     // clean trailing ? or &

  // Connection timeout — fail fast instead of hanging for minutes
  if (!clean.includes('connect_timeout=')) {
    clean += (clean.includes('?') ? '&' : '?') + 'connect_timeout=10';
  }

  return clean;
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

// Cache the Prisma client globally in ALL environments to avoid
// re-creating it on hot-reloads (dev) AND to reuse the connection
// pool across warm serverless invocations (prod).
globalForPrisma.prisma = db

/*
 * NOTE: ensureTablesExist() and ensureMigrated() have been REMOVED from
 * the hot path. Tables are created by the /api/seed endpoint (called once
 * during initial setup). Running CREATE TABLE IF NOT EXISTS on every
 * serverless cold start was causing 6 extra raw SQL round-trips per request.
 *
 * The functions below are kept ONLY for /api/seed and /api/debug.
 */

const CREATE_TABLES: Record<string, string> = {
  Project: `CREATE TABLE IF NOT EXISTS "Project" (
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
  )`,
  Testimonial: `CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "site" TEXT NOT NULL DEFAULT 'elux-design',
    "quote" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  Service: `CREATE TABLE IF NOT EXISTS "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "site" TEXT NOT NULL DEFAULT 'elux-design',
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "iconKey" TEXT NOT NULL DEFAULT 'building',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  AboutContent: `CREATE TABLE IF NOT EXISTS "AboutContent" (
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
  )`,
  SiteSettings: `CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL DEFAULT '+679 000 0000',
    "email" TEXT NOT NULL DEFAULT 'hello@eluxdesign.com',
    "location" TEXT NOT NULL DEFAULT 'Nadi, Fiji',
    "facebook" TEXT NOT NULL DEFAULT 'https://facebook.com/EluxDesign',
    "instagram" TEXT NOT NULL DEFAULT 'https://instagram.com/EluxDesign',
    "linkedin" TEXT NOT NULL DEFAULT '',
    "adminPassword" TEXT NOT NULL DEFAULT 'elux2026',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  LegalContent: `CREATE TABLE IF NOT EXISTS "LegalContent" (
    "type" TEXT NOT NULL PRIMARY KEY,
    "site" TEXT NOT NULL DEFAULT 'elux-design',
    "content" TEXT NOT NULL DEFAULT '',
    "lastUpdated" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
};

/**
 * Ensure all tables exist. ONLY used by /api/seed and /api/debug.
 */
export async function ensureTablesExist() {
  const t0 = Date.now();
  try {
    await Promise.all(
      Object.values(CREATE_TABLES).map((sql) => db.$executeRawUnsafe(sql))
    );
  } catch (e) {
    console.error('[ensureTablesExist] Warning (non-fatal):', e);
  }
  console.log(`[ensureTablesExist] ${Date.now() - t0}ms`);
}

/**
 * Full migration — used ONLY by /api/seed and /api/debug.
 */
export async function ensureMigrated() {
  console.log('[ensureMigrated] Running migration checks...');
  const start = Date.now();

  for (const [table, createSql] of Object.entries(CREATE_TABLES)) {
    try {
      await db.$executeRawUnsafe(createSql);
    } catch {
      // Table likely exists
    }
  }

  try {
    const extraCols = await db.$queryRawUnsafe<{
      table_name: string; column_name: string
    }[]>(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('Project', 'Testimonial', 'Service', 'AboutContent', 'SiteSettings', 'LegalContent')
        AND is_nullable = 'NO'
        AND column_name NOT IN (
          SELECT unnest(ARRAY[
            'id','site','title','location','category','description','image','images','client','order','active','createdAt','updatedAt',
            'quote','name','role',
            'iconKey',
            'paragraph1','paragraph2','paragraph3','statYears','statProjects','statSpecializations','statSatisfaction','statYearsLabel','statProjectsLabel','statSpecLabel','statSatLabel',
            'phone','email','facebook','instagram','linkedin','adminPassword'
          ])
        )
    `);

    for (const { table_name, column_name } of extraCols) {
      console.log(`[ensureMigrated] Fixing extra NOT NULL column: ${table_name}.${column_name}`);
      await db.$executeRawUnsafe(
        `ALTER TABLE "${table_name}" ALTER COLUMN "${column_name}" DROP NOT NULL`
      );
    }
  } catch (e) {
    console.error('[ensureMigrated] Extra column scan failed:', e);
  }

  console.log(`[ensureMigrated] Done in ${Date.now() - start}ms`);
}

