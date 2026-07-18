'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../../lib/store/auth.store';
import { useOwnProfile } from '../../../hooks/useProfile';
import { changePassword } from '../../../lib/api/users.api';
import { SectionCard } from '../../../components/shared/UI';
import { Avatar } from '../../../components/shared/Avatar';
import { AvailabilityBadge } from '../../../components/shared/Badges';
import { getApiErrorMessage } from '../../../lib/utils/errors';
import { cn } from '../../../lib/utils/cn';

const profileSchema = z.object({
  name:               z.string().min(2).max(60),
  bio:                z.string().max(500).optional(),
  location:           z.string().max(100).optional(),
  website:            z.string().url().optional().or(z.literal('')),
  pronouns:           z.string().max(30).optional(),
  githubUrl:          z.string().url().optional().or(z.literal('')),
  linkedinUrl:        z.string().url().optional().or(z.literal('')),
  twitterUrl:         z.string().url().optional().or(z.literal('')),
  portfolioUrl:       z.string().url().optional().or(z.literal('')),
  openToWork:         z.boolean().optional(),
  availability:       z.enum(['full-time', 'part-time', 'freelance', 'not-available']).optional(),
  yearsOfExperience:  z.coerce.number().min(0).max(50).optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
type PasswordForm = z.infer<typeof passwordSchema>;

const inputCls = "w-full h-10 bg-[rgba(1,121,111,0.06)] border border-[rgba(1,121,111,0.15)] rounded-xl px-3.5 text-sm text-[#C8DCC9] placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all";
const labelCls = "block text-xs font-medium text-[#7A9A7E] mb-1.5";

type Tab = 'profile' | 'account' | 'appearance';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { updateProfile, uploadAvatar } = useOwnProfile();
  const [tab, setTab]           = useState<Tab>('profile');
  const [saveMsg, setSaveMsg]   = useState<string | null>(null);
  const [saveErr, setSaveErr]   = useState<string | null>(null);
  const [pwMsg, setPwMsg]       = useState<string | null>(null);
  const [pwErr, setPwErr]       = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name:              user?.name ?? '',
      bio:               user?.bio ?? '',
      location:          user?.location ?? '',
      website:           user?.website ?? '',
      pronouns:          user?.pronouns ?? '',
      githubUrl:         user?.githubUrl ?? '',
      linkedinUrl:       user?.linkedinUrl ?? '',
      twitterUrl:        user?.twitterUrl ?? '',
      portfolioUrl:      user?.portfolioUrl ?? '',
      openToWork:        user?.openToWork ?? false,
      availability:      user?.availability ?? 'not-available',
      yearsOfExperience: user?.yearsOfExperience ?? 0,
    },
  });

  const pwForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onProfileSave = async (data: ProfileForm) => {
    setSaveMsg(null); setSaveErr(null);
    try {
      await updateProfile(data);
      setSaveMsg('Profile saved successfully.');
    } catch (e) {
      setSaveErr(getApiErrorMessage(e));
    }
  };

  const onPasswordSave = async (data: PasswordForm) => {
    setPwMsg(null); setPwErr(null);
    try {
      await changePassword(data);
      setPwMsg('Password changed. You may need to log in again on other devices.');
      pwForm.reset();
    } catch (e) {
      setPwErr(getApiErrorMessage(e));
    }
  };

  if (!user) return null;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'profile',    label: 'Profile' },
    { id: 'account',    label: 'Account & Security' },
    { id: 'appearance', label: 'Appearance' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#E2EBE4] tracking-tight">Settings</h1>
        <p className="text-sm text-[#5A7A5E] mt-1">Manage your profile and account preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[rgba(23,37,24,0.8)] border border-[rgba(1,121,111,0.12)] rounded-xl mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
              tab === t.id
                ? 'bg-white/[0.08] text-[#C8DCC9] shadow-sm'
                : 'text-[#5A7A5E] hover:text-[#9EB5A0]',
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <form onSubmit={handleSubmit(onProfileSave)} className="space-y-5">
          {/* Avatar quick change */}
          <SectionCard title="Photo">
            <div className="flex items-center gap-5">
              <Avatar src={user.avatar} name={user.name} size="xl" />
              <div>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) uploadAvatar(f).catch(console.error);
                      e.target.value = '';
                    }} />
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(1,121,111,0.08)] border border-[rgba(1,121,111,0.15)] text-sm text-[#9EB5A0] hover:bg-white/[0.09] transition-all cursor-pointer">
                    Upload new photo
                  </span>
                </label>
                <p className="text-xs text-[#3A6A3E] mt-2">JPG, PNG or WebP. Max 5 MB. Auto-cropped to 400×400.</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Basic info">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full name</label>
                  <input {...register('name')} className={inputCls} />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>Pronouns</label>
                  <input {...register('pronouns')} placeholder="they/them" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Bio</label>
                <textarea {...register('bio')} rows={3} placeholder="Tell the world about yourself…"
                  className={cn(inputCls, 'h-auto py-2.5 resize-none')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Location</label>
                  <input {...register('location')} placeholder="San Francisco, CA" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Website</label>
                  <input {...register('website')} placeholder="https://yoursite.com" className={inputCls} />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Developer info">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Years of experience</label>
                  <input {...register('yearsOfExperience')} type="number" min={0} max={50} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Availability</label>
                  <select {...register('availability')}
                    className={cn(inputCls, 'appearance-none')}>
                    <option value="not-available">Not available</option>
                    <option value="full-time">Open to full-time</option>
                    <option value="part-time">Open to part-time</option>
                    <option value="freelance">Available for freelance</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input {...register('openToWork')} type="checkbox"
                  className="w-4 h-4 rounded accent-indigo-500" />
                <div>
                  <p className="text-sm text-[#9EB5A0] font-medium">Open to work</p>
                  <p className="text-xs text-[#3A6A3E]">Shows a badge on your profile visible to recruiters</p>
                </div>
              </label>
            </div>
          </SectionCard>

          <SectionCard title="Social links">
            <div className="space-y-3">
              {[
                { key: 'githubUrl',    label: 'GitHub',    placeholder: 'https://github.com/username' },
                { key: 'linkedinUrl',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/username' },
                { key: 'twitterUrl',   label: 'Twitter/X', placeholder: 'https://twitter.com/username' },
                { key: 'portfolioUrl', label: 'Portfolio', placeholder: 'https://yourportfolio.com' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input {...register(key as keyof ProfileForm)} placeholder={placeholder} className={inputCls} />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Feedback */}
          {saveMsg && <p className="text-sm text-emerald-400 px-1">✓ {saveMsg}</p>}
          {saveErr && <p className="text-sm text-red-400 px-1">{saveErr}</p>}

          <button type="submit" disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-[#01796F] hover:bg-[#01796F] disabled:opacity-60 text-white font-medium text-sm transition-colors">
            {isSubmitting ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      )}

      {/* Account & Security tab */}
      {tab === 'account' && (
        <div className="space-y-5">
          <SectionCard title="Change password">
            <form onSubmit={pwForm.handleSubmit(onPasswordSave)} className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Current password', placeholder: '••••••••' },
                { key: 'newPassword',     label: 'New password',     placeholder: 'Min. 8 chars, 1 uppercase, 1 number' },
                { key: 'confirmPassword', label: 'Confirm new password', placeholder: '••••••••' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input {...pwForm.register(key as keyof PasswordForm)} type="password"
                    placeholder={placeholder} className={inputCls} />
                  {pwForm.formState.errors[key as keyof PasswordForm] && (
                    <p className="text-xs text-red-400 mt-1">
                      {pwForm.formState.errors[key as keyof PasswordForm]?.message}
                    </p>
                  )}
                </div>
              ))}
              {pwMsg && <p className="text-sm text-emerald-400">✓ {pwMsg}</p>}
              {pwErr && <p className="text-sm text-red-400">{pwErr}</p>}
              <button type="submit" disabled={pwForm.formState.isSubmitting}
                className="h-10 px-6 rounded-xl bg-[rgba(1,121,111,0.08)] border border-[rgba(1,121,111,0.15)] text-sm text-[#9EB5A0] hover:bg-white/[0.09] disabled:opacity-60 transition-all">
                {pwForm.formState.isSubmitting ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Account info">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[#9EB5A0]">Email</p>
                  <p className="text-xs text-[#3A6A3E]">{user.email}</p>
                </div>
                {user.isVerified ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" /><path d="M4 6l1.5 1.5L8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                    Verified
                  </span>
                ) : (
                  <span className="text-xs text-amber-400">Unverified</span>
                )}
              </div>
              <div className="h-px bg-[rgba(1,121,111,0.08)]" />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[#9EB5A0]">Username</p>
                  <p className="text-xs text-[#3A6A3E]">@{user.username}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Danger zone">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-400">Delete account</p>
                <p className="text-xs text-[#3A6A3E]">Permanently remove your account and all data. Irreversible.</p>
              </div>
              <button className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all">
                Delete
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Appearance tab */}
      {tab === 'appearance' && (
        <SectionCard title="Theme">
          <div className="space-y-3">
            {['Dark (default)', 'Darker', 'System'].map(t => (
              <label key={t} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[rgba(23,37,24,0.8)] transition-colors">
                <input type="radio" name="theme" defaultChecked={t === 'Dark (default)'}
                  className="accent-indigo-500" />
                <span className="text-sm text-[#9EB5A0]">{t}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-[#3A6A3E] mt-3">Light mode and additional themes coming soon.</p>
        </SectionCard>
      )}
    </div>
  );
}
