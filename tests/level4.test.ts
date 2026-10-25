import { describe, expect, it } from 'vitest';
import { LEVEL4 } from '../src/content/level4';
import { LEVEL4_CONTENT } from '../src/data/level4Content';
import { getMissionProgress } from '../src/engines/progression/progress';
import { buildLevel4Result } from '../src/features/level4/level4Rules';
import type { ActivityResult } from '../src/core/types';

const empty = {} as Record<string, ActivityResult>;

describe('Nível 4: trabalho em equipe', () => {
  it('define seis atividades sequenciais', () => {
    expect(LEVEL4.mission.activities).toHaveLength(6);
    expect(getMissionProgress(LEVEL4, empty, true).activities.map(a => a.state)).toEqual([
      'available', 'locked', 'locked', 'locked', 'locked', 'locked',
    ]);
  });

  it('possui matriz curricular para 6º a 9º ano', () => {
    for (const grade of ['6', '7', '8', '9'] as const) {
      const content = LEVEL4_CONTENT[grade];
      expect(content.curriculum.theme).toBeTruthy();
      expect(content.curriculum.objects.length).toBeGreaterThan(0);
      expect(content.pistas[0].languageFocus).toBeTruthy();
      expect(content.direcoes[0].skill).toBeTruthy();
      expect(content.papeis[0].vocabulary.length).toBeGreaterThan(0);
      expect(content.mensagem[0].explanation).toBeTruthy();
      expect(content.revezamento.length).toBeGreaterThan(0);
      expect(content.revisao.length).toBeGreaterThan(0);
    }
  });

  it('gera resultado compatível com a progressão comum', () => {
    const result = buildLevel4Result(LEVEL4.mission.activities[0], '8', 100, 1, LEVEL4_CONTENT['8'].pistas[0]);
    expect(result).toMatchObject({ activityId: 'nivel4-pistas', missionId: 'nivel4-missao4', score: 100, completed: true });
  });
});
