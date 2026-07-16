'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { Avatar } from '../shared/Avatar';
import { AvailabilityBadge, StatChip } from '../shared/Badges';
import { ConnectionButton } from '../connections/ConnectionButton';
import { compactNumber } from '../../lib/utils/format';
import { cn } from '../../lib/utils/cn';
import type { User } from '../../lib/api/auth.api';

interface ProfileHeaderProps {
  user: User;
  isOwn: boolean;
  onAvatarChange?: (file: File) => void;
  onBannerChange?: (file: File) => void;
}

export function ProfileHeader({
  user,
  isOwn,
  onAvatarChange,
  onBannerChange,
}: ProfileHeaderProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, cb?: (f: File) => void) => {
    const file = e.target.files?.[0];
    if (file && cb) cb(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Cover banner */}
      <div className="relative h-44 bg-gradient-to-br from-indigo-900/40 via-violet-900/30 to-slate-900/60">
        {user.coverBanner && (
          <Image src={user.coverBanner} alt="Cover" fill className="object-cover" />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {isOwn && (
          <>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleFile(e, onBannerChange)} />
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-xs text-slate-300 hover:bg-black/60 transition-all border border-white/10"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
              Edit cover
            </button>
          </>
        )}
      </div>

      <div className="px-6 pb-6">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            <Avatar src={user.avatar} name={user.name} size="2xl"
              className="ring-4 ring-[#0a0a0f]" />

            {/* Profile completion ring */}
            {isOwn && (
              <svg className="absolute inset-0 -rotate-90 pointer-events-none" width="112" height="112" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle
                  cx="56" cy="56" r="52" fill="none"
                  stroke="#6366f1" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - (user.profileCompletion ?? 0) / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
            )}

            {isOwn && (
              <>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleFile(e, onAvatarChange)} />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 border-2 border-[#0a0a0f] flex items-center justify-center transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5z" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isOwn ? (
              <Link href="/settings"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-slate-300 hover:bg-white/[0.09] transition-all">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9.5 1.5L12.5 4.5L5 12H2V9L9.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
                Edit profile
              </Link>
            ) : (
              <>
                <ConnectionButton
                  targetUserId={user._id?.toString() ?? ''}
                  targetUsername={user.username}
                />
                <a href={`mailto:${user.email}`}
                  className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.09] transition-all">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Name + username */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold text-slate-100">{user.name}</h1>
            {user.isVerified && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" title="Verified">
                <circle cx="8" cy="8" r="7" fill="#6366f1" />
                <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <p className="text-sm text-slate-500">@{user.username}</p>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-slate-400 leading-relaxed mb-4 max-w-xl">{user.bio}</p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {user.location && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1a3.5 3.5 0 010 7C3.5 8 1 5.3 1 5.3S3.5 1 6 1z" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="6" cy="4.5" r="1" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {user.location}
            </span>
          )}
          {user.website && (
            <a href={user.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 1C4.5 3 4.5 9 6 11M6 1C7.5 3 7.5 9 6 11M1 6h10" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {user.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {user.githubUrl && (
            <a href={user.githubUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                <path d="M6.5 0a6.5 6.5 0 00-2.054 12.668c.325.06.443-.14.443-.313v-1.097C3.052 11.61 2.68 10.37 2.68 10.37c-.296-.751-.722-.95-.722-.95-.59-.403.045-.395.045-.395.652.046 1.005.67 1.005.67.585 1.002 1.535.712 1.909.544.06-.424.228-.712.416-.876-1.457-.166-2.988-.729-2.988-3.242 0-.716.256-1.3.674-1.759-.067-.165-.293-.832.065-1.734 0 0 .549-.176 1.8.671a6.263 6.263 0 013.27 0c1.25-.847 1.797-.67 1.797-.67.36.902.134 1.569.067 1.734.42.459.673 1.043.673 1.76 0 2.52-1.534 3.074-2.995 3.236.236.203.446.602.446 1.213v1.798c0 .175.117.378.447.314A6.5 6.5 0 006.5 0z" />
              </svg>
              GitHub
            </a>
          )}
          {user.linkedinUrl && (
            <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M10.5 1h-9A.5.5 0 001 1.5v9a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-9A.5.5 0 0010.5 1zM4 9.5H2.5V5H4v4.5zM3.25 4.25a.75.75 0 110-1.5.75.75 0 010 1.5zM9.5 9.5H8V7.25C8 6.56 7.44 6 6.75 6S5.5 6.56 5.5 7.25V9.5H4V5h1.5v.62C5.92 5.23 6.44 5 7 5c1.38 0 2.5 1.12 2.5 2.5V9.5z" />
              </svg>
              LinkedIn
            </a>
          )}
        </div>

        {/* Availability */}
        {user.availability && user.availability !== 'not-available' && (
          <div className="mb-4">
            <AvailabilityBadge availability={user.availability} />
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-6 pt-4 border-t border-white/[0.05]">
          <StatChip value={compactNumber(user.stats.connectionsCount)} label="Connections" />
          <div className="w-px h-8 bg-white/[0.06]" />
          <StatChip value={compactNumber(user.stats.postsCount)}       label="Posts" />
          <div className="w-px h-8 bg-white/[0.06]" />
          <StatChip value={compactNumber(user.stats.projectsCount)}    label="Projects" />
          <div className="w-px h-8 bg-white/[0.06]" />
          <StatChip value={compactNumber(user.stats.profileViews)}     label="Profile views" />
          {isOwn && user.profileCompletion !== undefined && (
            <>
              <div className="w-px h-8 bg-white/[0.06]" />
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold text-indigo-400">{user.profileCompletion}%</span>
                <span className="text-xs text-slate-500">Complete</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
