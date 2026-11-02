import React, { useMemo } from 'react';
import type { ActivityResult } from '../../core/types';
import { audioService } from '../../services/audio';
import { Anfitriao, BotaoJogo, Cenario, Estrelas, Ficha, Fita, Hud, Icone, Painel, Titulo } from '../../components/kit';
import { TeaserProximo } from '../../components/kit/TeaserProximo';
import type { NomeAnfitriao, NomeCenario, NomeIcone } from '../../components/kit';
import { fala as falaDoRoteiro } from '../../data/falasAnfitrioes';

// Quadro de cartazes do "modo simples" dos níveis com escola 3D (Níveis 3 e 4).
// Cada sala/lugar é um cartaz pregado no mural; o anfitrião do nível fala ao lado.

export interface ItemQuadro {
  id: string;
  rotulo: string; // "Sala 1", "Biblioteca"...
  nome: string;
  frase?: string;
  estado: 'locked' | 'available' | 'completed';
  resultado?: ActivityResult | null;
  icone: NomeIcone;
}

interface Props {
  nivel: number;
  titulo: string; // texto grande (testes procuram por ele)
  placa: string; // tema na placa de madeira
  subtitulo: string; // "8º ano"
  descricao?: string;
  anfitriao: NomeAnfitriao;
  cenario: NomeCenario;
  itens: ItemQuadro[];
  rotuloAbrir: string; // "Abrir sala", "Iniciar missão"
  conclusao?: React.ReactNode;
  extraCabecalho?: React.ReactNode;
  acoes?: React.ReactNode;
  onAbrir: (id: string) => void;
}

const COR: Array<'sol' | 'azul' | 'verde' | 'roxo' | 'laranja'> = ['azul', 'laranja', 'verde', 'roxo', 'sol', 'azul'];
const FAIXA: Record<string, string> = { sol: 'from-nisia-sol-400 to-nisia-sol-500', azul: 'from-nisia-azul-400 to-nisia-azul-500', verde: 'from-nisia-verde-400 to-nisia-verde-500', roxo: 'from-nisia-roxo-400 to-nisia-roxo-500', laranja: 'from-nisia-laranja-400 to-nisia-laranja-500' };

const Percevejo: React.FC<{ cor: string }> = ({ cor }) => (
  <svg viewBox="0 0 24 24" className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 drop-shadow-[0_3px_2px_rgba(0,0,0,0.35)]" aria-hidden="true">
    <circle cx="12" cy="10" r="7" fill={cor} /><circle cx="9.5" cy="7.5" r="2.2" fill="#fff" fillOpacity="0.7" /><path d="M12 17v5" stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const QuadroMissao: React.FC<Props> = ({ nivel, titulo, placa, subtitulo, descricao, anfitriao, cenario, itens, rotuloAbrir, conclusao, extraCabecalho, acoes, onAbrir }) => {
  const feitas = itens.filter(i => i.estado === 'completed').length;
  const proxima = itens.find(i => i.estado === 'available')?.nome;
  const momento = feitas === itens.length && itens.length > 0 ? 'concluido' : feitas > 0 ? 'meio' : 'apresenta';
  const falaHost = useMemo(() => falaDoRoteiro(nivel, momento, { missao: placa, proxima }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nivel, momento, proxima]);

  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col">
      <Cenario nome={cenario} escurecer={0.22} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={nivel} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 py-4 short:py-0.5 grid grid-cols-1 wide:grid-cols-[13rem_1fr] short:grid-cols-[7rem_1fr] gap-4 short:gap-2 items-end">
          <div className="hidden wide:flex short:flex items-end">
            <Anfitriao nome={anfitriao} lado="esq" altura="h-[20rem] short:h-28" fala={falaHost.pt} traducao={falaHost.en} />
          </div>
          <div className="flex flex-col gap-2.5 alto:gap-3 short:gap-1.5 pb-3 short:pb-1 min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="min-w-0">
                <Titulo nivel={1} className="text-4xl sm:text-5xl short:text-2xl leading-none">{titulo}</Titulo>
                <p className="mt-2 short:mt-1 inline-block kit-placa px-7 py-1.5 short:px-6 short:py-0.5 font-display text-lg sm:text-xl short:text-sm -rotate-1">{placa}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 short:gap-1">
                <Ficha cor="sol">{subtitulo}</Ficha>
                <Ficha cor="papel">{feitas} / {itens.length} feitas</Ficha>
                {acoes}
              </div>
            </div>
            {extraCabecalho}
            {descricao && <p className="hidden alto:block text-sm text-white/90 font-semibold max-w-3xl drop-shadow-[0_1px_0_rgba(12,42,102,0.8)]">{descricao}</p>}
            <Fita frac={itens.length ? feitas / itens.length : 0} className="max-w-md short:hidden" rotulo="Progresso da missão" />
            {conclusao}
            {conclusao && <TeaserProximo nivel={nivel} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 short:grid-cols-3 gap-4 short:gap-1.5">
              {itens.map((it, i) => {
                const locked = it.estado === 'locked';
                const done = !!it.resultado;
                const cor = COR[i % COR.length];
                const r = it.resultado;
                const estrelas = r && r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 3) : 0;
                return (
                  <Painel key={it.id} as="article" tipo="papel" liso data-activity={it.id} data-state={it.estado}
                    className={`flex flex-col items-center text-center p-2.5 pt-4 alto:p-3 alto:pt-5 short:p-1.5 short:pt-3 ${['-rotate-1', 'rotate-[0.8deg]', '-rotate-[0.6deg]', 'rotate-1'][i % 4]} ${locked ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                    <Percevejo cor={locked ? '#8A8A8A' : done ? '#3FA34D' : '#E5484D'} />
                    <div className={`absolute top-0 left-0 right-0 h-2.5 rounded-t-[12px] bg-gradient-to-r ${FAIXA[cor]}`} aria-hidden="true" />
                    <span className={`absolute -top-3 -left-3 w-9 h-9 short:w-7 short:h-7 rounded-full border-[3px] border-nisia-tinta bg-gradient-to-b ${FAIXA[cor]} text-nisia-tinta font-display text-base short:text-sm flex items-center justify-center shadow-[0_3px_0_0_rgba(26,42,74,0.35)]`} aria-hidden="true">{i + 1}</span>
                    <span className="text-[11px] font-display uppercase tracking-widest text-nisia-tinta-suave short:hidden">{it.rotulo}</span>
                    <Icone nome={locked ? 'cadeado' : it.icone} className="w-10 h-10 alto:w-12 alto:h-12 short:w-7 short:h-7 text-nisia-tinta drop-shadow-[0_4px_4px_rgba(26,42,74,0.25)]" cor={locked ? '#F3E4BE' : '#FFD23F'} />
                    <h2 className="font-display text-xl short:text-sm leading-tight text-nisia-azul-700 mt-1">{it.nome}</h2>
                    {it.frase && <p className="hidden alto:block text-sm text-nisia-tinta-suave leading-snug">{it.frase}</p>}
                    {done && <div className="mt-1 flex items-center gap-2 short:hidden"><Estrelas n={estrelas} /><span className="font-display text-nisia-tinta">{r?.score ?? 0} pts</span></div>}
                    <BotaoJogo cor={locked ? 'papel' : cor} disabled={locked} onClick={() => { audioService.playClick(); onAbrir(it.id); }}
                      className="mt-2 short:mt-1 w-full max-w-[12rem] short:min-h-[30px] short:text-xs short:py-0 disabled:cursor-not-allowed">
                      {locked ? <><Icone nome="cadeado" className="w-4 h-4" cor="#F3E4BE" /> Bloqueada</> : <><Icone nome="jogar" className="w-5 h-5 short:w-4 short:h-4" cor="currentColor" /> {done ? 'De novo' : rotuloAbrir}</>}
                    </BotaoJogo>
                  </Painel>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Painel de conclusão do nível (troféu, total e espaço para o Zé).
export const ConclusaoNivel: React.FC<{ texto: string; total: number; maximo?: number; extra?: React.ReactNode; className?: string }> = ({ texto, total, maximo, extra, className = '' }) => (
  <Painel tipo="papel" liso role="status" aria-live="polite" className={`px-4 py-3 short:px-2 short:py-1.5 flex items-center gap-4 short:gap-2 ${className}`}>
    <Icone nome="trofeu" className="w-12 h-12 short:w-8 short:h-8 text-nisia-tinta shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="font-display text-lg short:text-sm text-nisia-verde-700 leading-tight">{texto}</p>
      <p className="font-display text-2xl short:text-lg text-nisia-laranja-700 tabular-nums">{total} {maximo !== undefined && <span className="text-sm text-nisia-tinta-suave">/ {maximo} pts</span>}</p>
    </div>
    {extra}
  </Painel>
);
