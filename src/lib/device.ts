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

// ---------- audio through the iPhone silent switch ----------
// iOS mutes Web Audio when the ring/silent switch is on. During a session the
// beeps are the whole point (eyes closed for Kegel, hands on the bar), so we
// ask for the "playback" audio category, like a music app:
// - Safari/WebKit 16.4+: navigator.audioSession.type = 'playback'.
// - Older WebKit: a looping silent <audio> element puts the page in the
//   playback category, and Web Audio follows it.
// Both are released when the session ends. Only used when sound is on.

type AudioSessionNav = Navigator & { audioSession?: { type: string } };

let silentEl: HTMLAudioElement | null = null;

/** 0.5 s of 8 kHz 8-bit mono silence as a WAV data URI. */
function silentWav(): string {
  const n = 4000;
  const bytes = new Uint8Array(44 + n);
  const v = new DataView(bytes.buffer);
  const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); v.setUint32(4, 36 + n, true); str(8, 'WAVE');
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  str(36, 'data'); v.setUint32(40, n, true);
  bytes.fill(128, 44); // 8-bit PCM silence
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return `data:audio/wav;base64,${btoa(bin)}`;
}

/** Must first be called from a tap (Start button) so iOS allows playback. */
export function audioFocus(on: boolean): void {
  const nav = navigator as AudioSessionNav;
  try {
    if (nav.audioSession) {
      nav.audioSession.type = on && getProgress().prefs.sound ? 'playback' : 'auto';
      return;
    }
    if (on && getProgress().prefs.sound) {
      silentEl ??= Object.assign(new Audio(silentWav()), { loop: true });
      silentEl.setAttribute('playsinline', '');
      void silentEl.play().catch(() => undefined);
    } else {
      silentEl?.pause();
    }
  } catch {
    /* best effort */
  }
}

/** Start/end of a guided session: keep the screen on and the beeps audible. */
export function sessionActive(on: boolean): void {
  keepAwake(on);
  audioFocus(on);
  if (on) beep(TONE.start);
}
