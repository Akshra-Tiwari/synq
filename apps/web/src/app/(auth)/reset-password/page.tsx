'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '../../../lib/api/auth.api';
import {
  AuthCard, AuthInput, AuthButton, FormError, PasswordStrength,
} from '../../../components/auth/AuthComponents';
import { getApiErrorMessage } from '../../../lib/utils/errors';

const schema = z.object({
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
});
type Form = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router    = useRouter();
  const sp        = useSearchParams();
  const token     = sp.get('token') ?? '';
  const [done, setDone]   = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pw, setPw]       = useState('');
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    if (!token) { setError('Invalid or missing reset token. Request a new link.'); return; }
    setError(null);
    try {
      await resetPassword(token, data.password);
      setDone(true);
    } catch (e) { setError(getApiErrorMessage(e)); }
  };

  if (done) return (
    <AuthCard>
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background:'rgba(1,121,111,0.12)', border:'1px solid rgba(1,121,111,0.25)' }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" style={{ color:'#01796F' }}>
            <circle cx="13" cy="13" r="11" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 13l3.5 3.5L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color:'#DCE4EC' }}>Password reset!</h2>
        <p className="text-sm mb-6" style={{ color:'#50606E' }}>You can now sign in with your new password.</p>
        <Link href="/login" className="text-sm font-medium" style={{ color:'#01796F' }}>Go to sign in →</Link>
      </div>
    </AuthCard>
  );

  return (
    <AuthCard>
      <div className="mb-7">
        <h1 className="text-2xl font-bold mb-1" style={{ color:'#DCE4EC' }}>New password</h1>
        <p className="text-sm" style={{ color:'#50606E' }}>Choose a strong password for your account.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError message={error}/>
        <div className="space-y-2">
          <AuthInput label="New password" type={showPw ? 'text' : 'password'}
            placeholder="••••••••" error={errors.password?.message}
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor"/><path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeLinecap="round"/></svg>}
            rightElement={
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ color:'#50606E' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M1 7.5s3-5 6.5-5 6.5 5 6.5 5-3 5-6.5 5-6.5-5-6.5-5z" stroke="currentColor" strokeLinecap="round"/>
                  <circle cx="7.5" cy="7.5" r="2" stroke="currentColor"/>
                </svg>
              </button>
            }
            {...register('password', { onChange: e => setPw(e.target.value) })}/>
          <PasswordStrength password={pw}/>
        </div>
        <AuthInput label="Confirm password" type="password" placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}/>
        <AuthButton type="submit" loading={isSubmitting}>Reset password</AuthButton>
      </form>
      <p className="mt-5 text-center text-sm" style={{ color:'#50606E' }}>
        <Link href="/login" style={{ color:'#01796F' }}>Back to sign in</Link>
      </p>
    </AuthCard>
  );
}
