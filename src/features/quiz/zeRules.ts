import { QuizQuestionAttempt } from '../../types';

// Tempo máximo por pergunta; sem resposta no tempo, a pergunta vale 0.
export const QUESTION_SECONDS = 20;
// Aviso vermelho piscando nos últimos segundos.
export const QUESTION_WARNING_SECONDS = 5;

// Zé Cartinha aparece em exatamente 2 perguntas, nunca na 1ª.
export const ZE_APPEARANCES = 2;

// Falas provisórias (Oliveira pode trocar): implicância + risada. Trocam a cada ZE_LINE_MS.
export const ZE_LINES = [
  'Ei, psiu! Bora jogar um bafo? Hehehe!',
  'Larga essa pergunta e vem jogar comigo! Hahaha!',
  'Olha minha carta! Olha aqui! Hehehe!',
  'Ih, o tempo tá passando... Hahaha!',
  'Desiste, vem pro bafo! Hahahaha!',
];
export const ZE_LINE_MS = 2000;

// Cresce no lugar um degrau a cada fala; no último (≈6 s) cobre as respostas e trava.
export const ZE_SIZES = ['w-20 sm:w-28', 'w-32 sm:w-44', 'w-44 sm:w-64', 'w-64 sm:w-96'];

export const zeSizeStage = (tick: number) => Math.min(tick, ZE_SIZES.length - 1);
export const isZeBlocking = (tick: number) => tick >= ZE_SIZES.length - 1;
export const zeLine = (tick: number) => ZE_LINES[tick % ZE_LINES.length];

/** Índices (0-based) das perguntas com Zé: ZE_APPEARANCES sorteadas entre a 2ª e a última. */
export function pickZeQuestions(total: number, rng: () => number = Math.random): number[] {
  const candidates = Array.from({ length: Math.max(total - 1, 0) }, (_, i) => i + 1);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, ZE_APPEARANCES).sort((a, b) => a - b);
}

/** Registro de pergunta que estourou o tempo: sempre 0 ponto. */
export function timedOutAttempt(questionId: number, attemptsUsed: number): QuizQuestionAttempt {
  return {
    questionId,
    attemptsCount: attemptsUsed,
    selectedOptionIndex: -1,
    isCorrect: false,
    pointsEarned: 0,
    answeredAt: new Date().toISOString(),
  };
}
