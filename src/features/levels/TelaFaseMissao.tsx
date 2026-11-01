import React from 'react';
import type { ActivityProgress } from '../../engines/progression/progress';
import { audioService } from '../../services/audio';
import { Anfitriao, BotaoJogo, Cenario, Estrelas, Ficha, Fita, Hud, Icone, Painel, Titulo } from '../../components/kit';
import type { NomeAnfitriao, NomeCenario, NomeIcone } from '../../components/kit';
import type { Mechanic } from '../../core/types';

// Tela comum das missões dos Níveis 3 a 7 (cartazes das atividades) e da pergunta de cada atividade.
// Conteúdo pedagógico e quantidade de itens continuam vindo dos arquivos de conteúdo (Fase 3 amplia).

export interface ItemPergunta {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  skill?: string;
  languageFocus?: string;
}

interface Props {
  nivel: number;
  titulo: string;
  subtitulo: string; // "8º ano · tema"
  descricao?: string;
  atividades: ActivityProgress[];
  concluido: boolean;
  notaConclusao?: string; // ex.: "O Nível 8 será lançado em breve."
  selecionada: { nome: string } | null;
  item: ItemPergunta | null;
  respondido: boolean;
  escolha: number | null;
  onResponder: (i: number) => void;
  onAbrir: (id: string) => void;
  onVoltar: () => void;
  onMapa: () => void;
}

const ANFITRIAO: Record<number, NomeAnfitriao> = { 3: 'rosana', 4: 'mane', 5: 'leia', 6: 'marcio', 7: 'vania' };
const CENARIO: Record<number, NomeCenario> = { 3: 'corredor', 4: 'escola', 5: 'auditorio', 6: 'corredor', 7: 'fachada' };
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
  nivel, titulo, subtitulo, descricao, atividades, concluido, notaConclusao, selecionada, item, respondido, escolha, onResponder, onAbrir, onVoltar, onMapa,
}) => {
  const host = ANFITRIAO[nivel] ?? 'marcio';
  const feitas = atividades.filter(a => a.state === 'completed').length;

  // ----- Pergunta de uma atividade -----
  if (selecionada && item) {
    const letras = 'ABCD';
    return (
      <div className="relative min-h-screen text-nisia-tinta flex flex-col">
        <Cenario nome={CENARIO[nivel] ?? 'corredor'} escurecer={0.22} />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Hud nivel={nivel} />
          <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 md:py-5 short:py-1 flex flex-col justify-center">
            <Painel tipo="mural" as="section" aria-label={selecionada.nome} className="p-3 sm:p-5 short:p-2 flex flex-col gap-3 short:gap-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <Ficha cor="sol">Nível {nivel}</Ficha>
                  <span className="font-display text-base sm:text-lg short:text-sm text-nisia-papel drop-shadow-[0_2px_0_rgba(90,50,10,0.8)] truncate">{selecionada.nome}</span>
                </div>
                <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); onVoltar(); }}>Voltar</BotaoJogo>
              </div>
              <Painel tipo="papel" liso className="px-4 py-4 short:py-2 text-center">
                <p className="font-display text-2xl sm:text-3xl short:text-lg leading-tight text-nisia-azul-700">{item.prompt}</p>
                {(item.skill || item.languageFocus) && (
                  <p className="mt-2 short:mt-1 flex flex-wrap justify-center gap-2 text-xs">
                    {item.skill && <span className="kit-ficha kit-ficha--azul text-[11px] normal-case tracking-normal">Habilidade: {item.skill}</span>}
                    {item.languageFocus && <span className="kit-ficha kit-ficha--sol text-[11px] normal-case tracking-normal">Foco: {item.languageFocus}</span>}
                  </p>
                )}
              </Painel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 short:gap-1.5">
                {item.options.map((o, i) => {
                  let estado = 'bg-nisia-papel border-nisia-papel-linha hover:-translate-y-0.5';
                  let bolinha = 'bg-nisia-sol-400 border-nisia-sol-700 text-nisia-tinta';
                  if (respondido && i === item.answer) { estado = 'bg-nisia-verde-100 border-nisia-verde-500 ring-4 ring-nisia-verde-400/50'; bolinha = 'bg-nisia-verde-500 border-nisia-verde-700 text-white'; }
                  else if (respondido && i === escolha) { estado = 'bg-red-50 border-nisia-erro'; bolinha = 'bg-nisia-erro border-red-800 text-white'; }
                  else if (respondido) estado = 'bg-nisia-papel border-nisia-papel-linha opacity-50';
                  return (
                    <button key={o} type="button" disabled={respondido} onClick={() => { audioService.playClick(); onResponder(i); }}
                      className={`relative text-left flex items-center gap-3 px-3.5 py-3 short:py-1.5 rounded-xl border-2 shadow-[0_4px_0_0_#E7D3A6] transition-all font-body text-nisia-tinta disabled:cursor-not-allowed ${estado}`}>
                      <span className={`w-10 h-10 short:w-7 short:h-7 rounded-full border-2 flex items-center justify-center font-display text-lg short:text-base shrink-0 ${bolinha}`}>{letras[i] ?? i + 1}</span>
                      <span className="text-base sm:text-lg short:text-sm font-semibold flex-1 leading-snug">{o}</span>
                    </button>
                  );
                })}
              </div>
              {respondido && (
                <Painel tipo="papel" liso className="px-4 py-3 short:py-2 flex flex-col sm:flex-row items-center justify-between gap-3 animate-rise-in">
                  <div>
                    <p className={`inline-flex items-center gap-2 font-display text-lg ${escolha === item.answer ? 'text-nisia-verde-700' : 'text-nisia-erro'}`}>
                      <Icone nome={escolha === item.answer ? 'check' : 'x'} className="w-6 h-6" /> {escolha === item.answer ? 'Resposta certa! +100 pontos.' : 'Não foi dessa vez. Veja a resposta certa.'}
                    </p>
                    <p className="mt-1 text-sm sm:text-base text-nisia-tinta max-w-xl leading-snug">{item.explanation}</p>
                  </div>
                  <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); onVoltar(); }} className="shrink-0">Voltar à missão <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
                </Painel>
              )}
            </Painel>
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
            <Anfitriao nome={host} lado="esq" altura="h-[20rem] short:h-28"
              fala={concluido ? `Nível ${nivel} completo! Parabéns!` : `Missão ${nivel}: ${titulo}. Vamos lá!`}
              traducao={concluido ? 'Level complete!' : "Let's go!"} />
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
