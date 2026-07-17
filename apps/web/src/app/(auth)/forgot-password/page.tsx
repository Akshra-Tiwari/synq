'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthCard, AuthInput, AuthButton, FormError } from '../../../components/auth/AuthComponents';
import { requestPasswordReset } from '../../../lib/api/auth.api';
import { getApiErrorMessage } from '../../../lib/utils/errors';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setError(null);
    try { await requestPasswordReset(data.email); setSent(true); }
    catch (e) { setError(getApiErrorMessage(e)); }
  };

  if (sent) {
    return (
      <AuthCard>
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background:'rgba(1,121,111,0.12)', border:'1px solid rgba(1,121,111,0.25)' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" style={{ color:'#01796F' }}>
              <rect x="2" y="5" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 7l11 8 11-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color:'#DCE4EC' }}>Check your email</h2>
          <p className="text-sm mb-6" style={{ color:'#50606E' }}>
            We sent a password reset link to your email address.
          </p>
          <Link href="/login" className="text-sm font-medium" style={{ color:'#01796F' }}>Back to sign in</Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="mb-7">
        <h1 className="text-2xl font-bold mb-1" style={{ color:'#DCE4EC' }}>Reset password</h1>
        <p className="text-sm" style={{ color:'#50606E' }}>Enter your email and we&apos;ll send a reset link.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError message={error}/>
        <AuthInput label="Email" type="email" placeholder="you@example.com"
          autoComplete="email" error={errors.email?.message}
          icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="currentColor"/><path d="M1 4l6 4.5L13 4" stroke="currentColor" strokeLinecap="round"/></svg>}
          {...register('email')}/>
        <AuthButton type="submit" loading={isSubmitting}>Send reset link</AuthButton>
      </form>
      <p className="mt-6 text-center text-sm" style={{ color:'#50606E' }}>
        <Link href="/login" style={{ color:'#01796F' }}>Back to sign in</Link>
      </p>
    </AuthCard>
  );
}
