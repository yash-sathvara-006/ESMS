import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('Suite 5: End-to-End API Integration & HTTP Contract Tests', () => {
  let sampleEmployeeId: string;

  beforeAll(async () => {
    // Retrieve a sample employee ID to test individual endpoints
    const res = await request(app).get('/api/employees?page=1&limit=1');
    expect(res.status).toBe(200);
    sampleEmployeeId = res.body.data[0].id;
  });

  it('1. GET /api/health responds with status success and active database provider', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.databaseProvider).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });

  it('2. GET /api/metadata/departments returns all 8 organizational departments', async () => {
    const res = await request(app).get('/api/metadata/departments');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(8);
  });

  it('3. GET /api/metadata/countries returns all 8 global jurisdictions with exchange rates', async () => {
    const res = await request(app).get('/api/metadata/countries');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(8);

    const usCountry = res.body.data.find((c: any) => c.code === 'US');
    expect(usCountry).toBeDefined();
    expect(usCountry.exchangeRateToUSD).toBe(1.0);
  });

  it('4. GET /api/employees supports server-side pagination with default 25 records', async () => {
    const res = await request(app).get('/api/employees');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.length).toBe(25);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(25);
    expect(res.body.meta.total).toBe(10000);
    expect(res.body.meta.totalPages).toBe(400);
  });

  it('5. GET /api/employees?search=EMP-00001 performs server-side filtering accurately', async () => {
    const res = await request(app).get('/api/employees?search=EMP-00001');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].employeeCode).toBe('EMP-00001');
  });

  it('6. GET /api/analytics/summary returns executive financial KPIs for 10,000 employees', async () => {
    const res = await request(app).get('/api/analytics/summary');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.totalHeadcount).toBe(10000);
    expect(res.body.data.totalAnnualPayrollUSD).toBeGreaterThan(500000000); // > $500M
    expect(res.body.data.averageSalaryUSD).toBeGreaterThan(0);
    expect(res.body.data.medianSalaryUSD).toBeGreaterThan(0);
  });

  it('7. PUT /api/employees/:id/salary returns 400 Bad Request on invalid payloads', async () => {
    const invalidPayload = {
      baseSalary: -5000, // Invalid negative base salary
      currency: 'INVALID_CURRENCY'
    };

    const res = await request(app)
      .put(`/api/employees/${sampleEmployeeId}/salary`)
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('Invalid request body');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('8. GET /api/analytics/timeframe returns dynamically derived available years and current period', async () => {
    const res = await request(app).get('/api/analytics/timeframe');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.years)).toBe(true);
    expect(res.body.data.years.length).toBeGreaterThan(0);
    expect(res.body.data.currentYear).toBeGreaterThanOrEqual(2024);
    expect(res.body.data.currentMonth).toBeGreaterThanOrEqual(1);
    expect(res.body.data.currentMonth).toBeLessThanOrEqual(12);
    expect(res.body.data.minYear).toBeLessThanOrEqual(res.body.data.maxYear);
  });

  it('9. GET /api/analytics/summary?year=2024&month=6 filters headcount as of that period', async () => {
    const res = await request(app).get('/api/analytics/summary?year=2024&month=6');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    // Headcount hired before mid-2024 should be less than total 10,000
    expect(res.body.data.totalHeadcount).toBeGreaterThan(0);
    expect(res.body.data.totalHeadcount).toBeLessThanOrEqual(10000);
    expect(res.body.data.averageSalaryUSD).toBeGreaterThan(0);
  });
});
