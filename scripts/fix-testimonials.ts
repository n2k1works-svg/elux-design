import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  // Check current state
  const all = await db.testimonial.findMany({ where: { site: 'elux-design' } });
  console.log('All testimonials:', JSON.stringify(all, null, 2));
  
  // Activate all
  const result = await db.testimonial.updateMany({
    where: { site: 'elux-design', active: false },
    data: { active: true },
  });
  console.log(`Activated ${result.count} testimonials`);
}

main().catch(console.error).finally(() => db.$disconnect());
