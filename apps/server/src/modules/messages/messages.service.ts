import mongoose from 'mongoose';
import { Conversation } from './conversation.model';
import { Message }      from './message.model';
import { User }         from '../users/users.model';
import { ApiError }     from '../../utils/ApiError';

const USER_SELECT = 'name username avatar';

export class MessagesService {
  // ─── Get or create 1-to-1 conversation ────────────────────────────────────
  static async getOrCreateConversation(userAId: string, userBId: string) {
    if (userAId === userBId) throw ApiError.badRequest('Cannot message yourself');

    const userBExists = await User.exists({ _id: userBId });
    if (!userBExists) throw ApiError.notFound('User not found');

    // Look for existing conversation with exactly these two participants
    const existing = await Conversation.findOne({
      participants: { $all: [userAId, userBId], $size: 2 },
    })
      .populate('participants', USER_SELECT)
      .lean();

    if (existing) return existing;

    const conversation = await Conversation.create({
      participants:  [userAId, userBId],
      unreadCounts:  { [userAId]: 0, [userBId]: 0 },
    });

    await conversation.populate('participants', USER_SELECT);
    return conversation;
  }

  // ─── Get all conversations for a user ────────────────────────────────────
  static async getConversations(userId: string) {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ updatedAt: -1 })
      .populate('participants', USER_SELECT)
      .populate('lastMessage.sender', 'name username')
      .lean();

    // Attach unread count for the requesting user
    return conversations.map((c) => ({
      ...c,
      unreadCount: (c.unreadCounts as Map<string, number> | Record<string, number>
      ) instanceof Map
        ? (c.unreadCounts as Map<string, number>).get(userId) ?? 0
        : (c.unreadCounts as Record<string, number>)[userId] ?? 0,
    }));
  }

  // ─── Get single conversation (guard: user must be participant) ─────────────
  static async getConversation(conversationId: string, userId: string) {
    const conv = await Conversation.findOne({
      _id:          conversationId,
      participants: userId,
    })
      .populate('participants', USER_SELECT)
      .lean();

    if (!conv) throw ApiError.notFound('Conversation not found');
    return conv;
  }

  // ─── Get messages (cursor-based, newest first) ─────────────────────────────
  static async getMessages(
    conversationId: string,
    userId:         string,
    cursor:         string | undefined,
    limit:          number,
  ) {
    // Verify participant
    const conv = await Conversation.exists({ _id: conversationId, participants: userId });
    if (!conv) throw ApiError.forbidden('Not a participant');

    const filter: Record<string, unknown> = {
      conversation: conversationId,
      isDeleted:    false,
    };

    if (cursor) {
      const cursorMsg = await Message.findById(cursor).select('createdAt');
      if (cursorMsg) filter.createdAt = { $lt: cursorMsg.createdAt };
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('sender', USER_SELECT)
      .lean();

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();

    return {
      messages:    messages.reverse(), // return chronological order
      nextCursor:  hasMore ? messages[0]?._id?.toString() : undefined,
      hasMore,
    };
  }

  // ─── Send a message ────────────────────────────────────────────────────────
  static async sendMessage(
    conversationId: string,
    senderId:       string,
    content:        string,
    type:           'text' | 'image' = 'text',
    imageUrl?:      string,
    imagePublicId?: string,
  ) {
    const conv = await Conversation.findOne({
      _id:          conversationId,
      participants: senderId,
    });
    if (!conv) throw ApiError.forbidden('Not a participant');

    const message = await Message.create({
      conversation: conversationId,
      sender:       senderId,
      content,
      type,
      imageUrl,
      imagePublicId,
      readBy: [{ user: senderId, readAt: new Date() }],
    });

    // Update conversation: lastMessage + increment unread for other participants
    const unreadUpdate: Record<string, number> = {};
    conv.participants.forEach((pid) => {
      const id = pid.toString();
      if (id !== senderId) {
        const current = (conv.unreadCounts as unknown as Record<string, number>)[id] ?? 0;
        unreadUpdate[`unreadCounts.${id}`] = current + 1;
      }
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        lastMessage: {
          content: type === 'image' ? '📷 Image' : content,
          sender:  senderId,
          sentAt:  new Date(),
          type,
        },
        ...unreadUpdate,
      },
    });

    await message.populate('sender', USER_SELECT);
    return message;
  }

  // ─── Mark conversation as read ─────────────────────────────────────────────
  static async markAsRead(conversationId: string, userId: string) {
    // Reset unread count for this user
    await Conversation.findOneAndUpdate(
      { _id: conversationId, participants: userId },
      { $set: { [`unreadCounts.${userId}`]: 0 } },
    );

    // Mark all unread messages as read
    const now = new Date();
    await Message.updateMany(
      {
        conversation: conversationId,
        isDeleted:    false,
        'readBy.user': { $ne: new mongoose.Types.ObjectId(userId) },
      },
      { $push: { readBy: { user: userId, readAt: now } } },
    );
  }

  // ─── Delete a message (soft delete) ───────────────────────────────────────
  static async deleteMessage(messageId: string, userId: string) {
    const message = await Message.findOne({ _id: messageId, sender: userId });
    if (!message) throw ApiError.notFound('Message not found or not authorised');

    message.isDeleted = true;
    message.content   = 'This message was deleted';
    await message.save();

    return message;
  }

  // ─── Total unread count across all conversations ──────────────────────────
  static async getTotalUnread(userId: string): Promise<number> {
    const conversations = await Conversation.find({
      participants: userId,
    }).select('unreadCounts').lean();

    return conversations.reduce((sum, c) => {
      const counts = c.unreadCounts as unknown as Record<string, number>;
      return sum + (counts[userId] ?? 0);
    }, 0);
  }
}
