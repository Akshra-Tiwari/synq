'use client';

import React from 'react';
import { cn } from '../../lib/utils/cn';

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[400px] animate-fade-up">
      <div className="rounded-2xl p-8"
        style={{
          background:    'rgba(14,26,15,0.95)',
          border:        '1px solid rgba(1,121,111,0.2)',
          backdropFilter:'blur(24px)',
          boxShadow:     '0 0 40px rgba(1,121,111,0.12), 0 20px 60px rgba(0,0,0,0.5)',
        }}>
        {children}
      </div>
    </div>
  );
}

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label:         string;
  error?:        string;
  icon?:         React.ReactNode;
  rightElement?: React.ReactNode;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, icon, rightElement, className, ...props }, ref) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" style={{ color:'#7A9A7E' }}>{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:'#3A6A3E' }}>
            {icon}
          </div>
        )}
        <input ref={ref}
          className={cn(
            'w-full h-11 rounded-xl text-sm transition-all input',
            icon ? 'pl-10 pr-4' : 'px-4',
            rightElement ? 'pr-11' : '',
            error ? 'border-red-500/40' : '',
            className,
          )}
          {...props}/>
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
            <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeOpacity="0.5"/>
            <path d="M6 3.5V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="6" cy="8.5" r="0.6" fill="currentColor"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  ),
);
AuthInput.displayName = 'AuthInput';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function AuthButton({ loading, children, className, ...props }: AuthButtonProps) {
  return (
    <button
      className={cn(
        'w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 btn-primary disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none',
        className,
      )}
      disabled={loading || props.disabled}
      {...props}>
      {loading
        ? <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="white" strokeOpacity="0.25" strokeWidth="2"/>
            <path d="M14 8a6 6 0 00-6-6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        : children}
    </button>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm text-red-400"
      style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 mt-0.5">
        <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeOpacity="0.5"/>
        <path d="M7.5 4v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="7.5" cy="10.5" r="0.75" fill="currentColor"/>
      </svg>
      {message}
    </div>
  );
}

export function PasswordStrength({ password }: { password: string }) {
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score  = checks.filter(Boolean).length;
  const labels = ['','Weak','Fair','Good','Strong'];
  const colors = ['','#ef4444','#f59e0b','#6D8196','#01796F'];
  if (!password) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : 'rgba(1,121,111,0.1)' }}/>
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[score] || '#3A6A3E' }}>{labels[score]}</p>
    </div>
  );
}
