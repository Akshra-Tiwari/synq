import { Router }          from 'express';
import * as AuthController from './auth.controller';
import { validate }        from '../../middleware/validate';
import { authenticate }    from '../../middleware/authenticate';
import { authLimiter, strictLimiter } from '../../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validators';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/register',
  authLimiter,
  validate(registerSchema),
  AuthController.register,
);

router.post('/login',
  authLimiter,
  validate(loginSchema),
  AuthController.login,
);

router.post('/refresh', AuthController.refreshToken);

router.post('/forgot-password',
  strictLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword,
);

router.post('/reset-password',
  strictLimiter,
  validate(resetPasswordSchema),
  AuthController.resetPassword,
);

router.get('/verify-email/:token',  AuthController.verifyEmail);
router.post('/verify-email',        AuthController.verifyEmail);

router.post('/resend-verification',
  strictLimiter,
  validate(forgotPasswordSchema),
  AuthController.resendVerification,
);

// ── Protected ─────────────────────────────────────────────────────────────────
router.post('/logout',     authenticate, AuthController.logout);
router.post('/logout-all', authenticate, AuthController.logoutAll);
router.get('/me',          authenticate, AuthController.getMe);

export default router;
