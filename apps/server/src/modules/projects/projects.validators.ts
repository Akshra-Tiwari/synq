import { z } from 'zod';

const urlOrEmpty = z.union([z.string().url('Must be a valid URL'), z.literal('')]).optional();

export const createProjectSchema = z.object({
  body: z.object({
    title:           z.string().min(1, 'Title is required').max(100).trim(),
    description:     z.string().min(1, 'Description is required').max(300).trim(),
    longDescription: z.string().max(5000).trim().optional(),
    techStack:       z.array(z.string().trim()).max(20).default([]),
    githubUrl:       urlOrEmpty,
    liveUrl:         urlOrEmpty,
    status:          z.enum(['in-progress', 'completed', 'archived']).default('in-progress'),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title:           z.string().min(1).max(100).trim().optional(),
    description:     z.string().min(1).max(300).trim().optional(),
    longDescription: z.string().max(5000).trim().optional(),
    techStack:       z.array(z.string().trim()).max(20).optional(),
    githubUrl:       urlOrEmpty,
    liveUrl:         urlOrEmpty,
    status:          z.enum(['in-progress', 'completed', 'archived']).optional(),
  }),
  params: z.object({ projectId: z.string().length(24, 'Invalid project ID') }),
});

export const projectIdSchema = z.object({
  params: z.object({ projectId: z.string().length(24, 'Invalid project ID') }),
});

export const projectsQuerySchema = z.object({
  query: z.object({
    q:       z.string().optional(),
    tech:    z.string().optional(),
    status:  z.enum(['in-progress', 'completed', 'archived']).optional(),
    sort:    z.enum(['newest', 'popular', 'saved']).default('newest'),
    page:    z.coerce.number().min(1).default(1),
    limit:   z.coerce.number().min(1).max(50).default(18),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
