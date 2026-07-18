'use client';

import { ConversationList } from '../../../components/messaging/ConversationList';

export default function MessagesPage() {
  return (
    <div className="flex h-[calc(100vh-64px)] -mx-6 -my-8">
      {/* Conversation list */}
      <div className="w-80 shrink-0 border-r border-[rgba(1,121,111,0.1)] bg-[#0d0d12]">
        <ConversationList />
      </div>

      {/* Empty state for desktop when no conversation selected */}
      <div className="flex-1 hidden md:flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[rgba(23,37,24,0.8)] border border-[rgba(1,121,111,0.1)] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-[#3A6A3E]">
              <path d="M24 14a10 10 0 01-14.14 9.07L4 24l1.93-5.86A10 10 0 1124 14z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M9 14h.01M14 14h.01M19 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-[#7A9A7E]">Your messages</p>
          <p className="text-xs text-[#3A6A3E] max-w-xs">
            Select a conversation from the left, or visit a developer's profile to start chatting.
          </p>
        </div>
      </div>
    </div>
  );
}
