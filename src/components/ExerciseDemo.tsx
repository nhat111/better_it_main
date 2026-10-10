import { useEffect, useState } from 'react';
import { DEMOS, FLOOR_Y, HIGH_BAR_Y, LOW_BAR_Y, poseAt, type Point } from '../programs/demos';
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

const line = (a: Point, b: Point) => ({ x1: a[0], y1: a[1], x2: b[0], y2: b[1] });

/** Looping stick-figure animation of one exercise (like a GIF, but crisp and theme-aware). */
export function ExerciseDemo({ exercise, name, size = 'md' }: { exercise: ExerciseKey; name: string; size?: 'sm' | 'md' }) {
  const [still] = useState(reducedMotion);
  const demo = DEMOS[exercise];
  const ms = useClock(!still);
  // Reduced motion: show the most characteristic (last) pose without moving.
  const { pose, label } = still ? { pose: demo.frames[demo.frames.length - 1].pose, label: demo.frames[demo.frames.length - 1].label } : poseAt(demo, ms);
  const p = pose;

  return (
    <figure className={`demo demo-${size}`}>
      <svg viewBox="0 0 120 140" role="img" aria-label={`Minh họa: ${name}`}>
        {demo.scene === 'high' ? (
          <g className="demo-bar">
            <line x1="22" y1={HIGH_BAR_Y} x2="98" y2={HIGH_BAR_Y} />
            <line x1="22" y1={HIGH_BAR_Y - 6} x2="22" y2={HIGH_BAR_Y + 4} />
            <line x1="98" y1={HIGH_BAR_Y - 6} x2="98" y2={HIGH_BAR_Y + 4} />
          </g>
        ) : (
          <g className="demo-bar">
            <line className="demo-floor" x1="4" y1={FLOOR_Y + 1} x2="116" y2={FLOOR_Y + 1} />
            <line x1="68" y1={LOW_BAR_Y} x2="110" y2={LOW_BAR_Y} />
            <line className="demo-post" x1="108" y1={LOW_BAR_Y} x2="108" y2={FLOOR_Y} />
          </g>
        )}
        {demo.band && <path className="demo-band" d={`M57 ${HIGH_BAR_Y} L${p.knee[0]} ${p.knee[1]} L63 ${HIGH_BAR_Y}`} />}
        <g className="demo-body">
          <line {...line(p.shoulder, p.hip)} />
          <line {...line(p.hip, p.knee)} />
          <line {...line(p.knee, p.foot)} />
          <line {...line(p.shoulder, p.head)} />
          <circle cx={p.head[0]} cy={p.head[1]} r="6.5" className="demo-head" />
          <line {...line(p.shoulder, p.elbow)} className="demo-arm" />
          <line {...line(p.elbow, p.hand)} className="demo-arm" />
        </g>
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}
