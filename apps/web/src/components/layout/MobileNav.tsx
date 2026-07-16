'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils/cn';
import { useNotificationsStore } from '../../lib/store/notifications.store';

const TABS = [
  { href:'/feed',          label:'Feed',
    icon:(a:boolean)=>(<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={a?2:1.5} fill={a?'currentColor':'none'} fillOpacity={a?.15:0}/><rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={a?2:1.5}/><rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={a?2:1.5}/><rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={a?2:1.5} fill={a?'currentColor':'none'} fillOpacity={a?.15:0}/></svg>) },
  { href:'/explore',       label:'Explore',
    icon:(a:boolean)=>(<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth={a?2:1.5}/><path d="M13 7l-2.5 5.5-5.5 2.5 2.5-5.5L13 7z" stroke="currentColor" strokeWidth={a?2:1.5} strokeLinejoin="round" fill={a?'currentColor':'none'} fillOpacity={a?.25:0}/></svg>) },
  { href:'/messages',      label:'Messages',
    icon:(a:boolean)=>(<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M17.5 10a7.5 7.5 0 01-10.6 6.8L2 18l1.2-4.9A7.5 7.5 0 1117.5 10z" stroke="currentColor" strokeWidth={a?2:1.5} fill={a?'currentColor':'none'} fillOpacity={a?.12:0} strokeLinejoin="round"/></svg>) },
  { href:'/notifications', label:'Alerts', badge:true,
    icon:(a:boolean)=>(<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3a5.5 5.5 0 00-5.5 5.5v3.5L3 15h14l-1.5-3V8.5A5.5 5.5 0 0010 3z" stroke="currentColor" strokeWidth={a?2:1.5} fill={a?'currentColor':'none'} fillOpacity={a?.12:0}/><path d="M8 15.5a2 2 0 004 0" stroke="currentColor" strokeWidth={a?2:1.5}/></svg>) },
  { href:'/dashboard',     label:'You',
    icon:(a:boolean)=>(<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth={a?2:1.5} fill={a?'currentColor':'none'} fillOpacity={a?.15:0}/><path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth={a?2:1.5} strokeLinecap="round"/></svg>) },
];

export function MobileNav() {
  const pathname    = usePathname();
  const unreadCount = useNotificationsStore(s => s.unreadCount);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden"
      style={{ background:'rgba(10,20,11,0.97)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(1,121,111,0.15)' }}>
      <div className="flex items-center justify-around px-2 py-2">
        {TABS.map(({ href, label, icon, badge }) => {
          const active = pathname === href || (href !== '/feed' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl relative transition-all"
              style={{ color: active ? '#01796F' : '#50606E' }}>
              {icon(active)}
              <span className="text-[10px] font-medium">{label}</span>
              {badge && unreadCount > 0 && (
                <span className="absolute top-1 right-2 min-w-[14px] h-3.5 px-0.5 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
                  style={{ background:'#01796F' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
