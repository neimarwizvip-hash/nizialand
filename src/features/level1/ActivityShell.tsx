import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Star, Trophy } from 'lucide-react';
import type { Activity } from '../../core/types';
import { GameHeader } from '../../components/layout/GameHeader';
import { audioService } from '../../services/audio';
import { speechService } from '../../services/speech';
import { ITEM_WARNING_SECONDS, maxScore } from './level1Rules';
import { ZE_LINE_MS, ZE_SIZES, isZeBlocking, zeLine, zeSizeStage } from '../quiz/zeRules';
import type { Feedback } from './useActivityRun';

const ACCENT: Record<string, string> = {
  blue: 'bg-blue-600 border-blue-800',
  orange: 'bg-orange-500 border-orange-700',
  green: 'bg-emerald-600 border-emerald-800',
  pink: 'bg-pink-500 border-pink-700',
};

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
  correct: 'Correct! 🎉',
  wrong: 'Ops! Tente mais uma vez (vale 50).',
  reveal: 'Não foi dessa vez.',
  timeout: 'Tempo esgotado! 0 ponto.',
};

export const ActivityShell: React.FC<ShellProps> = ({
  activity, index, total, secondsLeft, score, feedback, locked, finished, correctCount, revealText, onNext, children, overlay,
}) => {
  const navigate = useNavigate();
  const accent = ACCENT[activity.color] ?? ACCENT.blue;

  useEffect(() => {
    audioService.duckVolume(true);
    return () => audioService.duckVolume(false);
  }, []);

  return (
    <div className="relative min-h-screen game-sky text-slate-900 flex flex-col overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src="/assets/nisialand_hallway_bg.jpg" alt="" className="w-full h-full object-cover brightness-[0.88]" />
        <div className="absolute inset-0 bg-white/60" />
      </div>
      <div className="relative z-10"><GameHeader /></div>

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-3 short:py-1 flex flex-col justify-center">
        {finished ? (
          <div className="game-panel p-6 sm:p-8 short:p-3 text-center animate-fadeIn">
            <Trophy className="w-12 h-12 mx-auto text-amber-500" />
            <h1 className="font-heading font-black text-2xl sm:text-3xl mt-2">{activity.name}</h1>
            <p className="font-heading font-black text-4xl text-blue-700 mt-3">{score} <span className="text-lg text-slate-500">/ {maxScore(total)} pts</span></p>
            <p className="text-sm font-bold text-slate-600 mt-1">{correctCount} de {total} certas</p>
            <button
              type="button"
              onClick={() => navigate('/nivel1')}
              className="mt-5 px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 border-2 border-amber-600 shadow-[0_5px_0_0_#b45309] font-heading font-black uppercase text-sm active:translate-y-1"
            >
              Voltar à missão
            </button>
          </div>
        ) : (
          <div className="game-panel p-3 sm:p-6 short:p-2 animate-fadeIn">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-cyan-500/30 pb-2 mb-3 short:pb-1 short:mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`px-3 py-1 rounded-full border-2 text-white font-heading font-black text-xs uppercase ${accent}`}>
                  {index + 1} / {total}
                </span>
                <span className="font-heading font-black text-sm sm:text-base truncate">{activity.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  role="timer"
                  aria-label={`Tempo: ${secondsLeft} segundos`}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border font-heading font-black text-xs sm:text-sm ${
                    secondsLeft <= ITEM_WARNING_SECONDS ? 'bg-red-100 border-red-500 text-red-700 animate-pulse' : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> {secondsLeft}s
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 border border-amber-400 font-heading font-black text-xs sm:text-sm text-amber-800">
                  <Star className="w-3.5 h-3.5" /> {score}
                </span>
              </div>
            </div>

            {children}

            {feedback && (
              <div className="mt-3 short:mt-1 flex items-center justify-between gap-3 flex-wrap">
                <p
                  role="status"
                  className={`font-heading font-black text-sm sm:text-base ${feedback === 'correct' ? 'text-emerald-700' : 'text-red-600'}`}
                >
                  {FEEDBACK_TEXT[feedback]}
                  {(feedback === 'reveal' || feedback === 'timeout') && revealText && (
                    <span className="block text-slate-700 font-bold text-xs sm:text-sm">Resposta: {revealText}</span>
                  )}
                </p>
                {locked && (
                  <button
                    type="button"
                    onClick={onNext}
                    className="px-6 py-2.5 short:py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 border-2 border-amber-600 shadow-[0_4px_0_0_#b45309] font-heading font-black uppercase text-sm flex items-center gap-2 active:translate-y-1"
                  >
                    {index + 1 < total ? 'Next' : 'Ver resultado'} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      {overlay}
    </div>
  );
};
