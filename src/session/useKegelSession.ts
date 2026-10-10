import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { beep, keepAwake, TONE, vibrate } from '../lib/device';
import { buildKegelPhases, isRelax, isSqueeze, phaseAt, type KegelLevel, type PhasePosition } from '../programs/kegel';

export type KegelStatus = 'idle' | 'running' | 'paused';

/**
 * Drives one guided Kegel session. Time is measured from performance.now(),
 * so a slow frame never stretches a phase; pausing shifts the start time.
 */
export function useKegelSession(level: KegelLevel, onComplete: () => void) {
  const phases = useMemo(() => buildKegelPhases(level), [level]);
  const [status, setStatus] = useState<KegelStatus>('idle');
  const [pos, setPos] = useState<PhasePosition | null>(null);
  const startRef = useRef(0);
  const pausedAtRef = useRef(0);
  const rafRef = useRef(0);
  const lastIndexRef = useRef(-1);
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    keepAwake(false);
  }, []);

  const frameRef = useRef<(now: number) => void>(() => undefined);
  const frame = useCallback(
    (now: number) => {
      const p = phaseAt(phases, (now - startRef.current) / 1000);
      if (!p) {
        cleanup();
        setStatus('idle');
        setPos(null);
        beep(TONE.done, 0.3);
        vibrate([80, 60, 80]);
        completeRef.current();
        return;
      }
      if (p.index !== lastIndexRef.current) {
        lastIndexRef.current = p.index;
        const t = phases[p.index].type;
        if (isSqueeze(t)) {
          beep(TONE.squeeze);
          vibrate(40);
        } else if (isRelax(t) || t === 'break') beep(TONE.relax);
      }
      setPos(p);
      rafRef.current = requestAnimationFrame((t) => frameRef.current(t));
    },
    [phases, cleanup],
  );
  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  const start = useCallback(() => {
    lastIndexRef.current = -1;
    startRef.current = performance.now();
    setStatus('running');
    keepAwake(true);
    beep(TONE.start);
    rafRef.current = requestAnimationFrame(frame);
  }, [frame]);

  const pause = useCallback(() => {
    pausedAtRef.current = performance.now();
    cancelAnimationFrame(rafRef.current);
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    startRef.current += performance.now() - pausedAtRef.current;
    setStatus('running');
    rafRef.current = requestAnimationFrame(frame);
  }, [frame]);

  const stop = useCallback(() => {
    cleanup();
    setStatus('idle');
    setPos(null);
  }, [cleanup]);

  useEffect(() => cleanup, [cleanup]);

  return { phases, status, pos, phase: pos ? phases[pos.index] : null, start, pause, resume, stop };
}
