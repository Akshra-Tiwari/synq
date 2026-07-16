import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Validates req.body, req.params, and req.query against a Zod schema.
 * The schema should be an object with optional `body`, `params`, and `query` keys.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), controller)
 *
 * Schema shape:
 *   z.object({ body: z.object({...}), params: z.object({...}) })
 */
export const validate = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      return next(ApiError.unprocessable('Validation failed', errors));
    }

    // Merge validated/transformed values back (handles .trim(), .toLowerCase(), etc.)
    if (result.data.body) req.body = result.data.body;
    if (result.data.params) req.params = result.data.params;
    if (result.data.query) req.query = result.data.query;

    next();
  };

function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.filter((p) => p !== 'body' && p !== 'params' && p !== 'query').join('.'),
    message: issue.message,
  }));
}
