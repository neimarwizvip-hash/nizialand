import React from 'react';

export type SkinTone = 'light' | 'medium' | 'dark' | 'warm';

export interface AvatarOption {
  id: string;
  name: string;
  category: 'archetype' | 'inclusive' | 'hero' | 'classic';
  type: 'image' | 'sprite-board' | 'sprite-inc';
  unlockLevel: number; // 0, 1, 2, 3, 4, 5
  allowsSkinTone: boolean; // Strictly false for 4 initial heroes, true for others
  description?: string;
  src?: string;
  col?: number;
  row?: number;
}

export const AVATAR_CATALOG: AvatarOption[] = [
  // --- LEVEL 0: 4 INITIAL HEROES (Preserved intact, NO skin tone alterations) ---
  { id: 'hero-boy-hoodie', name: 'Alex (Moletom)', category: 'hero', type: 'image', unlockLevel: 0, allowsSkinTone: false, description: 'Estudante explorador do Blue Team', src: '/assets/student_boy_hoodie.png' },
  { id: 'hero-girl-pony', name: 'Larissa (Rabo de Cavalo)', category: 'hero', type: 'image', unlockLevel: 0, allowsSkinTone: false, description: 'Líder corajosa do Purple Team', src: '/assets/student_girl_ponytail.png' },
  { id: 'hero-boy-tshirt', name: 'Caio (Camiseta)', category: 'hero', type: 'image', unlockLevel: 0, allowsSkinTone: false, description: 'Atleta comunicativo do Blue Team', src: '/assets/student_boy_tshirt.png' },
  { id: 'hero-girl-curl', name: 'Manuela (Cachos)', category: 'hero', type: 'image', unlockLevel: 0, allowsSkinTone: false, description: 'Criativa e perspicaz do Purple Team', src: '/assets/student_girl_curly.png' },

  // --- LEVEL 1: +2 MODELS (Cumulative Total = 6) ---
  { id: 'inc-0', name: 'Gabriel (Cadeirante / Esportista)', category: 'inclusive', type: 'sprite-inc', unlockLevel: 1, allowsSkinTone: true, description: 'Determinado e ágil nas quadras escolares', col: 0, row: 0 },
  { id: 'board-2', name: 'Maya (A Líder Comunicativa)', category: 'archetype', type: 'sprite-board', unlockLevel: 1, allowsSkinTone: true, description: 'Voz ativa do grêmio estudantil', col: 2, row: 0 },

  // --- LEVEL 2: +2 MODELS (Cumulative Total = 8) ---
  { id: 'inc-4', name: 'Samuel (Expressão em Libras)', category: 'inclusive', type: 'sprite-inc', unlockLevel: 2, allowsSkinTone: true, description: 'Comunicação bilíngue Libras e Português', col: 0, row: 1 },
  { id: 'inc-5', name: 'Laura (Expressão em Libras)', category: 'inclusive', type: 'sprite-inc', unlockLevel: 2, allowsSkinTone: true, description: 'Expressiva, acolhedora e criativa', col: 1, row: 1 },

  // --- LEVEL 3: +2 MODELS (Cumulative Total = 10) ---
  { id: 'inc-6', name: 'Bernardo (Fones Sensoriais)', category: 'inclusive', type: 'sprite-inc', unlockLevel: 3, allowsSkinTone: true, description: 'Foco analítico com abafadores sensoriais', col: 2, row: 1 },
  { id: 'inc-7', name: 'Rebeca (Fones Sensoriais)', category: 'inclusive', type: 'sprite-inc', unlockLevel: 3, allowsSkinTone: true, description: 'Leitora voraz e concentrada', col: 3, row: 1 },

  // --- LEVEL 4: +2 MODELS (Cumulative Total = 12) ---
  { id: 'inc-2', name: 'Sara (Baixa Visão / Mobilidade)', category: 'inclusive', type: 'sprite-inc', unlockLevel: 4, allowsSkinTone: true, description: 'Autônoma e atenta aos detalhes com bengala', col: 2, row: 0 },
  { id: 'board-11', name: 'Theo (O Estrategista)', category: 'archetype', type: 'sprite-board', unlockLevel: 4, allowsSkinTone: true, description: 'Planejador metódico e silencioso', col: 3, row: 1 },

  // --- LEVEL 5: +2 MODELS (Cumulative Total = 14) ---
  { id: 'board-14', name: 'Alice (Tecnologia & Robótica)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, description: 'Especialista no laboratório de ciências', col: 6, row: 1 },
  { id: 'board-9', name: 'Lucas (Música & Criatividade)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, description: 'Compositor de rimas e ritmos escolares', col: 1, row: 1 },

  // Additional School Archetypes for classroom variety (Unlock at Level 5+)
  { id: 'board-0', name: 'Leo (O Estudioso)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, col: 0, row: 0 },
  { id: 'board-1', name: 'Davi (O Amigão)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, col: 1, row: 0 },
  { id: 'board-3', name: 'Camila (A Criativa)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, col: 3, row: 0 },
  { id: 'board-4', name: 'Pedro (O Pensador)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, col: 4, row: 0 },
  { id: 'board-5', name: 'Luana (A Dedicada)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, col: 5, row: 0 },
  { id: 'board-6', name: 'Enzo (O Atleta)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, col: 6, row: 0 },
  { id: 'board-7', name: 'Bia (A Comunicativa)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, col: 7, row: 0 },
  { id: 'board-8', name: 'Aysha (A Corajosa)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, col: 0, row: 1 },
  { id: 'board-10', name: 'Clara (A Sonhadora)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, col: 2, row: 1 },
  { id: 'board-12', name: 'Luna (A Gamer)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, col: 4, row: 1 },
  { id: 'board-13', name: 'Cauã (O Positivo)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, col: 5, row: 1 },
  { id: 'board-15', name: 'Mariana (A Leitora)', category: 'archetype', type: 'sprite-board', unlockLevel: 5, allowsSkinTone: true, col: 7, row: 1 },

  // Additional Inclusives
  { id: 'inc-1', name: 'Julia (Cadeirante)', category: 'inclusive', type: 'sprite-inc', unlockLevel: 5, allowsSkinTone: true, col: 1, row: 0 },
  { id: 'inc-3', name: 'Noah (Estudioso)', category: 'inclusive', type: 'sprite-inc', unlockLevel: 5, allowsSkinTone: true, col: 3, row: 0 },

  // Classics (Flashcard Students)
  { id: 'classic-mateus', name: 'Mateus', category: 'classic', type: 'image', unlockLevel: 0, allowsSkinTone: false, src: '/assets/avatar_mateus.jpg' },
  { id: 'classic-juliana', name: 'Juliana', category: 'classic', type: 'image', unlockLevel: 0, allowsSkinTone: false, src: '/assets/avatar_juliana.jpg' },
  { id: 'classic-carlos', name: 'Carlos', category: 'classic', type: 'image', unlockLevel: 0, allowsSkinTone: false, src: '/assets/avatar_carlos.jpg' },
  { id: 'classic-sofia', name: 'Sofia', category: 'classic', type: 'image', unlockLevel: 0, allowsSkinTone: false, src: '/assets/avatar_sofia.jpg' }
];

// 14 Base Models strictly referenced in the progression schedule
export const BASE_14_AVATARS: AvatarOption[] = AVATAR_CATALOG.filter(a => [
  'hero-boy-hoodie', 'hero-girl-pony', 'hero-boy-tshirt', 'hero-girl-curl',
  'inc-0', 'board-2',
  'inc-4', 'inc-5',
  'inc-6', 'inc-7',
  'inc-2', 'board-11',
  'board-14', 'board-9'
].includes(a.id));

interface PlayerAvatarProps {
  avatarId?: string;
  skinTone?: SkinTone;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  alt?: string;
}

const sizeClasses = {
  xs: 'w-7 h-7',
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  '2xl': 'w-32 h-32'
};

export const skinToneFilter: Record<SkinTone, string> = {
  light: 'none',
  warm: 'sepia(0.2) saturate(1.15) contrast(1.02)',
  medium: 'sepia(0.35) saturate(1.2) brightness(0.92) contrast(1.05)',
  dark: 'sepia(0.5) saturate(1.25) brightness(0.8) contrast(1.1)'
};

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatarId = 'hero-boy-hoodie',
  skinTone = 'light',
  size = 'md',
  className = '',
  alt = 'Avatar do Estudante'
}) => {
  const sizeCls = sizeClasses[size] || sizeClasses.md;

  // Check if avatar is one in the catalog
  const found = AVATAR_CATALOG.find(a => a.id === avatarId || a.src === avatarId);

  // Apply subtle skin tone filter only if the avatar allows it
  const filterStyle = (found?.allowsSkinTone && skinTone && skinTone !== 'light') 
    ? { filter: skinToneFilter[skinTone] } 
    : {};

  // If it's a sprite on the 16 board
  if (found?.type === 'sprite-board' && typeof found.col === 'number' && typeof found.row === 'number') {
    const posX = (found.col / 7) * 100;
    const posY = found.row === 0 ? 8 : 92;
    return (
      <div
        className={`${sizeCls} rounded-full overflow-hidden bg-sky-100 flex-shrink-0 border-2 border-amber-400 shadow-md ${className}`}
        style={{
          backgroundImage: 'url(/assets/nisialand_16_avatars_board.jpg)',
          backgroundSize: '820% 210%',
          backgroundPosition: `${posX}% ${posY}%`,
          backgroundRepeat: 'no-repeat',
          ...filterStyle
        }}
        title={`${found.name} (Patente ${found.unlockLevel})`}
        aria-label={alt || found.name}
      />
    );
  }

  // If it's a sprite on the inclusive board
  if (found?.type === 'sprite-inc' && typeof found.col === 'number' && typeof found.row === 'number') {
    const posX = (found.col / 3) * 100;
    const posY = found.row === 0 ? 10 : 90;
    return (
      <div
        className={`${sizeCls} rounded-full overflow-hidden bg-sky-100 flex-shrink-0 border-2 border-emerald-400 shadow-md ${className}`}
        style={{
          backgroundImage: 'url(/assets/nisialand_inclusive_students.png)',
          backgroundSize: '420% 210%',
          backgroundPosition: `${posX}% ${posY}%`,
          backgroundRepeat: 'no-repeat',
          ...filterStyle
        }}
        title={`${found.name} (Patente ${found.unlockLevel})`}
        aria-label={alt || found.name}
      />
    );
  }

  // If it's an image
  const imageSrc = found?.src || (avatarId.startsWith('/') ? avatarId : '/assets/student_boy_hoodie.png');

  return (
    <div className={`${sizeCls} rounded-full overflow-hidden bg-sky-100 flex-shrink-0 border-2 border-amber-400 shadow-md flex items-center justify-center ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        style={filterStyle}
        className="w-full h-full object-cover object-top"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/assets/student_boy_hoodie.png';
        }}
      />
    </div>
  );
};

