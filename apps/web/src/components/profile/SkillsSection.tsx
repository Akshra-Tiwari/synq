'use client';

import { useState, useRef } from 'react';
import { SectionCard } from '../shared/UI';
import { SkillBadge, TechBadge } from '../shared/Badges';
import type { User } from '../../lib/api/auth.api';

interface SkillsSectionProps {
  user: User;
  isOwn: boolean;
  onSave?: (skills: string[], techStack: string[]) => Promise<void>;
}

export function SkillsSection({ user, isOwn, onSave }: SkillsSectionProps) {
  const [editing, setEditing]       = useState(false);
  const [skills, setSkills]         = useState<string[]>(user.skills);
  const [techStack, setTechStack]   = useState<string[]>(user.techStack);
  const [skillInput, setSkillInput] = useState('');
  const [techInput, setTechInput]   = useState('');
  const [saving, setSaving]         = useState(false);
  const skillRef = useRef<HTMLInputElement>(null);
  const techRef  = useRef<HTMLInputElement>(null);

  const addTag = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    setInput: (v: string) => void,
  ) => {
    const tags = value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    const unique = [...new Set([...list, ...tags])].slice(0, 30);
    setList(unique);
    setInput('');
  };

  const removeSkill = (s: string) => setSkills(skills.filter(x => x !== s));
  const removeTech  = (t: string) => setTechStack(techStack.filter(x => x !== t));

  const handleSave = async () => {
    setSaving(true);
    try { await onSave?.(skills, techStack); setEditing(false); }
    finally { setSaving(false); }
  };

  const handleCancel = () => {
    setSkills(user.skills);
    setTechStack(user.techStack);
    setEditing(false);
  };

  return (
    <SectionCard
      title="Skills & Tech Stack"
      action={isOwn ? (
        editing ? (
          <div className="flex items-center gap-2">
            <button onClick={handleCancel} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-60 transition-colors">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
        )
      ) : undefined}
    >
      <div className="space-y-5">
        {/* Skills */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2.5">Skills</p>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <SkillBadge key={s} skill={s} variant="accent"
                removable={editing} onRemove={() => removeSkill(s)} />
            ))}
            {editing && (
              <input
                ref={skillRef}
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(skillInput, skills, setSkills, setSkillInput);
                  }
                }}
                placeholder="Add skill…"
                className="h-7 px-3 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-xs text-indigo-300 placeholder-indigo-700 focus:outline-none focus:border-indigo-500/60 min-w-[100px]"
              />
            )}
            {skills.length === 0 && !editing && (
              <span className="text-xs text-slate-600">No skills listed yet.</span>
            )}
          </div>
        </div>

        {/* Tech stack */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2.5">Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {techStack.map(t => (
              editing ? (
                <SkillBadge key={t} skill={t} removable onRemove={() => removeTech(t)} />
              ) : (
                <TechBadge key={t} tech={t} />
              )
            ))}
            {editing && (
              <input
                ref={techRef}
                value={techInput}
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(techInput, techStack, setTechStack, setTechInput);
                  }
                }}
                placeholder="Add technology…"
                className="h-7 px-3 bg-white/[0.04] border border-white/[0.10] rounded-full text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-white/[0.20] min-w-[120px] font-mono"
              />
            )}
            {techStack.length === 0 && !editing && (
              <span className="text-xs text-slate-600">No tech stack listed.</span>
            )}
          </div>
        </div>

        {editing && (
          <p className="text-xs text-slate-600">Press <kbd className="px-1 py-0.5 rounded bg-white/[0.06] font-mono">Enter</kbd> or <kbd className="px-1 py-0.5 rounded bg-white/[0.06] font-mono">,</kbd> to add each item.</p>
        )}
      </div>
    </SectionCard>
  );
}
