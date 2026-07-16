'use client';

import Link from 'next/link';
import { Avatar }  from '../shared/Avatar';
import { timeAgo } from '../../lib/utils/format';
import type { Notification, NotificationType } from '../../lib/api/notifications.api';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; href: (n: Notification) => string }> = {
  post_like:            { color:'rgba(1,121,111,0.12)',   href:n=>`/posts/${n.entityId}`,    icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 11S1 7.5 1 4a2.5 2.5 0 015 0 2.5 2.5 0 015 0c0 3.5-5.5 7-5.5 7z" stroke="#01796F" strokeWidth="1.3" fill="rgba(1,121,111,0.3)"/></svg> },
  post_comment:         { color:'rgba(109,129,150,0.12)', href:n=>`/posts/${n.entityId}`,    icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11.5 6.5a5 5 0 01-7.1 4.5L1 12l.9-3.4A5 5 0 1111.5 6.5z" stroke="#6D8196" strokeWidth="1.3" fill="rgba(109,129,150,0.25)"/></svg> },
  comment_like:         { color:'rgba(1,121,111,0.1)',    href:n=>`/posts/${n.entityId}`,    icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 11S1 7.5 1 4a2.5 2.5 0 015 0 2.5 2.5 0 015 0c0 3.5-5.5 7-5.5 7z" stroke="#01796F" strokeWidth="1.3"/></svg> },
  project_like:         { color:'rgba(176,196,222,0.1)',  href:n=>`/projects/${n.entityId}`, icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 5A1.5 1.5 0 013 3.5h3L7.5 5H11A1.5 1.5 0 0112.5 6.5v4.5A1.5 1.5 0 0111 12.5H2A1.5 1.5 0 01.5 11V5z" stroke="#B0C4DE" strokeWidth="1.2" fill="rgba(176,196,222,0.2)"/></svg> },
  project_save:         { color:'rgba(176,196,222,0.1)',  href:n=>`/projects/${n.entityId}`, icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2h9v10l-4.5-3L2 12V2z" stroke="#B0C4DE" strokeWidth="1.2" fill="rgba(176,196,222,0.2)"/></svg> },
  connection_request:   { color:'rgba(1,121,111,0.1)',    href:n=>`/${n.sender.username}`,   icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5" cy="3.5" r="2.5" stroke="#01796F" strokeWidth="1.2"/><path d="M1 10c0-2 1.8-3.5 4-3.5" stroke="#01796F" strokeWidth="1.2" strokeLinecap="round"/><path d="M10 7v4M8 9h4" stroke="#01796F" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  connection_accepted:  { color:'rgba(1,121,111,0.12)',   href:n=>`/${n.sender.username}`,   icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5" cy="3.5" r="2.5" stroke="#01796F" strokeWidth="1.2"/><path d="M1 10c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="#01796F" strokeWidth="1.2" strokeLinecap="round"/><path d="M9 8.5l1.5 1.5L13 7" stroke="#01796F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  mention:              { color:'rgba(109,129,150,0.1)',  href:n=>`/posts/${n.entityId}`,    icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2.5" stroke="#6D8196" strokeWidth="1.2"/><circle cx="6.5" cy="6.5" r="5.5" stroke="#6D8196" strokeWidth="1.2"/></svg> },
};

interface NotificationItemProps {
  notification: Notification;
  onRead:   (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification: n, onRead, onDelete }: NotificationItemProps) {
  const config = TYPE_CONFIG[n.type];
  const href   = config?.href(n) ?? '#';

  return (
    <div className="flex items-start gap-3 px-4 py-3 transition-all relative group"
      style={{ background: !n.isRead ? 'rgba(1,121,111,0.04)' : 'transparent' }}>
      {!n.isRead && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
          style={{ background:'#01796F' }}/>
      )}

      <Link href={`/${n.sender.username}`} className="shrink-0 mt-0.5">
        <Avatar src={n.sender.avatar} name={n.sender.name} size="sm"/>
      </Link>

      {/* Type icon */}
      <div className="absolute left-8 bottom-2.5 w-4 h-4 rounded-full flex items-center justify-center"
        style={{ background: config?.color ?? 'rgba(109,129,150,0.1)', border:'2px solid #08120A' }}>
        {config?.icon}
      </div>

      <div className="flex-1 min-w-0">
        <Link href={href} onClick={() => !n.isRead && onRead(n._id)} className="block">
          <p className="text-sm leading-snug" style={{ color: n.isRead ? '#94A2AF' : '#DCE4EC' }}>
            <span className="font-semibold">{n.sender.name}</span>
            {' '}{n.message.replace(n.sender.name, '').trim()}
          </p>
          {(n.meta?.postContent || n.meta?.commentContent || n.meta?.projectTitle) && (
            <p className="text-xs mt-0.5 truncate" style={{ color:'#50606E' }}>
              {n.meta.postContent || n.meta.commentContent || n.meta.projectTitle}
            </p>
          )}
          <p className="text-xs mt-1" style={{ color: n.isRead ? '#50606E' : '#01796F' }}>
            {timeAgo(n.createdAt)}
          </p>
        </Link>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!n.isRead && (
          <button onClick={() => onRead(n._id)} title="Mark as read"
            className="p-1 rounded-lg transition-colors"
            style={{ color:'#50606E' }}
            onMouseEnter={e => { e.currentTarget.style.color='#01796F'; e.currentTarget.style.background='rgba(1,121,111,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='#50606E'; e.currentTarget.style.background=''; }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1.5 5.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <button onClick={() => onDelete(n._id)} title="Delete"
          className="p-1 rounded-lg transition-colors"
          style={{ color:'#50606E' }}
          onMouseEnter={e => { e.currentTarget.style.color='#ef4444'; e.currentTarget.style.background='rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='#50606E'; e.currentTarget.style.background=''; }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
