import type { Activity, ActivityResult } from '../../core/types';
import type { SchoolGrade } from '../../data/level0Content';
import { LEVEL4_MISSION } from '../../content/level4';
import type { Level4Question } from '../../data/level4Content';
export function buildLevel4Result(activity: Activity, grade: SchoolGrade, score: number, correctCount: number, evidence: Level4Question): ActivityResult { const now = new Date().toISOString(); return { activityId: activity.id, missionId: LEVEL4_MISSION.id, grade, mechanic: activity.mechanic, score, maxScore: 100, correctCount, totalItems: 1, completed: true, startedAt: now, completedAt: now, evidence }; }

/** Resultado de uma atividade com etapas. Os pontos refletem somente acertos reais. */
export function buildLevel4RunResult(activity: Activity, grade: SchoolGrade, outcomes: boolean[], startedAt: string): ActivityResult {
  const correctCount = outcomes.filter(Boolean).length;
  return {
    activityId: activity.id, missionId: LEVEL4_MISSION.id, grade, mechanic: activity.mechanic,
    score: correctCount * 100, maxScore: outcomes.length * 100, correctCount,
    totalItems: outcomes.length, completed: true, startedAt,
    completedAt: new Date().toISOString(), evidence: { outcomes },
  };
}
