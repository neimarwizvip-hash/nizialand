import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { isGuestPlayer } from '../../types';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { NisialandLogo } from '../ui/NisialandLogo';
import { Icone } from './Icones';
import { Moedas } from './Medidores';
import { isFullscreen, isFullscreenSupported, onFullscreenChange, setFullscreenOptOut, toggleFullscreen } from '../../services/fullscreen';
import { audioService } from '../../services/audio';

// HUD: uma barra só, 56 px (48 no celular deitado). Substitui as duas barras do cabeçalho antigo.
// Esquerda: logo + nível. Centro: jogador, equipe, moedas (+ slot `children`, ex.: cronômetro). Direita: mapa, som, música, tela cheia, sair.
// Mantém os aria-labels "Sound Toggle" e "Music Toggle" usados nos testes de som.

const BotaoHud: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { rotulo?: string; icone: React.ReactNode }> = ({ rotulo, icone, className = '', ...rest }) => (
  <button type="button" className={`kit-hud__btn ${className}`} {...rest}>
    {icone}
    {rotulo && <span className="hidden md:inline">{rotulo}</span>}
  </button>
);

const TelaCheia: React.FC = () => {
  const [ativo, setAtivo] = React.useState<boolean>(() => isFullscreen());
  React.useEffect(() => onFullscreenChange(() => setAtivo(isFullscreen())), []);
  if (!isFullscreenSupported()) return null;
  return (
    <BotaoHud
      icone={<Icone nome="tela-cheia" className="w-5 h-5" />}
      title={ativo ? 'Sair da tela cheia' : 'Tela cheia'}
      aria-label={ativo ? 'Sair da tela cheia' : 'Tela cheia'}
      onClick={() => { setFullscreenOptOut(ativo); void toggleFullscreen(); }}
    />
  );
};

export const Hud: React.FC<{ nivel?: number; mostrarMoedas?: boolean; mostrarMapa?: boolean; children?: React.ReactNode; className?: string }> = ({
  nivel, mostrarMoedas = true, mostrarMapa = true, children, className = '',
}) => {
  const { currentPlayer, totalScore, isSoundOn, toggleSound, isMusicOn, toggleMusic, logout } = useGame();
  const navigate = useNavigate();
  const isBlue = currentPlayer?.team === 'blue';

  const ir = (caminho: string) => { audioService.playClick(); navigate(caminho); };

  return (
    <header className={`kit-hud sticky top-0 z-50 w-full px-2 sm:px-3 flex items-center justify-between gap-2 ${className}`}>
      {/* Esquerda: logo + nível */}
      <div className="flex items-center gap-2 min-w-0">
        <Link to="/" aria-label="Início" className="shrink-0 -my-1">
          <NisialandLogo size="sm" className="h-9 short:h-7 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" />
        </Link>
        {typeof nivel === 'number' && (
          <span className="kit-ficha kit-ficha--sol hidden sm:inline-flex short:hidden whitespace-nowrap">Nível {nivel}</span>
        )}
      </div>

      {/* Centro: jogador, equipe, moedas, slot */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {currentPlayer && (
          <div className="hidden sm:flex short:hidden items-center gap-2 min-w-0" title={isGuestPlayer(currentPlayer) ? 'Visitante' : `Código ${currentPlayer.playerCode}`}>
            <PlayerAvatar avatarId={currentPlayer.avatar} skinTone={currentPlayer.skinTone} size="sm" className="border-2 border-nisia-sol-400 shadow-[0_2px_0_0_#D98E00]" />
            <div className="leading-tight min-w-0">
              <p className="font-display text-sm text-white truncate max-w-[9rem]">{currentPlayer.displayName}</p>
              <p className="text-[11px] text-nisia-sol-300 font-semibold truncate">
                {isGuestPlayer(currentPlayer) ? 'Visitante' : `Turma ${currentPlayer.className}`}
              </p>
            </div>
          </div>
        )}
        {currentPlayer && (
          <span
            className={`hidden md:inline-flex items-center gap-1 kit-ficha ${isBlue ? 'kit-ficha--azul' : 'kit-ficha--roxo'}`}
            title={isBlue ? 'Equipe Azul' : 'Equipe Roxa'}
          >
            <Icone nome="escudo" className="w-4 h-4" cor={isBlue ? '#A9CDFF' : '#EDE3FF'} />
            <span className="hidden lg:inline">{isBlue ? 'Azul' : 'Roxa'}</span>
          </span>
        )}
        {currentPlayer && mostrarMoedas && <Moedas valor={totalScore} compacto />}
        {children}
      </div>

      {/* Direita: controles */}
      <nav aria-label="Controles do jogo" className="flex items-center gap-1 sm:gap-1.5">
        {mostrarMapa && (
          <BotaoHud icone={<Icone nome="mapa" className="w-5 h-5" />} rotulo="Mapa" title="Mapa das missões" onClick={() => ir('/mapa')} />
        )}
        <BotaoHud icone={<Icone nome="trofeu" className="w-5 h-5" />} rotulo="Ranking" title="Ranking" onClick={() => ir('/leaderboard')} className="hidden sm:inline-flex short:hidden" />
        <BotaoHud
          role="switch"
          aria-checked={isSoundOn}
          aria-label="Sound Toggle"
          title={isSoundOn ? 'Desligar efeitos sonoros' : 'Ligar efeitos sonoros'}
          icone={<Icone nome={isSoundOn ? 'som' : 'som-mudo'} className="w-5 h-5" cor={isSoundOn ? '#0C2A66' : '#FFD23F'} />}
          onClick={toggleSound}
        />
        <BotaoHud
          role="switch"
          aria-checked={isMusicOn}
          aria-label="Music Toggle"
          title={isMusicOn ? 'Pausar música' : 'Tocar música (Superhero Theme, Cleyton Kauffman)'}
          icone={<Icone nome="musica" className="w-5 h-5" cor={isMusicOn ? '#0C2A66' : '#FFD23F'} />}
          onClick={toggleMusic}
        />
        <TelaCheia />
        {currentPlayer && (
          <BotaoHud
            icone={<Icone nome="sair" className="w-5 h-5" />}
            title="Trocar de jogador / Sair"
            aria-label="Logout"
            className="hidden sm:inline-flex short:hidden"
            onClick={() => { if (window.confirm('Quer trocar de jogador ou sair?')) { logout(); navigate('/'); } }}
          />
        )}
        <Link to="/admin" className="kit-hud__btn !min-w-0 !px-1.5 opacity-70 hover:opacity-100 short:hidden" title="Painel do professor" aria-label="Painel do professor">
          <Icone nome="professor" className="w-4 h-4" cor="#A9CDFF" />
        </Link>
      </nav>
    </header>
  );
};
