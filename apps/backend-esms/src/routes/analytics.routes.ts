import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/summary', (req, res, next) => analyticsController.getSummary(req, res, next));
router.get('/by-department', (req, res, next) => analyticsController.getDepartmentSpend(req, res, next));
router.get('/by-country', (req, res, next) => analyticsController.getCountrySpend(req, res, next));
router.get('/pay-equity', (req, res, next) => analyticsController.getPayEquity(req, res, next));
router.get('/salary-bands', (req, res, next) => analyticsController.getSalaryBands(req, res, next));

export default router;
