// Emissor de eventos tipado do jogo. Telas e serviços avisam o que
// aconteceu; quem precisar (pedagogia, progresso, painel) escuta.

import type { ActivityResult } from './types';

export interface GameEvents {
  'mission.started': { playerId: string; levelId: string; missionId: string };
  'activity.completed': { playerId: string; result: ActivityResult };
  'mission.completed': { playerId: string; levelId: string; missionId: string; result: ActivityResult };
  'level.completed': { playerId: string; levelId: string };
}

export type GameEventName = keyof GameEvents;
export type GameEventHandler<K extends GameEventName> = (payload: GameEvents[K]) => void;

export function createEmitter() {
  const handlers = new Map<GameEventName, Set<(payload: never) => void>>();

  return {
    on<K extends GameEventName>(name: K, handler: GameEventHandler<K>): () => void {
      let set = handlers.get(name);
      if (!set) {
        set = new Set();
        handlers.set(name, set);
      }
      set.add(handler as (payload: never) => void);
      return () => {
        set?.delete(handler as (payload: never) => void);
      };
    },
    emit<K extends GameEventName>(name: K, payload: GameEvents[K]): void {
      const set = handlers.get(name);
      if (!set) return;
      set.forEach(handler => {
        try {
          (handler as GameEventHandler<K>)(payload);
        } catch (err) {
          console.warn(`Erro em ouvinte de ${name}:`, err);
        }
      });
    },
    clear(): void {
      handlers.clear();
    },
  };
}

export type GameEmitter = ReturnType<typeof createEmitter>;

// Instância única usada pelo app.
export const gameEvents = createEmitter();
