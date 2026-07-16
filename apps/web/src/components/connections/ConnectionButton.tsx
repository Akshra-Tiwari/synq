'use client';

import { useConnection } from '../../hooks/useConnection';
import { cn }            from '../../lib/utils/cn';

interface ConnectionButtonProps {
  targetUserId:   string;
  targetUsername: string;
  compact?:       boolean;
  className?:     string;
}

export function ConnectionButton({ targetUserId, targetUsername, compact=false, className }: ConnectionButtonProps) {
  const { status, isSender, actioning, send, accept, reject, remove, withdraw } =
    useConnection(targetUserId);

  const base = cn(
    'inline-flex items-center justify-center gap-2 font-medium transition-all text-sm rounded-xl',
    compact ? 'h-8 px-3 text-xs' : 'h-9 px-4',
    actioning && 'opacity-60 cursor-not-allowed',
    className,
  );

  const Spinner = () => (
    <svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2"/>
      <path d="M11.5 6.5a5 5 0 00-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  if (status === 'none') return (
    <button onClick={send} disabled={actioning} className={base}
      style={{ background:'rgba(1,121,111,0.12)', border:'1px solid rgba(1,121,111,0.25)', color:'#00c4b4' }}
      title={`Connect with @${targetUsername}`}>
      {actioning ? <Spinner/> : <>{!compact && <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5" cy="3.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 11c0-2.2 1.8-4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M9.5 7v4M7.5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}Connect</>}
    </button>
  );

  if (status === 'pending' && isSender) return (
    <button onClick={withdraw} disabled={actioning} className={base}
      style={{ background:'rgba(109,129,150,0.08)', border:'1px solid rgba(109,129,150,0.15)', color:'#6D8196' }}>
      {actioning ? <Spinner/> : 'Requested'}
    </button>
  );

  if (status === 'pending' && !isSender) return (
    <div className="flex items-center gap-1.5">
      <button onClick={accept} disabled={actioning}
        className={cn(base, 'px-3')}
        style={{ background:'rgba(1,121,111,0.12)', border:'1px solid rgba(1,121,111,0.25)', color:'#00c4b4' }}>
        {actioning ? <Spinner/> : 'Accept'}
      </button>
      <button onClick={reject} disabled={actioning}
        className={cn(base, 'px-2.5')}
        style={{ background:'rgba(109,129,150,0.08)', border:'1px solid rgba(109,129,150,0.15)', color:'#6D8196' }}>
        {actioning ? <Spinner/> : <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
      </button>
    </div>
  );

  if (status === 'accepted') return (
    <button onClick={remove} disabled={actioning} className={cn(base, 'group')}
      style={{ background:'rgba(109,129,150,0.08)', border:'1px solid rgba(109,129,150,0.15)', color:'#94A2AF' }}>
      {actioning ? <Spinner/> : (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="group-hover:hidden">
            <path d="M2 6.5l2.5 2.5 6-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="hidden group-hover:block" style={{ color:'#ef4444' }}>
            <path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span className="group-hover:hidden">Connected</span>
          <span className="hidden group-hover:block" style={{ color:'#ef4444' }}>Remove</span>
        </>
      )}
    </button>
  );

  return null;
}
