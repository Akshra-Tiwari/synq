import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { User } from '../modules/users/users.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Verifies the JWT access token and attaches the user to req.user.
 * Throws 401 if the token is missing, invalid, or the user no longer exists.
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No access token provided');
    }

    const token = authHeader.slice(7);
    const payload = TokenService.verifyAccessToken(token);

    const user = await User.findById(payload.sub);
    if (!user) throw ApiError.unauthorized('User account not found');

    req.user = user;
    next();
  },
);

/**
 * Optional authentication — attaches user if token is present but doesn't throw.
 * Useful for routes that behave differently for authenticated vs anonymous users.
 */
export const optionalAuthenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const payload = TokenService.verifyAccessToken(token);
        const user = await User.findById(payload.sub);
        if (user) req.user = user;
      } catch {
        // Silently ignore — optionalAuthenticate never throws
      }
    }

    next();
  },
);
