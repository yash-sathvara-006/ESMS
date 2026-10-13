import { seedDatabase } from '../src/db/seed';
import prisma from '../src/db/prisma';

seedDatabase(10000)
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
