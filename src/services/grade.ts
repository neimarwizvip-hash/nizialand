import { PlayerProfile } from '../types';
import { SchoolGrade, SCHOOL_GRADES } from '../data/level0Content';

// Série do aluno no Nível 0.
// 1) escolha salva pelo aluno no mapa; 2) turma (1º dígito: 603 → 6º, 801 → 8º); 3) nenhuma → o mapa pede a escolha.
const GRADE_KEY = 'nisialand_grade_v1';

function readChoices(): Record<string, SchoolGrade> {
  try {
    const raw = localStorage.getItem(GRADE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function gradeFromClassName(className?: string): SchoolGrade | null {
  const first = (className || '').trim().charAt(0);
  return (SCHOOL_GRADES as string[]).includes(first) ? (first as SchoolGrade) : null;
}

export function getPlayerGrade(player: PlayerProfile | null | undefined): SchoolGrade | null {
  if (!player) return null;
  const saved = readChoices()[player.id];
  if (saved && SCHOOL_GRADES.includes(saved)) return saved;
  return gradeFromClassName(player.className);
}

export function setPlayerGrade(player: PlayerProfile, grade: SchoolGrade): void {
  try {
    const choices = readChoices();
    choices[player.id] = grade;
    localStorage.setItem(GRADE_KEY, JSON.stringify(choices));
  } catch {
    // sem armazenamento: a escolha vale só nesta tela
  }
}
