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
 * Columns the current Prisma schema expects on each table.
 * Any column NOT in this list that exists in the real DB is a leftover
 * from an older schema and must be made nullable so Prisma inserts
 * (which don't include it) don't hit NOT NULL violations.
 */
const KNOWN_COLUMNS: Record<string, string[]> = {
  Project: ['id','site','title','location','category','description','image','images','client','order','active','createdAt','updatedAt'],
  Testimonial: ['id','site','quote','name','role','active','order','createdAt','updatedAt'],
  Service: ['id','site','title','description','iconKey','order','active','createdAt','updatedAt'],
  AboutContent: ['id','paragraph1','paragraph2','paragraph3','statYears','statProjects','statSpecializations','statSatisfaction','statYearsLabel','statProjectsLabel','statSpecLabel','statSatLabel','updatedAt'],
  SiteSettings: ['id','phone','email','location','facebook','instagram','linkedin','adminPassword','updatedAt'],
  LegalContent: ['type','site','content','lastUpdated','createdAt','updatedAt'],
};

/*
 * CREATE TABLE statements — only used when the table doesn't exist yet.
 * Each is a single statement (Prisma prepared statements don't support
 * multiple commands in one call).
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

let _migratedAt = 0;
const MIGRATE_TTL_MS = 60_000; // 60 seconds

/**
 * Fast path for read-only endpoints (content, legal, sitemap).
 * Only runs CREATE TABLE IF NOT EXISTS for all 6 tables —
 * no ALTER COLUMN scans, no information_schema queries.
 * This reduces cold-start queries from ~36 to 6.
 */
export async function ensureTablesExist() {
  const now = Date.now();
  if (now - _migratedAt < MIGRATE_TTL_MS) return;
  for (const createSql of Object.values(CREATE_TABLES)) {
    await db.$executeRawUnsafe(createSql);
  }
  _migratedAt = Date.now();
}

/**
 * Ensure database tables and columns match the current Prisma schema.
 *
 * Strategy:
 * 1. CREATE TABLE IF NOT EXISTS (safe no-op if table exists)
 * 2. ADD COLUMN IF NOT EXISTS for every expected column
 * 3. Query information_schema to find any extra NOT NULL columns
 *    left over from old schemas and make them nullable
 *
 * Cached for 60 seconds per serverless instance to avoid hammering
 * the DB with ~36 raw SQL queries on every single API request.
 * Each statement runs individually (Prisma prepared statements
 * don't support multiple commands in one call).
 */
export async function ensureMigrated() {
  const now = Date.now();
  if (now - _migratedAt < MIGRATE_TTL_MS) return;

  console.log('[ensureMigrated] Running migration checks...');
  const start = Date.now();

  // Step 1 & 2: Create tables and add missing columns
  for (const [table, createSql] of Object.entries(CREATE_TABLES)) {
    await db.$executeRawUnsafe(createSql);

    // Add any missing columns
    const known = KNOWN_COLUMNS[table] || [];
    for (const col of known) {
      // Skip id (primary key) and createdAt/updatedAt (managed by DB defaults)
      if (col === 'id' || col === 'createdAt' || col === 'updatedAt') continue;
      try {
        await db.$executeRawUnsafe(
          `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${col}" TEXT NOT NULL DEFAULT ''`
        );
      } catch {
        // Column might already exist with a different type — that's fine
      }
    }
  }

  // Step 3: Find and fix any extra NOT NULL columns from old schemas
  // These cause "Null constraint violation" when Prisma inserts without them
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
    // Don't throw — this is a best-effort cleanup
  }

  _migratedAt = Date.now();
  console.log(`[ensureMigrated] Done in ${Date.now() - start}ms`);
}
