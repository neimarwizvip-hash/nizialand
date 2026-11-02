import React from 'react';
import { audioService } from '../../services/audio';
import { narrar } from '../../services/narracao';
import { BotaoJogo, Estrelas, Ficha, Icone, Painel } from '../../components/kit';

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

export const somAcerto = () => audioService.playCorrect();
export const somErro = () => audioService.playWrong();

export const Vidas: React.FC<{ vidas: number; total?: number }> = ({ vidas, total = 3 }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${vidas} de ${total} vidas`} role="img">
    {Array.from({ length: total }, (_, i) => (
      <Icone key={i} nome="coracao" className={`w-6 h-6 short:w-5 short:h-5 ${i < vidas ? '' : 'opacity-25 grayscale'}`} cor={i < vidas ? '#E5484D' : '#8A8A8A'} />
    ))}
  </span>
);

/** Cabeçalho do jogo: nível, nome, fase, vidas e o "como jogar". */
export const MolduraJogo: React.FC<{
  nivel: number; nome: string; tipo: string; instrucao: string; fase: number; fases: number; vidas?: number; extra?: React.ReactNode;
  onVoltar: () => void; children: React.ReactNode;
}> = ({ nivel, nome, tipo, instrucao, fase, fases, vidas, extra, onVoltar, children }) => (
  <Painel tipo="mural" as="section" aria-label={nome} className="p-3 sm:p-5 short:p-2 flex flex-col gap-3 short:gap-1.5">
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
export const AvisoFase: React.FC<{ texto: string }> = ({ texto }) => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20" role="status" aria-live="polite">
    <span className="kit-placa px-8 py-3 font-display text-3xl short:text-xl animate-balao-in">{texto}</span>
  </div>
);

export const ResumoJogo: React.FC<{ nivel: number; nome: string; acertos: number; total: number; onDeNovo: () => void; onVoltar: () => void }> = ({ nivel, nome, acertos, total, onDeNovo, onVoltar }) => {
  const frac = total ? acertos / total : 0;
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
