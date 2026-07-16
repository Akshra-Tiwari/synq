import apiClient from './client';

export type NotificationType =
  | 'post_like'
  | 'post_comment'
  | 'comment_like'
  | 'project_like'
  | 'project_save'
  | 'connection_request'
  | 'connection_accepted'
  | 'mention';

export interface Notification {
  _id:        string;
  recipient:  string;
  sender: {
    _id:      string;
    name:     string;
    username: string;
    avatar?:  string;
  };
  type:       NotificationType;
  isRead:     boolean;
  entityType: 'Post' | 'Project' | 'Comment' | 'Connection' | 'User';
  entityId:   string;
  message:    string;
  meta?: {
    postContent?:    string;
    projectTitle?:   string;
    commentContent?: string;
  };
  createdAt:  string;
}

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export async function listNotifications(page = 1): Promise<ApiResponse<{
  notifications: Notification[];
  total:         number;
  totalPages:    number;
  page:          number;
  unreadCount:   number;
}>> {
  const { data } = await apiClient.get('/notifications', { params: { page } });
  return data;
}

export async function getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
  const { data } = await apiClient.get('/notifications/unread');
  return data;
}

export async function markRead(notificationId: string): Promise<void> {
  await apiClient.patch(`/notifications/${notificationId}/read`);
}

export async function markAllRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all');
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await apiClient.delete(`/notifications/${notificationId}`);
}
