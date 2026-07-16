'use client';

import { useCallback, useEffect } from 'react';
import { useNotificationsStore }  from '../lib/store/notifications.store';
import { useSocket }              from '../providers/SocketProvider';
import * as notificationsApi      from '../lib/api/notifications.api';
import type { Notification }      from '../lib/api/notifications.api';

export function useNotifications() {
  const store  = useNotificationsStore();
  const { socket } = useSocket();

  // Load on first use
  useEffect(() => {
    if (store.loaded) return;
    notificationsApi.listNotifications(1)
      .then((res) => store.setNotifications(res.data))
      .catch(() => {});
  }, [store.loaded, store]);

  // Wire real-time incoming notifications from SocketProvider
  useEffect(() => {
    if (!socket) return;
    const handler = (notification: unknown) => {
      store.prependNotification(notification as Notification);
    };
    socket.on('notification:new', handler);
    return () => { socket.off('notification:new', handler); };
  }, [socket, store]);

  const markRead = useCallback(async (id: string) => {
    store.markOneRead(id);   // optimistic
    await notificationsApi.markRead(id).catch(() => {});
  }, [store]);

  const markAllRead = useCallback(async () => {
    store.markAllRead();     // optimistic
    await notificationsApi.markAllRead().catch(() => {});
  }, [store]);

  const remove = useCallback(async (id: string) => {
    store.removeOne(id);     // optimistic
    await notificationsApi.deleteNotification(id).catch(() => {});
  }, [store]);

  const loadMore = useCallback(async () => {
    if (store.page >= store.totalPages) return;
    const res = await notificationsApi.listNotifications(store.page + 1);
    store.setNotifications({
      ...res.data,
      notifications: [...store.notifications, ...res.data.notifications],
    });
  }, [store]);

  return {
    notifications: store.notifications,
    unreadCount:   store.unreadCount,
    total:         store.total,
    totalPages:    store.totalPages,
    page:          store.page,
    loaded:        store.loaded,
    markRead,
    markAllRead,
    remove,
    loadMore,
  };
}
