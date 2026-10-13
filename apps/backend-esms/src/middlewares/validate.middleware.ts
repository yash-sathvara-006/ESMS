import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      // In Express 5, req.query is a getter, so we store validated data on req
      (req as any).validatedQuery = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid query parameters',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
        return;
      }
      next(error);
    }
  };
}

export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      (req as any).validatedBody = parsed;
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid request body',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
        return;
      }
      next(error);
    }
  };
}
