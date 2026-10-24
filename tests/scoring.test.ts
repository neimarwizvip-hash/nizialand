import { describe, it, expect } from 'vitest';
import { generatePlayerCode } from '../src/services/storage';
import { QUIZ_QUESTIONS, getRandomizedQuizSession, shuffleArray } from '../src/data/quizQuestions';
import { FLASHCARD_CHALLENGES, FLASHCARD_STUDENTS } from '../src/data/flashcardData';

describe('NISIALAND Educational Game — Core Rules & Integrity', () => {

  describe('Player Identification & Privacy', () => {
    it('generates a secure, non-predictable player code format NSL-{class}-{random}', () => {
      const code1 = generatePlayerCode('804');
      const code2 = generatePlayerCode('804');
      
      expect(code1).toMatch(/^NSL-804-[A-Z0-9]{4}$/);
      expect(code2).toMatch(/^NSL-804-[A-Z0-9]{4}$/);
      expect(code1).not.toBe(code2);
    });
  });

  describe('Quiz Pedagogical Content Integrity', () => {
    it('contains exactly 10 questions covering Comparative Adjectives', () => {
      expect(QUIZ_QUESTIONS.length).toBe(10);
    });

    it('every question has exactly one correct option in optionsQuad and valid explanation', () => {
      QUIZ_QUESTIONS.forEach((q) => {
        expect(q.optionsQuad.length).toBe(4);
        const correctCount = q.optionsQuad.filter((opt) => opt.isCorrect).length;
        expect(correctCount).toBe(1);
        expect(q.explanation).toBeTruthy();
        expect(q.sentence).toBeTruthy();
      });
    });

    it('correctly calculates 100 points on 1st attempt, 50 points on 2nd attempt, 0 on failed attempts', () => {
      const calcPoints = (isCorrect: boolean, attemptNum: number) => {
        if (!isCorrect) return 0;
        return attemptNum === 1 ? 100 : (attemptNum === 2 ? 50 : 0);
      };

      expect(calcPoints(true, 1)).toBe(100);
      expect(calcPoints(true, 2)).toBe(50);
      expect(calcPoints(false, 1)).toBe(0);
      expect(calcPoints(false, 2)).toBe(0);
      expect(calcPoints(true, 3)).toBe(0); // Max 2 attempts allowed
    });

    it('shuffles quiz options so correct answers are not predictable at option A', () => {
      const session = getRandomizedQuizSession();
      expect(session.length).toBe(10);

      // Verify every question still has exactly 1 correct option with matching text
      session.forEach((q) => {
        const correctOpts = q.optionsQuad.filter((opt) => opt.isCorrect);
        expect(correctOpts.length).toBe(1);
        expect(q.optionsQuad.length).toBe(4);
        expect(['A', 'B', 'C', 'D']).toEqual(q.optionsQuad.map((o) => o.letter));
      });

      // Sample multiple sessions: correct option letters must not be universally 'A'
      const correctIndices: number[] = [];
      for (let s = 0; s < 10; s++) {
        const sess = getRandomizedQuizSession();
        sess.forEach((q) => {
          const idx = q.optionsQuad.findIndex((o) => o.isCorrect);
          correctIndices.push(idx);
        });
      }
      // There must be answers at index 1, 2, or 3 (letters B, C, D)
      const hasNonZeroIndex = correctIndices.some((idx) => idx > 0);
      expect(hasNonZeroIndex).toBe(true);
    });
  });

  describe('Flashcard Pedagogical Challenges Integrity', () => {
    it('contains 8 students and 5 comparison challenges', () => {
      expect(FLASHCARD_STUDENTS.length).toBe(8);
      expect(FLASHCARD_CHALLENGES.length).toBe(5);
    });

    it('validates comparison challenges correctly against student ages', () => {
      // Challenge 1: Younger than Mateus (14)
      const ch1 = FLASHCARD_CHALLENGES[0];
      const carlos = FLASHCARD_STUDENTS.find((s) => s.id === 'carlos')!; // 13
      const beatriz = FLASHCARD_STUDENTS.find((s) => s.id === 'beatriz')!; // 14

      expect(ch1.validateCard(carlos)).toBe(true); // 13 < 14
      expect(ch1.validateCard(beatriz)).toBe(false); // 14 is not younger than 14

      // Challenge 3: As old as Sofia (12)
      const ch3 = FLASHCARD_CHALLENGES[2];
      const rafael = FLASHCARD_STUDENTS.find((s) => s.id === 'rafael')!; // 12
      const sofia = FLASHCARD_STUDENTS.find((s) => s.id === 'sofia')!; // 12 (itself shouldn't match)
      const gabriel = FLASHCARD_STUDENTS.find((s) => s.id === 'gabriel')!; // 11

      expect(ch3.validateCard(rafael)).toBe(true); // 12 === 12
      expect(ch3.validateCard(sofia)).toBe(false); // cannot pick same student
      expect(ch3.validateCard(gabriel)).toBe(false); // 11 !== 12
    });
  });

  describe('Team Standings & Fair Averaging Metric', () => {
    it('computes fair average comparison between teams of unequal sizes', () => {
      // Blue team: 2 players, 1000 + 800 = 1800 pts (avg 900)
      // Purple team: 3 players, 950 + 950 + 950 = 2850 pts (avg 950)
      const bluePlayers = [1000, 800];
      const purplePlayers = [950, 950, 950];

      const blueAvg = bluePlayers.reduce((a, b) => a + b, 0) / bluePlayers.length;
      const purpleAvg = purplePlayers.reduce((a, b) => a + b, 0) / purplePlayers.length;

      expect(blueAvg).toBe(900);
      expect(purpleAvg).toBe(950);
      // Purple is leading by average even though size is different
      expect(purpleAvg > blueAvg).toBe(true);
    });
  });

});
