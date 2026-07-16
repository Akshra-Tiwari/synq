import { cn } from '../../lib/utils/cn';

interface StatCardProps {
  label:    string;
  value:    string | number;
  sub?:     string;
  trend?:   { value: number; label: string };
  icon?:    React.ReactNode;
  accent?:  'teal' | 'steel' | 'light' | 'charcoal';
  className?: string;
}

const ACCENTS = {
  teal:     { border: 'rgba(1,121,111,0.2)',   icon: 'rgba(1,121,111,0.1)',   iconColor: '#01796F' },
  steel:    { border: 'rgba(109,129,150,0.2)', icon: 'rgba(109,129,150,0.1)', iconColor: '#6D8196' },
  light:    { border: 'rgba(176,196,222,0.2)', icon: 'rgba(176,196,222,0.08)',iconColor: '#B0C4DE' },
  charcoal: { border: 'rgba(90,90,90,0.2)',    icon: 'rgba(90,90,90,0.1)',    iconColor: '#5A5A5A' },
} as const;

export function StatCard({ label, value, sub, trend, icon, accent = 'steel', className }: StatCardProps) {
  // Fallback to 'steel' if an unknown accent value is passed
  const a = ACCENTS[accent] ?? ACCENTS.steel;
  const isPos = (trend?.value ?? 0) >= 0;

  return (
    <div className={cn('rounded-2xl p-5', className)}
      style={{ background: 'rgba(13,19,28,0.7)', border: `1px solid ${a.border}` }}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#50606E' }}>{label}</p>
        {icon && (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: a.icon, color: a.iconColor }}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold tracking-tight mb-1" style={{ color: '#DCE4EC' }}>{value}</p>
      {sub   && <p className="text-xs" style={{ color: '#50606E' }}>{sub}</p>}
      {trend && (
        <p className="text-xs font-medium flex items-center gap-1 mt-1"
          style={{ color: isPos ? '#01796F' : '#ef4444' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d={isPos ? 'M5 8V2M2 5l3-3 3 3' : 'M5 2v6M2 5l3 3 3-3'}
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {Math.abs(trend.value)} {trend.label}
        </p>
      )}
    </div>
  );
}

export function MiniStat({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-xl"
      style={{ background: 'rgba(18,26,38,0.6)', border: '1px solid rgba(109,129,150,0.08)' }}>
      {icon && <div style={{ color: '#50606E' }} className="mb-0.5">{icon}</div>}
      <p className="text-xl font-bold" style={{ color: '#DCE4EC' }}>{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#50606E' }}>{label}</p>
    </div>
  );
}
