import type { ExerciseKey } from './pullup';

// Side-view stick-figure keyframes for each pull-up exercise, drawn in a
// 120 × 140 box. The figure faces right; on the high bar the hands sit at
// (60, 20). `ExerciseDemo` interpolates between keyframes and loops.

export type Point = readonly [number, number];

export interface Pose {
  head: Point;
  shoulder: Point;
  elbow: Point;
  hand: Point;
  hip: Point;
  knee: Point;
  foot: Point;
}

export interface Keyframe {
  pose: Pose;
  /** Milliseconds to move from the previous keyframe into this one. */
  ms: number;
  /** Milliseconds to stay on this pose. */
  hold: number;
  /** Short caption shown while moving into / holding this pose. */
  label: string;
}

export type Scene = 'high' | 'low';

export interface Demo {
  scene: Scene;
  band?: boolean;
  frames: Keyframe[];
}

export const HIGH_BAR_Y = 20;
export const LOW_BAR_Y = 74;
export const FLOOR_Y = 136;

const HANG: Pose = {
  head: [67, 47], shoulder: [59, 55], elbow: [60, 37], hand: [60, 20], hip: [57, 87], knee: [58, 111], foot: [56, 134],
};
const SWAY: Pose = { ...HANG, hip: [58, 87], knee: [60, 111], foot: [59, 134] };
const SCAP: Pose = {
  head: [68, 42], shoulder: [60, 50], elbow: [60, 34], hand: [60, 20], hip: [57, 82], knee: [58, 106], foot: [56, 129],
};
const TOP: Pose = {
  head: [51, 9], shoulder: [51, 28], elbow: [68, 35], hand: [60, 20], hip: [49, 60], knee: [51, 84], foot: [49, 107],
};
const TOP_BOB: Pose = { ...TOP, head: [51, 10], shoulder: [51, 29], hip: [49, 61], knee: [51, 85], foot: [49, 108] };

// Knee hooked in a resistance band, shin folded back.
const BAND_HANG: Pose = { ...HANG, knee: [63, 108], foot: [50, 121] };
const BAND_TOP: Pose = { ...TOP, knee: [55, 81], foot: [42, 94] };

// Inverted (Australian) row under a low bar, heels on the floor.
const ROW_DOWN: Pose = {
  head: [91, 100], shoulder: [82, 104], elbow: [83, 89], hand: [84, 74], hip: [56, 116], knee: [37, 125], foot: [18, 134],
};
const ROW_UP: Pose = {
  head: [90, 79], shoulder: [80, 86], elbow: [92, 92], hand: [84, 74], hip: [55, 105], knee: [36, 120], foot: [18, 134],
};

export const DEMOS: Record<ExerciseKey, Demo> = {
  hang: {
    scene: 'high',
    frames: [
      { pose: HANG, ms: 1600, hold: 200, label: 'Treo thẳng tay, thả lỏng, thở đều' },
      { pose: SWAY, ms: 1600, hold: 200, label: 'Treo thẳng tay, thả lỏng, thở đều' },
    ],
  },
  scap: {
    scene: 'high',
    frames: [
      { pose: HANG, ms: 700, hold: 500, label: 'Treo thẳng tay' },
      { pose: SCAP, ms: 600, hold: 900, label: 'Kéo bả vai xuống, tay vẫn thẳng' },
    ],
  },
  row: {
    scene: 'low',
    frames: [
      { pose: ROW_DOWN, ms: 1400, hold: 400, label: 'Hạ chậm, người thẳng' },
      { pose: ROW_UP, ms: 900, hold: 500, label: 'Kéo ngực chạm xà' },
    ],
  },
  flex: {
    scene: 'high',
    frames: [
      { pose: TOP, ms: 1200, hold: 0, label: 'Giữ cằm trên xà, siết lưng' },
      { pose: TOP_BOB, ms: 1200, hold: 0, label: 'Giữ cằm trên xà, siết lưng' },
    ],
  },
  neg: {
    scene: 'high',
    frames: [
      { pose: TOP, ms: 900, hold: 700, label: 'Bắt đầu với cằm trên xà' },
      { pose: HANG, ms: 5000, hold: 700, label: 'Hạ thật chậm, đếm 5 giây' },
    ],
  },
  band: {
    scene: 'high',
    band: true,
    frames: [
      { pose: BAND_HANG, ms: 1500, hold: 400, label: 'Hạ có kiểm soát' },
      { pose: BAND_TOP, ms: 1100, hold: 400, label: 'Gối trong dây, kéo cằm qua xà' },
    ],
  },
  pull: {
    scene: 'high',
    frames: [
      { pose: HANG, ms: 1800, hold: 500, label: 'Hạ hết tay' },
      { pose: SCAP, ms: 400, hold: 0, label: 'Kéo bả vai trước' },
      { pose: TOP, ms: 900, hold: 500, label: 'Kéo cằm qua xà' },
    ],
  },
};

export function demoDuration(d: Demo): number {
  return d.frames.reduce((a, f) => a + f.ms + f.hold, 0);
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const lerp = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

function mix(a: Pose, b: Pose, t: number): Pose {
  return {
    head: lerp(a.head, b.head, t),
    shoulder: lerp(a.shoulder, b.shoulder, t),
    elbow: lerp(a.elbow, b.elbow, t),
    hand: lerp(a.hand, b.hand, t),
    hip: lerp(a.hip, b.hip, t),
    knee: lerp(a.knee, b.knee, t),
    foot: lerp(a.foot, b.foot, t),
  };
}

/**
 * Pose and caption at `ms` into the loop. Each keyframe is entered from the
 * previous one (the first from the last), so the loop is seamless.
 */
export function poseAt(d: Demo, ms: number): { pose: Pose; label: string } {
  let t = ((ms % demoDuration(d)) + demoDuration(d)) % demoDuration(d);
  const n = d.frames.length;
  for (let i = 0; i < n; i++) {
    const f = d.frames[i];
    const prev = d.frames[(i - 1 + n) % n];
    if (t < f.ms) return { pose: mix(prev.pose, f.pose, ease(t / f.ms)), label: f.label };
    t -= f.ms;
    if (t < f.hold) return { pose: f.pose, label: f.label };
    t -= f.hold;
  }
  const last = d.frames[n - 1];
  return { pose: last.pose, label: last.label };
}
