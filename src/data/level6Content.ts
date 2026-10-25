import type { SchoolGrade } from './level0Content';
export interface Q6 { prompt: string; options: string[]; answer: number; explanation: string; skill: 'reading' | 'writing' | 'speaking' | 'listening'; languageFocus: string; vocabulary: string[] }
export interface C6 { curriculum: { theme: string; objects: string[]; progression: string }; items: Q6[] }
const q = (prompt: string, options: string[], explanation: string, skill: Q6['skill'], languageFocus: string, vocabulary: string[]): Q6 => ({ prompt, options, answer: 0, explanation, skill, languageFocus, vocabulary });
const make = (grade: SchoolGrade): C6 => {
  const first = grade === '6'
    ? q('Why is Ana happy?', ['Because the team helped her.', 'Because help team.', 'The team happy because.'], 'Because apresenta a causa.', 'reading', 'Because clause', ['because', 'helped'])
    : q('What happened after the team changed the plan?', ['Because the team helped her.', 'Because help team.', 'The team happy because.'], 'Because apresenta a causa.', 'reading', 'Because clause', ['because', 'helped']);
  const second = grade === '6'
    ? q('Choose a helpful result.', ['If we plan, we will finish on time.', 'If plan finish.', 'We plan yesterday.'], 'If + presente e will mostram consequência provável.', 'writing', 'First conditional', ['plan', 'finish'])
    : q('Choose a helpful result.', ['If we plan, we will finish on time.', 'If plan finish.', 'We plan yesterday.'], 'If + presente e will mostram consequência provável.', 'writing', 'First conditional', ['plan', 'finish']);
  const themes: Record<SchoolGrade, C6['curriculum']> = {
    '6': { theme: 'Ações e resultados simples', objects: ['cause and effect', 'school situations', 'consequences'], progression: 'Simple present e because em situações concretas.' },
    '7': { theme: 'Consequências na rotina', objects: ['cause and effect', 'school situations', 'consequences'], progression: 'Simple past, because e first conditional básico.' },
    '8': { theme: 'Decisões, passado e resultados', objects: ['cause and effect', 'school situations', 'consequences'], progression: 'Simple past e first conditional para explicar resultados.' },
    '9': { theme: 'Responsabilidade e reflexão', objects: ['cause and effect', 'school situations', 'consequences'], progression: 'Past simple, first conditional e conectores para refletir.' },
  };
  return { curriculum: themes[grade], items: [first, second] };
};
export const LEVEL6_CONTENT: Record<SchoolGrade, C6> = { '6': make('6'), '7': make('7'), '8': make('8'), '9': make('9') };
