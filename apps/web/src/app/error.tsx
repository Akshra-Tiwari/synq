'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[Synq Error]', error); }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background:'#08120A' }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)', color:'#ef4444' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5"/>
          <path d="M14 8v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="14" cy="19" r="1" fill="currentColor"/>
        </svg>
      </div>
      <h1 className="text-xl font-semibold mb-2" style={{ color:'#94A2AF' }}>Something went wrong</h1>
      <p className="text-sm max-w-sm mb-8" style={{ color:'#50606E' }}>
        An unexpected error occurred. Try refreshing — it usually fixes it.
      </p>
      {error.digest && <p className="text-xs font-mono mb-6" style={{ color:'#50606E' }}>Error ID: {error.digest}</p>}
      <div className="flex items-center gap-3">
        <button onClick={reset}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white btn-primary">
          Try again
        </button>
        <Link href="/feed"
          className="px-5 py-2.5 rounded-xl text-sm transition-all"
          style={{ background:'rgba(109,129,150,0.08)', border:'1px solid rgba(109,129,150,0.14)', color:'#94A2AF' }}>
          Back to feed
        </Link>
      </div>
    </div>
  );
}
