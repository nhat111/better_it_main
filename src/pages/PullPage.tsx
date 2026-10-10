import { useState } from 'react';
import { ExerciseDemo } from '../components/ExerciseDemo';
import { MuscleChips } from '../components/MuscleChips';
import { MuscleMap } from '../components/MuscleMap';
import { EXERCISE_MUSCLES } from '../programs/muscles';
import { Guide } from '../components/Guide';
import { Icon } from '../components/Icon';
import { PULL_GUIDE } from '../content/guides';
import { vi } from '../i18n/vi';
import { dayKey } from '../lib/date';
import { EXERCISES, formatDose, formatRest, PULL_SESSIONS_TO_STAGE_UP, STAGES, stageMinutes, type StageExercise } from '../programs/pullup';
import { usePullSession } from '../session/usePullSession';
import { completePull, getProgress, setProgress, update, useProgress } from '../storage/progress';

const doseText = (e: StageExercise) => (e.hold ? `${e.hold} ${vi.pull.seconds}` : `${e.reps} ${vi.pull.reps}`);

export function PullPage() {
  const { pull } = useProgress();
  const stage = STAGES[pull.stage];
  const [result, setResult] = useState<'done' | 'stopped' | null>(null);
  const [unlocked, setUnlocked] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);

  const s = usePullSession(stage, () => {
    const { next, leveledUp } = completePull(getProgress(), dayKey(new Date()));
    setProgress(next);
    setResult('done');
    setUnlocked(leveledUp ? next.pull.stage + 1 : null);
  });

  const active = s.mode !== 'idle';
  const setStage = (n: number) => update((p) => ({ ...p, pull: { ...p.pull, stage: n, sessionsAtStage: 0 } }));
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
    eyebrow = vi.pull.setLabel(step.exerciseIndex + 1, step.set, e.sets);
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
        <div className="row-between">
          <div>
            <div className="eyebrow">{vi.pull.eyebrow(stage.weeks)} · ~{stageMinutes(stage)} phút</div>
            <h1 id="stage-h" className="h2">
              {vi.pull.stage(pull.stage + 1, stage.name)}
            </h1>
          </div>
          <div className="row">
            <button className="icon-btn bordered" aria-label={vi.pull.stageDown} disabled={active || pull.stage === 0} onClick={() => setStage(pull.stage - 1)}>
              <Icon name="minus" size={18} />
            </button>
            <button className="icon-btn bordered" aria-label={vi.pull.stageUp} disabled={active || last} onClick={() => setStage(pull.stage + 1)}>
              <Icon name="plus" size={18} />
            </button>
          </div>
        </div>
        <ol className="exlist">
          {stage.exercises.map((e, i) => (
            <li key={`${e.key}-${i}`} className={i === current ? 'cur' : active && i < current ? 'ok' : ''}>
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
                  <div className="stack-xs">
                    <MuscleMap targets={EXERCISE_MUSCLES[e.key]} label={vi.muscles.mapLabel(EXERCISES[e.key].name)} />
                    <MuscleChips targets={EXERCISE_MUSCLES[e.key]} />
                  </div>
                  <p className="muted small expcue">{EXERCISES[e.key].cue}</p>
                </div>
              )}
            </li>
          ))}
        </ol>
        <p className="muted small">{last ? vi.pull.noteMax : vi.pull.note(pull.sessionsAtStage, PULL_SESSIONS_TO_STAGE_UP, pull.stage + 2)}</p>
      </section>

      <section className={`card trainer ${s.mode === 'resting' ? 'resting' : active ? 'working' : ''}`} aria-live="polite">
        <div className="progress" aria-hidden="true">
          <i style={{ width: `${s.progress * 100}%` }} />
        </div>
        <div className="eyebrow">{eyebrow}</div>
        {step && (
          <ExerciseDemo
            key={step.kind === 'rest' ? `next-${step.next.key}` : step.exercise.key}
            exercise={step.kind === 'rest' ? step.next.key : step.exercise.key}
            name={EXERCISES[step.kind === 'rest' ? step.next.key : step.exercise.key].name}
          />
        )}
        <div className="runner-title">{title}</div>
        {step && <MuscleChips targets={EXERCISE_MUSCLES[step.kind === 'rest' ? step.next.key : step.exercise.key]} compact />}
        <div>
          <div className="big">{big}</div>
          <div className="muted small">{unit}</div>
        </div>
        <p className="cue">{cue}</p>
        <div className="row center">
          {!active && (
            <button className="btn btn-lg" onClick={() => { setResult(null); setUnlocked(null); s.begin(); }}>
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
      </section>

      <Guide items={PULL_GUIDE} />
    </div>
  );
}
