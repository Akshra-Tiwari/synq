import express         from 'express';
import cors            from 'cors';
import helmet          from 'helmet';
import cookieParser    from 'cookie-parser';
import morgan          from 'morgan';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authLimiter } from './middleware/rateLimiter';
import { mountRoutes } from './routes';
import { env }         from './config/env';

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy:     false,
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const getAllowedOrigins = (): string[] | RegExp => {
  if (env.NODE_ENV === 'development') {
    return /^http:\/\/localhost:\d+$/;
  }
  // Production: allow configured FRONTEND_URL + any Vercel preview URLs
  const origins: string[] = [];
  if (env.FRONTEND_URL) origins.push(env.FRONTEND_URL);
  // Add common Vercel patterns
  return origins;
};

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (env.NODE_ENV === 'development') {
      // Allow any localhost in development
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    }

    // In production: allow FRONTEND_URL and vercel.app previews
    const allowed = [
      env.FRONTEND_URL,
    ].filter(Boolean);

    // Also allow any vercel.app subdomain (for preview deployments)
    if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }

    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    // Log rejected origins for debugging
    console.warn(`CORS rejected origin: ${origin}`);
    callback(null, true); // Allow all for now to debug — tighten later
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
}));

app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Rate limit only auth endpoints ────────────────────────────────────────────
app.use('/api/v1/auth/login',           authLimiter);
app.use('/api/v1/auth/register',        authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
mountRoutes(app);

// ── Root + Health ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Synq API', version: '1.0.0', env: env.NODE_ENV });
});
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Synq API', env: env.NODE_ENV });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
