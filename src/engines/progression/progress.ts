// Estado da missão de um nível, derivado só dos resultados salvos.
// Não grava nada: quem guarda os resultados continua sendo o storageService.

import type { Activity, ActivityResult, ActivityState, Level, Mission } from '../../core/types';

export interface ActivityProgress {
  activity: Activity;
  state: ActivityState;
  result: ActivityResult | null;
}

export interface MissionProgress {
  levelId: string;
  mission: Mission;
  activities: ActivityProgress[];
  completedCount: number;
  total: number;
  // A missão (e o nível) termina quando todas as atividades forem concluídas.
  isCompleted: boolean;
}

// results: resultados por activityId (ausente = ainda não jogada).
// unlocked: false enquanto o jogador não escolheu a série.
export function getMissionProgress(
  level: Level,
  results: Record<string, ActivityResult | null | undefined>,
  unlocked: boolean
): MissionProgress {
  const { mission } = level;
  // Missão sequencial: só a primeira atividade não concluída fica disponível.
  let openSlot = true;
  const activities = mission.activities.map<ActivityProgress>(activity => {
    const result = results[activity.id] ?? null;
    let state: ActivityState;
    if (result?.completed) state = 'completed';
    else if (unlocked && (!mission.sequential || openSlot)) state = 'available';
    else state = 'locked';
    if (mission.sequential && state !== 'completed') openSlot = false;
    return { activity, state, result };
  });

  const completedCount = activities.filter(a => a.state === 'completed').length;
  return {
    levelId: level.id,
    mission,
    activities,
    completedCount,
    total: activities.length,
    isCompleted: activities.length > 0 && completedCount === activities.length,
  };
}

// Próxima atividade a jogar: a primeira disponível na ordem, ou null se acabou.
export function getNextActivity(progress: MissionProgress): Activity | null {
  const next = progress.activities.find(a => a.state === 'available');
  return next ? next.activity : null;
}
