// Modo vistoria (só no `npm run dev`): o professor abre qualquer nível/atividade direto, sem salvar nada.
// No build de produção import.meta.env.DEV é false: a rota some e o modo nunca liga.
import type { PlayerProfile } from '../types';

const KEY = 'nisialand_vistoria';

export function vistoriaAllowed(env: { DEV?: boolean } = import.meta.env): boolean {
  return env.DEV === true;
}

export function isVistoria(env: { DEV?: boolean } = import.meta.env): boolean {
  if (!vistoriaAllowed(env)) return false;
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
}

export function setVistoria(on: boolean, env: { DEV?: boolean } = import.meta.env): void {
  if (!vistoriaAllowed(env)) return;
  try {
    if (on) sessionStorage.setItem(KEY, '1');
    else sessionStorage.removeItem(KEY);
  } catch { /* sem sessionStorage: segue sem vistoria */ }
}

// Jogador só em memória (nunca vai para o armazenamento, lista de alunos ou ranking).
export const VISTORIA_PLAYER: PlayerProfile = {
  id: 'vistoria',
  playerCode: '',
  name: 'Vistoria',
  displayName: 'Vistoria',
  age: 0,
  className: '8º ano',
  team: 'blue',
  avatar: '',
  kind: 'guest',
  createdAt: '',
  lastLoginAt: '',
};
