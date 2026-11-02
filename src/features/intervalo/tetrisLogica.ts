// Lógica pura do Tetris das palavras: formas, giro, encaixe, fixar e limpar linhas.
export const COLS = 10;
export const LINHAS = 16;

export type Forma = Array<[number, number]>; // células [x, y] relativas
export const FORMAS: Record<'I' | 'O' | 'T' | 'L' | 'J' | 'S' | 'Z', Forma> = {
  I: [[0, 1], [1, 1], [2, 1], [3, 1]],
  O: [[1, 0], [2, 0], [1, 1], [2, 1]],
  T: [[0, 1], [1, 1], [2, 1], [1, 0]],
  L: [[0, 1], [1, 1], [2, 1], [2, 0]],
  J: [[0, 1], [1, 1], [2, 1], [0, 0]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]],
  Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
};
export const CORES_FORMA: Record<keyof typeof FORMAS, string> = { I: '#14A3B8', O: '#F2B705', T: '#8A5CF6', L: '#F08A24', J: '#1F5FD0', S: '#2E9E5B', Z: '#E2483D' };

/** Célula ocupada: cor e se é "bagunça" (peça fora do tema que caiu no tabuleiro). */
export type Celula = { cor: string; baguna: boolean } | null;
export const tabuleiroVazio = (): Celula[][] => Array.from({ length: LINHAS }, () => Array<Celula>(COLS).fill(null));

/** Gira 90° no sentido horário dentro de uma caixa 4×4 (a peça O não gira). */
export function girar(f: Forma, tipo: keyof typeof FORMAS): Forma {
  if (tipo === 'O') return f;
  const n = tipo === 'I' ? 4 : 3;
  return f.map(([x, y]) => [n - 1 - y, x] as [number, number]);
}

export function cabe(tab: Celula[][], f: Forma, px: number, py: number): boolean {
  return f.every(([x, y]) => {
    const cx = px + x, cy = py + y;
    if (cx < 0 || cx >= COLS || cy >= LINHAS) return false;
    return cy < 0 || !tab[cy][cx];
  });
}

/** Fixa a peça (devolve false se alguma célula ficou acima do topo: fim de jogo). */
export function fixar(tab: Celula[][], f: Forma, px: number, py: number, cel: NonNullable<Celula>): boolean {
  let ok = true;
  for (const [x, y] of f) { const cy = py + y; if (cy < 0) { ok = false; continue; } tab[cy][px + x] = { ...cel }; }
  return ok;
}

/** Remove as linhas completas; devolve quantas saíram. */
export function limparLinhas(tab: Celula[][]): number {
  let n = 0;
  for (let y = LINHAS - 1; y >= 0; y--) {
    if (tab[y].every(Boolean)) { tab.splice(y, 1); tab.unshift(Array<Celula>(COLS).fill(null)); n++; y++; }
  }
  return n;
}
