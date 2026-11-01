import React, { useEffect, useRef, useState } from 'react';
import { audioService } from '../../services/audio';
import { narrar, narracaoDisponivel, tempoDeLeitura, trechosDaFala } from '../../services/narracao';
import { Icone } from '../kit/Icones';

// HQ Motion "Reunião urgente", entre o Nível 0 e o Nível 1. Falas literais do Oliveira.
// Q1 plano geral (3 s) · Q2 fala da Edilene · Q3 fala do Márcio (aceno) · Q4 olhar + virada de página.
// Cada fala é dita em voz; o quadro dura o tempo da fala (mínimo 5 s sem voz). Sem zoom e sem personagem
// deslizando: só respiração, passo no lugar e aceno. A trilha toca só no Q1 e no Q4 (nada de música sob fala).
const SEEN = 'nisialand_story_seen_hq_reuniao';
const MISSING = 'nisialand_story_missing_hq_reuniao';
// ATENÇÃO: edilene.png é hoje idêntica a rosana.png (mesmo arquivo). Trocar pela imagem oficial da Edilene.
const EDILENE_SRC = '/assets/edilene.png';
const MARCIO_SRC = '/assets/diretor_marcio_hd.png';
// Trilha instrumental leve (provisória até chegar o áudio definido para a cena).
const MUSIC_SRC = '/assets/audio/hq_reuniao.mp3';
const MUSIC_FALLBACK = '/assets/audio/trilha_mapa.mp3';
const VOLUME_TRILHA = 0.3;

const FALA_EDILENE = 'Márcio, preciso conversar com esses meninos sobre as regras da escola.';
const FALA_MARCIO = 'Sim, precisamos marcar uma reunião urgentemente com os alunos e responsáveis.';

const Q1_MS = 3000;
const FALA_MIN_MS = 5000; // sem voz, cada balão fica 5 s (o tempo de leitura do roteiro original)
const RESPIRO_MS = 600; // pausa depois que a fala termina
const Q4_MS = 2000;

const readFlag = (key: string) => { try { return sessionStorage.getItem(key) === '1'; } catch { return false; } };
const writeFlag = (key: string) => { try { sessionStorage.setItem(key, '1'); } catch { /* ignora */ } };

const CSS = `
@keyframes hq-breathe { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(1.012) } }
@keyframes hq-step { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-1.2%) } }
@keyframes hq-nod { 0%,100% { transform: rotate(0) } 30% { transform: rotate(2.2deg) translateY(0.6%) } 60% { transform: rotate(0) } }
@keyframes hq-pop { from { opacity: 0 } to { opacity: 1 } }
@keyframes hq-page { from { clip-path: inset(0 0 0 100%) } to { clip-path: inset(0 0 0 0) } }
.hq-breathe { animation: hq-breathe 3.2s ease-in-out infinite; transform-origin: bottom center }
.hq-step { animation: hq-step 0.75s ease-in-out infinite }
.hq-nod { animation: hq-nod 1.4s ease-in-out 1.2s 1; transform-origin: 50% 85% }
.hq-pop { animation: hq-pop 0.35s ease-out both }
.hq-page { animation: hq-page 0.9s ease-in-out 1s both }
@media (prefers-reduced-motion: reduce) { .hq-breathe, .hq-step, .hq-nod { animation: none } .hq-page { animation-duration: 0.01s } }
`;

const Balloon: React.FC<{ text: string; side: 'left' | 'right'; falando: boolean }> = ({ text, side, falando }) => (
  <div
    className={`hq-pop absolute top-[3%] ${side === 'left' ? 'left-[4%]' : 'right-[4%]'} w-[46%] bg-white text-nisia-tinta border-[0.25em] border-nisia-tinta rounded-[1.6em] px-[1em] py-[0.7em] font-display leading-snug text-center shadow-[0.3em_0.3em_0_0_rgba(26,42,74,0.85)]`}
  >
    {text}
    {falando && <Icone nome="som" className="absolute -top-[0.9em] right-[0.6em] w-[1.6em] h-[1.6em] text-nisia-tinta animate-pulse" />}
    {/* rabicho apontando para quem fala (fica acima da cabeça, sem cobrir o rosto) */}
    <span className={`absolute -bottom-[1.1em] ${side === 'left' ? 'left-[22%]' : 'right-[22%]'} w-0 h-0 border-l-[0.8em] border-r-[0.8em] border-t-[1.2em] border-l-transparent border-r-transparent border-t-nisia-tinta`} />
    <span className={`absolute -bottom-[0.7em] ${side === 'left' ? 'left-[calc(22%+0.25em)]' : 'right-[calc(22%+0.25em)]'} w-0 h-0 border-l-[0.55em] border-r-[0.55em] border-t-[0.85em] border-l-transparent border-r-transparent border-t-white`} />
  </div>
);

export const HqReuniaoGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playing, setPlaying] = useState<boolean>(() => !readFlag(SEEN) && !readFlag(MISSING));
  const [missing, setMissing] = useState<boolean>(() => readFlag(MISSING));
  const [q, setQ] = useState<1 | 2 | 3 | 4>(1);
  const [falando, setFalando] = useState(false);
  const [voz, setVoz] = useState(true);
  const vozRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const pararFala = useRef<() => void>(() => undefined);

  const finish = () => {
    window.clearTimeout(timer.current);
    pararFala.current();
    audioRef.current?.pause();
    writeFlag(SEEN);
    setPlaying(false);
  };

  // Sem a imagem da Edilene a HQ não roda (não inventamos personagem): a fase abre direto.
  const fail = () => { writeFlag(MISSING); setMissing(true); finish(); };

  const trilha = (volume: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    if (volume > 0 && a.paused) a.play().catch(() => undefined);
  };

  // Fala do quadro; o próximo quadro vem quando a fala termina (ou após o mínimo, sem voz).
  const quadroFalado = (atual: 2 | 3, texto: string, quem: 'edilene' | 'marcio') => {
    trilha(0);
    const inicio = performance.now();
    const seguir = () => {
      const decorrido = performance.now() - inicio;
      const comVoz = vozRef.current && narracaoDisponivel() && audioService.isSoundOn();
      // Com voz: respiro depois da fala, mas nunca antes do tempo de leitura. Sem voz: 5 s como no roteiro.
      const espera = comVoz ? Math.max(RESPIRO_MS, tempoDeLeitura(texto) - decorrido) : Math.max(0, FALA_MIN_MS - decorrido);
      timer.current = window.setTimeout(() => setQ(atual === 2 ? 3 : 4), espera);
    };
    if (!vozRef.current) { seguir(); return; }
    setFalando(true);
    pararFala.current = narrar(trechosDaFala(quem, texto), completa => {
      setFalando(false);
      if (completa) seguir();
      else timer.current = window.setTimeout(() => setQ(atual === 2 ? 3 : 4), Math.max(0, FALA_MIN_MS - (performance.now() - inicio)));
    });
  };

  // Liga e desliga a trilha do jogo e prepara a trilha da cena.
  useEffect(() => {
    if (!playing) return;
    audioService.holdMusicForStory();
    setQ(1);
    const a = new Audio(MUSIC_SRC);
    a.volume = VOLUME_TRILHA;
    a.onerror = () => {
      if (a.src.endsWith(MUSIC_FALLBACK)) return;
      a.src = MUSIC_FALLBACK;
      a.play().catch(() => undefined);
    };
    audioRef.current = a;
    if (audioService.isMusicOn()) a.play().catch(() => undefined);
    return () => {
      window.clearTimeout(timer.current);
      pararFala.current();
      a.pause();
      audioService.releaseMusicForStory();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // Linha do tempo por quadro.
  useEffect(() => {
    if (!playing) return;
    window.clearTimeout(timer.current);
    if (q === 1) { timer.current = window.setTimeout(() => setQ(2), Q1_MS); }
    if (q === 2) quadroFalado(2, FALA_EDILENE, 'edilene');
    if (q === 3) quadroFalado(3, FALA_MARCIO, 'marcio');
    if (q === 4) { if (audioService.isMusicOn()) trilha(VOLUME_TRILHA); timer.current = window.setTimeout(finish, Q4_MS); }
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, playing]);

  if (!playing) {
    return (
      <>
        {children}
        {!missing && (
          <button type="button" onClick={() => setPlaying(true)} className="kit-btn kit-btn--papel kit-btn--sm fixed bottom-4 left-4 z-40 short:bottom-2 short:left-2">
            <Icone nome="jogar" className="w-4 h-4" cor="#1F5FD0" /> Rever história
          </button>
        )}
      </>
    );
  }

  const ouvirDeNovo = () => {
    if (q !== 2 && q !== 3) return;
    window.clearTimeout(timer.current);
    pararFala.current();
    vozRef.current = true; setVoz(true);
    quadroFalado(q, q === 2 ? FALA_EDILENE : FALA_MARCIO, q === 2 ? 'edilene' : 'marcio');
  };
  const alternarVoz = () => {
    const v = !voz;
    setVoz(v); vozRef.current = v;
    if (!v) { pararFala.current(); setFalando(false); }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-nisia-azul-900 flex items-center justify-center" role="dialog" aria-label="História: reunião urgente">
      <style>{CSS}</style>
      {/* Palco 16:9 do tamanho da tela; fonte proporcional à largura do palco */}
      <div
        className="relative overflow-hidden bg-white p-[0.6%]"
        style={{ width: 'min(100vw, 177.78dvh)', aspectRatio: '16 / 9', fontSize: 'calc(min(100vw, 177.78dvh) * 0.019)' }}
      >
        <div key={q === 1 ? 'geral' : 'cena'} className="relative w-full h-full overflow-hidden border-[0.3em] border-nisia-tinta rounded-[0.6em] animate-fadeIn">
          <img src="/assets/nisialand_hallway_bg.jpg" alt="Corredor perto da sala da direção" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(26,42,74,0.18)_1px,transparent_1.5px)] [background-size:0.5em_0.5em] mix-blend-multiply pointer-events-none" />

          {/* Q1: plano geral, Edilene caminhando (passo no lugar) até o Márcio. Depois: os dois lado a lado */}
          <div className={`absolute bottom-0 ${q === 1 ? 'left-[14%] h-[66%]' : 'left-[16%] h-[74%]'}`}>
            <img src={EDILENE_SRC} alt="Edilene" onError={fail} className={`h-full w-auto object-contain drop-shadow-[0_0.4em_0.5em_rgba(26,42,74,0.4)] ${q === 1 ? 'hq-step' : 'hq-breathe'}`} />
          </div>
          <div className={`absolute bottom-0 ${q === 1 ? 'right-[18%] h-[70%]' : 'right-[16%] h-[78%]'}`}>
            <img key={q === 3 ? 'aceno' : 'parado'} src={MARCIO_SRC} alt="Diretor Márcio" className={`h-full w-auto object-contain drop-shadow-[0_0.4em_0.5em_rgba(26,42,74,0.4)] ${q === 3 ? 'hq-nod' : 'hq-breathe'}`} />
          </div>

          {q === 2 && <Balloon key="e" text={FALA_EDILENE} side="left" falando={falando} />}
          {q === 3 && <Balloon key="m" text={FALA_MARCIO} side="right" falando={falando} />}

          {/* Q4: virada de página suave */}
          {q === 4 && <div className="hq-page absolute inset-0 bg-white" />}
        </div>
      </div>

      <div className="absolute top-3 right-3 flex gap-1.5">
        {narracaoDisponivel() && (
          <>
            <button type="button" onClick={alternarVoz} className="kit-hud__btn" aria-pressed={voz} aria-label={voz ? 'Desligar a voz da história' : 'Ligar a voz da história'}>
              <Icone nome={voz ? 'som' : 'som-mudo'} className="w-5 h-5" cor={voz ? '#0C2A66' : '#FFD23F'} />
            </button>
            {(q === 2 || q === 3) && (
              <button type="button" onClick={ouvirDeNovo} className="kit-hud__btn" aria-label="Ouvir a fala de novo">
                <Icone nome="balao" className="w-5 h-5" /> <span className="hidden sm:inline">Ouvir de novo</span>
              </button>
            )}
          </>
        )}
        <button type="button" onClick={finish} className="kit-hud__btn">
          <Icone nome="seta" className="w-5 h-5" /> Pular história
        </button>
      </div>
    </div>
  );
};
