export interface KegelLevel {
  name: string;
  /** Seconds to hold each squeeze. */
  hold: number;
  /** Seconds to relax after each squeeze. */
  rest: number;
  /** Long holds in set 1. */
  reps: number;
  /** Quick 1 s squeeze / 1 s release pairs in set 2. */
  quick: number;
}

export const KEGEL_LEVELS: readonly KegelLevel[] = [
  { name: 'Làm quen', hold: 3, rest: 3, reps: 10, quick: 10 },
  { name: 'Khởi động', hold: 4, rest: 4, reps: 10, quick: 10 },
  { name: 'Nền tảng', hold: 5, rest: 5, reps: 12, quick: 12 },
  { name: 'Tăng sức', hold: 6, rest: 6, reps: 12, quick: 15 },
  { name: 'Bền bỉ', hold: 8, rest: 8, reps: 12, quick: 15 },
  { name: 'Kiểm soát', hold: 10, rest: 10, reps: 10, quick: 20 },
  { name: 'Nâng cao', hold: 12, rest: 10, reps: 10, quick: 20 },
  { name: 'Thành thạo', hold: 15, rest: 10, reps: 10, quick: 25 },
];

/** Completed sessions at a level before the next one unlocks. */
export const KEGEL_SESSIONS_TO_LEVEL_UP = 3;

export const PREP_SECONDS = 3;
export const BREAK_SECONDS = 8;

export type KegelPhaseType = 'prep' | 'squeeze' | 'relax' | 'break' | 'flick' | 'flickRelax';

export interface KegelPhase {
  type: KegelPhaseType;
  seconds: number;
  /** 1 = long holds, 2 = quick flicks. Absent for prep and break. */
  set?: 1 | 2;
  rep?: number;
  of?: number;
}

export function buildKegelPhases(level: KegelLevel): KegelPhase[] {
  const out: KegelPhase[] = [{ type: 'prep', seconds: PREP_SECONDS }];
  for (let rep = 1; rep <= level.reps; rep++) {
    out.push({ type: 'squeeze', seconds: level.hold, set: 1, rep, of: level.reps });
    out.push({ type: 'relax', seconds: level.rest, set: 1, rep, of: level.reps });
  }
  out.push({ type: 'break', seconds: BREAK_SECONDS });
  for (let rep = 1; rep <= level.quick; rep++) {
    out.push({ type: 'flick', seconds: 1, set: 2, rep, of: level.quick });
    out.push({ type: 'flickRelax', seconds: 1, set: 2, rep, of: level.quick });
  }
  return out;
}

export function totalSeconds(phases: readonly KegelPhase[]): number {
  return phases.reduce((a, p) => a + p.seconds, 0);
}

/** Session length rounded to the nearest half minute. */
export function kegelMinutes(level: KegelLevel): number {
  return Math.round((totalSeconds(buildKegelPhases(level)) / 60) * 2) / 2;
}

export interface PhasePosition {
  index: number;
  /** Seconds left in this phase. */
  remaining: number;
  /** 0 → 1 progress through this phase. */
  fraction: number;
}

/** Where a session is after `elapsed` seconds; null once it has ended. */
export function phaseAt(phases: readonly KegelPhase[], elapsed: number): PhasePosition | null {
  let start = 0;
  for (let i = 0; i < phases.length; i++) {
    const end = start + phases[i].seconds;
    if (elapsed < end) {
      const into = Math.max(0, elapsed - start);
      return { index: i, remaining: end - Math.max(elapsed, start), fraction: into / phases[i].seconds };
    }
    start = end;
  }
  return null;
}

export const isSqueeze = (t: KegelPhaseType) => t === 'squeeze' || t === 'flick';
export const isRelax = (t: KegelPhaseType) => t === 'relax' || t === 'flickRelax';
