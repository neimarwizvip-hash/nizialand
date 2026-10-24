// Conteúdo do Nível 0: a primeira aventura contra o Zé Cartinha.
// As perguntas e cartas por série continuam em src/data/level0Content.ts.

import type { Activity, Level, Mission } from '../core/types';

export const LEVEL0_QUIZ: Activity = {
  id: 'nivel0-quiz',
  mechanic: 'quiz',
  name: 'Quiz',
  phrase: 'Responda e ganhe pontos!',
  path: '/quiz',
  color: 'yellow',
};

export const LEVEL0_FLASHCARDS: Activity = {
  id: 'nivel0-flashcards',
  mechanic: 'flashcards',
  name: 'Flashcards',
  phrase: 'Teste sua memória e acumule pontos!',
  path: '/flashcards',
  color: 'purple',
};

// As duas atividades ficam liberadas assim que a série é escolhida.
export const LEVEL0_MISSION: Mission = {
  id: 'nivel0-missao0',
  number: 0,
  title: 'Desvie das distrações do Zé Cartinha',
  activities: [LEVEL0_QUIZ, LEVEL0_FLASHCARDS],
};

export const LEVEL0: Level = {
  id: 'nivel0',
  number: 0,
  title: 'A primeira aventura',
  story: 'nivel0',
  mode: '2D',
  mission: LEVEL0_MISSION,
};
