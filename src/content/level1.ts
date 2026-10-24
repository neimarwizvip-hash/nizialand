// Conteúdo do Nível 1: Missão 1 na escola, 4 atividades em sequência (cada uma mais difícil).
// Os itens por série ficam em src/data/level1Content.ts; regras de pontos em features/level1/level1Rules.ts.

import type { Activity, Level, Mission } from '../core/types';

export const LEVEL1_LISTEN: Activity = {
  id: 'nivel1-ouvir',
  mechanic: 'listen',
  name: 'O recado da Leia',
  phrase: 'Ouça e ligue cada palavra à figura!',
  path: '/nivel1/ouvir',
  color: 'blue',
  hint: 'O Zé troca as figuras de lugar.',
};

export const LEVEL1_ORDER: Activity = {
  id: 'nivel1-montar',
  mechanic: 'order',
  name: 'Monte a mensagem',
  phrase: 'Arraste as palavras e forme a frase!',
  path: '/nivel1/montar',
  color: 'orange',
  hint: 'O Zé embaralha as palavras.',
};

export const LEVEL1_DIALOGUE: Activity = {
  id: 'nivel1-dialogo',
  mechanic: 'dialogue',
  name: 'Conversa no corredor',
  phrase: 'Escolha a resposta certa no diálogo!',
  path: '/nivel1/dialogo',
  color: 'green',
  hint: 'O Zé interrompe a conversa.',
};

export const LEVEL1_EXPLORE: Activity = {
  id: 'nivel1-explorar',
  mechanic: 'explore',
  name: 'Explore a escola',
  phrase: 'Toque nos lugares e descubra palavras!',
  path: '/nivel1/explorar',
  color: 'pink',
  hint: 'Cuidado com as cartas do Zé.',
};

// Sequencial: a 2ª só abre depois da 1ª, e assim por diante.
export const LEVEL1_MISSION: Mission = {
  id: 'nivel1-missao1',
  number: 1,
  title: 'Missão 1',
  activities: [LEVEL1_LISTEN, LEVEL1_ORDER, LEVEL1_DIALOGUE, LEVEL1_EXPLORE],
  sequential: true,
};

export const LEVEL1: Level = {
  id: 'nivel1',
  number: 1,
  title: 'Missão na escola',
  story: 'nivel1',
  mode: '2D',
  mission: LEVEL1_MISSION,
};
