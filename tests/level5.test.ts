import { describe, expect, it } from 'vitest';
import { LEVEL5 } from '../src/content/level5';
import { LEVEL5_CONTENT } from '../src/data/level5Content';
import { getMissionProgress } from '../src/engines/progression/progress';
import { buildLevel5Result } from '../src/features/level5/level5Rules';
import type { ActivityResult } from '../src/core/types';

const empty = {} as Record<string, ActivityResult>;

describe('Nível 5: minhas escolhas', () => {
  it('define sete atividades sequenciais', () => {
    expect(LEVEL5.mission.activities).toHaveLength(7);
    expect(getMissionProgress(LEVEL5, empty, true).activities.map(a => a.state)).toEqual([
      'available', 'locked', 'locked', 'locked', 'locked', 'locked', 'locked',
    ]);
  });

  it('possui matriz curricular para cada série', () => {
    for (const grade of ['6', '7', '8', '9'] as const) {
      const c = LEVEL5_CONTENT[grade];
      expect(c.curriculum.theme).toBeTruthy();
      expect(c.curriculum.objects.length).toBeGreaterThan(0);
      expect(c.dialogos[0].languageFocus).toBeTruthy();
      expect(c.sentimentos[0].skill).toBe('listening');
      expect(c.conselho[0].vocabulary.length).toBeGreaterThan(0);
      expect(c.se[0].explanation).toBeTruthy();
      expect(c.revisao.length).toBeGreaterThan(0);
    }
  });

  it('gera resultado compatível com o progresso', () => {
    const result = buildLevel5Result(LEVEL5.mission.activities[0], '8', 100, 1, LEVEL5_CONTENT['8'].dialogos[0]);
    expect(result).toMatchObject({ activityId: 'nivel5-dialogos', missionId: 'nivel5-missao5', score: 100, completed: true });
  });
});
