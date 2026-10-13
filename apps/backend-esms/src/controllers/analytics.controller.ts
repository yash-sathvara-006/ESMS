import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getSummary();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentSpend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getDepartmentSpend();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getCountrySpend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getCountrySpend();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getPayEquity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getPayEquity();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getSalaryBands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getSalaryBands();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
