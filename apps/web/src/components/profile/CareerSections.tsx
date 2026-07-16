'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SectionCard, IconButton, EmptyState } from '../shared/UI';
import { formatMonthYearRange, formatYearRange, MONTHS } from '../../lib/utils/format';
import { cn } from '../../lib/utils/cn';
import type { Experience, Education } from '../../lib/api/users.api';

// ─── Small modal wrapper ──────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#13131a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all";
const selectCls = "w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none";

// ─── Experience section ───────────────────────────────────────────────────────
const expSchema = z.object({
  company:     z.string().min(1, 'Required').max(100),
  role:        z.string().min(1, 'Required').max(100),
  location:    z.string().max(100).optional(),
  startMonth:  z.coerce.number().min(1).max(12),
  startYear:   z.coerce.number().min(1950).max(new Date().getFullYear()),
  endMonth:    z.coerce.number().min(1).max(12).optional(),
  endYear:     z.coerce.number().min(1950).max(2100).optional(),
  current:     z.boolean().default(false),
  description: z.string().max(1000).optional(),
  techUsed:    z.string().optional(), // comma-separated in form
});

type ExpForm = z.infer<typeof expSchema>;

interface ExperienceSectionProps {
  experience: Experience[];
  isOwn: boolean;
  onAdd?:    (data: Omit<Experience, '_id'>) => Promise<void>;
  onUpdate?: (id: string, data: Omit<Experience, '_id'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function ExperienceSection({ experience, isOwn, onAdd, onUpdate, onDelete }: ExperienceSectionProps) {
  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState<Experience | null>(null);
  const [deleting, setDeleting]         = useState<string | null>(null);
  const [submitting, setSubmitting]     = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ExpForm>({
    resolver: zodResolver(expSchema),
  });

  const isCurrent = watch('current');

  const openAdd = () => { setEditing(null); reset({}); setModalOpen(true); };
  const openEdit = (exp: Experience) => {
    setEditing(exp);
    reset({
      ...exp,
      techUsed: exp.techUsed.join(', '),
    } as unknown as ExpForm);
    setModalOpen(true);
  };

  const onSubmit = async (data: ExpForm) => {
    setSubmitting(true);
    try {
      const payload: Omit<Experience, '_id'> = {
        ...data,
        techUsed: data.techUsed ? data.techUsed.split(',').map(s => s.trim()).filter(Boolean) : [],
        startMonth: Number(data.startMonth),
        startYear:  Number(data.startYear),
        endMonth:   data.current ? undefined : Number(data.endMonth) || undefined,
        endYear:    data.current ? undefined : Number(data.endYear) || undefined,
      };
      if (editing) await onUpdate?.(editing._id, payload);
      else         await onAdd?.(payload);
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try { await onDelete?.(id); }
    finally { setDeleting(null); }
  };

  return (
    <>
      <SectionCard
        title="Experience"
        action={isOwn ? (
          <button onClick={openAdd}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add
          </button>
        ) : undefined}
      >
        {experience.length === 0 ? (
          <EmptyState
            title="No experience yet"
            description={isOwn ? 'Add your work history to strengthen your profile.' : undefined}
          />
        ) : (
          <div className="space-y-5">
            {experience.map((exp, i) => (
              <div key={exp._id} className={cn('relative pl-4 border-l-2 border-white/[0.06]', i < experience.length - 1 && 'pb-5')}>
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-indigo-500" />
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200">{exp.role}</p>
                    <p className="text-xs text-indigo-400 font-medium">{exp.company}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {formatMonthYearRange(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.current)}
                      {exp.location && ` · ${exp.location}`}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{exp.description}</p>
                    )}
                    {exp.techUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {exp.techUsed.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-slate-400 font-mono">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {isOwn && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <IconButton label="Edit" onClick={() => openEdit(exp)}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9.5 1.5L11.5 3.5L5 10H3V8L9.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                      </IconButton>
                      <IconButton label="Delete" variant="danger" onClick={() => handleDelete(exp._id)}>
                        {deleting === exp._id
                          ? <svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/><path d="M11.5 6.5a5 5 0 00-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M4 3.5V2.5h5v1M5 6v3.5M8 6v3.5M3 3.5l.5 7h6l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        }
                      </IconButton>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit experience' : 'Add experience'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company *">
              <input {...register('company')} placeholder="Acme Corp" className={inputCls} />
              {errors.company && <p className="text-xs text-red-400">{errors.company.message}</p>}
            </Field>
            <Field label="Role *">
              <input {...register('role')} placeholder="Software Engineer" className={inputCls} />
              {errors.role && <p className="text-xs text-red-400">{errors.role.message}</p>}
            </Field>
          </div>
          <Field label="Location">
            <input {...register('location')} placeholder="Remote / San Francisco" className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start month *">
              <select {...register('startMonth')} className={selectCls}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </Field>
            <Field label="Start year *">
              <input {...register('startYear')} type="number" placeholder="2022" className={inputCls} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input {...register('current')} type="checkbox" className="rounded" />
            Currently working here
          </label>
          {!isCurrent && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="End month">
                <select {...register('endMonth')} className={selectCls}>
                  <option value="">—</option>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </Field>
              <Field label="End year">
                <input {...register('endYear')} type="number" placeholder="2024" className={inputCls} />
              </Field>
            </div>
          )}
          <Field label="Description">
            <textarea {...register('description')} rows={3} placeholder="What you built and learned…"
              className={cn(inputCls, 'h-auto py-2.5 resize-none')} />
          </Field>
          <Field label="Tech used (comma-separated)">
            <input {...register('techUsed')} placeholder="React, TypeScript, PostgreSQL" className={inputCls} />
          </Field>
          <button type="submit" disabled={submitting}
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-medium transition-colors">
            {submitting ? 'Saving…' : editing ? 'Save changes' : 'Add experience'}
          </button>
        </form>
      </Modal>
    </>
  );
}

// ─── Education section ────────────────────────────────────────────────────────
const eduSchema = z.object({
  school:      z.string().min(1, 'Required').max(100),
  degree:      z.string().min(1, 'Required').max(80),
  field:       z.string().min(1, 'Required').max(80),
  startYear:   z.coerce.number().min(1950).max(new Date().getFullYear()),
  endYear:     z.coerce.number().min(1950).max(2100).optional(),
  current:     z.boolean().default(false),
  description: z.string().max(500).optional(),
});
type EduForm = z.infer<typeof eduSchema>;

interface EducationSectionProps {
  education: Education[];
  isOwn: boolean;
  onAdd?:    (data: Omit<Education, '_id'>) => Promise<void>;
  onUpdate?: (id: string, data: Omit<Education, '_id'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function EducationSection({ education, isOwn, onAdd, onUpdate, onDelete }: EducationSectionProps) {
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<Education | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<EduForm>({ resolver: zodResolver(eduSchema) });
  const isCurrent = watch('current');

  const openAdd  = () => { setEditing(null); reset({}); setModalOpen(true); };
  const openEdit = (edu: Education) => { setEditing(edu); reset(edu as EduForm); setModalOpen(true); };

  const onSubmit = async (data: EduForm) => {
    setSubmitting(true);
    try {
      const payload: Omit<Education, '_id'> = {
        ...data,
        startYear: Number(data.startYear),
        endYear:   data.current ? undefined : Number(data.endYear) || undefined,
      };
      if (editing) await onUpdate?.(editing._id, payload);
      else         await onAdd?.(payload);
      setModalOpen(false);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try { await onDelete?.(id); }
    finally { setDeleting(null); }
  };

  return (
    <>
      <SectionCard
        title="Education"
        action={isOwn ? (
          <button onClick={openAdd} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            Add
          </button>
        ) : undefined}
      >
        {education.length === 0 ? (
          <EmptyState title="No education listed" description={isOwn ? 'Add your academic background.' : undefined} />
        ) : (
          <div className="space-y-5">
            {education.map((edu, i) => (
              <div key={edu._id} className={cn('relative pl-4 border-l-2 border-white/[0.06]', i < education.length - 1 && 'pb-5')}>
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-violet-500" />
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-200">{edu.school}</p>
                    <p className="text-xs text-violet-400">{edu.degree} · {edu.field}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{formatYearRange(edu.startYear, edu.endYear, edu.current)}</p>
                    {edu.description && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{edu.description}</p>}
                  </div>
                  {isOwn && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <IconButton label="Edit" onClick={() => openEdit(edu)}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9.5 1.5L11.5 3.5L5 10H3V8L9.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                      </IconButton>
                      <IconButton label="Delete" variant="danger" onClick={() => handleDelete(edu._id)}>
                        {deleting === edu._id
                          ? <svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/><path d="M11.5 6.5a5 5 0 00-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M4 3.5V2.5h5v1M5 6v3.5M8 6v3.5M3 3.5l.5 7h6l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        }
                      </IconButton>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit education' : 'Add education'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="School *">
            <input {...register('school')} placeholder="MIT" className={inputCls} />
            {errors.school && <p className="text-xs text-red-400">{errors.school.message}</p>}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Degree *">
              <input {...register('degree')} placeholder="Bachelor's" className={inputCls} />
            </Field>
            <Field label="Field *">
              <input {...register('field')} placeholder="Computer Science" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start year *">
              <input {...register('startYear')} type="number" placeholder="2019" className={inputCls} />
            </Field>
            {!isCurrent && (
              <Field label="End year">
                <input {...register('endYear')} type="number" placeholder="2023" className={inputCls} />
              </Field>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input {...register('current')} type="checkbox" className="rounded" />
            Currently studying here
          </label>
          <Field label="Description">
            <textarea {...register('description')} rows={2} placeholder="Relevant coursework, honours…"
              className={cn(inputCls, 'h-auto py-2.5 resize-none')} />
          </Field>
          <button type="submit" disabled={submitting}
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-medium transition-colors">
            {submitting ? 'Saving…' : editing ? 'Save changes' : 'Add education'}
          </button>
        </form>
      </Modal>
    </>
  );
}
