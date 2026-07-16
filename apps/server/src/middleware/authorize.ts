import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

/**
 * Role-based access control middleware.
 * Must be used AFTER `authenticate`.
 *
 * Usage: router.delete('/posts/:id', authenticate, authorize('admin'), controller)
 */
export const authorize = (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `This action requires one of these roles: ${roles.join(', ')}`,
        ),
      );
    }

    next();
  };

/**
 * Ensures the requesting user is accessing their own resource,
 * OR has the admin role (owners + admins allowed).
 *
 * Usage: router.patch('/users/:id', authenticate, authorizeOwnerOrAdmin('id'), controller)
 */
export const authorizeOwnerOrAdmin = (paramName = 'id') =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const resourceOwnerId = req.params[paramName];
    const isOwner = req.user._id.toString() === resourceOwnerId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
