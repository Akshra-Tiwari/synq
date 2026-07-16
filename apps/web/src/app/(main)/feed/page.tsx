'use client';

import { useAuthStore }        from '../../../lib/store/auth.store';
import { useFeed }             from '../../../hooks/useFeed';
import { useInfiniteScroll }   from '../../../hooks/useInfiniteScroll';
import { PostComposer }        from '../../../components/feed/PostComposer';
import { PostCard }            from '../../../components/feed/PostCard';
import { FeedFilters }         from '../../../components/feed/FeedFilters';
import { FeedSkeletons }       from '../../../components/feed/PostSkeleton';
import { EmptyState, Spinner } from '../../../components/shared/UI';
import { Avatar }              from '../../../components/shared/Avatar';
import Link                    from 'next/link';

export default function FeedPage() {
  const { user } = useAuthStore();
  const {
    posts, isLoading, isFetching, hasNextPage,
    filter, setFilter, loadMore,
    createPost, updatePost, deletePost, toggleLike,
  } = useFeed();

  const sentinelRef = useInfiniteScroll(loadMore, hasNextPage && !isFetching);

  if (!user) return null;

  return (
    <div className="flex gap-6 max-w-5xl mx-auto">

      {/* Main feed column */}
      <div className="flex-1 min-w-0 space-y-4">

        <PostComposer
          authorName={user.name}
          authorUsername={user.username}
          authorAvatar={user.avatar}
          onPost={(payload) => createPost(payload).then(() => {})}
        />

        <FeedFilters active={filter} onChange={setFilter} />

        {isLoading ? (
          <FeedSkeletons count={4} />
        ) : posts.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description={filter === 'following' ? 'Connect with developers to see their posts here.' : 'Be the first to post something!'}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            }
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user._id}
                onLike={(id, liked, count) => toggleLike(id, liked, count)}
                onDelete={(id) => deletePost(id)}
                onEdit={(id, content) => updatePost(id, { content }).then(() => {})}
              />
            ))}

            <div ref={sentinelRef} className="h-1" />

            {isFetching && (
              <div className="flex justify-center py-4">
                <Spinner size="md" />
              </div>
            )}

            {!hasNextPage && posts.length > 0 && (
              <p className="text-center text-xs text-slate-700 py-4">
                You've reached the end · {posts.length} posts
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <aside className="w-72 shrink-0 hidden xl:block space-y-4">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
          <Link href={`/${user.username}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Avatar src={user.avatar} name={user.name} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500">@{user.username}</p>
            </div>
          </Link>
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/[0.05]">
            {[
              { label: 'Posts',       value: user.stats.postsCount },
              { label: 'Connections', value: user.stats.connectionsCount },
              { label: 'Projects',    value: user.stats.projectsCount },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-sm font-semibold text-slate-200">{value}</p>
                <p className="text-xs text-slate-600">{label}</p>
              </div>
            ))}
          </div>
          {(user.profileCompletion ?? 0) < 100 && (
            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">Profile completion</span>
                <span className="text-xs font-medium text-indigo-400">{user.profileCompletion ?? 0}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                  style={{ width: `${user.profileCompletion ?? 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick links</p>
          {[
            { href: '/explore',   label: 'Explore developers' },
            { href: '/projects',  label: 'Project showcase' },
            { href: '/dashboard', label: 'Your dashboard' },
            { href: '/settings',  label: 'Edit profile' },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
              {label}
            </Link>
          ))}
        </div>

        <p className="text-xs text-slate-700 px-1">
          Synq © {new Date().getFullYear()} ·{' '}
          <Link href="/terms" className="hover:text-slate-500 transition-colors">Terms</Link>
          {' · '}
          <Link href="/privacy" className="hover:text-slate-500 transition-colors">Privacy</Link>
        </p>
      </aside>
    </div>
  );
}
