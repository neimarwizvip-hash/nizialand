import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, FastForward, RotateCcw } from 'lucide-react';
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

  const btn =
    'flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/55 hover:bg-black/75 text-white text-xs font-black border border-white/30 backdrop-blur';

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
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => {
            const v = ref.current;
            if (!v) return;
            v.muted = !v.muted;
            setMuted(v.muted);
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
