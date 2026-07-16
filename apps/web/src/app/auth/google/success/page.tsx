'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../../lib/store/auth.store';
import { getMe } from '../../../../lib/api/auth.api';
import { Spinner } from '../../../../components/shared/UI';

export default function GoogleSuccessPage() {
  const router      = useRouter();
  const sp          = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = sp.get('token');
    if (!token) { router.replace('/login?error=google_failed'); return; }

    localStorage.setItem('synq_access_token', token);

    getMe()
      .then(res => {
        setAuth(res.data.user, token);   // setAuth(user, accessToken)
        router.replace('/feed');
      })
      .catch(() => {
        localStorage.removeItem('synq_access_token');
        router.replace('/login?error=google_failed');
      });
  }, [sp, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#08120A' }}>
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg"/>
        <p className="text-sm" style={{ color:'#6D8196' }}>Signing you in with Google…</p>
      </div>
    </div>
  );
}
