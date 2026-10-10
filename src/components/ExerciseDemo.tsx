import { useEffect, useState } from 'react';
import { CENTER_X, DEMOS, FLOOR_Y, HIGH_BAR_Y, LOW_BAR_Y, mirror, poseAt, type Point, type Pose } from '../programs/demos';
import type { ExerciseKey } from '../programs/pullup';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/** Time since mount in ms, updated every animation frame. */
function useClock(running: boolean): number {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      setMs(now - t0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
  return ms;
}

const at = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const pts = (...ps: Point[]) => ps.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

function Seg({ a, b, w, cls }: { a: Point; b: Point; w: number; cls: string }) {
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth={w} className={cls} />;
}

/** Hair as a cap over the top half of the head, rotated to where the head faces. */
function Head({ c, faceDeg = -90 }: { c: Point; faceDeg?: number }) {
  return (
    <g transform={`translate(${c[0]} ${c[1]}) rotate(${faceDeg + 90})`}>
      <circle r="8" className="d-skin d-outline" />
      <path d="M-8 -0.5 A8 8 0 0 1 8 -0.5 Q6 -4 0 -4.5 Q-6 -4 -8 -0.5Z" className="d-hair" />
    </g>
  );
}

/** One arm: short sleeve, skin, fist. */
function Arm({ s, e, h }: { s: Point; e: Point; h: Point }) {
  return (
    <g>
      <Seg a={s} b={e} w={8} cls="d-skin-s" />
      <Seg a={e} b={h} w={7} cls="d-skin-s" />
      <Seg a={s} b={at(s, e, 0.4)} w={9.5} cls="d-shirt-s" />
      <circle cx={h[0]} cy={h[1]} r="4.6" className="d-skin d-outline" />
    </g>
  );
}

/** One leg: shorts over the upper thigh, skin, shoe. */
function Leg({ hip, knee, foot, shoe }: { hip: Point; knee: Point; foot: Point; shoe: Point }) {
  return (
    <g>
      <Seg a={hip} b={knee} w={10} cls="d-skin-s" />
      <Seg a={knee} b={foot} w={8} cls="d-skin-s" />
      <Seg a={hip} b={at(hip, knee, 0.55)} w={11.5} cls="d-shorts-s" />
      <Seg a={foot} b={shoe} w={6} cls="d-shoe-s" />
    </g>
  );
}

function FrontFigure({ p, band }: { p: Pose; band?: boolean }) {
  const r = { shoulder: mirror(p.shoulder), elbow: mirror(p.elbow), hand: mirror(p.hand), hip: mirror(p.hip), knee: mirror(p.knee), foot: mirror(p.foot) };
  const neckBase: Point = [CENTER_X, (p.shoulder[1] + r.shoulder[1]) / 2 - 1];
  // Torso: shoulders a little wider than the shoulder joints, tapering to the waist.
  const torso = pts(
    [p.shoulder[0] - 2, p.shoulder[1] - 3],
    [r.shoulder[0] + 2, r.shoulder[1] - 3],
    [r.hip[0] + 3, r.hip[1] - 4],
    [p.hip[0] - 3, p.hip[1] - 4],
  );
  const shoeL: Point = [p.foot[0] - 3, p.foot[1] + 1];
  const shoeR: Point = [r.foot[0] + 3, r.foot[1] + 1];
  const ky = (p.knee[1] + r.knee[1]) / 2 + 1;
  return (
    <>
      <Leg hip={p.hip} knee={p.knee} foot={p.foot} shoe={shoeL} />
      <Leg hip={r.hip} knee={r.knee} foot={r.foot} shoe={shoeR} />
      <polygon points={torso} className="d-shirt d-round" />
      <Seg a={neckBase} b={p.head} w={7} cls="d-skin-s" />
      <Arm s={p.shoulder} e={p.elbow} h={p.hand} />
      <Arm s={r.shoulder} e={r.elbow} h={r.hand} />
      <Head c={p.head} />
      {band && (
        <path
          className="d-band"
          d={`M${CENTER_X - 3} ${HIGH_BAR_Y} L${p.knee[0] - 4} ${ky} Q${CENTER_X} ${ky + 5} ${r.knee[0] + 4} ${ky} L${CENTER_X + 3} ${HIGH_BAR_Y}`}
        />
      )}
    </>
  );
}

function SideFigure({ p }: { p: Pose }) {
  const dir = [p.head[0] - p.shoulder[0], p.head[1] - p.shoulder[1]];
  const faceDeg = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI - 90; // face toward the ceiling
  const shoe: Point = [p.foot[0] + 1, p.foot[1] - 7]; // heel on floor, toes up
  return (
    <>
      <Leg hip={p.hip} knee={p.knee} foot={p.foot} shoe={shoe} />
      <Seg a={p.shoulder} b={p.hip} w={15} cls="d-shirt-s" />
      <Seg a={p.shoulder} b={at(p.shoulder, p.head, 0.6)} w={7} cls="d-skin-s" />
      <Head c={p.head} faceDeg={faceDeg} />
      <Arm s={p.shoulder} e={p.elbow} h={p.hand} />
    </>
  );
}

/** Looping animation of one exercise (like a GIF, but crisp, light and theme-aware). */
export function ExerciseDemo({ exercise, name, size = 'md' }: { exercise: ExerciseKey; name: string; size?: 'sm' | 'md' }) {
  const [still] = useState(reducedMotion);
  const demo = DEMOS[exercise];
  const ms = useClock(!still);
  const last = demo.frames[demo.frames.length - 1];
  const { pose, label } = still ? { pose: last.pose, label: last.label } : poseAt(demo, ms);

  return (
    <figure className={`demo demo-${size}`}>
      <svg viewBox="0 0 120 140" role="img" aria-label={`Minh họa: ${name}`}>
        {demo.view === 'front' ? (
          <>
            {/* Doorway frame behind the person */}
            <path className="d-frame" d={`M14 140 V${HIGH_BAR_Y - 10} H106 V140`} />
            <FrontFigure p={pose} band={demo.band} />
            {/* Bar in front of the body, fists wrapped over it */}
            <line className="d-bar" x1="16" y1={HIGH_BAR_Y} x2="104" y2={HIGH_BAR_Y} />
            <circle cx={pose.hand[0]} cy={pose.hand[1]} r="4.6" className="d-skin d-outline" />
            <circle cx={mirror(pose.hand)[0]} cy={pose.hand[1]} r="4.6" className="d-skin d-outline" />
          </>
        ) : (
          <>
            <line className="d-floor" x1="2" y1={FLOOR_Y + 2} x2="118" y2={FLOOR_Y + 2} />
            <line className="d-post" x1="106" y1={LOW_BAR_Y} x2="106" y2={FLOOR_Y + 2} />
            <SideFigure p={pose} />
            <line className="d-bar" x1="66" y1={LOW_BAR_Y} x2="108" y2={LOW_BAR_Y} />
            <circle cx={pose.hand[0]} cy={pose.hand[1]} r="4.6" className="d-skin d-outline" />
          </>
        )}
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}
