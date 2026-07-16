'use client';

import Image from 'next/image';
import { timeAgo } from '../../lib/utils/format';
import type { ChatMessage } from '../../lib/socket/socket.client';

interface MessageBubbleProps {
  message:       ChatMessage;
  isOwn:         boolean;
  showAvatar:    boolean;
  onDelete?:     (messageId: string) => void;
  currentUserId: string;
}

export function MessageBubble({ message, isOwn, showAvatar, onDelete }: MessageBubbleProps) {
  if (message.isDeleted) {
    return (
      <div className={`flex items-end gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
        <div className="w-7 shrink-0"/>
        <span className="text-xs italic px-3 py-1.5 rounded-xl"
          style={{ color:'#50606E', background:'rgba(109,129,150,0.06)', border:'1px solid rgba(109,129,150,0.1)' }}>
          This message was deleted
        </span>
      </div>
    );
  }

  const readByOthers = message.readBy.some(r => r.user !== message.sender._id);

  return (
    <div className={`flex items-end gap-2 mb-1 group ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isOwn && (
        <div className="w-7 shrink-0">
          {showAvatar ? (
            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-white text-[9px] font-semibold"
              style={{ background:'#01796F' }}>
              {message.sender.avatar
                ? <Image src={message.sender.avatar} alt={message.sender.name} width={28} height={28} className="object-cover"/>
                : message.sender.name.charAt(0).toUpperCase()}
            </div>
          ) : null}
        </div>
      )}

      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
        {!isOwn && showAvatar && (
          <span className="text-[10px] mb-1 ml-1" style={{ color:'#50606E' }}>{message.sender.name}</span>
        )}

        <div className="relative px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={isOwn
            ? { background:'linear-gradient(135deg,#01796F,#015a53)', color:'white', borderBottomRightRadius:'4px' }
            : { background:'rgba(18,26,38,0.9)', border:'1px solid rgba(109,129,150,0.12)', color:'#DCE4EC', borderBottomLeftRadius:'4px' }}>

          {message.type === 'image' && message.imageUrl && (
            <div className="mb-2 rounded-xl overflow-hidden">
              <Image src={message.imageUrl} alt="Image" width={280} height={180} className="object-cover"/>
            </div>
          )}

          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {isOwn && onDelete && (
            <button onClick={() => onDelete(message._id)}
              className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all"
              style={{ color:'#50606E' }}
              title="Delete message">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 3h8M4 3V2h4v1M4.5 5v3.5M7.5 5v3.5M3 3l.5 7h5l.5-7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px]" style={{ color:'#50606E' }}>{timeAgo(message.createdAt)}</span>
          {isOwn && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              style={{ color: readByOthers ? '#01796F' : '#50606E' }}>
              {readByOthers
                ? <><path d="M1 7l3.5 3.5L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 7l3.5 3.5L14 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></>
                : <path d="M2.5 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              }
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
