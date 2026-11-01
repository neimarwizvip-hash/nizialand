import React, { useEffect } from 'react';
import type { Activity } from '../../core/types';
import { MolduraAtividade } from '../../components/kit/MolduraAtividade';
import type { FeedbackMoldura } from '../../components/kit/MolduraAtividade';
import type { NomeCenario } from '../../components/kit/Cenario';
import { triggerConfetti } from '../../components/ui/ConfettiEffect';
import { audioService } from '../../services/audio';
import { LEVEL2_WARNING_SECONDS, level2MaxScore } from './level2Rules';
import type { Level2Feedback } from './useLevel2Run';

const FEEDBACK_TEXT: Record<Exclude<Level2Feedback, null>, string> = {
  correct: 'Muito bem! Correct! +100',
  wrong: 'Errou! 0 ponto.',
  timeout: 'Tempo esgotado! 0 ponto.',
};
const FEEDBACK_TIPO: Record<Exclude<Level2Feedback, null>, FeedbackMoldura['tipo']> = { correct: 'certo', wrong: 'errado', timeout: 'tempo' };
// Cenário por imagem de fundo pedida pelo chamador (Nível 3 passa o corredor).
const CENARIO_POR_FUNDO: Record<string, NomeCenario> = {
  '/assets/nisialand_hallway_bg.jpg': 'corredor',
  '/assets/nisialand_auditorium_bg.jpg': 'auditorio',
  '/assets/nisialand_school_facade_clean.jpg': 'patio',
};

interface Level2ShellProps {
  activity: Activity;
  // Texto do contador no canto (ex.: "2 / 3", "4 palavras", "Rodada 3").
  progressLabel: string;
  clock: number;
  score: number;
  feedback: Level2Feedback;
  finished: boolean;
  correctCount: number;
  totalItems: number;
  // Resposta certa, mostrada junto com o "errou".
  revealText?: string;
  // Explicação/significado, mostrado depois de qualquer resposta.
  afterText?: string;
  // Linha extra no painel final (ex.: quem venceu o duelo).
  finishedNote?: string;
  onExit: () => void;
  onReplay?: () => void;
  // Nível 3 reaproveita a moldura: outro botão de saída, outro fundo e outro teto de pontos.
  exitLabel?: string;
  background?: string;
  maxScore?: number;
  nivel?: number;
  clockTotal?: number;
  children: React.ReactNode;
  overlay?: React.ReactNode;
}

export const Level2Shell: React.FC<Level2ShellProps> = ({
  activity, progressLabel, clock, score, feedback, finished, correctCount, totalItems, revealText, afterText, finishedNote, onExit, onReplay, exitLabel = 'Voltar ao pátio', background, maxScore, nivel, clockTotal, children, overlay,
}) => {
  const nivelReal = nivel ?? (exitLabel === 'Voltar ao pátio' ? 2 : 3);
  const cenario = background ? CENARIO_POR_FUNDO[background] : undefined;

  useEffect(() => {
    audioService.duckVolume(true);
    return () => audioService.duckVolume(false);
  }, []);

  useEffect(() => {
    if (!finished) return;
    audioService.duckVolume(false);
    audioService.playVictory();
    triggerConfetti(90);
  }, [finished]);

  return (
    <MolduraAtividade
      nivel={nivelReal}
      cenario={cenario}
      nome={activity.name}
      progresso={progressLabel}
      segundos={clock}
      totalSegundos={clockTotal}
      alerta={LEVEL2_WARNING_SECONDS}
      pontos={score}
      feedback={feedback ? {
        tipo: FEEDBACK_TIPO[feedback],
        texto: FEEDBACK_TEXT[feedback],
        resposta: feedback !== 'correct' ? revealText : undefined,
        extra: afterText,
      } : null}
      fim={finished ? {
        pontos: score, maximo: maxScore ?? level2MaxScore(totalItems), certas: correctCount, total: totalItems,
        nota: finishedNote, sairRotulo: exitLabel, onSair: onExit, onRepetir: onReplay,
      } : null}
      overlay={overlay}
    >
      {children}
    </MolduraAtividade>
  );
};
