import mongoose from 'mongoose';
import { Notification, NotificationType } from './notifications.model';
import { emitNotification }               from '../../sockets/socket.server';

const SENDER_SELECT = 'name username avatar';

export class NotificationsService {
  // ─── Core: create + emit ──────────────────────────────────────────────────
  static async create(payload: {
    recipientId: string;
    senderId:    string;
    type:        NotificationType;
    entityType:  'Post' | 'Project' | 'Comment' | 'Connection' | 'User';
    entityId:    string;
    message:     string;
    meta?:       { postContent?: string; projectTitle?: string; commentContent?: string };
  }) {
    // Never notify yourself
    if (payload.recipientId === payload.senderId) return null;

    // Deduplicate: one notification per sender+recipient+type+entity
    const existing = await Notification.findOne({
      recipient:  payload.recipientId,
      sender:     payload.senderId,
      type:       payload.type,
      entityId:   payload.entityId,
    });

    if (existing) {
      // Reset read state and timestamp (re-surfaces the notification)
      existing.isRead    = false;
      existing.message   = payload.message;
      await existing.save();
      await existing.populate('sender', SENDER_SELECT);
      emitNotification(payload.recipientId, existing);
      return existing;
    }

    const notification = await Notification.create({
      recipient:  payload.recipientId,
      sender:     payload.senderId,
      type:       payload.type,
      entityType: payload.entityType,
      entityId:   payload.entityId,
      message:    payload.message,
      meta:       payload.meta,
    });

    await notification.populate('sender', SENDER_SELECT);

    // Real-time fanout via Socket.io
    emitNotification(payload.recipientId, notification);

    return notification;
  }

  // ─── List for a user (paginated, newest first) ────────────────────────────
  static async list(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', SENDER_SELECT)
        .lean(),
      Notification.countDocuments({ recipient: userId }),
    ]);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead:    false,
    });

    return {
      notifications,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      unreadCount,
    };
  }

  // ─── Unread count only (for badge) ────────────────────────────────────────
  static async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ recipient: userId, isRead: false });
  }

  // ─── Mark one as read ──────────────────────────────────────────────────────
  static async markRead(notificationId: string, userId: string) {
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { $set: { isRead: true } },
    );
  }

  // ─── Mark all as read ──────────────────────────────────────────────────────
  static async markAllRead(userId: string) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } },
    );
  }

  // ─── Delete one ───────────────────────────────────────────────────────────
  static async delete(notificationId: string, userId: string) {
    await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  }

  // ─── Factory helpers called by other services ─────────────────────────────

  static notifyPostLike(recipientId: string, senderId: string, senderName: string, postId: string, postContent: string) {
    return this.create({
      recipientId,
      senderId,
      type:       'post_like',
      entityType: 'Post',
      entityId:   postId,
      message:    `${senderName} liked your post`,
      meta:       { postContent: postContent.slice(0, 80) },
    });
  }

  static notifyPostComment(recipientId: string, senderId: string, senderName: string, postId: string, commentContent: string) {
    return this.create({
      recipientId,
      senderId,
      type:       'post_comment',
      entityType: 'Post',
      entityId:   postId,
      message:    `${senderName} commented on your post`,
      meta:       { commentContent: commentContent.slice(0, 80) },
    });
  }

  static notifyCommentLike(recipientId: string, senderId: string, senderName: string, commentId: string, commentContent: string) {
    return this.create({
      recipientId,
      senderId,
      type:       'comment_like',
      entityType: 'Comment',
      entityId:   commentId,
      message:    `${senderName} liked your comment`,
      meta:       { commentContent: commentContent.slice(0, 80) },
    });
  }

  static notifyProjectLike(recipientId: string, senderId: string, senderName: string, projectId: string, projectTitle: string) {
    return this.create({
      recipientId,
      senderId,
      type:       'project_like',
      entityType: 'Project',
      entityId:   projectId,
      message:    `${senderName} liked your project`,
      meta:       { projectTitle },
    });
  }

  static notifyProjectSave(recipientId: string, senderId: string, senderName: string, projectId: string, projectTitle: string) {
    return this.create({
      recipientId,
      senderId,
      type:       'project_save',
      entityType: 'Project',
      entityId:   projectId,
      message:    `${senderName} saved your project`,
      meta:       { projectTitle },
    });
  }

  static notifyConnectionRequest(recipientId: string, senderId: string, senderName: string) {
    return this.create({
      recipientId,
      senderId,
      type:       'connection_request',
      entityType: 'User',
      entityId:   senderId,
      message:    `${senderName} sent you a connection request`,
    });
  }

  static notifyConnectionAccepted(recipientId: string, senderId: string, senderName: string) {
    return this.create({
      recipientId,
      senderId,
      type:       'connection_accepted',
      entityType: 'User',
      entityId:   senderId,
      message:    `${senderName} accepted your connection request`,
    });
  }
}
