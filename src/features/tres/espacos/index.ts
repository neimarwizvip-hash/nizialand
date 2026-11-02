import type { Kit } from '../cenaKit';
import { CAMERAS_SALA, construirSala } from './sala';
import { CAMERAS_QUADRA, construirQuadra } from './quadra';
import { CAMERAS_BIBLIOTECA, construirBiblioteca } from './biblioteca';

// Espaços 3D da escola, um por nível do mapa (decisão do professor, 02/11/2026).
export type NomeEspaco = 'sala' | 'quadra' | 'biblioteca';
export interface Camera3D { pos: readonly number[]; alvo: readonly number[]; fov: number }
export interface Espaco { nome: string; construir: (kit: Kit) => void; cameras: Record<string, Camera3D>; exposicao: number }

export const ESPACOS: Record<NomeEspaco, Espaco> = {
  sala: { nome: 'Sala de aula', construir: construirSala, cameras: CAMERAS_SALA, exposicao: 1.25 },
  quadra: { nome: 'Área externa e quadra', construir: construirQuadra, cameras: CAMERAS_QUADRA, exposicao: 1.2 },
  biblioteca: { nome: 'Biblioteca', construir: construirBiblioteca, cameras: CAMERAS_BIBLIOTECA, exposicao: 1.4 },
};
