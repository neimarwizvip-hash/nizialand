import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../../services/storage';
import type { TeamRankingComparison } from '../../types';
import { audioService } from '../../services/audio';
import { Icone } from './Icones';

// Placar Equipe Azul × Equipe Roxa (média por jogador, o critério oficial do ranking).
// Aparece na HUD; guarda o último resultado em memória para não consultar a planilha a cada tela.

const VALIDADE_MS = 60_000;
let cache: { em: number; dados: TeamRankingComparison } | null = null;

export async function placarEquipes(): Promise<TeamRankingComparison | null> {
  if (cache && Date.now() - cache.em < VALIDADE_MS) return cache.dados;
  try {
    const dados = await storageService.getTeamComparison();
    cache = { em: Date.now(), dados };
    return dados;
  } catch {
    return cache?.dados ?? null;
  }
}

export const PlacarEquipes: React.FC<{ className?: string; detalhado?: boolean }> = ({ className = '', detalhado = false }) => {
  const navigate = useNavigate();
  const [dados, setDados] = useState<TeamRankingComparison | null>(cache?.dados ?? null);

  useEffect(() => {
    let vivo = true;
    void placarEquipes().then(d => { if (vivo && d) setDados(d); });
    return () => { vivo = false; };
  }, []);

  if (!dados) return null;
  const azul = dados.blueTeam.averageScore;
  const roxa = dados.purpleTeam.averageScore;
  const total = azul + roxa;
  const fracAzul = total > 0 ? azul / total : 0.5;
  const lider = dados.leadingTeam;
  const rotulo = lider === 'blue' ? 'Equipe Azul na frente' : lider === 'purple' ? 'Equipe Roxa na frente' : 'Equipes empatadas';

  return (
    <button
      type="button"
      onClick={() => { audioService.playClick(); navigate('/leaderboard'); }}
      title={`${rotulo} (média de pontos por jogador)`}
      aria-label={`Placar das equipes: Azul ${azul}, Roxa ${roxa}. ${rotulo}. Abrir ranking`}
      className={`group inline-flex items-center gap-1.5 rounded-full bg-nisia-azul-900/70 border-2 border-nisia-azul-700 px-1.5 py-0.5 hover:border-nisia-sol-400 transition-colors ${className}`}
    >
      <span className={`inline-flex items-center gap-1 font-display text-sm tabular-nums ${lider === 'blue' ? 'text-nisia-sol-400' : 'text-nisia-azul-100'}`}>
        <Icone nome="escudo" className="w-4 h-4" cor="#1F5FD0" />
        {azul.toLocaleString('pt-BR')}
      </span>
      <span className="relative w-14 short:w-10 h-2.5 rounded-full overflow-hidden border border-nisia-tinta bg-nisia-roxo-600" aria-hidden="true">
        <span className="absolute inset-y-0 left-0 bg-nisia-azul-500 transition-all duration-500" style={{ width: `${fracAzul * 100}%` }} />
      </span>
      <span className={`inline-flex items-center gap-1 font-display text-sm tabular-nums ${lider === 'purple' ? 'text-nisia-sol-400' : 'text-nisia-azul-100'}`}>
        {roxa.toLocaleString('pt-BR')}
        <Icone nome="escudo" className="w-4 h-4" cor="#7B3FE4" />
      </span>
      {detalhado && <span className="text-[11px] text-nisia-azul-100 font-semibold pl-1">{rotulo}</span>}
    </button>
  );
};
