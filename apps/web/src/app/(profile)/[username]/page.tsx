'use client';

import { use, useState, useEffect } from 'react';
import { useAuthStore }    from '../../../lib/store/auth.store';
import { useProfile, useOwnProfile } from '../../../hooks/useProfile';
import { ProfileHeader }   from '../../../components/profile/ProfileHeader';
import { ExperienceSection, EducationSection } from '../../../components/profile/CareerSections';
import { SkillsSection }   from '../../../components/profile/SkillsSection';
import { PostCard }        from '../../../components/feed/PostCard';
import { FeedSkeletons }   from '../../../components/feed/PostSkeleton';
import { SectionCard, Spinner, EmptyState } from '../../../components/shared/UI';
import { compactNumber }   from '../../../lib/utils/format';
import { getUserPosts, toggleLike, deletePost, updatePost } from '../../../lib/api/posts.api';
import type { Post }       from '../../../lib/api/posts.api';
import { cn }              from '../../../lib/utils/cn';

interface PageProps {
  params: Promise<{ username: string }>;
}

type ProfileTab = 'posts' | 'experience' | 'education' | 'skills';

export default function ProfilePage({ params }: PageProps) {
  const { username }  = use(params);
  const { user: me }  = useAuthStore();
  const { profile, loading } = useProfile(username);
  const ownProfile    = useOwnProfile();
  const isOwn         = me?.username === username;

  const [tab, setTab]         = useState<ProfileTab>('posts');
  const [posts, setPosts]     = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [nextCursor, setNextCursor]     = useState<string | undefined>();
  const [hasMore, setHasMore]           = useState(false);

  useEffect(() => {
    if (!profile) return;
    setPostsLoading(true);
    getUserPosts(username).then((res) => {
      setPosts(res.data.posts);
      setNextCursor(res.data.nextCursor);
      setHasMore(res.data.hasNextPage);
    }).finally(() => setPostsLoading(false));
  }, [username, profile]);

  const loadMorePosts = async () => {
    if (!hasMore || !nextCursor) return;
    const res = await getUserPosts(username, nextCursor);
    setPosts((prev) => [...prev, ...res.data.posts]);
    setNextCursor(res.data.nextCursor);
    setHasMore(res.data.hasNextPage);
  };

  const handleLike = async (postId: string, liked: boolean, count: number) => {
    setPosts((prev) => prev.map((p) =>
      p._id === postId ? { ...p, isLiked: !liked, likesCount: liked ? count - 1 : count + 1 } : p,
    ));
    try {
      const res = await toggleLike(postId);
      setPosts((prev) => prev.map((p) =>
        p._id === postId ? { ...p, isLiked: res.data.liked, likesCount: res.data.likesCount } : p,
      ));
    } catch {
      setPosts((prev) => prev.map((p) =>
        p._id === postId ? { ...p, isLiked: liked, likesCount: count } : p,
      ));
    }
  };

  const handleDelete = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    await deletePost(postId);
  };

  const handleEdit = async (postId: string, content: string) => {
    const res = await updatePost(postId, { content });
    setPosts((prev) => prev.map((p) => p._id === postId ? res.data.post : p));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="Developer not found"
        description={`No developer with username @${username} exists.`}
      />
    );
  }

  const TABS: { id: ProfileTab; label: string; count?: number }[] = [
    { id: 'posts',      label: 'Posts',      count: profile.stats.postsCount },
    { id: 'experience', label: 'Experience', count: profile.experience?.length },
    { id: 'education',  label: 'Education',  count: profile.education?.length },
    { id: 'skills',     label: 'Skills' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <ProfileHeader
        user={profile}
        isOwn={isOwn}
        onAvatarChange={isOwn ? (f) => ownProfile.uploadAvatar(f).catch(console.error) : undefined}
        onBannerChange={isOwn ? (f) => ownProfile.uploadBanner(f).catch(console.error) : undefined}
      />

      {/* Profile completion tip */}
      {isOwn && (profile.profileCompletion ?? 0) < 80 && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/20">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-indigo-400 mt-0.5 shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <circle cx="8" cy="11" r="0.7" fill="currentColor"/>
          </svg>
          <div>
            <p className="text-sm text-indigo-300 font-medium">Profile {profile.profileCompletion ?? 0}% complete</p>
            <p className="text-xs text-indigo-500 mt-0.5">
              {!profile.bio ? 'Add a bio, ' : ''}
              {(profile.skills?.length ?? 0) < 3 ? 'add 3+ skills, ' : ''}
              {(profile.experience?.length ?? 0) === 0 ? 'add work experience ' : ''}
              to strengthen your profile.
            </p>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-white/[0.02] border border-white/[0.05] rounded-xl">
        {TABS.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all',
              tab === id
                ? 'bg-white/[0.07] text-slate-200'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]',
            )}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                tab === id ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.05] text-slate-600',
              )}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'posts' && (
        <div className="space-y-4">
          {postsLoading ? (
            <FeedSkeletons count={3} />
          ) : posts.length === 0 ? (
            <EmptyState
              title="No posts yet"
              description={isOwn ? 'Share what you're building — projects, ideas, wins.' : `@${username} hasn't posted yet.`}
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5"/></svg>}
            />
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={me?._id}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
              {hasMore && (
                <button
                  onClick={loadMorePosts}
                  className="w-full py-3 rounded-xl border border-white/[0.06] text-sm text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] transition-all"
                >
                  Load more posts
                </button>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'experience' && (
        <ExperienceSection
          experience={profile.experience ?? []}
          isOwn={isOwn}
          onAdd={isOwn    ? (d) => ownProfile.addExperience(d).then(() => {}) : undefined}
          onUpdate={isOwn ? (id, d) => ownProfile.updateExperience(id, d).then(() => {}) : undefined}
          onDelete={isOwn ? (id) => ownProfile.deleteExperience(id) : undefined}
        />
      )}

      {tab === 'education' && (
        <EducationSection
          education={profile.education ?? []}
          isOwn={isOwn}
          onAdd={isOwn    ? (d) => ownProfile.addEducation(d).then(() => {}) : undefined}
          onUpdate={isOwn ? (id, d) => ownProfile.updateEducation(id, d).then(() => {}) : undefined}
          onDelete={isOwn ? (id) => ownProfile.deleteEducation(id) : undefined}
        />
      )}

      {tab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SkillsSection
            user={profile}
            isOwn={isOwn}
            onSave={isOwn
              ? (skills, techStack) => ownProfile.updateProfile({ skills, techStack }).then(() => {})
              : undefined}
          />
          <SectionCard title="Activity">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Connections', value: profile.stats.connectionsCount },
                { label: 'Posts',       value: profile.stats.postsCount },
                { label: 'Projects',    value: profile.stats.projectsCount },
                { label: 'Views',       value: profile.stats.profileViews },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-lg font-semibold text-slate-100">{compactNumber(value)}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
