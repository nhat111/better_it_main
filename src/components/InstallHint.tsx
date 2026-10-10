import { vi } from '../i18n/vi';
import { isIos, isStandalone, promptInstall, useCanPromptInstall } from '../install';
import { update, useProgress } from '../storage/progress';
import { Icon } from './Icon';

/** Home card suggesting installing the PWA; hidden once installed or closed. */
export function InstallHint() {
  const { prefs } = useProgress();
  const canPrompt = useCanPromptInstall();
  const ios = isIos();
  if (prefs.installHintDismissed || isStandalone() || (!canPrompt && !ios)) return null;

  const dismiss = () => update((p) => ({ ...p, prefs: { ...p.prefs, installHintDismissed: true } }));

  return (
    <section className="card install">
      <span className="install-icon">
        <Icon name="download" />
      </span>
      <div className="stack-xs">
        <h2 className="h3">{vi.install.title}</h2>
        <p className="muted small">{ios && !canPrompt ? vi.install.ios : vi.install.desc}</p>
        <div className="row">
          {canPrompt && (
            <button type="button" className="btn" onClick={() => void promptInstall()}>
              {vi.install.button}
            </button>
          )}
          <button type="button" className="link-btn small" onClick={dismiss}>
            {vi.install.close}
          </button>
        </div>
      </div>
    </section>
  );
}
