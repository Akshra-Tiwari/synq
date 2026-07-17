'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../../lib/store/auth.store';
import { getMe } from '../../../../lib/api/auth.api';

const TOKEN_KEY = 'synq_access_token';

function GoogleSuccessContent() {
  const router    = useRouter();
  const sp        = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = sp.get('token');
    if (!token) { router.replace('/login?error=google_failed'); return; }
    localStorage.setItem(TOKEN_KEY, token);
    getMe()
      .then(res => { setAuth(res.data.user, token); router.replace('/feed'); })
      .catch(() => { localStorage.removeItem(TOKEN_KEY); router.replace('/login?error=google_failed'); });
  }, [sp, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#0A1A0C' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor:'#01796F', borderTopColor:'transparent' }}/>
        <p className="text-sm" style={{ color:'#5A7A5E' }}>Signing you in with Google…</p>
      </div>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background:'#0A1A0C' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor:'#01796F', borderTopColor:'transparent' }}/>
      </div>
    }>
      <GoogleSuccessContent />
    </Suspense>
  );
}
