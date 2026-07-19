import { cn } from '../../lib/utils/cn';

export function TechBadge({ tech, className }: { tech: string; className?: string }) {
  return (
    <span className={cn('px-2.5 py-1 rounded-lg text-xs font-mono transition-all', className)}
      style={{ background:'rgba(109,129,150,0.08)', border:'1px solid rgba(109,129,150,0.14)', color:'#94A2AF' }}>
      {tech}
    </span>
  );
}

interface SkillBadgeProps {
  skill:      string;
  className?: string;
  variant?:   'default' | 'removable' | 'outline';
  removable?: boolean;
  onRemove?:  () => void;
}

export function SkillBadge({ skill, className, variant = 'default', removable, onRemove }: SkillBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', className)}
      style={{ background:'rgba(1,121,111,0.1)', border:'1px solid rgba(1,121,111,0.2)', color:'#00c4b4' }}>
      {skill}
      {(removable || variant === 'removable') && onRemove && (
        <button onClick={onRemove} className="ml-0.5 hover:opacity-70 transition-opacity" type="button">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </span>
  );
}

export function AvailabilityBadge({ availability }: { availability: string }) {
  const configs: Record<string, { label: string; style: React.CSSProperties }> = {
    'full-time':     { label:'Open to full-time',      style:{ background:'rgba(1,121,111,0.1)',   border:'1px solid rgba(1,121,111,0.25)',   color:'#00c4b4' } },
    'part-time':     { label:'Open to part-time',      style:{ background:'rgba(109,129,150,0.1)', border:'1px solid rgba(109,129,150,0.25)', color:'#B0C4DE' } },
    'freelance':     { label:'Available for freelance', style:{ background:'rgba(176,196,222,0.08)',border:'1px solid rgba(176,196,222,0.2)',  color:'#B0C4DE' } },
    'not-available': { label:'Not available',           style:{ background:'rgba(90,90,90,0.1)',    border:'1px solid rgba(90,90,90,0.2)',     color:'#5A5A5A' } },
  };
  const c = configs[availability] ?? configs['not-available'];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={c.style}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.style.color as string }}/>
      {c.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: 'in-progress' | 'completed' | 'archived' }) {
  const configs = {
    'in-progress': { label:'In progress', style:{ background:'rgba(176,196,222,0.08)', border:'1px solid rgba(176,196,222,0.2)', color:'#B0C4DE' } },
    'completed':   { label:'Completed',   style:{ background:'rgba(1,121,111,0.1)',    border:'1px solid rgba(1,121,111,0.25)',   color:'#00c4b4' } },
    'archived':    { label:'Archived',    style:{ background:'rgba(90,90,90,0.08)',    border:'1px solid rgba(90,90,90,0.15)',    color:'#5A5A5A' } },
  };
  const c = configs[status];
  return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={c.style}>{c.label}</span>;
}

export function StatChip({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold" style={{ color:'#DCE4EC' }}>{value}</p>
      <p className="text-xs" style={{ color:'#50606E' }}>{label}</p>
    </div>
  );
}
