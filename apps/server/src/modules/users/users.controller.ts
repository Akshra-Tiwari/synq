import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import type {
  UpdateProfileInput,
  EducationInput,
  ExperienceInput,
  ChangePasswordInput,
} from './users.validators';

// ─── Public profile ───────────────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;
  const viewerId = req.user?._id?.toString();
  const user = await UsersService.getProfile(username, viewerId);
  res.json(ApiResponse.ok('Profile fetched', { user }));
});

// ─── Update profile ───────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateProfileInput;
  const user = await UsersService.updateProfile((req.user as any)._id.toString(), input);
  res.json(ApiResponse.ok('Profile updated', { user }));
});

// ─── Avatar upload ────────────────────────────────────────────────────────────
export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No image file provided');
  const user = await UsersService.uploadAvatar((req.user as any)._id.toString(), req.file.buffer);
  res.json(ApiResponse.ok('Avatar updated', { user }));
});

// ─── Banner upload ────────────────────────────────────────────────────────────
export const uploadBanner = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No image file provided');
  const user = await UsersService.uploadBanner((req.user as any)._id.toString(), req.file.buffer);
  res.json(ApiResponse.ok('Cover banner updated', { user }));
});

// ─── Remove avatar ────────────────────────────────────────────────────────────
export const removeAvatar = asyncHandler(async (req: Request, res: Response) => {
  const user = await UsersService.removeAvatar((req.user as any)._id.toString());
  res.json(ApiResponse.ok('Avatar removed', { user }));
});

// ─── Education ────────────────────────────────────────────────────────────────
export const addEducation = asyncHandler(async (req: Request, res: Response) => {
  const user = await UsersService.addEducation((req.user as any)._id.toString(), req.body as EducationInput);
  res.status(201).json(ApiResponse.created('Education added', { user }));
});

export const updateEducation = asyncHandler(async (req: Request, res: Response) => {
  const user = await UsersService.updateEducation(
    (req.user as any)._id.toString(),
    req.params.entryId,
    req.body as EducationInput,
  );
  res.json(ApiResponse.ok('Education updated', { user }));
});

export const deleteEducation = asyncHandler(async (req: Request, res: Response) => {
  const user = await UsersService.deleteEducation((req.user as any)._id.toString(), req.params.entryId);
  res.json(ApiResponse.ok('Education entry deleted', { user }));
});

// ─── Experience ───────────────────────────────────────────────────────────────
export const addExperience = asyncHandler(async (req: Request, res: Response) => {
  const user = await UsersService.addExperience((req.user as any)._id.toString(), req.body as ExperienceInput);
  res.status(201).json(ApiResponse.created('Experience added', { user }));
});

export const updateExperience = asyncHandler(async (req: Request, res: Response) => {
  const user = await UsersService.updateExperience(
    (req.user as any)._id.toString(),
    req.params.entryId,
    req.body as ExperienceInput,
  );
  res.json(ApiResponse.ok('Experience updated', { user }));
});

export const deleteExperience = asyncHandler(async (req: Request, res: Response) => {
  const user = await UsersService.deleteExperience((req.user as any)._id.toString(), req.params.entryId);
  res.json(ApiResponse.ok('Experience entry deleted', { user }));
});

// ─── Change password ──────────────────────────────────────────────────────────
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await UsersService.changePassword((req.user as any)._id.toString(), req.body as ChangePasswordInput);
  res.json(ApiResponse.ok('Password changed successfully', null));
});

// ─── Search users ─────────────────────────────────────────────────────────────
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const { q = '', skills, location, openToWork, page = '1', limit = '20' } = req.query as Record<string, string>;

  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

  const { users, total } = await UsersService.searchUsers(
    q,
    {
      skills: skills ? skills.split(',').map((s) => s.trim()) : undefined,
      location: location || undefined,
      openToWork: openToWork === 'true',
    },
    pageNum,
    limitNum,
    req.user?._id?.toString(),
  );

  const totalPages = Math.ceil(total / limitNum);
  res.json(
    new ApiResponse(200, 'Search results', { users }, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    }),
  );
});

// ─── Suggested developers ─────────────────────────────────────────────────────
export const getSuggested = asyncHandler(async (req: Request, res: Response) => {
  const users = await UsersService.getSuggested((req.user as any)._id.toString());
  res.json(ApiResponse.ok('Suggested developers', { users }));
});
