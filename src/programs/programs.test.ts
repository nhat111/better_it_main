import { describe, expect, it } from 'vitest';
import { buildKegelPhases, KEGEL_LEVELS, kegelMinutes, phaseAt, totalSeconds } from './kegel';
import { buildPullSteps, formatDose, formatRest, STAGES } from './pullup';

describe('kegel', () => {
  const level = KEGEL_LEVELS[0];
  const phases = buildKegelPhases(level);

  it('builds prep, long holds, a break, then quick flicks', () => {
    expect(phases[0].type).toBe('prep');
    expect(phases.filter((p) => p.type === 'squeeze')).toHaveLength(level.reps);
    expect(phases.filter((p) => p.type === 'flick')).toHaveLength(level.quick);
    expect(phases.findIndex((p) => p.type === 'break')).toBe(1 + level.reps * 2);
    expect(totalSeconds(phases)).toBe(3 + 10 * 6 + 8 + 10 * 2);
  });

  it('locates the phase for an elapsed time', () => {
    expect(phaseAt(phases, 0)).toEqual({ index: 0, remaining: 3, fraction: 0 });
    expect(phaseAt(phases, 4.5)).toMatchObject({ index: 1, remaining: 1.5, fraction: 0.5 });
    expect(phaseAt(phases, totalSeconds(phases))).toBeNull();
  });

  it('gets longer at higher levels', () => {
    expect(kegelMinutes(KEGEL_LEVELS[7])).toBeGreaterThan(kegelMinutes(KEGEL_LEVELS[0]));
  });
});

describe('pull-up', () => {
  it('puts a rest between sets but none at the very end', () => {
    for (const stage of STAGES) {
      const steps = buildPullSteps(stage);
      const work = steps.filter((s) => s.kind === 'work');
      expect(work).toHaveLength(stage.exercises.reduce((a, e) => a + e.sets, 0));
      expect(steps[0].kind).toBe('work');
      expect(steps[steps.length - 1].kind).toBe('work');
      steps.forEach((s, i) => {
        if (s.kind === 'rest') expect(steps[i + 1].kind).toBe('work');
      });
    }
  });

  it('rest steps announce the exercise that follows', () => {
    const steps = buildPullSteps(STAGES[0]);
    const lastRestOfFirst = steps[2 * STAGES[0].exercises[0].sets - 1];
    expect(lastRestOfFirst).toMatchObject({ kind: 'rest', next: { key: 'scap' } });
  });

  it('every exercise has exactly one of reps or hold', () => {
    for (const stage of STAGES) for (const e of stage.exercises) expect(Boolean(e.reps) !== Boolean(e.hold)).toBe(true);
  });

  it('formats doses and rests', () => {
    expect(formatDose(STAGES[0].exercises[0])).toBe('3×20s');
    expect(formatDose(STAGES[0].exercises[1])).toBe('3×8');
    expect(formatRest(90)).toBe('90s');
    expect(formatRest(120)).toBe('2 phút');
  });
});
