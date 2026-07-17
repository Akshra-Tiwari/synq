'use client';

import { Suspense } from 'react';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter }        from 'next/navigation';
import Link                                  from 'next/link';
import { Avatar }              from '../../../components/shared/Avatar';
import { ConnectionCard }      from '../../../components/connections/ConnectionCard';
import { ProjectCard }         from '../../../components/projects/ProjectCard';
import { PostCard }            from '../../../components/feed/PostCard';
import { Spinner, EmptyState } from '../../../components/shared/UI';
import { useAuthStore }        from '../../../lib/store/auth.store';
import apiClient               from '../../../lib/api/client';
import { cn }                  from '../../../lib/utils/cn';
import type { Post }           from '../../../lib/api/posts.api';
import type { Project }        from '../../../lib/api/projects.api';
import type { User }           from '../../../lib/api/auth.api';
import { toggleLike as likePost }    from '../../../lib/api/posts.api';
import { toggleLike as likeProject, toggleSave } from '../../../lib/api/projects.api';

type Filter = 'all' | 'users' | 'posts' | 'projects';

const FILTER_TABS: { value: Filter; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'users',    label: 'People' },
  { value: 'posts',    label: 'Posts' },
  { value: 'projects', label: 'Projects' },
];

function SearchContent() {
  const sp     = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [query,    setQuery]    = useState(sp.get('q') ?? '');
  const [inputVal, setInputVal] = useState(sp.get('q') ?? '');
  const [filter,   setFilter]   = useState<Filter>((sp.get('filter') as Filter) ?? 'all');
  const [results,  setResults]  = useState<{ users: Partial<User>[]; posts: Post[]; projects: Project[]; total: number } | null>(null);
  const [loading,  setLoading]  = useState(false);

  const search = useCallback(async (q: string, f: Filter) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const { data } = await apiClient.get('/search', { params: { q, filter: f, limit: 20 } });
      setResults(data.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    search(query, filter);
  }, [query, filter, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputVal.trim();
    setQuery(q);
    router.replace(`/search?q=${encodeURIComponent(q)}&filter=${filter}`);
  };

  const handleFilter = (f: Filter) => {
    setFilter(f);
    router.replace(`/search?q=${encodeURIComponent(query)}&filter=${f}`);
  };

  const hasResults = results && results.total > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search bar */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search developers, posts, projects…"
            autoFocus
            className="w-full h-12 bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-12 pr-4 text-base text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
        </div>
      </form>

      {/* Filter tabs */}
      {(query || results) && (
        <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.05] rounded-xl w-fit">
          {FILTER_TABS.map(({ value, label }) => (
            <button key={value} onClick={() => handleFilter(value)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                filter === value
                  ? 'bg-white/[0.08] text-slate-200'
                  : 'text-slate-500 hover:text-slate-300',
              )}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Empty / no query state */}
      {!query && !loading && (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-slate-600">
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M18 18l5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-400">Search Synq</p>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Find developers by name, skill, or username. Search posts by content or tags. Discover projects by tech stack.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['React', 'TypeScript', 'Rust', 'open source', 'hiring'].map((term) => (
              <button key={term}
                onClick={() => { setInputVal(term); setQuery(term); }}
                className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-xs text-slate-500 hover:text-slate-300 hover:border-white/[0.12] transition-all">
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {query && !loading && (
        results && results.total === 0 ? (
          <EmptyState
            title="No results found"
            description={`Nothing matched "${query}". Try different keywords or filters.`}
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          />
        ) : (
          <div className="space-y-8">
            {/* Users */}
            {(filter === 'all' || filter === 'users') && (results?.users?.length ?? 0) > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Developers <span className="text-slate-600 font-normal normal-case">({results!.users.length})</span>
                  </h2>
                  {filter === 'all' && results!.users.length >= 4 && (
                    <button onClick={() => handleFilter('users')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      See all →
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(filter === 'all' ? results!.users.slice(0, 4) : results!.users).map((u) => (
                    <ConnectionCard key={u._id} user={u} currentUserId={user?._id} />
                  ))}
                </div>
              </section>
            )}

            {/* Posts */}
            {(filter === 'all' || filter === 'posts') && (results?.posts?.length ?? 0) > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Posts <span className="text-slate-600 font-normal normal-case">({results!.posts.length})</span>
                  </h2>
                  {filter === 'all' && results!.posts.length >= 3 && (
                    <button onClick={() => handleFilter('posts')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      See all →
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {(filter === 'all' ? results!.posts.slice(0, 3) : results!.posts).map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      currentUserId={user?._id}
                      onLike={async (id, liked, count) => {
                        await likePost(id);
                      }}
                      onDelete={async () => {}}
                      onEdit={async () => {}}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {(filter === 'all' || filter === 'projects') && (results?.projects?.length ?? 0) > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Projects <span className="text-slate-600 font-normal normal-case">({results!.projects.length})</span>
                  </h2>
                  {filter === 'all' && results!.projects.length >= 3 && (
                    <button onClick={() => handleFilter('projects')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      See all →
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(filter === 'all' ? results!.projects.slice(0, 3) : results!.projects).map((project) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      isOwn={user?._id === project.owner._id}
                      onLike={(id, liked, count) => likeProject(id).then(() => {})}
                      onSave={(id, saved, count) => toggleSave(id).then(() => {})}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )
      )}
    </div>
  );
}

const Loader = () => (
  <div className="flex justify-center py-20">
    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
      style={{ borderColor:'#01796F', borderTopColor:'transparent' }}/>
  </div>
);

export default function SearchPage() {
  return <Suspense fallback={<Loader />}><SearchContent /></Suspense>;
}
