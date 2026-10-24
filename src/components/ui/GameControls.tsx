import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Gamepad2, Volume2, VolumeX, Music } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';

// Interruptor ON/OFF (Som e Música). Mantém os aria-labels antigos, usados nos testes de som.
const Switch: React.FC<{ label: string; ariaLabel: string; on: boolean; onToggle: () => void; icon: React.ReactNode; title?: string }> = ({
  label, ariaLabel, on, onToggle, icon, title,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={ariaLabel}
    title={title}
    onClick={onToggle}
    className="flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-sky-50 transition-colors"
  >
    {icon}
    <span className="text-[11px] sm:text-xs font-heading font-black text-blue-900 uppercase">{label}</span>
    <span
      className={`relative inline-flex items-center w-12 h-6 rounded-full border-2 transition-colors ${
        on ? 'bg-emerald-500 border-emerald-700' : 'bg-slate-300 border-slate-400'
      }`}
    >
      <span className={`absolute text-[9px] font-black text-white ${on ? 'left-1.5' : 'right-1'}`}>{on ? 'ON' : 'OFF'}</span>
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'right-0.5' : 'left-0.5'}`}
      />
    </span>
  </button>
);

// Barra de controles do jogo: Treino livre, Ranking, Som e Música (ligados ao estado real).
export const GameControls: React.FC<{ className?: string; showFreeTraining?: boolean }> = ({ className = '', showFreeTraining = true }) => {
  const navigate = useNavigate();
  const { isSoundOn, toggleSound, isMusicOn, toggleMusic } = useGame();

  const go = (path: string) => {
    audioService.playClick();
    navigate(path);
  };

  return (
    <nav
      aria-label="Controles do jogo"
      className={`flex flex-wrap items-center justify-center gap-1 sm:gap-2 bg-white/95 border-2 border-sky-200 rounded-2xl px-2 py-1.5 shadow-[0_4px_0_0_#7dd3fc] ${className}`}
    >
      {showFreeTraining && (
        <button
          type="button"
          onClick={() => go('/level0')}
          title="Arcade livre: escolha série (6º ao Ensino Médio) e tópicos, sem cadastro"
          className="flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-sky-50 transition-colors"
        >
          <Gamepad2 className="w-4 h-4 text-purple-600" />
          <span className="text-[11px] sm:text-xs font-heading font-black text-blue-900 uppercase">Treino livre</span>
        </button>
      )}
      <button
        type="button"
        onClick={() => go('/leaderboard')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-sky-50 transition-colors"
      >
        <Trophy className="w-4 h-4 text-amber-500" />
        <span className="text-[11px] sm:text-xs font-heading font-black text-blue-900 uppercase">Ranking</span>
      </button>
      <Switch
        label="Som"
        ariaLabel="Sound Toggle"
        on={isSoundOn}
        onToggle={toggleSound}
        icon={isSoundOn ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
      />
      <Switch
        label="Música"
        ariaLabel="Music Toggle"
        on={isMusicOn}
        onToggle={toggleMusic}
        title="Trilha Sonora Oficial: Cleyton Kauffman - Superhero Theme"
        icon={<Music className={`w-4 h-4 ${isMusicOn ? 'text-amber-500' : 'text-slate-400'}`} />}
      />
    </nav>
  );
};

// Selo de nível (ex.: "NÍVEL 0").
export const LevelBadge: React.FC<{ level?: number; label?: string; className?: string }> = ({ level = 0, label = 'Nível', className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 text-white border-2 border-blue-900 shadow-[0_3px_0_0_#1e3a8a] font-heading font-black text-xs sm:text-sm uppercase tracking-wider ${className}`}
  >
    {label} {level}
  </span>
);
