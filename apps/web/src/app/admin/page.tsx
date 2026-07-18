'use client';

import { useEffect, useState } from 'react';
import { getAnalytics }        from '../../lib/api/admin.api';
import { StatCard }            from '../../components/dashboard/StatCard';
import { Sparkline, HorizontalBarChart } from '../../components/dashboard/Charts';
import { Avatar }              from '../../components/shared/Avatar';
import { Spinner }             from '../../components/shared/UI';
import { compactNumber }       from '../../lib/utils/format';
import type { Analytics }      from '../../lib/api/admin.api';

export default function AdminPage() {
  const [data,    setData]    = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data)   return <p className="text-[#5A7A5E] text-sm">Failed to load analytics.</p>;

  const { overview, topSkills, topTech, signupTrend, postTrend, topPosters, availabilityDist } = data;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-[#E2EBE4] tracking-tight">Platform Overview</h1>
        <p className="text-sm text-[#5A7A5E] mt-1">Real-time metrics across all Synq activity.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total users"   value={compactNumber(overview.totalUsers)}
          sub={`${overview.verificationRate}% verified`} accent="teal"
          trend={{ value: overview.newUsersToday, label: 'today' }}
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M1 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}/>
        <StatCard label="Total posts"   value={compactNumber(overview.totalPosts)}
          sub={`${overview.newPostsThisWeek} this week`} accent="steel"
          trend={{ value: overview.newPostsToday, label: 'today' }}
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}/>
        <StatCard label="Projects"      value={compactNumber(overview.totalProjects)}    accent="light"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5.5A1.5 1.5 0 013.5 4h3l1.5 1.5H13A1.5 1.5 0 0114.5 7v5.5A1.5 1.5 0 0113 14H3A1.5 1.5 0 011.5 12.5v-7z" stroke="currentColor" strokeWidth="1.3"/></svg>}/>
        <StatCard label="Connections"   value={compactNumber(overview.totalConnections)} accent="charcoal"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="3" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="13" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="3" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="13" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-sm font-semibold text-[#C8DCC9]">New users</h3><p className="text-xs text-[#5A7A5E]">Last 14 days</p></div>
            <div className="text-right"><p className="text-xl font-bold text-[#E2EBE4]">{overview.newUsersThisWeek}</p><p className="text-xs text-[#3A6A3E]">this week</p></div>
          </div>
          <Sparkline data={signupTrend.map((d) => d.count)} color="#6366f1" width={340} height={60}/>
          <div className="flex items-center justify-between mt-2 text-[10px] text-[#2A4A2E]">
            <span>{signupTrend[0]?.date?.slice(5) ?? ''}</span>
            <span>{signupTrend[signupTrend.length - 1]?.date?.slice(5) ?? ''}</span>
          </div>
        </div>
        <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-sm font-semibold text-[#C8DCC9]">New posts</h3><p className="text-xs text-[#5A7A5E]">Last 14 days</p></div>
            <div className="text-right"><p className="text-xl font-bold text-[#E2EBE4]">{overview.newPostsThisWeek}</p><p className="text-xs text-[#3A6A3E]">this week</p></div>
          </div>
          <Sparkline data={postTrend.map((d) => d.count)} color="#8b5cf6" width={340} height={60}/>
          <div className="flex items-center justify-between mt-2 text-[10px] text-[#2A4A2E]">
            <span>{postTrend[0]?.date?.slice(5) ?? ''}</span>
            <span>{postTrend[postTrend.length - 1]?.date?.slice(5) ?? ''}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#C8DCC9] mb-4">Top skills</h3>
          <HorizontalBarChart data={topSkills.map((s) => ({ label: s.skill, count: s.count }))} color="#6366f1"/>
        </div>
        <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#C8DCC9] mb-4">Top tech stack</h3>
          <HorizontalBarChart data={topTech.map((t) => ({ label: t.tech, count: t.count }))} color="#06b6d4"/>
        </div>
        <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#C8DCC9] mb-4">Most active users</h3>
          <div className="space-y-3">
            {topPosters.map((u, i) => (
              <div key={u.username} className="flex items-center gap-3">
                <span className="text-xs text-[#3A6A3E] w-4">{i + 1}</span>
                <Avatar src={u.avatar} name={u.name} size="sm"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#9EB5A0] truncate">{u.name}</p>
                  <p className="text-[10px] text-[#3A6A3E]">@{u.username}</p>
                </div>
                <span className="text-xs text-[#5A7A5E]">{u.stats.postsCount} posts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[#C8DCC9] mb-4">
          Open to work — {compactNumber(overview.openToWorkUsers)} developers
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availabilityDist.map(({ availability, count }) => (
            <div key={availability} className="p-3 rounded-xl bg-[rgba(23,37,24,0.8)] border border-[rgba(1,121,111,0.1)] text-center">
              <p className="text-lg font-bold text-[#E2EBE4]">{count}</p>
              <p className="text-xs text-[#3A6A3E] mt-0.5 capitalize">{availability?.replace(/-/g, ' ')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
