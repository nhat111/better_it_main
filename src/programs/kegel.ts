export type Posture = 'lying' | 'sitting' | 'standing';

export interface KegelLevel {
  name: string;
  /** Seconds to hold each squeeze. */
  hold: number;
  /** Seconds to relax after each squeeze. */
  rest: number;
  /** Long holds. */
  reps: number;
  /** "Elevator" reps (3-step squeeze up, step down); 0 = not yet. */
  elevator: number;
  /** Quick 1 s squeeze / 1 s release pairs. */
  quick: number;
  posture: Posture;
}

export const KEGEL_LEVELS: readonly KegelLevel[] = [
  { name: 'Làm quen', hold: 3, rest: 3, reps: 10, elevator: 0, quick: 10, posture: 'lying' },
  { name: 'Khởi động', hold: 4, rest: 4, reps: 10, elevator: 0, quick: 10, posture: 'lying' },
  { name: 'Nền tảng', hold: 5, rest: 5, reps: 12, elevator: 3, quick: 12, posture: 'lying' },
  { name: 'Tăng sức', hold: 6, rest: 6, reps: 12, elevator: 3, quick: 15, posture: 'sitting' },
  { name: 'Bền bỉ', hold: 8, rest: 8, reps: 12, elevator: 4, quick: 15, posture: 'sitting' },
  { name: 'Kiểm soát', hold: 10, rest: 10, reps: 10, elevator: 4, quick: 20, posture: 'standing' },
  { name: 'Nâng cao', hold: 12, rest: 10, reps: 10, elevator: 5, quick: 20, posture: 'standing' },
  { name: 'Thành thạo', hold: 15, rest: 10, reps: 10, elevator: 5, quick: 25, posture: 'standing' },
];

/** Completed sessions at a level before the next one unlocks. */
export const KEGEL_SESSIONS_TO_LEVEL_UP = 3;

export const PREP_SECONDS = 3;
export const BREAK_SECONDS = 8;
/** Elevator: seconds per step up/down, and the full release at the end of a rep. */
export const ELEVATOR_STEP = 2;
export const ELEVATOR_RELEASE = 4;
/** Relaxation: slow belly breaths, inhale / exhale seconds. */
export const BREATH_IN = 4;
export const BREATH_OUT = 6;
export const BREATHS = 6;

export type KegelPhaseType =
  | 'prep' | 'break'
  | 'squeeze' | 'relax'
  | 'up1' | 'up2' | 'up3' | 'down2' | 'down1' | 'release'
  | 'flick' | 'flickRelax'
  | 'breatheIn' | 'breatheOut';

/** The four parts of a session, in order. */
export type KegelPart = 'hold' | 'elevator' | 'quick' | 'relaxation';

export interface KegelPhase {
  type: KegelPhaseType;
  seconds: number;
  part?: KegelPart;
  rep?: number;
  of?: number;
}

/** Parts this level includes (elevator unlocks at level 3). */
export function kegelParts(level: KegelLevel): KegelPart[] {
  return level.elevator > 0 ? ['hold', 'elevator', 'quick', 'relaxation'] : ['hold', 'quick', 'relaxation'];
}

export function buildKegelPhases(level: KegelLevel): KegelPhase[] {
  const out: KegelPhase[] = [{ type: 'prep', seconds: PREP_SECONDS }];
  const parts = kegelParts(level);
  parts.forEach((part, i) => {
    if (i > 0) out.push({ type: 'break', seconds: BREAK_SECONDS });
    if (part === 'hold') {
      for (let rep = 1; rep <= level.reps; rep++) {
        out.push({ type: 'squeeze', seconds: level.hold, part, rep, of: level.reps });
        out.push({ type: 'relax', seconds: level.rest, part, rep, of: level.reps });
      }
    } else if (part === 'elevator') {
      for (let rep = 1; rep <= level.elevator; rep++) {
        const of = level.elevator;
        for (const type of ['up1', 'up2', 'up3', 'down2', 'down1'] as const) out.push({ type, seconds: ELEVATOR_STEP, part, rep, of });
        out.push({ type: 'release', seconds: ELEVATOR_RELEASE, part, rep, of });
      }
    } else if (part === 'quick') {
      for (let rep = 1; rep <= level.quick; rep++) {
        out.push({ type: 'flick', seconds: 1, part, rep, of: level.quick });
        out.push({ type: 'flickRelax', seconds: 1, part, rep, of: level.quick });
      }
    } else {
      for (let rep = 1; rep <= BREATHS; rep++) {
        out.push({ type: 'breatheIn', seconds: BREATH_IN, part, rep, of: BREATHS });
        out.push({ type: 'breatheOut', seconds: BREATH_OUT, part, rep, of: BREATHS });
      }
    }
  });
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

/** Contraction phases (shown in the warm "squeeze" colour). */
export const isSqueeze = (t: KegelPhaseType) => t === 'squeeze' || t === 'flick' || t === 'up1' || t === 'up2' || t === 'up3' || t === 'down2' || t === 'down1';
export const isRelax = (t: KegelPhaseType) => t === 'relax' || t === 'flickRelax' || t === 'release';

// Squeeze intensity 0..1 at the end of each phase, used to size the ring.
const LEVEL_AFTER: Partial<Record<KegelPhaseType, number>> = {
  squeeze: 1, flick: 1, up1: 1 / 3, up2: 2 / 3, up3: 1, down2: 2 / 3, down1: 1 / 3,
  relax: 0, flickRelax: 0, release: 0,
};
const LEVEL_BEFORE: Partial<Record<KegelPhaseType, number>> = {
  squeeze: 0, flick: 0, up1: 0, up2: 1 / 3, up3: 2 / 3, down2: 1, down1: 2 / 3,
  relax: 1, flickRelax: 1, release: 1 / 3,
};

/**
 * Scale of the ring's core: grows with squeeze intensity (up to 1.12) and
 * swells gently with each belly breath in the relaxation part.
 */
export function phaseScale(t: KegelPhaseType, fraction: number): number {
  if (t === 'breatheIn') return 1 + 0.1 * fraction;
  if (t === 'breatheOut') return 1.1 - 0.1 * fraction;
  const a = LEVEL_BEFORE[t];
  const b = LEVEL_AFTER[t];
  if (a === undefined || b === undefined) return 1;
  // Step changes happen quickly at the start of the phase, then hold.
  const k = Math.min(1, fraction * 3);
  return 1 + 0.12 * (a + (b - a) * k);
}
