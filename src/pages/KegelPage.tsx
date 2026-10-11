import { useState } from 'react';
import { Guide } from '../components/Guide';
import { Roadmap } from '../components/Roadmap';
import { SwitchNotice } from '../components/SwitchNotice';
import { KEGEL_GUIDE } from '../content/guides';
import { vi } from '../i18n/vi';
import { dayKey } from '../lib/date';
import { BREATHS, isSqueeze, KEGEL_LEVELS, KEGEL_SESSIONS_TO_LEVEL_UP, kegelMinutes, kegelParts, phaseScale } from '../programs/kegel';
import { useKegelSession } from '../session/useKegelSession';
import { completeKegel, getProgress, setProgress, update, useProgress } from '../storage/progress';

const C = 2 * Math.PI * 45;

export function KegelPage() {
  const { kegel } = useProgress();
  const level = KEGEL_LEVELS[kegel.level];
  const [viewing, setViewing] = useState<number | null>(null);
  const viewIdx = viewing ?? kegel.level;
  const previewing = viewIdx !== kegel.level;
  const shown = KEGEL_LEVELS[viewIdx];
  const [message, setMessage] = useState<{ done: boolean; text: string } | null>(null);

  const s = useKegelSession(level, () => {
    const day = dayKey(new Date());
    const { next, leveledUp } = completeKegel(getProgress(), day);
    setProgress(next);
    setMessage({
      done: true,
      text: `${vi.kegel.doneToday(next.kegel.log[day])}${leveledUp ? ' ' + vi.kegel.unlocked(next.kegel.level + 1) : ''}`,
    });
  });

  const switchLevel = () => {
    update((p) => ({ ...p, kegel: { ...p.kegel, level: viewIdx, sessionsAtLevel: 0 } }));
    setViewing(null);
  };
  const view = (i: number) => setViewing(i === kegel.level ? null : i);
  const active = s.status !== 'idle';
  const t = s.phase?.type;
  const frac = s.pos?.fraction ?? 0;
  const scale = t ? phaseScale(t, frac) : 1;
  const parts = kegelParts(level);
  const partNames = parts.map((p) => vi.kegel.partNames[p]);
  const nextPart = s.pos ? s.phases[s.pos.index + 1]?.part : undefined;
  const posture = vi.kegel.posture[level.posture];
  const min = kegelMinutes(shown);
  const last = kegel.level === KEGEL_LEVELS.length - 1;

  return (
    <div className="page">
      <section className="card" aria-labelledby="plan-h">
        <Roadmap
          label={vi.roadmap.kegelLabel}
          items={KEGEL_LEVELS.map((l) => ({ title: l.name }))}
          current={kegel.level}
          viewing={viewIdx}
          onView={view}
          done={kegel.sessionsAtLevel}
          need={KEGEL_SESSIONS_TO_LEVEL_UP}
          disabled={active}
        />
        <div className="row-between">
          <div>
            <div className="eyebrow">{previewing ? vi.kegel.eyebrowPreview : vi.kegel.eyebrow} · ~{min} phút</div>
            <h1 id="plan-h" className="h2">
              {vi.kegel.level(viewIdx + 1, shown.name)}
            </h1>
          </div>
          <span className={`chip ${previewing ? 'muted-chip' : 'warm'}`}>
            {previewing ? vi.roadmap.preview : `${vi.roadmap.current} · ${vi.roadmap.sessions(kegel.sessionsAtLevel, KEGEL_SESSIONS_TO_LEVEL_UP)}`}
          </span>
        </div>
        <p className="posture">{vi.kegel.postureLine(vi.kegel.posture[shown.posture])}</p>
        <div className="stats4">
          <div><b>{shown.reps}×{shown.hold}s</b><span>{vi.kegel.tiles.hold}</span></div>
          <div className={shown.elevator ? '' : 'tile-off'}>
            <b>{shown.elevator ? vi.kegel.times(shown.elevator) : '—'}</b>
            <span>{shown.elevator ? vi.kegel.tiles.elevator : `${vi.kegel.tiles.elevator} ${vi.kegel.elevatorLocked}`}</span>
          </div>
          <div><b>{shown.quick}</b><span>{vi.kegel.tiles.quick}</span></div>
          <div><b>{BREATHS}</b><span>{vi.kegel.tiles.relaxation}</span></div>
        </div>
        {previewing ? (
          <SwitchNotice what={vi.roadmap.levelName(viewIdx + 1)} done={kegel.sessionsAtLevel} onSwitch={switchLevel} onBack={() => view(kegel.level)} />
        ) : (
          <p className="muted small">
            {last ? vi.kegel.noteMax(min) : vi.kegel.note(kegel.sessionsAtLevel, KEGEL_SESSIONS_TO_LEVEL_UP, kegel.level + 2, min)}
          </p>
        )}
      </section>

      {!previewing && <section className={`card trainer ${t && isSqueeze(t) ? 'squeeze' : ''}`} aria-live="polite">
        <div className="ring">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle className="ring-track" cx="50" cy="50" r="45" />
            <circle className="ring-prog" cx="50" cy="50" r="45" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
          </svg>
          <div className="ring-core" style={{ transform: `scale(${scale.toFixed(3)})` }}>
            <div className="phase">{t ? vi.kegel.phase[t] : vi.kegel.ready}</div>
            <div className="count">{s.pos ? Math.ceil(s.pos.remaining) : '—'}</div>
          </div>
        </div>
        <p className="cue">
          {s.status === 'paused' ? (
            vi.kegel.paused
          ) : t ? (
            t === 'break' && nextPart ? vi.kegel.breakCue(vi.kegel.partNames[nextPart]) : vi.kegel.cue[t]
          ) : message?.done ? (
            <>
              <strong className="good">{vi.kegel.done}</strong> {message.text}
            </>
          ) : (
            vi.kegel.readyCue(posture)
          )}
        </p>
        <p className="meta">
          {s.phase?.part ? vi.kegel.partMeta(parts.indexOf(s.phase.part) + 1, parts.length, vi.kegel.partNames[s.phase.part], s.phase.rep!, s.phase.of!) : active ? ' ' : vi.kegel.partsMeta(partNames)}
        </p>
        <div className="row center">
          {!active && (
            <button className="btn btn-lg" onClick={() => { setMessage(null); s.start(); }}>
              {message?.done ? vi.kegel.again : vi.common.start}
            </button>
          )}
          {s.status === 'running' && <button className="btn ghost" onClick={s.pause}>{vi.common.pause}</button>}
          {s.status === 'paused' && <button className="btn" onClick={s.resume}>{vi.common.resume}</button>}
          {active && (
            <button className="btn ghost" onClick={() => { s.stop(); setMessage({ done: false, text: '' }); }}>
              {vi.common.stop}
            </button>
          )}
        </div>
        {message && !message.done && !active && <p className="muted small">{vi.common.stopped}</p>}
      </section>}

      <Guide items={KEGEL_GUIDE} />
    </div>
  );
}
