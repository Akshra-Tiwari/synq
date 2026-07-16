import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { env } from '../config/env';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors;

  // ─── Mongoose errors ───────────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e: unknown) => ({
      field: (e as { path: string }).path,
      message: (e as { message: string }).message,
    }));
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Duplicate key (e.g. unique email/username)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field
      ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      : 'Duplicate resource';
  }

  // ─── JWT errors (caught by TokenService but fallthrough safety) ────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // ─── Dev vs prod detail ────────────────────────────────────────────────
  if (env.NODE_ENV === 'development') {
    console.error(`[${new Date().toISOString()}] ${statusCode} ${message}`);
    if (!(err instanceof ApiError)) console.error(err.stack);
  }

  res.status(statusCode).json(
    new ApiResponse(statusCode, message, errors ? { errors } : null),
  );
};

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json(
    new ApiResponse(404, `Route ${req.method} ${req.originalUrl} not found`, null),
  );
};
