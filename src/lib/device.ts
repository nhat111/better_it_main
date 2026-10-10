import { getProgress } from '../storage/progress';

// Short tones for phase changes. Browsers only allow audio after a user
// gesture, and every session starts from a button tap, so that is satisfied.
let ctx: AudioContext | null = null;

export function beep(freq: number, seconds = 0.12): void {
  if (!getProgress().prefs.sound) return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    o.start(t);
    o.stop(t + seconds + 0.02);
  } catch {
    /* no audio available */
  }
}

export const TONE = { start: 520, squeeze: 660, relax: 440, tick: 500, done: 880 } as const;

export function vibrate(ms: number | number[]): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* unsupported (iOS) */
  }
}

// Keeps the screen on during a session. Released automatically by the
// browser when the page is hidden; re-requested when it becomes visible.
let lock: WakeLockSentinel | null = null;
let wanted = false;

async function acquire(): Promise<void> {
  try {
    lock = (await navigator.wakeLock?.request('screen')) ?? null;
  } catch {
    lock = null;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (wanted && document.visibilityState === 'visible') void acquire();
  });
}

export function keepAwake(on: boolean): void {
  wanted = on;
  if (on) void acquire();
  else {
    void lock?.release().catch(() => undefined);
    lock = null;
  }
}
