import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, HelpCircle, Volume2, VolumeX, Music, Sparkles, Film, KeyRound } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../components/ui/Button';
import { IntroVideoModal } from '../../components/video/IntroVideoModal';

export const StartScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, isSoundOn, toggleSound, isMusicOn, toggleMusic } = useGame();
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showIntroVideo, setShowIntroVideo] = useState<boolean>(false);

  const handleStartLevel0 = () => {
    navigate('/level0');
  };

  const handleGoToLogin = () => {
    navigate('/register');
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-between items-center overflow-hidden bg-slate-950">
      {/* Background: Official NISIALAND School Artwork */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/nisialand_cover_official.jpg"
          alt="NISIALAND - Escola Municipal Nísia Vilela Fernandes"
          className="w-full h-full object-cover object-center filter brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/30"></div>
      </div>

      {/* Top Floating Badge & Slogan */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-6 flex justify-between items-start">
        {/* Signpost Pills */}
        <div className="hidden md:flex flex-col gap-2">
          <div className="bg-amber-950/90 border-2 border-amber-600 text-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-heading font-black shadow-game-sm flex items-center gap-1.5 backdrop-blur-sm">
            <span>📖</span> <span>READ &amp; EXPLORE</span>
          </div>
          <div className="bg-amber-950/90 border-2 border-amber-600 text-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-heading font-black shadow-game-sm flex items-center gap-1.5 backdrop-blur-sm">
            <span>🗣️</span> <span>SPEAK IN ENGLISH</span>
          </div>
          <div className="bg-blue-950/90 border-2 border-cyan-500 text-cyan-200 px-3.5 py-1.5 rounded-xl text-xs font-heading font-black shadow-game-sm flex items-center gap-1.5 backdrop-blur-sm">
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

      {/* Central Interactive Area: Big Buttons & Title */}
      <div className="relative z-10 text-center px-4 my-auto flex flex-col items-center max-w-xl">
        {/* Tagline Badge */}
        <div className="mb-4 inline-block">
          <div className="bg-slate-900/85 backdrop-blur-md px-6 py-2 rounded-full border-2 border-amber-400/70 shadow-lg mb-2">
            <span className="text-xs sm:text-sm font-heading font-black tracking-widest text-amber-300 uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              EXPLORE • LEARN • PLAY • IMPROVE
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </span>
          </div>
          <h1 className="sr-only">NISIALAND — English Adventure</h1>
        </div>

        {/* Big Gamified START Button: NÍVEL 0 (Modo Visitante) */}
        <div className="mt-4 mb-3 w-full flex flex-col items-center">
          <button
            onClick={handleStartLevel0}
            className="group relative inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 sm:px-14 sm:py-6 text-2xl sm:text-3xl font-heading font-black tracking-widest uppercase text-slate-950 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 rounded-full border-4 border-amber-600 shadow-glow-gold hover:from-amber-200 hover:to-amber-400 transition-all duration-200 active:scale-95 transform hover:scale-105"
            aria-label="Iniciar NISIALAND Nível 0"
          >
            <span className="flex items-center gap-3 drop-shadow-sm">
              <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-slate-950 text-slate-950 group-hover:scale-110 transition-transform" />
              START NÍVEL 0
            </span>
          </button>
          <span className="text-xs text-amber-200/90 font-medium mt-2 bg-slate-900/70 px-3 py-1 rounded-full backdrop-blur-sm">
            🎮 Modo Visitante • Entre direto sem cadastro obrigatório!
          </span>
        </div>

        {/* Secondary Action: JÁ SOU ALUNO / ENTRAR COM CÓDIGO */}
        <div className="w-full flex justify-center mt-2">
          <button
            onClick={handleGoToLogin}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600/90 hover:bg-blue-500 text-white font-heading font-black text-sm uppercase rounded-2xl border-2 border-cyan-400/60 shadow-lg backdrop-blur-md transition-all active:scale-95 hover:scale-105"
          >
            <KeyRound className="w-4 h-4 text-cyan-200" />
            <span>JÁ SOU ALUNO (ENTRAR COM CÓDIGO)</span>
          </button>
        </div>

        {/* Player Logged In Badge */}
        {currentPlayer && (
          <div className="mt-4 bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-2xl inline-flex items-center gap-3 backdrop-blur-md">
            <span className="text-xs text-slate-300 font-semibold">
              Playing as: <strong className="text-amber-400 font-heading">{currentPlayer.displayName}</strong> ({currentPlayer.className})
            </span>
            <span className="text-xs font-bold text-slate-400">|</span>
            <button
              onClick={() => navigate('/missions')}
              className="text-xs font-heading font-black text-blue-400 hover:underline uppercase"
            >
              Resume Missions →
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar (Secondary Actions) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pb-8 flex justify-center items-center gap-3 sm:gap-4 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowIntroVideo(true)}
          className="flex items-center gap-1.5 text-cyan-300 border-cyan-500/40 bg-slate-900/80"
        >
          <Film className="w-4 h-4 text-cyan-400" />
          <span>Assistir Abertura</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHowToPlay(true)}
          className="flex items-center gap-1.5 bg-slate-900/80"
        >
          <HelpCircle className="w-4 h-4" />
          <span>How to Play</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/leaderboard')}
          className="flex items-center gap-1.5 text-amber-300 border-amber-500/40 bg-slate-900/80"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Leaderboard</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleSound}
          className="flex items-center gap-1.5 bg-slate-900/80"
        >
          {isSoundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          <span>{isSoundOn ? "SFX ON" : "SFX OFF"}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleMusic}
          className={`flex items-center gap-1.5 bg-slate-900/80 transition-all ${
            isMusicOn ? 'text-amber-300 border-amber-400 shadow-glow-gold' : 'text-slate-400 border-slate-700'
          }`}
          title="Trilha Sonora Oficial: Cleyton Kauffman - Superhero Theme"
        >
          <Music className={`w-4 h-4 ${isMusicOn ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
          <span>{isMusicOn ? "BGM ON 🎵" : "BGM OFF"}</span>
        </Button>
      </div>

      {/* INTRO VIDEO MODAL */}
      <IntroVideoModal
        isOpen={showIntroVideo}
        onClose={() => setShowIntroVideo(false)}
        onComplete={() => {
          setShowIntroVideo(false);
          navigate('/level0');
        }}
      />

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border-4 border-amber-500 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <h3 className="font-heading font-black text-xl text-amber-400 flex items-center gap-2">
                🎮 How to Play NISIALAND
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
                <span className="bg-cyan-600 text-white font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">0</span>
                <div>
                  <strong className="text-white block font-heading">Nível 0: Ingresso na Aventura</strong>
                  Explore a HQ com o <strong>Diretor Márcio</strong>, a perseguição animada no corredor e o mini-desafio de regras!
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-emerald-600 text-white font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">★</span>
                <div>
                  <strong className="text-white block font-heading">Reunião Educativa com Orientadora Leia</strong>
                  Conheça as regras escolares de Convivência, Jogo e Aprendizagem com o lema <em>"LEIA! Know the rules, learn and go further!"</em>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">1</span>
                <div>
                  <strong className="text-white block font-heading">Mission 1: Comparative Quiz</strong>
                  Responda 10 questões sobre comparativos em inglês (<em>older than</em>, <em>younger than</em>, <em>as old as</em>). Até 100 pontos por questão!
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-purple-600 text-white font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">2</span>
                <div>
                  <strong className="text-white block font-heading">Mission 2: Flashcard Challenge</strong>
                  Memorize os 8 estudantes em 30 segundos! Depois encontre as cartas certas sem perder seus 3 corações!
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <Button
                variant="gold"
                size="md"
                onClick={() => {
                  setShowHowToPlay(false);
                  handleStartLevel0();
                }}
                className="w-full"
              >
                Start Level 0 ▶
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
