'use client';

import Image  from 'next/image';
import Link   from 'next/link';
import { Avatar }                  from '../shared/Avatar';
import { compactNumber, timeAgo }  from '../../lib/utils/format';
import { cn }                      from '../../lib/utils/cn';
import type { Project }            from '../../lib/api/projects.api';

const STATUS_BADGE = {
  'in-progress': { label: 'In progress', cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  'completed':   { label: 'Completed',   cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
  'archived':    { label: 'Archived',    cls: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
} as const;

interface ProjectCardProps {
  project:    Project;
  onLike:     (id: string, liked: boolean, count: number) => void;
  onSave:     (id: string, saved: boolean, count: number) => void;
  isOwn?:     boolean;
  onEdit?:    (project: Project) => void;
  onDelete?:  (id: string) => void;
}

export function ProjectCard({ project, onLike, onSave, isOwn, onEdit, onDelete }: ProjectCardProps) {
  const badge = STATUS_BADGE[project.status];

  return (
    <article className="group card border border-steel/10 rounded-2xl overflow-hidden hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200">
      {/* Thumbnail */}
      <Link href={`/projects/${project._id}`} className="block relative aspect-video bg-gradient-to-br from-indigo-900/30 to-slate-900/60 overflow-hidden">
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-slate-700">
              <rect x="4" y="4" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 28l6-8 5 6 3-4 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="15" cy="15" r="3" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border', badge.cls)}>
            {badge.label}
          </span>
        </div>
        {/* Screenshot count */}
        {project.screenshots.length > 1 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px]">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M1 6l2-2.5 2 2 1.5-2L9 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {project.screenshots.length}
          </div>
        )}
      </Link>

      <div className="p-4">
        {/* Title + links */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/projects/${project._id}`} className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-200 truncate hover:text-white transition-colors">
              {project.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-slate-600 hover:text-slate-300 transition-colors" title="GitHub">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M7 .5a6.5 6.5 0 00-2.054 12.668c.325.06.443-.14.443-.313V11.1c-1.894.411-2.294-.914-2.294-.914-.308-.784-.754-.993-.754-.993-.617-.421.046-.413.046-.413.682.048 1.041.7 1.041.7.607 1.038 1.592.738 1.98.565.062-.44.237-.738.432-.908-1.51-.172-3.096-.755-3.096-3.36 0-.742.266-1.348.7-1.823-.07-.172-.303-.863.066-1.8 0 0 .57-.183 1.866.696A6.494 6.494 0 017 4.55c.577.003 1.158.078 1.7.229 1.294-.879 1.862-.696 1.862-.696.37.937.137 1.628.067 1.8.436.475.7 1.08.7 1.823 0 2.613-1.588 3.186-3.101 3.355.244.21.462.623.462 1.257v1.862c0 .175.117.38.448.316A6.5 6.5 0 007 .5z"/>
                </svg>
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-slate-600 hover:text-teal-400 transition-colors" title="Live demo">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M6 2H3a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8M8 2h4m0 0v4m0-4L6 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">{project.description}</p>

        {/* Tech stack */}
        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.techStack.slice(0, 4).map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-steel/10 text-[10px] text-slate-400 font-mono">
                {t}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-slate-600">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          {/* Owner */}
          <Link href={`/${project.owner.username}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar src={project.owner.avatar} name={project.owner.name} size="xs" />
            <span className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              @{project.owner.username}
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            {/* Views */}
            <span className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" strokeWidth="1.1"/>
                <circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
              </svg>
              {compactNumber(project.viewsCount)}
            </span>

            {/* Like */}
            <button
              onClick={() => onLike(project._id, project.isLiked, project.likesCount)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all',
                project.isLiked
                  ? 'text-pink-400 bg-pink-500/10'
                  : 'text-slate-600 hover:text-slate-300 hover:bg-white/[0.04]',
              )}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 10.5S1 7.5 1 4.5a2.5 2.5 0 015 0 2.5 2.5 0 015 0c0 3-5 6-5 6z"
                  stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
                  fill={project.isLiked ? 'currentColor' : 'none'} fillOpacity={project.isLiked ? 0.3 : 0}
                />
              </svg>
              {compactNumber(project.likesCount)}
            </button>

            {/* Save */}
            <button
              onClick={() => onSave(project._id, project.isSaved, project.savesCount)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all',
                project.isSaved
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-slate-600 hover:text-slate-300 hover:bg-white/[0.04]',
              )}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2h8v9L6 9 2 11V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
                  fill={project.isSaved ? 'currentColor' : 'none'} fillOpacity={project.isSaved ? 0.3 : 0}
                />
              </svg>
              {compactNumber(project.savesCount)}
            </button>

            {/* Owner actions */}
            {isOwn && (
              <div className="flex items-center gap-0.5 ml-1 pl-1 border-l border-steel/10">
                <button onClick={() => onEdit?.(project)}
                  className="p-1 rounded text-slate-600 hover:text-slate-300 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button onClick={() => onDelete?.(project._id)}
                  className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 3h8M4 3V2h4v1M4.5 5.5v3M7.5 5.5v3M3 3l.5 7h5l.5-7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function ProjectCardSkeleton() {
  return (
    <div className="card border border-steel/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-white/[0.04]" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-white/[0.05] rounded" />
        <div className="h-3 w-full bg-white/[0.04] rounded" />
        <div className="h-3 w-2/3 bg-white/[0.04] rounded" />
        <div className="flex gap-1.5">
          {[1,2,3].map((i) => <div key={i} className="h-5 w-14 bg-white/[0.04] rounded-md" />)}
        </div>
      </div>
    </div>
  );
}

// Patched skeleton with Synq colors
export function ProjectCardSkeletonSynq() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(13,19,28,0.7)', border:'1px solid rgba(109,129,150,0.1)' }}>
      <div className="aspect-video skeleton"/>
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 skeleton rounded"/>
        <div className="h-3 w-full skeleton rounded"/>
        <div className="h-3 w-2/3 skeleton rounded"/>
        <div className="flex gap-1.5">
          {[1,2,3].map(i => <div key={i} className="h-5 w-14 skeleton rounded-md"/>)}
        </div>
      </div>
    </div>
  );
}
