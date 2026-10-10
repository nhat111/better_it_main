export type ExerciseKey = 'hang' | 'scap' | 'row' | 'flex' | 'neg' | 'band' | 'pull';

export interface Exercise {
  name: string;
  cue: string;
}

export const EXERCISES: Record<ExerciseKey, Exercise> = {
  hang: {
    name: 'Treo xà thụ động',
    cue: 'Nắm xà rộng hơn vai, tay duỗi thẳng, thả lỏng vai, thở đều. Tăng sức nắm và giãn khớp vai.',
  },
  scap: {
    name: 'Kéo bả vai',
    cue: 'Treo thẳng tay, kéo hai bả vai xuống và ra sau để người nhích lên vài cm, giữ 1 giây rồi hạ. Không gập khuỷu.',
  },
  row: {
    name: 'Kéo xà thấp (Australian row)',
    cue: 'Xà ngang hông, người thẳng như tấm ván, gót chạm đất. Kéo ngực chạm xà, hạ chậm. Chân càng xa càng nặng.',
  },
  flex: {
    name: 'Giữ cằm trên xà',
    cue: 'Bước lên ghế để cằm vượt xà, rời chân khỏi ghế, siết lưng và tay giữ nguyên vị trí.',
  },
  neg: {
    name: 'Hạ chậm (negative)',
    cue: 'Bước ghế lên vị trí cằm trên xà, rời chân, hạ người thật chậm đến khi tay duỗi hết. Đếm thầm từng giây.',
  },
  band: {
    name: 'Kéo xà có dây hỗ trợ',
    cue: 'Móc dây kháng lực lên xà, đặt đầu gối hoặc bàn chân vào dây. Kéo đến cằm qua xà. Không có dây thì nhảy kéo.',
  },
  pull: {
    name: 'Pull-up toàn phần',
    cue: 'Từ treo thẳng tay, kéo đến cằm qua xà, không đung đưa. Mỗi hiệp làm số lần sạch tối đa, dừng khi bắt đầu sai tư thế.',
  },
};

export interface StageExercise {
  key: ExerciseKey;
  sets: number;
  /** Reps per set (a range like "1–2" means "as many clean reps as you can"). */
  reps?: number | string;
  /** Hold seconds per set. Exactly one of `reps` / `hold` is set. */
  hold?: number;
  /** Seconds per lowering rep (negatives). */
  tempo?: number;
  /** Rest seconds after each set; 0 for none. */
  rest: number;
}

export interface Stage {
  name: string;
  weeks: string;
  exercises: StageExercise[];
}

export const STAGES: readonly Stage[] = [
  {
    name: 'Nền tảng',
    weeks: 'Tuần 1–2',
    exercises: [
      { key: 'hang', sets: 3, hold: 20, rest: 60 },
      { key: 'scap', sets: 3, reps: 8, rest: 60 },
      { key: 'row', sets: 3, reps: 8, rest: 90 },
    ],
  },
  {
    name: 'Giữ và hạ',
    weeks: 'Tuần 3–4',
    exercises: [
      { key: 'hang', sets: 3, hold: 30, rest: 60 },
      { key: 'flex', sets: 3, hold: 10, rest: 90 },
      { key: 'neg', sets: 3, reps: 3, tempo: 5, rest: 90 },
      { key: 'row', sets: 3, reps: 10, rest: 90 },
    ],
  },
  {
    name: 'Có hỗ trợ',
    weeks: 'Tuần 5–6',
    exercises: [
      { key: 'scap', sets: 2, reps: 10, rest: 60 },
      { key: 'band', sets: 3, reps: 6, rest: 90 },
      { key: 'neg', sets: 3, reps: 4, tempo: 5, rest: 90 },
      { key: 'flex', sets: 3, hold: 15, rest: 90 },
    ],
  },
  {
    name: 'Pull-up đầu tiên',
    weeks: 'Tuần 7–8',
    exercises: [
      { key: 'pull', sets: 5, reps: '1–2', rest: 120 },
      { key: 'neg', sets: 3, reps: 5, tempo: 6, rest: 90 },
      { key: 'band', sets: 2, reps: 8, rest: 90 },
      { key: 'hang', sets: 1, hold: 45, rest: 0 },
    ],
  },
];

/** Completed sessions at a stage before the next unlocks (2 weeks × 3). */
export const PULL_SESSIONS_TO_STAGE_UP = 6;

export type PullStep =
  | { kind: 'work'; exercise: StageExercise; exerciseIndex: number; set: number }
  | { kind: 'rest'; seconds: number; exerciseIndex: number; next: StageExercise };

/** Every set in order, with a rest between sets (none after the last set). */
export function buildPullSteps(stage: Stage): PullStep[] {
  const out: PullStep[] = [];
  stage.exercises.forEach((exercise, exerciseIndex) => {
    for (let set = 1; set <= exercise.sets; set++) {
      out.push({ kind: 'work', exercise, exerciseIndex, set });
      const isLastOverall = exerciseIndex === stage.exercises.length - 1 && set === exercise.sets;
      if (!isLastOverall && exercise.rest > 0) {
        const next = set < exercise.sets ? exercise : stage.exercises[exerciseIndex + 1];
        out.push({ kind: 'rest', seconds: exercise.rest, exerciseIndex, next });
      }
    }
  });
  return out;
}

export function formatDose(e: StageExercise): string {
  return e.hold ? `${e.sets}×${e.hold}s` : `${e.sets}×${e.reps}`;
}

export function formatRest(seconds: number): string {
  return seconds >= 60 && seconds % 60 === 0 ? `${seconds / 60} phút` : `${seconds}s`;
}

/** Rough session length in minutes: work time estimate plus rests. */
export function stageMinutes(stage: Stage): number {
  let s = 0;
  for (const step of buildPullSteps(stage)) {
    if (step.kind === 'rest') s += step.seconds;
    else s += step.exercise.hold ?? 30;
  }
  return Math.round(s / 60);
}
