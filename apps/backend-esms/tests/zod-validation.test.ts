import { describe, it, expect } from 'vitest';
import { employeeFilterSchema, updateSalarySchema } from 'shared-types';

describe('Suite 2: Dual-Tier Zod Validation & Schema Boundary Tests', () => {
  it('1. accepts valid employee query filters and assigns sensible defaults', () => {
    const rawQuery = {};
    const parsed = employeeFilterSchema.parse(rawQuery);

    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(25);
    expect(parsed.search).toBe('');
    expect(parsed.sortBy).toBe('employeeCode');
    expect(parsed.sortOrder).toBe('asc');
    expect(parsed.status).toBe('ACTIVE');
  });

  it('2. correctly coerces string numeric parameters from URL queries into numbers', () => {
    const rawQuery = { page: '3', limit: '50', search: 'John' };
    const parsed = employeeFilterSchema.parse(rawQuery);

    expect(parsed.page).toBe(3);
    expect(parsed.limit).toBe(50);
    expect(parsed.search).toBe('John');
  });

  it('3. rejects pagination limits greater than 100 to prevent DoS memory pressure', () => {
    const rawQuery = { limit: '250' };
    expect(() => employeeFilterSchema.parse(rawQuery)).toThrow();
  });

  it('4. rejects invalid gender and status enum parameters', () => {
    const invalidGender = { gender: 'UNKNOWN_GENDER' };
    expect(() => employeeFilterSchema.parse(invalidGender)).toThrow();

    const invalidStatus = { status: 'DELETED' };
    expect(() => employeeFilterSchema.parse(invalidStatus)).toThrow();
  });

  it('5. accepts well-formed salary update input payloads', () => {
    const validPayload = {
      baseSalary: 110000,
      bonus: 15000,
      deductions: 22000,
      currency: 'USD',
      changeReason: 'Annual Merit Review and Title Promotion',
      changedBy: 'VP of Engineering'
    };

    const parsed = updateSalarySchema.parse(validPayload);
    expect(parsed.baseSalary).toBe(110000);
    expect(parsed.bonus).toBe(15000);
    expect(parsed.deductions).toBe(22000);
    expect(parsed.currency).toBe('USD');
    expect(parsed.changedBy).toBe('VP of Engineering');
  });

  it('6. rejects negative base salaries, bonuses, or deductions', () => {
    const negativeBase = {
      baseSalary: -50000,
      currency: 'USD',
      changeReason: 'Invalid Adjustment'
    };
    expect(() => updateSalarySchema.parse(negativeBase)).toThrow();

    const negativeBonus = {
      baseSalary: 50000,
      bonus: -1000,
      currency: 'USD',
      changeReason: 'Invalid Adjustment'
    };
    expect(() => updateSalarySchema.parse(negativeBonus)).toThrow();
  });

  it('7. strictly enforces currency length and change reason minimum character length', () => {
    // Currency must be exactly 3 characters
    const invalidCurrency = {
      baseSalary: 50000,
      currency: 'USDD', // 4 characters
      changeReason: 'Valid reason here'
    };
    expect(() => updateSalarySchema.parse(invalidCurrency)).toThrow();

    // Reason must be at least 3 characters
    const shortReason = {
      baseSalary: 50000,
      currency: 'USD',
      changeReason: 'OK' // Only 2 chars
    };
    expect(() => updateSalarySchema.parse(shortReason)).toThrow();
  });
});
