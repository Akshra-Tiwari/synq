import apiClient from './client';

export type ProjectStatus = 'in-progress' | 'completed' | 'archived';

export interface ProjectOwner {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  skills: string[];
}

export interface Project {
  _id: string;
  owner: ProjectOwner;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  screenshots: string[];
  thumbnail?: string;
  githubUrl?: string;
  liveUrl?: string;
  status: ProjectStatus;
  featured: boolean;
  likesCount: number;
  savesCount: number;
  viewsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResult {
  projects: Project[];
  total: number;
  totalPages: number;
  page: number;
}

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export interface ProjectsQuery {
  q?:      string;
  tech?:   string;
  status?: ProjectStatus;
  sort?:   'newest' | 'popular' | 'saved';
  page?:   number;
  limit?:  number;
}

export async function listProjects(params: ProjectsQuery = {}): Promise<ApiResponse<ProjectsResult>> {
  const { data } = await apiClient.get('/projects', { params });
  return data;
}

export async function getProject(projectId: string): Promise<ApiResponse<{ project: Project }>> {
  const { data } = await apiClient.get(`/projects/${projectId}`);
  return data;
}

export async function getUserProjects(username: string): Promise<ApiResponse<{ projects: Project[] }>> {
  const { data } = await apiClient.get(`/projects/user/${username}`);
  return data;
}

export async function createProject(payload: {
  title:           string;
  description:     string;
  longDescription?: string;
  techStack:        string[];
  githubUrl?:       string;
  liveUrl?:         string;
  status:           ProjectStatus;
  screenshots?:     File[];
}): Promise<ApiResponse<{ project: Project }>> {
  const form = new FormData();
  form.append('title',       payload.title);
  form.append('description', payload.description);
  if (payload.longDescription) form.append('longDescription', payload.longDescription);
  payload.techStack.forEach((t) => form.append('techStack[]', t));
  if (payload.githubUrl) form.append('githubUrl', payload.githubUrl);
  if (payload.liveUrl)   form.append('liveUrl',   payload.liveUrl);
  form.append('status', payload.status);
  payload.screenshots?.forEach((f) => form.append('screenshots', f));

  const { data } = await apiClient.post('/projects', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateProject(projectId: string, payload: {
  title?:           string;
  description?:     string;
  longDescription?: string;
  techStack?:       string[];
  githubUrl?:       string;
  liveUrl?:         string;
  status?:          ProjectStatus;
  screenshots?:     File[];
}): Promise<ApiResponse<{ project: Project }>> {
  const form = new FormData();
  if (payload.title)           form.append('title',           payload.title);
  if (payload.description)     form.append('description',     payload.description);
  if (payload.longDescription) form.append('longDescription', payload.longDescription);
  if (payload.techStack)       payload.techStack.forEach((t) => form.append('techStack[]', t));
  if (payload.githubUrl !== undefined) form.append('githubUrl', payload.githubUrl);
  if (payload.liveUrl   !== undefined) form.append('liveUrl',   payload.liveUrl);
  if (payload.status)          form.append('status', payload.status);
  payload.screenshots?.forEach((f) => form.append('screenshots', f));

  const { data } = await apiClient.patch(`/projects/${projectId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`);
}

export async function deleteScreenshot(projectId: string, screenshotUrl: string): Promise<ApiResponse<{ project: Project }>> {
  const { data } = await apiClient.delete(`/projects/${projectId}/screenshots`, {
    data: { screenshotUrl },
  });
  return data;
}

export async function toggleLike(projectId: string): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
  const { data } = await apiClient.post(`/projects/${projectId}/like`);
  return data;
}

export async function toggleSave(projectId: string): Promise<ApiResponse<{ saved: boolean; savesCount: number }>> {
  const { data } = await apiClient.post(`/projects/${projectId}/save`);
  return data;
}

export async function getSavedProjects(page = 1): Promise<ApiResponse<ProjectsResult>> {
  const { data } = await apiClient.get('/projects/saved', { params: { page } });
  return data;
}
