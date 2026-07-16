import { Request } from 'express';
import { IUser }   from '../modules/users/users.model';

// Safe helper to get typed user from request
export function getUser(req: Request): IUser {
  return req.user as unknown as IUser;
}

export function getUserId(req: Request): string {
  return (req.user as any)?._id?.toString() ?? '';
}

export function getUserRole(req: Request): string {
  return (req.user as any)?.role ?? 'user';
}
