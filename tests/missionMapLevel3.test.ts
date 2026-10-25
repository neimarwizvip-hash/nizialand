import { describe, expect, it } from 'vitest';
import { getMissionMapState, MISSION_MAP } from '../src/data/missionMap';
import { LEVEL3 } from '../src/content/level3';
import { LEVEL3_CONTENT } from '../src/data/level3Content';
import { getMissionProgress } from '../src/engines/progression/progress';
import { buildLevel3Result } from '../src/features/level3/level3Rules';
import type { ActivityResult } from '../src/core/types';

const empty = {} as Record<string, ActivityResult>;

describe('Mapa de missões', () => {
  it('exibe os níveis 0 a 10 na ordem', () => {
    expect(MISSION_MAP).toHaveLength(11);
    expect(MISSION_MAP.map(level => level.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(MISSION_MAP.every(level => level.icon && level.path)).toBe(true);
  });

  it('mantém os níveis futuros bloqueados até a missão anterior', () => {
    const state = getMissionMapState(empty, null, null);
    expect(state[0].state).toBe('available');
    expect(state.slice(1).every(level => level.state === 'locked')).toBe(true);
  });
});

describe('Nível 3', () => {
  it('define seis atividades sequenciais', () => {
    expect(LEVEL3.mission.activities).toHaveLength(6);
    expect(getMissionProgress(LEVEL3, empty, true).activities.map(a => a.state)).toEqual([
      'available', 'locked', 'locked', 'locked', 'locked', 'locked',
    ]);
  });

  it('possui conteúdo para as quatro séries', () => {
    for (const grade of ['6', '7', '8', '9'] as const) {
      expect(LEVEL3_CONTENT[grade].review.length).toBeGreaterThan(0);
      expect(LEVEL3_CONTENT[grade].arrange.length).toBeGreaterThan(0);
      expect(LEVEL3_CONTENT[grade].board.length).toBeGreaterThan(0);
      expect(LEVEL3_CONTENT[grade].who.length).toBeGreaterThan(0);
      expect(LEVEL3_CONTENT[grade].memory.length).toBeGreaterThan(0);
      expect(LEVEL3_CONTENT[grade].maze.length).toBeGreaterThan(0);
    }
  });

  it('gera resultado compatível com o progresso comum', () => {
    const result = buildLevel3Result(LEVEL3.mission.activities[0], '8', 100, 1, LEVEL3_CONTENT['8'].arrange[0]);
    expect(result).toMatchObject({ activityId: 'nivel3-arrume', missionId: 'nivel3-missao3', score: 100, completed: true });
  });
});
