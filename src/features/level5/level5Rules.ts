import type { Activity, ActivityResult } from '../../core/types';
import type { SchoolGrade } from '../../data/level0Content';
import { LEVEL5_MISSION } from '../../content/level5';
import type { Level5Question } from '../../data/level5Content';
export function buildLevel5Result(activity: Activity, grade: SchoolGrade, score: number, correctCount: number, evidence: Level5Question): ActivityResult { const now = new Date().toISOString(); return { activityId: activity.id, missionId: LEVEL5_MISSION.id, grade, mechanic: activity.mechanic, score, maxScore: 100, correctCount, totalItems: 1, completed: true, startedAt: now, completedAt: now, evidence }; }
