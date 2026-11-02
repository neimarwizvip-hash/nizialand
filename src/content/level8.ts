import type { Activity, Level, Mission } from '../core/types';

// Nível 8 · Organizado na prática: o planejamento do Nível 7 vira resultado e pontuação.
const R = (id: string) => `/nivel8/projeto?atividade=nivel8-${id}`;
const a = (id: string, mechanic: Activity['mechanic'], name: string, phrase: string, color: Activity['color']): Activity => ({ id: `nivel8-${id}`, mechanic, name, phrase, path: R(id), color });

export const LEVEL8_ACTIVITIES = [
  a('semana', 'explore', 'Semana organizada', 'Conte como cumpriu a rotina.', 'blue'),
  a('entrega', 'dialogue', 'Entrega do trabalho', 'Entregue o projeto do grupo.', 'green'),
  a('simulado', 'timed', 'Simulado com tempo', 'Responda antes do relógio zerar.', 'orange'),
  a('sala', 'order', 'Construa a sala ideal', 'Monte a sala seguindo instruções.', 'purple'),
  a('travessia', 'explore', 'Travessia do corredor', 'Atravesse acertando as direções.', 'yellow'),
  a('distracoes', 'timed', 'Ataque das distrações', 'Derrube as distrações do Zé.', 'pink'),
  a('apresentacao', 'dialogue', 'Apresentação do projeto', 'Apresente o resultado à turma.', 'blue'),
  a('revisao', 'quiz', 'Revisão do projeto', 'Revise os Níveis 0 a 7.', 'purple'),
];
export const LEVEL8_MISSION: Mission = { id: 'nivel8-missao8', number: 8, title: 'Organizado na prática', activities: LEVEL8_ACTIVITIES, sequential: true };
export const LEVEL8: Level = { id: 'nivel8', number: 8, title: 'Organizado na prática', story: 'nivel8', mode: '2D', mission: LEVEL8_MISSION };
