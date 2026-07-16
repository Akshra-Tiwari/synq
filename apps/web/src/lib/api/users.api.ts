import apiClient from './client';
import type { User } from './auth.api';

export interface Education {
  _id: string;
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  current: boolean;
  description?: string;
}

export interface Experience {
  _id: string;
  company: string;
  role: string;
  location?: string;
  startMonth: number;
  startYear: number;
  endMonth?: number;
  endYear?: number;
  current: boolean;
  description?: string;
  techUsed: string[];
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  pronouns?: string;
  openToWork?: boolean;
  availability?: 'full-time' | 'part-time' | 'freelance' | 'not-available';
  yearsOfExperience?: number;
  skills?: string[];
  techStack?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  portfolioUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export async function getProfile(username: string): Promise<ApiResponse<{ user: User }>> {
  const { data } = await apiClient.get(`/users/${username}`);
  return data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<{ user: User }>> {
  const { data } = await apiClient.patch('/users/profile', payload);
  return data;
}

export async function uploadAvatar(file: File): Promise<ApiResponse<{ user: User }>> {
  const form = new FormData();
  form.append('avatar', file);
  const { data } = await apiClient.post('/users/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function uploadBanner(file: File): Promise<ApiResponse<{ user: User }>> {
  const form = new FormData();
  form.append('banner', file);
  const { data } = await apiClient.post('/users/banner', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function removeAvatar(): Promise<ApiResponse<{ user: User }>> {
  const { data } = await apiClient.delete('/users/avatar');
  return data;
}

// ─── Education ────────────────────────────────────────────────────────────────
export async function addEducation(payload: Omit<Education, '_id'>): Promise<ApiResponse<{ user: User }>> {
  const { data } = await apiClient.post('/users/education', payload);
  return data;
}

export async function updateEducation(entryId: string, payload: Omit<Education, '_id'>): Promise<ApiResponse<{ user: User }>> {
  const { data } = await apiClient.patch(`/users/education/${entryId}`, payload);
  return data;
}

export async function deleteEducation(entryId: string): Promise<ApiResponse<{ user: User }>> {
  const { data } = await apiClient.delete(`/users/education/${entryId}`);
  return data;
}

// ─── Experience ───────────────────────────────────────────────────────────────
export async function addExperience(payload: Omit<Experience, '_id'>): Promise<ApiResponse<{ user: User }>> {
  const { data } = await apiClient.post('/users/experience', payload);
  return data;
}

export async function updateExperience(entryId: string, payload: Omit<Experience, '_id'>): Promise<ApiResponse<{ user: User }>> {
  const { data } = await apiClient.patch(`/users/experience/${entryId}`, payload);
  return data;
}

export async function deleteExperience(entryId: string): Promise<ApiResponse<{ user: User }>> {
  const { data } = await apiClient.delete(`/users/experience/${entryId}`);
  return data;
}

// ─── Change password ──────────────────────────────────────────────────────────
export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiResponse<null>> {
  const { data } = await apiClient.patch('/users/change-password', payload);
  return data;
}

// ─── Search & discovery ───────────────────────────────────────────────────────
export interface UserSearchParams {
  q?: string;
  skills?: string;
  location?: string;
  openToWork?: boolean;
  page?: number;
  limit?: number;
}

export async function searchUsers(params: UserSearchParams): Promise<ApiResponse<{ users: Partial<User>[] }>> {
  const { data } = await apiClient.get('/users/search', { params });
  return data;
}

export async function getSuggestedUsers(): Promise<ApiResponse<{ users: Partial<User>[] }>> {
  const { data } = await apiClient.get('/users/suggested');
  return data;
}
