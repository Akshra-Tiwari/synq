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
import { compactNumber }       from '../../../lib/utils/format';

export default function FeedPage() {
  const { user } = useAuthStore();
  const {
    posts, isLoading, isFetching, hasNextPage,
    filter, setFilter, loadMore,
    createPost, updatePost, deletePost, toggleLike,
  } = useFeed();

  const sentinelRef = useInfiniteScroll(loadMore, hasNextPage && !isFetching);

  if (!user) return (
    <div className="flex justify-center py-20">
      <Spinner size="lg"/>
    </div>
  );

  return (
    <div className="flex gap-6 max-w-5xl mx-auto">

      {/* ── Main feed ── */}
      <div className="flex-1 min-w-0 space-y-4">
        <PostComposer
          authorName={user.name}
          authorUsername={user.username}
          authorAvatar={user.avatar}
          onPost={(payload) => createPost(payload).then(() => {})}
        />

        <FeedFilters active={filter} onChange={setFilter}/>

        {isLoading ? (
          <FeedSkeletons count={4}/>
        ) : posts.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description={filter === 'following'
              ? 'Connect with developers to see their posts here.'
              : 'Be the first to post something!'}
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

            <div ref={sentinelRef} className="h-1"/>

            {isFetching && (
              <div className="flex justify-center py-4">
                <Spinner size="md"/>
              </div>
            )}

            {!hasNextPage && posts.length > 0 && (
              <p className="text-center text-xs py-4" style={{ color:'#3A5A3E' }}>
                End of feed &middot; {posts.length} posts
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Right sidebar ── */}
      <aside className="w-72 shrink-0 hidden xl:block space-y-4">
        {/* Profile card */}
        <div className="rounded-2xl p-4 card">
          <Link href={`/${user.username}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Avatar src={user.avatar} name={user.name} size="md"/>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color:'#E2EBE4' }}>{user.name}</p>
              <p className="text-xs" style={{ color:'#5A7A5E' }}>@{user.username}</p>
            </div>
          </Link>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4" style={{ borderTop:'1px solid rgba(1,121,111,0.1)' }}>
            {[
              { label:'Posts',       value: user.stats.postsCount },
              { label:'Connections', value: user.stats.connectionsCount },
              { label:'Projects',    value: user.stats.projectsCount },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-sm font-semibold" style={{ color:'#E2EBE4' }}>{compactNumber(value)}</p>
                <p className="text-xs" style={{ color:'#5A7A5E' }}>{label}</p>
              </div>
            ))}
          </div>

          {(user.profileCompletion ?? 0) < 100 && (
            <div className="mt-4 pt-4" style={{ borderTop:'1px solid rgba(1,121,111,0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color:'#5A7A5E' }}>Profile completion</span>
                <span className="text-xs font-semibold" style={{ color:'#00c4b4' }}>{user.profileCompletion ?? 0}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(1,121,111,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width:`${user.profileCompletion ?? 0}%`, background:'linear-gradient(90deg,#01796F,#00c4b4)' }}/>
              </div>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="rounded-2xl p-4 card space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:'#3A6A3E' }}>
            Quick links
          </p>
          {[
            { href:'/explore',     label:'Explore developers' },
            { href:'/projects',    label:'Project showcase' },
            { href:'/connections', label:'My connections' },
            { href:'/dashboard',   label:'Dashboard' },
            { href:'/settings',    label:'Edit profile' },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all"
              style={{ color:'#5A7A5E' }}
              onMouseEnter={e => { e.currentTarget.style.color='#00c4b4'; e.currentTarget.style.background='rgba(1,121,111,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color='#5A7A5E'; e.currentTarget.style.background=''; }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background:'#01796F' }}/>
              {label}
            </Link>
          ))}
        </div>

        <p className="text-xs px-1" style={{ color:'#3A5A3E' }}>
          Synq &copy; {new Date().getFullYear()} &middot;{' '}
          <Link href="/terms"   className="hover:text-teal-400 transition-colors">Terms</Link>
          {' &middot; '}
          <Link href="/privacy" className="hover:text-teal-400 transition-colors">Privacy</Link>
        </p>
      </aside>
    </div>
  );
}
