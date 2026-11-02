import React, { useMemo } from 'react';
import type { ActivityProgress } from '../../engines/progression/progress';
import { audioService } from '../../services/audio';
import { Anfitriao, BotaoJogo, Cenario, Estrelas, Ficha, Fita, Hud, Icone, Painel, Titulo } from '../../components/kit';
import type { NomeAnfitriao, NomeCenario, NomeIcone } from '../../components/kit';
import type { Mechanic } from '../../core/types';
import { fala as falaDoRoteiro } from '../../data/falasAnfitrioes';
import { useGame } from '../../context/GameContext';
import type { ItemRodada } from '../../data/rodadasFases';
import { type ResultadoRodada } from './RodadaAtividade';
import { JogoAtividade } from '../jogos/JogoAtividade';
import { TeaserProximo } from '../../components/kit/TeaserProximo';
import type { DadosJogo } from '../../data/jogosFases';

// Tela comum das missões dos Níveis 3 a 7 (cartazes das atividades) e da pergunta de cada atividade.
// Cada atividade abre uma rodada de perguntas (RodadaAtividade); os itens vêm de data/rodadasFases.ts.

interface Props {
  nivel: number;
  titulo: string;
  subtitulo: string; // "8º ano · tema"
  descricao?: string;
  atividades: ActivityProgress[];
  concluido: boolean;
  notaConclusao?: string; // ex.: "O Nível 9 será lançado em breve."
  selecionada: { id: string; nome: string } | null;
  itens: ItemRodada[] | null; // perguntas da rodada da atividade aberta
  cronometro?: number; // segundos por pergunta nas atividades contra o relógio
  dados?: DadosJogo; // minijogo da atividade (sem ele, rodada de perguntas)
  onConcluir: (r: ResultadoRodada) => void;
  onAbrir: (id: string) => void;
  onVoltar: () => void;
  onMapa: () => void;
}

const ANFITRIAO: Record<number, NomeAnfitriao> = { 3: 'rosana', 4: 'mane', 5: 'leia', 6: 'marcio', 7: 'vania', 8: 'rosana' };
const CENARIO: Record<number, NomeCenario> = { 3: 'corredor', 4: 'escola', 5: 'auditorio', 6: 'corredor', 7: 'fachada', 8: 'patio' };
const ICONE_MECANICA: Partial<Record<Mechanic, NomeIcone>> = {
  listen: 'orelha', order: 'livro', dialogue: 'balao', explore: 'lupa', quiz: 'dica', flashcards: 'carta',
  dictation: 'orelha', wordsearch: 'lupa', truefalse: 'check', gapfill: 'balao', timed: 'relogio', duel: 'carta',
};
const COR: Array<'sol' | 'azul' | 'verde' | 'roxo' | 'laranja'> = ['azul', 'laranja', 'verde', 'roxo', 'sol', 'azul', 'laranja', 'verde'];
const FAIXA: Record<string, string> = { sol: 'from-nisia-sol-400 to-nisia-sol-500', azul: 'from-nisia-azul-400 to-nisia-azul-500', verde: 'from-nisia-verde-400 to-nisia-verde-500', roxo: 'from-nisia-roxo-400 to-nisia-roxo-500', laranja: 'from-nisia-laranja-400 to-nisia-laranja-500' };

const Percevejo: React.FC<{ cor: string }> = ({ cor }) => (
  <svg viewBox="0 0 24 24" className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 drop-shadow-[0_3px_2px_rgba(0,0,0,0.35)]" aria-hidden="true">
    <circle cx="12" cy="10" r="7" fill={cor} /><circle cx="9.5" cy="7.5" r="2.2" fill="#fff" fillOpacity="0.7" /><path d="M12 17v5" stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TelaFaseMissao: React.FC<Props> = ({
  nivel, titulo, subtitulo, descricao, atividades, concluido, notaConclusao, selecionada, itens, cronometro, dados, onConcluir, onAbrir, onVoltar, onMapa,
}) => {
  const { currentPlayer } = useGame();
  const nome = currentPlayer?.displayName || currentPlayer?.name;
  const host = ANFITRIAO[nivel] ?? 'marcio';
  const feitas = atividades.filter(a => a.state === 'completed').length;
  const proxima = atividades.find(a => a.state === 'available')?.activity.name;
  const momento = concluido ? 'concluido' : feitas > 0 ? 'meio' : 'apresenta';
  const falaHost = useMemo(() => falaDoRoteiro(nivel, momento, { nome, missao: titulo, proxima }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nivel, momento, proxima, nome]);

  // ----- Rodada de uma atividade -----
  if (selecionada && itens && itens.length) {
    return (
      <div className="relative min-h-screen text-nisia-tinta flex flex-col">
        <Cenario nome={CENARIO[nivel] ?? 'corredor'} escurecer={0.22} />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Hud nivel={nivel} />
          {/* my-auto (e não justify-center): se a rodada for mais alta que a tela, rola sem cortar o topo */}
          <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 md:py-5 short:py-1 flex flex-col">
            <div className="my-auto">
            <JogoAtividade key={selecionada.id} nivel={nivel} nome={selecionada.nome} dados={dados ?? { tipo: 'rodada' }} itens={itens} cronometro={cronometro} onConcluir={onConcluir} onVoltar={onVoltar} />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ----- Cartazes da missão -----
  const cols = atividades.length >= 7 ? 'sm:grid-cols-2 xl:grid-cols-4 short:grid-cols-4' : atividades.length >= 5 ? 'sm:grid-cols-2 xl:grid-cols-3 short:grid-cols-3' : 'sm:grid-cols-2 short:grid-cols-4';
  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col">
      <Cenario nome={CENARIO[nivel] ?? 'corredor'} escurecer={0.2} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={nivel} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 py-4 short:py-0.5 grid grid-cols-1 wide:grid-cols-[13rem_1fr] short:grid-cols-[7rem_1fr] gap-4 short:gap-2 items-end">
          <div className="hidden wide:flex short:flex items-end">
            <Anfitriao nome={host} lado="esq" altura="h-[20rem] short:h-28" fala={falaHost.pt} traducao={falaHost.en} />
          </div>
          <div className="flex flex-col gap-3 short:gap-1.5 pb-4 short:pb-1 min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="min-w-0">
                <Titulo nivel={1} className="text-4xl sm:text-5xl short:text-2xl leading-none">Missão {nivel}</Titulo>
                <p className="mt-2 short:mt-1 inline-block kit-placa px-7 py-1.5 short:px-6 short:py-0.5 font-display text-lg sm:text-xl short:text-sm -rotate-1">{titulo}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 short:gap-1">
                <Ficha cor="sol">{subtitulo}</Ficha>
                <Ficha cor="papel">{feitas} / {atividades.length} feitas</Ficha>
                <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); onMapa(); }}><Icone nome="mapa" className="w-5 h-5" cor="#1F5FD0" /> Mapa</BotaoJogo>
              </div>
            </div>
            {descricao && <p className="text-sm text-white/90 font-semibold max-w-3xl short:hidden drop-shadow-[0_1px_0_rgba(12,42,102,0.8)]">{descricao}</p>}
            <Fita frac={atividades.length ? feitas / atividades.length : 0} className="max-w-md short:hidden" rotulo="Progresso da missão" />

            {concluido && (
              <Painel tipo="papel" liso className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-xl text-nisia-verde-700 inline-flex items-center gap-2"><Icone nome="trofeu" className="w-7 h-7" /> Nível {nivel} concluído!</p>
                  {notaConclusao && <p className="text-sm text-nisia-tinta-suave">{notaConclusao}</p>}
                </div>
                <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); onMapa(); }}><Icone nome="mapa" className="w-5 h-5" /> Voltar ao mapa</BotaoJogo>
                <TeaserProximo nivel={nivel} className="basis-full" />
              </Painel>
            )}

            <div className={`grid grid-cols-1 ${cols} gap-4 short:gap-1.5`}>
              {atividades.map(({ activity, state, result }, i) => {
                const locked = state === 'locked';
                const done = state === 'completed';
                const cor = COR[i % COR.length];
                const estrelas = result && result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 3) : 0;
                return (
                  <Painel key={activity.id} as="article" tipo="papel" liso data-activity={activity.id} data-state={state}
                    className={`flex flex-col items-center text-center p-3 pt-5 short:p-1.5 short:pt-3 ${['-rotate-1', 'rotate-[0.8deg]', '-rotate-[0.6deg]', 'rotate-1'][i % 4]} ${locked ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                    <Percevejo cor={locked ? '#8A8A8A' : done ? '#3FA34D' : '#E5484D'} />
                    <div className={`absolute top-0 left-0 right-0 h-2.5 rounded-t-[12px] bg-gradient-to-r ${FAIXA[cor]}`} aria-hidden="true" />
                    <span className={`absolute -top-3 -left-3 w-9 h-9 short:w-7 short:h-7 rounded-full border-[3px] border-nisia-tinta bg-gradient-to-b ${FAIXA[cor]} text-nisia-tinta font-display text-base short:text-sm flex items-center justify-center shadow-[0_3px_0_0_rgba(26,42,74,0.35)]`} aria-hidden="true">{i + 1}</span>
                    <Icone nome={locked ? 'cadeado' : ICONE_MECANICA[activity.mechanic] ?? 'dica'} className="w-14 h-14 short:w-7 short:h-7 text-nisia-tinta drop-shadow-[0_4px_4px_rgba(26,42,74,0.25)]" cor={locked ? '#F3E4BE' : '#FFD23F'} />
                    <h3 className="font-display text-xl short:text-sm leading-tight text-nisia-azul-700 mt-1">{activity.name}</h3>
                    <p className="text-sm text-nisia-tinta-suave leading-snug short:hidden">{activity.phrase}</p>
                    {done && <div className="mt-1 flex items-center gap-2 short:hidden"><Estrelas n={estrelas} /><span className="font-display text-nisia-tinta">{result?.score ?? 0} pts</span></div>}
                    <BotaoJogo cor={cor} disabled={locked} onClick={() => { audioService.playClick(); onAbrir(activity.id); }} className="mt-2 short:mt-1 w-full max-w-[12rem] short:min-h-[30px] short:text-xs short:py-0">
                      <Icone nome="jogar" className="w-5 h-5 short:w-4 short:h-4" cor="currentColor" /> {done ? 'De novo' : 'Jogar'}
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
