import { describe, it, expect } from 'vitest';
import { BUILT_IN_QUESTIONS, TOPICS, GRADES, buildRound, isValidQuestion } from '../src/data/questionBank';

describe('Level 0 question bank', () => {
  it('every built-in question is valid and has unique options', () => {
    for (const q of BUILT_IN_QUESTIONS) {
      expect(isValidQuestion(q)).toBe(true);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it('every grade has topics and every topic has at least 6 questions', () => {
    for (const g of GRADES) expect(TOPICS.some((t) => t.grade === g.id)).toBe(true);
    for (const t of TOPICS) expect(BUILT_IN_QUESTIONS.filter((q) => q.topic === t.id).length).toBeGreaterThanOrEqual(6);
  });

  it('buildRound mixes both topics and keeps the correct answer index right', () => {
    const round = buildRound(['8-comparatives', '8-past'], 10);
    expect(round).toHaveLength(10);
    expect(new Set(round.map((q) => q.topic))).toEqual(new Set(['8-comparatives', '8-past']));
    for (const q of round) expect(q.shuffled[q.correctIndex]).toBe(q.options[0]);
  });

  it('correct answers are not always in the same position', () => {
    const positions = new Set<number>();
    for (let i = 0; i < 20; i++) buildRound(['6-to-be'], 6).forEach((q) => positions.add(q.correctIndex));
    expect(positions.size).toBeGreaterThan(1);
  });
});
