'use client';

import { use, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore }       from '../../../../lib/store/auth.store';
import { useMessages }        from '../../../../hooks/useMessages';
import { useChatStore }       from '../../../../lib/store/chat.store';
import { useSocket }          from '../../../../providers/SocketProvider';
import { ConversationList }   from '../../../../components/messaging/ConversationList';
import { MessageBubble }      from '../../../../components/messaging/MessageBubble';
import { TypingIndicator }    from '../../../../components/messaging/TypingIndicator';
import { ChatInput }          from '../../../../components/messaging/ChatInput';
import { Avatar }             from '../../../../components/shared/Avatar';
import { Spinner }            from '../../../../components/shared/UI';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ConversationPage({ params }: PageProps) {
  const { id: conversationId } = use(params);
  const { user }               = useAuthStore();
  const { onlineUsers }        = useSocket();
  const { conversations }      = useChatStore();
  const {
    messages, hasMore, typers,
    loadMore, sendMessage, deleteMessage,
    startTyping, stopTyping, markRead,
  } = useMessages(conversationId);

  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef    = useRef<HTMLDivElement>(null);
  const firstLoad = useRef(true);

  // Find the peer from conversations store
  const conversation = conversations.find((c) => c._id === conversationId);
  const peer = conversation?.participants.find((p) => p._id !== user?._id);

  // Auto-scroll to bottom on new messages (first load only, then user controls)
  useEffect(() => {
    if (firstLoad.current && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
      firstLoad.current = false;
      markRead();
    }
  }, [messages.length, markRead]);

  // Infinite scroll upward — IntersectionObserver on top sentinel
  useEffect(() => {
    if (!topRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore) loadMore(); },
      { threshold: 0 },
    );
    observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const isOnline = peer ? onlineUsers.has(peer._id) : false;

  return (
    <div className="flex h-[calc(100vh-64px)] -mx-6 -my-8">
      {/* Left: conversation list */}
      <div className="w-80 shrink-0 border-r border-white/[0.05] bg-[#0d0d12] hidden md:block">
        <ConversationList activeId={conversationId} />
      </div>

      {/* Right: chat window */}
      <div className="flex-1 flex flex-col bg-[#0a0a0f] min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.05] bg-[#0d0d12] shrink-0">
          {/* Mobile back */}
          <Link href="/messages" className="md:hidden text-slate-500 hover:text-slate-300 transition-colors mr-1">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L7 9l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          {peer ? (
            <Link href={`/${peer.username}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <Avatar src={peer.avatar} name={peer.name} size="sm" online={isOnline} />
              <div>
                <p className="text-sm font-semibold text-slate-200">{peer.name}</p>
                <p className="text-xs text-slate-500">
                  {isOnline ? (
                    <span className="text-emerald-400">Online</span>
                  ) : (
                    <span>@{peer.username}</span>
                  )}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/[0.05] animate-pulse" />
              <div className="space-y-1">
                <div className="h-3 w-24 bg-white/[0.05] rounded animate-pulse" />
                <div className="h-2.5 w-16 bg-white/[0.04] rounded animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-0.5">
          {/* Top sentinel for infinite scroll */}
          <div ref={topRef} className="h-1" />

          {hasMore && (
            <div className="flex justify-center py-3">
              <Spinner size="sm" />
            </div>
          )}

          {messages.length === 0 && !hasMore && (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              {peer && <Avatar src={peer.avatar} name={peer.name} size="xl" className="mb-4" />}
              <p className="text-sm font-medium text-slate-400">
                {peer ? `Start a conversation with ${peer.name}` : 'No messages yet'}
              </p>
              <p className="text-xs text-slate-600 mt-1">Say hello 👋</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const prevMsg  = messages[idx - 1];
            const isOwn    = msg.sender._id === user?._id;
            const showAvatar = !prevMsg || prevMsg.sender._id !== msg.sender._id;

            return (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={isOwn}
                showAvatar={showAvatar}
                currentUserId={user?._id ?? ''}
                onDelete={isOwn ? deleteMessage : undefined}
              />
            );
          })}

          {/* Typing indicator */}
          <TypingIndicator names={typers.map((t) => t.username)} />

          {/* Bottom anchor */}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSend={sendMessage}
          onTypingStart={startTyping}
          onTypingStop={stopTyping}
        />
      </div>
    </div>
  );
}
