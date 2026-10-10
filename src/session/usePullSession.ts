import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { beep, keepAwake, TONE, vibrate } from '../lib/device';
import { buildPullSteps, type Stage } from '../programs/pullup';

/**
 * idle     – not started
 * ready    – a set is up; waiting for the user (start a hold / finish reps)
 * holding  – timed hold counting down
 * resting  – rest countdown between sets
 */
export type PullMode = 'idle' | 'ready' | 'holding' | 'resting';

export function usePullSession(stage: Stage, onComplete: () => void) {
  const steps = useMemo(() => buildPullSteps(stage), [stage]);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<PullMode>('idle');
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef(0);
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  const clear = () => window.clearInterval(timerRef.current);

  const countdown = useCallback((seconds: number, done: () => void) => {
    clear();
    const end = performance.now() + seconds * 1000;
    let lastWhole = Math.ceil(seconds);
    setRemaining(seconds);
    timerRef.current = window.setInterval(() => {
      const left = Math.max(0, (end - performance.now()) / 1000);
      const whole = Math.ceil(left);
      if (whole !== lastWhole) {
        lastWhole = whole;
        if (whole > 0 && whole <= 3) beep(TONE.tick, 0.06);
      }
      setRemaining(left);
      if (left <= 0) {
        clear();
        done();
      }
    }, 100);
  }, []);

  const goToRef = useRef<(i: number) => void>(() => undefined);
  const goTo = useCallback(
    (i: number) => {
      if (i >= steps.length) {
        clear();
        keepAwake(false);
        setMode('idle');
        setIndex(0);
        beep(TONE.done, 0.3);
        vibrate([80, 60, 80]);
        completeRef.current();
        return;
      }
      setIndex(i);
      const step = steps[i];
      if (step.kind === 'rest') {
        setMode('resting');
        countdown(step.seconds, () => {
          beep(TONE.squeeze);
          vibrate(60);
          goToRef.current(i + 1);
        });
      } else {
        setMode('ready');
        setRemaining(step.exercise.hold ?? 0);
      }
    },
    [steps, countdown],
  );
  useEffect(() => {
    goToRef.current = goTo;
  }, [goTo]);

  const begin = useCallback(() => {
    keepAwake(true);
    beep(TONE.start);
    goTo(0);
  }, [goTo]);

  /** Main button while a set is up. */
  const primary = useCallback(() => {
    const step = steps[index];
    if (mode !== 'ready' || step.kind !== 'work') return;
    if (step.exercise.hold) {
      setMode('holding');
      beep(TONE.squeeze);
      countdown(step.exercise.hold, () => {
        beep(TONE.done, 0.2);
        vibrate(80);
        goTo(index + 1);
      });
    } else {
      beep(TONE.relax);
      goTo(index + 1);
    }
  }, [steps, index, mode, countdown, goTo]);

  const skipRest = useCallback(() => {
    if (mode !== 'resting') return;
    clear();
    goTo(index + 1);
  }, [mode, index, goTo]);

  const stop = useCallback(() => {
    clear();
    keepAwake(false);
    setMode('idle');
    setIndex(0);
  }, []);

  useEffect(() => () => {
    clear();
    keepAwake(false);
  }, []);

  const workTotal = steps.filter((s) => s.kind === 'work').length;
  const workDone = steps.slice(0, index).filter((s) => s.kind === 'work').length;

  return {
    steps,
    step: mode === 'idle' ? null : steps[index],
    mode,
    remaining,
    progress: mode === 'idle' ? 0 : workDone / workTotal,
    begin,
    primary,
    skipRest,
    stop,
  };
}
