import React, { useEffect } from 'react';
import { Clock, RotateCcw, Star, Trophy } from 'lucide-react';
import type { Activity } from '../../core/types';
import { GameHeader } from '../../components/layout/GameHeader';
import { triggerConfetti } from '../../components/ui/ConfettiEffect';
import { audioService } from '../../services/audio';
import { LEVEL2_WARNING_SECONDS, level2MaxScore } from './level2Rules';
import type { Level2Feedback } from './useLevel2Run';

const ACCENT: Record<string, string> = {
  blue: 'bg-blue-600 border-blue-800',
  orange: 'bg-orange-500 border-orange-700',
  green: 'bg-emerald-600 border-emerald-800',
  pink: 'bg-pink-500 border-pink-700',
  purple: 'bg-violet-600 border-violet-800',
  yellow: 'bg-amber-500 border-amber-700',
};

const FEEDBACK_TEXT: Record<Exclude<Level2Feedback, null>, string> = {
  correct: 'Correct! +100 🎉',
  wrong: 'Errou! 0 ponto.',
  timeout: 'Tempo esgotado! 0 ponto.',
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
  children: React.ReactNode;
  overlay?: React.ReactNode;
}

export const Level2Shell: React.FC<Level2ShellProps> = ({
  activity, progressLabel, clock, score, feedback, finished, correctCount, totalItems, revealText, afterText, finishedNote, onExit, onReplay, exitLabel = 'Voltar ao pátio', background = '/assets/nisialand_hallway_bg.jpg', maxScore, children, overlay,
}) => {
  const accent = ACCENT[activity.color] ?? ACCENT.blue;

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
    <div className="relative min-h-screen game-sky text-slate-900 flex flex-col overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={background} alt="" className="w-full h-full object-cover brightness-[0.88]" />
        <div className="absolute inset-0 bg-white/60" />
      </div>
      <div className="relative z-10"><GameHeader /></div>

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-3 short:py-1 flex flex-col justify-center">
        {finished ? (
          <div className="game-panel p-6 sm:p-8 short:p-3 text-center animate-fadeIn">
            <Trophy className="w-12 h-12 short:w-8 short:h-8 mx-auto text-amber-500" />
            <h1 className="font-heading font-black text-2xl sm:text-3xl short:text-xl mt-2">{activity.name}</h1>
            {finishedNote && <p className="font-heading font-black text-lg text-violet-700 mt-1">{finishedNote}</p>}
            <p className="font-heading font-black text-4xl short:text-2xl text-blue-700 mt-3 short:mt-1">{score} <span className="text-lg text-slate-500">/ {maxScore ?? level2MaxScore(totalItems)} pts</span></p>
            <p className="text-sm font-bold text-slate-600 mt-1">{correctCount} de {totalItems} certas</p>
            <div className="mt-5 short:mt-2 flex justify-center gap-3 flex-wrap">
              {onReplay && (
                <button
                  type="button"
                  onClick={onReplay}
                  className="px-6 py-3 short:py-2 rounded-full bg-white border-2 border-violet-600 shadow-[0_5px_0_0_#5b21b6] font-heading font-black uppercase text-sm text-violet-700 flex items-center gap-2 active:translate-y-1"
                >
                  <RotateCcw className="w-4 h-4" /> Revanche
                </button>
              )}
              <button
                type="button"
                onClick={onExit}
                className="px-8 py-3 short:py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 border-2 border-amber-600 shadow-[0_5px_0_0_#b45309] font-heading font-black uppercase text-sm active:translate-y-1"
              >
                {exitLabel}
              </button>
            </div>
          </div>
        ) : (
          <div className="game-panel p-3 sm:p-6 short:p-2 animate-fadeIn">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-cyan-500/30 pb-2 mb-3 short:pb-1 short:mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`px-3 py-1 short:py-0.5 rounded-full border-2 text-white font-heading font-black text-xs uppercase ${accent}`}>
                  {progressLabel}
                </span>
                <span className="font-heading font-black text-sm sm:text-base truncate">{activity.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  role="timer"
                  aria-label={`Tempo: ${clock} segundos`}
                  className={`flex items-center gap-1 px-3 py-1 short:py-0.5 rounded-full border font-heading font-black text-xs sm:text-sm ${
                    clock <= LEVEL2_WARNING_SECONDS ? 'bg-red-100 border-red-500 text-red-700 animate-pulse' : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> {clock}s
                </span>
                <span className="flex items-center gap-1 px-3 py-1 short:py-0.5 rounded-full bg-amber-100 border border-amber-400 font-heading font-black text-xs sm:text-sm text-amber-800">
                  <Star className="w-3.5 h-3.5" /> {score}
                </span>
              </div>
            </div>

            {children}

            {feedback && (
              <p
                role="status"
                className={`mt-3 short:mt-1 font-heading font-black text-sm sm:text-base ${feedback === 'correct' ? 'text-emerald-700' : 'text-red-600'}`}
              >
                {FEEDBACK_TEXT[feedback]}
                {feedback !== 'correct' && revealText && (
                  <span className="text-slate-700 font-bold text-xs sm:text-sm"> Resposta certa: <strong>{revealText}</strong></span>
                )}
                {afterText && <span className="block text-slate-600 font-bold text-xs sm:text-sm">{afterText}</span>}
              </p>
            )}
          </div>
        )}
      </main>
      {overlay}
    </div>
  );
};
