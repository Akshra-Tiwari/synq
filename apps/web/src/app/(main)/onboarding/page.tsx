'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../lib/store/auth.store';
import { useOwnProfile } from '../../../hooks/useProfile';
import { Avatar } from '../../../components/shared/Avatar';
import { SkillBadge } from '../../../components/shared/Badges';
import { cn } from '../../../lib/utils/cn';

const POPULAR_SKILLS = [
  'JavaScript','TypeScript','Python','Rust','Go','Java','C++',
  'React','Next.js','Vue','Angular','Svelte',
  'Node.js','Express','FastAPI','Django','Spring Boot',
  'PostgreSQL','MongoDB','Redis','MySQL',
  'Docker','Kubernetes','AWS','GCP','Azure',
  'Git','CI/CD','GraphQL','REST APIs','WebSockets',
];

const STEPS = ['Welcome', 'About you', 'Skills', 'Social', 'Done'];

export default function OnboardingPage() {
  const router  = useRouter();
  const { user } = useAuthStore();
  const { updateProfile, uploadAvatar } = useOwnProfile();

  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [bio, setBio]             = useState('');
  const [location, setLocation]   = useState('');
  const [skills, setSkills]       = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [openToWork, setOpenToWork] = useState(false);
  const [availability, setAvailability] = useState<string>('not-available');

  const toggleSkill = (s: string) => {
    setSkills(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : prev.length < 15 ? [...prev, s] : prev,
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim().toLowerCase())) {
      setSkills(prev => [...prev, customSkill.trim().toLowerCase()]);
      setCustomSkill('');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const finish = async () => {
    setLoading(true);
    try {
      if (avatarFile) await uploadAvatar(avatarFile);
      await updateProfile({
        bio, location, skills, githubUrl, linkedinUrl, openToWork,
        availability: availability as 'full-time' | 'part-time' | 'freelance' | 'not-available',
      });
      router.push('/feed');
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-12">
      {/* Progress */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                i < step  ? 'bg-indigo-600 text-white' :
                i === step ? 'bg-indigo-600/30 border-2 border-indigo-500 text-indigo-300' :
                             'bg-white/[0.05] text-slate-600',
              )}>
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-px w-8 transition-all', i < step ? 'bg-indigo-600' : 'bg-white/[0.06]')} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md glass rounded-2xl p-8">
        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/25">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 14.5L10 20.5L24 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">
                Welcome, {user.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Let's set up your developer profile in just a few steps. This takes about 2 minutes.
              </p>
            </div>
            <button onClick={() => setStep(1)}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors">
              Get started
            </button>
            <button onClick={() => router.push('/feed')}
              className="text-sm text-slate-600 hover:text-slate-400 transition-colors">
              Skip for now
            </button>
          </div>
        )}

        {/* Step 1 — About */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">About you</h2>
              <p className="text-sm text-slate-500 mt-1">Let developers know who you are.</p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar src={avatarPreview || user.avatar} name={user.name} size="lg" />
                <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 border-2 border-[#0a0a0f] flex items-center justify-center cursor-pointer transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M7 1.5L8.5 3 3.5 8H2V6.5L7 1.5z" stroke="white" strokeWidth="1" strokeLinejoin="round" />
                  </svg>
                </label>
              </div>
              <div>
                <p className="text-sm text-slate-300 font-medium">{user.name}</p>
                <p className="text-xs text-slate-500">@{user.username}</p>
                <p className="text-xs text-indigo-400 mt-1">Click avatar to upload photo</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  placeholder="Full-stack dev who loves building things that matter. Open source enthusiast."
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="San Francisco, CA" 
                  className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-400 hover:text-slate-200 transition-all">Back</button>
              <button onClick={() => setStep(2)} className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">Continue</button>
            </div>
          </div>
        )}

        {/* Step 2 — Skills */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Your skills</h2>
              <p className="text-sm text-slate-500 mt-1">Select up to 15 skills. Pick what you actually use.</p>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {POPULAR_SKILLS.map(s => (
                <button key={s} type="button" onClick={() => toggleSkill(s.toLowerCase())}>
                  <SkillBadge
                    skill={s}
                    variant={skills.includes(s.toLowerCase()) ? 'accent' : 'default'}
                  />
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input value={customSkill} onChange={e => setCustomSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                placeholder="Add custom skill…"
                className="flex-1 h-9 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
              <button onClick={addCustomSkill}
                className="h-9 px-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-slate-200 transition-all text-sm">Add</button>
            </div>

            <p className="text-xs text-slate-600">{skills.length}/15 selected</p>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-400 hover:text-slate-200 transition-all">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">Continue</button>
            </div>
          </div>
        )}

        {/* Step 3 — Social + work prefs */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Social & availability</h2>
              <p className="text-sm text-slate-500 mt-1">Help people find and connect with you.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">GitHub URL</label>
                <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">LinkedIn URL</label>
                <input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Work availability</label>
                <select value={availability} onChange={e => setAvailability(e.target.value)}
                  className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none">
                  <option value="not-available">Not currently looking</option>
                  <option value="full-time">Open to full-time</option>
                  <option value="part-time">Open to part-time</option>
                  <option value="freelance">Available for freelance</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <input type="checkbox" checked={openToWork} onChange={e => setOpenToWork(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500" />
                <div>
                  <p className="text-sm text-slate-300 font-medium">Show "Open to work" badge</p>
                  <p className="text-xs text-slate-600">Visible on your profile to recruiters</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-400 hover:text-slate-200 transition-all">Back</button>
              <button onClick={() => setStep(4)} className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">Continue</button>
            </div>
          </div>
        )}

        {/* Step 4 — Done */}
        {step === 4 && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="12" stroke="currentColor" className="text-emerald-500" strokeOpacity="0.4" strokeWidth="1.5" />
                <path d="M9 14l4 4 7-7" stroke="currentColor" className="text-emerald-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-100 tracking-tight">You&apos;re all set!</h2>
              <p className="text-sm text-slate-500 mt-2">
                Your profile is ready. Connect with developers, share projects, and build your network.
              </p>
            </div>
            <button onClick={finish} disabled={loading}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2"/><path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Setting up…
                </>
              ) : (
                <>
                  Go to my feed
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
