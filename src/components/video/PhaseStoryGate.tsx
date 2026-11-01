import React, { useEffect, useRef, useState } from 'react';
import { Icone } from '../kit/Icones';
import { audioService } from '../../services/audio';

// História narrada que abre cada fase. Toca uma vez por sessão do navegador;
// depois a fase abre direto (o botão "Rever história" fica no canto).
const seenKey = (story: string) => `nisialand_story_seen_${story}`;
// Vídeo que falhou ao carregar (ainda não existe): a fase abre direto e some o "Rever história".
const missingKey = (story: string) => `nisialand_story_missing_${story}`;
// Histórias que já têm vídeo em public/assets/historia_<story>.mp4. As outras passam direto.
const AVAILABLE_STORIES = ['nivel0'];
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

export const PhaseStoryGate: React.FC<{ story: string; children: React.ReactNode }> = ({ story, children }) => {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState<boolean>(() => AVAILABLE_STORIES.includes(story) && !readFlag(seenKey(story)));
  const [missing, setMissing] = useState<boolean>(() => !AVAILABLE_STORIES.includes(story) || readFlag(missingKey(story)));
  const [muted, setMuted] = useState(false);

  // A trilha do jogo pausa enquanto a história toca (sem mudar a escolha do aluno)
  // e continua de onde parou quando o vídeo termina ou é pulado.
  useEffect(() => {
    if (!playing) return;
    audioService.holdMusicForStory();
    const v = ref.current;
    if (v) {
      v.muted = false;
      v.play().catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => finish());
      });
    }
    return () => audioService.releaseMusicForStory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const finish = () => {
    ref.current?.pause();
    writeFlag(seenKey(story));
    setPlaying(false);
  };

  const fail = () => {
    writeFlag(missingKey(story));
    setMissing(true);
    finish();
  };


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

  return (
    <div className="fixed inset-0 z-[70] bg-black flex items-center justify-center pointer-events-auto" role="dialog" aria-label="História da fase">
      <video
        ref={ref}
        src={`/assets/historia_${story}.mp4`}
        playsInline
        preload="auto"
        onEnded={finish}
        onError={fail}
        className="w-full h-full object-contain"
      />
      <div className="absolute top-3 right-3 flex gap-1.5">
        <button
          onClick={() => {
            const v = ref.current;
            if (!v) return;
            v.muted = !v.muted;
            setMuted(v.muted);
          }}
          className="kit-hud__btn"
          aria-pressed={!muted}
          aria-label={muted ? 'Ligar o som do vídeo' : 'Tirar o som do vídeo'}
        >
          <Icone nome={muted ? 'som-mudo' : 'som'} className="w-5 h-5" cor={muted ? '#FFD23F' : '#0C2A66'} />
        </button>
        <button type="button" onClick={finish} className="kit-hud__btn">
          <Icone nome="seta" className="w-5 h-5" /> Pular história
        </button>
      </div>
    </div>
  );
};
