import { describe, expect, it } from 'vitest';
import { activeDays, streak } from '../lib/date';
import { completeKegel, completePull, emptyProgress, fromLegacy, parseProgress } from './progress';

describe('parseProgress', () => {
  it('returns defaults for junk', () => {
    expect(parseProgress(null)).toEqual(emptyProgress());
    expect(parseProgress('x')).toEqual(emptyProgress());
  });

  it('clamps out-of-range values and drops bad log keys', () => {
    const p = parseProgress({ kegel: { level: 99, sessionsAtLevel: -1, log: { '2026-10-10': 2, nope: 3, '2026-10-09': 'x' } } });
    expect(p.kegel.level).toBe(0);
    expect(p.kegel.sessionsAtLevel).toBe(0);
    expect(p.kegel.log).toEqual({ '2026-10-10': 2 });
  });

  it('migrates the single-file version', () => {
    const p = fromLegacy({ level: 2, lvlDone: 1, log: { '2026-10-10': 1 }, pull: { stage: 1, done: 3, log: {}, max: [{ d: '2026-10-01', v: 0 }] } });
    expect(p?.kegel).toEqual({ level: 2, sessionsAtLevel: 1, log: { '2026-10-10': 1 } });
    expect(p?.pull.stage).toBe(1);
    expect(p?.pull.maxTests).toEqual([{ date: '2026-10-01', reps: 0 }]);
  });
});

describe('completing sessions', () => {
  it('levels kegel up after 3 sessions and resets the counter', () => {
    let p = emptyProgress();
    let up = false;
    for (let i = 0; i < 3; i++) ({ next: p, leveledUp: up } = completeKegel(p, '2026-10-10'));
    expect(up).toBe(true);
    expect(p.kegel.level).toBe(1);
    expect(p.kegel.sessionsAtLevel).toBe(0);
    expect(p.kegel.log['2026-10-10']).toBe(3);
  });

  it('stays on the last level', () => {
    const p = emptyProgress();
    p.kegel.level = 7;
    const { next, leveledUp } = completeKegel(p, '2026-10-10');
    expect(leveledUp).toBe(false);
    expect(next.kegel.level).toBe(7);
  });

  it('moves to the next pull-up stage after 6 sessions', () => {
    let p = emptyProgress();
    for (let i = 0; i < 6; i++) p = completePull(p, `2026-10-0${i + 1}`).next;
    expect(p.pull.stage).toBe(1);
  });
});

describe('streaks', () => {
  const today = new Date(2026, 9, 10);
  it('counts back from today, or from yesterday if today is empty', () => {
    expect(streak({ '2026-10-10': 1, '2026-10-09': 2, '2026-10-07': 1 }, today)).toBe(2);
    expect(streak({ '2026-10-09': 1, '2026-10-08': 1 }, today)).toBe(2);
    expect(streak({ '2026-10-08': 1 }, today)).toBe(0);
  });
  it('counts active days in a window', () => {
    expect(activeDays({ '2026-10-10': 1, '2026-10-04': 1, '2026-10-03': 1 }, today, 7)).toBe(2);
  });
});
