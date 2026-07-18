'use client';

import { useState } from 'react';
import { useNotifications }   from '../../../hooks/useNotifications';
import { NotificationItem }   from '../../../components/notifications/NotificationItem';
import { Spinner, EmptyState } from '../../../components/shared/UI';
import { cn }                  from '../../../lib/utils/cn';

type Filter = 'all' | 'unread';

export default function NotificationsPage() {
  const {
    notifications, unreadCount, total, totalPages, page,
    loaded, markRead, markAllRead, remove, loadMore,
  } = useNotifications();

  const [filter, setFilter] = useState<Filter>('all');

  const displayed = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  // Group by today / yesterday / older
  const now        = new Date();
  const todayStr   = now.toDateString();
  const yestDate   = new Date(now); yestDate.setDate(yestDate.getDate() - 1);
  const yestStr    = yestDate.toDateString();

  const groups: { label: string; items: typeof notifications }[] = [];
  const todays  = displayed.filter((n) => new Date(n.createdAt).toDateString() === todayStr);
  const yests   = displayed.filter((n) => new Date(n.createdAt).toDateString() === yestStr);
  const older   = displayed.filter((n) => {
    const d = new Date(n.createdAt).toDateString();
    return d !== todayStr && d !== yestStr;
  });

  if (todays.length)  groups.push({ label: 'Today',     items: todays });
  if (yests.length)   groups.push({ label: 'Yesterday', items: yests });
  if (older.length)   groups.push({ label: 'Earlier',   items: older });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#E2EBE4] tracking-tight">Notifications</h1>
          <p className="text-sm text-[#5A7A5E] mt-0.5">
            {total > 0 ? `${total} notification${total !== 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(1,121,111,0.06)] border border-white/[0.07] text-sm text-[#7A9A7E] hover:text-[#C8DCC9] hover:bg-white/[0.07] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-[rgba(23,37,24,0.8)] border border-[rgba(1,121,111,0.1)] rounded-xl w-fit">
        {(['all', 'unread'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all',
              filter === f
                ? 'bg-white/[0.08] text-[#C8DCC9]'
                : 'text-[#5A7A5E] hover:text-[#9EB5A0]',
            )}
          >
            {f}
            {f === 'unread' && unreadCount > 0 && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                filter === 'unread'
                  ? 'bg-[#01796F]/25 text-teal-300'
                  : 'bg-[rgba(1,121,111,0.08)] text-[#3A6A3E]',
              )}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {!loaded ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : displayed.length === 0 ? (
        <EmptyState
          title={filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          description={
            filter === 'unread'
              ? 'You have no unread notifications.'
              : 'When someone likes your posts, comments, or connects with you, you&apos;ll see it here.'
          }
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3a7 7 0 00-7 7v4l-2 3h18l-2-3v-4a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          }
        />
      ) : (
        <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
          {groups.map(({ label, items }) => (
            <div key={label}>
              {/* Date group header */}
              <div className="px-4 py-2 bg-[rgba(23,37,24,0.7)]">
                <p className="text-xs font-semibold text-[#3A6A3E] uppercase tracking-wider">{label}</p>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {items.map((n) => (
                  <NotificationItem
                    key={n._id}
                    notification={n}
                    onRead={markRead}
                    onDelete={remove}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Load more */}
          {page < totalPages && (
            <div className="p-4 flex justify-center">
              <button
                onClick={loadMore}
                className="px-5 py-2 rounded-xl bg-[rgba(1,121,111,0.06)] border border-white/[0.07] text-sm text-[#7A9A7E] hover:text-[#C8DCC9] hover:bg-white/[0.07] transition-all"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
