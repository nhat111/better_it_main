import { describe, expect, it } from 'vitest';
import { BREATH_IN, BREATH_OUT, BREATHS, buildKegelPhases, KEGEL_LEVELS, kegelMinutes, kegelParts, phaseAt, phaseScale, totalSeconds } from './kegel';
import { buildPullSteps, formatDose, formatRest, STAGES } from './pullup';

describe('kegel', () => {
  const level = KEGEL_LEVELS[0];
  const phases = buildKegelPhases(level);

  it('level 1: prep, long holds, quick flicks, relaxation breathing', () => {
    expect(phases[0].type).toBe('prep');
    expect(kegelParts(level)).toEqual(['hold', 'quick', 'relaxation']);
    expect(phases.filter((p) => p.type === 'squeeze')).toHaveLength(level.reps);
    expect(phases.filter((p) => p.type === 'flick')).toHaveLength(level.quick);
    expect(phases.filter((p) => p.type === 'breatheIn')).toHaveLength(BREATHS);
    expect(phases.filter((p) => p.type === 'break')).toHaveLength(2);
    expect(phases.some((p) => p.part === 'elevator')).toBe(false);
    expect(totalSeconds(phases)).toBe(3 + 10 * 6 + 8 + 10 * 2 + 8 + BREATHS * (BREATH_IN + BREATH_OUT));
  });

  it('adds the elevator from level 3, in the right order', () => {
    const l3 = KEGEL_LEVELS[2];
    expect(kegelParts(l3)).toEqual(['hold', 'elevator', 'quick', 'relaxation']);
    const ps = buildKegelPhases(l3);
    const order = ps.map((p) => p.part).filter((p, i, a) => p && p !== a[i - 1]);
    expect(order).toEqual(['hold', 'elevator', 'quick', 'relaxation']);
    const elev = ps.filter((p) => p.part === 'elevator').map((p) => p.type);
    expect(elev.slice(0, 6)).toEqual(['up1', 'up2', 'up3', 'down2', 'down1', 'release']);
    expect(elev.filter((t) => t === 'up3')).toHaveLength(l3.elevator);
  });

  it('postures move from lying to sitting to standing', () => {
    const order = ['lying', 'sitting', 'standing'];
    const ranks = KEGEL_LEVELS.map((l) => order.indexOf(l.posture));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(ranks[0]).toBe(0);
    expect(ranks[ranks.length - 1]).toBe(2);
  });

  it('ring scale tracks squeeze intensity', () => {
    expect(phaseScale('up1', 1)).toBeCloseTo(1.04);
    expect(phaseScale('up3', 1)).toBeCloseTo(1.12);
    expect(phaseScale('down1', 1)).toBeCloseTo(1.04);
    expect(phaseScale('release', 1)).toBeCloseTo(1);
    expect(phaseScale('breatheIn', 1)).toBeCloseTo(1.1);
    expect(phaseScale('prep', 0.5)).toBe(1);
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

describe('core finisher', () => {
  it('ends every stage with core work, after all bar work', async () => {
    const { EXERCISES } = await import('./pullup');
    for (const stage of STAGES) {
      const flags = stage.exercises.map((e) => Boolean(EXERCISES[e.key].core));
      expect(flags[flags.length - 1]).toBe(true);
      expect(flags.indexOf(true)).toBe(flags.lastIndexOf(false) + 1);
      const steps = buildPullSteps(stage);
      const last = steps[steps.length - 1];
      expect(last.kind === 'work' && EXERCISES[last.exercise.key].core).toBe(true);
    }
  });
});
