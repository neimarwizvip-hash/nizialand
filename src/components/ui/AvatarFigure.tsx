import React from 'react';
import { AVATAR_CATALOG, SkinTone, skinToneFilter } from './PlayerAvatar';

// Avatar de corpo inteiro (vitrine do cadastro). Usa as mesmas imagens do PlayerAvatar:
// heróis em PNG de corpo inteiro, recortes das pranchas de sprites e, para os 4 clássicos
// (que só têm retrato), o retrato dentro de uma moldura.
const SHEETS = {
  'sprite-board': { url: '/assets/nisialand_16_avatars_board.jpg', cols: 8, rows: 2, aspect: '3 / 8' },
  'sprite-inc': { url: '/assets/nisialand_inclusive_students.png', cols: 4, rows: 2, aspect: '3 / 4' },
} as const;

export const AvatarFigure: React.FC<{ avatarId: string; skinTone?: SkinTone; className?: string }> = ({
  avatarId,
  skinTone = 'light',
  className = '',
}) => {
  const found = AVATAR_CATALOG.find(a => a.id === avatarId) || AVATAR_CATALOG[0];
  const filterStyle =
    found.allowsSkinTone && skinTone !== 'light' ? { filter: skinToneFilter[skinTone] } : {};

  if ((found.type === 'sprite-board' || found.type === 'sprite-inc') && typeof found.col === 'number' && typeof found.row === 'number') {
    const sheet = SHEETS[found.type];
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div
          role="img"
          aria-label={found.name}
          className="h-full max-w-full"
          style={{
            aspectRatio: sheet.aspect,
            backgroundImage: `url(${sheet.url})`,
            backgroundSize: `${sheet.cols * 100}% ${sheet.rows * 100}%`,
            backgroundPosition: `${(found.col / (sheet.cols - 1)) * 100}% ${(found.row / (sheet.rows - 1)) * 100}%`,
            backgroundRepeat: 'no-repeat',
            ...filterStyle,
          }}
        />
      </div>
    );
  }

  if (found.category === 'classic') {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <img
          src={found.src}
          alt={found.name}
          className="max-h-[85%] aspect-square object-cover rounded-3xl border-4 border-amber-400 shadow-[0_6px_0_0_#b45309]"
        />
      </div>
    );
  }

  return (
    <div className={`h-full flex items-center justify-center ${className}`}>
      <img src={found.src} alt={found.name} style={filterStyle} className="h-full w-full object-contain drop-shadow-xl" />
    </div>
  );
};
