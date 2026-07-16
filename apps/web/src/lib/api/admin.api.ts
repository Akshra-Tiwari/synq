import apiClient from './client';

export interface AnalyticsOverview {
  totalUsers: number; verifiedUsers: number; totalPosts: number; totalProjects: number;
  totalConnections: number; openToWorkUsers: number;
  newUsersToday: number; newUsersThisWeek: number; newPostsToday: number; newPostsThisWeek: number;
  verificationRate: number;
}
export interface TrendPoint { date: string; count: number; }
export interface Analytics {
  overview: AnalyticsOverview;
  topSkills: { skill: string; count: number }[];
  topTech: { tech: string; count: number }[];
  signupTrend: TrendPoint[]; postTrend: TrendPoint[];
  topPosters: { name: string; username: string; avatar?: string; stats: { postsCount: number } }[];
  availabilityDist: { availability: string; count: number }[];
}
export interface AdminUser {
  _id: string; name: string; username: string; email: string; avatar?: string;
  role: 'user' | 'admin'; isVerified: boolean; createdAt: string;
  stats: { connectionsCount: number; postsCount: number; projectsCount: number };
}
interface ApiResponse<T> { success: boolean; message: string; data: T; }

export async function getAnalytics(): Promise<ApiResponse<Analytics>> {
  const { data } = await apiClient.get('/admin/analytics'); return data;
}
export async function listUsers(params: { q?: string; page?: number; limit?: number; filter?: string; }):
  Promise<ApiResponse<{ users: AdminUser[]; total: number; totalPages: number; page: number }>> {
  const { data } = await apiClient.get('/admin/users', { params }); return data;
}
export async function setUserRole(userId: string, role: 'user' | 'admin'): Promise<ApiResponse<{ user: AdminUser }>> {
  const { data } = await apiClient.patch(`/admin/users/${userId}/role`, { role }); return data;
}
export async function verifyUser(userId: string): Promise<ApiResponse<{ user: AdminUser }>> {
  const { data } = await apiClient.patch(`/admin/users/${userId}/verify`); return data;
}
export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/admin/users/${userId}`);
}
export async function getReportedContent(page = 1): Promise<ApiResponse<{ posts: unknown[]; total: number; totalPages: number; page: number }>> {
  const { data } = await apiClient.get('/admin/reports', { params: { page } }); return data;
}
export async function hidePost(postId: string): Promise<void> {
  await apiClient.patch(`/admin/posts/${postId}/hide`);
}
export async function unhidePost(postId: string): Promise<void> {
  await apiClient.patch(`/admin/posts/${postId}/unhide`);
}
export async function deletePostAdmin(postId: string): Promise<void> {
  await apiClient.delete(`/admin/posts/${postId}`);
}
