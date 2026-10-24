import { describe, expect, it } from 'vitest';
import { LEVEL2, LEVEL2_CONTENT } from '../src/data/level2Content';
import { getMissionProgress } from '../src/engines/progression/progress';
import { buildLevel2Result, level2MaxScore, level2Points } from '../src/features/level2/level2Rules';
import type { ActivityResult } from '../src/core/types';

const done = (id: string): ActivityResult => buildLevel2Result(
  LEVEL2.mission.activities.find(a => a.id === id)!, '8', [{ points: 100, correct: true }], '2026-10-24T00:00:00.000Z'
);

describe('Nível 2: conteúdo e progressão', () => {
  it('tem seis estações sequenciais', () => {
    expect(LEVEL2.mode).toBe('2D');
    expect(LEVEL2.mission.activities).toHaveLength(6);
    const p = getMissionProgress(LEVEL2, {}, true);
    expect(p.activities.map(a => a.state)).toEqual(['available', 'locked', 'locked', 'locked', 'locked', 'locked']);
  });

  it('libera uma estação por vez e conclui a missão', () => {
    let results: Record<string, ActivityResult> = {};
    for (const activity of LEVEL2.mission.activities) {
      const p = getMissionProgress(LEVEL2, results, true);
      expect(p.activities.find(a => a.activity.id === activity.id)?.state).toBe('available');
      results = { ...results, [activity.id]: done(activity.id) };
    }
    expect(getMissionProgress(LEVEL2, results, true).isCompleted).toBe(true);
  });

  it('tem conteúdo para as quatro séries', () => {
    for (const grade of ['6', '7', '8', '9'] as const) {
      const content = LEVEL2_CONTENT[grade];
      expect(content.dictation.length).toBeGreaterThan(0);
      expect(content.wordsearch.length).toBeGreaterThan(0);
      expect(content.truefalse.length).toBeGreaterThan(0);
      expect(content.gapfill.length).toBeGreaterThan(0);
      expect(content.timed.length).toBeGreaterThan(0);
      expect(content.duel.length).toBeGreaterThan(0);
    }
  });
});

describe('Nível 2: regras de pontuação', () => {
  it('pontua primeira e segunda tentativa', () => {
    expect(level2Points(1)).toBe(100);
    expect(level2Points(2)).toBe(50);
    expect(level2Points(3)).toBe(0);
    expect(level2Points(1, true)).toBe(0);
  });

  it('limita cada atividade a 1000 pontos', () => {
    expect(level2MaxScore(3)).toBe(300);
    expect(level2MaxScore(12)).toBe(1000);
  });
});
