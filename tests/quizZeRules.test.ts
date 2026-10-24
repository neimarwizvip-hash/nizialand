import { describe, it, expect } from 'vitest';
import {
  QUESTION_SECONDS, ZE_APPEARANCES, ZE_LINES, pickZeQuestions, timedOutAttempt, isZeBlocking, zeSizeStage, zeLine,
} from '../src/features/quiz/zeRules';
import { QUIZ_SESSION_SIZE } from '../src/data/level0Content';

describe('Quiz Nível 0 — tempo e Zé Cartinha', () => {
  it('cada pergunta tem no máximo 20 s', () => {
    expect(QUESTION_SECONDS).toBe(20);
  });

  it('estourar o tempo vale 0 ponto', () => {
    const a = timedOutAttempt(7, 1);
    expect(a.pointsEarned).toBe(0);
    expect(a.isCorrect).toBe(false);
    expect(a.selectedOptionIndex).toBe(-1);
    expect(a.questionId).toBe(7);
  });

  it('Zé aparece em exatamente 2 perguntas, nunca na 1ª', () => {
    for (let n = 0; n < 500; n++) {
      const picks = pickZeQuestions(QUIZ_SESSION_SIZE);
      expect(picks).toHaveLength(ZE_APPEARANCES);
      expect(ZE_APPEARANCES).toBeLessThanOrEqual(2);
      expect(new Set(picks).size).toBe(picks.length);
      picks.forEach((i) => {
        expect(i).toBeGreaterThanOrEqual(1);
        expect(i).toBeLessThan(QUIZ_SESSION_SIZE);
      });
    }
  });

  it('sorteio cobre todas as perguntas 2–5', () => {
    const seen = new Set<number>();
    for (let n = 0; n < 500; n++) pickZeQuestions(5).forEach((i) => seen.add(i));
    expect([...seen].sort()).toEqual([1, 2, 3, 4]);
  });

  it('cresce até travar as respostas e repete as falas', () => {
    expect(isZeBlocking(0)).toBe(false);
    expect(isZeBlocking(3)).toBe(true);
    expect(zeSizeStage(10)).toBe(3);
    expect(zeLine(ZE_LINES.length)).toBe(ZE_LINES[0]);
  });
});
