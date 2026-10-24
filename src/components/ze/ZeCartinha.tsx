import React, { useState } from 'react';

// Zé Cartinha: o antagonista brincalhão do Nível 0.
// Entra deslizando pela lateral direita com um balão de fala (nada de tela cheia).
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
      className="fixed right-2 sm:right-4 bottom-4 sm:bottom-8 z-40 flex items-end gap-2 max-w-[calc(100vw-1rem)] animate-ze-slide-in"
      role="dialog"
      aria-live="polite"
      aria-label="Zé Cartinha"
    >
      <div className="relative bg-white border-[3px] border-amber-400 rounded-3xl px-4 py-3 shadow-[0_5px_0_0_#f59e0b] max-w-[260px] sm:max-w-xs">
        <p className="text-[10px] font-heading font-black tracking-widest text-amber-600 uppercase">Zé Cartinha</p>
        <p className="text-sm sm:text-base font-heading font-bold text-slate-800 leading-snug mt-0.5">{message}</p>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-2 w-full px-3 py-2 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 text-white font-heading font-black text-sm uppercase border-2 border-blue-900 shadow-[0_4px_0_0_#1e3a8a] active:translate-y-1 active:shadow-[0_1px_0_0_#1e3a8a]"
          >
            {actionLabel}
          </button>
        )}
        {imgOk && (
          <span className="hidden sm:block absolute -right-2 bottom-6 w-4 h-4 bg-white border-r-[3px] border-b-[3px] border-amber-400 -rotate-45" />
        )}
      </div>
      {imgOk && (
        <img
          src="/assets/ze_cartinha.png"
          alt="Zé Cartinha"
          onError={() => setImgOk(false)}
          className={`w-24 sm:w-36 h-auto drop-shadow-xl select-none pointer-events-none transition-all duration-700 ${imageClassName}`}
          draggable={false}
        />
      )}
    </div>
  );
};
