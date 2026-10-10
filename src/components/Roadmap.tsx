import { vi } from '../i18n/vi';
import { Icon } from './Icon';

export interface RoadmapItem {
  title: string;
  sub?: string;
}

interface Props {
  items: RoadmapItem[];
  /** Index the user is training at. */
  current: number;
  /** Index whose details are shown below (may differ from current). */
  viewing: number;
  onView: (i: number) => void;
  /** Sessions done / needed at the current step. */
  done: number;
  need: number;
  disabled?: boolean;
  label: string;
}

/**
 * The whole program at a glance: finished steps get a check, the current one a
 * progress bar. Tapping a step only previews it; switching is a separate,
 * explicit action so a stray tap never resets progress.
 */
export function Roadmap({ items, current, viewing, onView, done, need, disabled, label }: Props) {
  return (
    <ol className={`roadmap roadmap-${items.length > 4 ? 'dense' : 'wide'}`} aria-label={label}>
      {items.map((it, i) => {
        const state = i < current ? 'past' : i === current ? 'now' : 'next';
        return (
          <li key={it.title}>
            <button
              type="button"
              className={`rm-step rm-${state}${i === viewing ? ' rm-viewing' : ''}`}
              aria-pressed={i === viewing}
              aria-current={i === current ? 'step' : undefined}
              disabled={disabled && i !== viewing}
              onClick={() => onView(i)}
            >
              <span className="rm-dot">{state === 'past' ? <Icon name="check" size={14} /> : i + 1}</span>
              <span className="rm-title">{it.title}</span>
              {it.sub && <span className="rm-sub">{it.sub}</span>}
              {state === 'now' && (
                <span className="rm-progress" aria-label={vi.roadmap.sessions(done, need)}>
                  <i style={{ width: `${Math.min(1, done / need) * 100}%` }} />
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
