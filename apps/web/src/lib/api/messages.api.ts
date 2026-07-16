import apiClient from './client';
import type { ChatMessage, Conversation } from '../socket/socket.client';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export async function getConversations(): Promise<ApiResponse<{ conversations: Conversation[] }>> {
  const { data } = await apiClient.get('/messages');
  return data;
}

export async function getOrCreateConversation(userId: string): Promise<ApiResponse<{ conversation: Conversation }>> {
  const { data } = await apiClient.get(`/messages/with/${userId}`);
  return data;
}

export async function getMessages(
  conversationId: string,
  cursor?: string,
  limit = 30,
): Promise<ApiResponse<{ messages: ChatMessage[]; nextCursor?: string; hasMore: boolean }>> {
  const { data } = await apiClient.get(`/messages/${conversationId}`, {
    params: { cursor, limit },
  });
  return data;
}

export async function sendMessage(
  conversationId: string,
  content: string,
  type: 'text' | 'image' = 'text',
): Promise<ApiResponse<{ message: ChatMessage }>> {
  const { data } = await apiClient.post(`/messages/${conversationId}`, { content, type });
  return data;
}

export async function markAsRead(conversationId: string): Promise<void> {
  await apiClient.patch(`/messages/${conversationId}/read`);
}

export async function deleteMessage(
  conversationId: string,
  messageId: string,
): Promise<ApiResponse<{ message: ChatMessage }>> {
  const { data } = await apiClient.delete(`/messages/${conversationId}/messages/${messageId}`);
  return data;
}

export async function getTotalUnread(): Promise<ApiResponse<{ count: number }>> {
  const { data } = await apiClient.get('/messages/unread');
  return data;
}
