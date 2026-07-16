export function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const label = names.length === 1 ? `${names[0]} is typing`
    : names.length === 2 ? `${names[0]} and ${names[1]} are typing`
    : 'Several people are typing';

  return (
    <div className="flex items-end gap-2 mb-2">
      <div className="w-7 shrink-0"/>
      <div className="flex flex-col">
        <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1"
          style={{ background:'rgba(18,26,38,0.9)', border:'1px solid rgba(109,129,150,0.12)' }}>
          {[0,1,2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ background:'#01796F', animationDelay:`${i*150}ms`, animationDuration:'900ms' }}/>
          ))}
        </div>
        <span className="text-[10px] mt-0.5 ml-1" style={{ color:'#50606E' }}>{label}</span>
      </div>
    </div>
  );
}
