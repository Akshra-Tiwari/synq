'use client';

import { useEffect, useState, useCallback } from 'react';
import { getReportedContent, hidePost, unhidePost, deletePostAdmin } from '../../../lib/api/admin.api';
import { Avatar }   from '../../../components/shared/Avatar';
import { Spinner, EmptyState }  from '../../../components/shared/UI';
import { timeAgo }  from '../../../lib/utils/format';
import { cn }       from '../../../lib/utils/cn';

interface ReportedPost {
  _id:         string;
  content:     string;
  reportCount: number;
  isHidden:    boolean;
  likesCount:  number;
  createdAt:   string;
  author: {
    _id:      string;
    name:     string;
    username: string;
    avatar?:  string;
  };
}

export default function AdminReportsPage() {
  const [posts,      setPosts]      = useState<ReportedPost[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [acting,     setActing]     = useState<string | null>(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await getReportedContent(p);
      setPosts(res.data.posts as ReportedPost[]);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  const handleHide = async (postId: string) => {
    setActing(postId);
    try {
      await hidePost(postId);
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, isHidden: true } : p));
    } finally { setActing(null); }
  };

  const handleUnhide = async (postId: string) => {
    setActing(postId);
    try {
      await unhidePost(postId);
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, isHidden: false, reportCount: 0 } : p));
    } finally { setActing(null); }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Permanently delete this post?')) return;
    setActing(postId);
    try {
      await deletePostAdmin(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setTotal((t) => Math.max(0, t - 1));
    } finally { setActing(null); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Reported Content</h1>
        <p className="text-sm text-slate-500 mt-1">
          {total} post{total !== 1 ? 's' : ''} flagged by users
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No reported content"
          description="No posts have been flagged by users."
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3 6h6l-4.5 4 1.5 6-6-3.5L6 18l1.5-6L3 8h6l3-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          }
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id}
              className={cn(
                'bg-white/[0.02] border rounded-2xl p-5 transition-all',
                post.isHidden
                  ? 'border-slate-700/40 opacity-60'
                  : post.reportCount >= 5
                  ? 'border-red-500/30 ring-1 ring-red-500/10'
                  : 'border-white/[0.06]',
              )}>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <Avatar src={post.author.avatar} name={post.author.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{post.author.name}</p>
                    <p className="text-xs text-slate-600">@{post.author.username} · {timeAgo(post.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Report count badge */}
                  <span className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                    post.reportCount >= 10
                      ? 'bg-red-500/15 text-red-300 border-red-500/25'
                      : post.reportCount >= 5
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                      : 'bg-white/[0.05] text-slate-400 border-white/[0.08]',
                  )}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 1l1.2 2.5H9L6.9 5.3l.8 2.7L5 6.5 2.3 8l.8-2.7L1 3.5h2.8L5 1z"
                        fill="currentColor"/>
                    </svg>
                    {post.reportCount} report{post.reportCount !== 1 ? 's' : ''}
                  </span>

                  {post.isHidden && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-700/40 text-slate-500 border border-slate-700/50">
                      Hidden
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-4">{post.content}</p>

              {/* Post stats */}
              <div className="flex items-center gap-4 text-xs text-slate-600 mb-4">
                <span>{post.likesCount} likes</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/[0.05]">
                {post.isHidden ? (
                  <button
                    onClick={() => handleUnhide(post._id)}
                    disabled={acting === post._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                    Restore post
                  </button>
                ) : (
                  <button
                    onClick={() => handleHide(post._id)}
                    disabled={acting === post._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/20 transition-all disabled:opacity-50"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M2 2l8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    Hide post
                  </button>
                )}

                <button
                  onClick={() => handleDelete(post._id)}
                  disabled={acting === post._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 3h8M4 3V2h4v1M4.5 5.5v3M7.5 5.5v3M3 3l.5 7h5l.5-7"
                      stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Delete permanently
                </button>

                {acting === post._id && (
                  <svg className="animate-spin ml-1 text-slate-600" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/>
                    <path d="M12.5 7a5.5 5.5 0 00-5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button disabled={page <= 1} onClick={() => load(page - 1)}
                className="h-9 px-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-slate-400 disabled:opacity-30 hover:text-slate-200 transition-all">
                ← Prev
              </button>
              <span className="text-xs text-slate-600">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => load(page + 1)}
                className="h-9 px-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-slate-400 disabled:opacity-30 hover:text-slate-200 transition-all">
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
