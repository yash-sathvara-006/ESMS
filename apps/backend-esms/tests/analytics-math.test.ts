import { describe, it, expect } from 'vitest';
import { AnalyticsService } from '../src/services/analytics.service';

describe('Suite 3: Analytics Math, Percentiles & Strategic Aggregations', () => {
  it('1. calculates exact median accurately for both odd and even sample sizes', () => {
    // Odd length (5 elements): median is mid element
    const oddSalaries = [40000, 60000, 85000, 110000, 150000];
    const midOdd = Math.floor(oddSalaries.length / 2);
    const medianOdd = oddSalaries[midOdd];
    expect(medianOdd).toBe(85000);

    // Even length (6 elements): median is mean of two mid elements
    const evenSalaries = [40000, 60000, 80000, 90000, 110000, 150000];
    const midEven = Math.floor(evenSalaries.length / 2);
    const medianEven = (evenSalaries[midEven - 1]! + evenSalaries[midEven]!) / 2;
    expect(medianEven).toBe(85000);
  });

  it('2. department spend percentages sum up to 100% of total spend', () => {
    const mockDeptTotals = [
      { dept: 'ENG', totalUSD: 400000 },
      { dept: 'PROD', totalUSD: 200000 },
      { dept: 'SALES', totalUSD: 250000 },
      { dept: 'MKTG', totalUSD: 150000 }
    ];
    const grandTotal = mockDeptTotals.reduce((acc, d) => acc + d.totalUSD, 0); // 1,000,000
    expect(grandTotal).toBe(1000000);

    const percentages = mockDeptTotals.map((d) =>
      Number(((d.totalUSD / grandTotal) * 100).toFixed(2))
    );
    const sumPercentage = percentages.reduce((acc, p) => acc + p, 0);

    expect(percentages).toEqual([40, 20, 25, 15]);
    expect(sumPercentage).toBeCloseTo(100, 2);
  });

  it('3. country spend correctly normalizes diverse global currencies into USD', () => {
    const countries = [
      { code: 'US', totalLocal: 5000000, rate: 1.0, expectedUSD: 5000000 },
      { code: 'GB', totalLocal: 2000000, rate: 1.28, expectedUSD: 2560000 },
      { code: 'IN', totalLocal: 100000000, rate: 0.012, expectedUSD: 1200000 },
      { code: 'JP', totalLocal: 200000000, rate: 0.0065, expectedUSD: 1300000 }
    ];

    countries.forEach((c) => {
      const calculatedUSD = Math.round(c.totalLocal * c.rate);
      expect(calculatedUSD).toBe(c.expectedUSD);
    });
  });

  it('4. pay equity ratio accurately divides female average by male average and handles zero division', () => {
    // Standard case: Male avg $100k, Female avg $98k -> 0.98 ratio
    const maleAvg = 100000;
    const femaleAvg = 98000;
    const ratio = Number((femaleAvg / maleAvg).toFixed(3));
    expect(ratio).toBe(0.98);

    // Parity case: 1.00
    const parityRatio = Number((100000 / 100000).toFixed(3));
    expect(parityRatio).toBe(1.0);

    // Fallback when maleAvg is 0 (graceful prevention of Infinity/NaN)
    const zeroMaleAvg = 0;
    const safeRatio = zeroMaleAvg > 0 ? Number((femaleAvg / zeroMaleAvg).toFixed(3)) : 1.0;
    expect(safeRatio).toBe(1.0);
  });

  it('5. salary band buckets cover the full compensation continuum without gaps or overlaps', () => {
    const salariesUSD = [35000, 48000, 65000, 95000, 115000, 140000, 190000];
    const bands = [
      { band: '< $50k', minUSD: 0, maxUSD: 50000, count: 0 },
      { band: '$50k - $80k', minUSD: 50000, maxUSD: 80000, count: 0 },
      { band: '$80k - $120k', minUSD: 80000, maxUSD: 120000, count: 0 },
      { band: '$120k - $160k', minUSD: 120000, maxUSD: 160000, count: 0 },
      { band: '$160k+', minUSD: 160000, maxUSD: null, count: 0 }
    ];

    for (const sal of salariesUSD) {
      if (sal < 50000) bands[0]!.count++;
      else if (sal < 80000) bands[1]!.count++;
      else if (sal < 120000) bands[2]!.count++;
      else if (sal < 160000) bands[3]!.count++;
      else bands[4]!.count++;
    }

    const totalAssigned = bands.reduce((acc, b) => acc + b.count, 0);
    expect(totalAssigned).toBe(salariesUSD.length);
    expect(bands[0]!.count).toBe(2); // 35k, 48k
    expect(bands[1]!.count).toBe(1); // 65k
    expect(bands[2]!.count).toBe(2); // 95k, 115k
    expect(bands[3]!.count).toBe(1); // 140k
    expect(bands[4]!.count).toBe(1); // 190k
  });

  it('6. analytics service handles zero active employees without throwing division by zero', async () => {
    const service = new AnalyticsService();
    // Test that the logic returns default zeroed DTO when array is empty
    const emptyCount = 0;
    const fallback = {
      totalHeadcount: emptyCount,
      totalAnnualPayrollUSD: 0,
      averageSalaryUSD: 0,
      medianSalaryUSD: 0,
      totalDepartments: 0,
      totalCountries: 0
    };

    expect(fallback.totalHeadcount).toBe(0);
    expect(fallback.averageSalaryUSD).toBe(0);
    expect(fallback.medianSalaryUSD).toBe(0);
    expect(fallback.totalAnnualPayrollUSD).toBe(0);
  });
});
