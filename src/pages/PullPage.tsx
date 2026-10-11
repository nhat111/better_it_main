import { Fragment, useRef, useState } from 'react';
import { ExerciseDemo } from '../components/ExerciseDemo';
import { MuscleChips } from '../components/MuscleChips';
import { MuscleMap } from '../components/MuscleMap';
import { EXERCISE_MUSCLES } from '../programs/muscles';
import { Guide } from '../components/Guide';
import { Roadmap } from '../components/Roadmap';
import { SwitchNotice } from '../components/SwitchNotice';
import { PULL_GUIDE } from '../content/guides';
import { vi } from '../i18n/vi';
import { dayKey } from '../lib/date';
import { EXERCISES, formatDose, formatRest, PULL_SESSIONS_TO_STAGE_UP, STAGES, stageMinutes, type StageExercise } from '../programs/pullup';
import { usePullSession } from '../session/usePullSession';
import { completePull, getProgress, setProgress, update, useProgress } from '../storage/progress';

const doseText = (e: StageExercise) => (e.hold ? `${e.hold} ${vi.pull.seconds}` : `${e.reps} ${vi.pull.reps}`);

export function PullPage() {
  const { pull } = useProgress();
  const [viewing, setViewing] = useState<number | null>(null);
  const viewIdx = viewing ?? pull.stage;
  const previewing = viewIdx !== pull.stage;
  const stage = STAGES[pull.stage];
  const shown = STAGES[viewIdx];
  const [result, setResult] = useState<'done' | 'stopped' | null>(null);
  const [unlocked, setUnlocked] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const runnerRef = useRef<HTMLElement>(null);

  const s = usePullSession(stage, () => {
    const { next, leveledUp } = completePull(getProgress(), dayKey(new Date()));
    setProgress(next);
    setResult('done');
    setUnlocked(leveledUp ? next.pull.stage + 1 : null);
  });

  const active = s.mode !== 'idle';
  const switchStage = () => {
    update((p) => ({ ...p, pull: { ...p.pull, stage: viewIdx, sessionsAtStage: 0 } }));
    setViewing(null);
    setPreview(null);
  };
  const view = (i: number) => {
    setViewing(i === pull.stage ? null : i);
    setPreview(null);
  };
  const last = pull.stage === STAGES.length - 1;
  const current = s.step?.exerciseIndex ?? -1;
  const step = s.step;

  let eyebrow = vi.pull.warmup;
  let title = vi.pull.ready;
  let big = '—';
  let unit = ' ';
  let cue: React.ReactNode = vi.pull.warmupCue;
  if (step?.kind === 'rest') {
    eyebrow = vi.pull.restLabel;
    title = vi.pull.rest;
    big = String(Math.ceil(s.remaining));
    unit = vi.pull.seconds;
    cue = vi.pull.restCue(EXERCISES[step.next.key].name, doseText(step.next));
  } else if (step?.kind === 'work') {
    const e = step.exercise;
    eyebrow = EXERCISES[e.key].core ? vi.pull.coreSetLabel(step.set, e.sets) : vi.pull.setLabel(step.exerciseIndex + 1, step.set, e.sets);
    title = EXERCISES[e.key].name;
    if (e.hold) {
      big = String(Math.ceil(s.remaining));
      unit = vi.pull.seconds;
    } else {
      big = String(e.reps);
      unit = e.tempo ? vi.pull.repsTempo(e.tempo) : vi.pull.reps;
    }
    cue = s.mode === 'holding' ? vi.pull.holdCue : EXERCISES[e.key].cue;
  } else if (result === 'done') {
    cue = (
      <>
        <strong className="good">{vi.pull.done}</strong> {vi.pull.doneCue}
        {unlocked && ` ${vi.pull.unlocked(unlocked)}`}
      </>
    );
  } else if (result === 'stopped') {
    cue = vi.common.stopped;
  }

  return (
    <div className="page">
      <section className="card" aria-labelledby="stage-h">
        <Roadmap
          label={vi.roadmap.pullLabel}
          items={STAGES.map((st) => ({ title: st.name, sub: st.weeks }))}
          current={pull.stage}
          viewing={viewIdx}
          onView={view}
          done={pull.sessionsAtStage}
          need={PULL_SESSIONS_TO_STAGE_UP}
          disabled={active}
        />
        <div className="row-between">
          <div>
            <div className="eyebrow">{vi.pull.eyebrow(shown.weeks)} · ~{stageMinutes(shown)} phút</div>
            <h1 id="stage-h" className="h2">
              {vi.pull.stage(viewIdx + 1, shown.name)}
            </h1>
          </div>
          <span className={`chip ${previewing ? 'muted-chip' : 'warm'}`}>
            {previewing ? vi.roadmap.preview : `${vi.roadmap.current} · ${vi.roadmap.sessions(pull.sessionsAtStage, PULL_SESSIONS_TO_STAGE_UP)}`}
          </span>
        </div>
        <ol className="exlist">
          {shown.exercises.map((e, i) => (
            <Fragment key={`${viewIdx}-${e.key}-${i}`}>
            {EXERCISES[e.key].core && !EXERCISES[shown.exercises[i - 1]?.key]?.core && (
              <li className="exdivider">{vi.pull.coreBlock}</li>
            )}
            <li className={i === current ? 'cur' : active && i < current ? 'ok' : ''}>
              <button
                type="button"
                className="exrow"
                aria-expanded={preview === i}
                onClick={() => setPreview(preview === i ? null : i)}
              >
                <span className="exnum">{i + 1}</span>
                <span className="exname">{EXERCISES[e.key].name}</span>
                <span className="exdose">{formatDose(e)}</span>
                <span className="exdesc">
                  {e.tempo ? `${vi.pull.tempo(e.tempo)} · ` : ''}
                  {e.rest ? vi.pull.restBetween(formatRest(e.rest)) : vi.pull.lastHold}
                  <span className="exshow"> · {preview === i ? vi.pull.hideDemo : vi.pull.showDemo}</span>
                </span>
              </button>
              {preview === i && (
                <div className="expreview">
                  <ExerciseDemo exercise={e.key} name={EXERCISES[e.key].name} size="sm" />
                  <MuscleMap targets={EXERCISE_MUSCLES[e.key]} label={vi.muscles.mapLabel(EXERCISES[e.key].name)} />
                  <div className="expfull">
                    <MuscleChips targets={EXERCISE_MUSCLES[e.key]} />
                  </div>
                  <p className="muted small expcue">{EXERCISES[e.key].cue}</p>
                </div>
              )}
            </li>
            </Fragment>
          ))}
        </ol>
        {previewing ? (
          <SwitchNotice what={vi.roadmap.stageName(viewIdx + 1)} done={pull.sessionsAtStage} onSwitch={switchStage} onBack={() => view(pull.stage)} />
        ) : (
          <p className="muted small">{last ? vi.pull.noteMax : vi.pull.note(pull.sessionsAtStage, PULL_SESSIONS_TO_STAGE_UP, pull.stage + 2)}</p>
        )}
      </section>

      {!previewing && <section ref={runnerRef} className={`card trainer ${s.mode === 'resting' ? 'resting' : active ? 'working' : ''}`} aria-live="polite">
        <div className="progress" aria-hidden="true">
          <i style={{ width: `${s.progress * 100}%` }} />
        </div>
        <div className="eyebrow">{eyebrow}</div>
        <div className="runner-title">{title}</div>
        {step && <MuscleChips targets={EXERCISE_MUSCLES[step.kind === 'rest' ? step.next.key : step.exercise.key]} compact />}
        <div className={`runner-row${step ? '' : ' runner-row-idle'}`}>
          {step && (
            <ExerciseDemo
              key={step.kind === 'rest' ? `next-${step.next.key}` : step.exercise.key}
              exercise={step.kind === 'rest' ? step.next.key : step.exercise.key}
              name={EXERCISES[step.kind === 'rest' ? step.next.key : step.exercise.key].name}
            />
          )}
          <div className="runner-count">
            <div className="big">{big}</div>
            <div className="muted small">{unit}</div>
          </div>
        </div>
        <div className="row center">
          {!active && (
            <button className="btn btn-lg" onClick={() => { setResult(null); setUnlocked(null); s.begin(); runnerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
              {vi.pull.begin}
            </button>
          )}
          {s.mode === 'ready' && step?.kind === 'work' && (
            <button className="btn btn-lg" onClick={s.primary}>
              {step.exercise.hold ? vi.pull.startHold : vi.pull.setDone}
            </button>
          )}
          {s.mode === 'resting' && <button className="btn ghost" onClick={s.skipRest}>{vi.pull.skipRest}</button>}
          {active && (
            <button className="btn ghost" onClick={() => { s.stop(); setResult('stopped'); }}>
              {vi.common.stop}
            </button>
          )}
        </div>
        <p className="cue">{cue}</p>
      </section>}

      <Guide items={PULL_GUIDE} />
    </div>
  );
}
