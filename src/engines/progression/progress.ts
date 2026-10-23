// Estado das missões de um nível, derivado só dos resultados salvos.
// Não grava nada: quem guarda os resultados continua sendo o storageService.

import type { ActivityResult, Level, Mission, MissionState } from '../../core/types';

export interface MissionProgress {
  mission: Mission;
  state: MissionState;
  result: ActivityResult | null;
}

export interface LevelProgress {
  levelId: string;
  missions: MissionProgress[];
  completedCount: number;
  total: number;
  isCompleted: boolean;
}

// results: resultados por missionId (ausente = ainda não jogada).
// unlocked: false enquanto o jogador não escolheu a série.
export function getLevelProgress(
  level: Level,
  results: Record<string, ActivityResult | null | undefined>,
  unlocked: boolean
): LevelProgress {
  const isDone = (missionId: string) => !!results[missionId]?.completed;

  const missions = level.missions.map<MissionProgress>(mission => {
    const result = results[mission.id] ?? null;
    let state: MissionState;
    if (isDone(mission.id)) state = 'completed';
    else if (unlocked && mission.requires.every(isDone)) state = 'available';
    else state = 'locked';
    return { mission, state, result };
  });

  const completedCount = missions.filter(m => m.state === 'completed').length;
  return {
    levelId: level.id,
    missions,
    completedCount,
    total: missions.length,
    isCompleted: missions.length > 0 && completedCount === missions.length,
  };
}

// Próxima missão a jogar: a primeira disponível na ordem, ou null se acabou.
export function getNextMission(progress: LevelProgress): Mission | null {
  const next = progress.missions.find(m => m.state === 'available');
  return next ? next.mission : null;
}
