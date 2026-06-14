import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const validateRequest = (schema: any) => 
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
         res.status(400).json({
          error: 'Validation failed',
          issues: (error as any).issues || (error as any).errors,
        });
        return;
      }
      res.status(400).json({ error: 'Invalid request' });
      return;
    }
  };
