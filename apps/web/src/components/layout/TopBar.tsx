'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore }     from '../../lib/store/auth.store';
import { Avatar }           from '../shared/Avatar';
import { SynqLogo }         from '../shared/Logo';
import { NotificationBell } from '../notifications/NotificationBell';

export function TopBar() {
  const { user }  = useAuthStore();
  const router    = useRouter();
  const [q, setQ] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="fixed top-0 left-0 md:left-60 right-0 h-16 flex items-center gap-3 px-4 md:px-6 z-30"
      style={{
        background:    'rgba(14,26,15,0.92)',
        backdropFilter:'blur(20px)',
        borderBottom:  '1px solid rgba(1,121,111,0.12)',
        boxShadow:     '0 1px 0 rgba(0,196,180,0.04)',
      }}>
      <div className="md:hidden"><SynqLogo size="sm"/></div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color:'#3A6A3E' }}>
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input value={q} onChange={e => setQ(e.target.value)} type="search"
            placeholder="Search developers, projects…"
            className="w-full h-9 rounded-xl pl-9 pr-3 text-sm transition-all input"
            style={{ fontSize:'13px' }}/>
        </div>
      </form>

      <div className="flex items-center gap-1 ml-auto shrink-0">
        <NotificationBell/>
        <Link href="/settings"
          className="hidden md:flex p-2 rounded-xl transition-all"
          style={{ color:'#3A6A3E' }}
          onMouseEnter={e => { e.currentTarget.style.color='#00c4b4'; e.currentTarget.style.background='rgba(1,121,111,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='#3A6A3E'; e.currentTarget.style.background=''; }}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <circle cx="8.5" cy="8.5" r="2.2" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M8.5 1v1.8M8.5 14.2V16M1 8.5h1.8M14.2 8.5H16M3.1 3.1l1.27 1.27M12.63 12.63l1.27 1.27M3.1 13.9l1.27-1.27M12.63 4.37l1.27-1.27"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </Link>
        {user && (
          <Link href={`/${user.username}`} className="ml-1 group">
            <div className="rounded-full transition-all group-hover:ring-2 group-hover:ring-teal-400/50"
              style={{ boxShadow:'0 0 0 0 rgba(1,121,111,0)' }}>
              <Avatar src={user.avatar} name={user.name} size="sm"/>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
