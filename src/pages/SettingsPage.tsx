import { useRef, useState } from 'react';
import { vi } from '../i18n/vi';
import { dayKey } from '../lib/date';
import { checkForUpdate } from '../registerSW';
import { exportProgress, importProgress, resetProgress, update, useProgress } from '../storage/progress';

export function SettingsPage() {
  const { prefs } = useProgress();
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setSound = (sound: boolean) => update((p) => ({ ...p, prefs: { ...p.prefs, sound } }));

  const download = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `manfit-${dayKey(new Date())}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      importProgress(await file.text());
      setNotice({ ok: true, text: vi.settings.imported });
    } catch {
      setNotice({ ok: false, text: vi.settings.importError });
    }
  };

  const check = async () => {
    const r = await checkForUpdate();
    if (r === 'latest') setNotice({ ok: true, text: vi.settings.latest });
    if (r === 'unavailable') setNotice({ ok: false, text: vi.settings.unavailable });
  };

  return (
    <div className="page">
      <h1 className="h1">{vi.settings.title}</h1>

      <section className="card stack">
        <div className="row-between">
          <span>{vi.settings.theme}</span>
          <div className="segmented" role="group" aria-label={vi.settings.theme}>
            {(['auto', 'light', 'dark'] as const).map((t) => (
              <button key={t} aria-pressed={prefs.theme === t} onClick={() => update((p) => ({ ...p, prefs: { ...p.prefs, theme: t } }))}>
                {t === 'auto' ? vi.settings.themeAuto : t === 'light' ? vi.settings.themeLight : vi.settings.themeDark}
              </button>
            ))}
          </div>
        </div>
        <p className="muted small">{vi.settings.themeHelp}</p>
        <div className="row-between">
          <span>{vi.settings.sound}</span>
          <div className="segmented" role="group" aria-label={vi.settings.sound}>
            <button aria-pressed={prefs.sound} onClick={() => setSound(true)}>{vi.settings.soundOn}</button>
            <button aria-pressed={!prefs.sound} onClick={() => setSound(false)}>{vi.settings.soundOff}</button>
          </div>
        </div>
      </section>

      <section className="card stack">
        <h2 className="h2">{vi.settings.dataTitle}</h2>
        <p className="muted small">{vi.settings.dataHelp}</p>
        <div className="row">
          <button className="btn" onClick={download}>{vi.settings.exportBtn}</button>
          <button className="btn ghost" onClick={() => fileRef.current?.click()}>{vi.settings.importBtn}</button>
          <input ref={fileRef} id="import-file" type="file" accept="application/json,.json" hidden onChange={(e) => void onFile(e)} />
        </div>
        {!confirmReset ? (
          <button className="link-btn danger" onClick={() => setConfirmReset(true)}>{vi.settings.reset}</button>
        ) : (
          <div className="confirm" role="alertdialog" aria-label={vi.settings.resetConfirm}>
            <p>{vi.settings.resetConfirm}</p>
            <div className="row">
              <button
                className="btn danger"
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                  setNotice({ ok: true, text: vi.settings.resetDone });
                }}
              >
                {vi.settings.resetYes}
              </button>
              <button className="btn ghost" onClick={() => setConfirmReset(false)}>{vi.settings.resetNo}</button>
            </div>
          </div>
        )}
        {notice && <p className={notice.ok ? 'good small' : 'error small'} role="status">{notice.text}</p>}
      </section>

      <section className="card row-between">
        <div>
          <div className="eyebrow">{vi.settings.version}</div>
          <div className="small mono">{__APP_VERSION__}</div>
        </div>
        <button className="btn ghost" onClick={() => void check()}>{vi.settings.checkUpdate}</button>
      </section>
    </div>
  );
}
