// Tipos centrais do Nisialand: níveis, missões e resultados de atividade.
// São independentes da mecânica (Quiz, Flashcards...), para que novas
// mecânicas e novos níveis entrem sem mexer nas telas existentes.

import type { SchoolGrade } from '../data/level0Content';

// Nível 1: listen (ouvir e ligar), order (montar frase), dialogue (diálogo), explore (explorar a escola).
// Nível 2: dictation (ditado), wordsearch (caça-palavras), truefalse (mural), gapfill (bilhete), timed (relógio), duel (bafo).
export type Mechanic = 'quiz' | 'flashcards' | 'listen' | 'order' | 'dialogue' | 'explore'
  | 'dictation' | 'wordsearch' | 'truefalse' | 'gapfill' | 'timed' | 'duel';

export type LevelMode = '2D';

// Cor do cartão da atividade na tela da missão.
export type ActivityColor = 'yellow' | 'purple' | 'blue' | 'green' | 'orange' | 'pink';

// Uma atividade da missão (Quiz, Flashcards...): mecânica, textos do cartão e rota da tela.
export interface Activity {
  id: string;
  mechanic: Mechanic;
  name: string;
  phrase: string;
  path: string;
  color: ActivityColor;
  // Dica curta no cartão (ex.: o que o Zé apronta).
  hint?: string;
}

// Cada nível tem UMA missão, com o mesmo número do nível (Nível 0 = Missão 0).
// A missão reúne 2, 4, 6 ou 8 atividades e termina quando todas forem concluídas.
export interface Mission {
  id: string;
  number: number;
  title: string;
  activities: Activity[];
  // true: libera uma atividade por vez, na ordem (Nível 1).
  sequential?: boolean;
}

export interface Level {
  id: string;
  number: number;
  title: string;
  // Chave da historinha mostrada antes da missão (PhaseStoryGate).
  story: string;
  mode: LevelMode;
  mission: Mission;
}

// Resultado de uma atividade em formato comum, qualquer que seja a mecânica.
export interface ActivityResult {
  activityId: string;
  missionId: string;
  grade: SchoolGrade | null;
  mechanic: Mechanic;
  score: number;
  maxScore: number;
  correctCount: number;
  totalItems: number;
  completed: boolean;
  startedAt: string;
  completedAt: string;
  // Detalhe bruto da mecânica (tentativas por questão, rodadas...).
  evidence: unknown;
}

export type ActivityState = 'locked' | 'available' | 'completed';
