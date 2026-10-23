import { describe, it, expect, vi } from 'vitest';
import { LEVEL0, LEVEL0_MISSION_FLASHCARDS, LEVEL0_MISSION_QUIZ } from '../src/content/level0';
import {
  fromFlashcardResult,
  fromQuizResult,
  level0Results,
  FLASHCARD_MAX_SCORE,
  QUIZ_MAX_SCORE,
} from '../src/engines/pedagogy/adapters';
import { getLevelProgress, getNextMission } from '../src/engines/progression/progress';
import { createEmitter } from '../src/core/events';
import type { FlashcardResult, QuizResult } from '../src/types';

const quiz = (overrides: Partial<QuizResult> = {}): QuizResult => ({
  completed: true,
  totalScore: 800,
  correctCount: 8,
  stars: 2,
  startedAt: '2026-10-23T10:00:00.000Z',
  completedAt: '2026-10-23T10:05:00.000Z',
  attempts: {},
  ...overrides,
});

const flashcards = (overrides: Partial<FlashcardResult> = {}): FlashcardResult => ({
  completed: true,
  totalScore: 350,
  roundsCompleted: 5,
  stars: 2,
  startedAt: '2026-10-23T10:10:00.000Z',
  completedAt: '2026-10-23T10:15:00.000Z',
  roundAttempts: [
    { round: 1, challengeId: 1, attemptsUsed: 1, chosenStudentId: 'a', isCorrect: true, pointsEarned: 100 },
    { round: 2, challengeId: 2, attemptsUsed: 2, chosenStudentId: 'b', isCorrect: true, pointsEarned: 50 },
    { round: 3, challengeId: 3, attemptsUsed: 3, chosenStudentId: 'c', isCorrect: false, pointsEarned: 0 },
    { round: 4, challengeId: 4, attemptsUsed: 1, chosenStudentId: 'd', isCorrect: true, pointsEarned: 100 },
    { round: 5, challengeId: 5, attemptsUsed: 1, chosenStudentId: 'e', isCorrect: true, pointsEarned: 100 },
  ],
  ...overrides,
});

describe('Level 0 structure', () => {
  it('has the quiz and flashcard missions in order, in 2D', () => {
    expect(LEVEL0.id).toBe('nivel0');
    expect(LEVEL0.mode).toBe('2D');
    expect(LEVEL0.missions.map(m => m.id)).toEqual(['nivel0-missao1', 'nivel0-missao2']);
    expect(LEVEL0_MISSION_QUIZ.activity.path).toBe('/quiz');
    expect(LEVEL0_MISSION_FLASHCARDS.activity.path).toBe('/flashcards');
  });

  it('only requires missions that exist in the level', () => {
    const ids = new Set(LEVEL0.missions.map(m => m.id));
    for (const m of LEVEL0.missions) {
      for (const req of m.requires) expect(ids.has(req)).toBe(true);
    }
  });
});

describe('Pedagogy adapters', () => {
  it('converts a quiz result keeping score and correct answers', () => {
    const r = fromQuizResult(quiz(), '7');
    expect(r).toMatchObject({
      missionId: 'nivel0-missao1',
      mechanic: 'quiz',
      grade: '7',
      score: 800,
      maxScore: QUIZ_MAX_SCORE,
      correctCount: 8,
      totalItems: 10,
      completed: true,
    });
  });

  it('converts a flashcard result counting correct rounds', () => {
    const r = fromFlashcardResult(flashcards(), null);
    expect(r).toMatchObject({
      missionId: 'nivel0-missao2',
      mechanic: 'flashcards',
      grade: null,
      score: 350,
      maxScore: FLASHCARD_MAX_SCORE,
      correctCount: 4,
      totalItems: 5,
    });
  });

  it('indexes level 0 results by mission and keeps nulls', () => {
    const results = level0Results(quiz(), null, '8');
    expect(results['nivel0-missao1']?.score).toBe(800);
    expect(results['nivel0-missao2']).toBeNull();
  });
});

describe('Level progress', () => {
  it('locks every mission while the grade is not chosen', () => {
    const p = getLevelProgress(LEVEL0, level0Results(null, null, null), false);
    expect(p.missions.every(m => m.state === 'locked')).toBe(true);
    expect(getNextMission(p)).toBeNull();
  });

  it('opens both missions once unlocked and points to the first', () => {
    const p = getLevelProgress(LEVEL0, level0Results(null, null, '6'), true);
    expect(p.missions.map(m => m.state)).toEqual(['available', 'available']);
    expect(getNextMission(p)?.id).toBe('nivel0-missao1');
  });

  it('marks finished missions and completes the level', () => {
    const half = getLevelProgress(LEVEL0, level0Results(quiz(), null, '6'), true);
    expect(half.missions.map(m => m.state)).toEqual(['completed', 'available']);
    expect(half.completedCount).toBe(1);
    expect(half.isCompleted).toBe(false);
    expect(getNextMission(half)?.id).toBe('nivel0-missao2');

    const full = getLevelProgress(LEVEL0, level0Results(quiz(), flashcards(), '6'), true);
    expect(full.isCompleted).toBe(true);
    expect(getNextMission(full)).toBeNull();
  });

  it('does not count an unfinished result as completed', () => {
    const p = getLevelProgress(LEVEL0, level0Results(quiz({ completed: false }), null, '9'), true);
    expect(p.missions[0].state).toBe('available');
  });
});

describe('Game events', () => {
  it('delivers payloads and stops after unsubscribing', () => {
    const events = createEmitter();
    const handler = vi.fn();
    const off = events.on('level.completed', handler);
    events.emit('level.completed', { playerId: 'p1', levelId: 'nivel0' });
    off();
    events.emit('level.completed', { playerId: 'p1', levelId: 'nivel0' });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ playerId: 'p1', levelId: 'nivel0' });
  });

  it('keeps calling other listeners when one throws', () => {
    const events = createEmitter();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const second = vi.fn();
    events.on('mission.started', () => { throw new Error('boom'); });
    events.on('mission.started', second);
    events.emit('mission.started', { playerId: 'p1', levelId: 'nivel0', missionId: 'nivel0-missao1' });
    expect(second).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
