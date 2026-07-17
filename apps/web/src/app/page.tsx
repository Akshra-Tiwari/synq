import Link from 'next/link';
import type { Metadata } from 'next';
import { SynqLogo } from '../components/shared/Logo';

export const metadata: Metadata = {
  title: 'Synq — The Professional Network for Developers',
  description: 'Connect with developers, showcase projects, and grow your career on Synq.',
};

const FEATURES = [
  { icon:'🧑‍💻', title:'Developer Profiles',  desc:'Showcase skills, tech stack, experience and projects in one premium profile.' },
  { icon:'🚀',   title:'Project Showcase',    desc:'Upload screenshots, link GitHub and live demos, tag your tech stack.' },
  { icon:'⚡',   title:'Real-time Feed',      desc:'Share achievements and post updates — infinite scroll, always fast.' },
  { icon:'🤝',   title:'Smart Connections',   desc:'Skill-matched developer suggestions to grow your professional network.' },
  { icon:'💬',   title:'Direct Messaging',    desc:'Real-time chat with typing indicators and read receipts.' },
  { icon:'🔔',   title:'Live Notifications',  desc:'Instant alerts for likes, comments, and connection requests.' },
];

const STATS = [
  { value:'10k+', label:'Developers' },
  { value:'25k+', label:'Projects'   },
  { value:'50k+', label:'Connections'},
  { value:'99.9%',label:'Uptime'     },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background:'#0A1A0C', color:'#E2EBE4' }}>

      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
        style={{ background:'rgba(10,26,12,0.88)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(1,121,111,0.15)' }}>
        <SynqLogo size="md"/>
        <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color:'#5A7A5E' }}>
          <Link href="#features" className="hover:text-teal-300 transition-colors">Features</Link>
          <Link href="#stats"    className="hover:text-teal-300 transition-colors">Stats</Link>
          <Link href="/explore"  className="hover:text-teal-300 transition-colors">Explore</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login"  className="text-sm px-3 py-1.5 transition-colors" style={{ color:'#5A7A5E' }}>Sign in</Link>
          <Link href="/signup" className="text-sm font-semibold px-4 py-2 rounded-xl btn-primary">Get started →</Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-16 overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px]"
            style={{ background:'radial-gradient(circle, rgba(1,121,111,0.18) 0%, rgba(0,196,180,0.06) 50%, transparent 70%)' }}/>
          <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background:'rgba(176,196,222,0.05)' }}/>
          <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background:'rgba(1,121,111,0.06)' }}/>
        </div>
        <div className="absolute inset-0 grid-pattern pointer-events-none"/>

        {/* Badge */}
        <div className="relative mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm animate-fade-up"
          style={{ background:'rgba(1,121,111,0.12)', border:'1px solid rgba(1,121,111,0.25)', color:'#00c4b4', boxShadow:'0 0 20px rgba(1,121,111,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'#00c4b4', boxShadow:'0 0 6px #00c4b4' }}/>
          Now in public beta — free for developers
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.08] animate-fade-up"
          style={{ animationDelay:'0.05s' }}>
          Where developers<br/>
          <span className="grad-text glow-text">connect & grow</span>
        </h1>

        <p className="relative text-lg md:text-xl max-w-2xl mb-10 leading-relaxed animate-fade-up"
          style={{ color:'#7A9A7E', animationDelay:'0.1s' }}>
          Showcase your projects, connect with engineers who get it,
          share what you&apos;re building — on a platform built by developers, for developers.
        </p>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row items-center gap-4 mb-16 animate-fade-up"
          style={{ animationDelay:'0.15s' }}>
          <Link href="/signup"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base btn-primary glow-sm">
            Create your profile
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/explore"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-medium text-base transition-all"
            style={{ background:'rgba(1,121,111,0.08)', border:'1px solid rgba(1,121,111,0.2)', color:'#B0C4DE' }}
            onMouseEnter={undefined} onMouseLeave={undefined}>
            Browse developers
          </Link>
        </div>

        {/* Social proof */}
        <div className="relative flex items-center gap-3 animate-fade-up" style={{ animationDelay:'0.2s' }}>
          <div className="flex -space-x-2">
            {['#01796F','#6D8196','#B0C4DE','#015a53','#4a8a7a'].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                style={{ background:c, borderColor:'#0A1A0C', boxShadow:`0 0 8px ${c}40` }}>
                {['A','B','S','M','R'][i]}
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color:'#5A7A5E' }}>
            Joined by <span className="font-semibold" style={{ color:'#9EB5A0' }}>10,000+</span> developers
          </p>
        </div>

        {/* Floating glow card preview */}
        <div className="relative mt-20 w-full max-w-2xl mx-auto animate-fade-up" style={{ animationDelay:'0.25s' }}>
          <div className="rounded-2xl p-6 card"
            style={{ boxShadow:'0 0 60px rgba(1,121,111,0.15), 0 20px 40px rgba(0,0,0,0.4)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                style={{ background:'linear-gradient(135deg,#01796F,#00c4b4)' }}>A</div>
              <div>
                <p className="text-sm font-semibold" style={{ color:'#C8DCC9' }}>Akshay Tiwari</p>
                <p className="text-xs" style={{ color:'#5A7A5E' }}>@akshay · Full-stack Developer</p>
              </div>
              <div className="ml-auto px-2.5 py-1 rounded-full text-xs font-medium badge-teal">Open to work</div>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color:'#9EB5A0' }}>
              Just shipped a new feature using Next.js 15 + Socket.io — real-time notifications with zero polling. The architecture is clean and scales beautifully 🚀
            </p>
            <div className="flex items-center gap-4 text-xs pt-3" style={{ color:'#5A7A5E', borderTop:'1px solid rgba(1,121,111,0.1)' }}>
              <span className="flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 11S1 7.5 1 4a2.5 2.5 0 015 0 2.5 2.5 0 015 0c0 3.5-5.5 7-5.5 7z" stroke="currentColor" strokeWidth="1.2"/></svg>
                42 likes
              </span>
              <span className="flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5a4.5 4.5 0 01-6.36 4.08L2 11l.74-2.64A4.5 4.5 0 1111 6.5z" stroke="currentColor" strokeWidth="1.2"/></svg>
                8 comments
              </span>
              <div className="ml-auto flex gap-1.5">
                {['React','TypeScript','Next.js'].map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full text-[10px] badge-steel">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="py-20 px-6"
        style={{ borderTop:'1px solid rgba(1,121,111,0.1)', borderBottom:'1px solid rgba(1,121,111,0.1)', background:'rgba(14,26,15,0.6)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-bold mb-1 grad-text">{value}</p>
              <p className="text-sm" style={{ color:'#5A7A5E' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color:'#E2EBE4' }}>
              Built for how developers actually work
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color:'#7A9A7E' }}>
              Not a watered-down social network — purpose-built for engineering professionals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl card card-hover">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="text-base font-semibold mb-2" style={{ color:'#C8DCC9' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color:'#5A7A5E' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px]"
            style={{ background:'rgba(1,121,111,0.12)' }}/>
        </div>
        <h2 className="relative text-4xl md:text-5xl font-bold mb-5" style={{ color:'#E2EBE4' }}>
          Ready to build your<br/>developer presence?
        </h2>
        <p className="relative text-lg mb-10 max-w-lg mx-auto" style={{ color:'#7A9A7E' }}>
          Join thousands of engineers using Synq to grow their network and showcase their work.
        </p>
        <Link href="/signup"
          className="relative inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-semibold text-base btn-primary glow-sm">
          Get started for free
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <p className="relative text-xs mt-4" style={{ color:'#3A5A3E' }}>No credit card required · Free for individuals</p>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6" style={{ borderTop:'1px solid rgba(1,121,111,0.1)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <SynqLogo size="sm"/>
          <div className="flex items-center gap-6 text-xs" style={{ color:'#3A5A3E' }}>
            <Link href="/terms"   className="hover:text-teal-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-teal-400 transition-colors">Privacy</Link>
          </div>
          <p className="text-xs" style={{ color:'#3A5A3E' }}>© {new Date().getFullYear()} Synq</p>
        </div>
      </footer>
    </div>
  );
}
