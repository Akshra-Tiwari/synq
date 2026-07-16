import { Request, Response } from 'express';
import { PostsService }      from './posts.service';
import { ApiResponse }       from '../../utils/ApiResponse';
import { asyncHandler }      from '../../utils/asyncHandler';
import { ApiError }          from '../../utils/ApiError';
import type { CreatePostInput, UpdatePostInput, CreateCommentInput } from './posts.validators';

// ─── Feed ─────────────────────────────────────────────────────────────────────
export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const { cursor, limit = '20', filter = 'all' } = req.query as Record<string, string>;
  const result = await PostsService.getFeed(
    req.user._id.toString(),
    cursor,
    Math.min(50, parseInt(limit)),
    filter as 'all' | 'following' | 'trending',
  );
  res.json(new ApiResponse(200, 'Feed fetched', result));
});

// ─── Single post ──────────────────────────────────────────────────────────────
export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await PostsService.getPost(req.params.postId, req.user?._id?.toString());
  res.json(ApiResponse.ok('Post fetched', { post }));
});

// ─── User posts ───────────────────────────────────────────────────────────────
export const getUserPosts = asyncHandler(async (req: Request, res: Response) => {
  const { cursor, limit = '20' } = req.query as Record<string, string>;
  const result = await PostsService.getUserPosts(
    req.params.username,
    req.user?._id?.toString(),
    cursor,
    parseInt(limit),
  );
  res.json(new ApiResponse(200, 'User posts fetched', result));
});

// ─── Create post ──────────────────────────────────────────────────────────────
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const input    = req.body as CreatePostInput;
  const files    = req.files as Express.Multer.File[] | undefined;
  const buffers  = files?.map((f) => f.buffer) ?? [];

  if (buffers.length > 4) throw ApiError.badRequest('Maximum 4 images per post');

  const post = await PostsService.createPost(req.user._id.toString(), input, buffers);
  res.status(201).json(ApiResponse.created('Post created', { post }));
});

// ─── Update post ──────────────────────────────────────────────────────────────
export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await PostsService.updatePost(
    req.params.postId,
    req.user._id.toString(),
    req.body as UpdatePostInput,
  );
  res.json(ApiResponse.ok('Post updated', { post }));
});

// ─── Delete post ──────────────────────────────────────────────────────────────
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  await PostsService.deletePost(
    req.params.postId,
    req.user._id.toString(),
    req.user.role,
  );
  res.json(ApiResponse.ok('Post deleted', null));
});

// ─── Like toggle ──────────────────────────────────────────────────────────────
export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const result = await PostsService.toggleLike(
    req.params.postId,
    req.user._id.toString(),
  );
  res.json(ApiResponse.ok('Like toggled', result));
});

// ─── Share ────────────────────────────────────────────────────────────────────
export const recordShare = asyncHandler(async (req: Request, res: Response) => {
  const result = await PostsService.recordShare(req.params.postId);
  res.json(ApiResponse.ok('Share recorded', result));
});

// ─── Report ───────────────────────────────────────────────────────────────────
export const reportPost = asyncHandler(async (req: Request, res: Response) => {
  await PostsService.reportPost(req.params.postId);
  res.json(ApiResponse.ok('Post reported', null));
});

// ─── Comments ─────────────────────────────────────────────────────────────────
export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const comments = await PostsService.getComments(
    req.params.postId,
    req.user?._id?.toString(),
    req.query.parentComment as string | undefined,
  );
  res.json(ApiResponse.ok('Comments fetched', { comments }));
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await PostsService.createComment(
    req.params.postId,
    req.user._id.toString(),
    req.body as CreateCommentInput,
  );
  res.status(201).json(ApiResponse.created('Comment added', { comment }));
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await PostsService.updateComment(
    req.params.commentId,
    req.user._id.toString(),
    req.body.content,
  );
  res.json(ApiResponse.ok('Comment updated', { comment }));
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  await PostsService.deleteComment(
    req.params.commentId,
    req.user._id.toString(),
    req.user.role,
  );
  res.json(ApiResponse.ok('Comment deleted', null));
});

export const toggleCommentLike = asyncHandler(async (req: Request, res: Response) => {
  const result = await PostsService.toggleCommentLike(
    req.params.commentId,
    req.user._id.toString(),
  );
  res.json(ApiResponse.ok('Comment like toggled', result));
});
