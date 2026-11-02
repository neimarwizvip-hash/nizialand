// Lógica pura da Fuga no corredor (estilo Pac-Man): mapas, células livres e a escolha de caminho de quem persegue.
import type { Perseguidor } from '../../data/frasesIntervalo';

// '#' parede · '.' estrelinha · 'H' passe de corredor (hall pass) · 'P' largada do aluno · 'C' sala de quem persegue
export interface Rodada { nome: string; mapa: string[]; perseguidores: Array<{ quem: Perseguidor; vel: number; mira: 'direto' | 'adiante' }>; parede: string; brilho: string; piso: string }
export const RODADAS_FUGA: Rodada[] = [
  {
    nome: 'Corredor da coordenação', parede: '#2F6CC9', brilho: '#7FB0FF', piso: '#F3E9D2',
    perseguidores: [{ quem: 'vania', vel: 3.4, mira: 'direto' }],
    mapa: [
      '###############',
      '#H....#.#....H#',
      '#.##.......##.#',
      '#.#..##.##..#.#',
      '#...#.....#...#',
      '###.#.#C#.#.###',
      '#.....#.#.....#',
      '#.#.#.....#.#.#',
      '#.#...#P#...#.#',
      '#H..#.....#..H#',
      '###############',
    ],
  },
  {
    nome: 'Corredor da orientação', parede: '#7A4FD8', brilho: '#C3A6FF', piso: '#F1EBDD',
    perseguidores: [{ quem: 'leia', vel: 4.0, mira: 'adiante' }],
    mapa: [
      '###############',
      '#H...#...#...H#',
      '#.#.##.#.##.#.#',
      '#.#....#....#.#',
      '#...##...##...#',
      '#.#....C....#.#',
      '#.#.##.#.##.#.#',
      '#......P......#',
      '#.###.#.#.###.#',
      '#H....#.#....H#',
      '###############',
    ],
  },
  {
    nome: 'Corredor da direção', parede: '#8A5A2B', brilho: '#E0A96A', piso: '#EFE6D3',
    perseguidores: [{ quem: 'marcio', vel: 4.5, mira: 'direto' }, { quem: 'vania', vel: 3.3, mira: 'adiante' }],
    mapa: [
      '###############',
      '#H.....#.....H#',
      '#.###.#.#.###.#',
      '#.....#.#.....#',
      '##.#.......#.##',
      '#..#.##C##.#..#',
      '#.#....#....#.#',
      '#...##.P.##...#',
      '#.#....#....#.#',
      '#H..##...##..H#',
      '###############',
    ],
  },
];

export type Dir = [number, number];
export const DIRS: Dir[] = [[0, -1], [1, 0], [0, 1], [-1, 0]];

export const livre = (mapa: string[], x: number, y: number) => y >= 0 && y < mapa.length && x >= 0 && x < mapa[0].length && mapa[y][x] !== '#';
export const acharNoMapa = (mapa: string[], c: string): [number, number] => {
  for (let y = 0; y < mapa.length; y++) { const x = mapa[y].indexOf(c); if (x >= 0) return [x, y]; }
  return [1, 1];
};

/**
 * Próxima direção de quem persegue, numa encruzilhada: não volta (a não ser em beco),
 * vai para a saída que deixa mais perto do alvo (ou mais longe, quando está "confuso" pelo passe).
 */
export function escolherDirecao(mapa: string[], x: number, y: number, atual: Dir, alvo: [number, number], fugir = false): Dir {
  const opcoes = DIRS.filter(d => livre(mapa, x + d[0], y + d[1]) && !(d[0] === -atual[0] && d[1] === -atual[1] && (atual[0] || atual[1])));
  const lista = opcoes.length ? opcoes : DIRS.filter(d => livre(mapa, x + d[0], y + d[1]));
  if (!lista.length) return [0, 0];
  const dist = (d: Dir) => Math.hypot(x + d[0] - alvo[0], y + d[1] - alvo[1]);
  return lista.reduce((m, d) => (fugir ? dist(d) > dist(m) : dist(d) < dist(m)) ? d : m, lista[0]);
}
