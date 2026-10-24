import { describe, expect, it } from 'vitest';
import { LEVEL1, LEVEL1_LISTEN } from '../src/content/level1';
import { LEVEL0 } from '../src/content/level0';
import { getMissionProgress } from '../src/engines/progression/progress';
import { LEVEL1_CONTENT } from '../src/data/level1Content';
import { buildResult, itemPoints, maxScore, pickZeItems, shuffled } from '../src/features/level1/level1Rules';
import type { ActivityResult } from '../src/core/types';

const done = (id: string): ActivityResult => ({
  ...buildResult({ ...LEVEL1_LISTEN, id }, '8', [{ points: 100, correct: true }], new Date().toISOString()),
});

describe('Nível 1: desbloqueio', () => {
  it('fica tudo trancado enquanto não liberado', () => {
    const p = getMissionProgress(LEVEL1, {}, false);
    expect(p.activities.every(a => a.state === 'locked')).toBe(true);
  });

  it('libera as 4 atividades em sequência', () => {
    const ids = LEVEL1.mission.activities.map(a => a.id);
    expect(ids).toEqual(['nivel1-ouvir', 'nivel1-montar', 'nivel1-dialogo', 'nivel1-explorar']);
    let results: Record<string, ActivityResult> = {};
    for (let i = 0; i < ids.length; i++) {
      const p = getMissionProgress(LEVEL1, results, true);
      expect(p.activities.map(a => a.state)).toEqual(ids.map((_, j) => (j < i ? 'completed' : j === i ? 'available' : 'locked')));
      results = { ...results, [ids[i]]: done(ids[i]) };
    }
    const end = getMissionProgress(LEVEL1, results, true);
    expect(end.isCompleted).toBe(true);
    expect(end.completedCount).toBe(4);
  });

  it('Nível 0 incompleto não conta como completo', () => {
    expect(getMissionProgress(LEVEL0, {}, true).isCompleted).toBe(false);
  });
});

describe('Nível 1: pontuação', () => {
  it('100 na 1ª, 50 na 2ª, 0 depois ou no tempo esgotado', () => {
    expect(itemPoints(1)).toBe(100);
    expect(itemPoints(2)).toBe(50);
    expect(itemPoints(3)).toBe(0);
    expect(itemPoints(1, true)).toBe(0);
  });

  it('cada atividade vale no máximo 1000', () => {
    for (const grade of Object.keys(LEVEL1_CONTENT) as (keyof typeof LEVEL1_CONTENT)[]) {
      const c = LEVEL1_CONTENT[grade];
      for (const list of [c.listen, c.order, c.dialogue, c.explore]) {
        expect(list.length).toBeGreaterThan(0);
        expect(maxScore(list.length)).toBeLessThanOrEqual(1000);
      }
    }
  });

  it('buildResult soma pontos e marca concluída', () => {
    const r = buildResult(LEVEL1_LISTEN, '7', [
      { points: 100, correct: true }, { points: 50, correct: true }, { points: 0, correct: false },
    ], '2026-10-24T00:00:00.000Z');
    expect(r).toMatchObject({ activityId: 'nivel1-ouvir', score: 150, maxScore: 300, correctCount: 2, totalItems: 3, completed: true });
  });
});

describe('Nível 1: Zé e embaralhar', () => {
  it('Zé nunca atrapalha o 1º item e não repete', () => {
    for (let k = 0; k < 50; k++) {
      const z = pickZeItems(10, 3);
      expect(z).toHaveLength(3);
      expect(new Set(z).size).toBe(3);
      expect(z.every(i => i >= 1 && i < 10)).toBe(true);
    }
    expect(pickZeItems(1, 3)).toEqual([]);
  });

  it('shuffled mantém os elementos e não altera a lista', () => {
    const list = [1, 2, 3, 4, 5];
    const s = shuffled(list);
    expect([...s].sort()).toEqual(list);
    expect(list).toEqual([1, 2, 3, 4, 5]);
  });
});
