import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding LinkSnip database...');

  // 1. Create Demo User
  const passwordHash = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@linksnip.io' },
    update: {},
    create: {
      email: 'demo@linksnip.io',
      name: 'Alex Johnson',
      passwordHash,
      isEmailVerified: true,
      apiKey: 'ls_live_demo_982347109283419082349',
    },
  });

  console.log(`Created/Found Demo User: ${demoUser.email} (ID: ${demoUser.id})`);

  // 2. Create Tags
  const tagMarketing = await prisma.tag.upsert({
    where: { userId_name: { userId: demoUser.id, name: 'Marketing' } },
    update: {},
    create: { userId: demoUser.id, name: 'Marketing', color: '#18181b' },
  });

  const tagProduct = await prisma.tag.upsert({
    where: { userId_name: { userId: demoUser.id, name: 'Product' } },
    update: {},
    create: { userId: demoUser.id, name: 'Product', color: '#3f3f46' },
  });

  const tagSocial = await prisma.tag.upsert({
    where: { userId_name: { userId: demoUser.id, name: 'Social Media' } },
    update: {},
    create: { userId: demoUser.id, name: 'Social Media', color: '#71717a' },
  });

  // 3. Create Folders
  const folderCampaigns = await prisma.folder.upsert({
    where: { userId_name: { userId: demoUser.id, name: 'Summer Campaign 2026' } },
    update: {},
    create: {
      userId: demoUser.id,
      name: 'Summer Campaign 2026',
      description: 'Promotional links for the Q3 summer sale marketing initiative',
      color: '#18181b',
    },
  });

  const folderDevDocs = await prisma.folder.upsert({
    where: { userId_name: { userId: demoUser.id, name: 'Developer Resources' } },
    update: {},
    create: {
      userId: demoUser.id,
      name: 'Developer Resources',
      description: 'API documentation, SDK guides, and GitHub repositories',
      color: '#3f3f46',
    },
  });

  // 4. Create Sample Links
  const link1 = await prisma.link.upsert({
    where: { shortCode: 'sum26' },
    update: {},
    create: {
      userId: demoUser.id,
      title: 'Summer Launch Sale - 50% Off Everything',
      originalUrl: 'https://github.com/features/actions',
      shortCode: 'sum26',
      customAlias: 'summer-sale',
      redirectType: 302,
      clickCount: 148,
      folderId: folderCampaigns.id,
      tags: {
        create: [{ tagId: tagMarketing.id }, { tagId: tagSocial.id }],
      },
    },
  });

  const link2 = await prisma.link.upsert({
    where: { shortCode: 'gitdocs' },
    update: {},
    create: {
      userId: demoUser.id,
      title: 'Official Documentation & API Reference',
      originalUrl: 'https://docs.github.com/en/rest',
      shortCode: 'gitdocs',
      customAlias: 'api-guide',
      redirectType: 301,
      clickCount: 89,
      folderId: folderDevDocs.id,
      tags: {
        create: [{ tagId: tagProduct.id }],
      },
    },
  });

  const link3 = await prisma.link.upsert({
    where: { shortCode: 'secrpt' },
    update: {},
    create: {
      userId: demoUser.id,
      title: 'Confidential Investor Pitch Deck (Protected)',
      originalUrl: 'https://google.com',
      shortCode: 'secrpt',
      customAlias: 'investor-deck',
      passwordHash: await bcrypt.hash('secret2026', 10),
      redirectType: 302,
      clickCount: 24,
    },
  });

  const link4 = await prisma.link.upsert({
    where: { shortCode: 'flash1' },
    update: {},
    create: {
      userId: demoUser.id,
      title: 'Flash Sale (Expired Link Demo)',
      originalUrl: 'https://news.ycombinator.com',
      shortCode: 'flash1',
      customAlias: 'flash-deal',
      expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Expired 1 day ago
      redirectType: 302,
      clickCount: 50,
      maxClicks: 50,
    },
  });

  // 5. Seed Realistic Click Events for Link 1
  const countries = [
    { country: 'United States', countryCode: 'US', cities: ['San Francisco', 'New York', 'Austin', 'Seattle'] },
    { country: 'United Kingdom', countryCode: 'GB', cities: ['London', 'Manchester', 'Edinburgh'] },
    { country: 'Germany', countryCode: 'DE', cities: ['Berlin', 'Munich', 'Frankfurt'] },
    { country: 'India', countryCode: 'IN', cities: ['Bengaluru', 'Mumbai', 'Delhi'] },
    { country: 'Japan', countryCode: 'JP', cities: ['Tokyo', 'Osaka'] },
    { country: 'Canada', countryCode: 'CA', cities: ['Toronto', 'Vancouver'] },
  ];

  const referrers = [
    { domain: 'Twitter / X', url: 'https://t.co/xyz123' },
    { domain: 'LinkedIn', url: 'https://linkedin.com/feed' },
    { domain: 'Google', url: 'https://google.com/search?q=linksnip' },
    { domain: 'Direct', url: null },
    { domain: 'Reddit', url: 'https://reddit.com/r/technology' },
    { domain: 'GitHub', url: 'https://github.com' },
  ];

  const devices = [
    { type: 'Desktop', os: 'macOS 14.4', browser: 'Chrome 122' },
    { type: 'Desktop', os: 'Windows 11', browser: 'Edge 121' },
    { type: 'Mobile', os: 'iOS 17.3', browser: 'Safari Mobile' },
    { type: 'Mobile', os: 'Android 14', browser: 'Chrome Mobile' },
    { type: 'Tablet', os: 'iPadOS 17', browser: 'Safari' },
  ];

  console.log('Generating realistic analytics click events...');
  const clickEventsData: any[] = [];
  const now = Date.now();

  for (let i = 0; i < 148; i++) {
    // Spread clicks over last 14 days
    const hoursAgo = Math.floor(Math.random() * (14 * 24));
    const timestamp = new Date(now - hoursAgo * 3600 * 1000);

    const c = countries[Math.floor(Math.random() * countries.length)];
    const city = c.cities[Math.floor(Math.random() * c.cities.length)];
    const ref = referrers[Math.floor(Math.random() * referrers.length)];
    const dev = devices[Math.floor(Math.random() * devices.length)];

    clickEventsData.push({
      linkId: link1.id,
      timestamp,
      ipAddress: `192.0.2.${i % 250}`,
      country: c.country,
      countryCode: c.countryCode,
      city,
      referrer: ref.url,
      referrerDomain: ref.domain,
      deviceType: dev.type,
      os: dev.os,
      browser: dev.browser,
      isBot: false,
    });
  }

  // Insert click events
  await prisma.clickEvent.createMany({
    data: clickEventsData,
  });

  console.log(`Database seeded successfully with sample links and ${clickEventsData.length} analytics events!`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
