import { useEffect, useState } from 'react';
import { CENTER_X, DEMOS, FLOOR_Y, HIGH_BAR_Y, LOW_BAR_Y, mirror, poseAt, type Point, type Pose } from '../programs/demos';
import { emphasis, EXERCISE_MUSCLES, type MuscleKey, type MuscleTargets } from '../programs/muscles';
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
const add = (a: Point, v: Point, k = 1): Point => [a[0] + v[0] * k, a[1] + v[1] * k];
const pts = (...ps: Point[]) => ps.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const angle = (a: Point, b: Point) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
const dist = (a: Point, b: Point) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** Tint class for a muscle: strong for primary, light for secondary, none otherwise. */
const tintOf = (t: MuscleTargets, m: MuscleKey) => {
  const e = emphasis(t, m);
  return e === 'primary' ? 'd-tint-1' : e === 'secondary' ? 'd-tint-2' : null;
};

function Seg({ a, b, w, cls }: { a: Point; b: Point; w: number; cls: string }) {
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth={w} className={cls} />;
}

/** Hair as a cap over the top half of the head, rotated to where the head faces. */
function Head({ c, faceDeg = -90 }: { c: Point; faceDeg?: number }) {
  return (
    <g transform={`translate(${c[0]} ${c[1]}) rotate(${faceDeg + 90})`}>
      <circle r="7.5" className="d-skin d-outline" />
      <path d="M-7.5 -0.5 A7.5 7.5 0 0 1 7.5 -0.5 Q5.5 -3.6 0 -4 Q-5.5 -3.6 -7.5 -0.5Z" className="d-hair" />
    </g>
  );
}

/** Upper arm with a biceps bulge, forearm, fist; worked muscles tinted. */
function Arm({ s, e, h, t }: { s: Point; e: Point; h: Point; t: MuscleTargets }) {
  const mid = at(s, e, 0.52);
  const len = dist(s, e);
  const bi = tintOf(t, 'biceps');
  const fa = tintOf(t, 'forearms');
  return (
    <g>
      <Seg a={s} b={e} w={8} cls="d-skin-s" />
      <ellipse cx={mid[0]} cy={mid[1]} rx={len * 0.46} ry={4.6} transform={`rotate(${angle(s, e)} ${mid[0]} ${mid[1]})`} className="d-skin d-outline" />
      {bi && <ellipse cx={mid[0]} cy={mid[1]} rx={len * 0.38} ry={3.4} transform={`rotate(${angle(s, e)} ${mid[0]} ${mid[1]})`} className={bi} />}
      <Seg a={e} b={h} w={8} cls="d-skin-s" />
      {fa && <Seg a={at(e, h, 0.12)} b={at(e, h, 0.78)} w={6} cls={`${fa}-s`} />}
      <circle cx={e[0]} cy={e[1]} r="3.9" className="d-skin" />
      <circle cx={h[0]} cy={h[1]} r="4.8" className="d-skin d-outline" />
    </g>
  );
}

/** One leg: shorts over the upper thigh, muscular thigh and calf, shoe. */
function Leg({ hip, knee, foot, shoe }: { hip: Point; knee: Point; foot: Point; shoe: Point }) {
  return (
    <g>
      <Seg a={hip} b={knee} w={11.5} cls="d-skin-s" />
      <Seg a={knee} b={foot} w={8} cls="d-skin-s" />
      <Seg a={at(knee, foot, 0.15)} b={at(knee, foot, 0.5)} w={9.5} cls="d-skin-s" />
      <Seg a={hip} b={at(hip, knee, 0.55)} w={13} cls="d-shorts-s" />
      <Seg a={foot} b={shoe} w={6} cls="d-shoe-s" />
    </g>
  );
}

function FrontFigure({ p, band, t }: { p: Pose; band?: boolean; t: MuscleTargets }) {
  const R = { shoulder: mirror(p.shoulder), elbow: mirror(p.elbow), hand: mirror(p.hand), hip: mirror(p.hip), knee: mirror(p.knee), foot: mirror(p.foot) };
  const sL = p.shoulder;
  const sR = R.shoulder;
  const cx = CENTER_X;
  const sy = (sL[1] + sR[1]) / 2;
  const waistY = p.hip[1] - 5;
  // V-taper torso: broad at the shoulders/armpits, narrow at the waist.
  const torso = pts(
    [sL[0] - 1, sL[1] - 4], [sR[0] + 1, sR[1] - 4],
    [sR[0] + 1.5, sR[1] + 9], [R.hip[0] + 1.5, waistY],
    [p.hip[0] - 1.5, waistY], [sL[0] - 1.5, sL[1] + 9],
  );
  const neckTop: Point = [cx, p.head[1] + 5];
  const latL = pts([sL[0] - 1.2, sL[1] + 7], [sL[0] + 5.5, sL[1] + 9], [p.hip[0] + 1.5, waistY - 8], [p.hip[0] - 1.2, waistY - 1]);
  const latR = pts([sR[0] + 1.2, sR[1] + 7], [sR[0] - 5.5, sR[1] + 9], [R.hip[0] - 1.5, waistY - 8], [R.hip[0] + 1.2, waistY - 1]);
  const trapL = pts([cx - 3, sy - 9], [sL[0] + 2, sL[1] - 3.5], [cx - 1, sy - 1]);
  const trapR = pts([cx + 3, sy - 9], [sR[0] - 2, sR[1] - 3.5], [cx + 1, sy - 1]);
  const absTop = sy + 13;
  const absBot = waistY - 2;
  const lats = tintOf(t, 'lats');
  const traps = tintOf(t, 'traps');
  const core = tintOf(t, 'core');
  const shoeL: Point = [p.foot[0] - 3, p.foot[1] + 1];
  const shoeR: Point = [R.foot[0] + 3, R.foot[1] + 1];
  const ky = (p.knee[1] + R.knee[1]) / 2 + 1;
  return (
    <>
      <Leg hip={p.hip} knee={p.knee} foot={p.foot} shoe={shoeL} />
      <Leg hip={R.hip} knee={R.knee} foot={R.foot} shoe={shoeR} />
      <Seg a={neckTop} b={[cx, sy - 2]} w={8.5} cls="d-skin-s" />
      <polygon points={trapL} className="d-skin d-outline" />
      <polygon points={trapR} className="d-skin d-outline" />
      {traps && <polygon points={trapL} className={traps} />}
      {traps && <polygon points={trapR} className={traps} />}
      <polygon points={torso} className="d-skin d-outline d-round" />
      {lats && <polygon points={latL} className={lats} />}
      {lats && <polygon points={latR} className={lats} />}
      {core && <rect x={cx - 5.5} y={absTop - 1} width="11" height={absBot - absTop + 2} rx="3" className={core} />}
      {/* Chest and abs definition */}
      <path className="d-line" d={`M${cx} ${sy + 1} Q${sL[0] + 5} ${sy - 1} ${sL[0] + 3} ${sy + 9} Q${cx - 5} ${sy + 12.5} ${cx} ${sy + 10.5}`} />
      <path className="d-line" d={`M${cx} ${sy + 1} Q${sR[0] - 5} ${sy - 1} ${sR[0] - 3} ${sy + 9} Q${cx + 5} ${sy + 12.5} ${cx} ${sy + 10.5}`} />
      <path
        className="d-line"
        d={[0.3, 0.55, 0.8]
          .map((k) => absTop + (absBot - absTop) * k)
          .map((y) => `M${cx - 4.5} ${y.toFixed(1)} H${cx + 4.5}`)
          .join(' ') + ` M${cx} ${absTop} V${absBot}`}
      />
      {/* Deltoid caps, then arms over them */}
      <circle cx={sL[0]} cy={sL[1]} r="5" className="d-skin d-outline" />
      <circle cx={sR[0]} cy={sR[1]} r="5" className="d-skin d-outline" />
      <Arm s={sL} e={p.elbow} h={p.hand} t={t} />
      <Arm s={sR} e={R.elbow} h={R.hand} t={t} />
      <Head c={p.head} />
      {band && (
        <path
          className="d-band"
          d={`M${cx - 3} ${HIGH_BAR_Y} L${p.knee[0] - 4} ${ky} Q${cx} ${ky + 5} ${R.knee[0] + 4} ${ky} L${cx + 3} ${HIGH_BAR_Y}`}
        />
      )}
    </>
  );
}

function SideFigure({ p, t, prone }: { p: Pose; t: MuscleTargets; prone?: boolean }) {
  const faceDeg = angle(p.shoulder, p.head) - 90;
  const shoe: Point = p.toe ?? [p.foot[0] + 1, p.foot[1] - 7]; // default: heel on floor, toes up
  const len = dist(p.shoulder, p.hip);
  const u: Point = [(p.hip[0] - p.shoulder[0]) / len, (p.hip[1] - p.shoulder[1]) / len];
  // Normal pointing to the floor; the back faces it when lying face up, the belly when prone.
  const down: Point = u[0] > 0 ? [-u[1], u[0]] : [u[1], -u[0]];
  const back: Point = prone ? [-down[0], -down[1]] : down;
  const belly: Point = [-back[0], -back[1]];
  const backTint = tintOf(t, 'midback') ?? tintOf(t, 'lats');
  const core = tintOf(t, 'core');
  const glutes = tintOf(t, 'glutes');
  const gl = add(p.hip, back, 3);
  return (
    <>
      <Leg hip={p.hip} knee={p.knee} foot={p.foot} shoe={shoe} />
      <Seg a={add(p.shoulder, back, 1)} b={add(p.hip, back, 0.5)} w={17} cls="d-skin-s" />
      <Seg a={p.shoulder} b={at(p.shoulder, p.head, 0.6)} w={8} cls="d-skin-s" />
      {backTint && <Seg a={add(p.shoulder, back, 6)} b={add(at(p.shoulder, p.hip, 0.75), back, 5)} w={7} cls={`${backTint}-s`} />}
      {glutes && <circle cx={gl[0]} cy={gl[1]} r="5" className={glutes} />}
      {core && <Seg a={add(at(p.shoulder, p.hip, 0.35), belly, 5)} b={add(at(p.shoulder, p.hip, 0.95), belly, 4)} w={4} cls={`${core}-s`} />}
      <Head c={p.head} faceDeg={faceDeg} />
      <Arm s={p.shoulder} e={p.elbow} h={p.hand} t={t} />
      {/* Far arm in front (side plank: top hand on the hip) */}
      {p.elbow2 && p.hand2 && <Arm s={p.shoulder} e={p.elbow2} h={p.hand2} t={t} />}
      <circle cx={p.shoulder[0]} cy={p.shoulder[1]} r="5.8" className="d-skin d-outline" />
    </>
  );
}

/** Looping animation of one exercise with the worked muscles tinted. */
export function ExerciseDemo({ exercise, name, size = 'md' }: { exercise: ExerciseKey; name: string; size?: 'sm' | 'md' }) {
  const [still] = useState(reducedMotion);
  const demo = DEMOS[exercise];
  const targets = EXERCISE_MUSCLES[exercise];
  const ms = useClock(!still);
  const last = demo.frames[demo.frames.length - 1];
  const { pose, label } = still ? { pose: last.pose, label: last.label } : poseAt(demo, ms);

  return (
    <figure className={`demo demo-${size}`}>
      <svg viewBox={demo.view === 'floor' ? '10 61 100 117' : '0 0 120 140'} role="img" aria-label={`Minh họa: ${name}`}>
        {demo.view === 'front' ? (
          <>
            <path className="d-frame" d={`M14 140 V${HIGH_BAR_Y - 10} H106 V140`} />
            <FrontFigure p={pose} band={demo.band} t={targets} />
            <line className="d-bar" x1="16" y1={HIGH_BAR_Y} x2="104" y2={HIGH_BAR_Y} />
            <circle cx={pose.hand[0]} cy={pose.hand[1]} r="4.8" className="d-skin d-outline" />
            <circle cx={mirror(pose.hand)[0]} cy={pose.hand[1]} r="4.8" className="d-skin d-outline" />
          </>
        ) : demo.view === 'floor' ? (
          <>
            <line className="d-floor" x1="2" y1={FLOOR_Y + 2} x2="118" y2={FLOOR_Y + 2} />
            <SideFigure p={pose} t={targets} prone={demo.prone} />
            <circle cx={pose.hand[0]} cy={pose.hand[1]} r="4.8" className="d-skin d-outline" />
          </>
        ) : (
          <>
            <line className="d-floor" x1="2" y1={FLOOR_Y + 2} x2="118" y2={FLOOR_Y + 2} />
            <line className="d-post" x1="106" y1={LOW_BAR_Y} x2="106" y2={FLOOR_Y + 2} />
            <SideFigure p={pose} t={targets} />
            <line className="d-bar" x1="66" y1={LOW_BAR_Y} x2="108" y2={LOW_BAR_Y} />
            <circle cx={pose.hand[0]} cy={pose.hand[1]} r="4.8" className="d-skin d-outline" />
          </>
        )}
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}
