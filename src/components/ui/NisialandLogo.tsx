import React, { useState } from 'react';

// Logo oficial NISIALAND (PNG transparente). Não redesenhar: se a imagem faltar, mostra só um texto simples de reserva.
export const LOGO_SRC = '/assets/nisialand_logo_oficial.png';

type LogoSize = 'sm' | 'md' | 'lg';

const IMG_SIZE: Record<LogoSize, string> = {
  sm: 'h-8 sm:h-10',
  md: 'h-14 sm:h-16',
  lg: 'h-[18vw] max-h-40 wide:h-[clamp(5rem,15vw,11rem)] wide:max-h-none',
};

const TEXT_SIZE: Record<LogoSize, string> = {
  sm: 'text-lg sm:text-xl',
  md: 'text-2xl sm:text-3xl',
  lg: 'text-[8vw] wide:text-[clamp(2rem,5vw,4.5rem)]',
};

export const NisialandLogo: React.FC<{ size?: LogoSize; className?: string }> = ({ size = 'md', className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`inline-block font-heading font-black text-blue-900 bg-white/90 rounded-xl px-3 py-1 select-none ${TEXT_SIZE[size]} ${className}`}>
        NISIALAND
      </span>
    );
  }

  return (
    <img
      src={LOGO_SRC}
      alt="NISIALAND"
      draggable={false}
      onError={() => setFailed(true)}
      className={`w-auto object-contain select-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)] ${IMG_SIZE[size]} ${className}`}
    />
  );
};
