import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { audioService } from '../../services/audio';
import { narrar, trechosDaFala } from '../../services/narracao';
import { anfitriaoDoNivel, fala as falaDoRoteiro } from '../../data/falasAnfitrioes';
import { ANFITRIOES, BotaoJogo, Estrelas, Ficha, Icone, Painel } from '../../components/kit';

// Peças comuns dos minijogos: moldura, vidas, sorteio, fala em inglês e resumo final.

export interface FimDeJogo { acertos: number; total: number; detalhes?: unknown }
export interface PropsJogo<D> {
  dados: D;
  cronometro?: number;
  onFim: (r: FimDeJogo) => void; // chamado uma vez, ao terminar as três fases
}

export const embaralhar = <T,>(lista: T[]): T[] => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
/** Sorteia uma ordem diferente da original (para o jogo nunca começar resolvido). */
export const embaralharDiferente = <T,>(lista: T[]): T[] => {
  if (lista.length < 2) return [...lista];
  for (let t = 0; t < 8; t++) { const a = embaralhar(lista); if (a.some((x, i) => x !== lista[i])) return a; }
  return [...lista].reverse();
};

export const modoCalmo = () => { try { return document.documentElement.hasAttribute('data-calmo'); } catch { return false; } };

let pararFala: () => void = () => undefined;
/** Fala uma frase em inglês com a voz gravada das frases de escuta (ou a voz do navegador). */
export function falarIngles(texto: string) {
  pararFala();
  pararFala = narrar([{ texto, idioma: 'en-US', rate: 0.9, personagem: 'professora' }]);
}
export const pararIngles = () => pararFala();

// Acerto e erro: som, vibração no celular e um aviso para a moldura (sequência e reação da anfitriã).
const emitir = (tipo: 'certo' | 'errado') => { try { window.dispatchEvent(new CustomEvent('nisia-reacao', { detail: tipo })); } catch { /* segue */ } };
export const somAcerto = () => { audioService.playCorrect(); emitir('certo'); };
export const somErro = () => { audioService.playWrong(); try { navigator.vibrate?.(70); } catch { /* segue */ } emitir('errado'); };

/** Chuva de confete (não no modo calmo). */
export const festejar = (forte = false) => {
  if (modoCalmo()) return;
  try { confetti({ particleCount: forte ? 140 : 60, spread: forte ? 90 : 60, origin: { y: 0.6 }, colors: ['#FFD23F', '#1F5FD0', '#3FA34D', '#F2811D', '#7B3FE4'], disableForReducedMotion: true }); } catch { /* segue */ }
};

/** Anfitriã do nível no canto do jogo: comenta sequências de acertos e erros (com a voz gravada) e mostra o combo. */
const ReacaoAnfitria: React.FC<{ nivel: number }> = ({ nivel }) => {
  const host = anfitriaoDoNivel(nivel);
  const [fala, setFala] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const seq = useRef(0);
  const ultima = useRef(0);
  useEffect(() => {
    let limpar = 0;
    let parar: () => void = () => undefined;
    const ouvir = (e: Event) => {
      const tipo = (e as CustomEvent<'certo' | 'errado'>).detail;
      seq.current = tipo === 'certo' ? seq.current + 1 : 0;
      setCombo(seq.current);
      if (tipo === 'certo' && seq.current >= 3) audioService.playCombo(Math.min(5, seq.current));
      const agora = Date.now();
      const falar = (tipo === 'certo' && (seq.current === 3 || seq.current === 6)) || (tipo === 'errado' && agora - ultima.current > 9000);
      if (!falar) return;
      ultima.current = agora;
      const f = falaDoRoteiro(nivel, tipo).pt;
      setFala(f);
      parar(); parar = narrar(trechosDaFala(host, f));
      window.clearTimeout(limpar); limpar = window.setTimeout(() => setFala(null), 3200);
    };
    window.addEventListener('nisia-reacao', ouvir);
    return () => { window.removeEventListener('nisia-reacao', ouvir); window.clearTimeout(limpar); parar(); };
  }, [nivel, host]);
  return (
    <div className="pointer-events-none absolute -top-3 right-3 z-20 flex items-start gap-2" aria-live="polite">
      {combo >= 3 && <span key={combo} className="kit-ficha kit-ficha--sol animate-moeda-pop" role="status">Sequência ×{combo}!</span>}
      {fala && (
        <div className="flex items-start gap-1.5 animate-balao-in">
          <span className="kit-balao kit-balao--dir max-w-[14rem] text-sm short:text-xs !px-3 !py-2">{fala}</span>
          <img src={ANFITRIOES[host].src} alt={ANFITRIOES[host].nome} className="h-16 short:h-10 w-auto drop-shadow" />
        </div>
      )}
    </div>
  );
};

export const Vidas: React.FC<{ vidas: number; total?: number }> = ({ vidas, total = 3 }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${vidas} de ${total} vidas`} role="img">
    {Array.from({ length: total }, (_, i) => (
      <Icone key={i} nome="coracao" className={`w-6 h-6 short:w-5 short:h-5 ${i < vidas ? '' : 'opacity-25 grayscale'}`} cor={i < vidas ? '#E5484D' : '#8A8A8A'} />
    ))}
  </span>
);

/** Tela "como jogar" antes de cada minijogo: nome, ícone, regra e um exemplo. */
export const IntroJogo: React.FC<{ nivel: number; nome: string; tipo: string; instrucao: string; icone: React.ReactNode; exemplo?: React.ReactNode; onComecar: () => void; onVoltar: () => void }> = ({ nivel, nome, tipo, instrucao, icone, exemplo, onComecar, onVoltar }) => (
  <Painel tipo="mural" as="section" aria-label={`${nome}: como jogar`} className="p-3 sm:p-5 short:p-2 flex flex-col gap-3 short:gap-1.5">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <Ficha cor="sol">Nível {nivel}</Ficha>
        <span className="font-display text-base sm:text-lg short:text-sm text-nisia-papel drop-shadow-[0_2px_0_rgba(90,50,10,0.8)] truncate">{nome}</span>
      </div>
      <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); onVoltar(); }}>Voltar</BotaoJogo>
    </div>
    <Painel tipo="papel" liso className="px-4 py-5 short:py-2 flex flex-col items-center text-center gap-3 short:gap-1.5 animate-rise-in">
      <span className="w-20 h-20 short:w-12 short:h-12 rounded-2xl bg-gradient-to-b from-nisia-azul-400 to-nisia-azul-500 border-[3px] border-nisia-azul-700 flex items-center justify-center shadow-[0_5px_0_0_#0C2A66]" aria-hidden="true">{icone}</span>
      <p className="font-display text-3xl short:text-xl text-nisia-azul-700 leading-none">{tipo}</p>
      <p className="text-base short:text-sm max-w-md">{instrucao}</p>
      {exemplo && <div className="short:hidden">{exemplo}</div>}
      <p className="text-xs text-nisia-tinta-suave">3 fases · cada uma um pouco mais difícil · acerto de primeira vale mais</p>
      <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); onComecar(); }} autoFocus><Icone nome="jogar" className="w-5 h-5" cor="currentColor" /> Começar</BotaoJogo>
    </Painel>
  </Painel>
);

/** Cabeçalho do jogo: nível, nome, fase, vidas e o "como jogar". */
export const MolduraJogo: React.FC<{
  nivel: number; nome: string; tipo: string; instrucao: string; fase: number; fases: number; vidas?: number; extra?: React.ReactNode;
  onVoltar: () => void; children: React.ReactNode;
}> = ({ nivel, nome, tipo, instrucao, fase, fases, vidas, extra, onVoltar, children }) => (
  <Painel tipo="mural" as="section" aria-label={nome} className="relative p-3 sm:p-5 short:p-2 flex flex-col gap-3 short:gap-1.5">
    <ReacaoAnfitria nivel={nivel} />
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2 min-w-0">
        <Ficha cor="sol">Nível {nivel}</Ficha>
        <span className="font-display text-base sm:text-lg short:text-sm text-nisia-papel drop-shadow-[0_2px_0_rgba(90,50,10,0.8)] truncate">{nome}</span>
      </div>
      <div className="flex items-center gap-2">
        {vidas !== undefined && <Vidas vidas={vidas} />}
        <Ficha cor="papel">Fase {fase} de {fases}</Ficha>
        <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); pararIngles(); onVoltar(); }}>Voltar</BotaoJogo>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-wrap text-nisia-papel drop-shadow-[0_1px_0_rgba(90,50,10,0.8)]">
      <span className="kit-ficha kit-ficha--azul text-[11px] normal-case tracking-normal">{tipo}</span>
      <span className="text-sm font-semibold short:hidden">{instrucao}</span>
      {extra}
    </div>
    {children}
  </Painel>
);

/** Faixa entre fases: "Fase 2!" (some sozinha). */
export const AvisoFase: React.FC<{ texto: string }> = ({ texto }) => {
  useEffect(() => { festejar(false); audioService.playPowerup(); }, []);
  return (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20" role="status" aria-live="polite">
    <span className="kit-placa px-8 py-3 font-display text-3xl short:text-xl animate-balao-in">{texto}</span>
  </div>
  );
};

export const ResumoJogo: React.FC<{ nivel: number; nome: string; acertos: number; total: number; onDeNovo: () => void; onVoltar: () => void }> = ({ nivel, nome, acertos, total, onDeNovo, onVoltar }) => {
  const frac = total ? acertos / total : 0;
  useEffect(() => { if (frac >= 0.6) { festejar(true); audioService.playFanfare(); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Painel tipo="mural" as="section" aria-label={`${nome}: resultado`} className="p-3 sm:p-5 short:p-2 flex flex-col gap-3 short:gap-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <Ficha cor="sol">Nível {nivel}</Ficha>
        <span className="font-display text-base sm:text-lg short:text-sm text-nisia-papel drop-shadow-[0_2px_0_rgba(90,50,10,0.8)] truncate">{nome}</span>
      </div>
      <Painel tipo="papel" liso className="px-4 py-5 short:py-2 flex flex-col items-center text-center gap-2 animate-rise-in">
        <Estrelas n={Math.round(frac * 3)} />
        <p className="font-display text-3xl short:text-xl text-nisia-azul-700" role="status">{frac === 1 ? 'Perfeito!' : frac >= 0.6 ? 'Muito bem!' : 'Boa tentativa!'}</p>
        <p className="font-display text-xl short:text-base text-nisia-tinta">{acertos} de {total} · {acertos * 100} pts</p>
      </Painel>
      <div className="flex flex-wrap justify-center gap-3">
        <BotaoJogo cor="papel" onClick={() => { audioService.playClick(); onDeNovo(); }}><Icone nome="jogar" className="w-5 h-5" cor="#1F5FD0" /> Jogar de novo</BotaoJogo>
        <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); onVoltar(); }}>Voltar à missão <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
      </div>
    </Painel>
  );
};
