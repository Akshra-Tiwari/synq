'use client';

import Link       from 'next/link';
import { Avatar } from '../shared/Avatar';
import { useConversations } from '../../hooks/useMessages';
import { useSocket }        from '../../providers/SocketProvider';
import { useAuthStore }     from '../../lib/store/auth.store';
import { timeAgo }          from '../../lib/utils/format';

interface ConversationListProps { activeId?: string; }

export function ConversationList({ activeId }: ConversationListProps) {
  const { user }          = useAuthStore();
  const { conversations } = useConversations();
  const { onlineUsers }   = useSocket();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
          style={{ background:'rgba(109,129,150,0.08)', border:'1px solid rgba(109,129,150,0.1)' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color:'#50606E' }}>
            <path d="M17.5 10a7.5 7.5 0 01-10.6 6.8L2 18l1.2-4.9A7.5 7.5 0 1117.5 10z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color:'#6D8196' }}>No messages yet</p>
        <p className="text-xs mt-1" style={{ color:'#50606E' }}>Connect with developers to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4" style={{ borderBottom:'1px solid rgba(109,129,150,0.08)' }}>
        <h2 className="text-sm font-semibold" style={{ color:'#94A2AF' }}>Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(conv => {
          const peer    = conv.participants.find(p => p._id !== user?._id);
          if (!peer) return null;
          const isOnline = onlineUsers.has(peer._id);
          const isActive = conv._id === activeId;
          const unread   = conv.unreadCount ?? 0;

          return (
            <Link key={conv._id} href={`/messages/${conv._id}`}
              className="flex items-center gap-3 px-4 py-3 transition-all border-l-2"
              style={isActive
                ? { background:'rgba(1,121,111,0.08)', borderLeftColor:'#01796F' }
                : { borderLeftColor:'transparent' }}>
              <Avatar src={peer.avatar} name={peer.name} size="md" online={isOnline} className="shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm truncate"
                    style={{ color: unread > 0 ? '#DCE4EC' : '#94A2AF', fontWeight: unread > 0 ? 600 : 500 }}>
                    {peer.name}
                  </p>
                  {conv.lastMessage?.sentAt && (
                    <span className="text-[10px] shrink-0" style={{ color:'#50606E' }}>
                      {timeAgo(conv.lastMessage.sentAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs truncate" style={{ color: unread > 0 ? '#6D8196' : '#50606E' }}>
                    {conv.lastMessage ? (conv.lastMessage.type === 'image' ? '📷 Image' : conv.lastMessage.content) : 'Start a conversation'}
                  </p>
                  {unread > 0 && (
                    <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ background:'#01796F' }}>
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
