import React from 'react';
import { PROXIMO_NIVEL } from '../../data/proximoNivel';
import { Icone } from './Icones';

// Cartão "Vem aí no próximo nível" (aparece quando o nível termina).
export const TeaserProximo: React.FC<{ nivel: number; className?: string }> = ({ nivel, className = '' }) => {
  const p = PROXIMO_NIVEL[nivel];
  if (!p) return null;
  return (
    <div className={`kit-papel rounded-xl px-4 py-2.5 short:px-2 short:py-1 flex items-center gap-3 border-2 border-dashed border-nisia-roxo-400 ${className}`}>
      <span className="w-10 h-10 short:w-7 short:h-7 rounded-full bg-nisia-roxo-500 flex items-center justify-center shrink-0" aria-hidden="true"><Icone nome="estrela" className="w-6 h-6 short:w-4 short:h-4" cor="#FFD23F" /></span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-nisia-roxo-700">Vem aí · {p.titulo}</p>
        <p className="text-sm short:text-xs text-nisia-tinta leading-snug">{p.texto}</p>
      </div>
    </div>
  );
};
