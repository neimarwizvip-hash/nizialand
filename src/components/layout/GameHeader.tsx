import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Music, Trophy, Shield, LogOut, Lock } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { TEAMS_CONFIG } from '../../data/mockData';
import { isGuestPlayer } from '../../types';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { FullscreenButton } from '../ui/FullscreenButton';

export const GameHeader: React.FC = () => {
  const { currentPlayer, totalScore, playerLevel, isSoundOn, toggleSound, isMusicOn, toggleMusic, logout } = useGame();
  const navigate = useNavigate();

  const team = currentPlayer ? TEAMS_CONFIG[currentPlayer.team] : null;

  return (
    <header className="relative sm:sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-sky-200 shadow-[0_3px_0_0_rgba(125,211,252,0.6)]">
      {/* Top Institutional Line */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-900 px-4 py-1.5 border-b border-blue-400/30 flex items-center justify-between text-xs text-blue-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <img
            src="/assets/caxias_header_logo.jpg"
            alt="Brasão Duque de Caxias"
            className="h-6 w-auto bg-white rounded p-0.5 shadow-sm"
          />
          <span className="font-bold tracking-wider hidden md:inline">
            PREFEITURA DE DUQUE DE CAXIAS • ESCOLA MUNICIPAL NÍSIA VILELA FERNANDES
          </span>
          <span className="font-bold tracking-wider md:hidden">E. M. NÍSIA VILELA FERNANDES</span>
        </div>
        <div className="flex items-center gap-3 font-semibold">
          <span className="hidden sm:inline">Prof. Neimar Oliveira</span>
          <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black text-[10px]">
            {currentPlayer ? `TURMA ${currentPlayer.className}` : '6º ANO AO ENSINO MÉDIO'}
          </span>
          <Link
            to="/admin"
            className="flex items-center gap-1 text-blue-800 hover:text-slate-900 transition-colors ml-2 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-400/30"
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
          <div className="bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-heading font-black text-xl sm:text-2xl px-3 py-1 rounded-xl border-2 border-amber-600 shadow-[0_4px_0_0_#b45309] group-hover:-translate-y-0.5 transition-transform">
            NISIALAND
          </div>
          <span className="hidden md:inline-block text-xs font-heading font-bold text-amber-600 tracking-widest uppercase">
            EXPLORE • LEARN • PLAY
          </span>
        </Link>

        {/* Player Profile & Stats (When logged in) */}
        {currentPlayer ? (
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Player Card */}
            <div className="flex items-center gap-2 bg-sky-50/80 px-3 py-1.5 rounded-2xl border border-sky-200 shadow-sm">
              <PlayerAvatar
                avatarId={currentPlayer.avatar}
                skinTone={currentPlayer.skinTone}
                size="sm"
                className="border-2 border-amber-400"
              />
              <div className="leading-tight">
                <div className="font-heading font-black text-sm text-slate-700 flex items-center gap-1.5">
                  {currentPlayer.displayName}
                  <span
                    className="text-[9px] font-heading font-black px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-md shadow-xs"
                    title="Patente (sobe com o XP)"
                  >
                    PATENTE {playerLevel}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-sky-100 text-amber-600 rounded-full">
                    {currentPlayer.className}
                  </span>
                </div>
                {isGuestPlayer(currentPlayer) ? (
                  <div className="text-[11px] font-semibold text-slate-500">
                    Visitante ·{' '}
                    <Link to="/register" className="text-emerald-700 font-bold hover:underline">
                      Fazer meu cadastro definitivo
                    </Link>
                  </div>
                ) : (
                  <div className="text-[11px] font-semibold text-slate-500">
                    Code: <span className="text-amber-700 font-mono">{currentPlayer.playerCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Team Shield */}
            {team && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border-2 font-heading font-black text-xs text-slate-900 shadow-sm ${
                  team.id === 'blue'
                    ? 'bg-blue-100 border-blue-500 shadow-[0_3px_0_0_#1d4ed8]'
                    : 'bg-purple-100 border-purple-500 shadow-[0_3px_0_0_#7e22ce]'
                }`}
                title={`You are part of the ${team.nameDisplay}!`}
              >
                <Shield className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">{team.nameDisplay}</span>
              </div>
            )}

            {/* Total Points */}
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-2xl border-2 border-amber-300 shadow-[0_3px_0_0_#f59e0b] text-amber-600 font-heading font-black text-sm">
              <span>🪙</span>
              <span>{totalScore}</span>
              <span className="text-[10px] text-amber-700 font-bold uppercase hidden sm:inline">XP</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/register"
              className="text-xs font-heading font-black bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-xl border-2 border-blue-900 shadow-[0_3px_0_0_#1e3a8a] active:translate-y-0.5 active:shadow-none hover:brightness-110 transition-all uppercase tracking-wider"
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
            className={`p-2 rounded-xl border-2 transition-all active:translate-y-0.5 ${
              isSoundOn
                ? 'bg-white text-amber-600 border-sky-300 shadow-[0_3px_0_0_#7dd3fc] hover:bg-sky-50'
                : 'bg-sky-50/40 text-slate-500 border-sky-200'
            }`}
            title={isSoundOn ? "Mute Sound Effects" : "Enable Sound Effects"}
            aria-label="Sound Toggle"
          >
            {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* BGM Toggle */}
          <button
            onClick={toggleMusic}
            className={`p-2 rounded-xl border-2 transition-all active:translate-y-0.5 flex items-center gap-1 ${
              isMusicOn
                ? 'bg-purple-100 text-purple-700 border-purple-500 shadow-[0_3px_0_0_#7e22ce]'
                : 'bg-sky-50/40 text-slate-500 border-sky-200'
            }`}
            title={isMusicOn ? "Pause Arcade BGM" : "Play Arcade Chiptune BGM"}
            aria-label="Music Toggle"
          >
            <Music className="w-4 h-4" />
            <span className="text-[10px] font-bold hidden sm:inline">{isMusicOn ? 'BGM ON' : 'BGM'}</span>
          </button>

          {/* Tela cheia */}
          <FullscreenButton />

          {/* Leaderboard Link */}
          <Link
            to="/leaderboard"
            className="flex items-center gap-1 bg-amber-50 text-amber-600 border-2 border-amber-300 shadow-[0_3px_0_0_#f59e0b] hover:bg-amber-100 active:translate-y-0.5 active:shadow-none px-2.5 py-1.5 rounded-xl text-xs font-heading font-black transition-all"
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
              className="p-2 rounded-xl border border-sky-200 bg-sky-50/60 text-slate-500 hover:text-red-600 hover:border-red-300 transition-colors"
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
