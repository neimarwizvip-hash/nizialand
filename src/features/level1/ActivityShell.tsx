import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Activity } from '../../core/types';
import { MolduraAtividade } from '../../components/kit/MolduraAtividade';
import type { FeedbackMoldura } from '../../components/kit/MolduraAtividade';
import { audioService } from '../../services/audio';
import { speechService } from '../../services/speech';
import { ITEM_SECONDS, ITEM_WARNING_SECONDS, maxScore } from './level1Rules';
import { ZE_LINE_MS, ZE_SIZES, isZeBlocking, zeLine, zeSizeStage } from '../quiz/zeRules';
import type { Feedback } from './useActivityRun';

/** Zé aparece com uma fala por alguns segundos (falada em pt-BR) e some. */
export function useZePop() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const show = useCallback((text: string, ms = 2500) => {
    clearTimeout(timer.current);
    setMessage(text);
    if (audioService.isSoundOn()) speechService.speakPortuguese(text);
    timer.current = setTimeout(() => setMessage(null), ms);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { zeMessage: message, showZe: show };
}

/**
 * Zé que interrompe (mesma regra do quiz): entra 1,2 s depois do item começar, cresce a cada fala
 * e no último degrau cobre as respostas até "Agora não, Zé!". Some quando o item termina.
 */
export function useZeInterrupt(active: boolean, resolved: boolean, itemKey: number) {
  const [visible, setVisible] = useState(false);
  const [tick, setTick] = useState(0);
  const timers = useRef<number[]>([]);
  const clear = () => {
    timers.current.forEach(t => { clearTimeout(t); clearInterval(t); });
    timers.current = [];
  };

  useEffect(() => {
    clear();
    setVisible(false);
    setTick(0);
    if (active) {
      timers.current.push(window.setTimeout(() => {
        setVisible(true);
        timers.current.push(window.setInterval(() => setTick(t => t + 1), ZE_LINE_MS));
      }, 1200));
    }
    return () => { clear(); window.speechSynthesis?.cancel(); };
  }, [active, itemKey]);

  useEffect(() => {
    if (visible && resolved) {
      clear();
      setVisible(false);
      window.speechSynthesis?.cancel();
      return;
    }
    if (visible && audioService.isSoundOn()) speechService.speakPortuguese(zeLine(tick));
  }, [visible, tick, resolved]);

  const dismiss = () => {
    audioService.playClick();
    clear();
    setVisible(false);
    window.speechSynthesis?.cancel();
  };

  return {
    blocking: visible && isZeBlocking(tick),
    zeProps: {
      visible,
      message: zeLine(tick),
      actionLabel: visible ? 'Agora não, Zé!' : undefined,
      onAction: visible ? dismiss : undefined,
      imageClassName: ZE_SIZES[zeSizeStage(tick)],
    },
  };
}

interface ShellProps {
  activity: Activity;
  index: number;
  total: number;
  secondsLeft: number;
  score: number;
  feedback: Feedback;
  locked: boolean;
  finished: boolean;
  correctCount: number;
  // Texto da resposta certa, mostrado quando o item termina sem acerto.
  revealText?: string;
  onNext: () => void;
  children: React.ReactNode;
  overlay?: React.ReactNode;
}

const FEEDBACK_TEXT: Record<Exclude<Feedback, null>, string> = {
  correct: 'Muito bem! Correct!',
  wrong: 'Quase! Tente mais uma vez (vale 50).',
  reveal: 'Não foi dessa vez.',
  timeout: 'Tempo esgotado! 0 ponto.',
};
const FEEDBACK_TIPO: Record<Exclude<Feedback, null>, FeedbackMoldura['tipo']> = { correct: 'certo', wrong: 'errado', reveal: 'revelar', timeout: 'tempo' };

export const ActivityShell: React.FC<ShellProps> = ({
  activity, index, total, secondsLeft, score, feedback, locked, finished, correctCount, revealText, onNext, children, overlay,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    audioService.duckVolume(true);
    return () => audioService.duckVolume(false);
  }, []);

  return (
    <MolduraAtividade
      nivel={1}
      nome={activity.name}
      progresso={`${index + 1} / ${total}`}
      segundos={secondsLeft}
      totalSegundos={ITEM_SECONDS}
      alerta={ITEM_WARNING_SECONDS}
      pontos={score}
      feedback={feedback ? {
        tipo: FEEDBACK_TIPO[feedback],
        texto: FEEDBACK_TEXT[feedback],
        resposta: (feedback === 'reveal' || feedback === 'timeout') ? revealText : undefined,
      } : null}
      proximo={feedback && locked ? { rotulo: index + 1 < total ? 'Próxima' : 'Ver resultado', onClick: onNext } : null}
      fim={finished ? {
        pontos: score, maximo: maxScore(total), certas: correctCount, total,
        sairRotulo: 'Voltar à missão', onSair: () => navigate('/nivel1'),
      } : null}
      overlay={overlay}
    >
      {children}
    </MolduraAtividade>
  );
};
