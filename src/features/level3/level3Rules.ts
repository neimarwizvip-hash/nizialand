import type { Activity, ActivityResult } from '../../core/types';
import type { SchoolGrade } from '../../data/level0Content';
import { LEVEL3_MISSION } from '../../content/level3';
import type { Level3Question } from '../../data/level3Content';

export function buildLevel3Result(activity: Activity, grade: SchoolGrade, score: number, correctCount: number, evidence: Level3Question): ActivityResult {
  return { activityId: activity.id, missionId: LEVEL3_MISSION.id, grade, mechanic: activity.mechanic, score, maxScore: 100, correctCount, totalItems: 1, completed: true, startedAt: new Date().toISOString(), completedAt: new Date().toISOString(), evidence };
}
