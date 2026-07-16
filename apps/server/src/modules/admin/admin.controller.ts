import { Request, Response } from 'express';
import { AdminService }     from './admin.service';
import { ApiResponse }      from '../../utils/ApiResponse';
import { asyncHandler }     from '../../utils/asyncHandler';

export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const data = await AdminService.getAnalytics();
  res.json(ApiResponse.ok('Analytics fetched', data));
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = '1', limit = '20', filter = 'all' } = req.query as Record<string, string>;
  const result = await AdminService.listUsers(q || undefined, parseInt(page), Math.min(100, parseInt(limit)), filter);
  res.json(new ApiResponse(200, 'Users fetched', result));
});

export const setUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body as { role: 'user' | 'admin' };
  const user = await AdminService.setUserRole(req.params.userId, role);
  res.json(ApiResponse.ok('Role updated', { user }));
});

export const verifyUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await AdminService.verifyUser(req.params.userId);
  res.json(ApiResponse.ok('User verified', { user }));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await AdminService.deleteUser(req.params.userId);
  res.json(ApiResponse.ok('User deleted', null));
});

export const getReportedContent = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>;
  const result = await AdminService.getReportedContent(parseInt(page), parseInt(limit));
  res.json(new ApiResponse(200, 'Reported content fetched', result));
});

export const hidePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await AdminService.hidePost(req.params.postId);
  res.json(ApiResponse.ok('Post hidden', { post }));
});

export const unhidePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await AdminService.unhidePost(req.params.postId);
  res.json(ApiResponse.ok('Post restored', { post }));
});

export const deletePostAdmin = asyncHandler(async (req: Request, res: Response) => {
  await AdminService.deletePostAdmin(req.params.postId);
  res.json(ApiResponse.ok('Post deleted', null));
});
