// Convertem os resultados de cada mecânica para o formato comum ActivityResult.

import type { FlashcardResult, QuizResult } from '../../types';
import type { ActivityResult } from '../../core/types';
import type { SchoolGrade } from '../../data/level0Content';
import { LEVEL0, LEVEL0_FLASHCARDS, LEVEL0_QUIZ } from '../../content/level0';

export const QUIZ_MAX_SCORE = 1000;
export const QUIZ_TOTAL_QUESTIONS = 10;
export const FLASHCARD_MAX_SCORE = 500;
export const FLASHCARD_TOTAL_ROUNDS = 5;

export function fromQuizResult(
  result: QuizResult,
  grade: SchoolGrade | null,
  activity = LEVEL0_QUIZ,
  mission = LEVEL0.mission
): ActivityResult {
  return {
    activityId: activity.id,
    missionId: mission.id,
    grade,
    mechanic: 'quiz',
    score: result.totalScore,
    maxScore: QUIZ_MAX_SCORE,
    correctCount: result.correctCount,
    totalItems: QUIZ_TOTAL_QUESTIONS,
    completed: result.completed,
    startedAt: result.startedAt,
    completedAt: result.completedAt,
    evidence: result.attempts,
  };
}

// Resultados do Nível 0 indexados por atividade, no formato que progress.ts usa.
export function level0Results(
  quiz: QuizResult | null | undefined,
  flashcards: FlashcardResult | null | undefined,
  grade: SchoolGrade | null
): Record<string, ActivityResult | null> {
  return {
    [LEVEL0_QUIZ.id]: quiz ? fromQuizResult(quiz, grade) : null,
    [LEVEL0_FLASHCARDS.id]: flashcards ? fromFlashcardResult(flashcards, grade) : null,
  };
}

export function fromFlashcardResult(
  result: FlashcardResult,
  grade: SchoolGrade | null,
  activity = LEVEL0_FLASHCARDS,
  mission = LEVEL0.mission
): ActivityResult {
  const rounds = result.roundAttempts ?? [];
  return {
    activityId: activity.id,
    missionId: mission.id,
    grade,
    mechanic: 'flashcards',
    score: result.totalScore,
    maxScore: FLASHCARD_MAX_SCORE,
    correctCount: rounds.filter(r => r.isCorrect).length,
    totalItems: FLASHCARD_TOTAL_ROUNDS,
    completed: result.completed,
    startedAt: result.startedAt,
    completedAt: result.completedAt,
    evidence: rounds,
  };
}
