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

/** Auto-migrate: add missing columns if needed (runs once per cold start) */
let _migrated = false;
export async function ensureMigrated() {
  if (_migrated) return;
  _migrated = true;
  try {
    await db.$executeRawUnsafe(
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Project' AND column_name = 'location') THEN
          ALTER TABLE "Project" ADD COLUMN "location" TEXT NOT NULL DEFAULT '';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Project' AND column_name = 'active') THEN
          ALTER TABLE "Project" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Project' AND column_name = 'site') THEN
          ALTER TABLE "Project" ADD COLUMN "site" TEXT NOT NULL DEFAULT 'elux-design';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Testimonial' AND column_name = 'site') THEN
          ALTER TABLE "Testimonial" ADD COLUMN "site" TEXT NOT NULL DEFAULT 'elux-design';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Service' AND column_name = 'site') THEN
          ALTER TABLE "Service" ADD COLUMN "site" TEXT NOT NULL DEFAULT 'elux-design';
        END IF;
        -- Backfill existing rows that have no site value
        UPDATE "Project" SET "site" = 'elux-design' WHERE "site" IS NULL OR "site" = '';
        UPDATE "Testimonial" SET "site" = 'elux-design' WHERE "site" IS NULL OR "site" = '';
        UPDATE "Service" SET "site" = 'elux-design' WHERE "site" IS NULL OR "site" = '';
      END $$;`
    );
  } catch (e) {
    _migrated = false; // allow retry
    console.error('Auto-migration check failed:', e);
  }
}
