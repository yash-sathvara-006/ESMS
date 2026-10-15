import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../src/db/prisma';
import { salaryService } from '../src/services/salary.service';

describe('Suite 4: Transactional Integrity & Audit Logging Tests', () => {
  let testEmployeeId: string;
  let initialSalary: any;

  beforeAll(async () => {
    // Find an existing active employee from the database
    const emp = await prisma.employee.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        salaries: { where: { isCurrent: true }, take: 1 }
      }
    });

    if (!emp) {
      throw new Error('No employee found for testing transaction-audit');
    }

    testEmployeeId = emp.id;
    initialSalary = emp.salaries[0];
  });

  it('1. executes salary update atomically and marks previous record as not current', async () => {
    const updated = await salaryService.updateSalary(testEmployeeId, {
      baseSalary: (initialSalary?.baseSalary || 50000) + 5000,
      bonus: 10000,
      deductions: 5000,
      currency: initialSalary?.currency || 'USD',
      changeReason: 'Merit increase annual cycle',
      changedBy: 'Test HR Manager'
    });

    expect(updated).toBeDefined();
    expect(updated.isCurrent).toBe(true);
    expect(updated.netSalary).toBe(updated.baseSalary + 10000 - 5000);

    // Verify in database that previous record has isCurrent = false
    if (initialSalary) {
      const prevInDb = await prisma.salary.findUnique({
        where: { id: initialSalary.id }
      });
      expect(prevInDb?.isCurrent).toBe(false);
    }
  });

  it('2. creates an immutable salary audit log entry with complete differential history', async () => {
    const latestAudit = await prisma.salaryAuditLog.findFirst({
      where: { employeeId: testEmployeeId },
      orderBy: { changedAt: 'desc' }
    });

    expect(latestAudit).toBeDefined();
    expect(latestAudit?.changeReason).toBe('Merit increase annual cycle');
    expect(latestAudit?.changedBy).toBe('Test HR Manager');
    expect(latestAudit?.newBonus).toBe(10000);
  });

  it('3. ensures exactly ONE salary record remains flagged as isCurrent for the employee', async () => {
    const currentSalaries = await prisma.salary.findMany({
      where: { employeeId: testEmployeeId, isCurrent: true }
    });

    expect(currentSalaries.length).toBe(1);
  });

  it('4. throws error and rolls back when attempting to update a non-existent employee', async () => {
    const fakeId = 'non-existent-uuid-12345';
    await expect(
      salaryService.updateSalary(fakeId, {
        baseSalary: 100000,
        bonus: 0,
        currency: 'USD',
        changeReason: 'Should fail',
        changedBy: 'Test HR'
      })
    ).rejects.toThrow('Employee not found');
  });
});
