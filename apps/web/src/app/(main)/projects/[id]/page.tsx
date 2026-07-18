'use client';

import { use, useEffect, useState } from 'react';
import Image     from 'next/image';
import Link      from 'next/link';
import { useAuthStore }  from '../../../../lib/store/auth.store';
import { getProject, toggleLike, toggleSave, deleteProject } from '../../../../lib/api/projects.api';
import { Avatar }        from '../../../../components/shared/Avatar';
import { TechBadge, AvailabilityBadge } from '../../../../components/shared/Badges';
import { Spinner, EmptyState } from '../../../../components/shared/UI';
import { ProjectModal }  from '../../../../components/projects/ProjectModal';
import { updateProject } from '../../../../lib/api/projects.api';
import { compactNumber, timeAgo } from '../../../../lib/utils/format';
import { cn }            from '../../../../lib/utils/cn';
import { useRouter }     from 'next/navigation';
import type { Project }  from '../../../../lib/api/projects.api';

const STATUS_COLORS = {
  'in-progress': 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  'completed':   'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  'archived':    'text-[#7A9A7E] bg-slate-500/10 border-slate-500/20',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id }       = use(params);
  const router       = useRouter();
  const { user }     = useAuthStore();

  const [project, setProject]   = useState<Project | null>(null);
  const [loading, setLoading]   = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [liking,   setLiking]   = useState(false);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    setLoading(true);
    getProject(id)
      .then((res) => setProject(res.data.project))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!project || liking) return;
    setLiking(true);
    const prev = { isLiked: project.isLiked, likesCount: project.likesCount };
    setProject((p) => p ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 } : p);
    try {
      const res = await toggleLike(project._id);
      setProject((p) => p ? { ...p, isLiked: res.data.liked, likesCount: res.data.likesCount } : p);
    } catch {
      setProject((p) => p ? { ...p, ...prev } : p);
    } finally { setLiking(false); }
  };

  const handleSave = async () => {
    if (!project || saving) return;
    setSaving(true);
    const prev = { isSaved: project.isSaved, savesCount: project.savesCount };
    setProject((p) => p ? { ...p, isSaved: !p.isSaved, savesCount: p.isSaved ? p.savesCount - 1 : p.savesCount + 1 } : p);
    try {
      const res = await toggleSave(project._id);
      setProject((p) => p ? { ...p, isSaved: res.data.saved, savesCount: res.data.savesCount } : p);
    } catch {
      setProject((p) => p ? { ...p, ...prev } : p);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!project || !confirm('Delete this project? This cannot be undone.')) return;
    await deleteProject(project._id);
    router.push('/projects');
  };

  const handleUpdate = async (payload: Parameters<typeof updateProject>[1]) => {
    if (!project) return;
    const res = await updateProject(project._id, payload);
    setProject(res.data.project);
    setEditOpen(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!project) return <EmptyState title="Project not found" description="This project may have been removed." />;

  const isOwn    = user?._id === project.owner._id;
  const screenshots = project.screenshots.length > 0 ? project.screenshots : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Back */}
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-[#5A7A5E] hover:text-[#9EB5A0] transition-colors">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: media + description ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Screenshot carousel */}
          {screenshots.length > 0 ? (
            <div className="space-y-2">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40">
                <Image
                  src={screenshots[activeImg]}
                  alt={`Screenshot ${activeImg + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
                {screenshots.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg((i) => (i - 1 + screenshots.length) % screenshots.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setActiveImg((i) => (i + 1) % screenshots.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {screenshots.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={cn(
                            'h-1.5 rounded-full transition-all',
                            i === activeImg ? 'w-4 bg-white' : 'w-1.5 bg-white/40',
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {screenshots.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {screenshots.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={cn(
                        'relative shrink-0 w-16 h-10 rounded-lg overflow-hidden transition-all',
                        i === activeImg ? 'ring-2 ring-indigo-500' : 'opacity-50 hover:opacity-80',
                      )}
                    >
                      <Image src={src} alt={`Thumb ${i + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-indigo-900/30 to-slate-900/60 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#2A4A2E]">
                <rect x="6" y="6" width="36" height="36" rx="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 32l12-14 10 12 7-8 13 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="18" cy="18" r="4" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          )}

          {/* Long description */}
          {project.longDescription && (
            <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-[#9EB5A0] mb-3">About this project</h2>
              <p className="text-sm text-[#7A9A7E] leading-relaxed whitespace-pre-wrap">
                {project.longDescription}
              </p>
            </div>
          )}
        </div>

        {/* ── Right: project info ── */}
        <div className="space-y-4">
          {/* Main info card */}
          <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-5 space-y-4">
            {/* Status + title */}
            <div>
              <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mb-2', STATUS_COLORS[project.status])}>
                {project.status.replace('-', ' ')}
              </span>
              <h1 className="text-lg font-semibold text-[#E2EBE4] leading-snug">{project.title}</h1>
              <p className="text-sm text-[#5A7A5E] mt-1 leading-relaxed">{project.description}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 py-3 border-y border-[rgba(1,121,111,0.1)]">
              <div className="text-center">
                <p className="text-base font-semibold text-[#C8DCC9]">{compactNumber(project.viewsCount)}</p>
                <p className="text-xs text-[#3A6A3E]">Views</p>
              </div>
              <div className="w-px h-8 bg-[rgba(1,121,111,0.08)]" />
              <div className="text-center">
                <p className="text-base font-semibold text-[#C8DCC9]">{compactNumber(project.likesCount)}</p>
                <p className="text-xs text-[#3A6A3E]">Likes</p>
              </div>
              <div className="w-px h-8 bg-[rgba(1,121,111,0.08)]" />
              <div className="text-center">
                <p className="text-base font-semibold text-[#C8DCC9]">{compactNumber(project.savesCount)}</p>
                <p className="text-xs text-[#3A6A3E]">Saved</p>
              </div>
              <div className="w-px h-8 bg-[rgba(1,121,111,0.08)]" />
              <div className="text-center">
                <p className="text-xs text-[#3A6A3E]">{timeAgo(project.createdAt)}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleLike}
                disabled={!user || liking}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-all',
                  project.isLiked
                    ? 'bg-pink-500/15 text-pink-300 border border-pink-500/25 hover:bg-pink-500/25'
                    : 'bg-[rgba(1,121,111,0.06)] border border-[rgba(1,121,111,0.15)] text-[#7A9A7E] hover:text-[#C8DCC9] hover:bg-white/[0.07]',
                  (!user || liking) && 'opacity-60 cursor-default',
                )}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M7.5 12.5S1 8.5 1 4.5a3 3 0 016-0c0-.14-.01.12 0 0a3 3 0 016 0c0 4-6.5 8-6.5 8z"
                    stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"
                    fill={project.isLiked ? 'currentColor' : 'none'} fillOpacity={project.isLiked ? 0.3 : 0}
                  />
                </svg>
                {project.isLiked ? 'Liked' : 'Like'}
              </button>

              <button
                onClick={handleSave}
                disabled={!user || saving}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-all',
                  project.isSaved
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/25'
                    : 'bg-[rgba(1,121,111,0.06)] border border-[rgba(1,121,111,0.15)] text-[#7A9A7E] hover:text-[#C8DCC9] hover:bg-white/[0.07]',
                  (!user || saving) && 'opacity-60 cursor-default',
                )}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2h10v11l-5-3-5 3V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"
                    fill={project.isSaved ? 'currentColor' : 'none'} fillOpacity={project.isSaved ? 0.3 : 0}
                  />
                </svg>
                {project.isSaved ? 'Saved' : 'Save'}
              </button>
            </div>

            {/* External links */}
            <div className="flex flex-col gap-2">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 h-10 px-4 rounded-xl bg-[rgba(23,37,24,0.8)] border border-white/[0.07] text-sm text-[#7A9A7E] hover:text-[#C8DCC9] hover:bg-[rgba(1,121,111,0.08)] transition-all">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 .5a7.5 7.5 0 00-2.37 14.617c.375.07.51-.162.51-.36V13.2c-2.085.453-2.524-1-2.524-1-.342-.867-.835-1.098-.835-1.098-.682-.466.052-.457.052-.457.754.053 1.15.774 1.15.774.67 1.147 1.757.816 2.186.624.068-.485.262-.816.477-1.003-1.668-.19-3.42-.834-3.42-3.713 0-.82.293-1.49.774-2.016-.078-.19-.336-.953.073-1.987 0 0 .63-.202 2.065.77A7.19 7.19 0 018 5.018a7.19 7.19 0 011.879.253c1.433-.972 2.062-.77 2.062-.77.41 1.034.152 1.797.074 1.987.482.525.773 1.195.773 2.016 0 2.887-1.754 3.52-3.424 3.706.27.233.51.692.51 1.394v2.065c0 .2.133.433.514.36A7.5 7.5 0 008 .5z"/>
                  </svg>
                  View on GitHub
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto">
                    <path d="M4 2h6m0 0v6m0-6L4 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 h-10 px-4 rounded-xl bg-[#01796F]/10 border border-indigo-500/20 text-sm text-teal-300 hover:bg-[#01796F]/20 transition-all">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M7.5 1C6 3.5 6 11.5 7.5 14M7.5 1C9 3.5 9 11.5 7.5 14M1 7.5h13" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  Live demo
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto">
                    <path d="M4 2h6m0 0v6m0-6L4 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Tech stack */}
          {project.techStack.length > 0 && (
            <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#5A7A5E] uppercase tracking-wider mb-3">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((t) => <TechBadge key={t} tech={t} />)}
              </div>
            </div>
          )}

          {/* Owner */}
          <div className="bg-[rgba(23,37,24,0.7)] border border-[rgba(1,121,111,0.12)] rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#5A7A5E] uppercase tracking-wider mb-3">Built by</p>
            <Link href={`/${project.owner.username}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <Avatar src={project.owner.avatar} name={project.owner.name} size="md" />
              <div>
                <p className="text-sm font-semibold text-[#C8DCC9]">{project.owner.name}</p>
                <p className="text-xs text-[#5A7A5E]">@{project.owner.username}</p>
              </div>
            </Link>
            {project.owner.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.owner.skills.slice(0, 4).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-[#01796F]/10 border border-indigo-500/20 text-teal-300 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Owner actions */}
          {isOwn && (
            <div className="flex gap-2">
              <button onClick={() => setEditOpen(true)}
                className="flex-1 h-9 rounded-xl bg-[rgba(1,121,111,0.06)] border border-white/[0.07] text-sm text-[#7A9A7E] hover:text-[#C8DCC9] hover:bg-white/[0.07] transition-all">
                Edit project
              </button>
              <button onClick={handleDelete}
                className="h-9 px-4 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-all">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {isOwn && (
        <ProjectModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          project={project}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}
