'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar } from '../shared/Avatar';
import { timeAgo, compactNumber } from '../../lib/utils/format';
import { cn } from '../../lib/utils/cn';
import type { Post } from '../../lib/api/posts.api';
import { CommentSection } from './CommentSection';

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike:   (postId: string, liked: boolean, count: number) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onEdit:   (postId: string, content: string) => Promise<void>;
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  'achievement':      { label: '🏆 Achievement', cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  'project-showcase': { label: '🚀 Project',     cls: 'bg-violet-500/10 text-violet-300 border-violet-500/20' },
  'image':            { label: '🖼 Photo',        cls: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' },
};

export function PostCard({ post, currentUserId, onLike, onDelete, onEdit }: PostCardProps) {
  const [showComments, setShowComments]   = useState(false);
  const [editing, setEditing]             = useState(false);
  const [editContent, setEditContent]     = useState(post.content);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [editSaving, setEditSaving]       = useState(false);
  const [liking, setLiking]               = useState(false);
  const [shareMsg, setShareMsg]           = useState(false);

  const isOwn = post.author._id === currentUserId;

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try { await onLike(post._id, post.isLiked, post.likesCount); }
    finally { setLiking(false); }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setEditSaving(true);
    try {
      await onEdit(post._id, editContent);
      setEditing(false);
    } finally { setEditSaving(false); }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`);
      setShareMsg(true);
      setTimeout(() => setShareMsg(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <article className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.10] transition-all duration-200 group">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Link href={`/${post.author.username}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Avatar src={post.author.avatar} name={post.author.name} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-200 hover:text-white transition-colors">
                  {post.author.name}
                </p>
                {TYPE_BADGE[post.type] && (
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-medium border',
                    TYPE_BADGE[post.type].cls,
                  )}>
                    {TYPE_BADGE[post.type].label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span>@{post.author.username}</span>
                <span>·</span>
                <span>{timeAgo(post.createdAt)}</span>
                {post.isEdited && <span className="italic">· edited</span>}
                {post.visibility === 'connections-only' && (
                  <span className="text-amber-600">· 🔒</span>
                )}
              </div>
            </div>
          </Link>

          {/* Post menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="3" r="1.2" fill="currentColor"/>
                <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
                <circle cx="8" cy="13" r="1.2" fill="currentColor"/>
              </svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 w-44 bg-[#1a1a28] border border-white/[0.10] rounded-xl shadow-xl overflow-hidden">
                  {isOwn && (
                    <button
                      onClick={() => { setEditing(true); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05] transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9.5 1.5L12.5 4.5L5 12H2V9L9.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                      </svg>
                      Edit post
                    </button>
                  )}
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 3l3 3-3 3M2 10V7a4 4 0 014-4h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copy link
                  </button>
                  {isOwn && (
                    <button
                      onClick={() => { onDelete(post._id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 3.5h10M4.5 3.5V2h5v1.5M5.5 6.5v4M8.5 6.5v4M3 3.5l.7 8h6.6l.7-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {editing ? (
          <div className="space-y-3 mb-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              maxLength={3000}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-slate-200 resize-none focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setEditing(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving || !editContent.trim()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition-colors"
              >
                {editSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
        )}

        {/* Images */}
        {post.images.length > 0 && (
          <div className={cn(
            'grid gap-2 mb-4 rounded-xl overflow-hidden',
            post.images.length === 1 ? 'grid-cols-1' :
            post.images.length === 2 ? 'grid-cols-2' :
            post.images.length === 3 ? 'grid-cols-3' : 'grid-cols-2',
          )}>
            {post.images.map((src, i) => (
              <div key={i} className="relative aspect-video bg-black/20">
                <Image src={src} alt={`Post image ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((t) => (
              <span key={t} className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1 pt-3 border-t border-white/[0.04]">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={liking}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all',
              post.isLiked
                ? 'text-pink-400 bg-pink-500/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]',
            )}
          >
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              className={cn('transition-transform', liking && 'scale-90')}
            >
              <path
                d="M8 13.5S1.5 9.5 1.5 5.5a3.5 3.5 0 017-0c0-.16-.01.14 0 0a3.5 3.5 0 017 0c0 4-6.5 8-6.5 8z"
                stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"
                fill={post.isLiked ? 'currentColor' : 'none'} fillOpacity={post.isLiked ? 0.3 : 0}
              />
            </svg>
            <span>{compactNumber(post.likesCount)}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all',
              showComments
                ? 'text-indigo-400 bg-indigo-500/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]',
            )}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 8a5.5 5.5 0 01-7.78 5L2 14l1-3.72A5.5 5.5 0 1113.5 8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            <span>{compactNumber(post.commentsCount)}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all"
          >
            {shareMsg ? (
              <span className="text-xs text-emerald-400">Copied!</span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3l3 3-3 3M2 11V8a4 4 0 014-4h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{compactNumber(post.sharesCount)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-white/[0.05] px-5 py-4">
          <CommentSection postId={post._id} currentUserId={currentUserId} />
        </div>
      )}
    </article>
  );
}
