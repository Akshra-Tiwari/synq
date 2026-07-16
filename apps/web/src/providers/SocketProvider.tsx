'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Socket }  from 'socket.io-client';
import {
  createSocket,
  disconnectSocket,
  getSocket,
  type ServerToClientEvents,
  type ClientToServerEvents,
} from '../lib/socket/socket.client';
import { useAuthStore }    from '../lib/store/auth.store';
import { useChatStore }    from '../lib/store/chat.store';

interface SocketContextValue {
  socket:    Socket<ServerToClientEvents, ClientToServerEvents> | null;
  connected: boolean;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextValue>({
  socket:      null,
  connected:   false,
  onlineUsers: new Set(),
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { receiveMessage, setTyping, clearTyping, markConversationRead } = useChatStore();

  const [connected,   setConnected]   = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = createSocket(accessToken);
    socketRef.current = socket;

    socket.on('connect',    () => { setConnected(true);  });
    socket.on('disconnect', () => { setConnected(false); });

    // ── Incoming message ────────────────────────────────────────────────────
    socket.on('message:new', (message) => {
      receiveMessage(message);
    });

    // ── Read receipts ───────────────────────────────────────────────────────
    socket.on('messages:read', ({ conversationId, userId }) => {
      markConversationRead(conversationId, userId);
    });

    // ── Typing indicators ───────────────────────────────────────────────────
    socket.on('typing:start', ({ conversationId, userId, username }) => {
      setTyping(conversationId, userId, username);
    });

    socket.on('typing:stop', ({ conversationId, userId }) => {
      clearTyping(conversationId, userId);
    });

    // ── Presence ────────────────────────────────────────────────────────────
    socket.on('user:online', ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on('user:offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('message:new');
      socket.off('messages:read');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('user:online');
      socket.off('user:offline');
    };
  }, [isAuthenticated, accessToken, receiveMessage, setTyping, clearTyping, markConversationRead]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
