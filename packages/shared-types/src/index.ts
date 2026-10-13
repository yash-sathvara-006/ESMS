import { z } from 'zod';

// ==========================================
// 1. Zod Validation Schemas
// ==========================================

export const employeeFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  search: z.string().optional().default(''),
  departmentId: z.string().optional(),
  countryId: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  sortBy: z.enum(['employeeCode', 'name', 'hireDate', 'baseSalary', 'netSalary']).default('employeeCode'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

export type EmployeeFilterQuery = z.infer<typeof employeeFilterSchema>;

export const updateSalarySchema = z.object({
  baseSalary: z.coerce.number().positive('Base salary must be greater than 0'),
  bonus: z.coerce.number().nonnegative('Bonus cannot be negative').default(0),
  deductions: z.coerce.number().nonnegative('Deductions cannot be negative').default(0),
  currency: z.string().min(3).max(3),
  changeReason: z.string().min(3, 'Reason must be at least 3 characters long').max(255),
  changedBy: z.string().optional().default('HR Manager')
});

export type UpdateSalaryInput = z.infer<typeof updateSalarySchema>;

// ==========================================
// 2. Data Transfer Objects (DTOs)
// ==========================================

export interface DepartmentDTO {
  id: string;
  code: string;
  name: string;
  employeeCount?: number;
}

export interface CountryDTO {
  id: string;
  code: string;
  name: string;
  currency: string;
  exchangeRateToUSD: number;
  employeeCount?: number;
}

export interface SalaryDTO {
  id: string;
  employeeId: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  currency: string;
  effectiveDate: string;
  isCurrent: boolean;
  // Normalized USD equivalents
  baseSalaryUSD?: number;
  netSalaryUSD?: number;
}

export interface SalaryAuditLogDTO {
  id: string;
  employeeId: string;
  previousBase: number;
  newBase: number;
  previousBonus: number;
  newBonus: number;
  currency: string;
  changeReason: string;
  changedBy: string;
  changedAt: string;
}

export interface EmployeeDTO {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  gender: string;
  hireDate: string;
  status: string;
  departmentId: string;
  department: DepartmentDTO;
  countryId: string;
  country: CountryDTO;
  currentSalary: SalaryDTO | null;
  salaryAuditLogs?: SalaryAuditLogDTO[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ==========================================
// 3. Strategic Analytics DTOs
// ==========================================

export interface AnalyticsSummaryDTO {
  totalHeadcount: number;
  totalAnnualPayrollUSD: number;
  averageSalaryUSD: number;
  medianSalaryUSD: number;
  totalDepartments: number;
  totalCountries: number;
}

export interface DepartmentSpendDTO {
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  headcount: number;
  totalPayrollUSD: number;
  averageSalaryUSD: number;
  minSalaryUSD: number;
  maxSalaryUSD: number;
  percentageOfTotalSpend: number;
}

export interface CountrySpendDTO {
  countryId: string;
  countryCode: string;
  countryName: string;
  currency: string;
  exchangeRateToUSD: number;
  headcount: number;
  totalPayrollLocalCurrency: number;
  totalPayrollUSD: number;
  averageSalaryUSD: number;
  percentageOfTotalSpend: number;
}

export interface PayEquityDTO {
  departmentId: string;
  departmentName: string;
  maleAvgUSD: number;
  maleCount: number;
  femaleAvgUSD: number;
  femaleCount: number;
  nonBinaryAvgUSD: number;
  nonBinaryCount: number;
  genderPayRatio: number; // femaleAvg / maleAvg (1.0 = equal pay)
}

export interface SalaryBandDTO {
  band: string;
  minUSD: number;
  maxUSD: number | null;
  count: number;
  percentage: number;
}
