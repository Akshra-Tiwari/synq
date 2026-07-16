'use client';

interface SparklineProps { data: number[]; color?: string; height?: number; width?: number; }

export function Sparkline({ data, color='#01796F', height=40, width=120 }: SparklineProps) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v,i) => `${(i/(data.length-1))*width},${height-((v-min)/range)*height}`);
  const gradId = `sg${color.replace('#','')}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`M 0,${height} L ${pts.join(' L ')} L ${width},${height} Z`} fill={`url(#${gradId})`}/>
      <path d={`M ${pts.join(' L ')}`} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface BarChartProps { data: { label: string; count: number }[]; color?: string; maxBars?: number; }

export function HorizontalBarChart({ data, color='#01796F', maxBars=8 }: BarChartProps) {
  const displayed = data.slice(0, maxBars);
  const maxVal    = Math.max(...displayed.map(d => d.count));
  return (
    <div className="space-y-2">
      {displayed.map(({ label, count }) => (
        <div key={label} className="flex items-center gap-3">
          <p className="text-xs w-24 truncate shrink-0 text-right" style={{ color:'#50606E' }}>{label}</p>
          <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background:'rgba(109,129,150,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width:`${(count/maxVal)*100}%`, background:color, opacity:0.75 }}/>
          </div>
          <p className="text-xs w-8 text-right shrink-0" style={{ color:'#50606E' }}>{count}</p>
        </div>
      ))}
    </div>
  );
}
