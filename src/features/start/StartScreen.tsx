import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, HelpCircle, Volume2, VolumeX, Shield, Sparkles } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../components/ui/Button';

export const StartScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, isSoundOn, toggleSound } = useGame();
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  const handleStart = () => {
    if (currentPlayer) {
      navigate('/mission');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-between items-center overflow-hidden bg-slate-950">
      {/* Background: Official NIZIALAND School Artwork */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/nizialand_hero.jpg"
          alt="NIZIALAND - Escola Municipal Nísia Vilela Fernandes"
          className="w-full h-full object-cover object-center filter brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
      </div>

      {/* Top Floating Badge & Slogan */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-6 flex justify-between items-start">
        {/* Signpost Pills */}
        <div className="hidden md:flex flex-col gap-2">
          <div className="bg-amber-950/90 border-2 border-amber-600 text-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-heading font-black shadow-game-sm flex items-center gap-1.5">
            <span>📖</span> <span>READ &amp; EXPLORE</span>
          </div>
          <div className="bg-amber-950/90 border-2 border-amber-600 text-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-heading font-black shadow-game-sm flex items-center gap-1.5">
            <span>🗣️</span> <span>SPEAK IN ENGLISH</span>
          </div>
          <div className="bg-amber-950/90 border-2 border-amber-600 text-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-heading font-black shadow-game-sm flex items-center gap-1.5">
            <span>🛡️</span> <span>BLUE &amp; PURPLE TEAMS</span>
          </div>
        </div>

        {/* Motivational Right Badge */}
        <div className="bg-blue-900/90 border-2 border-blue-400 text-white px-4 py-2 rounded-2xl shadow-game-blue text-right backdrop-blur-sm">
          <div className="text-[10px] font-heading font-black tracking-widest text-amber-300 uppercase">
            Escola Municipal
          </div>
          <div className="text-sm font-heading font-black text-white">
            NÍSIA VILELA FERNANDES
          </div>
          <div className="text-[11px] font-bold text-cyan-200 mt-0.5">
            Same school, bigger dreams! ✨
          </div>
        </div>
      </div>

      {/* Central Interactive Area: START Button & Title */}
      <div className="relative z-10 text-center px-4 my-auto flex flex-col items-center">
        {/* Logo Title Badge */}
        <div className="mb-4 inline-block">
          <div className="bg-slate-900/80 backdrop-blur-md px-6 py-2 rounded-full border-2 border-amber-400/60 shadow-lg mb-2">
            <span className="text-xs sm:text-sm font-heading font-black tracking-widest text-amber-300 uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              EXPLORE • LEARN • PLAY • IMPROVE
              <Sparkles className="w-4 h-4 text-amber-400" />
            </span>
          </div>
          <h1 className="sr-only">NIZIALAND — English Adventure</h1>
        </div>

        {/* Big Gamified START Button (Centered as in Image 1) */}
        <div className="mt-8 mb-4">
          <button
            onClick={handleStart}
            className="group relative inline-flex items-center justify-center px-10 py-5 sm:px-14 sm:py-6 text-2xl sm:text-3xl font-heading font-black tracking-widest uppercase text-slate-950 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 rounded-full border-4 border-amber-600 shadow-glow-gold hover:from-amber-200 hover:to-amber-400 transition-all duration-200 active:scale-95 transform hover:scale-105"
            aria-label="Start NIZIALAND English Adventure"
          >
            <span className="flex items-center gap-3 drop-shadow-sm">
              START
              <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-slate-950 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        {currentPlayer && (
          <div className="bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-2xl inline-flex items-center gap-3 backdrop-blur-md">
            <span className="text-xs text-slate-300 font-semibold">
              Playing as: <strong className="text-amber-400 font-heading">{currentPlayer.displayName}</strong> ({currentPlayer.className})
            </span>
            <span className="text-xs font-bold text-slate-400">|</span>
            <button
              onClick={() => navigate('/mission')}
              className="text-xs font-heading font-black text-blue-400 hover:underline uppercase"
            >
              Resume Missions →
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar (Secondary Actions) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pb-8 flex justify-center items-center gap-4 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHowToPlay(true)}
          className="flex items-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4" />
          <span>How to Play</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/leaderboard')}
          className="flex items-center gap-1.5 text-amber-300 border-amber-500/40"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Leaderboard</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleSound}
          className="flex items-center gap-1.5"
        >
          {isSoundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          <span>{isSoundOn ? "Sound ON" : "Sound OFF"}</span>
        </Button>
      </div>

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border-4 border-amber-500 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <h3 className="font-heading font-black text-xl text-amber-400 flex items-center gap-2">
                🎮 How to Play NIZIALAND
              </h3>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">1</span>
                <div>
                  <strong className="text-white block font-heading">Register &amp; Choose Your Team</strong>
                  Join the <strong>BLUE TEAM</strong> or <strong>PURPLE TEAM</strong> and receive your Player Code.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-amber-500 text-slate-950 font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">2</span>
                <div>
                  <strong className="text-white block font-heading">Mission 1: Comparative Quiz</strong>
                  Answer 10 questions on English comparatives (<em>older than</em>, <em>younger than</em>, <em>as old as</em>). Earn up to 100 points per question!
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-purple-600 text-white font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">3</span>
                <div>
                  <strong className="text-white block font-heading">Mission 2: Flashcard Challenge</strong>
                  Memorize the students in 30 seconds! Then find the right cards before your 3 hearts run out!
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-emerald-500 text-white font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">4</span>
                <div>
                  <strong className="text-white block font-heading">Win for Your Class &amp; Team</strong>
                  Your score helps determine the winning team in the school leaderboard!
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <Button
                variant="gold"
                size="md"
                onClick={() => {
                  setShowHowToPlay(false);
                  handleStart();
                }}
                className="w-full"
              >
                Let's Begin! ▶
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
