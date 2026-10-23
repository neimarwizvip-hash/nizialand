import React, { useEffect, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { isFullscreen, isFullscreenSupported, onFullscreenChange, setFullscreenOptOut, toggleFullscreen } from '../../services/fullscreen';

// Botão pequeno para entrar/sair da tela cheia; acompanha o estado real (inclusive quando o aluno aperta Esc).
export const FullscreenButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [active, setActive] = useState<boolean>(() => isFullscreen());

  useEffect(() => onFullscreenChange(() => setActive(isFullscreen())), []);

  if (!isFullscreenSupported()) return null;

  return (
    <button
      onClick={() => {
        // sair pelo botão é escolha do aluno: aí o jogo para de voltar sozinho à tela cheia
        setFullscreenOptOut(active);
        void toggleFullscreen();
      }}
      className={`p-2 rounded-xl border-2 transition-all active:translate-y-0.5 bg-white text-blue-700 border-sky-300 shadow-[0_3px_0_0_#7dd3fc] hover:bg-sky-50 ${className}`}
      title={active ? 'Sair da tela cheia' : 'Tela cheia'}
      aria-label={active ? 'Sair da tela cheia' : 'Tela cheia'}
    >
      {active ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
    </button>
  );
};
