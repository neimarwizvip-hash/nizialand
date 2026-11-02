// Lógica pura dos labirintos (sem desenho): geração, paredes, caminho mais curto e direção relativa.
// Usada pelo labirinto 3D em primeira pessoa e pela versão 2D (reserva para aparelhos sem 3D).
import { LUGARES, type Relativa } from '../../data/frasesIntervalo';

/** Lados de uma célula: 0 cima (−z), 1 direita (+x), 2 baixo (+z), 3 esquerda (−x). */
export type Lado = 0 | 1 | 2 | 3;
export const DELTA: Record<Lado, [number, number]> = { 0: [0, -1], 1: [1, 0], 2: [0, 1], 3: [-1, 0] };
const OPOSTO: Record<Lado, Lado> = { 0: 2, 1: 3, 2: 0, 3: 1 };

export interface Porta { x: number; y: number; lado: Lado; lugar: number }
export interface Lab { c: number; l: number; paredes: boolean[][][]; portas: Porta[]; alvo: number }

/** Labirinto perfeito (busca em profundidade) com portas nos becos sem saída longe da largada (0,0). */
export function gerarLabirinto(c: number, l: number, nPortas = 4, rnd: () => number = Math.random): Lab {
  const paredes = Array.from({ length: l }, () => Array.from({ length: c }, () => [true, true, true, true]));
  const visto = Array.from({ length: l }, () => Array(c).fill(false));
  const pilha: Array<[number, number]> = [[0, 0]];
  visto[0][0] = true;
  while (pilha.length) {
    const [x, y] = pilha[pilha.length - 1];
    const op = ([0, 1, 2, 3] as Lado[]).filter(d => {
      const nx = x + DELTA[d][0], ny = y + DELTA[d][1];
      return nx >= 0 && ny >= 0 && nx < c && ny < l && !visto[ny][nx];
    });
    if (!op.length) { pilha.pop(); continue; }
    const d = op[Math.floor(rnd() * op.length)];
    const nx = x + DELTA[d][0], ny = y + DELTA[d][1];
    paredes[y][x][d] = false; paredes[ny][nx][OPOSTO[d]] = false; visto[ny][nx] = true; pilha.push([nx, ny]);
  }
  // Becos sem saída (3 paredes): a porta fica na parede de frente para quem chega.
  const becos: Porta[] = [];
  for (let y = 0; y < l; y++) for (let x = 0; x < c; x++) {
    const p = paredes[y][x];
    if (x + y < 2 || p.filter(Boolean).length !== 3) continue;
    const aberto = p.findIndex(v => !v) as Lado;
    becos.push({ x, y, lado: OPOSTO[aberto], lugar: -1 });
  }
  // Se faltarem becos, usa outras células com parede (nunca a largada).
  const extras: Porta[] = [];
  for (let y = 0; y < l; y++) for (let x = 0; x < c; x++) {
    if (x + y < 2 || becos.some(b => b.x === x && b.y === y)) continue;
    const lado = ([0, 1, 2, 3] as Lado[]).find(d => paredes[y][x][d]);
    if (lado !== undefined) extras.push({ x, y, lado, lugar: -1 });
  }
  const embaralhar = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // Prefere becos mais longe da largada (o desafio cresce com o labirinto).
  becos.sort((a, b) => (b.x + b.y) - (a.x + a.y) + (rnd() - 0.5) * 3);
  const escolhidas = [...becos, ...embaralhar(extras)].slice(0, Math.max(2, nPortas));
  const lugares = embaralhar(LUGARES.map((_, i) => i));
  const portas = escolhidas.map((p, i) => ({ ...p, lugar: lugares[i % lugares.length] }));
  return { c, l, paredes, portas, alvo: portas[Math.floor(rnd() * portas.length)].lugar };
}

/** Há parede deste lado da célula? Fora do labirinto conta como parede. */
export function temParede(lab: Lab, x: number, y: number, lado: Lado): boolean {
  if (x < 0 || y < 0 || x >= lab.c || y >= lab.l) return true;
  return lab.paredes[y][x][lado];
}

/** Caminho mais curto (lista de células, da origem ao destino inclusive). */
export function caminho(lab: Lab, de: [number, number], para: [number, number]): Array<[number, number]> {
  const chave = (x: number, y: number) => y * lab.c + x;
  const veio = new Map<number, number>([[chave(...de), -1]]);
  const fila: Array<[number, number]> = [de];
  while (fila.length) {
    const [x, y] = fila.shift()!;
    if (x === para[0] && y === para[1]) break;
    for (const d of [0, 1, 2, 3] as Lado[]) {
      if (lab.paredes[y][x][d]) continue;
      const nx = x + DELTA[d][0], ny = y + DELTA[d][1];
      if (veio.has(chave(nx, ny))) continue;
      veio.set(chave(nx, ny), chave(x, y));
      fila.push([nx, ny]);
    }
  }
  if (!veio.has(chave(...para))) return [];
  const lista: Array<[number, number]> = [];
  let k = chave(...para);
  while (k !== -1) { lista.unshift([k % lab.c, Math.floor(k / lab.c)]); k = veio.get(k)!; }
  return lista;
}

/** Para onde virar: de frente para `olhando`, querendo ir para `quer` (lados absolutos). */
export function relativa(olhando: Lado, quer: Lado): Relativa {
  return (['frente', 'direita', 'tras', 'esquerda'] as Relativa[])[(quer - olhando + 4) % 4];
}

/** Lado para onde a câmera olha (giro em radianos; 0 = olhando para −z). */
export function ladoDoGiro(giro: number): Lado {
  // frente = (−sen g, −cos g): 0 → −z (cima), −π/2 → +x (direita)
  const a = Math.round((-giro / (Math.PI / 2))) % 4;
  return (((a % 4) + 4) % 4) as Lado;
}

/** A dica de direção: o próximo passo até a porta certa, já em relação a quem anda. */
export function dicaDeDirecao(lab: Lab, celula: [number, number], giro: number): { tipo: 'andar' | 'chegou'; rel: Relativa } | null {
  const alvo = lab.portas.find(p => p.lugar === lab.alvo);
  if (!alvo) return null;
  const olhando = ladoDoGiro(giro);
  if (celula[0] === alvo.x && celula[1] === alvo.y) return { tipo: 'chegou', rel: relativa(olhando, alvo.lado) };
  const rota = caminho(lab, celula, [alvo.x, alvo.y]);
  if (rota.length < 2) return null;
  const [nx, ny] = rota[1];
  const lado = ([0, 1, 2, 3] as Lado[]).find(d => celula[0] + DELTA[d][0] === nx && celula[1] + DELTA[d][1] === ny)!;
  return { tipo: 'andar', rel: relativa(olhando, lado) };
}
