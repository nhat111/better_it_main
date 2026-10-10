import type { ExerciseKey } from './pullup';

// Keyframes for the animated exercise demos, drawn in a 120 × 140 box.
//
// - 'front' view (bar exercises): the person faces the viewer, centred on
//   x = 60. Poses give the LEFT side of the body (x < 60); the renderer
//   mirrors it. Hands grip the bar at y = HIGH_BAR_Y, wider than shoulders.
// - 'side' view (inverted row): the person lies under a low bar, heels on the
//   floor, head to the right. Poses are absolute.
//
// `ExerciseDemo` eases between keyframes and loops.

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

export type View = 'front' | 'side';

export interface Demo {
  view: View;
  band?: boolean;
  frames: Keyframe[];
}

export const CENTER_X = 60;
export const HIGH_BAR_Y = 22;
export const LOW_BAR_Y = 76;
export const FLOOR_Y = 134;

/** Shift a pose vertically (body rising or sinking as one piece). */
const up = (p: Pose, dy: number, keepHands = true): Pose => {
  const m = (q: Point): Point => [q[0], q[1] - dy];
  return {
    head: m(p.head), shoulder: m(p.shoulder), elbow: m(p.elbow), hand: keepHands ? p.hand : m(p.hand),
    hip: m(p.hip), knee: m(p.knee), foot: m(p.foot),
  };
};

// Passive dead hang: arms straight, shoulders shrugged toward the ears.
const HANG: Pose = {
  head: [60, 42], shoulder: [47, 53], elbow: [42, 37], hand: [38, HIGH_BAR_Y],
  hip: [52, 89], knee: [53, 111], foot: [54, 132],
};
const HANG_BREATH: Pose = { ...up(HANG, -1), elbow: [42, 37.5] };
// Active hang / scapular pull: shoulders pulled down, neck long, body up a little.
const SCAP: Pose = {
  head: [60, 34], shoulder: [47, 48], elbow: [42, 35], hand: [38, HIGH_BAR_Y],
  hip: [52, 84], knee: [53, 106], foot: [54, 127],
};
// Halfway up: elbows flaring out and down.
const MID: Pose = {
  head: [60, 24], shoulder: [47, 39], elbow: [35, 40], hand: [38, HIGH_BAR_Y],
  hip: [52, 75], knee: [53, 97], foot: [54, 118],
};
// Chin over the bar, elbows tucked down beside the ribs.
const TOP: Pose = {
  head: [60, 11], shoulder: [47, 30], elbow: [36, 43], hand: [38, HIGH_BAR_Y],
  hip: [52, 66], knee: [53, 88], foot: [54, 109],
};
const TOP_BREATH = up(TOP, -1);

// Knees resting in a resistance band: shins fold back, so they look short from the front.
const bandLegs = (p: Pose): Pose => ({ ...p, knee: [53, p.hip[1] + 21], foot: [55, p.hip[1] + 33] });
const BAND_HANG = bandLegs(HANG);
const BAND_MID = bandLegs(MID);
const BAND_TOP = bandLegs(TOP);

// Inverted (Australian) row, side view.
const ROW_DOWN: Pose = {
  head: [92, 100], shoulder: [82, 106], elbow: [83, 91], hand: [84, LOW_BAR_Y],
  hip: [56, 117], knee: [37, 126], foot: [18, FLOOR_Y - 2],
};
const ROW_UP: Pose = {
  head: [89, 80], shoulder: [79, 88], elbow: [68, 92], hand: [84, LOW_BAR_Y],
  hip: [55, 106], knee: [36, 121], foot: [18, FLOOR_Y - 2],
};

export const DEMOS: Record<ExerciseKey, Demo> = {
  hang: {
    view: 'front',
    frames: [
      { pose: HANG, ms: 1600, hold: 300, label: 'Treo thẳng tay, thả lỏng, thở đều' },
      { pose: HANG_BREATH, ms: 1600, hold: 300, label: 'Treo thẳng tay, thả lỏng, thở đều' },
    ],
  },
  scap: {
    view: 'front',
    frames: [
      { pose: HANG, ms: 800, hold: 600, label: 'Treo thả lỏng, vai nhô lên tai' },
      { pose: SCAP, ms: 700, hold: 900, label: 'Kéo vai xuống xa tai, tay vẫn thẳng' },
    ],
  },
  row: {
    view: 'side',
    frames: [
      { pose: ROW_DOWN, ms: 1400, hold: 400, label: 'Hạ chậm, người thẳng như tấm ván' },
      { pose: ROW_UP, ms: 900, hold: 500, label: 'Kéo ngực chạm xà' },
    ],
  },
  flex: {
    view: 'front',
    frames: [
      { pose: TOP, ms: 1200, hold: 100, label: 'Giữ cằm trên xà, siết lưng và tay' },
      { pose: TOP_BREATH, ms: 1200, hold: 100, label: 'Giữ cằm trên xà, siết lưng và tay' },
    ],
  },
  neg: {
    view: 'front',
    frames: [
      { pose: TOP, ms: 900, hold: 800, label: 'Bắt đầu: cằm trên xà' },
      { pose: MID, ms: 2500, hold: 0, label: 'Hạ thật chậm… 3, 4' },
      { pose: HANG, ms: 2500, hold: 700, label: 'Hạ thật chậm… 5, duỗi hết tay' },
    ],
  },
  band: {
    view: 'front',
    band: true,
    frames: [
      { pose: BAND_HANG, ms: 1500, hold: 500, label: 'Gối đặt trong dây, hạ có kiểm soát' },
      { pose: BAND_MID, ms: 500, hold: 0, label: 'Dây đỡ một phần, kéo lên' },
      { pose: BAND_TOP, ms: 600, hold: 500, label: 'Cằm qua xà' },
    ],
  },
  pull: {
    view: 'front',
    frames: [
      { pose: HANG, ms: 1800, hold: 500, label: 'Hạ hết tay' },
      { pose: SCAP, ms: 400, hold: 100, label: 'Kéo vai xuống trước' },
      { pose: MID, ms: 500, hold: 0, label: 'Kéo khuỷu tay xuống hông' },
      { pose: TOP, ms: 500, hold: 500, label: 'Cằm qua xà' },
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
  const total = demoDuration(d);
  let t = ((ms % total) + total) % total;
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

/** Mirror a left-side point to the right side of a front-view figure. */
export const mirror = (p: Point): Point => [2 * CENTER_X - p[0], p[1]];
