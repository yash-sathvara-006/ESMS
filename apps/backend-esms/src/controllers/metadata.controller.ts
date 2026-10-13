import { Request, Response, NextFunction } from 'express';
import { metadataService } from '../services/metadata.service';

export class MetadataController {
  async getDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await metadataService.getDepartments();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await metadataService.getCountries();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }
}

export const metadataController = new MetadataController();
