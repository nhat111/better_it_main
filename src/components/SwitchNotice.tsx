import { vi } from '../i18n/vi';

/** Shown while previewing a step other than the current one. */
export function SwitchNotice({ what, done, onSwitch, onBack }: { what: string; done: number; onSwitch: () => void; onBack: () => void }) {
  return (
    <div className="switch" role="status">
      <p>{vi.roadmap.previewing(what)}</p>
      <div className="row">
        <button type="button" className="btn" onClick={onSwitch}>{vi.roadmap.switchTo(what)}</button>
        <button type="button" className="link-btn" onClick={onBack}>{vi.roadmap.back}</button>
      </div>
      {done > 0 && <p className="muted small">{vi.roadmap.resetNote(done)}</p>}
    </div>
  );
}
