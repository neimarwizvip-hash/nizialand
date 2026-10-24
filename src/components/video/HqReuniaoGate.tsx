import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, FastForward, RotateCcw } from 'lucide-react';
import { audioService } from '../../services/audio';

// HQ Motion "Reunião urgente" (15 s), entre o Nível 0 e o Nível 1. Falas literais do Oliveira.
// Q1 0–3 s plano geral · Q2 3–8 s Edilene · Q3 8–13 s Márcio (aceno) · Q4 13–15 s olhar + virada de página.
// Sem zoom e sem personagem deslizando: só respiração, passo no lugar e aceno.
const SEEN = 'nisialand_story_seen_hq_reuniao';
const MISSING = 'nisialand_story_missing_hq_reuniao';
const EDILENE_SRC = '/assets/edilene.png';
const MARCIO_SRC = '/assets/diretor_marcio_hd.png';
// Trilha instrumental leve (provisória até chegar o áudio definido para a cena).
const MUSIC_SRC = '/assets/audio/hq_reuniao.mp3';
const MUSIC_FALLBACK = '/assets/audio/trilha_mapa.mp3';
const DURATION = 15000;

const FALA_EDILENE = 'Márcio, preciso conversar com esses meninos sobre as regras da escola.';
const FALA_MARCIO = 'Sim, precisamos marcar uma reunião urgentemente com os alunos e responsáveis.';

const readFlag = (key: string) => {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};
const writeFlag = (key: string) => {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // ignora
  }
};

const CSS = `
@keyframes hq-breathe { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(1.012) } }
@keyframes hq-step { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-1.2%) } }
@keyframes hq-nod { 0%,100% { transform: rotate(0) } 30% { transform: rotate(2.2deg) translateY(0.6%) } 60% { transform: rotate(0) } }
@keyframes hq-pop { from { opacity: 0; transform: scale(0.92) } to { opacity: 1; transform: scale(1) } }
@keyframes hq-page { from { clip-path: inset(0 0 0 100%) } to { clip-path: inset(0 0 0 0) } }
.hq-breathe { animation: hq-breathe 3.2s ease-in-out infinite; transform-origin: bottom center }
.hq-step { animation: hq-step 0.75s ease-in-out infinite }
.hq-nod { animation: hq-nod 1.4s ease-in-out 1; transform-origin: 50% 85% }
.hq-pop { animation: hq-pop 0.35s ease-out both; transform-origin: bottom center }
.hq-page { animation: hq-page 0.9s ease-in-out both }
`;

const Balloon: React.FC<{ text: string; side: 'left' | 'right' }> = ({ text, side }) => (
  <div
    className={`hq-pop absolute top-[3%] ${side === 'left' ? 'left-[4%]' : 'right-[4%]'} w-[46%] bg-white text-slate-900 border-[0.25em] border-slate-900 rounded-[1.6em] px-[1em] py-[0.7em] font-heading font-black leading-snug text-center shadow-[0.3em_0.3em_0_0_rgba(15,23,42,0.85)]`}
  >
    {text}
    {/* rabicho apontando para quem fala (fica acima da cabeça, sem cobrir o rosto) */}
    <span
      className={`absolute -bottom-[1.1em] ${side === 'left' ? 'left-[22%]' : 'right-[22%]'} w-0 h-0 border-l-[0.8em] border-r-[0.8em] border-t-[1.2em] border-l-transparent border-r-transparent border-t-slate-900`}
    />
    <span
      className={`absolute -bottom-[0.7em] ${side === 'left' ? 'left-[calc(22%+0.25em)]' : 'right-[calc(22%+0.25em)]'} w-0 h-0 border-l-[0.55em] border-r-[0.55em] border-t-[0.85em] border-l-transparent border-r-transparent border-t-white`}
    />
  </div>
);

export const HqReuniaoGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playing, setPlaying] = useState<boolean>(() => !readFlag(SEEN) && !readFlag(MISSING));
  const [missing, setMissing] = useState<boolean>(() => readFlag(MISSING));
  const [t, setT] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const finish = () => {
    audioRef.current?.pause();
    writeFlag(SEEN);
    setPlaying(false);
  };

  // Sem a imagem oficial da Edilene a HQ não roda (não inventamos personagem): a fase abre direto.
  const fail = () => {
    writeFlag(MISSING);
    setMissing(true);
    finish();
  };

  useEffect(() => {
    if (!playing) return;
    audioService.holdMusicForStory();
    setT(0);
    const start = performance.now();
    const id = window.setInterval(() => {
      const el = performance.now() - start;
      setT(el);
      if (el >= DURATION) finish();
    }, 100);
    const a = new Audio(MUSIC_SRC);
    a.volume = 0.35;
    a.onerror = () => {
      if (a.src.endsWith(MUSIC_FALLBACK)) return;
      a.src = MUSIC_FALLBACK;
      a.play().catch(() => undefined);
    };
    audioRef.current = a;
    a.play().catch(() => undefined);
    return () => {
      window.clearInterval(id);
      a.pause();
      audioService.releaseMusicForStory();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  if (!playing) {
    return (
      <>
        {children}
        {!missing && (
          <button
            onClick={() => setPlaying(true)}
            className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-black border-2 border-sky-300 shadow-lg"
          >
            <RotateCcw className="w-4 h-4" /> Rever história
          </button>
        )}
      </>
    );
  }

  const q = t < 3000 ? 1 : t < 8000 ? 2 : t < 13000 ? 3 : 4;
  const btn =
    'flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/55 hover:bg-black/75 text-white text-xs font-black border border-white/30 backdrop-blur';

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900 flex items-center justify-center" role="dialog" aria-label="História: reunião urgente">
      <style>{CSS}</style>
      {/* Palco 16:9 do tamanho da tela; fonte proporcional à largura do palco */}
      <div
        className="relative overflow-hidden bg-white p-[0.6%]"
        style={{ width: 'min(100vw, 177.78dvh)', aspectRatio: '16 / 9', fontSize: 'calc(min(100vw, 177.78dvh) * 0.019)' }}
      >
        <div key={q === 1 ? 'geral' : 'cena'} className="relative w-full h-full overflow-hidden border-[0.3em] border-slate-900 rounded-[0.6em] animate-fadeIn">
          <img src="/assets/nisialand_hallway_bg.jpg" alt="Corredor perto da sala da direção" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(15,23,42,0.18)_1px,transparent_1.5px)] [background-size:0.5em_0.5em] mix-blend-multiply pointer-events-none" />

          {/* Q1: plano geral, Edilene caminhando (passo no lugar) até o Márcio. Depois: os dois lado a lado */}
          <div className={`absolute bottom-0 ${q === 1 ? 'left-[14%] h-[66%]' : 'left-[16%] h-[74%]'}`}>
            <img
              src={EDILENE_SRC}
              alt="Edilene"
              onError={fail}
              className={`h-full w-auto object-contain drop-shadow-[0_0.4em_0.5em_rgba(15,23,42,0.4)] ${q === 1 ? 'hq-step' : 'hq-breathe'}`}
            />
          </div>
          <div className={`absolute bottom-0 ${q === 1 ? 'right-[18%] h-[70%]' : 'right-[16%] h-[78%]'}`}>
            <img
              key={q === 3 ? 'aceno' : 'parado'}
              src={MARCIO_SRC}
              alt="Diretor Márcio"
              className={`h-full w-auto object-contain drop-shadow-[0_0.4em_0.5em_rgba(15,23,42,0.4)] ${q === 3 && t > 9500 ? 'hq-nod' : 'hq-breathe'}`}
            />
          </div>

          {q === 2 && <Balloon key="e" text={FALA_EDILENE} side="left" />}
          {q === 3 && <Balloon key="m" text={FALA_MARCIO} side="right" />}

          {/* Q4: virada de página suave */}
          {t > 14100 && <div className="hq-page absolute inset-0 bg-white" />}
        </div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => {
            const a = audioRef.current;
            if (!a) return;
            a.muted = !a.muted;
            setMuted(a.muted);
          }}
          className={btn}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {muted ? 'SOM' : 'MUDO'}
        </button>
        <button onClick={finish} className={btn}>
          <FastForward className="w-4 h-4" /> PULAR HISTÓRIA
        </button>
      </div>
    </div>
  );
};
