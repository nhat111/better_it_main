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

describe('exercise demos', () => {
  it('has a looping demo for every exercise', async () => {
    const { DEMOS, demoDuration, poseAt } = await import('./demos');
    const { EXERCISES } = await import('./pullup');
    for (const key of Object.keys(EXERCISES) as (keyof typeof EXERCISES)[]) {
      const d = DEMOS[key];
      expect(d.frames.length).toBeGreaterThan(1);
      const total = demoDuration(d);
      // Seamless loop: the start and the end of the cycle are the same pose.
      expect(poseAt(d, 0).pose.head[1]).toBeCloseTo(poseAt(d, total - 0.001).pose.head[1], 1);
      // Every keyframe's own pose is reached during its hold.
      let t = 0;
      for (const f of d.frames) {
        t += f.ms;
        expect(poseAt(d, t + 1).pose).toEqual(f.hold > 1 ? f.pose : expect.anything());
        t += f.hold;
      }
    }
  });
});

describe('muscles', () => {
  it('lists primary muscles for every exercise without overlap', async () => {
    const { EXERCISE_MUSCLES, MUSCLES } = await import('./muscles');
    const { EXERCISES } = await import('./pullup');
    for (const key of Object.keys(EXERCISES) as (keyof typeof EXERCISES)[]) {
      const t = EXERCISE_MUSCLES[key];
      expect(t.primary.length).toBeGreaterThan(0);
      for (const m of [...t.primary, ...t.secondary]) expect(MUSCLES[m]).toBeDefined();
      expect(t.primary.filter((m) => t.secondary.includes(m))).toEqual([]);
    }
  });
});
