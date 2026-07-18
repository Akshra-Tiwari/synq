'use client';

import { useEffect, useState } from 'react';
import { getAnalytics }         from '../../../lib/api/admin.api';
import { StatCard }             from '../../../components/dashboard/StatCard';
import { Sparkline, HorizontalBarChart } from '../../../components/dashboard/Charts';
import { Spinner }              from '../../../components/shared/UI';
import { compactNumber }        from '../../../lib/utils/format';
import type { Analytics }       from '../../../lib/api/admin.api';

export default function AdminAnalyticsPage() {
  const [data,    setData]    = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data)   return <p className="text-[#5A7A5E] text-sm">Failed to load analytics.</p>;

  const { overview, topSkills, topTech, signupTrend, postTrend, availabilityDist } = data;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-[#E2EBE4] tracking-tight">Analytics</h1>
        <p className="text-sm text-[#5A7A5E] mt-1">Detailed platform metrics and trends.</p>
      </div>

      {/* Growth stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="New users today"     value={overview.newUsersToday}    accent="teal" />
        <StatCard label="New users this week" value={overview.newUsersThisWeek} accent="steel" />
        <StatCard label="New posts today"     value={overview.newPostsToday}    accent="light" />
        <StatCard label="New posts this week" value={overview.newPostsThisWeek} accent="charcoal" />
      </div>

      {/* Full trend charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#C8DCC9] mb-1">User signups — 14 day trend</h3>
          <p className="text-xs text-[#3A6A3E] mb-4">
            Peak: {Math.max(...signupTrend.map((d) => d.count))} signups/day
          </p>
          <Sparkline data={signupTrend.map((d) => d.count)} color="#6366f1" width={380} height={80} />
          <div className="flex justify-between text-[10px] text-[#2A4A2E] mt-2">
            {signupTrend.filter((_, i) => i % 2 === 0).map((d) => (
              <span key={d.date}>{d.date.slice(5)}</span>
            ))}
          </div>
        </div>

        <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#C8DCC9] mb-1">Posts — 14 day trend</h3>
          <p className="text-xs text-[#3A6A3E] mb-4">
            Peak: {Math.max(...postTrend.map((d) => d.count))} posts/day
          </p>
          <Sparkline data={postTrend.map((d) => d.count)} color="#8b5cf6" width={380} height={80} />
          <div className="flex justify-between text-[10px] text-[#2A4A2E] mt-2">
            {postTrend.filter((_, i) => i % 2 === 0).map((d) => (
              <span key={d.date}>{d.date.slice(5)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Platform health */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-teal-400">{overview.verificationRate}%</p>
          <p className="text-xs text-[#5A7A5E] mt-1">Verification rate</p>
          <p className="text-xs text-[#2A4A2E] mt-0.5">
            {compactNumber(overview.verifiedUsers)} / {compactNumber(overview.totalUsers)} users
          </p>
        </div>
        <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-emerald-400">{compactNumber(overview.openToWorkUsers)}</p>
          <p className="text-xs text-[#5A7A5E] mt-1">Open to work</p>
          <p className="text-xs text-[#2A4A2E] mt-0.5">
            {overview.totalUsers > 0
              ? Math.round((overview.openToWorkUsers / overview.totalUsers) * 100)
              : 0}% of all users
          </p>
        </div>
        <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-violet-400">
            {overview.totalUsers > 0
              ? (overview.totalPosts / overview.totalUsers).toFixed(1)
              : '0'}
          </p>
          <p className="text-xs text-[#5A7A5E] mt-1">Posts per user</p>
          <p className="text-xs text-[#2A4A2E] mt-0.5">Platform engagement</p>
        </div>
      </div>

      {/* Skills + tech charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#C8DCC9] mb-4">Top 10 skills</h3>
          <HorizontalBarChart
            data={topSkills.map((s) => ({ label: s.skill, count: s.count }))}
            color="#6366f1"
          />
        </div>
        <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#C8DCC9] mb-4">Top 10 tech stack</h3>
          <HorizontalBarChart
            data={topTech.map((t) => ({ label: t.tech, count: t.count }))}
            color="#06b6d4"
          />
        </div>
      </div>

      {/* Availability distribution */}
      <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[#C8DCC9] mb-4">Availability distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availabilityDist.map(({ availability, count }) => {
            const pct = overview.totalUsers > 0
              ? Math.round((count / overview.totalUsers) * 100)
              : 0;
            return (
              <div key={availability}
                className="p-4 rounded-xl bg-[rgba(23,37,24,0.8)] border border-[rgba(1,121,111,0.1)] space-y-2">
                <p className="text-xl font-bold text-[#E2EBE4]">{count}</p>
                <p className="text-xs text-[#5A7A5E] capitalize">{availability?.replace(/-/g, ' ')}</p>
                <div className="h-1 bg-[rgba(1,121,111,0.08)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#01796F]/60 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#2A4A2E]">{pct}% of users</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
