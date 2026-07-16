import Link from 'next/link';
import type { Metadata } from 'next';
import { SynqLogo } from '../components/shared/Logo';

export const metadata: Metadata = { title: '404 · Synq' };

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background:'#08120A' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background:'rgba(1,121,111,0.06)' }}/>
      </div>
      <div className="relative mb-8"><SynqLogo size="lg"/></div>
      <p className="relative text-[120px] md:text-[160px] font-bold leading-none select-none"
        style={{ color:'rgba(109,129,150,0.15)' }}>404</p>
      <h1 className="relative text-2xl font-semibold mt-2 mb-3" style={{ color:'#94A2AF' }}>Page not found</h1>
      <p className="relative text-sm max-w-sm mb-10 leading-relaxed" style={{ color:'#50606E' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="relative flex flex-col sm:flex-row items-center gap-3">
        <Link href="/feed"
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white btn-primary">
          Go to feed
        </Link>
        <Link href="/explore"
          className="px-6 py-3 rounded-xl text-sm transition-all"
          style={{ background:'rgba(109,129,150,0.08)', border:'1px solid rgba(109,129,150,0.14)', color:'#94A2AF' }}>
          Explore developers
        </Link>
      </div>
    </div>
  );
}
