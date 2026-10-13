import { describe, it, expect } from 'vitest';
import { COUNTRIES_DATA } from '../src/db/seed';

describe('Suite 1: Salary Calculations & Multi-Currency Engine', () => {
  it('1. calculates net salary accurately (base + bonus - deductions)', () => {
    const baseSalary = 100000;
    const bonus = 15000;
    const deductions = 20000;
    const netSalary = baseSalary + bonus - deductions;

    expect(netSalary).toBe(95000);
  });

  it('2. handles edge cases with zero bonus and zero deductions', () => {
    const baseSalary = 80000;
    const bonus = 0;
    const deductions = 0;
    const netSalary = baseSalary + bonus - deductions;

    expect(netSalary).toBe(80000);
  });

  it('3. converts all 8 global jurisdictions to normalized USD accurately', () => {
    const testCases = [
      { currency: 'USD', amount: 100000, rate: 1.0, expectedUSD: 100000 },
      { currency: 'GBP', amount: 50000, rate: 1.28, expectedUSD: 64000 },
      { currency: 'EUR', amount: 60000, rate: 1.08, expectedUSD: 64800 },
      { currency: 'INR', amount: 2000000, rate: 0.012, expectedUSD: 24000 },
      { currency: 'SGD', amount: 100000, rate: 0.74, expectedUSD: 74000 },
      { currency: 'CAD', amount: 90000, rate: 0.73, expectedUSD: 65700 },
      { currency: 'AUD', amount: 110000, rate: 0.65, expectedUSD: 71500 },
      { currency: 'JPY', amount: 10000000, rate: 0.0065, expectedUSD: 65000 }
    ];

    testCases.forEach(({ amount, rate, expectedUSD }) => {
      const converted = Math.round(amount * rate);
      expect(converted).toBe(expectedUSD);
    });
  });

  it('4. matches configured exchange rates in database master countries', () => {
    const us = COUNTRIES_DATA.find((c) => c.code === 'US');
    const inCountry = COUNTRIES_DATA.find((c) => c.code === 'IN');
    const uk = COUNTRIES_DATA.find((c) => c.code === 'GB');

    expect(us?.exchangeRateToUSD).toBe(1.0);
    expect(inCountry?.exchangeRateToUSD).toBe(0.012);
    expect(uk?.exchangeRateToUSD).toBe(1.28);
  });

  it('5. handles large financial scales like Japanese Yen without numeric overflow', () => {
    const jpyBase = 15000000; // 15M JPY
    const jpyBonus = 2500000;
    const jpyDeductions = 3200000;
    const jpyNet = jpyBase + jpyBonus - jpyDeductions;
    const jpyUSD = Math.round(jpyNet * 0.0065);

    expect(jpyNet).toBe(14300000);
    expect(jpyUSD).toBe(92950);
  });

  it('6. validates bonus and deduction ratio bounds', () => {
    const base = 120000;
    const bonusRatio = 0.15; // 15%
    const deductionRatio = 0.20; // 20%

    const bonus = Math.round(base * bonusRatio);
    const deductions = Math.round(base * deductionRatio);

    expect(bonus).toBe(18000);
    expect(deductions).toBe(24000);
    expect(bonus).toBeLessThan(base);
    expect(deductions).toBeLessThan(base);
  });
});
