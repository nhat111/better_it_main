import { vi } from '../i18n/vi';
import { MUSCLES, type MuscleTargets } from '../programs/muscles';

/** "Cơ chính" / "Cơ phụ" chips for an exercise. */
export function MuscleChips({ targets, compact = false }: { targets: MuscleTargets; compact?: boolean }) {
  return (
    <div className={`muscles ${compact ? 'muscles-compact' : ''}`}>
      <div className="muscle-row">
        <span className="muscle-label">{vi.muscles.primary}</span>
        {targets.primary.map((m) => (
          <span key={m} className="mchip mchip-primary" title={MUSCLES[m].latin}>{MUSCLES[m].name}</span>
        ))}
      </div>
      {!compact && targets.secondary.length > 0 && (
        <div className="muscle-row">
          <span className="muscle-label">{vi.muscles.secondary}</span>
          {targets.secondary.map((m) => (
            <span key={m} className="mchip mchip-secondary" title={MUSCLES[m].latin}>{MUSCLES[m].name}</span>
          ))}
        </div>
      )}
    </div>
  );
}
