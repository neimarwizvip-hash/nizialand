import type { SchoolGrade } from './level0Content';
import { itensDaRodada, type ItemRodada } from './rodadasFases';

// Matriz do Nível 8 por série. As perguntas de cada atividade ficam no banco de rodadas (rodadasFases.ts).
export interface C8 { curriculum: { theme: string; objects: string[]; progression: string }; items: ItemRodada[] }

const TEMAS: Record<SchoolGrade, C8['curriculum']> = {
  '6': { theme: 'Rotina cumprida e resultados', objects: ['past simple', 'comparatives', 'classroom and directions'], progression: 'Simple past (regular e irregular básico) e comparativos curtos: bigger, better.' },
  '7': { theme: 'Projeto em grupo na prática', objects: ['past simple', 'comparatives', 'presentations'], progression: 'Simple past e comparativos para contar e avaliar o que o grupo fez.' },
  '8': { theme: 'Avaliar resultados', objects: ['comparatives and superlatives', 'past simple', 'presentations'], progression: 'Comparativos, superlativos e simple past para relatar o projeto.' },
  '9': { theme: 'Apresentar e refletir', objects: ['superlatives', 'past simple', 'connectors'], progression: 'Superlativos, simple past e conectores para apresentar e refletir.' },
};

export const LEVEL8_CONTENT: Record<SchoolGrade, C8> = Object.fromEntries(
  (['6', '7', '8', '9'] as SchoolGrade[]).map(g => [g, { curriculum: TEMAS[g], items: itensDaRodada('nivel8-revisao', g) }]),
) as Record<SchoolGrade, C8>;
