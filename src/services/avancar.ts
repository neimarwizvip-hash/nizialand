// Botão AVANÇAR do modo de teste (só no `npm run dev`, dentro da vistoria): conclui a próxima atividade
// pendente do nível em que o professor está e, quando o nível acaba, leva ao próximo. Nada vai para a planilha.
import type { ActivityResult, Level } from '../core/types';
import type { QuizResult, FlashcardResult } from '../types';
import { LEVEL1 } from '../content/level1';
import { LEVEL2 } from '../data/level2Content';
import { LEVEL3 } from '../content/level3';
import { LEVEL4 } from '../content/level4';
import { LEVEL5 } from '../content/level5';
import { LEVEL6 } from '../content/level6';
import { LEVEL7 } from '../content/level7';
import { LEVEL8 } from '../content/level8';
import { MISSION_MAP } from '../data/missionMap';
import { intervaloPorId } from '../features/intervalo/intervalos';

export const NIVEIS_COM_ATIVIDADES: Record<number, Level> = { 1: LEVEL1, 2: LEVEL2, 3: LEVEL3, 4: LEVEL4, 5: LEVEL5, 6: LEVEL6, 7: LEVEL7, 8: LEVEL8 };
export const ULTIMO_NIVEL_JOGAVEL = 8;

/** Em que nível o professor está, pela rota (null = fora de um nível, por exemplo no mapa). */
export function nivelDaRota(caminho: string): number | null {
  const intervalo = caminho.match(/^\/intervalo\/([^/]+)/);
  if (intervalo) return intervaloPorId(intervalo[1])?.nivel ?? null;
  const n = caminho.match(/^\/nivel(\d+)/);
  if (n) return Number(n[1]);
  if (/^\/(missions|quiz|flashcards|level0|historia)(\/|$)/.test(caminho)) return 0;
  return null;
}

export type Passo =
  | { tipo: 'quiz' }
  | { tipo: 'flashcards' }
  | { tipo: 'atividade'; nivel: number; resultado: ActivityResult; nome: string; feitas: number; total: number; ultima: boolean }
  | { tipo: 'proximo-nivel'; nivel: number; caminho: string }
  | { tipo: 'fim'; nivel: number };

/** O que o AVANÇAR faz agora no nível `nivel`. */
export function proximoPasso(nivel: number, resultados: Record<string, ActivityResult>, quiz: QuizResult | null, flash: FlashcardResult | null, agora = new Date().toISOString()): Passo {
  if (nivel === 0) {
    if (!quiz?.completed) return { tipo: 'quiz' };
    if (!flash?.completed) return { tipo: 'flashcards' };
    return { tipo: 'proximo-nivel', nivel: 1, caminho: MISSION_MAP[1].path };
  }
  const lvl = NIVEIS_COM_ATIVIDADES[nivel];
  if (!lvl) return { tipo: 'fim', nivel };
  const atividades = lvl.mission.activities;
  const pendente = atividades.find(a => !resultados[a.id]?.completed);
  if (pendente) {
    const feitas = atividades.filter(a => resultados[a.id]?.completed).length + 1;
    return {
      tipo: 'atividade', nivel, nome: pendente.name, feitas, total: atividades.length, ultima: feitas >= atividades.length,
      resultado: { activityId: pendente.id, missionId: lvl.mission.id, grade: null, mechanic: pendente.mechanic, score: 100, maxScore: 100, correctCount: 1, totalItems: 1, completed: true, startedAt: agora, completedAt: agora, evidence: { avancoDeTeste: true } },
    };
  }
  if (nivel >= ULTIMO_NIVEL_JOGAVEL) return { tipo: 'fim', nivel };
  return { tipo: 'proximo-nivel', nivel: nivel + 1, caminho: MISSION_MAP[nivel + 1].path };
}

export const QUIZ_DE_TESTE = (agora: string): QuizResult => ({ completed: true, totalScore: 1000, correctCount: 10, questionCount: 10, stars: 3, startedAt: agora, completedAt: agora, attempts: {} });
export const FLASHCARDS_DE_TESTE = (agora: string): FlashcardResult => ({ completed: true, totalScore: 500, roundsCompleted: 5, stars: 3, startedAt: agora, completedAt: agora, roundAttempts: [] });
