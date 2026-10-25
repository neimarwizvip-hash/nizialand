import type { Activity, ActivityResult } from '../../core/types';
import type { SchoolGrade } from '../../data/level0Content';
import { LEVEL3_MISSION } from '../../content/level3';
import { LEVEL1_CONTENT } from '../../data/level1Content';
import { LEVEL2_CONTENT } from '../../data/level2Content';
import { LEVEL3_CONTENT } from '../../data/level3Content';
import { shuffleOptions, shuffled } from '../level2/level2Rules';
import type { Rng } from '../level2/level2Rules';

export { shuffleOptions, shuffled };

export const LEVEL3_POINT = 100;
export const LEVEL3_MAX_SCORE = 1000;
export const LEVEL3_MEMORY_SECONDS = 60;
export const LEVEL3_MAZE_SECONDS = 90;
export const LEVEL3_MAZE_WORDS = 5;

/** Teto da sala: 100 por item, no máximo 1000. */
export function level3MaxScore(items: number) { return Math.min(LEVEL3_MAX_SCORE, items * LEVEL3_POINT); }

/** Soma os pontos que podem ser obtidos nas seis salas da série escolhida. */
export function level3MissionMaxScore(grade: SchoolGrade) {
  const content = LEVEL3_CONTENT[grade];
  return [
    content.arrange.place.length + content.arrange.check.length,
    content.board.length,
    content.who.length,
    content.memory.length,
    content.maze.words.length,
    buildReviewItems(grade).length,
  ].reduce((total, items) => total + level3MaxScore(items), 0);
}

/** Resultado salvo de uma sala. `expectedItems` fixa o teto quando o andamento não tem total fixo (labirinto). */
export function buildLevel3Result(activity: Activity, grade: SchoolGrade | null, outcomes: { points: number; correct: boolean }[], startedAt: string, expectedItems?: number): ActivityResult {
  const totalItems = expectedItems ?? outcomes.length;
  const maxScore = level3MaxScore(totalItems);
  const raw = outcomes.reduce((s, o) => s + o.points, 0);
  return {
    activityId: activity.id, missionId: LEVEL3_MISSION.id, grade, mechanic: activity.mechanic,
    score: Math.min(maxScore, raw), maxScore,
    correctCount: Math.min(totalItems, outcomes.filter(o => o.correct).length), totalItems,
    completed: true, startedAt, completedAt: new Date().toISOString(), evidence: { outcomes },
  };
}

// Referências estáveis para o useLevel2Run (a função entra nas dependências do finish).
export const LEVEL3_BUILDER = (a: Activity, g: SchoolGrade | null, o: { points: number; correct: boolean }[], s: string) => buildLevel3Result(a, g, o, s);
export const LEVEL3_MAZE_BUILDER = (a: Activity, g: SchoolGrade | null, o: { points: number; correct: boolean }[], s: string) => buildLevel3Result(a, g, o, s, LEVEL3_MAZE_WORDS);

// O Zé cresce a cada sala (no celular deitado tem teto para não cobrir a tela).
export const ZE_ROOM_SIZES = [
  'w-20 sm:w-24 short:w-14',
  'w-24 sm:w-28 short:w-16',
  'w-28 sm:w-32 short:w-16',
  'w-28 sm:w-36 short:w-20',
  'w-32 sm:w-40 short:w-20',
  'w-36 sm:w-44 short:w-24',
  'w-40 sm:w-52 short:w-24',
];

export interface Level3Mc { question: string; options: string[]; answer: number; speak?: string }

/** Revisão: 2 itens do Nível 0 (escritos à mão) + 2 de ouvir e 2 de ordenar do Nível 1 + 2 de cada atividade do Nível 2 = 10. */
export function buildReviewItems(grade: SchoolGrade, rng: Rng = Math.random): Level3Mc[] {
  const l1 = LEVEL1_CONTENT[grade];
  const l2 = LEVEL2_CONTENT[grade];
  const raw: Level3Mc[] = [];
  for (const it of LEVEL3_CONTENT[grade].review.slice(0, 2)) raw.push({ question: it.prompt, options: it.options, answer: it.answer });
  for (const it of shuffled(l1.listen, rng).slice(0, 2)) {
    raw.push({ question: 'Ouça e escolha a palavra que você escutou.', options: it.options.map(o => o.text), answer: it.answer, speak: it.audio });
  }
  for (const it of shuffled(l1.order, rng).slice(0, 2)) {
    const words = it.sentence.split(' ');
    const wrong = new Set<string>();
    // Distratores: a mesma frase com palavras trocadas de lugar.
    for (let tries = 0; wrong.size < 2 && tries < 30; tries++) {
      const alt = shuffled(words, rng).join(' ');
      if (alt !== it.sentence) wrong.add(alt);
    }
    if (wrong.size < 2) wrong.add([...words].reverse().join(' ') + (wrong.size ? '!' : ''));
    raw.push({ question: `Qual é a ordem certa? (${it.pt})`, options: [it.sentence, ...wrong].slice(0, 3), answer: 0 });
  }
  for (const it of shuffled(l2.timed, rng).slice(0, 2)) raw.push({ question: it.question, options: it.options, answer: it.answer });
  for (const it of shuffled(l2.gapfill, rng).slice(0, 2)) raw.push({ question: `Complete: ${it.sentence}`, options: it.options, answer: it.answer });
  return raw.map(it => ({ ...it, ...shuffleOptions(it.options, it.answer, rng) }));
}

// ---- Labirinto ----
export type MazeCell = [number, number]; // [linha, coluna]
// 7 x 5, '#' = parede, 'S' = saída do aluno. Todas as casas livres se ligam.
export const MAZE_LAYOUT = ['S..#...', '.#...#.', '...#...', '.#...#.', '...#...'];
export const MAZE_ROWS = MAZE_LAYOUT.length;
export const MAZE_COLS = MAZE_LAYOUT[0].length;

export type MazeItemKind = 'word' | 'decoy' | 'ze';
export interface MazeItem { id: number; kind: MazeItemKind; label: string; cell: MazeCell }

export const isMazeWall = ([r, c]: MazeCell) => r < 0 || c < 0 || r >= MAZE_ROWS || c >= MAZE_COLS || MAZE_LAYOUT[r][c] === '#';

export function mazeStart(): MazeCell {
  for (let r = 0; r < MAZE_ROWS; r++) { const c = MAZE_LAYOUT[r].indexOf('S'); if (c >= 0) return [r, c]; }
  return [0, 0];
}

export function moveInMaze(pos: MazeCell, dir: 'up' | 'down' | 'left' | 'right'): MazeCell {
  const [r, c] = pos;
  const next: MazeCell = dir === 'up' ? [r - 1, c] : dir === 'down' ? [r + 1, c] : dir === 'left' ? [r, c - 1] : [r, c + 1];
  return isMazeWall(next) ? pos : next;
}

/** Espalha palavras certas, palavras erradas e cartas do Zé em casas livres (nunca na saída). */
export function placeMazeItems(words: string[], decoys: string[], zeCards: number, rng: Rng = Math.random): MazeItem[] {
  const free: MazeCell[] = [];
  for (let r = 0; r < MAZE_ROWS; r++) for (let c = 0; c < MAZE_COLS; c++) if (MAZE_LAYOUT[r][c] === '.') free.push([r, c]);
  const cells = shuffled(free, rng);
  const labels: { kind: MazeItemKind; label: string }[] = [
    ...words.map(label => ({ kind: 'word' as const, label })),
    ...decoys.map(label => ({ kind: 'decoy' as const, label })),
    ...Array.from({ length: zeCards }, () => ({ kind: 'ze' as const, label: '🃏' })),
  ];
  return labels.slice(0, cells.length).map((it, id) => ({ id, ...it, cell: cells[id] }));
}
