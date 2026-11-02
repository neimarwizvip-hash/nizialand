import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { audioService } from '../../services/audio';
import { narrar, narracaoDisponivel } from '../../services/narracao';
import { BotaoJogo, Estrelas, Ficha, Icone, Painel } from '../../components/kit';
import type { ItemRodada } from '../../data/rodadasFases';

// Rodada de uma atividade (Níveis 5 a 7): várias perguntas em sequência, alternativas embaralhadas,
// frase falada nos itens de escuta, cronômetro nas atividades "contra o relógio" e resumo com estrelas.
// Teclado: 1–4 ou A–D respondem; Enter avança.

export interface ResultadoRodada { acertos: number; total: number; respostas: Array<{ prompt: string; escolhida: string | null; certa: string; acertou: boolean }> }

interface Props {
  nivel: number;
  nome: string;
  itens: ItemRodada[];
  cronometro?: number; // segundos por pergunta (só nas atividades cronometradas)
  onConcluir: (r: ResultadoRodada) => void;
  onVoltar: () => void;
}

const LETRAS = 'ABCD';
const PONTOS = 100;

const embaralhar = (n: number) => {
  const ordem = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ordem[i], ordem[j]] = [ordem[j], ordem[i]]; }
  return ordem;
};
const modoCalmo = () => {
  try { return document.documentElement.hasAttribute('data-calmo'); } catch { return false; }
};

export const RodadaAtividade: React.FC<Props> = ({ nivel, nome, itens, cronometro, onConcluir, onVoltar }) => {
  const [tentativa, setTentativa] = useState(0);
  const [k, setK] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null); // índice exibido; -1 = tempo esgotado
  const [respostas, setRespostas] = useState<ResultadoRodada['respostas']>([]);
  const [fim, setFim] = useState(false);
  const [resta, setResta] = useState(cronometro ?? 0);
  const pararFala = useRef<() => void>(() => {});
  const proximoRef = useRef<HTMLButtonElement>(null);

  // Ordem embaralhada de cada pergunta (nova a cada tentativa).
  const ordens = useMemo(() => itens.map(it => embaralhar(it.options.length)), [itens, tentativa]);
  const item = itens[k];
  const ordem = ordens[k];
  const certaExibida = ordem ? ordem.indexOf(item.answer) : 0;
  const respondido = escolha !== null;
  const usaRelogio = !!cronometro && !modoCalmo();
  const acertos = respostas.filter(r => r.acertou).length;

  const falar = useCallback(() => {
    if (!item?.ouvir) return;
    pararFala.current();
    pararFala.current = narrar([{ texto: item.ouvir, idioma: 'en-US', rate: 0.9 }]);
  }, [item]);

  // Ao abrir cada pergunta: fala a frase (escuta) e reinicia o relógio.
  useEffect(() => {
    if (fim || !item) return;
    setResta(cronometro ?? 0);
    if (item.ouvir) { const t = window.setTimeout(falar, 350); return () => { window.clearTimeout(t); pararFala.current(); }; }
    return undefined;
  }, [k, tentativa, fim]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => pararFala.current(), []);

  const registrar = useCallback((exibida: number) => {
    if (respondido || !item) return;
    const original = exibida >= 0 ? ordem[exibida] : -1;
    const acertou = original === item.answer;
    setEscolha(exibida);
    if (acertou) audioService.playCorrect(); else audioService.playWrong();
    setRespostas(r => [...r, { prompt: item.prompt, escolhida: original >= 0 ? item.options[original] : null, certa: item.options[item.answer], acertou }]);
    window.setTimeout(() => proximoRef.current?.focus(), 50);
  }, [respondido, item, ordem]);

  // Cronômetro
  useEffect(() => {
    if (!usaRelogio || respondido || fim) return;
    if (resta <= 0) { registrar(-1); return; }
    if (resta <= 5) audioService.playTick();
    const t = window.setTimeout(() => setResta(s => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [usaRelogio, respondido, fim, resta, registrar]);

  const avancar = () => {
    audioService.playClick();
    pararFala.current();
    if (k + 1 < itens.length) { setK(k + 1); setEscolha(null); return; }
    setFim(true);
    audioService.playFanfare();
    onConcluir({ acertos, total: itens.length, respostas });
  };

  const jogarDeNovo = () => {
    audioService.playClick();
    setTentativa(t => t + 1); setK(0); setEscolha(null); setRespostas([]); setFim(false);
  };

  // Teclado
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (fim) return;
      if (!respondido) {
        const n = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : LETRAS.toLowerCase().indexOf(e.key.toLowerCase());
        if (n >= 0 && item && n < item.options.length) { e.preventDefault(); audioService.playClick(); registrar(n); }
      } else if (e.key === 'Enter' && document.activeElement !== proximoRef.current) { e.preventDefault(); avancar(); }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  // ----- Resumo -----
  if (fim) {
    const estrelas = Math.round((acertos / itens.length) * 3);
    return (
      <Painel tipo="mural" as="section" aria-label={`${nome}: resultado`} className="p-3 sm:p-5 short:p-2 flex flex-col gap-3 short:gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <Ficha cor="sol">Nível {nivel}</Ficha>
          <span className="font-display text-base sm:text-lg short:text-sm text-nisia-papel drop-shadow-[0_2px_0_rgba(90,50,10,0.8)] truncate">{nome}</span>
        </div>
        <Painel tipo="papel" liso className="px-4 py-5 short:py-2 flex flex-col items-center text-center gap-2 short:gap-1 animate-rise-in">
          <Estrelas n={estrelas} />
          <p className="font-display text-3xl short:text-xl text-nisia-azul-700" role="status">
            {acertos === itens.length ? 'Rodada perfeita!' : acertos >= Math.ceil(itens.length / 2) ? 'Muito bem!' : 'Boa tentativa!'}
          </p>
          <p className="font-display text-xl short:text-base text-nisia-tinta">{acertos} de {itens.length} certas · {acertos * PONTOS} pts</p>
          <ul className="mt-1 w-full max-w-xl text-left text-sm short:hidden flex flex-col gap-1">
            {respostas.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <Icone nome={r.acertou ? 'check' : 'x'} className={`w-5 h-5 shrink-0 ${r.acertou ? 'text-nisia-verde-700' : 'text-nisia-erro'}`} />
                <span className="leading-snug"><span className="text-nisia-tinta-suave">{r.prompt}</span> <b>{r.certa}</b></span>
              </li>
            ))}
          </ul>
        </Painel>
        <div className="flex flex-wrap justify-center gap-3">
          <BotaoJogo cor="papel" onClick={jogarDeNovo}><Icone nome="jogar" className="w-5 h-5" cor="#1F5FD0" /> Jogar de novo</BotaoJogo>
          <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); onVoltar(); }}>Voltar à missão <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
        </div>
      </Painel>
    );
  }

  // ----- Pergunta -----
  const acertou = respondido && escolha === certaExibida;
  return (
    <Painel tipo="mural" as="section" aria-label={nome} className="p-3 sm:p-5 short:p-2 flex flex-col gap-3 short:gap-1.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Ficha cor="sol">Nível {nivel}</Ficha>
          <span className="font-display text-base sm:text-lg short:text-sm text-nisia-papel drop-shadow-[0_2px_0_rgba(90,50,10,0.8)] truncate">{nome}</span>
        </div>
        <div className="flex items-center gap-2">
          <Ficha cor="papel">Pergunta {k + 1} de {itens.length}</Ficha>
          <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); pararFala.current(); onVoltar(); }}>Voltar</BotaoJogo>
        </div>
      </div>

      {/* Trilha da rodada */}
      <div className="flex gap-1.5" aria-hidden="true">
        {itens.map((_, i) => {
          const r = respostas[i];
          const cor = r ? (r.acertou ? 'bg-nisia-verde-500' : 'bg-nisia-erro') : i === k ? 'bg-nisia-sol-400' : 'bg-nisia-papel/50';
          return <span key={i} className={`h-2.5 flex-1 rounded-full border border-nisia-tinta/30 ${cor}`} />;
        })}
      </div>

      {usaRelogio && (
        <div className="flex items-center gap-2" aria-live="off">
          <Icone nome="relogio" className="w-6 h-6" cor="#FFD23F" />
          <div className="flex-1 h-3 rounded-full bg-nisia-papel/60 overflow-hidden border border-nisia-tinta/30">
            <div className={`h-full transition-[width] duration-1000 ease-linear ${resta <= 5 ? 'bg-nisia-erro' : 'bg-nisia-sol-400'}`} style={{ width: `${(resta / (cronometro ?? 1)) * 100}%` }} />
          </div>
          <span className="font-display text-nisia-papel w-10 text-right drop-shadow-[0_2px_0_rgba(90,50,10,0.8)]">{resta}s</span>
        </div>
      )}

      <Painel tipo="papel" liso className="px-4 py-4 short:py-2 text-center">
        <p className="font-display text-2xl sm:text-3xl short:text-lg leading-tight text-nisia-azul-700">{item.prompt}</p>
        <p className="mt-2 short:mt-1 flex flex-wrap justify-center items-center gap-2 text-xs">
          {item.ouvir && narracaoDisponivel() && (
            <button type="button" onClick={falar} className="kit-btn kit-btn--azul !min-h-0 !py-1 !px-3 text-sm" aria-label="Ouvir a frase em inglês">
              <Icone nome="orelha" className="w-5 h-5" cor="currentColor" /> Ouvir
            </button>
          )}
          {item.skill && <span className="kit-ficha kit-ficha--azul text-[11px] normal-case tracking-normal short:hidden">Habilidade: {item.skill}</span>}
          {item.languageFocus && <span className="kit-ficha kit-ficha--sol text-[11px] normal-case tracking-normal short:hidden">Foco: {item.languageFocus}</span>}
        </p>
      </Painel>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 short:gap-1.5">
        {ordem.map((orig, i) => {
          const o = item.options[orig];
          let estado = 'bg-nisia-papel border-nisia-papel-linha hover:-translate-y-0.5';
          let bolinha = 'bg-nisia-sol-400 border-nisia-sol-700 text-nisia-tinta';
          if (respondido && i === certaExibida) { estado = 'bg-nisia-verde-100 border-nisia-verde-500 ring-4 ring-nisia-verde-400/50'; bolinha = 'bg-nisia-verde-500 border-nisia-verde-700 text-white'; }
          else if (respondido && i === escolha) { estado = 'bg-red-50 border-nisia-erro'; bolinha = 'bg-nisia-erro border-red-800 text-white'; }
          else if (respondido) estado = 'bg-nisia-papel border-nisia-papel-linha opacity-50';
          return (
            <button key={`${k}-${o}`} type="button" disabled={respondido} onClick={() => { audioService.playClick(); registrar(i); }}
              className={`relative text-left flex items-center gap-3 px-3.5 py-3 short:py-1.5 rounded-xl border-2 shadow-[0_4px_0_0_#E7D3A6] transition-all font-body text-nisia-tinta disabled:cursor-not-allowed ${estado}`}>
              <span className={`w-10 h-10 short:w-7 short:h-7 rounded-full border-2 flex items-center justify-center font-display text-lg short:text-base shrink-0 ${bolinha}`}>{LETRAS[i] ?? i + 1}</span>
              <span className="text-base sm:text-lg short:text-sm font-semibold flex-1 leading-snug">{o}</span>
            </button>
          );
        })}
      </div>

      {respondido && (
        <Painel tipo="papel" liso className="px-4 py-3 short:py-2 flex flex-col sm:flex-row items-center justify-between gap-3 animate-rise-in">
          <div role="status">
            <p className={`inline-flex items-center gap-2 font-display text-lg ${acertou ? 'text-nisia-verde-700' : 'text-nisia-erro'}`}>
              <Icone nome={acertou ? 'check' : 'x'} className="w-6 h-6" />
              {acertou ? `Resposta certa! +${PONTOS} pontos.` : escolha === -1 ? 'O tempo acabou. Veja a resposta certa.' : 'Não foi dessa vez. Veja a resposta certa.'}
            </p>
            <p className="mt-1 text-sm sm:text-base text-nisia-tinta max-w-xl leading-snug">{item.explanation}</p>
          </div>
          <button ref={proximoRef} type="button" onClick={avancar} className="kit-btn kit-btn--laranja shrink-0">
            {k + 1 < itens.length ? 'Próxima' : 'Ver resultado'} <Icone nome="seta" className="w-5 h-5" />
          </button>
        </Painel>
      )}
    </Painel>
  );
};
