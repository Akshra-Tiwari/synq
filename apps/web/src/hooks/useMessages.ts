'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useChatStore }    from '../lib/store/chat.store';
import { useSocket }       from '../providers/SocketProvider';
import * as messagesApi    from '../lib/api/messages.api';
import { getApiErrorMessage } from '../lib/utils/errors';

// ─── Load and manage conversation list ────────────────────────────────────────
export function useConversations() {
  const { conversations, conversationsLoaded, setConversations } = useChatStore();

  useEffect(() => {
    if (conversationsLoaded) return;
    messagesApi.getConversations()
      .then((res) => setConversations(res.data.conversations))
      .catch(() => {});
  }, [conversationsLoaded, setConversations]);

  return { conversations };
}

// ─── Manage a single conversation ─────────────────────────────────────────────
export function useMessages(conversationId: string) {
  const {
    messageMap, hasMoreMap, cursorMap, typingMap,
    setMessages, prependMessages, receiveMessage, deleteMessage,
  } = useChatStore();

  const { socket } = useSocket();
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping    = useRef(false);

  const messages  = messageMap[conversationId] ?? [];
  const hasMore   = hasMoreMap[conversationId] ?? false;
  const cursor    = cursorMap[conversationId];
  const typers    = typingMap[conversationId] ?? [];

  // Join conversation room on mount
  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit('conversation:join', conversationId);

    return () => {
      socket.emit('conversation:leave', conversationId);
      stopTyping();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, conversationId]);

  // Load initial messages
  useEffect(() => {
    if (!conversationId || messages.length > 0) return;

    messagesApi.getMessages(conversationId).then((res) => {
      setMessages(conversationId, res.data.messages, res.data.hasMore, res.data.nextCursor);
      // Mark as read via socket
      socket?.emit('messages:read', conversationId);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Load older messages
  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor) return;
    try {
      const res = await messagesApi.getMessages(conversationId, cursor);
      prependMessages(conversationId, res.data.messages, res.data.hasMore, res.data.nextCursor);
    } catch { /* ignore */ }
  }, [conversationId, hasMore, cursor, prependMessages]);

  // Send message (REST → server emits socket to recipient)
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    stopTyping();
    try {
      const res = await messagesApi.sendMessage(conversationId, content);
      // Optimistically add to local store (server will also emit via socket)
      receiveMessage(res.data.message);
      return res.data.message;
    } catch (e) {
      throw new Error(getApiErrorMessage(e));
    }
  }, [conversationId, receiveMessage]);

  // Delete message
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await messagesApi.deleteMessage(conversationId, messageId);
      deleteMessage(conversationId, messageId);
    } catch { /* ignore */ }
  }, [conversationId, deleteMessage]);

  // Typing indicators with auto-stop after 2.5s
  const startTyping = useCallback(() => {
    if (!socket) return;
    if (!isTyping.current) {
      socket.emit('typing:start', conversationId);
      isTyping.current = true;
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => stopTyping(), 2500);
  }, [socket, conversationId]);

  const stopTyping = useCallback(() => {
    if (!socket || !isTyping.current) return;
    socket.emit('typing:stop', conversationId);
    isTyping.current = false;
    if (typingTimer.current) clearTimeout(typingTimer.current);
  }, [socket, conversationId]);

  // Mark read when user opens conversation
  const markRead = useCallback(() => {
    socket?.emit('messages:read', conversationId);
    messagesApi.markAsRead(conversationId).catch(() => {});
  }, [socket, conversationId]);

  return {
    messages,
    hasMore,
    typers,
    loadMore,
    sendMessage,
    deleteMessage: handleDeleteMessage,
    startTyping,
    stopTyping,
    markRead,
  };
}
