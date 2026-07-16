'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyEmail } from '../../../lib/api/auth.api';
import { AuthCard } from '../../../components/auth/AuthComponents';
import { getApiErrorMessage } from '../../../lib/utils/errors';
import { Spinner } from '../../../components/shared/UI';

type State = 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const sp    = useSearchParams();
  const token = sp.get('token');
  const [state, setState]   = useState<State>('verifying');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrMsg('Verification link is invalid or missing a token.');
      return;
    }
    verifyEmail(token)
      .then(() => setState('success'))
      .catch(e => { setState('error'); setErrMsg(getApiErrorMessage(e)); });
  }, [token]);

  return (
    <AuthCard>
      {state === 'verifying' && (
        <div className="text-center space-y-5 py-6">
          <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background:'rgba(1,121,111,0.1)', border:'1px solid rgba(1,121,111,0.2)' }}>
            <Spinner size="md"/>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1" style={{ color:'#DCE4EC' }}>Verifying your email</h2>
            <p className="text-sm" style={{ color:'#50606E' }}>Just a moment…</p>
          </div>
        </div>
      )}

      {state === 'success' && (
        <div className="text-center space-y-5 py-6">
          <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background:'rgba(1,121,111,0.1)', border:'1px solid rgba(1,121,111,0.25)' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" style={{ color:'#01796F' }}>
              <circle cx="13" cy="13" r="11" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 13l3.5 3.5L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1" style={{ color:'#DCE4EC' }}>Email verified!</h2>
            <p className="text-sm" style={{ color:'#50606E' }}>Your account is now active. Welcome to Synq.</p>
          </div>
          <Link href="/feed"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-semibold text-white btn-primary">
            Go to your feed →
          </Link>
        </div>
      )}

      {state === 'error' && (
        <div className="text-center space-y-5 py-6">
          <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color:'#ef4444' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5"/>
              <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1" style={{ color:'#DCE4EC' }}>Verification failed</h2>
            <p className="text-sm" style={{ color:'#50606E' }}>{errMsg}</p>
          </div>
          <Link href="/login"
            className="flex items-center justify-center w-full h-11 rounded-xl text-sm font-medium transition-all"
            style={{ background:'rgba(18,26,38,0.9)', border:'1px solid rgba(109,129,150,0.15)', color:'#DCE4EC' }}>
            Back to sign in
          </Link>
          <p className="text-sm" style={{ color:'#50606E' }}>
            Need a new link?{' '}
            <Link href="/forgot-password" style={{ color:'#01796F' }}>Request one</Link>
          </p>
        </div>
      )}
    </AuthCard>
  );
}
