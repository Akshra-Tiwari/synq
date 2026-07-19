import apiClient from './client';

export interface User {
  _id:               string;
  name:              string;
  username:          string;
  email:             string;
  avatar?:           string;
  coverBanner?:      string;
  bio?:              string;
  role:              'user' | 'admin';
  isVerified:        boolean;
  skills:            string[];
  techStack:         string[];
  location?:         string;
  githubUrl?:        string;
  linkedinUrl?:      string;
  twitterUrl?:       string;
  portfolioUrl?:     string;
  website?:          string;
  pronouns?:         string;
  openToWork:        boolean;
  availability:      string;
  yearsOfExperience?: number;
  profileCompletion?: number;
  experience?:       unknown[];
  education?:        unknown[];
  stats: {
    connectionsCount: number;
    postsCount:       number;
    projectsCount:    number;
    profileViews:     number;
  };
  lastSeen?:    string;
  createdAt:    string;
  updatedAt:    string;
}

interface ApiResponse<T> { success: boolean; message: string; data: T; }

// ─── Auth endpoints ────────────────────────────────────────────────────────────
export async function login(payload: { email: string; password: string }) {
  const { data } = await apiClient.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', payload);
  return data;
}

export async function register(payload: { name: string; username: string; email: string; password: string }) {
  const { data } = await apiClient.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/register', payload);
  return data;
}

export async function logout() {
  const { data } = await apiClient.post<ApiResponse<null>>('/auth/logout');
  return data;
}

export async function refreshToken() {
  const { data } = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
  return data;
}

export async function getMe() {
  const { data } = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
  return data;
}

export async function verifyEmail(token: string) {
  const { data } = await apiClient.post<ApiResponse<null>>('/auth/verify-email', { token });
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(token: string, password: string) {
  const { data } = await apiClient.post<ApiResponse<null>>('/auth/reset-password', { token, password });
  return data;
}

export async function resendVerification(email: string) {
  const { data } = await apiClient.post<ApiResponse<null>>('/auth/resend-verification', { email });
  return data;
}

// Alias used by forgot-password page
export const requestPasswordReset = forgotPassword;
