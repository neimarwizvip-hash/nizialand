import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, CheckCircle2, Shield, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';
import { fireConfetti } from '../../components/ui/ConfettiEffect';
import { GameHeader } from '../../components/layout/GameHeader';

export const QuizResultsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, quizResult } = useGame();

  useEffect(() => {
    audioService.playFanfare();
    fireConfetti();
  }, []);

  if (!currentPlayer || !quizResult) {
    navigate('/missions');
    return null;
  }

  const isBlue = currentPlayer.team === 'blue';

  return (
    <div className="min-h-screen game-sky text-slate-900 flex flex-col">
      <GameHeader />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 flex flex-col justify-center">
        
        {/* Celebration Container */}
        <div className="game-panel p-6 md:p-8 text-center animate-rise-in">
          
          {/* Trophy Header */}
          <div className="inline-flex p-4 rounded-full bg-amber-500/20 border-2 border-amber-400/50 text-amber-600 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <Trophy className="w-14 h-14" />
          </div>

          <h1 className="text-3xl md:text-5xl game-title">
            MISSION 1 COMPLETE!
          </h1>
          <p className="text-slate-600 text-sm md:text-base font-semibold mt-2">
            Awesome work, {currentPlayer.displayName}! You mastered English Comparative Adjectives!
          </p>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-3 my-6">
            {[1, 2, 3].map((starNum) => (
              <div 
                key={starNum}
                className={`p-2.5 rounded-2xl border-2 transition-transform duration-300 ${
                  starNum <= quizResult.stars
                    ? 'bg-amber-500/20 border-amber-400 text-amber-600 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-sky-50/40 border-sky-200 text-slate-600 scale-90'
                }`}
              >
                <Star className={`w-8 h-8 ${starNum <= quizResult.stars ? 'fill-amber-400' : 'fill-transparent'}`} />
              </div>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 my-6">
            {/* Score */}
            <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd]">
              <span className="text-xs font-extrabold uppercase text-slate-500">Your Score</span>
              <div className="text-2xl md:text-3xl font-bungee text-amber-600 mt-1">
                {quizResult.totalScore}
              </div>
              <span className="text-[11px] font-semibold text-slate-500">out of 1,000 pts</span>
            </div>

            {/* Correct Answers */}
            <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd]">
              <span className="text-xs font-extrabold uppercase text-slate-500">Correct Answers</span>
              <div className="text-2xl md:text-3xl font-bungee text-emerald-600 mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-6 h-6" />
                <span>{quizResult.correctCount}/10</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">questions mastered</span>
            </div>

            {/* Team Contribution */}
            <div className={`col-span-2 sm:col-span-1 p-4 rounded-2xl border ${
              isBlue ? 'bg-blue-100/80 border-blue-500/60' : 'bg-purple-100/80 border-purple-500/60'
            }`}>
              <span className="text-xs font-extrabold uppercase text-slate-500">Team Points</span>
              <div className={`text-2xl md:text-3xl font-bungee mt-1 flex items-center justify-center gap-1.5 ${
                isBlue ? 'text-blue-700' : 'text-purple-700'
              }`}>
                <Shield className="w-5 h-5 fill-current" />
                <span>+{quizResult.totalScore}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600">
                Added to {isBlue ? 'BLUE TEAM' : 'PURPLE TEAM'}
              </span>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd] mb-8 flex items-center justify-between">
            <div className="text-left">
              <span className="text-xs font-extrabold uppercase text-slate-500">Mission Progress</span>
              <div className="text-base font-bungee text-amber-600">1 OF 2 MISSIONS COMPLETED (50%)</div>
            </div>
            <div className="w-28 h-3 bg-white/95 rounded-full overflow-hidden border border-sky-200">
              <div className="w-1/2 h-full bg-gradient-to-r from-amber-400 to-emerald-400" />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                navigate('/flashcards');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-b from-purple-500 via-indigo-600 to-purple-700 hover:from-purple-400 hover:to-indigo-500 text-white font-bungee text-lg md:text-xl tracking-wider shadow-[0_6px_0_0_#3b0764] active:translate-y-1 active:shadow-[0_2px_0_0_#3b0764] border-[3px] border-purple-900 flex items-center justify-center gap-3 transition-all cursor-pointer animate-arcade-pulse"
            >
              <Layers className="w-6 h-6" />
              <span>NEXT MISSION: FLASHCARDS</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </button>

            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                navigate('/missions');
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-sky-50 text-blue-800 border-2 border-sky-300 shadow-[0_4px_0_0_#7dd3fc] active:translate-y-1 active:shadow-[0_1px_0_0_#7dd3fc] font-heading font-black text-sm transition-all cursor-pointer"
            >
              Mission Briefing
            </button>
          </div>

        </div>

      </main>
    </div>
  );
};
