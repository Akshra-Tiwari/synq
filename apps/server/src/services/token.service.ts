import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export interface AccessTokenPayload {
  sub: string;        // userId
  username: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;    // unique per token for rotation tracking
  type: 'refresh';
}

export class TokenService {
  // ─── Access token (short-lived, 15min) ──────────────────────────────────
  static signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'access' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'] },
    );
  }

  static verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
      if (payload.type !== 'access') throw new Error('Wrong token type');
      return payload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Access token expired');
      }
      throw ApiError.unauthorized('Invalid access token');
    }
  }

  // ─── Refresh token (long-lived, 7d) ─────────────────────────────────────
  static signRefreshToken(userId: string): { token: string; tokenId: string; expiresAt: Date } {
    const tokenId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const token = jwt.sign(
      { sub: userId, tokenId, type: 'refresh' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'] },
    );

    return { token, tokenId, expiresAt };
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
      if (payload.type !== 'refresh') throw new Error('Wrong token type');
      return payload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Refresh token expired');
      }
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }

  // ─── Secure random tokens (email verification, password reset) ──────────
  static generateSecureToken(): { raw: string; hashed: string } {
    const raw = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    return { raw, hashed };
  }

  static hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }
}
