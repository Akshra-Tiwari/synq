'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar } from '../shared/Avatar';
import { timeAgo, compactNumber } from '../../lib/utils/format';
import { cn } from '../../lib/utils/cn';
import { useComments } from '../../hooks/useFeed';
import type { Comment } from '../../lib/api/posts.api';

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  isReply?: boolean;
  onReplyAdded?: (comment: Comment) => void;
  onDelete: (commentId: string) => Promise<void>;
  onEdit:   (commentId: string, content: string) => Promise<void>;
  onLike:   (commentId: string) => Promise<{ liked: boolean; likesCount: number }>;
}

function CommentItem({ comment, postId, currentUserId, isReply, onDelete, onEdit, onLike }: CommentItemProps) {
  const [editing, setEditing]       = useState(false);
  const [editText, setEditText]     = useState(comment.content);
  const [replying, setReplying]     = useState(false);
  const [replyText, setReplyText]   = useState('');
  const [saving, setSaving]         = useState(false);
  const [likeData, setLikeData]     = useState({ liked: comment.isLiked, count: comment.likesCount });
  const { addComment }              = useComments(postId);
  const inputRef                    = useRef<HTMLInputElement>(null);

  const isOwn = comment.author._id === currentUserId;

  const handleLike = async () => {
    const prev = { ...likeData };
    setLikeData({ liked: !likeData.liked, count: likeData.liked ? likeData.count - 1 : likeData.count + 1 });
    try {
      const res = await onLike(comment._id);
      setLikeData({ liked: res.liked, count: res.likesCount });
    } catch {
      setLikeData(prev);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try { await onEdit(comment._id, editText); setEditing(false); }
    finally { setSaving(false); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      await addComment(replyText, comment._id);
      setReplyText(''); setReplying(false);
    } finally { setSaving(false); }
  };

  return (
    <div className={cn('flex gap-3', isReply && 'ml-10 mt-3')}>
      <Avatar src={comment.author.avatar} name={comment.author.name} size="sm" className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="bg-white/[0.03] rounded-xl px-3.5 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-300">{comment.author.name}</span>
            <span className="text-xs text-slate-600">@{comment.author.username}</span>
            <span className="text-xs text-slate-700">·</span>
            <span className="text-xs text-slate-700">{timeAgo(comment.createdAt)}</span>
            {comment.isEdited && <span className="text-xs text-slate-700 italic">edited</span>}
          </div>
          {editing ? (
            <div className="space-y-2">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-300 focus:outline-none border-b border-white/[0.08] pb-1"
              />
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="text-xs text-slate-600 hover:text-slate-400">Cancel</button>
                <button onClick={handleEdit} disabled={saving} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 leading-relaxed">{comment.content}</p>
          )}
        </div>

        {/* Comment actions */}
        <div className="flex items-center gap-3 mt-1.5 ml-1">
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1 text-xs transition-colors',
              likeData.liked ? 'text-pink-400' : 'text-slate-600 hover:text-slate-400',
            )}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 10.5S1 7.5 1 4.5a2.5 2.5 0 015 0 2.5 2.5 0 015 0c0 3-5 6-5 6z"
                stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
                fill={likeData.liked ? 'currentColor' : 'none'} fillOpacity={likeData.liked ? 0.3 : 0}
              />
            </svg>
            {likeData.count > 0 && compactNumber(likeData.count)}
          </button>

          {!isReply && (
            <button
              onClick={() => { setReplying(!replying); setTimeout(() => inputRef.current?.focus(), 50); }}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              Reply
            </button>
          )}

          {isOwn && !editing && (
            <>
              <button onClick={() => setEditing(true)} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Edit</button>
              <button onClick={() => onDelete(comment._id)} className="text-xs text-slate-600 hover:text-red-400 transition-colors">Delete</button>
            </>
          )}
        </div>

        {/* Reply input */}
        {replying && (
          <div className="flex items-center gap-2 mt-2">
            <input
              ref={inputRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReply()}
              placeholder="Write a reply…"
              className="flex-1 h-8 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-all"
            />
            <button
              onClick={handleReply}
              disabled={!replyText.trim() || saving}
              className="h-8 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition-colors"
            >
              {saving ? '…' : 'Reply'}
            </button>
            <button onClick={() => setReplying(false)} className="text-xs text-slate-600 hover:text-slate-400">✕</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments, setComments]     = useState<Comment[]>([]);
  const [loading, setLoading]       = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { fetchComments, addComment, editComment, removeComment, likeComment } = useComments(postId);

  useEffect(() => {
    fetchComments().then(setComments).finally(() => setLoading(false));
  }, [fetchComments]);

  const handleAdd = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const c = await addComment(newComment);
      setComments((prev) => [...prev, c]);
      setNewComment('');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (commentId: string) => {
    await removeComment(commentId);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  const handleEdit = async (commentId: string, content: string) => {
    const updated = await editComment(commentId, content);
    setComments((prev) => prev.map((c) => c._id === commentId ? updated : c));
  };

  const handleLike = async (commentId: string) => {
    return likeComment(commentId);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2"/>
          <path d="M10.5 6a4.5 4.5 0 00-4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Loading comments…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add comment input */}
      <div className="flex items-center gap-3">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a comment…"
          className="flex-1 h-9 px-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-all"
        />
        <button
          onClick={handleAdd}
          disabled={!newComment.trim() || submitting}
          className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          Post
        </button>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-700 text-center py-4">No comments yet. Be the first.</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              currentUserId={currentUserId}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onLike={handleLike}
            />
          ))
        )}
      </div>
    </div>
  );
}
