import { Request, Response, NextFunction } from 'express';

const colors = {
  GET: '\x1b[32m',
  POST: '\x1b[34m',
  PUT: '\x1b[33m',
  PATCH: '\x1b[33m',
  DELETE: '\x1b[31m',
  reset: '\x1b[0m',
  dim: '\x1b[2m',
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'test') return next();

  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = colors[method as keyof typeof colors] || colors.reset;
    const statusColor =
      res.statusCode >= 500 ? '\x1b[31m' :
      res.statusCode >= 400 ? '\x1b[33m' :
      res.statusCode >= 300 ? '\x1b[36m' : '\x1b[32m';

    console.log(
      `${colors.dim}${new Date().toISOString()}${colors.reset} ` +
      `${color}${method}${colors.reset} ` +
      `${originalUrl} ` +
      `${statusColor}${res.statusCode}${colors.reset} ` +
      `${colors.dim}${duration}ms${colors.reset}`,
    );
  });

  next();
};
