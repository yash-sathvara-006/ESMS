import prisma from './prisma';
import crypto from 'crypto';

// Deterministic Pseudo-Random Number Generator (Mulberry32) for reproducible data
function createPRNG(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createPRNG(42);

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(random() * array.length)]!;
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

// Global realistic name pools
const FIRST_NAMES = [
  'Aarav', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Lucas', 'Mia',
  'Mason', 'Isabella', 'Oliver', 'Amelia', 'Elijah', 'Harper', 'Aiden', 'Evelyn', 'James', 'Abigail',
  'Priya', 'Rohan', 'Ananya', 'Vikram', 'Neha', 'Arjun', 'Sneha', 'Aditya', 'Pooja', 'Karan',
  'Hans', 'Greta', 'Lukas', 'Clara', 'Felix', 'Hannah', 'Maximilian', 'Lena', 'Jonas', 'Laura',
  'Kenji', 'Yuki', 'Hiroshi', 'Aoi', 'Ren', 'Hina', 'Takumi', 'Yui', 'Souta', 'Sakura',
  'Chloe', 'Liam', 'Arthur', 'Manon', 'Louis', 'Camille', 'Gabriel', 'Lea', 'Jules', 'Sarah'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Sharma', 'Patel', 'Verma', 'Gupta', 'Mehta', 'Sathvara', 'Reddy', 'Singh', 'Deshmukh', 'Joshi',
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
  'Tanaka', 'Sato', 'Suzuki', 'Takahashi', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato',
  'Dubois', 'Laurent', 'Moreau', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand'
];

const GENDERS = ['MALE', 'FEMALE', 'MALE', 'FEMALE', 'NON_BINARY']; // ~48% F, 48% M, 4% NB

export const COUNTRIES_DATA = [
  { code: 'US', name: 'United States', currency: 'USD', exchangeRateToUSD: 1.0, minBase: 65000, maxBase: 195000 },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', exchangeRateToUSD: 1.28, minBase: 42000, maxBase: 125000 },
  { code: 'IN', name: 'India', currency: 'INR', exchangeRateToUSD: 0.012, minBase: 600000, maxBase: 3600000 },
  { code: 'DE', name: 'Germany', currency: 'EUR', exchangeRateToUSD: 1.08, minBase: 52000, maxBase: 135000 },
  { code: 'SG', name: 'Singapore', currency: 'SGD', exchangeRateToUSD: 0.74, minBase: 72000, maxBase: 195000 },
  { code: 'CA', name: 'Canada', currency: 'CAD', exchangeRateToUSD: 0.73, minBase: 68000, maxBase: 165000 },
  { code: 'JP', name: 'Japan', currency: 'JPY', exchangeRateToUSD: 0.0065, minBase: 5800000, maxBase: 16500000 },
  { code: 'AU', name: 'Australia', currency: 'AUD', exchangeRateToUSD: 0.65, minBase: 78000, maxBase: 185000 }
];

export const DEPARTMENTS_DATA = [
  { code: 'ENG', name: 'Engineering' },
  { code: 'PROD', name: 'Product Management' },
  { code: 'SALES', name: 'Sales & BD' },
  { code: 'MKT', name: 'Marketing' },
  { code: 'HR', name: 'Human Resources' },
  { code: 'FIN', name: 'Finance & Accounting' },
  { code: 'OPS', name: 'Operations' },
  { code: 'LEG', name: 'Legal & Compliance' }
];

function generatePhoneNumber(countryCode: string): string {
  switch (countryCode) {
    case 'US':
      return `+1-555-${Math.floor(100 + random() * 900)}-${Math.floor(1000 + random() * 9000)}`;
    case 'GB':
      return `+44-7${Math.floor(100000000 + random() * 900000000)}`;
    case 'IN':
      return `+91-${Math.floor(6000000000 + random() * 4000000000)}`;
    case 'DE':
      return `+49-15${Math.floor(10000000 + random() * 90000000)}`;
    case 'SG':
      return `+65-${Math.floor(80000000 + random() * 20000000)}`;
    case 'CA':
      return `+1-416-${Math.floor(100 + random() * 900)}-${Math.floor(1000 + random() * 9000)}`;
    case 'JP':
      return `+81-90-${Math.floor(1000 + random() * 9000)}-${Math.floor(1000 + random() * 9000)}`;
    case 'AU':
      return `+61-4${Math.floor(10000000 + random() * 90000000)}`;
    default:
      return `+1-${Math.floor(1000000000 + random() * 9000000000)}`;
  }
}

export async function seedDatabase(totalEmployees = 10000) {
  console.log(`\n🌱 Starting high-speed seed for ${totalEmployees} employees...`);
  const startTime = Date.now();

  // 1. Clean existing records in referential order
  await prisma.salaryAuditLog.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.country.deleteMany();

  // 2. Insert Master Departments
  console.log('📌 Seeding 8 Departments...');
  const createdDepartments = await Promise.all(
    DEPARTMENTS_DATA.map((dept) =>
      prisma.department.create({
        data: {
          id: crypto.randomUUID(),
          code: dept.code,
          name: dept.name
        }
      })
    )
  );

  // 3. Insert Master Countries
  console.log('📌 Seeding 8 Global Jurisdictions with Native Currencies...');
  const createdCountries = await Promise.all(
    COUNTRIES_DATA.map((country) =>
      prisma.country.create({
        data: {
          id: crypto.randomUUID(),
          code: country.code,
          name: country.name,
          currency: country.currency,
          exchangeRateToUSD: country.exchangeRateToUSD
        }
      })
    )
  );

  // Country metadata lookup map
  const countryMap = new Map(
    COUNTRIES_DATA.map((c) => {
      const dbCountry = createdCountries.find((item) => item.code === c.code)!;
      return [dbCountry.id, { ...c, dbId: dbCountry.id }];
    })
  );

  // 4. Generate 10,000 Employees and Salaries in memory
  console.log(`⚡ Generating ${totalEmployees} realistic records in memory...`);
  const employeesToInsert: any[] = [];
  const salariesToInsert: any[] = [];

  const startDate = new Date('2021-01-01').getTime();
  const endDate = new Date('2026-02-01').getTime();

  for (let i = 1; i <= totalEmployees; i++) {
    const employeeId = crypto.randomUUID();
    const salaryId = crypto.randomUUID();

    const countryDb = getRandomItem(createdCountries);
    const countryInfo = countryMap.get(countryDb.id)!;
    const departmentDb = getRandomItem(createdDepartments);

    const firstName = getRandomItem(FIRST_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    const gender = getRandomItem(GENDERS);

    // Format: EMP-00001 to EMP-10000
    const employeeCode = `EMP-${String(i).padStart(5, '0')}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@organization.com`;

    // Random hire date between 2021 and 2026
    const hireDate = new Date(startDate + random() * (endDate - startDate));

    // Base salary in native currency
    const baseSalary = getRandomNumber(countryInfo.minBase, countryInfo.maxBase);

    // Bonus: 5% - 20%
    const bonusPercentage = getRandomNumber(5, 20) / 100;
    const bonus = Math.round(baseSalary * bonusPercentage);

    // Deductions: 10% - 25% (Taxes, pension, insurance)
    const deductionPercentage = getRandomNumber(10, 25) / 100;
    const deductions = Math.round(baseSalary * deductionPercentage);

    const netSalary = baseSalary + bonus - deductions;

    employeesToInsert.push({
      id: employeeId,
      employeeCode,
      firstName,
      lastName,
      email,
      phone: generatePhoneNumber(countryInfo.code),
      gender,
      hireDate,
      status: 'ACTIVE',
      departmentId: departmentDb.id,
      countryId: countryDb.id,
      createdAt: hireDate,
      updatedAt: hireDate
    });

    salariesToInsert.push({
      id: salaryId,
      employeeId,
      baseSalary,
      bonus,
      deductions,
      netSalary,
      currency: countryInfo.currency,
      effectiveDate: hireDate,
      isCurrent: true,
      createdAt: hireDate,
      updatedAt: hireDate
    });
  }

  // 5. Batch Insert in Chunks of 1,000 using Transactions
  console.log('🚀 Batch inserting into SQLite database...');
  const CHUNK_SIZE = 1000;
  for (let i = 0; i < totalEmployees; i += CHUNK_SIZE) {
    const empChunk = employeesToInsert.slice(i, i + CHUNK_SIZE);
    const salChunk = salariesToInsert.slice(i, i + CHUNK_SIZE);

    await prisma.$transaction([
      prisma.employee.createMany({ data: empChunk }),
      prisma.salary.createMany({ data: salChunk })
    ]);

    const percent = Math.round(((i + CHUNK_SIZE) / totalEmployees) * 100);
    process.stdout.write(`\r  -> Seeded ${Math.min(i + CHUNK_SIZE, totalEmployees)} / ${totalEmployees} (${percent}%)`);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n\n✅ Seeding complete in ${durationSec} seconds!`);

  // Verification Summary
  const countEmployees = await prisma.employee.count();
  const countSalaries = await prisma.salary.count();
  const countCountries = await prisma.country.count();
  const countDepts = await prisma.department.count();

  console.log('───────────────────────────────────────────────────');
  console.log(`📊 DATABASE AUDIT VERIFICATION:`);
  console.log(`   • Total Employees:  ${countEmployees.toLocaleString()}`);
  console.log(`   • Total Salaries:   ${countSalaries.toLocaleString()}`);
  console.log(`   • Countries:        ${countCountries}`);
  console.log(`   • Departments:      ${countDepts}`);
  console.log('───────────────────────────────────────────────────\n');

  return {
    employeesCount: countEmployees,
    salariesCount: countSalaries,
    countriesCount: countCountries,
    departmentsCount: countDepts,
    durationSec
  };
}

// Standalone execution check
if (require.main === module) {
  seedDatabase(10000)
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
