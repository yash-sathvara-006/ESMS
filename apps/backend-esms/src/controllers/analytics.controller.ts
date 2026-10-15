import { Request, Response, NextFunction } from 'express';
import { analyticsService, AnalyticsFilterOptions } from '../services/analytics.service';

function extractFilter(req: Request): AnalyticsFilterOptions | undefined {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const month = req.query.month ? Number(req.query.month) : undefined;
  if (!year && !month) return undefined;
  return {
    year: year && !isNaN(year) ? year : undefined,
    month: month && !isNaN(month) ? month : undefined
  };
}

export class AnalyticsController {
  async getTimeframe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getTimeframe();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getSummary(extractFilter(req));
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentSpend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getDepartmentSpend(extractFilter(req));
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getCountrySpend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getCountrySpend(extractFilter(req));
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getPayEquity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getPayEquity(extractFilter(req));
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getSalaryBands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getSalaryBands(extractFilter(req));
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
