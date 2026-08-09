const { PrismaClient } = require('@prisma/client');
const url = process.env.DATABASE_URL.replace(/channel_binding=[^&]*&?/g, '').replace(/[?&]$/, '');
const db = new PrismaClient({ datasourceUrl: url });

async function seed() {
  console.log('Seeding database...');

  // Create site settings with default password
  await db.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      phone: '+679 000 0000',
      email: 'hello@eluxdesign.com',
      location: 'Nadi, Fiji',
      facebook: 'https://facebook.com/EluxDesign',
      instagram: 'https://instagram.com/EluxDesign',
      linkedin: '',
      adminPassword: 'elux2026',
    },
  });
  console.log('SiteSettings created.');

  // Create about content
  await db.aboutContent.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main' },
  });
  console.log('AboutContent created.');

  // Create seed testimonials
  const testimonials = [
    { id: 'seed-t-1', quote: 'Elux Design transformed our vision of a waterfront dream home into a reality that exceeded every expectation. The 3D walkthrough alone saved us from costly design changes before construction even began. Their understanding of Fiji\'s climate and materials is unmatched in the region.', name: 'James & Sarah Mitchell', role: 'Homeowners, Fantasy Island Villa', active: true, order: 0 },
    { id: 'seed-t-2', quote: 'Working with Elux Design was a seamless experience from concept to completion. Their project oversight meant we never had to worry about coordination between contractors and designers. The final result is a home that feels both luxurious and deeply connected to its surroundings.', name: 'Rajesh Kumar', role: 'Property Developer, Lautoka', active: true, order: 1 },
    { id: 'seed-t-3', quote: 'The refurbishment of our Coral Coast property was handled with remarkable sensitivity to its original character while bringing it firmly into the 21st century. The sustainable design elements have reduced our energy costs significantly. We could not be happier with the outcome.', name: 'Dr. Emily Chen', role: 'Homeowner, Coral Coast Estate', active: true, order: 2 },
  ];
  for (const t of testimonials) {
    await db.testimonial.upsert({ where: { id: t.id }, update: {}, create: t });
  }
  console.log('Testimonials created:', testimonials.length);

  // Create seed services
  const services = [
    { id: 'seed-s-1', title: 'Building Design', description: 'Comprehensive architectural design services tailored to Fiji\'s tropical climate and your unique vision, from concept to detailed construction drawings.', iconKey: 'building', active: true, order: 0 },
    { id: 'seed-s-2', title: '3D Visualization', description: 'Photorealistic 3D renders and immersive walkthroughs that bring your project to life before a single foundation is poured.', iconKey: 'cube', active: true, order: 1 },
    { id: 'seed-s-3', title: 'Project Oversight', description: 'End-to-end project management ensuring design intent is preserved through every phase of construction.', iconKey: 'eye', active: true, order: 2 },
  ];
  for (const s of services) {
    await db.service.upsert({ where: { id: s.id }, update: {}, create: s });
  }
  console.log('Services created:', services.length);

  // Create seed projects
  const projects = [
    { id: 'seed-p-1', title: 'Fantasy Island Villa', location: 'Fantasy Island, Fiji', category: 'Luxury Waterfront Residence', description: 'A stunning overwater villa featuring expansive glass walls that blur the line between interior and Pacific Ocean. Sustainable timber construction with solar integration.', image: '/project-1.png', active: true, order: 0 },
    { id: 'seed-p-2', title: 'Coral Coast Estate', location: 'Coral Coast, Fiji', category: 'Residential Estate', description: 'A luxury estate harmonizing traditional Fijian design with modern tropical architecture, featuring open-air living spaces and a resort-style pool pavilion.', image: '/project-2.png', active: true, order: 1 },
    { id: 'seed-p-3', title: 'Port Denarau Commercial', location: 'Denarau, Fiji', category: 'Commercial Complex', description: 'A mixed-use commercial development featuring retail spaces, office suites, and waterfront dining, all designed to capture Fiji\'s spectacular sunsets.', image: '/project-3.png', active: true, order: 2 },
    { id: 'seed-p-4', title: 'Pacific Heights Residence', location: 'Suva, Fiji', category: 'Modern Residence', description: 'A contemporary hillside residence with panoramic ocean views, featuring cantilevered decks and a rainwater harvesting system.', image: '/project-4.png', active: true, order: 3 },
  ];
  for (const p of projects) {
    await db.project.upsert({ where: { id: p.id }, update: {}, create: p });
  }
  console.log('Projects created:', projects.length);

  console.log('\nSeed complete!');
  await db.$disconnect();
}

seed().catch(e => { console.error('Seed error:', e); process.exit(1); });
