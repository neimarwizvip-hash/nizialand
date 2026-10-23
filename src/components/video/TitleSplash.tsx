import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, VolumeX, FastForward } from 'lucide-react';
import { audioService, soundEffects } from '../../services/audio';
import { enterFullscreen } from '../../services/fullscreen';

const SEEN_KEY = 'nisialand_title_seen';

type Phase = 'intro' | 'title' | 'story';

// Abertura de "videogame", uma vez por sessão do navegador:
// 1) vídeo curto da escola virando cartoon (mudo)
// 2) tela de título animada com "Toque para começar"
// 3) HQ animada com narração (com som, pode pular) e então o menu
export const TitleSplash: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const introRef = useRef<HTMLVideoElement | null>(null);
  const storyRef = useRef<HTMLVideoElement | null>(null);
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  });
  const [phase, setPhase] = useState<Phase>('intro');
  const [muted, setMuted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  // A trilha fica pausada só enquanto a HQ narrada toca.
  const holdingRef = useRef(false);
  const releaseMusic = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    audioService.releaseMusicForStory();
  };

  useEffect(() => () => releaseMusic(), []);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 70,
        size: 6 + Math.random() * 10,
        delay: Math.random() * 3,
        duration: 1.8 + Math.random() * 2,
      })),
    []
  );

  useEffect(() => {
    if (!visible || phase !== 'intro') return;
    introRef.current?.play().catch(() => setPhase('title'));
  }, [visible, phase]);

  useEffect(() => {
    if (!visible || phase !== 'title') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startStory();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!visible) return null;

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    storyRef.current?.pause();
    releaseMusic();
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // ignora
    }
    onStart();
    setTimeout(() => setVisible(false), 650);
  };

  // O toque do aluno libera o áudio no navegador, então a HQ já começa com som.
  // Esse mesmo toque também coloca o navegador em tela cheia, que continua durante todo o jogo.
  const startStory = () => {
    void enterFullscreen();
    soundEffects.fanfare();
    if (!holdingRef.current) {
      holdingRef.current = true;
      audioService.holdMusicForStory();
    }
    setPhase('story');
    setTimeout(() => {
      const v = storyRef.current;
      if (!v) return finish();
      v.muted = false;
      v.play().catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().catch(finish);
      });
    }, 50);
  };

  const skipIntro = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.buttonClick();
    introRef.current?.pause();
    setPhase('title');
  };

  const skipStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.buttonClick();
    finish();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = storyRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const btn = 'flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/50 hover:bg-black/70 text-white text-xs font-black border border-white/30 backdrop-blur';

  return (
    <div
      onClick={phase === 'title' ? startStory : undefined}
      className={`fixed inset-0 z-[60] bg-black flex items-center justify-center overflow-hidden transition-all duration-700 ${
        leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${phase === 'title' ? 'cursor-pointer' : ''}`}
      role="dialog"
      aria-label="Abertura do NISIALAND"
    >
      {phase === 'intro' && (
        <>
          <video
            ref={introRef}
            src="/assets/nisialand_intro.mp4"
            poster="/assets/nisialand_title_bg.jpg"
            muted
            playsInline
            preload="auto"
            onEnded={() => setPhase('title')}
            onError={() => setPhase('title')}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <button onClick={skipIntro} className={btn}>
              <FastForward className="w-4 h-4" /> PULAR
            </button>
          </div>
        </>
      )}

      {phase === 'title' && (
        <div className="absolute inset-0 animate-title-in">
          <img src="/assets/nisialand_title_bg.jpg" alt="NISIALAND: Escola Municipal Nísia Vilela Fernandes" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 title-rays pointer-events-none" />
          {sparkles.map((s) => (
            <span
              key={s.id}
              className="title-sparkle"
              style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-[7%] left-0 right-0 flex flex-col items-center gap-3 px-4 text-center">
            <div className="animate-press-start font-[Bungee] text-2xl sm:text-4xl text-white px-6 sm:px-10 py-3 rounded-full bg-black/60 border-2 border-amber-300/80 shadow-[0_0_30px_rgba(251,191,36,0.6)] backdrop-blur-sm">
              TOQUE PARA COMEÇAR
            </div>
            <div className="text-[11px] sm:text-xs tracking-[0.35em] text-amber-100 font-black drop-shadow">PRESS START · E. M. NÍSIA VILELA FERNANDES</div>
          </div>
        </div>
      )}

      {phase === 'story' && (
        <>
          <video
            ref={storyRef}
            src="/assets/nisialand_hq.mp4"
            poster="/assets/nisialand_title_bg.jpg"
            playsInline
            preload="auto"
            onEnded={finish}
            onError={finish}
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={toggleMute} className={btn}>
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {muted ? 'SOM' : 'MUDO'}
            </button>
            <button onClick={skipStory} className={btn}>
              <FastForward className="w-4 h-4" /> PULAR HISTÓRIA
            </button>
          </div>
        </>
      )}
    </div>
  );
};
