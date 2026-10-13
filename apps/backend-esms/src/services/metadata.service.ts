import prisma from '../db/prisma';
import { DepartmentDTO, CountryDTO } from 'shared-types';

export class MetadataService {
  async getDepartments(): Promise<DepartmentDTO[]> {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { employees: true }
        }
      }
    });

    return departments.map((d) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      employeeCount: d._count.employees
    }));
  }

  async getCountries(): Promise<CountryDTO[]> {
    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { employees: true }
        }
      }
    });

    return countries.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      currency: c.currency,
      exchangeRateToUSD: c.exchangeRateToUSD,
      employeeCount: c._count.employees
    }));
  }
}

export const metadataService = new MetadataService();
