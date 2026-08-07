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

/** Auto-migrate: add missing columns & fix types if needed (runs once per cold start) */
let _migrated = false;
export async function ensureMigrated() {
  if (_migrated) return;
  _migrated = true;
  try {
    await db.$executeRawUnsafe(
      `DO $$ BEGIN
        -- Add images column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Project' AND column_name = 'images') THEN
          ALTER TABLE "Project" ADD COLUMN "images" TEXT[] DEFAULT '{}';
        END IF;
        -- Convert images from TEXT to TEXT[] if it's the wrong type
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'Project' AND column_name = 'images' AND data_type = 'text'
        ) THEN
          ALTER TABLE "Project" ALTER COLUMN "images" TYPE TEXT[] USING
            CASE
              WHEN "images" IS NULL THEN '{}'
              WHEN "images"::text = '' THEN '{}'
              ELSE ARRAY["images"::text]
            END;
          ALTER TABLE "Project" ALTER COLUMN "images" SET DEFAULT '{}';
        END IF;
        -- Add location column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Project' AND column_name = 'location') THEN
          ALTER TABLE "Project" ADD COLUMN "location" TEXT NOT NULL DEFAULT '';
        END IF;
        -- Add active column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Project' AND column_name = 'active') THEN
          ALTER TABLE "Project" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
        END IF;
      END $$;`
    );
  } catch (e) {
    _migrated = false; // allow retry
    console.error('Auto-migration check failed:', e);
  }
}
