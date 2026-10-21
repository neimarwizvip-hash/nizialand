import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, BookOpen, Layers, Award, CheckCircle2, ArrowRight, Play, Trophy } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';
import { GameHeader } from '../../components/layout/GameHeader';

export const MissionBriefingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, quizResult, flashcardResult, missionsCompletedCount } = useGame();

  if (!currentPlayer) {
    navigate('/register');
    return null;
  }

  const isQuizDone = quizResult?.completed;
  const isFlashcardsDone = flashcardResult?.completed;
  const isBlue = currentPlayer.team === 'blue';

  const handleStartPlay = () => {
    audioService.playClick();
    if (!isQuizDone) {
      navigate('/quiz');
    } else if (!isFlashcardsDone) {
      navigate('/flashcards');
    } else {
      navigate('/results/final');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <GameHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col justify-center">
        {/* Welcome Banner */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/60 border border-blue-400 text-blue-300 font-bold text-xs uppercase tracking-widest mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Escola Municipal Nísia Vilela Fernandes</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-bungee tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-md">
            WELCOME TO NIZIALAND!
          </h1>

          <div className="mt-3 flex items-center justify-center gap-2 text-lg md:text-xl font-bold">
            <span className="text-slate-300">HELLO,</span>
            <span className="text-amber-400 font-extrabold uppercase">{currentPlayer.displayName}!</span>
          </div>

          {/* Player Team Pill */}
          <div className="mt-4 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 shadow-lg backdrop-blur-sm transition-all"
            style={{
              backgroundColor: isBlue ? 'rgba(30, 58, 138, 0.4)' : 'rgba(88, 28, 135, 0.4)',
              borderColor: isBlue ? '#3b82f6' : '#a855f7'
            }}
          >
            <Shield className={`w-6 h-6 fill-current ${isBlue ? 'text-blue-400' : 'text-purple-400'}`} />
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-wider font-extrabold text-slate-300">Your Faction</p>
              <p className={`font-bungee text-sm md:text-base ${isBlue ? 'text-blue-300' : 'text-purple-300'}`}>
                {isBlue ? 'BLUE TEAM' : 'PURPLE TEAM'} • TURMA {currentPlayer.className}
              </p>
            </div>
            <div className="ml-2 pl-3 border-l border-slate-700 text-xs font-mono font-bold text-slate-400">
              Code: <span className="text-amber-300">{currentPlayer.playerCode}</span>
            </div>
          </div>
        </div>

        {/* Mission Briefing Card */}
        <div className="bg-slate-900/80 border-2 border-slate-700 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bungee text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                YOUR MISSION
              </h2>
              <p className="text-slate-300 text-sm md:text-base mt-1">
                Complete two English challenges to earn points for yourself, your class and your team!
              </p>
            </div>

            {/* Overall Progress Indicator */}
            <div className="bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700 flex items-center gap-4">
              <div>
                <div className="text-xs uppercase font-extrabold text-slate-400">Mission Progress</div>
                <div className="text-lg font-bungee text-amber-400">
                  {missionsCompletedCount} / 2 COMPLETED
                </div>
              </div>
              <div className="w-16 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${(missionsCompletedCount / 2) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Two Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            
            {/* MISSION 1: QUIZ */}
            <div 
              onClick={() => {
                audioService.playClick();
                navigate('/quiz');
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                isQuizDone
                  ? 'bg-emerald-950/30 border-emerald-500/60 hover:border-emerald-400'
                  : 'bg-blue-950/40 border-blue-500 hover:border-blue-300 hover:bg-blue-900/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-300 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                {isQuizDone ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    DONE ({quizResult.totalScore} PTS)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400 text-blue-300 text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    READY TO PLAY
                  </span>
                )}
              </div>

              <h3 className="text-lg md:text-xl font-bungee text-white mb-2">
                MISSION 1 — ENGLISH QUIZ
              </h3>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                Answer the 10 comparative adjective questions (as...as & -er than) and earn up to <strong>1,000 points</strong>!
              </p>

              <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                <span>10 Questions • 1 per screen</span>
                <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  {isQuizDone ? 'Review' : 'Start'} →
                </span>
              </div>
            </div>

            {/* MISSION 2: FLASHCARD CHALLENGE */}
            <div 
              onClick={() => {
                audioService.playClick();
                navigate('/flashcards');
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                isFlashcardsDone
                  ? 'bg-emerald-950/30 border-emerald-500/60 hover:border-emerald-400'
                  : 'bg-purple-950/40 border-purple-500 hover:border-purple-300 hover:bg-purple-900/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-400 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                {isFlashcardsDone ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    DONE ({flashcardResult.totalScore} PTS)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400 text-purple-300 text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    READY TO PLAY
                  </span>
                )}
              </div>

              <h3 className="text-lg md:text-xl font-bungee text-white mb-2">
                MISSION 2 — FLASHCARD CHALLENGE
              </h3>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                Memorize student ages in 30 seconds, then find who is older, younger, or the same age! Earn up to <strong>500 points</strong>!
              </p>

              <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                <span>8 Cards • 5 Rounds</span>
                <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  {isFlashcardsDone ? 'Review' : 'Start'} →
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleStartPlay}
            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bungee text-xl tracking-wider shadow-[0_8px_0_#92400e,0_15px_25px_rgba(245,158,11,0.5)] active:translate-y-1 active:shadow-[0_2px_0_#92400e] border-2 border-yellow-200 flex items-center justify-center gap-3 transition-all cursor-pointer animate-arcade-pulse"
          >
            <Play className="w-7 h-7 fill-slate-950" />
            <span>LET'S PLAY!</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              navigate('/leaderboard');
            }}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base border-2 border-slate-600 hover:border-slate-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>LEADERBOARD</span>
          </button>
        </div>
      </main>
    </div>
  );
};
