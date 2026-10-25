import type { Activity, Level, Mission } from '../core/types';
const ROOM = (id: string) => `/nivel4/equipe?atividade=${id}`;
export const LEVEL4_PISTAS: Activity = { id: 'nivel4-pistas', mechanic: 'explore', name: 'Caça às pistas', phrase: 'Encontre a pista e trabalhe com o grupo!', path: ROOM('nivel4-pistas'), color: 'blue', hint: 'Leia instruções e locais em inglês.' };
export const LEVEL4_DIRECOES: Activity = { id: 'nivel4-direcoes', mechanic: 'listen', name: 'Siga as direções', phrase: 'Ouça e siga o mapa!', path: ROOM('nivel4-direcoes'), color: 'green', hint: 'Turn left, go straight, next to.' };
export const LEVEL4_PAPEIS: Activity = { id: 'nivel4-papeis', mechanic: 'dialogue', name: 'Monte a equipe', phrase: 'Escolha o papel adequado para cada colega!', path: ROOM('nivel4-papeis'), color: 'orange', hint: 'Who, what and where guide the team.' };
export const LEVEL4_MENSAGEM: Activity = { id: 'nivel4-mensagem', mechanic: 'order', name: 'Mensagem secreta', phrase: 'Organize as palavras do grupo!', path: ROOM('nivel4-mensagem'), color: 'purple', hint: 'Monte uma instrução completa.' };
export const LEVEL4_REVEZAMENTO: Activity = { id: 'nivel4-revezamento', mechanic: 'timed', name: 'Revezamento de perguntas', phrase: 'Cada resposta faz a equipe avançar!', path: ROOM('nivel4-revezamento'), color: 'yellow', hint: 'Responda com rapidez e cooperação.' };
export const LEVEL4_REVISAO: Activity = { id: 'nivel4-revisao', mechanic: 'quiz', name: 'Revisão da equipe', phrase: 'Revise os Níveis 0 a 3!', path: ROOM('nivel4-revisao'), color: 'pink', hint: 'Conteúdos anteriores voltam em grupo.' };
export const LEVEL4_MISSION: Mission = { id: 'nivel4-missao4', number: 4, title: 'Trabalho em equipe', activities: [LEVEL4_PISTAS, LEVEL4_DIRECOES, LEVEL4_PAPEIS, LEVEL4_MENSAGEM, LEVEL4_REVEZAMENTO, LEVEL4_REVISAO], sequential: true };
export const LEVEL4_DISTRACTIONS: Record<string, { ze: string; mane: string }> = {
  'nivel4-pistas': { ze: 'Eu embaralhei as pistas!', mane: 'E eu coloquei uma no lugar errado. Procurem juntos!' },
  'nivel4-direcoes': { ze: 'Troquei a ordem das placas!', mane: 'Vire à esquerda... ou talvez à direita!' },
  'nivel4-papeis': { ze: 'Misturei os cartões da equipe!', mane: 'Eu posso ser o apresentador e o anotador ao mesmo tempo!' },
  'nivel4-mensagem': { ze: 'Baguncei a mensagem secreta!', mane: 'Coloquei uma palavra extra. Ficou mais bonita!' },
  'nivel4-revezamento': { ze: 'Vou contar o tempo bem rápido!', mane: 'Torcida da bagunça: vai, vai, vai!' },
  'nivel4-revisao': { ze: 'Trouxe perguntas antigas!', mane: 'E trouxe uma distração novinha!' },
};

export const LEVEL4: Level = { id: 'nivel4', number: 4, title: 'Trabalho em equipe', story: 'nivel4', mode: '2D', mission: LEVEL4_MISSION };
