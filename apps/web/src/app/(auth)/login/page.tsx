'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../hooks/useAuth';
import { AuthCard, AuthInput, AuthButton, FormError } from '../../../components/auth/AuthComponents';
import { getApiErrorMessage } from '../../../lib/utils/errors';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError]         = useState<string | null>(null);
  const [showPass, setShowPass]   = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setError(null);
    try { await login(data); }
    catch (e) { setError(getApiErrorMessage(e)); }
  };

  return (
    <AuthCard>
      <div className="mb-7">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#DCE4EC' }}>Welcome back</h1>
        <p className="text-sm" style={{ color: '#50606E' }}>Sign in to your Synq account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError message={error} />

        <AuthInput label="Email" type="email" placeholder="you@example.com"
          autoComplete="email" error={errors.email?.message}
          icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="currentColor"/><path d="M1 4l6 4.5L13 4" stroke="currentColor" strokeLinecap="round"/></svg>}
          {...register('email')}/>

        <AuthInput label="Password" type={showPass ? 'text' : 'password'}
          placeholder="••••••••" autoComplete="current-password"
          error={errors.password?.message}
          icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor"/><path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeLinecap="round"/></svg>}
          rightElement={
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ color: '#50606E' }} className="transition-colors hover:opacity-80">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                {showPass
                  ? <><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeLinecap="round"/><circle cx="8" cy="8" r="2" stroke="currentColor"/><path d="M2 2l12 12" stroke="currentColor" strokeLinecap="round"/></>
                  : <><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeLinecap="round"/><circle cx="8" cy="8" r="2" stroke="currentColor"/></>
                }
              </svg>
            </button>
          }
          {...register('password')}/>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs transition-colors"
            style={{ color: '#01796F' }}
            onMouseEnter={e => (e.currentTarget.style.color='#00c4b4')}
            onMouseLeave={e => (e.currentTarget.style.color='#01796F')}>
            Forgot password?
          </Link>
        </div>

        <AuthButton type="submit" loading={isSubmitting}>
          {!isSubmitting && <>Sign in <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: '#50606E' }}>
        No account?{' '}
        <Link href="/signup" className="font-medium transition-colors"
          style={{ color: '#01796F' }}
          onMouseEnter={e => (e.currentTarget.style.color='#00c4b4')}
          onMouseLeave={e => (e.currentTarget.style.color='#01796F')}>
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
