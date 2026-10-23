import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Award, 
  Star, 
  Shield, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  Sparkles,
  ArrowRight,
  Home,
  RotateCcw
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';
import { fireConfetti } from '../../components/ui/ConfettiEffect';
import { storageService } from '../../services/storage';
import { GameHeader } from '../../components/layout/GameHeader';

export const FinalResultsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, quizResult, flashcardResult, totalScore } = useGame();
  const [playerRank, setPlayerRank] = useState<number | null>(null);

  useEffect(() => {
    audioService.playFanfare();
    fireConfetti();

    // Fetch player rank
    const loadRank = async () => {
      if (currentPlayer) {
        const board = await storageService.getLeaderboard();
        const found = board.find(e => e.playerId === currentPlayer.id);
        if (found) {
          setPlayerRank(found.rank);
        }
      }
    };
    loadRank();
  }, [currentPlayer]);

  if (!currentPlayer) return null; // redirect handled by <RequirePlayer>

  const qScore = quizResult?.totalScore || 0;
  const fcScore = flashcardResult?.totalScore || 0;
  const isBlue = currentPlayer.team === 'blue';

  let medalName = 'Bronze Star';
  let medalColor = 'text-amber-700 border-amber-600 bg-amber-100/80';
  if (totalScore >= 1300) {
    medalName = 'Gold Star Master';
    medalColor = 'text-yellow-700 border-yellow-400 bg-yellow-100/80 shadow-[0_0_25px_rgba(234,179,8,0.4)]';
  } else if (totalScore >= 900) {
    medalName = 'Silver Star Champion';
    medalColor = 'text-slate-700 border-slate-300 bg-sky-50/50 shadow-[0_0_20px_rgba(203,213,225,0.3)]';
  }

  return (
    <div className="min-h-screen game-sky text-slate-900 flex flex-col justify-between">
      <GameHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:py-8 flex flex-col justify-center">
        
        {/* Main Victory Card */}
        <div className="game-panel p-6 md:p-8 text-center animate-rise-in">
          
          {/* Trophy & Badge */}
          <div className="relative inline-block mb-3">
            <div className="p-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 shadow-[0_0_40px_rgba(245,158,11,0.6)]">
              <Trophy className="w-14 h-14 md:w-16 md:h-16 stroke-[2.5]" />
            </div>
            <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-blue-600 text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl game-title">
            CONGRATULATIONS!
          </h1>
          <p className="text-base md:text-xl font-bold text-slate-700 mt-2 font-bungee">
            YOU COMPLETED YOUR ENGLISH ADVENTURE!
          </p>

          {/* Mini-final do Nível 0 */}
          <p className="mt-3 inline-block px-4 py-2 rounded-2xl bg-amber-50 border-2 border-amber-300 text-sm md:text-base font-bold text-amber-800">
            🃏 O Zé Cartinha foi embora resmungando… mas vai voltar!
          </p>

          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Escola Municipal Nísia Vilela Fernandes • Duque de Caxias
          </p>

          {/* Player Identity Pill */}
          <div className="my-5 inline-flex flex-wrap items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd]">
            <span className="font-extrabold text-sm md:text-base text-slate-900">
              {currentPlayer.displayName}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-bold text-slate-600">
              Turma {currentPlayer.className}
            </span>
            <span className="text-slate-600">•</span>
            <div className={`flex items-center gap-1 text-xs font-bungee ${isBlue ? 'text-blue-600' : 'text-purple-600'}`}>
              <Shield className="w-4 h-4 fill-current" />
              <span>{isBlue ? 'BLUE TEAM' : 'PURPLE TEAM'}</span>
            </div>
            {playerRank && (
              <>
                <span className="text-slate-600">•</span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-700 font-bold text-xs border border-amber-400/40">
                  RANK #{playerRank}
                </span>
              </>
            )}
          </div>

          {/* Award Medal Banner */}
          <div className={`p-4 rounded-2xl border-2 my-4 flex items-center justify-center gap-3 ${medalColor}`}>
            <Award className="w-8 h-8 flex-shrink-0" />
            <div className="text-left">
              <span className="text-[11px] uppercase tracking-wider font-extrabold opacity-80">Honors Awarded</span>
              <div className="text-lg md:text-xl font-black font-bungee">{medalName}</div>
            </div>
          </div>

          {/* Score Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 my-6">
            
            {/* Quiz Mission */}
            <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd] text-left flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Mission 1 (Quiz)
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bungee text-blue-600">
                {qScore} <span className="text-xs text-slate-500 font-sans">/ 1,000 XP</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1">Comparative Adjectives</span>
            </div>

            {/* Flashcard Mission */}
            <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd] text-left flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Mission 2 (Cards)
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bungee text-purple-600">
                {fcScore} <span className="text-xs text-slate-500 font-sans">/ 500 XP</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1">Age Memory Challenge</span>
            </div>

            {/* Total Combined Score */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-400 text-left flex flex-col justify-between shadow-[0_3px_0_0_#f59e0b]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-amber-700 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  TOTAL XP
                </span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-bungee text-amber-600">
                {totalScore} <span className="text-xs text-amber-800 font-sans">/ 1,500 XP</span>
              </div>
              <span className="text-[11px] font-bold text-amber-700 mt-1">Contributed to {currentPlayer.team.toUpperCase()} TEAM</span>
            </div>

          </div>

          {/* Missions Progress Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-[0_3px_0_0_#6ee7b7] mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div className="text-left">
                <span className="font-bungee text-sm md:text-base text-emerald-700">
                  2 OF 2 MISSIONS COMPLETED (100%)
                </span>
                <p className="text-xs text-emerald-800">
                  Your official results have been stored for the school leaderboard.
                </p>
              </div>
            </div>
            <div className="hidden sm:block text-xs font-mono font-bold text-emerald-600 bg-emerald-100/80 px-3 py-1 rounded-lg">
              VERIFIED
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                navigate('/leaderboard');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bungee text-lg md:text-xl tracking-wider shadow-[0_6px_0_0_#b45309] active:translate-y-1 active:shadow-[0_2px_0_0_#b45309] border-[3px] border-amber-600 flex items-center justify-center gap-2.5 transition-all cursor-pointer animate-arcade-pulse"
            >
              <Trophy className="w-6 h-6 fill-slate-950" />
              <span>VIEW LEADERBOARD</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>

            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                navigate('/missions');
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-sky-50 text-blue-800 border-2 border-sky-300 shadow-[0_4px_0_0_#7dd3fc] active:translate-y-1 active:shadow-[0_1px_0_0_#7dd3fc] font-heading font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span>Review Activities</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                navigate('/');
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-sky-50 text-blue-800 border-2 border-sky-300 shadow-[0_4px_0_0_#7dd3fc] active:translate-y-1 active:shadow-[0_1px_0_0_#7dd3fc] font-heading font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-amber-600" />
              <span>Back to Start</span>
            </button>
          </div>

        </div>

      </main>
    </div>
  );
};
