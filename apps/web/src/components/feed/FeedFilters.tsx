'use client';

import { cn } from '../../lib/utils/cn';

type FeedFilter = 'all' | 'following' | 'trending';

const FILTERS: { value: FeedFilter; label: string }[] = [
  { value:'all',       label:'Latest' },
  { value:'trending',  label:'Trending' },
  { value:'following', label:'Following' },
];

export function FeedFilters({ active, onChange }: { active: FeedFilter; onChange: (f: FeedFilter) => void }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl"
      style={{ background:'rgba(13,19,28,0.6)', border:'1px solid rgba(109,129,150,0.08)' }}>
      {FILTERS.map(({ value, label }) => (
        <button key={value} onClick={() => onChange(value)}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
          style={active === value
            ? { background:'rgba(1,121,111,0.12)', color:'#00c4b4', border:'1px solid rgba(1,121,111,0.2)' }
            : { color:'#50606E' }}>
          {label}
        </button>
      ))}
    </div>
  );
}
