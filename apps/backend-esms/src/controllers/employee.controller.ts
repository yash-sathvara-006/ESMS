import { Request, Response, NextFunction } from 'express';
import { employeeService } from '../services/employee.service';
import { salaryService } from '../services/salary.service';
import { EmployeeFilterQuery, UpdateSalaryInput, ExportEmployeeInput } from 'shared-types';

export class EmployeeController {
  async getEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter = ((req as any).validatedQuery || req.query) as EmployeeFilterQuery;
      const result = await employeeService.getEmployees(filter);
      res.json({
        status: 'success',
        data: result.data,
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  }

  async exportEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = ((req as any).validatedBody || req.body) as ExportEmployeeInput;
      const csv = await employeeService.exportEmployeesCSV(input);
      const filename = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const employee = await employeeService.getEmployeeById(id as string);

      if (!employee) {
        res.status(404).json({
          status: 'error',
          message: `Employee with ID '${id}' not found`
        });
        return;
      }

      res.json({ status: 'success', data: employee });
    } catch (error) {
      next(error);
    }
  }

  async updateSalary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input = req.body as UpdateSalaryInput;

      const updatedSalary = await salaryService.updateSalary(id as string, input);

      res.json({
        status: 'success',
        message: 'Employee salary updated successfully with audit trail entry',
        data: updatedSalary
      });
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }
      next(error);
    }
  }
}

export const employeeController = new EmployeeController();
