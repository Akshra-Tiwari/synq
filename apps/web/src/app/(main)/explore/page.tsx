'use client';

import { Suspense } from 'react';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams }   from 'next/navigation';
import { useAuthStore }      from '../../../lib/store/auth.store';
import { searchUsers, getSuggestedUsers } from '../../../lib/api/users.api';
import { getSuggestions }    from '../../../lib/api/connections.api';
import { ConnectionCard }    from '../../../components/connections/ConnectionCard';
import { Spinner, EmptyState } from '../../../components/shared/UI';
import { cn }                from '../../../lib/utils/cn';
import type { User }         from '../../../lib/api/auth.api';

const SKILL_FILTERS = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'React', 'Node.js', 'AWS'];

function ExploreContent() {
  const { user }  = useAuthStore();
  const sp        = useSearchParams();

  const [query,       setQuery]       = useState(sp.get('q') ?? '');
  const [inputVal,    setInputVal]    = useState(sp.get('q') ?? '');
  const [skillFilter, setSkillFilter] = useState('');
  const [openToWork,  setOpenToWork]  = useState(false);
  const [users,       setUsers]       = useState<Partial<User>[]>([]);
  const [suggestions, setSuggestions] = useState<Partial<User>[]>([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [sugLoading,  setSugLoading]  = useState(true);

  // Load suggestions once
  useEffect(() => {
    if (!user) return;
    getSuggestions()
      .then((res) => setSuggestions(res.data.users))
      .catch(() => {})
      .finally(() => setSugLoading(false));
  }, [user]);

  const fetchUsers = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await searchUsers({
        q:         query || undefined,
        skills:    skillFilter || undefined,
        openToWork: openToWork || undefined,
        page:      p,
        limit:     24,
      });
      setUsers(res.data.users as Partial<User>[]);
      setTotal(res.pagination?.total ?? 0);
      setTotalPages(res.pagination?.totalPages ?? 1);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [query, skillFilter, openToWork]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputVal.trim());
  };

  const toggleSkill = (skill: string) =>
    setSkillFilter((prev) => (prev === skill ? '' : skill));

  const hasFilters = !!query || !!skillFilter || openToWork;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-semibold text-[#E2EBE4] tracking-tight">Explore Developers</h1>
        <p className="text-sm text-[#5A7A5E] mt-1">
          {total > 0 ? `${total} developers on Synq` : 'Discover developers by skill, location, and more'}
        </p>
      </div>

      {/* ── Search + filters ── */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3A6A3E]" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search by name, username, skills, bio…"
            className="w-full h-11 bg-[rgba(1,121,111,0.06)] border border-white/[0.07] rounded-xl pl-11 pr-4 text-sm text-[#C8DCC9] placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </form>

        {/* Filter chips row */}
        <div className="flex flex-wrap items-center gap-2">
          {SKILL_FILTERS.map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                skillFilter === skill
                  ? 'bg-[#01796F]/20 text-teal-300 border-indigo-500/40'
                  : 'bg-[rgba(23,37,24,0.8)] text-[#5A7A5E] border-[rgba(1,121,111,0.12)] hover:text-[#9EB5A0] hover:border-white/[0.12]',
              )}
            >
              {skill}
            </button>
          ))}

          <button
            onClick={() => setOpenToWork((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
              openToWork
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-[rgba(23,37,24,0.8)] text-[#5A7A5E] border-[rgba(1,121,111,0.12)] hover:text-[#9EB5A0]',
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', openToWork ? 'bg-emerald-400' : 'bg-slate-600')} />
            Open to work
          </button>

          {hasFilters && (
            <button
              onClick={() => { setQuery(''); setInputVal(''); setSkillFilter(''); setOpenToWork(false); }}
              className="px-3 py-1.5 rounded-full text-xs text-[#3A6A3E] hover:text-[#7A9A7E] transition-colors"
            >
              Clear all ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Suggestions (when no active search) ── */}
      {!hasFilters && suggestions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#7A9A7E] mb-4">People you may know</h2>
          {sugLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggestions.slice(0, 4).map((u) => (
                <ConnectionCard
                  key={u._id}
                  user={u}
                  currentUserId={user?._id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Results grid ── */}
      <div>
        {hasFilters && (
          <h2 className="text-sm font-semibold text-[#7A9A7E] mb-4">
            {loading ? 'Searching…' : `${total} result${total !== 1 ? 's' : ''}`}
          </h2>
        )}

        {!hasFilters && (
          <h2 className="text-sm font-semibold text-[#7A9A7E] mb-4">All developers</h2>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.1)] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="No developers found"
            description="Try a different search or clear your filters."
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u) => (
                <ConnectionCard
                  key={u._id}
                  user={u}
                  currentUserId={user?._id}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchUsers(page - 1)}
                  className="h-9 px-4 rounded-xl bg-[rgba(1,121,111,0.06)] border border-white/[0.07] text-sm text-[#7A9A7E] hover:text-[#C8DCC9] disabled:opacity-30 transition-all"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchUsers(p)}
                    className={cn(
                      'h-9 w-9 rounded-xl text-sm font-medium transition-all',
                      p === page
                        ? 'bg-[#01796F] text-white'
                        : 'bg-[rgba(1,121,111,0.06)] border border-white/[0.07] text-[#7A9A7E] hover:text-[#C8DCC9]',
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page >= totalPages}
                  onClick={() => fetchUsers(page + 1)}
                  className="h-9 px-4 rounded-xl bg-[rgba(1,121,111,0.06)] border border-white/[0.07] text-sm text-[#7A9A7E] hover:text-[#C8DCC9] disabled:opacity-30 transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const Loader = () => (
  <div className="flex justify-center py-20">
    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
      style={{ borderColor:'#01796F', borderTopColor:'transparent' }}/>
  </div>
);

export default function ExplorePage() {
  return <Suspense fallback={<Loader />}><ExploreContent /></Suspense>;
}
