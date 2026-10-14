import prisma from '../db/prisma';
import { UpdateSalaryInput, SalaryDTO } from 'shared-types';

export class SalaryService {
  async updateSalary(employeeId: string, input: UpdateSalaryInput): Promise<SalaryDTO> {
    const { baseSalary, bonus, deductions, deductionItems, currency, changeReason, changedBy } = input;

    // Execute atomic transaction: update current salary, insert new salary, insert audit log
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify employee exists and get country for USD conversion
      const employee = await tx.employee.findUnique({
        where: { id: employeeId },
        include: {
          country: true,
          salaries: {
            where: { isCurrent: true },
            take: 1
          }
        }
      });

      if (!employee) {
        throw new Error('Employee not found');
      }

      const currentSalary = employee.salaries[0];
      const previousBase = currentSalary ? currentSalary.baseSalary : 0;
      const previousBonus = currentSalary ? currentSalary.bonus : 0;

      // 2. Mark existing salary records as no longer current
      if (currentSalary) {
        await tx.salary.update({
          where: { id: currentSalary.id },
          data: { isCurrent: false }
        });
      }

      // 3. Compute total deductions: from itemized deductionItems or fallback to deductions
      let totalDeductions = deductions ?? 0;
      if (deductionItems && deductionItems.length > 0) {
        totalDeductions = deductionItems.reduce((acc, item) => acc + Number(item.amount || 0), 0);
      }

      // Compute net salary
      const netSalary = Math.max(0, baseSalary + bonus - totalDeductions);

      // 4. Create new current salary record with deductionItems
      const newSalary = await tx.salary.create({
        data: {
          employeeId,
          baseSalary,
          bonus,
          deductions: totalDeductions,
          netSalary,
          currency,
          effectiveDate: new Date(),
          isCurrent: true,
          deductionItems: deductionItems && deductionItems.length > 0 ? {
            create: deductionItems.map((item) => ({
              category: item.category,
              label: item.label,
              amount: Number(item.amount)
            }))
          } : undefined
        },
        include: {
          deductionItems: true
        }
      });

      // 5. Create immutable audit log entry
      await tx.salaryAuditLog.create({
        data: {
          employeeId,
          previousBase,
          newBase: baseSalary,
          previousBonus,
          newBonus: bonus,
          currency,
          changeReason,
          changedBy: changedBy || 'HR Manager',
          changedAt: new Date()
        }
      });

      const rate = employee.country.exchangeRateToUSD;

      return {
        id: newSalary.id,
        employeeId: newSalary.employeeId,
        baseSalary: newSalary.baseSalary,
        bonus: newSalary.bonus,
        deductions: newSalary.deductions,
        netSalary: newSalary.netSalary,
        currency: newSalary.currency,
        effectiveDate: newSalary.effectiveDate.toISOString(),
        isCurrent: newSalary.isCurrent,
        deductionItems: newSalary.deductionItems?.map((d: any) => ({
          id: d.id,
          salaryId: d.salaryId,
          category: d.category as any,
          label: d.label,
          amount: d.amount
        })) || [],
        baseSalaryUSD: Math.round(newSalary.baseSalary * rate),
        netSalaryUSD: Math.round(newSalary.netSalary * rate)
      };
    });

    return result;
  }
}

export const salaryService = new SalaryService();
