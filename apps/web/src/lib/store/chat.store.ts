import { create } from 'zustand';
import type { ChatMessage, Conversation } from '../socket/socket.client';

interface TypingUser {
  userId:   string;
  username: string;
}

interface ChatState {
  // Conversations list
  conversations:     Conversation[];
  conversationsLoaded: boolean;

  // Messages per conversationId
  messageMap:        Record<string, ChatMessage[]>;
  hasMoreMap:        Record<string, boolean>;
  cursorMap:         Record<string, string | undefined>;

  // Typing: conversationId → typing users
  typingMap:         Record<string, TypingUser[]>;

  // Total unread badge
  totalUnread:       number;

  // Actions
  setConversations:  (convs: Conversation[]) => void;
  upsertConversation:(conv: Conversation) => void;
  setMessages:       (conversationId: string, msgs: ChatMessage[], hasMore: boolean, cursor?: string) => void;
  prependMessages:   (conversationId: string, msgs: ChatMessage[], hasMore: boolean, cursor?: string) => void;
  receiveMessage:    (msg: ChatMessage) => void;
  deleteMessage:     (conversationId: string, messageId: string) => void;
  setTyping:         (conversationId: string, userId: string, username: string) => void;
  clearTyping:       (conversationId: string, userId: string) => void;
  markConversationRead: (conversationId: string, userId: string) => void;
  setTotalUnread:    (n: number) => void;
  incrementUnread:   (conversationId: string, forUserId: string) => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations:       [],
  conversationsLoaded: false,
  messageMap:          {},
  hasMoreMap:          {},
  cursorMap:           {},
  typingMap:           {},
  totalUnread:         0,

  setConversations: (conversations) =>
    set({ conversations, conversationsLoaded: true }),

  upsertConversation: (conv) =>
    set((s) => {
      const exists = s.conversations.find((c) => c._id === conv._id);
      if (exists) {
        return {
          conversations: s.conversations
            .map((c) => (c._id === conv._id ? { ...c, ...conv } : c))
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
        };
      }
      return { conversations: [conv, ...s.conversations] };
    }),

  setMessages: (conversationId, msgs, hasMore, cursor) =>
    set((s) => ({
      messageMap: { ...s.messageMap, [conversationId]: msgs },
      hasMoreMap: { ...s.hasMoreMap, [conversationId]: hasMore },
      cursorMap:  { ...s.cursorMap,  [conversationId]: cursor },
    })),

  prependMessages: (conversationId, msgs, hasMore, cursor) =>
    set((s) => ({
      messageMap: {
        ...s.messageMap,
        [conversationId]: [...msgs, ...(s.messageMap[conversationId] ?? [])],
      },
      hasMoreMap: { ...s.hasMoreMap, [conversationId]: hasMore },
      cursorMap:  { ...s.cursorMap,  [conversationId]: cursor },
    })),

  receiveMessage: (msg) =>
    set((s) => {
      const convId   = msg.conversation;
      const existing = s.messageMap[convId] ?? [];

      // Avoid duplicates
      if (existing.some((m) => m._id === msg._id)) return s;

      // Update conversation lastMessage + move to top
      const conversations = s.conversations.map((c) =>
        c._id === convId
          ? {
              ...c,
              lastMessage: {
                content: msg.isDeleted ? 'This message was deleted' : msg.content,
                sender:  msg.sender,
                sentAt:  msg.createdAt,
                type:    msg.type,
              },
              updatedAt: msg.createdAt,
            }
          : c,
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      return {
        messageMap:  { ...s.messageMap, [convId]: [...existing, msg] },
        conversations,
      };
    }),

  deleteMessage: (conversationId, messageId) =>
    set((s) => ({
      messageMap: {
        ...s.messageMap,
        [conversationId]: (s.messageMap[conversationId] ?? []).map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, content: 'This message was deleted' }
            : m,
        ),
      },
    })),

  setTyping: (conversationId, userId, username) =>
    set((s) => {
      const current = s.typingMap[conversationId] ?? [];
      if (current.some((u) => u.userId === userId)) return s;
      return {
        typingMap: {
          ...s.typingMap,
          [conversationId]: [...current, { userId, username }],
        },
      };
    }),

  clearTyping: (conversationId, userId) =>
    set((s) => ({
      typingMap: {
        ...s.typingMap,
        [conversationId]: (s.typingMap[conversationId] ?? []).filter(
          (u) => u.userId !== userId,
        ),
      },
    })),

  markConversationRead: (conversationId, _userId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c._id === conversationId ? { ...c, unreadCount: 0 } : c,
      ),
    })),

  setTotalUnread: (totalUnread) => set({ totalUnread }),

  incrementUnread: (conversationId, forUserId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c._id === conversationId
          ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1 }
          : c,
      ),
    })),
}));
