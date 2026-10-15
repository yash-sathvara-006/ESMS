import prisma from '../db/prisma';
import { EmployeeFilterQuery, PaginatedResponse, EmployeeDTO, ExportEmployeeInput } from 'shared-types';

export class EmployeeService {
  async getEmployees(filter: EmployeeFilterQuery): Promise<PaginatedResponse<EmployeeDTO>> {
    const {
      page,
      limit,
      search,
      departmentId,
      countryId,
      gender,
      status,
      sortBy,
      sortOrder
    } = filter;

    const skip = (page - 1) * limit;

    // 1. Build Dynamic Filter (where clause)
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (countryId) {
      where.countryId = countryId;
    }

    if (gender) {
      where.gender = gender;
    }

    if (search && search.trim() !== '') {
      const trimmed = search.trim();
      where.OR = [
        { employeeCode: { contains: trimmed } },
        { firstName: { contains: trimmed } },
        { lastName: { contains: trimmed } },
        { email: { contains: trimmed } }
      ];
    }

    // 2. Build Sorting Clause
    let orderBy: any = {};
    if (sortBy === 'name') {
      orderBy = [{ firstName: sortOrder }, { lastName: sortOrder }];
    } else if (sortBy === 'hireDate') {
      orderBy = { hireDate: sortOrder };
    } else {
      orderBy = { employeeCode: sortOrder };
    }

    // 3. Execute Indexed Queries atomically
    const [total, rawEmployees] = await prisma.$transaction([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          department: true,
          country: true,
          salaries: {
            where: { isCurrent: true },
            take: 1,
            include: {
              deductionItems: true
            }
          }
        }
      })
    ]);

    // 4. Format DTOs and calculate normalized USD amounts
    const data: EmployeeDTO[] = rawEmployees.map((emp) => {
      const currentSal = emp.salaries[0];
      const rate = emp.country.exchangeRateToUSD;

      return {
        id: emp.id,
        employeeCode: emp.employeeCode,
        firstName: emp.firstName,
        lastName: emp.lastName,
        fullName: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        phone: (emp as any).phone || '',
        gender: emp.gender,
        hireDate: emp.hireDate.toISOString(),
        status: emp.status,
        departmentId: emp.departmentId,
        department: {
          id: emp.department.id,
          code: emp.department.code,
          name: emp.department.name
        },
        countryId: emp.countryId,
        country: {
          id: emp.country.id,
          code: emp.country.code,
          name: emp.country.name,
          currency: emp.country.currency,
          exchangeRateToUSD: emp.country.exchangeRateToUSD
        },
        currentSalary: currentSal
          ? {
            id: currentSal.id,
            employeeId: currentSal.employeeId,
            baseSalary: currentSal.baseSalary,
            bonus: currentSal.bonus,
            deductions: currentSal.deductions,
            netSalary: currentSal.netSalary,
            currency: currentSal.currency,
            effectiveDate: currentSal.effectiveDate.toISOString(),
            isCurrent: currentSal.isCurrent,
            deductionItems: (currentSal as any).deductionItems?.map((d: any) => ({
              id: d.id,
              salaryId: d.salaryId,
              category: d.category,
              label: d.label,
              amount: d.amount
            })) || [],
            baseSalaryUSD: Math.round(currentSal.baseSalary * rate),
            netSalaryUSD: Math.round(currentSal.netSalary * rate)
          }
          : null
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async getEmployeeById(id: string): Promise<EmployeeDTO | null> {
    const emp = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        country: true,
        salaries: {
          where: { isCurrent: true },
          take: 1,
          include: {
            deductionItems: true
          }
        },
        salaryAuditLogs: {
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    if (!emp) return null;

    const currentSal = emp.salaries[0];
    const rate = emp.country.exchangeRateToUSD;

    return {
      id: emp.id,
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      fullName: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      phone: (emp as any).phone || '',
      gender: emp.gender,
      hireDate: emp.hireDate.toISOString(),
      status: emp.status,
      departmentId: emp.departmentId,
      department: {
        id: emp.department.id,
        code: emp.department.code,
        name: emp.department.name
      },
      countryId: emp.countryId,
      country: {
        id: emp.country.id,
        code: emp.country.code,
        name: emp.country.name,
        currency: emp.country.currency,
        exchangeRateToUSD: emp.country.exchangeRateToUSD
      },
      currentSalary: currentSal
        ? {
          id: currentSal.id,
          employeeId: currentSal.employeeId,
          baseSalary: currentSal.baseSalary,
          bonus: currentSal.bonus,
          deductions: currentSal.deductions,
          netSalary: currentSal.netSalary,
          currency: currentSal.currency,
          effectiveDate: currentSal.effectiveDate.toISOString(),
          isCurrent: currentSal.isCurrent,
          deductionItems: (currentSal as any).deductionItems?.map((d: any) => ({
            id: d.id,
            salaryId: d.salaryId,
            category: d.category,
            label: d.label,
            amount: d.amount
          })) || [],
          baseSalaryUSD: Math.round(currentSal.baseSalary * rate),
          netSalaryUSD: Math.round(currentSal.netSalary * rate)
        }
        : null,
      salaryAuditLogs: emp.salaryAuditLogs.map((log) => ({
        id: log.id,
        employeeId: log.employeeId,
        previousBase: log.previousBase,
        newBase: log.newBase,
        previousBonus: log.previousBonus,
        newBonus: log.newBonus,
        currency: log.currency,
        changeReason: log.changeReason,
        changedBy: log.changedBy,
        changedAt: log.changedAt.toISOString()
      }))
    };
  }

  async exportEmployeesCSV(filter: ExportEmployeeInput): Promise<string> {
    const { employeeIds, search, departmentId, countryId, gender, status } = filter;

    const where: any = {};

    if (employeeIds && employeeIds.length > 0) {
      where.id = { in: employeeIds };
    } else {
      if (status) {
        where.status = status;
      }
      if (departmentId) {
        where.departmentId = departmentId;
      }
      if (countryId) {
        where.countryId = countryId;
      }
      if (gender) {
        where.gender = gender;
      }
      if (search && search.trim() !== '') {
        const trimmed = search.trim();
        where.OR = [
          { employeeCode: { contains: trimmed } },
          { firstName: { contains: trimmed } },
          { lastName: { contains: trimmed } },
          { email: { contains: trimmed } }
        ];
      }
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { employeeCode: 'asc' },
      include: {
        department: true,
        country: true,
        salaries: {
          where: { isCurrent: true },
          take: 1
        }
      }
    });

    const headers = [
      'employeeCode',
      'firstname',
      'lastname',
      'email',
      'phone',
      'gender',
      'hiredate',
      'status',
      'department',
      'country',
      'current salary',
      'last updated at'
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = employees.map((emp) => {
      const currentSal = emp.salaries[0];
      const baseSalary = currentSal ? currentSal.baseSalary : 0;
      const lastUpdatedAt = emp.updatedAt ? emp.updatedAt.toISOString().replace('T', ' ').substring(0, 19) : '';

      return [
        escapeCSV(emp.employeeCode),
        escapeCSV(emp.firstName),
        escapeCSV(emp.lastName),
        escapeCSV(emp.email),
        escapeCSV((emp as any).phone || ''),
        escapeCSV(emp.gender),
        escapeCSV(emp.hireDate ? emp.hireDate.toISOString().split('T')[0] : ''),
        escapeCSV(emp.status),
        escapeCSV(emp.department?.name || ''),
        escapeCSV(emp.country?.name || ''),
        escapeCSV(baseSalary),
        escapeCSV(lastUpdatedAt)
      ];
    });

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }
}

export const employeeService = new EmployeeService();
