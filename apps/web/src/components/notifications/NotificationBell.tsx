'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications }  from '../../hooks/useNotifications';
import { NotificationItem }  from './NotificationItem';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-xl transition-all"
        style={open
          ? { background:'rgba(1,121,111,0.12)', color:'#01796F' }
          : { color:'#50606E' }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.color='#94A2AF'; e.currentTarget.style.background='rgba(109,129,150,0.08)'; }}}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.color='#50606E'; e.currentTarget.style.background=''; }}}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2a5 5 0 00-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 14.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-0.5 rounded-full text-white text-[9px] font-bold flex items-center justify-center ring-2"
            style={{ background:'linear-gradient(135deg,#01796F,#00c4b4)', ringColor:'#08120A' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50"
          style={{ background:'#0D131C', border:'1px solid rgba(109,129,150,0.12)' }}>
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom:'1px solid rgba(109,129,150,0.08)' }}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold" style={{ color:'#DCE4EC' }}>Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background:'rgba(1,121,111,0.12)', color:'#00c4b4', border:'1px solid rgba(1,121,111,0.2)' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={() => markAllRead()} className="text-xs transition-colors"
                style={{ color:'#01796F' }}>
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y" style={{ divideColor:'rgba(109,129,150,0.06)' }}>
            {notifications.slice(0, 5).length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm" style={{ color:'#50606E' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 5).map(n => (
                <NotificationItem key={n._id} notification={n} onRead={markRead} onDelete={remove}/>
              ))
            )}
          </div>

          {notifications.length > 5 && (
            <div className="px-4 py-2.5" style={{ borderTop:'1px solid rgba(109,129,150,0.08)' }}>
              <Link href="/notifications" onClick={() => setOpen(false)}
                className="text-xs transition-colors" style={{ color:'#01796F' }}>
                View all {notifications.length} notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
