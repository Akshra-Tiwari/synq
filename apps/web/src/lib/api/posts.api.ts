import apiClient from './client';

export type PostType = 'text' | 'image' | 'project-showcase' | 'achievement';

export interface PostAuthor {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  skills: string[];
}

export interface Post {
  _id: string;
  author: PostAuthor;
  type: PostType;
  content: string;
  images: string[];
  tags: string[];
  projectRef?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  visibility: 'public' | 'connections-only';
  isEdited: boolean;
  isPinned: boolean;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: PostAuthor;
  content: string;
  parentComment?: string;
  likesCount: number;
  repliesCount: number;
  isEdited: boolean;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedResult {
  posts: Post[];
  nextCursor?: string;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Feed ─────────────────────────────────────────────────────────────────────
export async function getFeed(params: {
  cursor?: string;
  limit?: number;
  filter?: 'all' | 'following' | 'trending';
}): Promise<ApiResponse<FeedResult>> {
  const { data } = await apiClient.get('/posts', { params });
  return data;
}

export async function getUserPosts(username: string, cursor?: string): Promise<ApiResponse<FeedResult>> {
  const { data } = await apiClient.get(`/posts/user/${username}`, { params: { cursor } });
  return data;
}

export async function getPost(postId: string): Promise<ApiResponse<{ post: Post }>> {
  const { data } = await apiClient.get(`/posts/${postId}`);
  return data;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────
export async function createPost(payload: {
  content: string;
  type?: PostType;
  tags?: string[];
  visibility?: 'public' | 'connections-only';
  images?: File[];
}): Promise<ApiResponse<{ post: Post }>> {
  const form = new FormData();
  form.append('content', payload.content);
  form.append('type', payload.type ?? 'text');
  if (payload.tags?.length) {
    payload.tags.forEach((t) => form.append('tags[]', t));
  }
  form.append('visibility', payload.visibility ?? 'public');
  payload.images?.forEach((f) => form.append('images', f));

  const { data } = await apiClient.post('/posts', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updatePost(postId: string, payload: {
  content?: string;
  tags?: string[];
  visibility?: 'public' | 'connections-only';
}): Promise<ApiResponse<{ post: Post }>> {
  const { data } = await apiClient.patch(`/posts/${postId}`, payload);
  return data;
}

export async function deletePost(postId: string): Promise<void> {
  await apiClient.delete(`/posts/${postId}`);
}

// ─── Engagement ───────────────────────────────────────────────────────────────
export async function toggleLike(postId: string): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
  const { data } = await apiClient.post(`/posts/${postId}/like`);
  return data;
}

export async function recordShare(postId: string): Promise<ApiResponse<{ sharesCount: number }>> {
  const { data } = await apiClient.post(`/posts/${postId}/share`);
  return data;
}

export async function reportPost(postId: string): Promise<void> {
  await apiClient.post(`/posts/${postId}/report`);
}

// ─── Comments ─────────────────────────────────────────────────────────────────
export async function getComments(postId: string, parentComment?: string): Promise<ApiResponse<{ comments: Comment[] }>> {
  const { data } = await apiClient.get(`/posts/${postId}/comments`, {
    params: parentComment ? { parentComment } : undefined,
  });
  return data;
}

export async function createComment(postId: string, payload: {
  content: string;
  parentComment?: string;
}): Promise<ApiResponse<{ comment: Comment }>> {
  const { data } = await apiClient.post(`/posts/${postId}/comments`, payload);
  return data;
}

export async function updateComment(postId: string, commentId: string, content: string): Promise<ApiResponse<{ comment: Comment }>> {
  const { data } = await apiClient.patch(`/posts/${postId}/comments/${commentId}`, { content });
  return data;
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
}

export async function toggleCommentLike(postId: string, commentId: string): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
  const { data } = await apiClient.post(`/posts/${postId}/comments/${commentId}/like`);
  return data;
}
