// Conteúdo do Nível 0: a primeira aventura contra o Zé Cartinha.
// As perguntas e cartas por série continuam em src/data/level0Content.ts.

import type { Level, Mission } from '../core/types';

export const LEVEL0_MISSION_QUIZ: Mission = {
  id: 'nivel0-missao1',
  order: 1,
  title: 'Enfrentar as distrações do Zé Cartinha',
  activity: { id: 'nivel0-quiz', mechanic: 'quiz', path: '/quiz' },
  requires: [],
};

// A missão 2 não depende da 1: as duas ficam liberadas assim que a série é escolhida.
export const LEVEL0_MISSION_FLASHCARDS: Mission = {
  id: 'nivel0-missao2',
  order: 2,
  title: 'Recuperar a atenção e enfrentar o desafio das cartas',
  activity: { id: 'nivel0-flashcards', mechanic: 'flashcards', path: '/flashcards' },
  requires: [],
};

export const LEVEL0: Level = {
  id: 'nivel0',
  title: 'A primeira aventura',
  story: 'nivel0',
  mode: '2D',
  missions: [LEVEL0_MISSION_QUIZ, LEVEL0_MISSION_FLASHCARDS],
};
