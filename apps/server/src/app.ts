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

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy:     false,
}));

// ── CORS — allow any localhost port in dev ────────────────────────────────────
const allowedOrigins = env.NODE_ENV === 'development'
  ? /^http:\/\/localhost:\d+$/
  : env.FRONTEND_URL;

app.use(cors({
  origin:         allowedOrigins,
  credentials:    true,
  methods:        ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Only log in development
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Rate limit only auth endpoints ────────────────────────────────────────────
app.use('/api/v1/auth/login',            authLimiter);
app.use('/api/v1/auth/register',         authLimiter);
app.use('/api/v1/auth/forgot-password',  authLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
mountRoutes(app);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Synq API', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
