import { Router } from 'express';
import { employeeController } from '../controllers/employee.controller';
import { validateQuery, validateBody } from '../middlewares/validate.middleware';
import { employeeFilterSchema, updateSalarySchema } from 'shared-types';

const router = Router();

// GET /api/employees - Server-side paginated search & filter
router.get(
  '/',
  validateQuery(employeeFilterSchema),
  (req, res, next) => employeeController.getEmployees(req, res, next)
);

// GET /api/employees/:id - Single employee details with audit history
router.get(
  '/:id',
  (req, res, next) => employeeController.getEmployeeById(req, res, next)
);

// PUT /api/employees/:id/salary - Transaction-backed salary modification with audit logging
router.put(
  '/:id/salary',
  validateBody(updateSalarySchema),
  (req, res, next) => employeeController.updateSalary(req, res, next)
);

export default router;
