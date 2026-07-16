import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV === 'development';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 500,
  standardHeaders: true, legacyHeaders: false,
  skip: () => isDev,
  message: { success: false, message: 'Too many requests.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  standardHeaders: true, legacyHeaders: false,
  skip: () => isDev,
  message: { success: false, message: 'Too many login attempts.' },
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  skip: () => isDev,
  message: { success: false, message: 'Too many attempts.' },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 50,
  standardHeaders: true, legacyHeaders: false,
  skip: () => isDev,
  message: { success: false, message: 'Too many uploads.' },
});

// Aliases
export const passwordResetLimiter = strictLimiter;
