'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore }       from '../../../lib/store/auth.store';
import { useProfile }         from '../../../hooks/useProfile';
import { StatCard }           from '../../../components/dashboard/StatCard';
import { ConnectionCard }     from '../../../components/connections/ConnectionCard';
import { getSuggestions }     from '../../../lib/api/connections.api';
import { getUserPosts }       from '../../../lib/api/posts.api';
import { Avatar }             from '../../../components/shared/Avatar';
import { Spinner }            from '../../../components/shared/UI';
import { compactNumber, completionLabel, AVAILABILITY_LABELS } from '../../../lib/utils/format';
import { cn }                 from '../../../lib/utils/cn';
import type { User }          from '../../../lib/api/auth.api';

export default function DashboardPage() {
  const { user }  = useAuthStore();
  const { profile } = useProfile(user?.username ?? '');
  const [suggestions, setSuggestions] = useState<Partial<User>[]>([]);
  const [recentPosts, setRecentPosts] = useState<{ _id: string; content: string; likesCount: number; commentsCount: number; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getSuggestions().then((r) => setSuggestions(r.data.users.slice(0, 3))),
      getUserPosts(user.username).then((r) => setRecentPosts(r.data.posts.slice(0, 3) as typeof recentPosts)),
    ]).finally(() => setLoading(false));
  }, [user]);

  if (!user || loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  const completion = user.profileCompletion ?? 0;
  const completionSteps = [
    { label: 'Profile photo',   done: !!user.avatar,                   href: '/settings' },
    { label: 'Bio (20+ chars)', done: (user.bio?.length ?? 0) >= 20,   href: '/settings' },
    { label: '3+ skills',       done: user.skills.length >= 3,          href: `/${user.username}` },
    { label: 'Work experience', done: (user.experience?.length ?? 0) > 0, href: `/${user.username}` },
    { label: 'Education',       done: (user.education?.length ?? 0) > 0,  href: `/${user.username}` },
    { label: 'GitHub link',     done: !!user.githubUrl,                 href: '/settings' },
    { label: 'Cover banner',    done: !!user.coverBanner,               href: `/${user.username}` },
    { label: 'Location',        done: !!user.location,                  href: '/settings' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar src={user.avatar} name={user.name} size="lg" />
        <div>
          <h1 className="text-2xl font-semibold text-[#E2EBE4] tracking-tight">
            Welcome back, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-[#5A7A5E] mt-0.5">
            @{user.username} · {AVAILABILITY_LABELS[user.availability] ?? 'Not available'}
          </p>
        </div>
        {user.role === 'admin' && (
          <Link href="/admin"
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm hover:bg-amber-500/20 transition-all">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1l1.5 3H12l-2.7 2 1 3.2L7 7.5 3.7 9.2l1-3.2L2 4h3.5L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            Admin Panel
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Connections"  value={compactNumber(user.stats.connectionsCount)} accent="teal"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="4.5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M1 14c0-2.8 1.8-5 4-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 7v5M8.5 9.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}/>
        <StatCard label="Posts"        value={compactNumber(user.stats.postsCount)}       accent="steel"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}/>
        <StatCard label="Projects"     value={compactNumber(user.stats.projectsCount)}    accent="light"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5.5A1.5 1.5 0 013.5 4h3l1.5 1.5H13A1.5 1.5 0 0114.5 7v5.5A1.5 1.5 0 0113 14H3A1.5 1.5 0 011.5 12.5v-7z" stroke="currentColor" strokeWidth="1.3"/></svg>}/>
        <StatCard label="Profile views" value={compactNumber(user.stats.profileViews)}   accent="charcoal"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s3-5.5 7-5.5S15 8 15 8s-3 5.5-7 5.5S1 8 1 8z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile completion */}
          <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[#C8DCC9]">Profile completion</h2>
                <p className="text-xs text-[#5A7A5E] mt-0.5">{completionLabel(completion)} · {completion}% complete</p>
              </div>
              <Link href={`/${user.username}`} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                View profile →
              </Link>
            </div>
            <div className="h-2 bg-[rgba(1,121,111,0.08)] rounded-full overflow-hidden mb-5">
              <div className="h-full bg-gradient-to-r from-[#01796F] to-[#00c4b4] rounded-full transition-all duration-700" style={{ width: `${completion}%` }}/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {completionSteps.map(({ label, done, href }) => (
                <Link key={label} href={href}
                  className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all',
                    done
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 pointer-events-none'
                      : 'bg-[rgba(23,37,24,0.8)] border border-[rgba(1,121,111,0.12)] text-[#5A7A5E] hover:text-[#9EB5A0] hover:bg-[rgba(1,121,111,0.08)]')}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    {done
                      ? <><circle cx="6" cy="6" r="5" fill="currentColor" fillOpacity="0.2"/><path d="M3.5 6l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></>
                      : <circle cx="6" cy="6" r="5" stroke="currentColor" strokeOpacity="0.4"/>}
                  </svg>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent posts */}
          <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(1,121,111,0.1)]">
              <h2 className="text-sm font-semibold text-[#C8DCC9]">Recent posts</h2>
              <Link href="/feed" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">View feed →</Link>
            </div>
            {recentPosts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[#5A7A5E]">You haven&apos;t posted yet.</p>
                <Link href="/feed" className="text-xs text-teal-400 hover:text-teal-300 transition-colors mt-1 block">Share something →</Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {recentPosts.map((post) => (
                  <div key={post._id} className="px-5 py-3.5 hover:bg-[rgba(23,37,24,0.7)] transition-colors">
                    <p className="text-sm text-[#7A9A7E] line-clamp-2 mb-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-[#3A6A3E]">
                      <span>{post.likesCount} likes</span>
                      <span>{post.commentsCount} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Quick actions */}
          <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-[#C8DCC9] mb-4">Quick actions</h2>
            <div className="space-y-2">
              {[
                { href: '/feed',        label: 'Write a post',        icon: '✏️' },
                { href: '/projects',    label: 'Add a project',       icon: '🚀' },
                { href: '/explore',     label: 'Discover developers', icon: '🔍' },
                { href: '/connections', label: 'My connections',      icon: '🤝' },
                { href: '/settings',    label: 'Edit profile',        icon: '⚙️' },
              ].map(({ href, label, icon }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#7A9A7E] hover:text-[#C8DCC9] hover:bg-[rgba(1,121,111,0.06)] transition-all">
                  <span className="text-base">{icon}</span>
                  {label}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto text-[#2A4A2E]">
                    <path d="M4 3l4 3-4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[rgba(1,121,111,0.1)]">
                <h2 className="text-sm font-semibold text-[#C8DCC9]">People you may know</h2>
              </div>
              <div className="p-3 space-y-2">
                {suggestions.map((u) => (
                  <ConnectionCard key={u._id} user={u} currentUserId={user._id} variant="compact"/>
                ))}
                <Link href="/explore" className="block text-center py-2 text-xs text-teal-400 hover:text-teal-300 transition-colors">
                  See more developers →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
