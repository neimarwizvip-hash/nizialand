import { describe, expect, it } from 'vitest';
import { LEVEL6 } from '../src/content/level6';
import { LEVEL7 } from '../src/content/level7';
import { LEVEL6_CONTENT } from '../src/data/level6Content';
import { LEVEL7_CONTENT } from '../src/data/level7Content';
import { getMissionProgress } from '../src/engines/progression/progress';
import type { ActivityResult } from '../src/core/types';

const empty = {} as Record<string, ActivityResult>;

describe('Níveis 6 e 7', () => {
  it('define sete atividades no Nível 6 e oito no Nível 7', () => {
    expect(LEVEL6.mission.activities).toHaveLength(7);
    expect(LEVEL7.mission.activities).toHaveLength(8);
    expect(getMissionProgress(LEVEL6, empty, true).activities[0].state).toBe('available');
    expect(getMissionProgress(LEVEL7, empty, true).activities[0].state).toBe('available');
  });

  it('possui conteúdos curriculares para 6º a 9º ano', () => {
    for (const grade of ['6', '7', '8', '9'] as const) {
      expect(LEVEL6_CONTENT[grade].curriculum.theme).toBeTruthy();
      expect(LEVEL6_CONTENT[grade].items.length).toBeGreaterThan(0);
      expect(LEVEL7_CONTENT[grade].curriculum.theme).toBeTruthy();
      expect(LEVEL7_CONTENT[grade].items.length).toBeGreaterThan(0);
    }
  });

  it('mantém as fases sequenciais', () => {
    expect(LEVEL6.mission.sequential).toBe(true);
    expect(LEVEL7.mission.sequential).toBe(true);
  });
});
