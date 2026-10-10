# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project
ManFit: a PWA for Vietnamese men — guided Kegel (pelvic floor) training and a beginner
pull-up program. Same stack and conventions as KoDevTalk (github.com/nhat111/korean-practice).

## Rules
- **UI text in Vietnamese**, kept in `src/i18n/vi.ts`. Exercise content lives in
  `src/programs/*.ts` and `src/content/guides.ts`. Code, comments, commits in English.
- **No backend, no accounts.** All state is one localStorage object (`bm:progress:v1`) handled
  by `src/storage/progress.ts`. Every read and import goes through `parseProgress`, so bad data
  never crashes the app. `fromLegacy` migrates the first single-file version (`kegelCoach.v1`).
- Program logic is pure and unit-tested (`src/programs`, `src/storage`, `src/lib/date.ts`).
  Timers (`src/session/*`) use `performance.now()` deltas, never tick counting.
- Health content stays conservative and factual: no medical claims beyond what is well
  established, and keep the "see a doctor" guidance.

## Structure
- `src/pages/` Home, Kegel, Xà đơn, Tiến độ, Cài đặt (routes `/`, `/kegel`, `/xa-don`, `/tien-do`, `/cai-dat`)
- `src/session/` `useKegelSession`, `usePullSession`
- `src/programs/demos.ts` + `src/components/ExerciseDemo.tsx` animated illustrated demos (one per
  pull-up exercise; keyframe poses in a 120×140 box, eased and looped; static under reduced motion).
  Worked muscles are tinted on the figure.
- `src/programs/muscles.ts` muscles per exercise (primary/secondary); `MuscleMap` (front/back body
  map) and `MuscleChips` render them. Keep muscle claims standard and conservative.
- `src/lib/device.ts` beep, vibrate, screen wake lock
- `sw/sw.js` service worker template; `vite.config.ts` injects precache list + version
- `scripts/make_icons.py` renders `public/icons/*`

## Commands
`npm run dev`, `npm run check` (oxlint + vitest + tsc + vite build — must pass before pushing).
