// ─── Relative time ────────────────────────────────────────────────────────────
export function timeAgo(dateStr: string | Date): string {
  const date  = new Date(dateStr);
  const now   = new Date();
  const secs  = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secs < 60)                    return 'just now';
  if (secs < 3600)                  return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400)                 return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 604800)                return `${Math.floor(secs / 86400)}d ago`;
  if (secs < 2592000)               return `${Math.floor(secs / 604800)}w ago`;
  if (secs < 31536000)              return `${Math.floor(secs / 2592000)}mo ago`;
  return `${Math.floor(secs / 31536000)}y ago`;
}

// ─── Compact numbers ──────────────────────────────────────────────────────────
export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Month helpers ────────────────────────────────────────────────────────────
export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export function formatMonthYear(month: number, year: number): string {
  return `${MONTHS[month - 1]} ${year}`;
}

export function formatYearRange(
  startYear: number,
  endYear?: number,
  current = false,
): string {
  return current ? `${startYear} – Present` : `${startYear}${endYear ? ` – ${endYear}` : ''}`;
}

export function formatMonthYearRange(
  startMonth: number,
  startYear: number,
  endMonth?: number,
  endYear?: number,
  current = false,
): string {
  const start = formatMonthYear(startMonth, startYear);
  if (current) return `${start} – Present`;
  if (endMonth && endYear) return `${start} – ${formatMonthYear(endMonth, endYear)}`;
  return start;
}

// ─── Duration helper ──────────────────────────────────────────────────────────
export function durationFromMonths(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} yr${y > 1 ? 's' : ''}`);
  if (m) parts.push(`${m} mo`);
  return parts.join(' ');
}

// ─── Profile completion label ─────────────────────────────────────────────────
export function completionLabel(score: number): string {
  if (score >= 90) return 'All-Star';
  if (score >= 70) return 'Advanced';
  if (score >= 50) return 'Intermediate';
  if (score >= 30) return 'Beginner';
  return 'Starter';
}

// ─── Availability badge ───────────────────────────────────────────────────────
export const AVAILABILITY_LABELS: Record<string, string> = {
  'full-time':      'Open to full-time',
  'part-time':      'Open to part-time',
  'freelance':      'Available for freelance',
  'not-available':  'Not available',
};
