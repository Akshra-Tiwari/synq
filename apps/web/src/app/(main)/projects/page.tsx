'use client';

import { Suspense } from 'react';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore }     from '../../../lib/store/auth.store';
import { useProjects }      from '../../../hooks/useProjects';
import { ProjectCard, ProjectCardSkeleton } from '../../../components/projects/ProjectCard';
import { ProjectModal }     from '../../../components/projects/ProjectModal';
import { EmptyState }       from '../../../components/shared/UI';
import { cn }               from '../../../lib/utils/cn';
import type { Project }     from '../../../lib/api/projects.api';

const SORT_TABS = [
  { value: 'newest',  label: 'Newest' },
  { value: 'popular', label: 'Most liked' },
  { value: 'saved',   label: 'Most saved' },
] as const;

const POPULAR_TECH = ['React', 'Next.js', 'TypeScript', 'Python', 'Node.js', 'Rust', 'Go', 'Vue', 'Svelte', 'Flutter'];

function ProjectsContent() {
  const { user }  = useAuthStore();
  const router    = useRouter();
  const sp        = useSearchParams();

  const [sort,       setSort]       = useState<'newest' | 'popular' | 'saved'>('newest');
  const [techFilter, setTechFilter] = useState<string>(sp.get('tech') ?? '');
  const [search,     setSearch]     = useState(sp.get('q') ?? '');
  const [searchInput, setSearchInput] = useState(sp.get('q') ?? '');
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Project | null>(null);

  const {
    projects, total, totalPages, page, isLoading,
    fetchProjects, createProject, updateProject, deleteProject,
    toggleLike, toggleSave,
  } = useProjects();

  useEffect(() => {
    fetchProjects({ q: search || undefined, tech: techFilter || undefined, sort, page: 1 });
  }, [sort, techFilter, search, fetchProjects]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleTechFilter = (tech: string) => {
    setTechFilter((prev) => prev === tech ? '' : tech);
  };

  const handleCreate = async (payload: Parameters<typeof createProject>[0]) => {
    await createProject(payload);
    setModalOpen(false);
  };

  const handleUpdate = async (payload: Parameters<typeof createProject>[0]) => {
    if (!editing) return;
    await updateProject(editing._id, payload);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    await deleteProject(id);
  };

  const goPage = (p: number) => {
    fetchProjects({ q: search || undefined, tech: techFilter || undefined, sort, page: p });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {total > 0 ? `${total} project${total !== 1 ? 's' : ''} built by developers` : 'What developers are building'}
          </p>
        </div>
        {user && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New project
          </button>
        )}
      </div>

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search projects by name or description…"
              className="w-full h-10 bg-white/[0.04] border border-white/[0.07] rounded-xl pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
        </form>

        <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.05] rounded-xl">
          {SORT_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                sort === value
                  ? 'bg-white/[0.08] text-slate-200'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tech filter chips */}
      <div className="flex flex-wrap gap-2">
        {POPULAR_TECH.map((tech) => (
          <button
            key={tech}
            onClick={() => handleTechFilter(tech)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-mono transition-all border',
              techFilter === tech
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300 hover:border-white/[0.12]',
            )}
          >
            {tech}
          </button>
        ))}
        {techFilter && !POPULAR_TECH.includes(techFilter) && (
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            {techFilter}
          </span>
        )}
        {techFilter && (
          <button
            onClick={() => setTechFilter('')}
            className="px-3 py-1 rounded-full text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            Clear filter ✕
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title={search || techFilter ? 'No projects match your search' : 'No projects yet'}
          description={search || techFilter ? 'Try different keywords or filters.' : 'Be the first to showcase a project!'}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          }
          action={user && !search && !techFilter ? (
            <button onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-colors">
              Add your first project
            </button>
          ) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              isOwn={user?._id === project.owner._id}
              onLike={toggleLike}
              onSave={toggleSave}
              onEdit={(p) => setEditing(p)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => goPage(page - 1)}
            className="h-9 px-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-all"
          >
            ← Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => goPage(p)}
                className={cn(
                  'h-9 w-9 rounded-xl text-sm font-medium transition-all',
                  p === page
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:text-slate-200',
                )}
              >
                {p}
              </button>
            );
          })}
          <button
            disabled={page >= totalPages}
            onClick={() => goPage(page + 1)}
            className="h-9 px-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-all"
          >
            Next →
          </button>
        </div>
      )}

      {/* Create modal */}
      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
      />

      {/* Edit modal */}
      <ProjectModal
        open={!!editing}
        onClose={() => setEditing(null)}
        project={editing ?? undefined}
        onSave={handleUpdate}
      />
    </div>
  );
}

const Loader = () => (
  <div className="flex justify-center py-20">
    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
      style={{ borderColor:'#01796F', borderTopColor:'transparent' }}/>
  </div>
);

export default function ProjectsPage() {
  return <Suspense fallback={<Loader />}><ProjectsContent /></Suspense>;
}
