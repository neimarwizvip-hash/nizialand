// Tipos centrais do Nisialand: níveis, missões e resultados de atividade.
// São independentes da mecânica (Quiz, Flashcards...), para que novas
// mecânicas e novos níveis entrem sem mexer nas telas existentes.

import type { SchoolGrade } from '../data/level0Content';

export type Mechanic = 'quiz' | 'flashcards';

export type LevelMode = '2D';

// Aponta para a atividade que a missão usa (mecânica + rota da tela).
export interface ActivityRef {
  id: string;
  mechanic: Mechanic;
  path: string;
}

export interface Mission {
  id: string;
  order: number;
  title: string;
  activity: ActivityRef;
  // Missões que precisam estar concluídas antes desta. Vazio = liberada
  // assim que a série é escolhida.
  requires: string[];
}

export interface Level {
  id: string;
  title: string;
  // Chave da historinha mostrada antes do mapa (PhaseStoryGate).
  story: string;
  mode: LevelMode;
  missions: Mission[];
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

export type MissionState = 'locked' | 'available' | 'completed';
