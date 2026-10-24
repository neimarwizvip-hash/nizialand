import type { Activity, ActivityResult, Level } from '../../core/types';
import type { SchoolGrade } from '../../data/level0Content';
import { LEVEL2_MISSION } from '../../data/level2Content';
import { getMissionProgress } from '../../engines/progression/progress';

export const LEVEL2_ITEM_SECONDS = 20;
export const LEVEL2_POINT_FIRST = 100;
export const LEVEL2_POINT_SECOND = 50;
export function level2Points(attempt: number, timeout = false): number {
  if (timeout || attempt < 1) return 0;
  return attempt === 1 ? LEVEL2_POINT_FIRST : attempt === 2 ? LEVEL2_POINT_SECOND : 0;
}
export function level2MaxScore(items: number) { return Math.min(1000, items * LEVEL2_POINT_FIRST); }
export function buildLevel2Result(activity: Activity, grade: SchoolGrade | null, outcomes: { points: number; correct: boolean }[], startedAt: string): ActivityResult {
  return { activityId: activity.id, missionId: LEVEL2_MISSION.id, grade, mechanic: activity.mechanic, score: outcomes.reduce((s, o) => s + o.points, 0), maxScore: level2MaxScore(outcomes.length), correctCount: outcomes.filter(o => o.correct).length, totalItems: outcomes.length, completed: true, startedAt, completedAt: new Date().toISOString(), evidence: { outcomes } };
}

// ---- Tempo e ritmo ----
export const LEVEL2_WARNING_SECONDS = 5;
// Quanto tempo o "errou + resposta certa" fica na tela antes de avançar sozinho.
export const LEVEL2_FEEDBACK_MS = 1500;
export const RACE_SECONDS = 60;
export const WORDSEARCH_SECONDS = 90;
export const GRID_SIZE = 8;
export const DUEL_CARDS = 3;

export type Rng = () => number;

export function shuffled<T>(list: T[], rng: Rng = Math.random): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Embaralha as opções (no conteúdo a certa é sempre a 0) e devolve o novo índice da certa. */
export function shuffleOptions(options: string[], answer: number, rng: Rng = Math.random): { options: string[]; answer: number } {
  const order = shuffled(options.map((_, i) => i), rng);
  return { options: order.map(i => options[i]), answer: order.indexOf(answer) };
}

// ---- Duelo de bafo ----
export interface DuelState { zeCards: number; myCards: number; winner: 'player' | 'ze' | null }
export const duelStart = (cards = DUEL_CARDS): DuelState => ({ zeCards: cards, myCards: cards, winner: null });

/** Acertou: vira uma carta do Zé. Errou (ou tempo acabou): o Zé vira uma sua. */
export function duelStep(state: DuelState, correct: boolean): DuelState {
  if (state.winner) return state;
  const zeCards = correct ? Math.max(0, state.zeCards - 1) : state.zeCards;
  const myCards = correct ? state.myCards : Math.max(0, state.myCards - 1);
  return { zeCards, myCards, winner: zeCards === 0 ? 'player' : myCards === 0 ? 'ze' : null };
}

// ---- Caça-palavras ----
export type Cell = [number, number];
export interface WordPlacement { word: string; cells: Cell[] }
export interface WordGrid { grid: string[][]; placements: WordPlacement[] }

const DIRECTIONS: Cell[] = [[0, 1], [1, 0], [1, 1]];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function tryBuild(words: string[], size: number, rng: Rng): WordGrid | null {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placements: WordPlacement[] = [];
  for (const word of words.map(w => w.toUpperCase()).sort((a, b) => b.length - a.length)) {
    if (word.length > size) return null;
    let placed = false;
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const [dr, dc] = DIRECTIONS[Math.floor(rng() * DIRECTIONS.length)];
      const r0 = Math.floor(rng() * (size - dr * (word.length - 1)));
      const c0 = Math.floor(rng() * (size - dc * (word.length - 1)));
      const cells: Cell[] = [...word].map((_, i) => [r0 + dr * i, c0 + dc * i]);
      if (cells.every(([r, c], i) => grid[r][c] === '' || grid[r][c] === word[i])) {
        cells.forEach(([r, c], i) => { grid[r][c] = word[i]; });
        placements.push({ word, cells });
        placed = true;
      }
    }
    if (!placed) return null;
  }
  for (const row of grid) for (let c = 0; c < size; c++) if (!row[c]) row[c] = LETTERS[Math.floor(rng() * LETTERS.length)];
  const order = words.map(w => w.toUpperCase());
  placements.sort((a, b) => order.indexOf(a.word) - order.indexOf(b.word));
  return { grid, placements };
}

/** Grade NxN com as palavras na horizontal, vertical ou diagonal; o resto é letra aleatória. */
export function buildWordGrid(words: string[], size = GRID_SIZE, rng: Rng = Math.random): WordGrid {
  for (let i = 0; i < 100; i++) {
    const built = tryBuild(words, size, rng);
    if (built) return built;
  }
  throw new Error('Não coube na grade: ' + words.join(', '));
}

/** Células em linha reta (horizontal, vertical ou diagonal) entre duas pontas; null se não for reta. */
export function cellsBetween(a: Cell, b: Cell): Cell[] | null {
  const dRow = b[0] - a[0];
  const dCol = b[1] - a[1];
  if (dRow !== 0 && dCol !== 0 && Math.abs(dRow) !== Math.abs(dCol)) return null;
  const len = Math.max(Math.abs(dRow), Math.abs(dCol));
  return Array.from({ length: len + 1 }, (_, i) => [a[0] + Math.sign(dRow) * i, a[1] + Math.sign(dCol) * i] as Cell);
}

/** Palavra que vai exatamente de uma ponta à outra (em qualquer sentido), ou null. */
export function matchSelection(placements: WordPlacement[], start: Cell, end: Cell): string | null {
  const same = (x: Cell, y: Cell) => x[0] === y[0] && x[1] === y[1];
  const hit = placements.find(p => {
    const first = p.cells[0];
    const last = p.cells[p.cells.length - 1];
    return (same(first, start) && same(last, end)) || (same(first, end) && same(last, start));
  });
  return hit ? hit.word : null;
}

// ---- ?atividade= ----
/** Atividade pedida na URL, só se já estiver liberada (disponível ou concluída) na ordem da missão. */
export function resolveRequestedActivity(level: Level, results: Record<string, ActivityResult | null | undefined>, id: string | null, unlocked: boolean): Activity | null {
  if (!id) return null;
  const entry = getMissionProgress(level, results, unlocked).activities.find(a => a.activity.id === id);
  return entry && entry.state !== 'locked' ? entry.activity : null;
}
