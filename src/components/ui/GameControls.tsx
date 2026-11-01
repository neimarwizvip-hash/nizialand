import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';
import { Icone } from '../kit/Icones';

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
    className="flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-nisia-sol-100 transition-colors"
  >
    {icon}
    <span className="text-[11px] sm:text-xs font-display text-nisia-azul-700 uppercase tracking-wide short:sr-only">{label}</span>
    <span
      className={`relative inline-flex items-center w-12 h-6 rounded-full border-2 transition-colors ${
        on ? 'bg-nisia-verde-500 border-nisia-verde-700' : 'bg-nisia-papel-escuro border-nisia-papel-linha'
      }`}
    >
      <span className={`absolute text-[9px] font-display ${on ? 'left-1.5 text-white' : 'right-1 text-nisia-tinta-suave'}`}>{on ? 'ON' : 'OFF'}</span>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white border border-nisia-tinta/30 shadow transition-all ${on ? 'right-0.5' : 'left-0.5'}`} />
    </span>
  </button>
);

const Atalho: React.FC<{ onClick: () => void; title?: string; icone: React.ReactNode; children: React.ReactNode }> = ({ onClick, title, icone, children }) => (
  <button type="button" onClick={onClick} title={title} className="flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-nisia-sol-100 transition-colors">
    {icone}
    <span className="text-[11px] sm:text-xs font-display text-nisia-azul-700 uppercase tracking-wide short:sr-only">{children}</span>
  </button>
);

// Barra de controles do jogo (placa de papel): Mapa, Treino livre, Ranking, Som e Música (ligados ao estado real).
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
      className={`kit-papel kit-papel--liso flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 ${className}`}
    >
      <Atalho onClick={() => go('/mapa')} title="Mapa das missões" icone={<Icone nome="mapa" className="w-5 h-5" />}>Mapa</Atalho>
      {showFreeTraining && (
        <Atalho onClick={() => go('/level0')} title="Arcade livre: escolha série (6º ao Ensino Médio) e tópicos, sem cadastro" icone={<Icone nome="jogar" className="w-5 h-5" cor="#A67CF0" />}>Treino livre</Atalho>
      )}
      <Atalho onClick={() => go('/leaderboard')} icone={<Icone nome="trofeu" className="w-5 h-5" />}>Ranking</Atalho>
      <Switch
        label="Som"
        ariaLabel="Sound Toggle"
        on={isSoundOn}
        onToggle={toggleSound}
        icon={<Icone nome={isSoundOn ? 'som' : 'som-mudo'} className="w-5 h-5 text-nisia-tinta" cor={isSoundOn ? '#FFD23F' : '#F3E4BE'} />}
      />
      <Switch
        label="Música"
        ariaLabel="Music Toggle"
        on={isMusicOn}
        onToggle={toggleMusic}
        title="Trilha Sonora Oficial: Cleyton Kauffman - Superhero Theme"
        icon={<Icone nome="musica" className="w-5 h-5 text-nisia-tinta" cor={isMusicOn ? '#FFD23F' : '#F3E4BE'} />}
      />
    </nav>
  );
};

// Selo de nível (ex.: "NÍVEL 0").
export const LevelBadge: React.FC<{ level?: number; label?: string; className?: string }> = ({ level = 0, label = 'Nível', className = '' }) => (
  <span className={`kit-ficha kit-ficha--sol font-display uppercase tracking-wider ${className}`}>
    {label} {level}
  </span>
);
