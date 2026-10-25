import type { SchoolGrade } from '../../data/level0Content';
import { LEVEL3_CONTENT } from '../../data/level3Content';
import { LEVEL4_CONTENT, type Level4Question } from '../../data/level4Content';
import { buildReviewItems } from '../level3/level3Rules';

export type TeamQuestion = Pick<Level4Question, 'prompt' | 'options' | 'answer' | 'explanation'>;

export function level4QuestionPool(activityId: string, grade: SchoolGrade): TeamQuestion[] {
  const c = LEVEL4_CONTENT[grade];
  if (activityId === 'nivel4-direcoes') return [
    c.direcoes[0],
    { prompt: 'From the schoolyard to the corridor, which command means keep moving forward?', options: ['Go straight.', 'Turn right.', 'Go back.'], answer: 0, explanation: 'Go straight significa seguir em frente.' },
    { prompt: 'In the corridor, the library is on the left. Which way should the group turn?', options: ['Turn left.', 'Turn right.', 'Stop here.'], answer: 0, explanation: 'Turn left significa vire à esquerda.' },
  ];
  if (activityId === 'nivel4-papeis') return [
    c.papeis[0],
    { prompt: 'Who presents the group project to the class?', options: ['The presenter.', 'The map.', 'The corridor.'], answer: 0, explanation: 'Presenter é quem apresenta o trabalho.' },
    { prompt: 'Who organizes the steps and checks the schedule?', options: ['The organizer.', 'The poster.', 'The library.'], answer: 0, explanation: 'Organizer ajuda a organizar as tarefas da equipe.' },
  ];
  if (activityId === 'nivel4-revezamento') return [c.direcoes[0], c.papeis[0], c.revezamento[0]];
  if (activityId === 'nivel4-revisao') return [
    ...buildReviewItems(grade).slice(0, 6).map(it => ({ prompt: it.question, options: it.options, answer: it.answer, explanation: 'Revisão dos níveis anteriores.' })),
    ...LEVEL3_CONTENT[grade].board.slice(0, 2),
  ];
  const key = activityId.replace('nivel4-', '') as keyof typeof c;
  const questions = c[key];
  return Array.isArray(questions) ? questions : [];
}
