export const DAY_MS = 86_400_000;

export const clamp = (n: number, min = 0, max = 100): number => Math.min(max, Math.max(min, n));

export const round = (n: number): number => Math.round(n);

export function addDays(iso: string | Date, days: number): string {
  const base = typeof iso === 'string' ? new Date(iso) : iso;
  return new Date(base.getTime() + days * DAY_MS).toISOString();
}

/** Whole days from `a` to `b` (positive when b is later). */
export function daysBetween(a: string | Date, b: string | Date): number {
  const ta = typeof a === 'string' ? new Date(a).getTime() : a.getTime();
  const tb = typeof b === 'string' ? new Date(b).getTime() : b.getTime();
  return Math.ceil((tb - ta) / DAY_MS);
}

let counter = 0;
export function uid(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Small, deterministic, non-cryptographic string hash (cache keys / signatures). */
export function hashString(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** "4–6 hours" style range from a point estimate. */
export function formatHours(hours: number): string {
  if (hours <= 1) return `${hours <= 0.5 ? '30 min' : '~1 hour'}`;
  const lo = Math.max(1, Math.round(hours * 0.75));
  const hi = Math.max(lo + 1, Math.ceil(hours * 1.25));
  return `${lo}–${hi} hours`;
}

export function uniq<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}
