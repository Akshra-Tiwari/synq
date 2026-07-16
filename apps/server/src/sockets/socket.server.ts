import { Server as HttpServer }    from 'http';
import { Server as SocketServer }  from 'socket.io';
import { env }                     from '../config/env';
import { TokenService }            from '../services/token.service';
import { User }                    from '../modules/users/users.model';
import { MessagesService }         from '../modules/messages/messages.service';

export interface SocketData {
  userId:   string;
  username: string;
}

// Online users: userId → Set of socketIds (multi-tab/device support)
const onlineUsers = new Map<string, Set<string>>();

let io: SocketServer;

export function initSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin:      env.FRONTEND_URL,
      credentials: true,
    },
    pingTimeout:  60000,
    pingInterval: 25000,
  });

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) return next(new Error('Unauthorized: no token'));

      const payload = TokenService.verifyAccessToken(token);
      const user    = await User.findById(payload.sub).select('username').lean();
      if (!user) return next(new Error('Unauthorized: user not found'));

      socket.data.userId   = payload.sub;
      socket.data.username = (user as { username: string }).username;
      next();
    } catch {
      next(new Error('Unauthorized: invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId } = socket.data as SocketData;

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)!.add(socket.id);

    socket.join(`user:${userId}`);
    socket.broadcast.emit('user:online', { userId });

    console.log(`Socket connected: ${socket.data.username} (${socket.id})`);

    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        conversationId,
        userId,
        username: socket.data.username,
      });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId,
      });
    });

    socket.on('messages:read', async (conversationId: string) => {
      try {
        await MessagesService.markAsRead(conversationId, userId);
        socket.to(`conversation:${conversationId}`).emit('messages:read', {
          conversationId,
          userId,
          readAt: new Date().toISOString(),
        });
      } catch { /* ignore */ }
    });

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user:offline', { userId });
          User.findByIdAndUpdate(userId, { lastSeen: new Date() }).exec();
        }
      }
      console.log(`Socket disconnected: ${socket.data.username} (${socket.id})`);
    });
  });

  console.log('Socket.io initialized');
  return io;
}

export function emitNewMessage(conversationId: string, message: unknown) {
  getIO().to(`conversation:${conversationId}`).emit('message:new', message);
}

export function emitNotification(userId: string, notification: unknown) {
  getIO().to(`user:${userId}`).emit('notification:new', notification);
}

export function emitConnectionRequest(recipientId: string, data: unknown) {
  getIO().to(`user:${recipientId}`).emit('connection:request', data);
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId) && (onlineUsers.get(userId)?.size ?? 0) > 0;
}

export function getOnlineUserIds(): string[] {
  return Array.from(onlineUsers.keys());
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.io not initialized.');
  return io;
}
