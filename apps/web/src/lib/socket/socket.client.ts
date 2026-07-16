import { io, Socket } from 'socket.io-client';

// ─── Typed socket events ──────────────────────────────────────────────────────
export interface ServerToClientEvents {
  'message:new':       (message: ChatMessage) => void;
  'messages:read':     (data: { conversationId: string; userId: string; readAt: string }) => void;
  'typing:start':      (data: { conversationId: string; userId: string; username: string }) => void;
  'typing:stop':       (data: { conversationId: string; userId: string }) => void;
  'user:online':       (data: { userId: string }) => void;
  'user:offline':      (data: { userId: string }) => void;
  'notification:new':  (notification: unknown) => void;
  'connection:request':(data: unknown) => void;
}

export interface ClientToServerEvents {
  'conversation:join':  (conversationId: string) => void;
  'conversation:leave': (conversationId: string) => void;
  'typing:start':       (conversationId: string) => void;
  'typing:stop':        (conversationId: string) => void;
  'messages:read':      (conversationId: string) => void;
}

export interface ChatMessage {
  _id:          string;
  conversation: string;
  sender: {
    _id:      string;
    name:     string;
    username: string;
    avatar?:  string;
  };
  content:    string;
  type:       'text' | 'image';
  imageUrl?:  string;
  readBy:     { user: string; readAt: string }[];
  isDeleted:  boolean;
  createdAt:  string;
  updatedAt:  string;
}

export interface Conversation {
  _id: string;
  participants: {
    _id:      string;
    name:     string;
    username: string;
    avatar?:  string;
  }[];
  lastMessage?: {
    content: string;
    sender:  { _id: string; name: string; username: string };
    sentAt:  string;
    type:    'text' | 'image';
  };
  unreadCount: number;
  updatedAt:   string;
}

let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
  return socketInstance;
}

export function createSocket(
  token: string,
): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (socketInstance?.connected) return socketInstance;

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:5000';

  socketInstance = io(SOCKET_URL, {
    auth:               { token },
    transports:         ['websocket', 'polling'],
    reconnection:       true,
    reconnectionDelay:  1000,
    reconnectionAttempts: 5,
    timeout:            10000,
  }) as Socket<ServerToClientEvents, ClientToServerEvents>;

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
