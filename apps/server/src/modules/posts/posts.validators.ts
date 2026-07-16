import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Post cannot be empty').max(3000).trim(),
    type: z.enum(['text', 'image', 'project-showcase', 'achievement']).default('text'),
    tags: z
      .array(z.string().toLowerCase().trim().max(30))
      .max(10, 'Max 10 tags')
      .default([]),
    visibility: z.enum(['public', 'connections-only']).default('public'),
    projectRef: z.string().length(24).optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(3000).trim().optional(),
    tags:    z.array(z.string().toLowerCase().trim()).max(10).optional(),
    visibility: z.enum(['public', 'connections-only']).optional(),
  }),
  params: z.object({ postId: z.string().length(24, 'Invalid post ID') }),
});

export const postIdParamSchema = z.object({
  params: z.object({ postId: z.string().length(24, 'Invalid post ID') }),
});

export const createCommentSchema = z.object({
  body: z.object({
    content:       z.string().min(1, 'Comment cannot be empty').max(1000).trim(),
    parentComment: z.string().length(24).optional(),
  }),
  params: z.object({ postId: z.string().length(24) }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(1000).trim(),
  }),
  params: z.object({
    postId:    z.string().length(24),
    commentId: z.string().length(24),
  }),
});

export const commentIdParamSchema = z.object({
  params: z.object({
    postId:    z.string().length(24),
    commentId: z.string().length(24),
  }),
});

export const feedQuerySchema = z.object({
  query: z.object({
    cursor: z.string().optional(),
    limit:  z.coerce.number().min(1).max(50).default(20),
    filter: z.enum(['all', 'following', 'trending']).default('all'),
  }),
});

export type CreatePostInput   = z.infer<typeof createPostSchema>['body'];
export type UpdatePostInput   = z.infer<typeof updatePostSchema>['body'];
export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
