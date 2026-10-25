import React from 'react';
import { LEVEL4_DISTRACTIONS } from '../../content/level4';

interface TeamTroublemakersProps {
  activityId?: string;
}

export const TeamTroublemakers: React.FC<TeamTroublemakersProps> = ({ activityId }) => {
  const lines = activityId ? LEVEL4_DISTRACTIONS[activityId] : null;
  return (
    <section className="mb-5 rounded-3xl border-4 border-orange-300 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-4 shadow-[0_6px_0_0_rgba(234,88,12,0.18)]" aria-label="Zé Cartinha e Mané Zoeira">
      <div className="flex items-end justify-center gap-5 sm:gap-10 min-h-32">
        <div className="flex flex-col items-center max-w-[45%]">
          <img src="/assets/ze_cartinha.png" alt="Zé Cartinha" className="h-24 sm:h-32 w-auto object-contain drop-shadow-lg" />
          <strong className="text-xs sm:text-sm text-amber-700">Zé Cartinha</strong>
          <p className="mt-1 rounded-xl bg-white border-2 border-amber-300 px-2 py-1 text-center text-xs font-bold text-slate-700">
            {lines?.ze ?? 'Eu e o Mané temos um plano de bagunça!'}
          </p>
        </div>
        <div className="flex flex-col items-center max-w-[45%]">
          <img src="/assets/mane_zoeira.png" alt="Mané Zoeira" className="h-24 sm:h-32 w-auto object-contain drop-shadow-lg" />
          <strong className="text-xs sm:text-sm text-orange-700">Mané Zoeira</strong>
          <p className="mt-1 rounded-xl bg-white border-2 border-orange-300 px-2 py-1 text-center text-xs font-bold text-slate-700">
            {lines?.mane ?? 'Trabalho em equipe? Eu trabalho na zoeira!'}
          </p>
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-black uppercase tracking-wider text-orange-700">
        A dupla atrapalha. A equipe resolve em inglês.
      </p>
    </section>
  );
};
