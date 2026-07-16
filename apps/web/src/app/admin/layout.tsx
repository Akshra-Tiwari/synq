'use client';

import { useEffect }   from 'react';
import { useRouter }   from 'next/navigation';
import Link            from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../lib/store/auth.store';
import { Spinner }      from '../../components/shared/UI';
import { SynqLogo }     from '../../components/shared/Logo';
import { cn }           from '../../lib/utils/cn';

const ADMIN_NAV = [
  { href:'/admin',           label:'Overview',   icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg> },
  { href:'/admin/users',     label:'Users',      icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="5.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 12c0-2.5 2-4.5 4.5-4.5S10 9.5 10 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { href:'/admin/reports',   label:'Reports',    icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1l1.4 3H12l-2.5 1.8.9 3L7.5 7 4.6 8.8l.9-3L3 4h3.1L7.5 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
  { href:'/admin/analytics', label:'Analytics',  icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 11l3.5-4.5 2.5 2L10 4l4 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) router.replace('/feed');
  }, [user, isLoading, router]);

  if (isLoading || !user) return <div className="flex items-center justify-center h-screen" style={{ background:'#08120A' }}><Spinner size="lg"/></div>;
  if (user.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex" style={{ background:'#08120A' }}>
      <aside className="fixed left-0 top-0 h-screen w-52 flex flex-col z-40"
        style={{ background:'rgba(10,16,24,0.97)', borderRight:'1px solid rgba(109,129,150,0.1)' }}>
        <div className="flex items-center gap-2 px-4 h-16" style={{ borderBottom:'1px solid rgba(109,129,150,0.08)' }}>
          <SynqLogo size="sm"/>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background:'rgba(1,121,111,0.12)', color:'#00c4b4', border:'1px solid rgba(1,121,111,0.2)' }}>
            Admin
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {ADMIN_NAV.map(({ href, label, icon }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={active
                  ? { background:'rgba(1,121,111,0.1)', color:'#00c4b4', borderLeft:'2px solid #01796F', paddingLeft:'10px' }
                  : { color:'#50606E' }}>
                <span style={active ? { color:'#01796F' } : {}}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3" style={{ borderTop:'1px solid rgba(109,129,150,0.08)' }}>
          <Link href="/feed" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all"
            style={{ color:'#50606E' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 2.5L4 6.5l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to app
          </Link>
        </div>
      </aside>
      <main className="ml-52 flex-1 p-8">{children}</main>
    </div>
  );
}
