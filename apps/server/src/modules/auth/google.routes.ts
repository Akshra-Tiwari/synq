import { Router, Request, Response } from 'express';
import passport from 'passport';
import { TokenService } from '../../services/token.service';
import { User } from '../users/users.model';
import { env } from '../../config/env';

const router = Router();
const isConfigured = () => !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

router.get('/google', (req: Request, res: Response, next) => {
  if (!isConfigured()) return res.redirect(`${env.FRONTEND_URL}/login?error=google_not_configured`);
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get('/google/callback', (req: Request, res: Response, next) => {
  if (!isConfigured()) return res.redirect(`${env.FRONTEND_URL}/login?error=google_not_configured`);

  passport.authenticate('google', { session: false }, async (err: Error, user: any) => {
    if (err || !user) return res.redirect(`${env.FRONTEND_URL}/login?error=google_failed`);

    try {
      const accessToken = TokenService.signAccessToken({
        sub:      user._id.toString(),
        username: user.username,
        role:     user.role,
      });

      const { token: refreshToken, tokenId, expiresAt } = TokenService.signRefreshToken(user._id.toString());

      await User.findByIdAndUpdate(user._id, {
        $push: {
          refreshTokens: {
            token:     TokenService.hashToken(refreshToken),
            tokenId,
            createdAt: new Date(),
            expiresAt,
          },
        },
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure:   env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   7 * 24 * 60 * 60 * 1000,
        path:     '/',
      });

      res.redirect(`${env.FRONTEND_URL}/auth/google/success?token=${encodeURIComponent(accessToken)}`);
    } catch (e) {
      console.error('Google callback error:', e);
      res.redirect(`${env.FRONTEND_URL}/login?error=google_failed`);
    }
  })(req, res, next);
});

export default router;
