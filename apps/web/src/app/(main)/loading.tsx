export default function Loading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin" width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color:'#01796F' }}>
          <circle cx="14" cy="14" r="11" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5"/>
          <path d="M25 14a11 11 0 00-11-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <p className="text-xs animate-pulse" style={{ color:'#50606E' }}>Loading…</p>
      </div>
    </div>
  );
}
