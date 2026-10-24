import { describe, it, expect, vi } from 'vitest';
import { LEVEL0, LEVEL0_FLASHCARDS, LEVEL0_QUIZ } from '../src/content/level0';
import {
  fromFlashcardResult,
  fromQuizResult,
  level0Results,
  FLASHCARD_MAX_SCORE,
  QUIZ_MAX_SCORE,
} from '../src/engines/pedagogy/adapters';
import { getMissionProgress, getNextActivity } from '../src/engines/progression/progress';
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
  it('has one mission (Missão 0) with quiz and flashcards, in 2D', () => {
    expect(LEVEL0.id).toBe('nivel0');
    expect(LEVEL0.mode).toBe('2D');
    expect(LEVEL0.mission.id).toBe('nivel0-missao0');
    expect(LEVEL0.mission.number).toBe(LEVEL0.number);
    expect(LEVEL0.mission.title).toBe('Desvie das distrações do Zé Cartinha');
    expect(LEVEL0.mission.activities.map(a => a.id)).toEqual(['nivel0-quiz', 'nivel0-flashcards']);
    expect(LEVEL0_QUIZ).toMatchObject({ path: '/quiz', color: 'yellow', phrase: 'Responda e ganhe pontos!' });
    expect(LEVEL0_FLASHCARDS).toMatchObject({ path: '/flashcards', color: 'purple', phrase: 'Teste sua memória e acumule pontos!' });
  });

  it('uses unique activity ids', () => {
    const ids = LEVEL0.mission.activities.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Pedagogy adapters', () => {
  it('converts a quiz result keeping score and correct answers', () => {
    const r = fromQuizResult(quiz(), '7');
    expect(r).toMatchObject({
      activityId: 'nivel0-quiz',
      missionId: 'nivel0-missao0',
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
      activityId: 'nivel0-flashcards',
      missionId: 'nivel0-missao0',
      mechanic: 'flashcards',
      grade: null,
      score: 350,
      maxScore: FLASHCARD_MAX_SCORE,
      correctCount: 4,
      totalItems: 5,
    });
  });

  it('indexes level 0 results by activity and keeps nulls', () => {
    const results = level0Results(quiz(), null, '8');
    expect(results['nivel0-quiz']?.score).toBe(800);
    expect(results['nivel0-flashcards']).toBeNull();
  });
});

describe('Mission progress', () => {
  it('locks every activity while the grade is not chosen', () => {
    const p = getMissionProgress(LEVEL0, level0Results(null, null, null), false);
    expect(p.activities.every(a => a.state === 'locked')).toBe(true);
    expect(getNextActivity(p)).toBeNull();
  });

  it('opens both activities once unlocked and points to the first', () => {
    const p = getMissionProgress(LEVEL0, level0Results(null, null, '6'), true);
    expect(p.activities.map(a => a.state)).toEqual(['available', 'available']);
    expect(getNextActivity(p)?.id).toBe('nivel0-quiz');
  });

  it('completes the mission only when every activity is done', () => {
    const half = getMissionProgress(LEVEL0, level0Results(quiz(), null, '6'), true);
    expect(half.activities.map(a => a.state)).toEqual(['completed', 'available']);
    expect(half.completedCount).toBe(1);
    expect(half.total).toBe(2);
    expect(half.isCompleted).toBe(false);
    expect(getNextActivity(half)?.id).toBe('nivel0-flashcards');

    const full = getMissionProgress(LEVEL0, level0Results(quiz(), flashcards(), '6'), true);
    expect(full.isCompleted).toBe(true);
    expect(getNextActivity(full)).toBeNull();
  });

  it('does not count an unfinished result as completed', () => {
    const p = getMissionProgress(LEVEL0, level0Results(quiz({ completed: false }), null, '9'), true);
    expect(p.activities[0].state).toBe('available');
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
    events.emit('mission.started', { playerId: 'p1', levelId: 'nivel0', missionId: 'nivel0-missao0' });
    expect(second).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
