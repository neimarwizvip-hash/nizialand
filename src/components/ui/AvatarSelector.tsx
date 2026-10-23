import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Lock, 
  ShieldCheck, 
  Palette, 
  HeartHandshake, 
  Star,
  Award
} from 'lucide-react';
import { AVATAR_CATALOG, BASE_14_AVATARS, AvatarOption, PlayerAvatar, SkinTone } from './PlayerAvatar';
import { soundEffects } from '../../services/audio';

interface AvatarSelectorProps {
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
  selectedSkinTone?: SkinTone;
  onSelectSkinTone?: (tone: SkinTone) => void;
  playerLevel?: number; // Patente do jogador (0 = inicial)
}

const SKIN_TONES: { id: SkinTone; label: string; color: string }[] = [
  { id: 'light', label: 'Claro', color: '#fcd34d' },
  { id: 'warm', label: 'Dourado', color: '#f59e0b' },
  { id: 'medium', label: 'Moreno', color: '#b45309' },
  { id: 'dark', label: 'Negro', color: '#78350f' }
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatarId,
  onSelectAvatar,
  selectedSkinTone = 'light',
  onSelectSkinTone,
  playerLevel = 0
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | '14base' | 'hero' | 'inclusive'>('14base');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Selected avatar details
  const currentAvatar = AVATAR_CATALOG.find(a => a.id === selectedAvatarId || a.src === selectedAvatarId) || AVATAR_CATALOG[0];
  const isCurrentLocked = (currentAvatar.unlockLevel || 0) > playerLevel;

  // Filter list
  const displayAvatars = AVATAR_CATALOG.filter(a => {
    if (activeCategory === '14base') {
      return BASE_14_AVATARS.some(base => base.id === a.id);
    }
    if (activeCategory === 'hero') return a.category === 'hero';
    if (activeCategory === 'inclusive') return a.category === 'inclusive';
    return true;
  });

  const handleSelect = (avatar: AvatarOption) => {
    soundEffects.cardFlip();
    onSelectAvatar(avatar.id);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    soundEffects.buttonClick();
    if (scrollRef.current) {
      const offset = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white/90 border-2 border-cyan-500/40 rounded-2xl p-3.5 sm:p-5 text-slate-900 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* --- SHOWCASE PEDESTAL (LARGE PREVIEW OF CURRENT AVATAR) --- */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-gradient-to-r from-sky-50 via-white to-sky-50 rounded-2xl border border-cyan-500/30 mb-4 shadow-inner">
        {/* Glowing Pedestal & Avatar */}
        <div className="relative flex flex-col items-center">
          <div className="relative p-1.5 rounded-full bg-gradient-to-b from-cyan-400 via-blue-600 to-purple-600 shadow-[0_0_20px_rgba(0,210,255,0.4)]">
            <PlayerAvatar
              avatarId={currentAvatar.id}
              skinTone={selectedSkinTone}
              size="xl"
              className="border-2 border-white shadow-[0_4px_0_0_#7dd3fc]"
            />
          </div>
          <div className="w-20 h-2 bg-cyan-400/30 rounded-full blur-xs mt-1" />
        </div>

        {/* Avatar Info & Status */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h4 className="text-base sm:text-lg font-heading font-black text-amber-700">
              {currentAvatar.name}
            </h4>
            
            {/* Unlock Status Pill */}
            {isCurrentLocked ? (
              <span className="px-2 py-0.5 rounded-full bg-red-100/80 border border-red-500 text-red-700 font-heading font-bold text-[10px] flex items-center gap-1">
                <Lock className="w-3 h-3 text-red-600" />
                Desbloqueia na Patente {currentAvatar.unlockLevel}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-400 text-emerald-700 font-heading font-bold text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Disponível • Patente {currentAvatar.unlockLevel}
              </span>
            )}
          </div>

          <p className="text-xs text-cyan-800/90 font-medium mb-2.5">
            {currentAvatar.description || 'Modelo de estudante para as aventuras em Língua Inglesa do NISIALAND.'}
          </p>

          {/* Skin Tone Selector (for compatible avatars) */}
          {currentAvatar.allowsSkinTone ? (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="text-[11px] font-heading font-bold text-amber-600 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-amber-600" /> Tom de Pele:
              </span>
              <div className="flex items-center gap-1.5">
                {SKIN_TONES.map(tone => {
                  const isSelectedTone = selectedSkinTone === tone.id;
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => {
                        soundEffects.buttonClick();
                        onSelectSkinTone?.(tone.id);
                      }}
                      title={`Tom de pele ${tone.label}`}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-heading font-bold border flex items-center gap-1 transition-all ${
                        isSelectedTone
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-glow-gold scale-105'
                          : 'bg-white/95 border-sky-200 text-slate-600 hover:border-sky-400'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/40 inline-block"
                        style={{ backgroundColor: tone.color }}
                      />
                      <span>{tone.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-cyan-700/80 italic flex items-center justify-center sm:justify-start gap-1">
              <Star className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Herói Oficial 3D: Aparência canônica e proporções preservadas intactas.</span>
            </div>
          )}
        </div>
      </div>

      {/* --- LEVEL PROGRESSION BANNER & FILTER TABS --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div>
          <span className="text-[10px] font-heading font-black tracking-wider uppercase text-cyan-600 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            CATÁLOGO CUMULATIVO POR PATENTE (SUA PATENTE: {playerLevel})
          </span>
          <p className="text-[10px] text-slate-500">
            Nível 0: 4 heróis • Nível 1: +2 • Nível 2: +2 • Nível 3: +2 • Nível 4: +2 • Nível 5: +2 (Total 14)
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-0.5">
          <button
            type="button"
            onClick={() => setActiveCategory('14base')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-heading font-bold transition-all ${
              activeCategory === '14base'
                ? 'bg-amber-400 text-slate-950 font-black shadow-glow-gold'
                : 'bg-white/95 text-slate-600 hover:bg-sky-50'
            }`}
          >
            14 Modelos-Base
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('hero')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-heading font-bold transition-all ${
              activeCategory === 'hero'
                ? 'bg-purple-600 text-white font-black'
                : 'bg-white/95 text-slate-600 hover:bg-sky-50'
            }`}
          >
            4 Heróis (Nível 0)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('inclusive')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-heading font-bold transition-all ${
              activeCategory === 'inclusive'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-white/95 text-slate-600 hover:bg-sky-50'
            }`}
          >
            Inclusivos
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-heading font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white font-black'
                : 'bg-white/95 text-slate-600 hover:bg-sky-50'
            }`}
          >
            Todos ({AVATAR_CATALOG.length})
          </button>
        </div>
      </div>

      {/* --- CAROUSEL WITH ARROW NAVIGATION --- */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute -left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 border border-cyan-400 text-cyan-700 hover:text-slate-900 hover:bg-blue-600 flex items-center justify-center shadow-lg active:scale-95 transition-all"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-cyan-500/40 scrollbar-track-transparent scroll-smooth"
        >
          {displayAvatars.map(avatar => {
            const isSelected = selectedAvatarId === avatar.id || selectedAvatarId === avatar.src;
            const isLocked = (avatar.unlockLevel || 0) > playerLevel;

            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => handleSelect(avatar)}
                className={`flex-shrink-0 flex flex-col items-center p-2 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative ${
                  isSelected
                    ? 'bg-blue-100/80 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105'
                    : isLocked
                    ? 'bg-white/90 border-sky-200 opacity-60 hover:opacity-80'
                    : 'bg-white/90 border-cyan-500/40 hover:border-cyan-300 hover:bg-white/90'
                }`}
                style={{ width: '92px' }}
              >
                {/* Level badge */}
                <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-white/90 text-[8px] font-heading font-black text-cyan-700 border border-sky-200">
                  PAT {avatar.unlockLevel}
                </span>

                {/* Avatar Image / Sprite */}
                <div className="relative my-1">
                  <PlayerAvatar
                    avatarId={avatar.id}
                    skinTone={avatar.allowsSkinTone ? selectedSkinTone : 'light'}
                    size="md"
                    className={isSelected ? 'ring-2 ring-amber-400' : ''}
                  />

                  {/* Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Lock icon if locked */}
                  {isLocked && !isSelected && (
                    <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                  )}
                </div>

                {/* Avatar Label */}
                <span className="text-[10px] font-heading font-bold text-center line-clamp-1 w-full text-slate-900">
                  {avatar.name.split(' ')[0]}
                </span>
                <span className="text-[8px] text-cyan-700/70 line-clamp-1 w-full text-center">
                  {isLocked ? `Bloq. PAT ${avatar.unlockLevel}` : 'Disponível'}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 border border-cyan-400 text-cyan-700 hover:text-slate-900 hover:bg-blue-600 flex items-center justify-center shadow-lg active:scale-95 transition-all"
          aria-label="Rolar para direita"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

