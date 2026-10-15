import prisma from '../db/prisma';
import {
  AnalyticsSummaryDTO,
  DepartmentSpendDTO,
  CountrySpendDTO,
  PayEquityDTO,
  SalaryBandDTO,
  AnalyticsTimeframeDTO
} from 'shared-types';

export interface AnalyticsFilterOptions {
  year?: number;
  month?: number;
}

export class AnalyticsService {
  /**
   * Returns available years and current month/year based on employee hire dates in the DB
   */
  async getTimeframe(): Promise<AnalyticsTimeframeDTO> {
    const oldest = await prisma.employee.findFirst({
      orderBy: { hireDate: 'asc' },
      select: { hireDate: true }
    });
    const newest = await prisma.employee.findFirst({
      orderBy: { hireDate: 'desc' },
      select: { hireDate: true }
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    const minYear = oldest?.hireDate ? oldest.hireDate.getFullYear() : 2021;
    const maxYear = Math.max(newest?.hireDate ? newest.hireDate.getFullYear() : currentYear, currentYear);

    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }

    return {
      years,
      currentYear,
      currentMonth,
      minYear,
      maxYear
    };
  }

  /**
   * Helper: Fetches all active employees with their current salary, country, and department
   * Optionally filtered by year and month (hireDate <= target month/year)
   */
  private async getActiveEmployeesWithSalaries(filter?: AnalyticsFilterOptions) {
    let hireDateFilter: any = undefined;

    if (filter?.year) {
      const year = filter.year;
      const month = filter.month; // 1-12 or undefined
      let asOfDate: Date;

      if (month && month >= 1 && month <= 12) {
        asOfDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      } else {
        asOfDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
      }

      hireDateFilter = { lte: asOfDate };
    }

    return prisma.employee.findMany({
      where: {
        status: 'ACTIVE',
        ...(hireDateFilter ? { hireDate: hireDateFilter } : {})
      },
      select: {
        id: true,
        gender: true,
        departmentId: true,
        department: {
          select: { id: true, code: true, name: true }
        },
        countryId: true,
        country: {
          select: { id: true, code: true, name: true, currency: true, exchangeRateToUSD: true }
        },
        salaries: {
          where: { isCurrent: true },
          select: { baseSalary: true, netSalary: true, bonus: true, currency: true },
          take: 1
        }
      }
    });
  }

  /**
   * 1. Executive Summary KPIs: Total spend, average, median, headcount
   */
  async getSummary(filter?: AnalyticsFilterOptions): Promise<AnalyticsSummaryDTO> {
    const employees = await this.getActiveEmployeesWithSalaries(filter);
    const totalHeadcount = employees.length;

    if (totalHeadcount === 0) {
      return {
        totalHeadcount: 0,
        totalAnnualPayrollUSD: 0,
        averageSalaryUSD: 0,
        medianSalaryUSD: 0,
        totalDepartments: 0,
        totalCountries: 0
      };
    }

    const usdSalaries: number[] = [];
    let totalPayrollUSD = 0;
    const departmentIds = new Set<string>();
    const countryIds = new Set<string>();

    for (const emp of employees) {
      departmentIds.add(emp.departmentId);
      countryIds.add(emp.countryId);

      const salary = emp.salaries[0];
      if (salary) {
        const rate = emp.country.exchangeRateToUSD;
        const baseUSD = salary.baseSalary * rate;
        usdSalaries.push(baseUSD);
        totalPayrollUSD += baseUSD;
      }
    }

    // Sort to calculate exact median
    usdSalaries.sort((a, b) => a - b);
    const mid = Math.floor(usdSalaries.length / 2);
    const medianSalaryUSD =
      usdSalaries.length % 2 !== 0
        ? usdSalaries[mid]!
        : ((usdSalaries[mid - 1]! + usdSalaries[mid]!) / 2);

    return {
      totalHeadcount,
      totalAnnualPayrollUSD: Math.round(totalPayrollUSD),
      averageSalaryUSD: Math.round(totalPayrollUSD / (usdSalaries.length || 1)),
      medianSalaryUSD: Math.round(medianSalaryUSD || 0),
      totalDepartments: departmentIds.size,
      totalCountries: countryIds.size
    };
  }

  /**
   * 2. Department Breakdown: Which department spends the most and what are their salary spreads?
   */
  async getDepartmentSpend(filter?: AnalyticsFilterOptions): Promise<DepartmentSpendDTO[]> {
    const employees = await this.getActiveEmployeesWithSalaries(filter);
    const deptMap = new Map<
      string,
      {
        id: string;
        code: string;
        name: string;
        headcount: number;
        totalUSD: number;
        salariesUSD: number[];
      }
    >();

    let grandTotalUSD = 0;

    for (const emp of employees) {
      if (!deptMap.has(emp.departmentId)) {
        deptMap.set(emp.departmentId, {
          id: emp.department.id,
          code: emp.department.code,
          name: emp.department.name,
          headcount: 0,
          totalUSD: 0,
          salariesUSD: []
        });
      }

      const item = deptMap.get(emp.departmentId)!;
      item.headcount += 1;

      const sal = emp.salaries[0];
      if (sal) {
        const salUSD = sal.baseSalary * emp.country.exchangeRateToUSD;
        item.totalUSD += salUSD;
        item.salariesUSD.push(salUSD);
        grandTotalUSD += salUSD;
      }
    }

    const results: DepartmentSpendDTO[] = [];
    for (const d of deptMap.values()) {
      const min = d.salariesUSD.length > 0 ? Math.min(...d.salariesUSD) : 0;
      const max = d.salariesUSD.length > 0 ? Math.max(...d.salariesUSD) : 0;
      const avg = d.headcount > 0 ? d.totalUSD / d.headcount : 0;
      const percentage = grandTotalUSD > 0 ? (d.totalUSD / grandTotalUSD) * 100 : 0;

      results.push({
        departmentId: d.id,
        departmentCode: d.code,
        departmentName: d.name,
        headcount: d.headcount,
        totalPayrollUSD: Math.round(d.totalUSD),
        averageSalaryUSD: Math.round(avg),
        minSalaryUSD: Math.round(min),
        maxSalaryUSD: Math.round(max),
        percentageOfTotalSpend: Number(percentage.toFixed(2))
      });
    }

    return results.sort((a, b) => b.totalPayrollUSD - a.totalPayrollUSD);
  }

  /**
   * 3. Country Breakdown: How much does the organization pay in each global jurisdiction?
   */
  async getCountrySpend(filter?: AnalyticsFilterOptions): Promise<CountrySpendDTO[]> {
    const employees = await this.getActiveEmployeesWithSalaries(filter);
    const countryMap = new Map<
      string,
      {
        id: string;
        code: string;
        name: string;
        currency: string;
        rate: number;
        headcount: number;
        totalLocal: number;
        totalUSD: number;
      }
    >();

    let grandTotalUSD = 0;

    for (const emp of employees) {
      if (!countryMap.has(emp.countryId)) {
        countryMap.set(emp.countryId, {
          id: emp.country.id,
          code: emp.country.code,
          name: emp.country.name,
          currency: emp.country.currency,
          rate: emp.country.exchangeRateToUSD,
          headcount: 0,
          totalLocal: 0,
          totalUSD: 0
        });
      }

      const item = countryMap.get(emp.countryId)!;
      item.headcount += 1;

      const sal = emp.salaries[0];
      if (sal) {
        const salUSD = sal.baseSalary * item.rate;
        item.totalLocal += sal.baseSalary;
        item.totalUSD += salUSD;
        grandTotalUSD += salUSD;
      }
    }

    const results: CountrySpendDTO[] = [];
    for (const c of countryMap.values()) {
      const avgUSD = c.headcount > 0 ? c.totalUSD / c.headcount : 0;
      const percentage = grandTotalUSD > 0 ? (c.totalUSD / grandTotalUSD) * 100 : 0;

      results.push({
        countryId: c.id,
        countryCode: c.code,
        countryName: c.name,
        currency: c.currency,
        exchangeRateToUSD: c.rate,
        headcount: c.headcount,
        totalPayrollLocalCurrency: Math.round(c.totalLocal),
        totalPayrollUSD: Math.round(c.totalUSD),
        averageSalaryUSD: Math.round(avgUSD),
        percentageOfTotalSpend: Number(percentage.toFixed(2))
      });
    }

    return results.sort((a, b) => b.totalPayrollUSD - a.totalPayrollUSD);
  }

  /**
   * 4. Pay Equity Insights: Gender compensation comparison per department
   */
  async getPayEquity(filter?: AnalyticsFilterOptions): Promise<PayEquityDTO[]> {
    const employees = await this.getActiveEmployeesWithSalaries(filter);
    const equityMap = new Map<
      string,
      {
        id: string;
        name: string;
        males: number[];
        females: number[];
        others: number[];
      }
    >();

    for (const emp of employees) {
      if (!equityMap.has(emp.departmentId)) {
        equityMap.set(emp.departmentId, {
          id: emp.department.id,
          name: emp.department.name,
          males: [],
          females: [],
          others: []
        });
      }

      const dept = equityMap.get(emp.departmentId)!;
      const sal = emp.salaries[0];
      if (sal) {
        const salUSD = sal.baseSalary * emp.country.exchangeRateToUSD;
        if (emp.gender === 'MALE') dept.males.push(salUSD);
        else if (emp.gender === 'FEMALE') dept.females.push(salUSD);
        else dept.others.push(salUSD);
      }
    }

    const results: PayEquityDTO[] = [];
    for (const d of equityMap.values()) {
      const maleAvg = d.males.length > 0 ? d.males.reduce((a, b) => a + b, 0) / d.males.length : 0;
      const femaleAvg = d.females.length > 0 ? d.females.reduce((a, b) => a + b, 0) / d.females.length : 0;
      const nbAvg = d.others.length > 0 ? d.others.reduce((a, b) => a + b, 0) / d.others.length : 0;
      const ratio = maleAvg > 0 ? Number((femaleAvg / maleAvg).toFixed(3)) : 1.0;

      results.push({
        departmentId: d.id,
        departmentName: d.name,
        maleAvgUSD: Math.round(maleAvg),
        maleCount: d.males.length,
        femaleAvgUSD: Math.round(femaleAvg),
        femaleCount: d.females.length,
        nonBinaryAvgUSD: Math.round(nbAvg),
        nonBinaryCount: d.others.length,
        genderPayRatio: ratio
      });
    }

    return results.sort((a, b) => a.departmentName.localeCompare(b.departmentName));
  }

  /**
   * 5. Salary Band Distribution: The organizational compensation bell curve
   */
  async getSalaryBands(filter?: AnalyticsFilterOptions): Promise<SalaryBandDTO[]> {
    const employees = await this.getActiveEmployeesWithSalaries(filter);
    const total = employees.length || 1;

    const bands = [
      { band: '< $50k', minUSD: 0, maxUSD: 50000, count: 0 },
      { band: '$50k - $80k', minUSD: 50000, maxUSD: 80000, count: 0 },
      { band: '$80k - $120k', minUSD: 80000, maxUSD: 120000, count: 0 },
      { band: '$120k - $160k', minUSD: 120000, maxUSD: 160000, count: 0 },
      { band: '$160k+', minUSD: 160000, maxUSD: null, count: 0 }
    ];

    for (const emp of employees) {
      const sal = emp.salaries[0];
      if (sal) {
        const salUSD = sal.baseSalary * emp.country.exchangeRateToUSD;
        if (salUSD < 50000) bands[0]!.count++;
        else if (salUSD < 80000) bands[1]!.count++;
        else if (salUSD < 120000) bands[2]!.count++;
        else if (salUSD < 160000) bands[3]!.count++;
        else bands[4]!.count++;
      }
    }

    return bands.map((b) => ({
      ...b,
      percentage: Number(((b.count / total) * 100).toFixed(2))
    }));
  }
}

export const analyticsService = new AnalyticsService();
