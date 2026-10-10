/** Local-date key `YYYY-MM-DD` (the user's own calendar day, not UTC). */
export function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export type DayLog = Record<string, number>;

/**
 * Consecutive days with at least one session, ending today, or ending
 * yesterday when today has none yet (the streak is still alive until midnight).
 */
export function streak(log: DayLog, today: Date): number {
  let d = log[dayKey(today)] ? today : addDays(today, -1);
  let n = 0;
  while (log[dayKey(d)]) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

/** Number of distinct days with a session in the last `days` days, today included. */
export function activeDays(log: DayLog, today: Date, days: number): number {
  let n = 0;
  for (let i = 0; i < days; i++) if (log[dayKey(addDays(today, -i))]) n++;
  return n;
}

/** Oldest first: the last `n` days ending today. */
export function lastDays(today: Date, n: number): Date[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - n + 1));
}

export function totalSessions(log: DayLog): number {
  return Object.values(log).reduce((a, b) => a + b, 0);
}

/** `DD/MM` for short labels. */
export function shortDate(key: string): string {
  return `${key.slice(8, 10)}/${key.slice(5, 7)}`;
}
