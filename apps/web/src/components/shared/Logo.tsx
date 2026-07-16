'use client';

import Link from 'next/link';
import { cn } from '../../lib/utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  href?: string;
  className?: string;
}

export function SynqLogo({ size = 'md', showText = true, href = '/', className }: LogoProps) {
  const dims = size === 'sm' ? 28 : size === 'lg' ? 44 : 34;
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-[15px]';

  const logo = (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Animated SVG logo */}
      <div
        className="relative shrink-0"
        style={{ width: dims, height: dims }}
      >
        <svg
          width={dims}
          height={dims}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring — teal */}
          <circle
            cx="20" cy="20" r="18"
            stroke="url(#synq-grad-1)"
            strokeWidth="1.5"
            strokeOpacity="0.6"
            className="logo-pulse"
          />
          {/* Inner nodes */}
          <circle cx="20" cy="10" r="3" fill="url(#synq-grad-1)" opacity="0.9" />
          <circle cx="30" cy="26" r="3" fill="url(#synq-grad-2)" opacity="0.8" />
          <circle cx="10" cy="26" r="3" fill="url(#synq-grad-2)" opacity="0.8" />
          {/* Connecting lines */}
          <line x1="20" y1="10" x2="30" y2="26" stroke="url(#synq-grad-1)" strokeWidth="1.2" strokeOpacity="0.5" />
          <line x1="20" y1="10" x2="10" y2="26" stroke="url(#synq-grad-1)" strokeWidth="1.2" strokeOpacity="0.5" />
          <line x1="10" y1="26" x2="30" y2="26" stroke="url(#synq-grad-2)" strokeWidth="1.2" strokeOpacity="0.4" />
          {/* Center pulse dot */}
          <circle cx="20" cy="20" r="2.5" fill="url(#synq-grad-1)" />
          {/* Center-to-node lines */}
          <line x1="20" y1="20" x2="20" y2="10" stroke="url(#synq-grad-1)" strokeWidth="0.8" strokeOpacity="0.35" />
          <line x1="20" y1="20" x2="30" y2="26" stroke="url(#synq-grad-1)" strokeWidth="0.8" strokeOpacity="0.35" />
          <line x1="20" y1="20" x2="10" y2="26" stroke="url(#synq-grad-1)" strokeWidth="0.8" strokeOpacity="0.35" />

          <defs>
            <linearGradient id="synq-grad-1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#01796F" />
              <stop offset="100%" stopColor="#00b4a6" />
            </linearGradient>
            <linearGradient id="synq-grad-2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6D8196" />
              <stop offset="100%" stopColor="#B0C4DE" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <span className={cn('font-bold tracking-tight text-[#DCE4EC]', textSize)}>
          Synq
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logo}</Link>;
  }
  return logo;
}
