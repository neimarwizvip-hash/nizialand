import React, { useEffect, useRef, useState } from 'react';
import { PROVISIONAL_STORIES, type ProvisionalStoryId } from '../../data/provisionalStories';
import { audioService } from '../../services/audio';
import { narrar, narracaoDisponivel, tempoDeLeitura, trechosDaFala } from '../../services/narracao';
import { Icone } from '../kit/Icones';

const seenKey = (story: ProvisionalStoryId) => `nisialand_story_seen_${story}`;
const wasSeen = (story: ProvisionalStoryId) => {
  try { return sessionStorage.getItem(seenKey(story)) === '1'; } catch { return false; }
};
const markSeen = (story: ProvisionalStoryId) => {
  try { sessionStorage.setItem(seenKey(story), '1'); } catch { /* leitura continua sem armazenamento */ }
};
const AUTO_KEY = 'nisialand_hq_auto';
const lerAuto = () => { try { return localStorage.getItem(AUTO_KEY) !== '0'; } catch { return true; } };
const gravarAuto = (v: boolean) => { try { localStorage.setItem(AUTO_KEY, v ? '1' : '0'); } catch { /* vale só nesta visita */ } };
const PAUSA_ENTRE_QUADROS = 900;

interface Props { story: ProvisionalStoryId; bypass?: boolean; children: React.ReactNode }

/**
 * HQ provisória das passagens sem vídeo, mostrada uma vez por sessão.
 * Cada quadro é narrado (personagem em pt-BR e a frase em inglês em en-US); a trilha fica em silêncio
 * durante a história e o quadro avança sozinho quando a fala termina (o aluno pode desligar o avanço).
 */
export const ProvisionalStoryGate: React.FC<Props> = ({ story, bypass = false, children }) => {
  const [step, setStep] = useState(() => bypass || wasSeen(story) ? -1 : 0);
  const [auto, setAuto] = useState<boolean>(lerAuto);
  const [falando, setFalando] = useState(false);
  const [som, setSom] = useState<boolean>(true); // voz da história (só desta HQ; o som geral continua na HUD)
  const somRef = useRef(true);
  const parar = useRef<() => void>(() => undefined);
  const avanco = useRef<number | undefined>(undefined);
  const script = PROVISIONAL_STORIES[story];
  const aberta = !bypass && step >= 0;

  const finish = () => { parar.current(); window.clearTimeout(avanco.current); markSeen(story); setStep(-1); };
  useEffect(() => { if (bypass) markSeen(story); }, [bypass, story]);

  // Trilha em silêncio enquanto a HQ está aberta.
  useEffect(() => {
    if (!aberta) return;
    audioService.holdMusicForStory();
    return () => audioService.releaseMusicForStory();
  }, [aberta]);

  const falarQuadro = (i: number) => {
    const p = script.panels[i];
    if (!p) return;
    parar.current();
    window.clearTimeout(avanco.current);
    if (!somRef.current) { setFalando(false); return; }
    setFalando(true);
    const inicio = performance.now();
    const minimo = tempoDeLeitura(`${p.text} ${p.en ?? ''}`);
    parar.current = narrar(trechosDaFala(p.voz, p.text, p.en), completa => {
      setFalando(false);
      // Avanço automático só quando a fala terminou de verdade, nunca antes do tempo de leitura, e não no último quadro.
      if (completa && lerAuto() && i + 1 < script.panels.length) {
        const espera = Math.max(PAUSA_ENTRE_QUADROS, minimo - (performance.now() - inicio));
        avanco.current = window.setTimeout(() => setStep(s => (s === i ? s + 1 : s)), espera);
      }
    });
  };

  useEffect(() => {
    if (!aberta) return;
    falarQuadro(step);
    return () => { parar.current(); window.clearTimeout(avanco.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, aberta]);

  if (!aberta) return <>{children}</>;
  const panel = script.panels[step];
  const ultimo = step + 1 >= script.panels.length;
  const narrador = panel.speaker === 'Narrador';
  const nivel = story === 'nivel3' ? 3 : 4;

  const avancar = () => { audioService.playClick(); if (ultimo) finish(); else setStep(s => s + 1); };
  const alternarAuto = () => { const v = !auto; setAuto(v); gravarAuto(v); if (!v) window.clearTimeout(avanco.current); };
  const alternarSom = () => {
    const ligado = !som;
    setSom(ligado);
    somRef.current = ligado;
    if (!ligado) { parar.current(); window.clearTimeout(avanco.current); setFalando(false); } else falarQuadro(step);
  };

  return (
    <main role="dialog" aria-modal="true" aria-label={`HQ provisória: ${script.title}`} className="fixed inset-0 z-[70] bg-nisia-azul-900 text-nisia-tinta flex flex-col items-center justify-center p-2 sm:p-4 short:p-1 gap-2 short:gap-1">
      <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(circle,rgba(255,210,63,0.35)_1px,transparent_1.6px)] [background-size:14px_14px]" aria-hidden="true" />

      {/* Barra de cima: título e controles */}
      <div className="relative w-full max-w-5xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="kit-ficha kit-ficha--sol">História · Nível {nivel}</span>
          <h1 className="font-display text-xl sm:text-2xl short:text-base text-nisia-sol-400 truncate drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">{script.title}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          {narracaoDisponivel() && (
            <>
              <button type="button" onClick={alternarSom} className="kit-hud__btn" aria-pressed={som} title={som ? 'Desligar a voz' : 'Ligar a voz'} aria-label={som ? 'Desligar a voz da história' : 'Ligar a voz da história'}>
                <Icone nome={som ? 'som' : 'som-mudo'} className="w-5 h-5" cor={som ? '#0C2A66' : '#FFD23F'} />
              </button>
              <button type="button" onClick={alternarAuto} className="kit-hud__btn" aria-pressed={auto} title={auto ? 'Avanço automático ligado' : 'Avanço automático desligado'} aria-label="Avançar sozinho quando a fala terminar">
                <Icone nome={auto ? 'jogar' : 'relogio'} className="w-5 h-5" cor={auto ? '#0C2A66' : '#FFD23F'} />
                <span className="hidden sm:inline">{auto ? 'Auto' : 'Manual'}</span>
              </button>
            </>
          )}
          <button type="button" onClick={finish} className="kit-hud__btn">
            <Icone nome="seta" className="w-5 h-5" /> <span>Pular história</span>
          </button>
        </div>
      </div>

      {/* Quadro da HQ */}
      <section
        key={step}
        aria-live="polite"
        aria-label={`Quadro ${step + 1} de ${script.panels.length}: ${panel.scene}`}
        className="relative w-full max-w-5xl aspect-video max-h-[calc(100dvh-9.5rem)] short:max-h-[calc(100dvh-6rem)] bg-white p-1.5 sm:p-2 rounded-2xl shadow-[0_10px_0_0_rgba(0,0,0,0.35)] animate-fadeIn"
      >
        <div className="relative w-full h-full overflow-hidden rounded-xl border-[3px] sm:border-4 border-nisia-tinta">
          <img src={panel.background} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(26,42,74,0.2)_1px,transparent_1.5px)] [background-size:6px_6px] mix-blend-multiply pointer-events-none" aria-hidden="true" />

          {/* Recordatório do narrador ou balão do personagem */}
          {narrador ? (
            <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-[62%] bg-nisia-sol-400 border-[3px] border-nisia-tinta rounded-lg px-3 py-2 sm:px-4 sm:py-3 shadow-[4px_4px_0_0_rgba(26,42,74,0.9)]">
              <p className="text-[10px] sm:text-xs font-display uppercase tracking-widest text-nisia-tinta/70">{panel.scene}</p>
              <p className="font-display text-base sm:text-2xl short:text-sm leading-snug text-nisia-tinta">{panel.text}</p>
            </div>
          ) : (
            <>
              {panel.image && (
                <img src={panel.image} alt={panel.speaker} className="absolute bottom-0 right-[8%] h-[82%] w-auto object-contain drop-shadow-[0_8px_10px_rgba(12,42,102,0.45)] hq-respira" />
              )}
              <div className="absolute top-3 left-3 sm:left-[6%] max-w-[60%] kit-balao kit-balao--dir !px-4 !py-3">
                <p className="text-[10px] sm:text-xs font-display uppercase tracking-widest text-nisia-laranja-700">{panel.speaker}</p>
                {panel.en && <p className="font-display text-lg sm:text-3xl short:text-base leading-tight text-nisia-azul-700">{panel.en}</p>}
                <p className={`${panel.en ? 'text-sm sm:text-lg short:text-xs text-nisia-tinta-suave font-semibold' : 'font-display text-lg sm:text-2xl short:text-sm text-nisia-tinta'} leading-snug`}>{panel.text}</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Barra de baixo: quadros, ouvir de novo e avançar */}
      <div className="relative w-full max-w-5xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5" aria-label={`Quadro ${step + 1} de ${script.panels.length}`}>
          {script.panels.map((_, i) => (
            <span key={i} className={`h-2.5 rounded-full border border-nisia-tinta/40 transition-all ${i === step ? 'w-7 bg-nisia-sol-400' : i < step ? 'w-2.5 bg-nisia-sol-300' : 'w-2.5 bg-white/30'}`} aria-hidden="true" />
          ))}
          <span className="ml-1 text-xs font-display text-nisia-azul-100 uppercase tracking-wide">Quadro {step + 1} de {script.panels.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {narracaoDisponivel() && (
            <button type="button" onClick={() => falarQuadro(step)} className="kit-btn kit-btn--papel kit-btn--sm" aria-label="Ouvir o quadro de novo">
              <Icone nome="som" className={`w-4 h-4 ${falando ? 'animate-pulse' : ''}`} /> <span className="hidden sm:inline">Ouvir de novo</span>
            </button>
          )}
          <button type="button" autoFocus onClick={avancar} className="kit-btn kit-btn--sol kit-btn--sm">
            {ultimo ? 'Começar missão' : 'Próximo quadro'} <Icone nome="seta" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
};
