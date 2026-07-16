import { Sidebar }        from '../../components/layout/Sidebar';
import { TopBar }         from '../../components/layout/TopBar';
import { MobileNav }      from '../../components/layout/MobileNav';
import { PageTransition } from '../../components/shared/PageTransition';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background:'#08120A' }}>
      <div className="hidden md:block"><Sidebar /></div>
      <div className="md:ml-60"><TopBar /></div>
      <main className="md:ml-60 pt-16 min-h-screen pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
