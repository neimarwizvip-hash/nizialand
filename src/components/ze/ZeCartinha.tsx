import React, { useState } from 'react';

// Zé Cartinha: o antagonista brincalhão do Nível 0.
// Aparece no canto direito com um balão de fala (nada de tela cheia, sem deslizar).
// A arte oficial fica em /assets/ze_cartinha.png; se ainda não existir, aparece só o balão.
interface ZeCartinhaProps {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  imageClassName?: string;
}

export const ZeCartinha: React.FC<ZeCartinhaProps> = ({ visible, message, actionLabel, onAction, imageClassName = '' }) => {
  const [imgOk, setImgOk] = useState<boolean>(true);

  if (!visible) return null;

  return (
    <div
      className="fixed right-2 sm:right-4 bottom-4 sm:bottom-8 z-40 flex items-end gap-2 max-w-[calc(100vw-1rem)]"
      role="dialog"
      aria-live="polite"
      aria-label="Zé Cartinha"
    >
      <div className={`relative kit-balao ${imgOk ? 'kit-balao--dir' : ''} animate-balao-in !px-4 !py-3 max-w-[260px] sm:max-w-xs`}>
        <p className="text-[10px] font-display tracking-widest text-nisia-laranja-700 uppercase">Zé Cartinha</p>
        <p className="text-sm sm:text-base font-display font-bold text-nisia-tinta leading-snug mt-0.5">{message}</p>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="kit-btn kit-btn--azul kit-btn--sm mt-2 w-full"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {imgOk && (
        <img
          src="/assets/ze_cartinha.png"
          alt="Zé Cartinha"
          onError={() => setImgOk(false)}
          className={`${imageClassName || 'w-24 sm:w-36'} h-auto drop-shadow-[0_8px_10px_rgba(12,42,102,0.45)] select-none pointer-events-none`}
          draggable={false}
        />
      )}
    </div>
  );
};
