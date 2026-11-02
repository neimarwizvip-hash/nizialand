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
  lugar?: string; // espaço da escola onde a fase acontece (mapa dos espaços, 02/11/2026)
}

export const MISSION_MAP: MissionMapLevel[] = [
  { number: 0, title: 'A primeira aventura', theme: 'Conhecer o jogo e a escola', icon: '🎮', color: 'cyan', description: 'Desvie das distrações do Zé Cartinha.', path: '/missions', activityCount: 2 },
  { number: 1, title: 'As regras da escola', theme: 'Aprender a conviver', icon: '📚', color: 'blue', description: 'Ouça, organize, converse e explore.', path: '/nivel1', activityCount: 4 },
  { number: 2, title: 'Respeito à autoridade', theme: 'Pedir, ouvir e respeitar', icon: '🏫', color: 'amber', description: 'Visite as estações do pátio.', path: '/nivel2', activityCount: 6, lugar: 'Pátio' },
  { number: 3, title: 'Convivência em sala', theme: 'Conviver bem em sala', icon: '🪑', color: 'emerald', description: 'Organize a sala, responda na lousa e revise.', path: '/nivel3', activityCount: 6, lugar: 'Corredor das salas' },
  { number: 4, title: 'Trabalho em equipe', theme: 'Cumprir tarefas juntos', icon: '🤝', color: 'orange', description: 'Caça às pistas, direções e cooperação em inglês.', path: '/nivel4', activityCount: 6, lugar: 'Área externa e quadra' },
  { number: 5, title: 'Minhas escolhas', theme: 'Refletir e decidir', icon: '🧭', color: 'violet', description: 'Escolhas, sentimentos, conselhos e reflexão em inglês.', path: '/nivel5', activityCount: 7, lugar: 'Auditório' },
  { number: 6, title: 'Consequências', theme: 'Entender os efeitos', icon: '🔗', color: 'rose', description: 'Causa, efeito, passado e responsabilidade em inglês.', path: '/nivel6', activityCount: 7, lugar: 'Biblioteca' },
  { number: 7, title: 'Aprender a se organizar', theme: 'Planejar material e estudo', icon: '📅', color: 'sky', description: 'Rotina, agenda, estudo e organização em inglês.', path: '/nivel7', activityCount: 8, lugar: 'Refeitório e laboratório de informática' },
  { number: 8, title: 'Organizado na prática', theme: 'Aplicar o planejamento', icon: '🧱', color: 'teal', description: 'Semana organizada, simulado, sala ideal e apresentação em inglês.', path: '/nivel8', activityCount: 8, lugar: 'Laboratório e sala de projetos' },
  { number: 9, title: 'Gincana', theme: 'Competir com respeito', icon: '🏆', color: 'yellow', description: 'Planejado: desafios esportivos e inglês.', path: '/nivel9', activityCount: 8, lugar: 'Pátio e quadra' },
  { number: 10, title: 'O vencedor que me tornei', theme: 'Reconhecer a jornada', icon: '🎓', color: 'purple', description: 'Planejado: revisão final, discurso e cerimônia.', path: '/nivel10', activityCount: 8, lugar: 'Escola enfeitada para a festa final' },
];

// Lançamento coletivo (decisão do professor, 02/11/2026): os Níveis 9 e 10 só abrem quando MAIS de 100 alunos
// tiverem concluído o nível anterior. O mapa mostra o contador.
export const LANCAMENTO: Record<number, { apos: number; minimo: number }> = {
  9: { apos: 8, minimo: 100 },
  10: { apos: 9, minimo: 100 },
};
export const lancamentoLiberado = (nivel: number, concluiram: number | null | undefined) => {
  const regra = LANCAMENTO[nivel];
  return !regra || (concluiram ?? 0) > regra.minimo;
};

function resultadosDoNivel(results: Record<string, ActivityResult>, level: number): ActivityResult[] {
  const prefixes = level === 2 ? ['n2_'] : [`nivel${level}-`];
  return Object.values(results).filter(r => r.completed && prefixes.some(prefix => r.activityId.startsWith(prefix)));
}

export function levelCompletion(results: Record<string, ActivityResult>, quiz: QuizResult | null, flashcards: FlashcardResult | null, level: number): boolean {
  if (level === 0) return !!quiz?.completed && !!flashcards?.completed;
  const required = MISSION_MAP[level]?.activityCount ?? 0;
  return required > 0 && resultadosDoNivel(results, level).length >= required;
}

// Aproveitamento do nível (0 a 1): no Nível 0, pelas estrelas do quiz e dos flashcards; nos demais, pontos/máximo das atividades.
export function levelFraction(results: Record<string, ActivityResult>, quiz: QuizResult | null, flashcards: FlashcardResult | null, level: number): number {
  if (level === 0) {
    const estrelas = (quiz?.stars ?? 0) + (flashcards?.stars ?? 0);
    return Math.max(0, Math.min(1, estrelas / 6));
  }
  const lista = resultadosDoNivel(results, level);
  const maximo = lista.reduce((s, r) => s + (r.maxScore || 0), 0);
  if (maximo <= 0) return 0;
  return Math.max(0, Math.min(1, lista.reduce((s, r) => s + (r.score || 0), 0) / maximo));
}

// Medalha do nível completo: ouro a partir de 90 %, prata a partir de 70 %, bronze abaixo disso.
export type Medalha = 'ouro' | 'prata' | 'bronze';
export function medalhaDaFracao(frac: number): Medalha {
  if (frac >= 0.9) return 'ouro';
  if (frac >= 0.7) return 'prata';
  return 'bronze';
}

export function getMissionMapState(results: Record<string, ActivityResult>, quiz: QuizResult | null, flashcards: FlashcardResult | null, concluiramPorNivel: Record<number, number | null> = {}) {
  let previousCompleted = true;
  return MISSION_MAP.map(level => {
    const completed = levelCompletion(results, quiz, flashcards, level.number);
    const regra = LANCAMENTO[level.number];
    const lancado = !regra || lancamentoLiberado(level.number, concluiramPorNivel[regra.apos]);
    const aguardando = !!regra && previousCompleted && !lancado; // o aluno já poderia entrar, mas o nível ainda não foi lançado
    const available = (level.number === 0 || previousCompleted) && lancado;
    const state = completed ? 'completed' : available ? 'available' : 'locked';
    previousCompleted = completed;
    const fraction = completed ? levelFraction(results, quiz, flashcards, level.number) : 0;
    const medal: Medalha | null = completed ? medalhaDaFracao(fraction) : null;
    return { ...level, completed, available, aguardando, state: state as 'completed' | 'available' | 'locked', fraction, medal };
  });
}
