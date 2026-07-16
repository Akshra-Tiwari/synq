import { Request, Response } from 'express';
import { ProjectsService }   from './projects.service';
import { ApiResponse }       from '../../utils/ApiResponse';
import { asyncHandler }      from '../../utils/asyncHandler';
import { ApiError }          from '../../utils/ApiError';
import type { CreateProjectInput, UpdateProjectInput } from './projects.validators';

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const { q, tech, status, sort = 'newest', page = '1', limit = '18' } = req.query as Record<string, string>;
  const result = await ProjectsService.listProjects(
    q, tech, status, sort as 'newest' | 'popular' | 'saved',
    parseInt(page), parseInt(limit),
    req.user?._id?.toString(),
  );
  res.json(new ApiResponse(200, 'Projects fetched', result));
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await ProjectsService.getProject(
    req.params.projectId,
    req.user?._id?.toString(),
  );
  res.json(ApiResponse.ok('Project fetched', { project }));
});

export const getUserProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await ProjectsService.getUserProjects(
    req.params.username,
    req.user?._id?.toString(),
  );
  res.json(ApiResponse.ok('User projects fetched', { projects }));
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const files   = req.files as Express.Multer.File[] | undefined;
  const buffers = files?.map((f) => f.buffer) ?? [];
  if (buffers.length > 6) throw ApiError.badRequest('Maximum 6 screenshots');

  const project = await ProjectsService.createProject(
    req.user._id.toString(),
    req.body as CreateProjectInput,
    buffers,
  );
  res.status(201).json(ApiResponse.created('Project created', { project }));
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const files   = req.files as Express.Multer.File[] | undefined;
  const buffers = files?.map((f) => f.buffer) ?? [];

  const project = await ProjectsService.updateProject(
    req.params.projectId,
    req.user._id.toString(),
    req.body as UpdateProjectInput,
    buffers,
  );
  res.json(ApiResponse.ok('Project updated', { project }));
});

export const deleteScreenshot = asyncHandler(async (req: Request, res: Response) => {
  const { screenshotUrl } = req.body as { screenshotUrl: string };
  if (!screenshotUrl) throw ApiError.badRequest('screenshotUrl is required');

  const project = await ProjectsService.deleteScreenshot(
    req.params.projectId,
    req.user._id.toString(),
    screenshotUrl,
  );
  res.json(ApiResponse.ok('Screenshot deleted', { project }));
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await ProjectsService.deleteProject(
    req.params.projectId,
    req.user._id.toString(),
    req.user.role,
  );
  res.json(ApiResponse.ok('Project deleted', null));
});

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const result = await ProjectsService.toggleLike(
    req.params.projectId,
    req.user._id.toString(),
  );
  res.json(ApiResponse.ok('Like toggled', result));
});

export const toggleSave = asyncHandler(async (req: Request, res: Response) => {
  const result = await ProjectsService.toggleSave(
    req.params.projectId,
    req.user._id.toString(),
  );
  res.json(ApiResponse.ok('Save toggled', result));
});

export const getSavedProjects = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '18' } = req.query as Record<string, string>;
  const result = await ProjectsService.getSavedProjects(
    req.user._id.toString(),
    parseInt(page),
    parseInt(limit),
  );
  res.json(new ApiResponse(200, 'Saved projects fetched', result));
});
