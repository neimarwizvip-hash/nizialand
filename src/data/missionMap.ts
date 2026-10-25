import type { ActivityResult } from '../core/types';
import type { QuizResult, FlashcardResult } from '../types';

export interface MissionMapLevel {
  number: number;
  title: string;
  theme: string;
  icon: string;
  color: string;
  description: string;
  path: string;
  activityCount: number;
}

export const MISSION_MAP: MissionMapLevel[] = [
  { number: 0, title: 'A primeira aventura', theme: 'Conhecer o jogo e a escola', icon: '🎮', color: 'cyan', description: 'Desvie das distrações do Zé Cartinha.', path: '/missions', activityCount: 2 },
  { number: 1, title: 'As regras da escola', theme: 'Aprender a conviver', icon: '📚', color: 'blue', description: 'Ouça, organize, converse e explore.', path: '/nivel1', activityCount: 4 },
  { number: 2, title: 'Respeito à autoridade', theme: 'Pedir, ouvir e respeitar', icon: '🏫', color: 'amber', description: 'Visite as estações do pátio.', path: '/nivel2', activityCount: 6 },
  { number: 3, title: 'Convivência em sala', theme: 'Conviver bem em sala', icon: '🪑', color: 'emerald', description: 'Organize a sala, responda na lousa e revise.', path: '/nivel3', activityCount: 6 },
  { number: 4, title: 'Trabalho em equipe', theme: 'Cumprir tarefas juntos', icon: '🤝', color: 'orange', description: 'Caça às pistas, direções e cooperação em inglês.', path: '/nivel4', activityCount: 6 },
  { number: 5, title: 'Minhas escolhas', theme: 'Refletir e decidir', icon: '🧭', color: 'violet', description: 'Escolhas, sentimentos, conselhos e reflexão em inglês.', path: '/nivel5', activityCount: 7 },
  { number: 6, title: 'Consequências', theme: 'Entender os efeitos', icon: '🔗', color: 'rose', description: 'Causa, efeito, passado e responsabilidade em inglês.', path: '/nivel6', activityCount: 7 },
  { number: 7, title: 'Aprender a se organizar', theme: 'Planejar material e estudo', icon: '📅', color: 'sky', description: 'Rotina, agenda, estudo e organização em inglês.', path: '/nivel7', activityCount: 8 },
  { number: 8, title: 'Organizado na prática', theme: 'Aplicar o planejamento', icon: '🧱', color: 'teal', description: 'Planejado: projeto, simulado e apresentação.', path: '/nivel8', activityCount: 8 },
  { number: 9, title: 'Gincana', theme: 'Competir com respeito', icon: '🏆', color: 'yellow', description: 'Planejado: desafios esportivos e inglês.', path: '/nivel9', activityCount: 8 },
  { number: 10, title: 'O vencedor que me tornei', theme: 'Reconhecer a jornada', icon: '🎓', color: 'purple', description: 'Planejado: revisão final, discurso e cerimônia.', path: '/nivel10', activityCount: 8 },
];

export function levelCompletion(results: Record<string, ActivityResult>, quiz: QuizResult | null, flashcards: FlashcardResult | null, level: number): boolean {
  if (level === 0) return !!quiz?.completed && !!flashcards?.completed;
  const prefixes = level === 2 ? ['n2_'] : [`nivel${level}-`];
  const required = MISSION_MAP[level]?.activityCount ?? 0;
  return required > 0 && Object.values(results).filter(r => r.completed && prefixes.some(prefix => r.activityId.startsWith(prefix))).length >= required;
}

export function getMissionMapState(results: Record<string, ActivityResult>, quiz: QuizResult | null, flashcards: FlashcardResult | null) {
  let previousCompleted = true;
  return MISSION_MAP.map(level => {
    const completed = levelCompletion(results, quiz, flashcards, level.number);
    const available = level.number === 0 || previousCompleted;
    const state = completed ? 'completed' : available ? 'available' : 'locked';
    previousCompleted = completed;
    return { ...level, completed, available, state: state as 'completed' | 'available' | 'locked' };
  });
}
