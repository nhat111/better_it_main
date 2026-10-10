import { useSyncExternalStore } from 'react';
import type { DayLog } from '../lib/date';
import { KEGEL_LEVELS, KEGEL_SESSIONS_TO_LEVEL_UP } from '../programs/kegel';
import { PULL_SESSIONS_TO_STAGE_UP, STAGES } from '../programs/pullup';

// All user data lives in one localStorage object. No accounts, nothing leaves
// the device unless the user exports it from Settings.

export const STORAGE_KEY = 'bm:progress:v1';
/** Key used by the first single-file version of the app. */
const LEGACY_KEY = 'kegelCoach.v1';

export interface MaxTest {
  date: string;
  reps: number;
}

export interface Progress {
  version: 1;
  kegel: { level: number; sessionsAtLevel: number; log: DayLog };
  pull: { stage: number; sessionsAtStage: number; log: DayLog; maxTests: MaxTest[] };
  prefs: { sound: boolean; installHintDismissed: boolean };
}

export function emptyProgress(): Progress {
  return {
    version: 1,
    kegel: { level: 0, sessionsAtLevel: 0, log: {} },
    pull: { stage: 0, sessionsAtStage: 0, log: {}, maxTests: [] },
    prefs: { sound: true, installHintDismissed: false },
  };
}

// ---------- validation (shared by localStorage reads and imports) ----------

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const DAY = /^\d{4}-\d{2}-\d{2}$/;

function int(v: unknown, min: number, max: number, fallback: number): number {
  return typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : fallback;
}

function dayLog(v: unknown): DayLog {
  const out: DayLog = {};
  if (!isObj(v)) return out;
  for (const [k, n] of Object.entries(v)) if (DAY.test(k) && typeof n === 'number' && n > 0) out[k] = Math.floor(n);
  return out;
}

/** Turns anything into a valid Progress, keeping whatever parts are usable. */
export function parseProgress(raw: unknown): Progress {
  const p = emptyProgress();
  if (!isObj(raw)) return p;
  if (isObj(raw.kegel)) {
    p.kegel.level = int(raw.kegel.level, 0, KEGEL_LEVELS.length - 1, 0);
    p.kegel.sessionsAtLevel = int(raw.kegel.sessionsAtLevel, 0, 1000, 0);
    p.kegel.log = dayLog(raw.kegel.log);
  }
  if (isObj(raw.pull)) {
    p.pull.stage = int(raw.pull.stage, 0, STAGES.length - 1, 0);
    p.pull.sessionsAtStage = int(raw.pull.sessionsAtStage, 0, 1000, 0);
    p.pull.log = dayLog(raw.pull.log);
    if (Array.isArray(raw.pull.maxTests)) {
      p.pull.maxTests = raw.pull.maxTests
        .filter((t): t is MaxTest => isObj(t) && typeof t.date === 'string' && DAY.test(t.date) && typeof t.reps === 'number')
        .map((t) => ({ date: t.date, reps: int(t.reps, 0, 100, 0) }));
    }
  }
  if (isObj(raw.prefs)) {
    p.prefs.sound = raw.prefs.sound !== false;
    p.prefs.installHintDismissed = raw.prefs.installHintDismissed === true;
  }
  return p;
}

/** Maps the single-file version's data ({level, lvlDone, log, pull}) to v1. */
export function fromLegacy(raw: unknown): Progress | null {
  if (!isObj(raw) || typeof raw.level !== 'number') return null;
  const pull = isObj(raw.pull) ? raw.pull : {};
  return parseProgress({
    kegel: { level: raw.level, sessionsAtLevel: raw.lvlDone, log: raw.log },
    pull: {
      stage: pull.stage,
      sessionsAtStage: pull.done,
      log: pull.log,
      maxTests: Array.isArray(pull.max) ? pull.max.map((m: unknown) => (isObj(m) ? { date: m.d, reps: m.v } : null)) : [],
    },
  });
}

// ---------- pure updates ----------

export function completeKegel(p: Progress, day: string): { next: Progress; leveledUp: boolean } {
  const k = p.kegel;
  let level = k.level;
  let sessionsAtLevel = k.sessionsAtLevel + 1;
  let leveledUp = false;
  if (sessionsAtLevel >= KEGEL_SESSIONS_TO_LEVEL_UP && level < KEGEL_LEVELS.length - 1) {
    level++;
    sessionsAtLevel = 0;
    leveledUp = true;
  }
  const log = { ...k.log, [day]: (k.log[day] ?? 0) + 1 };
  return { next: { ...p, kegel: { level, sessionsAtLevel, log } }, leveledUp };
}

export function completePull(p: Progress, day: string): { next: Progress; leveledUp: boolean } {
  const u = p.pull;
  let stage = u.stage;
  let sessionsAtStage = u.sessionsAtStage + 1;
  let leveledUp = false;
  if (sessionsAtStage >= PULL_SESSIONS_TO_STAGE_UP && stage < STAGES.length - 1) {
    stage++;
    sessionsAtStage = 0;
    leveledUp = true;
  }
  const log = { ...u.log, [day]: (u.log[day] ?? 0) + 1 };
  return { next: { ...p, pull: { ...u, stage, sessionsAtStage, log } }, leveledUp };
}

// ---------- store ----------

function read(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return parseProgress(JSON.parse(raw));
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return fromLegacy(JSON.parse(legacy)) ?? emptyProgress();
  } catch {
    /* blocked or corrupt storage: start fresh */
  }
  return emptyProgress();
}

let state: Progress | null = null;
const listeners = new Set<() => void>();

function current(): Progress {
  if (!state) state = read();
  return state;
}

export function setProgress(next: Progress): void {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked: keep the in-memory copy */
  }
  listeners.forEach((l) => l());
}

export function getProgress(): Progress {
  return current();
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    current,
  );
}

export function update(fn: (p: Progress) => Progress): void {
  setProgress(fn(current()));
}

export function exportProgress(): string {
  return JSON.stringify(current(), null, 2);
}

/** Replaces all data with an exported file's contents. Throws on invalid JSON. */
export function importProgress(text: string): void {
  const raw: unknown = JSON.parse(text);
  if (!isObj(raw) || raw.version !== 1) throw new Error('not a progress file');
  setProgress(parseProgress(raw));
}

export function resetProgress(): void {
  const prefs = current().prefs;
  setProgress({ ...emptyProgress(), prefs });
}
