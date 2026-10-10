import type { ExerciseKey } from './pullup';

export type MuscleKey = 'lats' | 'biceps' | 'forearms' | 'traps' | 'midback' | 'rearDelts' | 'core' | 'frontDelts' | 'glutes';

export interface Muscle {
  name: string;
  /** Anatomical name, for users who look it up. */
  latin: string;
  /** What it does in a pull-up, in plain words. */
  role: string;
}

export const MUSCLES: Record<MuscleKey, Muscle> = {
  lats: { name: 'Cơ xô', latin: 'Latissimus dorsi', role: 'Kéo cánh tay xuống và về sau. Nhóm cơ chính khi kéo xà, tạo lưng chữ V.' },
  biceps: { name: 'Tay trước', latin: 'Biceps brachii', role: 'Gập khuỷu tay, hỗ trợ cơ xô kéo người lên.' },
  forearms: { name: 'Cẳng tay', latin: 'Forearm flexors', role: 'Giữ chặt xà. Sức nắm yếu thường là lý do người mới tuột tay sớm.' },
  traps: { name: 'Cơ thang dưới', latin: 'Lower trapezius', role: 'Kéo bả vai xuống, giữ vai ổn định và xa tai.' },
  midback: { name: 'Cơ lưng giữa', latin: 'Rhomboids, middle trapezius', role: 'Ép hai bả vai vào nhau, quan trọng nhất trong bài kéo xà thấp.' },
  rearDelts: { name: 'Vai sau', latin: 'Posterior deltoid', role: 'Hỗ trợ kéo cánh tay về sau.' },
  core: { name: 'Cơ bụng', latin: 'Rectus abdominis, transversus, obliques', role: 'Giữ thân người thẳng, không đung đưa. Làm việc cùng cơ hoành và cơ sàn chậu để giữ áp lực ổ bụng.' },
  frontDelts: { name: 'Vai trước', latin: 'Anterior deltoid', role: 'Giữ vai vững khi chống cẳng tay trong plank.' },
  glutes: { name: 'Cơ mông', latin: 'Gluteus maximus, medius', role: 'Giữ hông không võng xuống; plank nghiêng tập thêm cơ mông nhỡ ở hông.' },
};

export interface MuscleTargets {
  primary: MuscleKey[];
  secondary: MuscleKey[];
}

export const EXERCISE_MUSCLES: Record<ExerciseKey, MuscleTargets> = {
  hang: { primary: ['forearms'], secondary: ['lats', 'traps'] },
  scap: { primary: ['traps', 'lats'], secondary: ['forearms'] },
  row: { primary: ['midback', 'lats'], secondary: ['biceps', 'rearDelts', 'core'] },
  flex: { primary: ['biceps', 'lats'], secondary: ['forearms', 'core'] },
  neg: { primary: ['lats', 'biceps'], secondary: ['forearms', 'midback'] },
  band: { primary: ['lats', 'biceps'], secondary: ['midback', 'forearms'] },
  pull: { primary: ['lats', 'biceps'], secondary: ['midback', 'traps', 'forearms', 'core'] },
  plankKnee: { primary: ['core'], secondary: ['frontDelts', 'glutes'] },
  plank: { primary: ['core'], secondary: ['frontDelts', 'glutes'] },
  sidePlank: { primary: ['core'], secondary: ['glutes', 'frontDelts'] },
  hollow: { primary: ['core'], secondary: ['frontDelts'] },
};

export type Emphasis = 'primary' | 'secondary' | undefined;

export function emphasis(t: MuscleTargets, m: MuscleKey): Emphasis {
  return t.primary.includes(m) ? 'primary' : t.secondary.includes(m) ? 'secondary' : undefined;
}
