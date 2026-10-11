import { useEffect, useState } from 'react';
import { vi } from '../i18n/vi';
import { diagramState, partPreview, phaseAt, totalSeconds, type KegelPart, type KegelPhaseType, type Posture } from '../programs/kegel';

/**
 * Front view of the trunk as a "canister": diaphragm on top, pelvis at the
 * bottom with the pelvic floor as a sling between the sit bones. Squeezing
 * lifts the sling; breathing in lowers the diaphragm and the sling together.
 */
export function KegelDiagram({ type, fraction, part, size = 'md' }: { type: KegelPhaseType | null; fraction: number; part?: KegelPart; size?: 'sm' | 'md' }) {
  const { lift, diaphragm } = type ? diagramState(type, fraction) : { lift: 0, diaphragm: 0 };
  const breathing = part === 'relaxation';
  const slingY = 101 - lift * 17;
  const domeY = 8 + diaphragm * 14;
  const active = lift > 0.05;
  const floors = Math.round(Math.max(0, lift) * 3);
  return (
    <svg className={`kdiagram kdiagram-${size}`} viewBox="0 -9 150 128" role="img" aria-label={vi.kegel.diagramLabel}>
      {/* Trunk wall */}
      <path className="kd-wall" d="M38 30 C34 50 36 66 40 76 M112 30 C116 50 114 66 110 76" />
      {/* Diaphragm */}
      <path className={`kd-diaphragm${breathing ? ' on' : ''}`} d={`M38 32 Q75 ${domeY} 112 32`} />
      {breathing && type === 'breatheIn' && <path className="kd-arrow" d="M75 24 v8 m-3.5 -3.5 l3.5 3.5 l3.5 -3.5" />}
      {/* Pelvis */}
      <path className="kd-bone" d="M40 72 Q36 88 54 100 L60 100 Q52 88 54 76 Z" />
      <path className="kd-bone" d="M110 72 Q114 88 96 100 L90 100 Q98 88 96 76 Z" />
      {/* Pelvic floor sling */}
      <path className={`kd-sling${active ? ' on' : ''}`} style={{ opacity: 0.55 + 0.45 * Math.max(0, lift) }} d={`M57 99 Q75 ${slingY + 4} 93 99`} />
      {active && (
        <path className="kd-arrow up" style={{ opacity: Math.min(1, lift * 1.4) }} d={`M75 ${slingY + 15} v-7 m-3.5 3.5 l3.5 -3.5 l3.5 3.5`} />
      )}
      {/* Elevator floors */}
      {part === 'elevator' &&
        [1, 2, 3].map((f) => <rect key={f} x="12" y={98 - f * 11} width="12" height="8" rx="2" className={`kd-floor${floors >= f ? ' on' : ''}`} />)}
      <text x="75" y="-1" className="kd-label">{vi.kegel.diaphragm}</text>
      <text x="75" y="116" className="kd-label">{vi.kegel.pelvicFloor}</text>
    </svg>
  );
}

/** Looping example of one part of the session. */
export function KegelPartPreview({ part }: { part: KegelPart }) {
  const [ms, setMs] = useState(0);
  const [still] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true);
  useEffect(() => {
    if (still) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      setMs(now - t0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [still]);
  const phases = partPreview(part);
  const pos = phaseAt(phases, (ms / 1000) % totalSeconds(phases)) ?? { index: 0, fraction: 0, remaining: 0 };
  const type = phases[pos.index].type;
  return (
    <figure className="kpreview">
      <KegelDiagram type={type} fraction={still ? 1 : pos.fraction} part={part} size="sm" />
      <figcaption>
        <strong>{vi.kegel.phase[type]}</strong>
        <span>{vi.kegel.partDesc[part]}</span>
      </figcaption>
    </figure>
  );
}

/** Small pictogram of the posture for a level. */
export function PostureIcon({ posture }: { posture: Posture }) {
  return (
    <svg className="posture-icon" viewBox="0 0 48 40" aria-hidden="true">
      {posture === 'lying' && (
        <>
          <line x1="2" y1="33" x2="46" y2="33" className="pi-floor" />
          <circle cx="8" cy="27" r="3.6" />
          <path d="M12 28.5 L28 29 L35 19 L41 30" />
        </>
      )}
      {posture === 'sitting' && (
        <>
          <path className="pi-floor" d="M18 27 H34 M33 27 V38 M19 27 V38" />
          <circle cx="22" cy="6" r="3.6" />
          <path d="M22 10 V24 L34 24 L34 36 M22 14 L29 20" />
        </>
      )}
      {posture === 'standing' && (
        <>
          <line x1="6" y1="38" x2="42" y2="38" className="pi-floor" />
          <circle cx="24" cy="5" r="3.6" />
          <path d="M24 9 V23 M24 23 L20 37 M24 23 L28 37 M24 12 L18 21 M24 12 L30 21" />
        </>
      )}
    </svg>
  );
}
