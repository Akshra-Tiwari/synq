import { cn } from '../../lib/utils/cn';

export function Spinner({ size='md', className }: { size?:'sm'|'md'|'lg'; className?: string }) {
  const s = size==='sm'?16:size==='lg'?32:20;
  return (
    <svg className={cn('animate-spin', className)} width={s} height={s} viewBox="0 0 24 24" fill="none"
      style={{ color:'#01796F' }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5"/>
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function EmptyState({ icon, title, description, action, className }:
  { icon?:React.ReactNode; title:string; description?:string; action?:React.ReactNode; className?:string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background:'rgba(1,121,111,0.1)', border:'1px solid rgba(1,121,111,0.2)', color:'#01796F' }}>
          {icon}
        </div>
      )}
      <p className="text-base font-semibold mb-1.5" style={{ color:'#7A9A7E' }}>{title}</p>
      {description && <p className="text-sm max-w-sm" style={{ color:'#3A6A3E' }}>{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionCard({ title, action, children, className }:
  { title?:string; action?:React.ReactNode; children:React.ReactNode; className?:string }) {
  return (
    <div className={cn('rounded-2xl overflow-hidden card', className)}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom:'1px solid rgba(1,121,111,0.1)' }}>
          <h3 className="text-sm font-semibold" style={{ color:'#7A9A7E' }}>{title}</h3>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Divider({ className }: { className?:string }) {
  return <hr className={cn(className)} style={{ borderColor:'rgba(1,121,111,0.12)' }}/>;
}

export function IconButton({ onClick, children, label, variant='ghost', className }:
  { onClick?:()=>void; children:React.ReactNode; label:string; variant?:'ghost'|'danger'; className?:string }) {
  return (
    <button onClick={onClick} aria-label={label} title={label}
      className={cn('p-1.5 rounded-lg transition-all', className)}
      style={{ color:'#3A6A3E' }}
      onMouseEnter={e => {
        e.currentTarget.style.color    = variant==='danger'?'#ef4444':'#00c4b4';
        e.currentTarget.style.background = variant==='danger'?'rgba(239,68,68,0.08)':'rgba(1,121,111,0.12)';
      }}
      onMouseLeave={e => { e.currentTarget.style.color='#3A6A3E'; e.currentTarget.style.background=''; }}>
      {children}
    </button>
  );
}

export function TealButton({ onClick, children, className, disabled, type='button' }:
  { onClick?:()=>void; children:React.ReactNode; className?:string; disabled?:boolean; type?:'button'|'submit' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all btn-primary disabled:opacity-50 disabled:cursor-not-allowed', className)}>
      {children}
    </button>
  );
}
