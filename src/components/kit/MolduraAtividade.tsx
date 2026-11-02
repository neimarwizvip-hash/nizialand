import React, { useEffect, useMemo, useRef } from 'react';
import { Hud } from './Hud';
import { Cenario, NomeCenario } from './Cenario';
import { BotaoJogo, Ficha, Painel, TipoPainel } from './Painel';
import { Cronometro, Estrelas, Moedas } from './Medidores';
import { Icone } from './Icones';
import { Anfitriao, NomeAnfitriao } from './Anfitriao';
import { fala as falaDoRoteiro } from '../../data/falasAnfitrioes';

// Moldura comum das atividades (Níveis 1, 2 e 3): cenário + HUD + painel-objeto com a linha de
// medidores, o corpo da atividade (children), a linha de feedback e o painel de fim com estrelas.
// ActivityShell (Nível 1) e Level2Shell (Níveis 2 e 3) desenham por aqui.

export type TipoFeedback = 'certo' | 'errado' | 'revelar' | 'tempo';

export interface FeedbackMoldura {
  tipo: TipoFeedback;
  texto: string;
  resposta?: string; // resposta certa, quando o item termina sem acerto
  extra?: string; // explicação/significado
}

interface Props {
  nivel: number;
  cenario?: NomeCenario;
  painel?: TipoPainel;
  anfitriao?: NomeAnfitriao;
  nome: string; // nome da atividade
  progresso: string; // "2 / 5", "4 palavras", "Rodada 3"
  segundos: number;
  totalSegundos?: number; // se ausente, usa o maior valor visto (anel sempre coerente)
  alerta?: number;
  pontos: number;
  feedback?: FeedbackMoldura | null;
  proximo?: { rotulo: string; onClick: () => void } | null;
  fim?: {
    pontos: number;
    maximo: number;
    certas: number;
    total: number;
    nota?: string;
    sairRotulo: string;
    onSair: () => void;
    onRepetir?: () => void;
  } | null;
  children: React.ReactNode;
  overlay?: React.ReactNode;
}

const ANFITRIAO_PADRAO: Record<number, NomeAnfitriao> = { 0: 'marcio', 1: 'leia', 2: 'vania', 3: 'rosana', 4: 'rosana' };
const CENARIO_PADRAO: Record<number, NomeCenario> = { 0: 'corredor', 1: 'auditorio', 2: 'patio', 3: 'sala', 4: 'quadra' };

export const MolduraAtividade: React.FC<Props> = ({
  nivel, cenario, painel = 'mural', anfitriao, nome, progresso, segundos, totalSegundos, alerta = 5, pontos, feedback, proximo, fim, children, overlay,
}) => {
  const maior = useRef<number>(Math.max(1, segundos));
  useEffect(() => { if (segundos > maior.current) maior.current = segundos; }, [segundos]);
  const total = totalSegundos ?? maior.current;
  const host = anfitriao ?? ANFITRIAO_PADRAO[nivel] ?? 'marcio';
  const cena = cenario ?? CENARIO_PADRAO[nivel] ?? 'corredor';
  const claro = painel === 'mural' || painel === 'lousa'; // texto do cabeçalho em claro sobre fundo escuro
  const estrelas = fim && fim.maximo > 0 ? Math.round((fim.pontos / fim.maximo) * 3) : 0;
  const falaFim = useMemo(() => fim ? falaDoRoteiro(nivel, estrelas >= 1 ? 'certo' : 'errado') : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [!!fim, estrelas, nivel]);

  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col overflow-x-hidden">
      <Cenario nome={cena} escurecer={0.22} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={nivel} mostrarMoedas={false} />
        <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 py-3 md:py-5 short:py-1 flex flex-col justify-center">
          {fim ? (
            <Painel tipo="papel" liso className="p-6 sm:p-8 short:p-3 animate-rise-in grid grid-cols-1 wide:grid-cols-[1fr_auto] gap-4 items-center">
              <div className="text-center wide:text-left">
                <Ficha cor="sol">Atividade concluída</Ficha>
                <h1 className="font-display text-3xl sm:text-4xl short:text-2xl text-nisia-azul-700 mt-2 leading-tight">{nome}</h1>
                {fim.nota && <p className="font-display text-lg text-nisia-roxo-700 mt-1">{fim.nota}</p>}
                <div className="mt-3 short:mt-1 flex items-center justify-center wide:justify-start gap-3 flex-wrap">
                  <Estrelas n={estrelas} tamanho="w-9 h-9 short:w-7 short:h-7" />
                  <p className="font-display text-4xl short:text-2xl text-nisia-tinta">{fim.pontos} <span className="text-lg text-nisia-tinta-suave">/ {fim.maximo} pts</span></p>
                </div>
                <p className="text-base font-semibold text-nisia-tinta-suave mt-1">{fim.certas} de {fim.total} certas</p>
                <div className="mt-5 short:mt-2 flex justify-center wide:justify-start gap-3 flex-wrap">
                  {fim.onRepetir && (
                    <BotaoJogo cor="papel" onClick={fim.onRepetir}><Icone nome="jogar" className="w-5 h-5" cor="#1F5FD0" /> Jogar de novo</BotaoJogo>
                  )}
                  <BotaoJogo cor="laranja" onClick={fim.onSair}>{fim.sairRotulo} <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
                </div>
              </div>
              <div className="hidden wide:block short:hidden">
                <Anfitriao nome={host} lado="dir" altura="h-64" fala={falaFim?.pt} traducao={falaFim?.en} />
              </div>
            </Painel>
          ) : (
            <Painel tipo={painel} as="section" aria-label={nome} className="p-3 sm:p-5 short:p-2 flex flex-col gap-3 short:gap-1 animate-rise-in">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <Ficha cor="sol">{progresso}</Ficha>
                  <span className={`font-display text-base sm:text-lg short:text-sm truncate ${claro ? 'text-nisia-papel drop-shadow-[0_2px_0_rgba(90,50,10,0.8)]' : 'text-nisia-azul-700'}`}>{nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cronometro segundos={segundos} total={total} alerta={alerta} tamanho={52} className="short:!w-10 short:!h-10" />
                  <Moedas valor={pontos} compacto />
                </div>
              </div>

              {children}

              {feedback && (
                <Painel tipo="papel" liso className="px-4 py-2.5 short:py-1.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p role="status" aria-live="polite" className="text-left">
                    <span className={`inline-flex items-center gap-2 font-display text-lg short:text-base ${feedback.tipo === 'certo' ? 'text-nisia-verde-700' : 'text-nisia-erro'}`}>
                      <Icone nome={feedback.tipo === 'certo' ? 'check' : 'x'} className="w-6 h-6" /> {feedback.texto}
                    </span>
                    {feedback.resposta && <span className="block text-sm sm:text-base text-nisia-tinta">Resposta certa: <strong>{feedback.resposta}</strong></span>}
                    {feedback.extra && <span className="block text-sm text-nisia-tinta-suave">{feedback.extra}</span>}
                  </p>
                  {proximo && (
                    <BotaoJogo cor="laranja" onClick={proximo.onClick} className="shrink-0">{proximo.rotulo} <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
                  )}
                </Painel>
              )}
            </Painel>
          )}
        </main>
      </div>
      {overlay}
    </div>
  );
};
