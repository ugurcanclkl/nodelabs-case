import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: "validation_error",
          issues: err.issues.map((i) => ({ path: i.path, message: i.message })),
        });
      }
      next(err);
    }
  };
}

export const validateQuery = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (err) { 
        if (err instanceof ZodError) {
            return res.status(400).json({
                error: "validation_error",
                issues: err.issues.map((i) => ({ path: i.path, message: i.message })),
            });
        }
        next(err);
    }
  };

export const validateParams = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (err) { 
        if (err instanceof ZodError) {
            return res.status(400).json({
                error: "validation_error",
                issues: err.issues.map((i) => ({ path: i.path, message: i.message })),
            });
        }
        next(err);
    }
  };