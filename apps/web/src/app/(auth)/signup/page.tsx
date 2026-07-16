'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../hooks/useAuth';
import { AuthCard, AuthInput, AuthButton, FormError, PasswordStrength } from '../../../components/auth/AuthComponents';
import { getApiErrorMessage } from '../../../lib/utils/errors';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(50),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30)
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers and underscores'),
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type Form = z.infer<typeof schema>;

export default function SignupPage() {
  const { register: signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setError(null);
    try { await signup(data); }
    catch (e) { setError(getApiErrorMessage(e)); }
  };

  return (
    <AuthCard>
      <div className="mb-7">
        <h1 className="text-2xl font-bold mb-1" style={{ color:'#DCE4EC' }}>Create your account</h1>
        <p className="text-sm" style={{ color:'#50606E' }}>Join thousands of developers on Synq</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError message={error}/>

        <div className="grid grid-cols-2 gap-3">
          <AuthInput label="Full name" placeholder="Jane Smith" error={errors.name?.message}
            {...register('name')}/>
          <AuthInput label="Username" placeholder="janesmith" error={errors.username?.message}
            {...register('username')}/>
        </div>

        <AuthInput label="Email" type="email" placeholder="you@example.com"
          autoComplete="email" error={errors.email?.message}
          icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2.5" width="12" height="9" rx="1.5" stroke="currentColor"/><path d="M1 4l6 4.5L13 4" stroke="currentColor" strokeLinecap="round"/></svg>}
          {...register('email')}/>

        <div className="space-y-2">
          <AuthInput label="Password" type={showPass ? 'text' : 'password'}
            placeholder="••••••••" autoComplete="new-password"
            error={errors.password?.message}
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor"/><path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeLinecap="round"/></svg>}
            rightElement={
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ color:'#50606E' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M1 7.5s3-5 6.5-5 6.5 5 6.5 5-3 5-6.5 5-6.5-5-6.5-5z" stroke="currentColor" strokeLinecap="round"/>
                  <circle cx="7.5" cy="7.5" r="2" stroke="currentColor"/>
                </svg>
              </button>
            }
            {...register('password', { onChange: e => setPassword(e.target.value) })}/>
          <PasswordStrength password={password}/>
        </div>

        <AuthButton type="submit" loading={isSubmitting}>
          {!isSubmitting && 'Create account'}
        </AuthButton>

        <p className="text-xs text-center" style={{ color:'#50606E' }}>
          By signing up, you agree to our{' '}
          <Link href="/terms" style={{ color:'#01796F' }}>Terms</Link>{' '}and{' '}
          <Link href="/privacy" style={{ color:'#01796F' }}>Privacy Policy</Link>
        </p>
      </form>

      <p className="mt-5 text-center text-sm" style={{ color:'#50606E' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-medium" style={{ color:'#01796F' }}>Sign in</Link>
      </p>
    </AuthCard>
  );
}
