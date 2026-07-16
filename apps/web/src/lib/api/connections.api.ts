import apiClient from './client';
import type { User } from './auth.api';

export type ConnectionStatus = 'none' | 'pending' | 'accepted' | 'rejected' | 'removed';

export interface ConnectionPeer {
  connectionId: string;
  connectedAt?: string;
  requestedAt?: string;
  user: Partial<User>;
}

export interface ConnectionStatusResult {
  status:       ConnectionStatus;
  connectionId: string | null;
  isSender?:    boolean;
}

interface ApiResponse<T> { success: boolean; message: string; data: T; }

// ─── Actions ──────────────────────────────────────────────────────────────────
export async function sendRequest(userId: string): Promise<ApiResponse<{ connection: unknown }>> {
  const { data } = await apiClient.post(`/connections/request/${userId}`);
  return data;
}

export async function acceptRequest(userId: string): Promise<ApiResponse<{ connection: unknown }>> {
  const { data } = await apiClient.post(`/connections/accept/${userId}`);
  return data;
}

export async function rejectRequest(userId: string): Promise<ApiResponse<{ connection: unknown }>> {
  const { data } = await apiClient.post(`/connections/reject/${userId}`);
  return data;
}

export async function removeConnection(userId: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.delete(`/connections/remove/${userId}`);
  return data;
}

export async function withdrawRequest(userId: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.post(`/connections/withdraw/${userId}`);
  return data;
}

// ─── Queries ──────────────────────────────────────────────────────────────────
export async function getStatus(userId: string): Promise<ApiResponse<ConnectionStatusResult>> {
  const { data } = await apiClient.get(`/connections/status/${userId}`);
  return data;
}

export async function getMyConnections(page = 1): Promise<ApiResponse<{
  connections: ConnectionPeer[];
  total: number;
  totalPages: number;
  page: number;
}>> {
  const { data } = await apiClient.get('/connections/my', { params: { page } });
  return data;
}

export async function getUserConnections(userId: string, page = 1): Promise<ApiResponse<{
  connections: ConnectionPeer[];
  total: number;
  totalPages: number;
  page: number;
}>> {
  const { data } = await apiClient.get(`/connections/user/${userId}`, { params: { page } });
  return data;
}

export async function getPendingReceived(): Promise<ApiResponse<{ requests: ConnectionPeer[] }>> {
  const { data } = await apiClient.get('/connections/pending/received');
  return data;
}

export async function getPendingSent(): Promise<ApiResponse<{ requests: ConnectionPeer[] }>> {
  const { data } = await apiClient.get('/connections/pending/sent');
  return data;
}

export async function getMutualCount(userId: string): Promise<ApiResponse<{ count: number }>> {
  const { data } = await apiClient.get(`/connections/mutual/${userId}`);
  return data;
}

export async function getSuggestions(): Promise<ApiResponse<{ users: Partial<User>[] }>> {
  const { data } = await apiClient.get('/connections/suggestions');
  return data;
}
