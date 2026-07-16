import type { Metadata } from 'next';
import { SynqLogo } from '../../components/shared/Logo';

export const metadata: Metadata = {
  title: { default: 'Synq', template: '%s · Synq' },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col" style={{ background:'#0A1A0C' }}>
      <div className="auth-bg grid-pattern">
        <div className="auth-orb auth-orb-1"/>
        <div className="auth-orb auth-orb-2"/>
        <div className="auth-orb auth-orb-3"/>
      </div>
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <SynqLogo size="md"/>
        <p className="hidden sm:block text-sm" style={{ color:'#3A5A3E' }}>
          The network built for developers.
        </p>
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>
      <footer className="relative z-10 text-center py-6 text-xs" style={{ color:'#3A5A3E' }}>
        © {new Date().getFullYear()} Synq · Built for developers
      </footer>
    </div>
  );
}
