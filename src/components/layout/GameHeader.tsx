import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Music, Trophy, Shield, LogOut, Lock } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { TEAMS_CONFIG } from '../../data/mockData';

export const GameHeader: React.FC = () => {
  const { currentPlayer, totalScore, isSoundOn, toggleSound, isMusicOn, toggleMusic, logout } = useGame();
  const navigate = useNavigate();

  const team = currentPlayer ? TEAMS_CONFIG[currentPlayer.team] : null;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b-2 border-slate-800 shadow-md">
      {/* Top Institutional Line */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-900 px-4 py-1.5 border-b border-blue-400/30 flex items-center justify-between text-xs text-blue-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <img
            src="/assets/caxias_header_logo.jpg"
            alt="Brasão Duque de Caxias"
            className="h-6 w-auto bg-white rounded p-0.5 shadow-sm"
          />
          <span className="font-bold tracking-wider">
            PREFEITURA DE DUQUE DE CAXIAS • ESCOLA MUNICIPAL NÍSIA VILELA FERNANDES
          </span>
        </div>
        <div className="flex items-center gap-3 font-semibold">
          <span>Prof. Neimar Oliveira</span>
          <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black text-[10px]">
            TURMA 804 • 8º ANO
          </span>
          <Link
            to="/admin"
            className="flex items-center gap-1 text-blue-200 hover:text-white transition-colors ml-2 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-400/30"
            title="Acesso Docente / Teacher Admin"
          >
            <Lock className="w-3 h-3" />
            <span className="hidden sm:inline">Teacher Panel</span>
          </Link>
        </div>
      </div>

      {/* Main HUD Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
        {/* Game Logo & Motto */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-heading font-black text-xl sm:text-2xl px-3 py-1 rounded-xl shadow-game-sm border border-amber-300 transform group-hover:scale-105 transition-transform">
            NIZIALAND
          </div>
          <span className="hidden md:inline-block text-xs font-heading font-bold text-amber-400 tracking-widest uppercase">
            EXPLORE • LEARN • PLAY
          </span>
        </Link>

        {/* Player Profile & Stats (When logged in) */}
        {currentPlayer ? (
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Player Card */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-700 shadow-sm">
              <img
                src={currentPlayer.avatar}
                alt={currentPlayer.displayName}
                className="w-8 h-8 rounded-full border-2 border-amber-400 object-cover shadow-sm"
              />
              <div className="leading-tight">
                <div className="font-heading font-black text-sm text-slate-100 flex items-center gap-1.5">
                  {currentPlayer.displayName}
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-700 text-amber-400 rounded-full">
                    {currentPlayer.className}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  Code: <span className="text-amber-300 font-mono">{currentPlayer.playerCode}</span>
                </div>
              </div>
            </div>

            {/* Team Shield */}
            {team && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border-2 font-heading font-black text-xs text-white shadow-sm ${
                  team.id === 'blue'
                    ? 'bg-blue-600/30 border-blue-500 shadow-glow-blue'
                    : 'bg-purple-600/30 border-purple-500 shadow-glow-purple'
                }`}
                title={`You are part of the ${team.nameDisplay}!`}
              >
                <Shield className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">{team.nameDisplay}</span>
              </div>
            )}

            {/* Total Points */}
            <div className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1.5 rounded-2xl border border-amber-500/40 text-amber-400 font-heading font-black text-sm">
              <span>🪙</span>
              <span>{totalScore}</span>
              <span className="text-[10px] text-amber-300 font-bold uppercase hidden sm:inline">PTS</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/register"
              className="text-xs font-heading font-black bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-xl shadow-game-sm hover:brightness-110 transition-all uppercase tracking-wider"
            >
              Player Login
            </Link>
          </div>
        )}

        {/* Utility Toggles (Audio, BGM, Leaderboard, Exit) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* SFX Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              isSoundOn
                ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-800/40 text-slate-500 border-slate-800'
            }`}
            title={isSoundOn ? "Mute Sound Effects" : "Enable Sound Effects"}
            aria-label="Sound Toggle"
          >
            {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* BGM Toggle */}
          <button
            onClick={toggleMusic}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1 ${
              isMusicOn
                ? 'bg-purple-900/40 text-purple-300 border-purple-500 shadow-glow-purple'
                : 'bg-slate-800/40 text-slate-500 border-slate-800'
            }`}
            title={isMusicOn ? "Pause Arcade BGM" : "Play Arcade Chiptune BGM"}
            aria-label="Music Toggle"
          >
            <Music className="w-4 h-4" />
            <span className="text-[10px] font-bold hidden sm:inline">{isMusicOn ? 'BGM ON' : 'BGM'}</span>
          </button>

          {/* Leaderboard Link */}
          <Link
            to="/leaderboard"
            className="flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 px-2.5 py-1.5 rounded-xl text-xs font-heading font-black transition-all"
            title="View Official Leaderboard"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">RANK</span>
          </Link>

          {/* Logout if player is logged in */}
          {currentPlayer && (
            <button
              onClick={() => {
                if (window.confirm("Do you want to switch player or logout?")) {
                  logout();
                  navigate('/');
                }
              }}
              className="p-2 rounded-xl border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-red-400 hover:border-red-900 transition-colors"
              title="Change Player / Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
