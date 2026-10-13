import prisma from './prisma';
import { seedDatabase } from './seed';

export async function bootstrapDatabase(): Promise<void> {
  try {
    const isAutoSeedEnabled = process.env.AUTO_SEED !== 'false';
    const targetCount = parseInt(process.env.SEED_EMPLOYEE_COUNT || '10000', 10);

    const employeeCount = await prisma.employee.count();

    if (employeeCount === 0 && isAutoSeedEnabled) {
      console.log('⚡ [Auto-Bootstrap] Database is currently empty.');
      console.log(`⚡ [Auto-Bootstrap] Auto-seeding ${targetCount.toLocaleString()} employees for zero-configuration startup...`);
      await seedDatabase(targetCount);
      console.log('⚡ [Auto-Bootstrap] Auto-seed successfully completed!');
    } else {
      console.log(`ℹ️ [Database] Verified existing dataset with ${employeeCount.toLocaleString()} employees.`);
    }
  } catch (error) {
    console.error('❌ [Auto-Bootstrap] Error verifying or seeding database:', error);
  }
}
