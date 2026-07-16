'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../../lib/utils/cn';
import { getApiErrorMessage } from '../../lib/utils/errors';
import type { Project, ProjectStatus } from '../../lib/api/projects.api';

const schema = z.object({
  title:           z.string().min(1, 'Title is required').max(100),
  description:     z.string().min(1, 'Short description is required').max(300),
  longDescription: z.string().max(5000).optional(),
  githubUrl:       z.string().url('Must be a valid URL').optional().or(z.literal('')),
  liveUrl:         z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status:          z.enum(['in-progress', 'completed', 'archived']),
});
type FormValues = z.infer<typeof schema>;

interface ProjectModalProps {
  open:      boolean;
  onClose:   () => void;
  project?:  Project;           // if provided → edit mode
  onSave:    (payload: {
    title: string; description: string; longDescription?: string;
    techStack: string[]; githubUrl?: string; liveUrl?: string;
    status: ProjectStatus; screenshots?: File[];
  }) => Promise<void>;
}

const inputCls = 'w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all';
const labelCls = 'block text-xs font-medium text-slate-400 mb-1.5';

export function ProjectModal({ open, onClose, project, onSave }: ProjectModalProps) {
  const isEdit = !!project;

  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>(project?.techStack ?? []);
  const [newImages,  setNewImages]  = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:           project?.title           ?? '',
      description:     project?.description     ?? '',
      longDescription: project?.longDescription ?? '',
      githubUrl:       project?.githubUrl        ?? '',
      liveUrl:         project?.liveUrl          ?? '',
      status:          project?.status           ?? 'in-progress',
    },
  });

  // Reset state when modal opens/closes or project changes
  useEffect(() => {
    if (open) {
      setTechStack(project?.techStack ?? []);
      setNewImages([]);
      setNewPreviews([]);
      setError(null);
      reset({
        title:           project?.title           ?? '',
        description:     project?.description     ?? '',
        longDescription: project?.longDescription ?? '',
        githubUrl:       project?.githubUrl        ?? '',
        liveUrl:         project?.liveUrl          ?? '',
        status:          project?.status           ?? 'in-progress',
      });
    }
  }, [open, project, reset]);

  const addTech = () => {
    const tags = techInput.split(',').map((t) => t.trim()).filter(Boolean);
    const unique = [...new Set([...techStack, ...tags])].slice(0, 20);
    setTechStack(unique);
    setTechInput('');
  };

  const removeTech = (t: string) => setTechStack((prev) => prev.filter((x) => x !== t));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const existing = isEdit ? (project?.screenshots.length ?? 0) : 0;
    const slots = Math.max(0, 6 - existing - newImages.length);
    const selected = Array.from(files).slice(0, slots);
    setNewImages((p) => [...p, ...selected]);
    setNewPreviews((p) => [...p, ...selected.map((f) => URL.createObjectURL(f))]);
  };

  const removeNewImage = (idx: number) => {
    setNewImages((p)    => p.filter((_, i) => i !== idx));
    setNewPreviews((p)  => p.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...data,
        techStack,
        screenshots: newImages.length > 0 ? newImages : undefined,
      });
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const existingScreenshots = project?.screenshots ?? [];
  const totalScreenshots    = existingScreenshots.length + newImages.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#12121a] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <h2 className="text-sm font-semibold text-slate-200">
            {isEdit ? 'Edit project' : 'Add project'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeOpacity="0.5" />
                <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="7" cy="10" r="0.6" fill="currentColor" />
              </svg>
              {error}
            </div>
          )}

          {/* Screenshots */}
          <div>
            <label className={labelCls}>Screenshots <span className="text-slate-600">({totalScreenshots}/6)</span></label>

            {/* Existing screenshots (edit mode) */}
            {existingScreenshots.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {existingScreenshots.map((src, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-black/30">
                    <Image src={src} alt={`Screenshot ${i + 1}`} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors group flex items-center justify-center">
                      <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">Existing</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New image previews */}
            {newPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {newPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-black/30">
                    <Image src={src} alt={`New ${i + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500/80 transition-colors"
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalScreenshots < 6 && (
              <>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => handleFiles(e.target.files)} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-white/[0.08] rounded-xl text-slate-600 hover:text-slate-400 hover:border-white/[0.15] transition-all flex flex-col items-center justify-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs">Add screenshots</span>
                </button>
              </>
            )}
          </div>

          {/* Title + Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Title *</label>
              <input {...register('title')} placeholder="My Awesome Project" className={inputCls} />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select {...register('status')} className={cn(inputCls, 'appearance-none')}>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Short description */}
          <div>
            <label className={labelCls}>Short description * <span className="text-slate-600">(shown in cards, max 300)</span></label>
            <input {...register('description')} placeholder="A brief, punchy description of your project." className={inputCls} />
            {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
          </div>

          {/* Long description */}
          <div>
            <label className={labelCls}>Full description <span className="text-slate-600">(Markdown supported)</span></label>
            <textarea
              {...register('longDescription')}
              rows={5}
              placeholder="Tell the full story — what problem it solves, how you built it, challenges you overcame…"
              className={cn(inputCls, 'h-auto py-2.5 resize-none')}
            />
          </div>

          {/* Tech stack */}
          <div>
            <label className={labelCls}>Tech stack</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {techStack.map((t) => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300 font-mono">
                  {t}
                  <button type="button" onClick={() => removeTech(t)}
                    className="opacity-50 hover:opacity-100 transition-opacity ml-0.5">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTech(); } }}
                placeholder="React, TypeScript, PostgreSQL… (Enter to add)"
                className={cn(inputCls, 'flex-1 font-mono text-xs')}
              />
              <button type="button" onClick={addTech}
                className="h-10 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-slate-400 hover:text-slate-200 transition-all">
                Add
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>GitHub URL</label>
              <input {...register('githubUrl')} placeholder="https://github.com/…" className={inputCls} />
              {errors.githubUrl && <p className="text-xs text-red-400 mt-1">{errors.githubUrl.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Live demo URL</label>
              <input {...register('liveUrl')} placeholder="https://myproject.app" className={inputCls} />
              {errors.liveUrl && <p className="text-xs text-red-400 mt-1">{errors.liveUrl.message}</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06] shrink-0">
          <button type="button" onClick={onClose}
            className="h-10 px-5 rounded-xl text-sm text-slate-400 hover:text-slate-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
                <path d="M12 7a5 5 0 00-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </div>
    </div>
  );
}
