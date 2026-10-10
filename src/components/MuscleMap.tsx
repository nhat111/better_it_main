import { emphasis, type MuscleKey, type MuscleTargets } from '../programs/muscles';

// Small front + back body map with the worked muscles filled in.
// Shapes are drawn relative to each figure's centre line (dx, y).

type Shape =
  | { kind: 'ellipse'; x: number; y: number; rx: number; ry: number }
  | { kind: 'poly'; pts: [number, number][] };

interface Region {
  muscle?: MuscleKey;
  shapes: Shape[];
  /** Mirror every shape to the other side of the body. */
  both?: boolean;
}

const E = (x: number, y: number, rx: number, ry: number): Shape => ({ kind: 'ellipse', x, y, rx, ry });
const P = (...pts: [number, number][]): Shape => ({ kind: 'poly', pts });

// Neutral silhouette shared by both views.
const SILHOUETTE: Region[] = [
  { shapes: [E(0, 9, 6, 6.5)] },
  { shapes: [P([-3, 14], [3, 14], [3.5, 20], [-3.5, 20])] },
  { shapes: [P([-13, 20], [13, 20], [11, 44], [8.5, 58], [-8.5, 58], [-11, 44])] },
  { shapes: [E(-17, 34, 3.8, 9.5), E(-19.2, 52, 3.1, 9), E(-20, 63, 2.6, 2.8)], both: true },
  { shapes: [P([-9, 57], [9, 57], [10.5, 67], [-10.5, 67])] },
  { shapes: [E(-5.2, 78, 4.8, 12), E(-5, 99, 3.6, 9.5)], both: true },
];

const FRONT: Region[] = [
  { shapes: [E(-14, 23, 5, 5.5)], both: true }, // front delts
  { shapes: [P([-11, 21.5], [-0.8, 21.5], [-0.8, 31], [-8.5, 30.5])], both: true }, // chest
  { muscle: 'lats', shapes: [P([-12.6, 25], [-10.4, 24.5], [-9.6, 37], [-11.2, 41])], both: true },
  { muscle: 'core', shapes: [P([-4.8, 33], [4.8, 33], [4.6, 55.5], [-4.6, 55.5])] },
  { muscle: 'core', shapes: [P([-10.2, 37], [-6, 34], [-6, 55], [-8.4, 56])], both: true },
  { muscle: 'biceps', shapes: [E(-17, 33, 3, 6.8)], both: true },
  { muscle: 'forearms', shapes: [E(-19.2, 50.5, 2.6, 7.2)], both: true },
  { shapes: [E(-5.2, 76, 3.8, 9.5)], both: true }, // quads
];

const BACK: Region[] = [
  { muscle: 'rearDelts', shapes: [E(-14, 23, 5, 5.5)], both: true },
  { muscle: 'traps', shapes: [P([-1, 14.5], [-11.5, 20.5], [-6, 22], [-1, 19.5])], both: true },
  { muscle: 'traps', shapes: [P([-1, 30], [-4.8, 27.5], [-1, 42])], both: true },
  { muscle: 'midback', shapes: [P([-1.6, 21.2], [-8.2, 23], [-7.4, 30.5], [-1.6, 28.6])], both: true },
  { muscle: 'lats', shapes: [P([-12.2, 25.5], [-8.6, 30.5], [-2, 44], [-6.4, 53.5], [-10.4, 43])], both: true },
  { shapes: [E(-17, 33, 3, 6.8)], both: true }, // triceps
  { muscle: 'forearms', shapes: [E(-19.2, 50.5, 2.6, 7.2)], both: true },
  { shapes: [E(-5, 62.5, 4.8, 4.6)], both: true }, // glutes
  { shapes: [E(-5.2, 79, 3.8, 9.5)], both: true }, // hamstrings
];

function renderShape(s: Shape, cx: number, flip: boolean, key: string, cls: string) {
  const f = flip ? -1 : 1;
  if (s.kind === 'ellipse') return <ellipse key={key} cx={cx + f * s.x} cy={s.y} rx={s.rx} ry={s.ry} className={cls} />;
  return <polygon key={key} points={s.pts.map(([x, y]) => `${cx + f * x},${y}`).join(' ')} className={cls} />;
}

function Figure({ regions, cx, targets, base }: { regions: Region[]; cx: number; targets: MuscleTargets; base?: boolean }) {
  return (
    <g>
      {regions.flatMap((r, i) => {
        const e = r.muscle ? emphasis(targets, r.muscle) : undefined;
        const cls = base ? 'mm-base' : e === 'primary' ? 'mm-primary' : e === 'secondary' ? 'mm-secondary' : 'mm-idle';
        return r.shapes.flatMap((s, j) => [
          renderShape(s, cx, false, `${i}-${j}`, cls),
          ...(r.both ? [renderShape(s, cx, true, `${i}-${j}-m`, cls)] : []),
        ]);
      })}
    </g>
  );
}

export function MuscleMap({ targets, label }: { targets: MuscleTargets; label: string }) {
  return (
    <svg className="musclemap" viewBox="0 0 132 116" role="img" aria-label={label}>
      <Figure regions={SILHOUETTE} cx={33} targets={targets} base />
      <Figure regions={FRONT} cx={33} targets={targets} />
      <Figure regions={SILHOUETTE} cx={99} targets={targets} base />
      <Figure regions={BACK} cx={99} targets={targets} />
      <text x="33" y="114" className="mm-label">Trước</text>
      <text x="99" y="114" className="mm-label">Sau</text>
    </svg>
  );
}
