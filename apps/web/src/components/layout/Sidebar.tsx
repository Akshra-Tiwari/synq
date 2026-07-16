'use client';

import Link       from 'next/link';
import { usePathname } from 'next/navigation';
import { cn }          from '../../lib/utils/cn';
import { useAuthStore } from '../../lib/store/auth.store';
import { useAuth }      from '../../hooks/useAuth';
import { Avatar }       from '../shared/Avatar';
import { SynqLogo }     from '../shared/Logo';
import { useNotificationsStore } from '../../lib/store/notifications.store';

const NAV = [
  { href:'/feed',          label:'Feed',
    icon:(a:boolean)=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={a?2:1.5} fill={a?'currentColor':'none'} fillOpacity={a?.2:0}/><rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={a?2:1.5}/><rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={a?2:1.5}/><rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={a?2:1.5} fill={a?'currentColor':'none'} fillOpacity={a?.15:0}/></svg> },
  { href:'/explore',       label:'Explore',
    icon:(a:boolean)=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth={a?2:1.5}/><path d="M12 6l-2.5 5-5 2.5 2.5-5 5-2.5z" stroke="currentColor" strokeWidth={a?2:1.5} strokeLinejoin="round" fill={a?'currentColor':'none'} fillOpacity={a?.3:0}/></svg> },
  { href:'/projects',      label:'Projects',
    icon:(a:boolean)=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5.5A1.5 1.5 0 013.5 4h4l2 2h5A1.5 1.5 0 0116 7.5v7A1.5 1.5 0 0114.5 16h-11A1.5 1.5 0 012 14.5z" stroke="currentColor" strokeWidth={a?2:1.5} fill={a?'currentColor':'none'} fillOpacity={a?.15:0}/></svg> },
  { href:'/connections',   label:'Connections',
    icon:(a:boolean)=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth={a?2:1.5} fill={a?'currentColor':'none'} fillOpacity={a?.2:0}/><path d="M1 15c0-3.3 2.7-6 6-6" stroke="currentColor" strokeWidth={a?2:1.5} strokeLinecap="round"/><path d="M13 10v5M10.5 12.5h5" stroke="currentColor" strokeWidth={a?2:1.5} strokeLinecap="round"/></svg> },
  { href:'/messages',      label:'Messages',
    icon:(a:boolean)=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15.5 9a6.5 6.5 0 01-9.17 5.9L2 16l1.1-4.33A6.5 6.5 0 1115.5 9z" stroke="currentColor" strokeWidth={a?2:1.5} fill={a?'currentColor':'none'} fillOpacity={a?.15:0} strokeLinejoin="round"/></svg> },
  { href:'/notifications', label:'Notifications', badge:true,
    icon:(a:boolean)=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2a5 5 0 00-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 00-5-5z" stroke="currentColor" strokeWidth={a?2:1.5} fill={a?'currentColor':'none'} fillOpacity={a?.15:0}/><path d="M7 14.5a2 2 0 004 0" stroke="currentColor" strokeWidth={a?2:1.5}/></svg> },
  { href:'/dashboard',     label:'Dashboard',
    icon:(a:boolean)=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9.5L9 2l7 7.5" stroke="currentColor" strokeWidth={a?2:1.5} strokeLinecap="round" strokeLinejoin="round"/><path d="M4 7.5V16h4v-4h2v4h4V7.5" stroke="currentColor" strokeWidth={a?2:1.5} strokeLinecap="round" strokeLinejoin="round" fill={a?'currentColor':'none'} fillOpacity={a?.1:0}/></svg> },
];

export function Sidebar() {
  const pathname    = usePathname();
  const { user }    = useAuthStore();
  const { logout }  = useAuth();
  const unreadCount = useNotificationsStore(s => s.unreadCount);

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40"
      style={{ background:'rgba(14,26,15,0.97)', borderRight:'1px solid rgba(1,121,111,0.15)', backdropFilter:'blur(20px)' }}>

      {/* Logo with subtle glow */}
      <div className="flex items-center px-5 h-16 shrink-0"
        style={{ borderBottom:'1px solid rgba(1,121,111,0.1)' }}>
        <SynqLogo size="md"/>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2.5 overflow-y-auto space-y-0.5">
        {NAV.map(({ href, label, icon, badge }) => {
          const active = pathname === href || (href !== '/feed' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative',
                active ? 'nav-active' : 'hover:bg-teal-900/20',
              )}
              style={!active ? { color:'#5A7A5E' } : {}}>
              <span style={active ? { color:'#00c4b4', filter:'drop-shadow(0 0 4px rgba(0,196,180,0.5))' } : {}}>
                {icon(active)}
              </span>
              <span style={active ? { color:'#00c4b4' } : {}}>{label}</span>
              {/* Notification badge */}
              {badge && unreadCount > 0 && (
                <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                  style={{ background:'linear-gradient(135deg,#01796F,#00c4b4)', boxShadow:'0 0 8px rgba(0,196,180,0.5)' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {/* Active glow bar */}
              {active && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                  style={{ background:'#00c4b4', boxShadow:'0 0 8px rgba(0,196,180,0.8)' }}/>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      {user && (
        <div className="px-2.5 py-3 shrink-0"
          style={{ borderTop:'1px solid rgba(1,121,111,0.1)' }}>
          <Link href={`/${user.username}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-teal-900/20 transition-all group">
            <Avatar src={user.avatar} name={user.name} size="sm"/>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color:'#C8DCC9' }}>{user.name}</p>
              <p className="text-xs truncate" style={{ color:'#5A7A5E' }}>@{user.username}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:'#5A7A5E' }}>
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </Link>
          <button onClick={logout}
            className="mt-0.5 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all group"
            style={{ color:'#5A7A5E' }}
            onMouseEnter={e => { e.currentTarget.style.color='#ef4444'; e.currentTarget.style.background='rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='#5A7A5E'; e.currentTarget.style.background=''; }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M5.5 2H3a1 1 0 00-1 1v9a1 1 0 001 1h2.5M9.5 10.5L12.5 7.5 9.5 4.5M12.5 7.5H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
