// Regras comuns das 4 atividades do Nível 1: tempo, pontos e quanto o Zé atrapalha.

import type { Activity, ActivityResult } from '../../core/types';
import type { SchoolGrade } from '../../data/level0Content';
import { LEVEL1_MISSION } from '../../content/level1';

// Cada item tem 20 s; estourou = 0 ponto.
export const ITEM_SECONDS = 20;
export const ITEM_WARNING_SECONDS = 5;
// 1ª tentativa 100, 2ª tentativa 50, depois 0.
export const POINTS_FIRST_TRY = 100;
export const POINTS_SECOND_TRY = 50;
// Armadilha do Zé na exploração tira 5 s do item.
export const TRAP_PENALTY_SECONDS = 5;

/** Pontos de um item: attempt = nº da tentativa que acertou (1, 2...); timedOut = estourou o tempo. */
export function itemPoints(attempt: number, timedOut = false): number {
  if (timedOut || attempt < 1) return 0;
  if (attempt === 1) return POINTS_FIRST_TRY;
  if (attempt === 2) return POINTS_SECOND_TRY;
  return 0;
}

export const maxScore = (items: number) => items * POINTS_FIRST_TRY;

// Dinâmica crescente: quantas vezes o Zé atrapalha em cada atividade.
export const ZE_INTERFERENCE = {
  listen: 1,
  order: 2,
  dialogue: 3,
  explore: 3,
} as const;

/** Escolhe `count` índices distintos entre 1 e total-1 (nunca o 1º item), em ordem. */
export function pickZeItems(total: number, count: number, rng: () => number = Math.random): number[] {
  const pool = Array.from({ length: Math.max(total - 1, 0) }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}

/** Embaralha sem mutar; garante ordem diferente quando há 2+ elementos distintos. */
export function shuffled<T>(list: T[], rng: () => number = Math.random): T[] {
  if (list.length < 2) return [...list];
  for (let tries = 0; tries < 10; tries++) {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    if (out.some((v, i) => v !== list[i])) return out;
  }
  return [...list.slice(1), list[0]];
}

export interface ItemOutcome {
  points: number;
  correct: boolean;
}

/** Monta o resultado comum da atividade (o storage guarda o melhor). */
export function buildResult(
  activity: Activity,
  grade: SchoolGrade | null,
  outcomes: ItemOutcome[],
  startedAt: string
): ActivityResult {
  const score = outcomes.reduce((t, o) => t + o.points, 0);
  return {
    activityId: activity.id,
    missionId: LEVEL1_MISSION.id,
    grade,
    mechanic: activity.mechanic,
    score,
    maxScore: maxScore(outcomes.length),
    correctCount: outcomes.filter(o => o.correct).length,
    totalItems: outcomes.length,
    completed: true,
    startedAt,
    completedAt: new Date().toISOString(),
    evidence: { outcomes },
  };
}
