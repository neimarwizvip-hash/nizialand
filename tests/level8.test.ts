import { describe, expect, it } from 'vitest';
import { LEVEL8 } from '../src/content/level8';
import { LEVEL8_CONTENT } from '../src/data/level8Content';
import { MISSION_MAP, getMissionMapState } from '../src/data/missionMap';
import { getMissionProgress } from '../src/engines/progression/progress';
import type { ActivityResult } from '../src/core/types';

const empty = {} as Record<string, ActivityResult>;

describe('Nível 8: organizado na prática', () => {
  it('define oito atividades sequenciais com rota própria', () => {
    expect(LEVEL8.mission.activities).toHaveLength(8);
    expect(LEVEL8.mission.sequential).toBe(true);
    expect(getMissionProgress(LEVEL8, empty, true).activities[0].state).toBe('available');
    expect(LEVEL8.mission.activities.every(a => a.path.startsWith('/nivel8/projeto?atividade=nivel8-'))).toBe(true);
  });

  it('possui matriz curricular e perguntas para 6º a 9º ano', () => {
    for (const grade of ['6', '7', '8', '9'] as const) {
      expect(LEVEL8_CONTENT[grade].curriculum.theme).toBeTruthy();
      expect(LEVEL8_CONTENT[grade].items.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('o mapa conta as oito atividades e exige o Nível 7 antes', () => {
    expect(MISSION_MAP[8].activityCount).toBe(LEVEL8.mission.activities.length);
    const estado = getMissionMapState(empty, null, null);
    expect(estado[8].state).toBe('locked');
  });
});
