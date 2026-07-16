import { create } from 'zustand';
import type { Notification } from '../api/notifications.api';

interface NotificationsState {
  notifications:   Notification[];
  unreadCount:     number;
  total:           number;
  totalPages:      number;
  page:            number;
  loaded:          boolean;

  setNotifications: (data: {
    notifications: Notification[];
    total: number;
    totalPages: number;
    page: number;
    unreadCount: number;
  }) => void;
  prependNotification: (n: Notification) => void;
  markOneRead:     (id: string) => void;
  markAllRead:     () => void;
  removeOne:       (id: string) => void;
  setUnreadCount:  (n: number) => void;
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: [],
  unreadCount:   0,
  total:         0,
  totalPages:    1,
  page:          1,
  loaded:        false,

  setNotifications: ({ notifications, total, totalPages, page, unreadCount }) =>
    set({ notifications, total, totalPages, page, unreadCount, loaded: true }),

  prependNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount:   s.unreadCount + 1,
      total:         s.total + 1,
    })),

  markOneRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount:   0,
    })),

  removeOne: (id) =>
    set((s) => {
      const removed = s.notifications.find((n) => n._id === id);
      return {
        notifications: s.notifications.filter((n) => n._id !== id),
        unreadCount:   removed?.isRead ? s.unreadCount : Math.max(0, s.unreadCount - 1),
        total:         Math.max(0, s.total - 1),
      };
    }),

  setUnreadCount: (unreadCount) => set({ unreadCount }),
}));
