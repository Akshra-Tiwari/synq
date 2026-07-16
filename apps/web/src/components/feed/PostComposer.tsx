'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Avatar } from '../shared/Avatar';
import { cn } from '../../lib/utils/cn';
import { getApiErrorMessage } from '../../lib/utils/errors';
import type { PostType } from '../../lib/api/posts.api';

interface PostComposerProps {
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  onPost: (payload: {
    content: string;
    type: PostType;
    tags: string[];
    visibility: 'public' | 'connections-only';
    images?: File[];
  }) => Promise<void>;
}

const TYPE_OPTIONS: { value: PostType; label: string; icon: React.ReactNode }[] = [
  {
    value: 'text',
    label: 'Post',
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M2 7h7M2 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    value: 'achievement',
    label: 'Achievement',
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.6 3.4L12 5l-2.5 2.4.6 3.5L7 9.2 3.9 10.9l.6-3.5L2 5l3.4-.6L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  },
  {
    value: 'project-showcase',
    label: 'Project',
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4.5A1.5 1.5 0 013.5 3h3l1.5 1.5H11A1.5 1.5 0 0112.5 6v4.5A1.5 1.5 0 0111 12H3A1.5 1.5 0 011.5 10.5v-6z" stroke="currentColor" strokeWidth="1.2"/></svg>,
  },
];

export function PostComposer({ authorName, authorUsername, authorAvatar, onPost }: PostComposerProps) {
  const [expanded, setExpanded]       = useState(false);
  const [content, setContent]         = useState('');
  const [type, setType]               = useState<PostType>('text');
  const [tagInput, setTagInput]       = useState('');
  const [tags, setTags]               = useState<string[]>([]);
  const [images, setImages]           = useState<File[]>([]);
  const [previews, setPreviews]       = useState<string[]>([]);
  const [visibility, setVisibility]   = useState<'public' | 'connections-only'>('public');
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleExpand = () => {
    setExpanded(true);
    setTimeout(() => textRef.current?.focus(), 50);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleImages = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files).slice(0, 4 - images.length);
    const newPreviews = selected.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...selected].slice(0, 4));
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, 4));
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const reset = () => {
    setContent(''); setTags([]); setImages([]); setPreviews([]);
    setTagInput(''); setType('text'); setExpanded(false); setError(null);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onPost({ content: content.trim(), type, tags, visibility, images });
      reset();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn(
      'bg-white/[0.02] border border-white/[0.06] rounded-2xl transition-all duration-200',
      expanded ? 'p-5' : 'p-4',
    )}>
      <div className="flex gap-3">
        <Avatar src={authorAvatar} name={authorName} size="md" className="shrink-0 mt-0.5" />

        <div className="flex-1 min-w-0">
          {!expanded ? (
            <button
              onClick={handleExpand}
              className="w-full text-left h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-slate-600 text-sm hover:bg-white/[0.06] hover:text-slate-400 transition-all"
            >
              What are you building?
            </button>
          ) : (
            <div className="space-y-3">
              {/* Type selector */}
              <div className="flex gap-1.5">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      type === opt.value
                        ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]',
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Text area */}
              <textarea
                ref={textRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  type === 'achievement'       ? "Share a win 🏆 What did you achieve?" :
                  type === 'project-showcase'  ? "Tell us about your project 🚀" :
                  "What's on your mind? Share code, thoughts, questions…"
                }
                rows={4}
                maxLength={3000}
                className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none leading-relaxed"
              />

              {/* Character count */}
              <div className="flex justify-end">
                <span className={cn(
                  'text-xs',
                  content.length > 2800 ? 'text-red-400' :
                  content.length > 2500 ? 'text-amber-400' : 'text-slate-700',
                )}>
                  {content.length}/3000
                </span>
              </div>

              {/* Image previews */}
              {previews.length > 0 && (
                <div className={cn(
                  'grid gap-2',
                  previews.length === 1 ? 'grid-cols-1' :
                  previews.length === 2 ? 'grid-cols-2' : 'grid-cols-2',
                )}>
                  {previews.map((src, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-black/30">
                      <Image src={src} alt={`Preview ${i + 1}`} fill className="object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                      #{t}
                      <button onClick={() => removeTag(t)} className="opacity-60 hover:opacity-100">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag input */}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                placeholder="Add tags… (Enter to add)"
                className="w-full h-8 px-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-slate-400 placeholder-slate-700 focus:outline-none focus:border-white/[0.12] transition-all"
              />

              {/* Error */}
              {error && <p className="text-xs text-red-400">{error}</p>}

              {/* Bottom toolbar */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                <div className="flex items-center gap-1">
                  {/* Image upload */}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImages(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={images.length >= 4}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] disabled:opacity-30 transition-all"
                    title="Add images"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                      <circle cx="5.5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M1 11l4-3 3 2.5L12 6l3 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* Visibility */}
                  <button
                    type="button"
                    onClick={() => setVisibility(v => v === 'public' ? 'connections-only' : 'public')}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all',
                      visibility === 'connections-only'
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]',
                    )}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      {visibility === 'public' ? (
                        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                      ) : (
                        <path d="M2 6s1.5-3 4-3 4 3 4 3-1.5 3-4 3-4-3-4-3z" stroke="currentColor" strokeWidth="1.2"/>
                      )}
                    </svg>
                    {visibility === 'public' ? 'Everyone' : 'Connections'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={reset} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim() || submitting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-all"
                  >
                    {submitting ? (
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/>
                        <path d="M12 7a5 5 0 00-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : null}
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
