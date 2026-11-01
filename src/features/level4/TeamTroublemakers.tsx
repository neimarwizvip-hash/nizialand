import React from 'react';
import { LEVEL4_DISTRACTIONS } from '../../content/level4';

interface TeamTroublemakersProps {
  activityId?: string;
}

// Zé Cartinha e Mané Zoeira, a dupla que atrapalha o Nível 4, num recado pregado no mural.
export const TeamTroublemakers: React.FC<TeamTroublemakersProps> = ({ activityId }) => {
  const lines = activityId ? LEVEL4_DISTRACTIONS[activityId] : null;
  return (
    <section className="kit-papel kit-papel--liso relative px-3 py-2 short:hidden" aria-label="Zé Cartinha e Mané Zoeira">
      <div className="flex items-end justify-center gap-4 sm:gap-8">
        <div className="flex items-end gap-2 max-w-[48%]">
          <img src="/assets/ze_cartinha.png" alt="Zé Cartinha" className="h-14 alto:h-24 short:h-12 w-auto object-contain drop-shadow-[0_4px_6px_rgba(12,42,102,0.35)]" />
          <div className="min-w-0">
            <strong className="block font-display text-xs sm:text-sm text-nisia-laranja-700">Zé Cartinha</strong>
            <p className="kit-balao kit-balao--esq !px-2.5 !py-1 text-xs short:text-[10px] font-semibold">{lines?.ze ?? 'Eu e o Mané temos um plano de bagunça!'}</p>
          </div>
        </div>
        <div className="flex items-end gap-2 max-w-[48%]">
          <img src="/assets/mane_zoeira.png" alt="Mané Zoeira" className="h-14 alto:h-24 short:h-12 w-auto object-contain drop-shadow-[0_4px_6px_rgba(12,42,102,0.35)]" />
          <div className="min-w-0">
            <strong className="block font-display text-xs sm:text-sm text-nisia-laranja-700">Mané Zoeira</strong>
            <p className="kit-balao kit-balao--esq !px-2.5 !py-1 text-xs short:text-[10px] font-semibold">{lines?.mane ?? 'Trabalho em equipe? Eu trabalho na zoeira!'}</p>
          </div>
        </div>
      </div>
      <p className="hidden alto:block mt-1.5 text-center font-display text-xs uppercase tracking-wider text-nisia-azul-700">
        A dupla atrapalha. A equipe resolve em inglês.
      </p>
    </section>
  );
};
