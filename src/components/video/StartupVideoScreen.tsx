import React, { useEffect, useRef, useState } from 'react';

interface StartupVideoScreenProps {
  onComplete: () => void;
}

/** Vídeo institucional exibido antes de a tela de abertura do jogo ser montada. */
export const StartupVideoScreen: React.FC<StartupVideoScreenProps> = ({ onComplete }) => {
  const hasCompleted = useRef(false);
  const [stage, setStage] = useState<'first-video' | 'loading' | 'second-video'>('first-video');

  const complete = () => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    onComplete();
  };

  useEffect(() => {
    if (stage !== 'loading') return;

    const timer = window.setTimeout(() => setStage('second-video'), 1200);
    return () => window.clearTimeout(timer);
  }, [stage]);

  const advanceFromFirstVideo = () => setStage('loading');

  if (stage === 'loading') {
    return (
      <main className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-slate-950 text-center text-white" aria-live="polite">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-300/30 border-t-sky-300" aria-hidden="true" />
        <p className="font-heading text-lg font-black tracking-widest uppercase">Carregando...</p>
      </main>
    );
  }

  const isFirstVideo = stage === 'first-video';

  return (
    <main className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black" aria-label="Vídeo de abertura">
      <video
        className={`h-full w-full ${isFirstVideo ? 'object-contain' : 'object-cover'}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        src={isFirstVideo ? '/assets/sequencia01_1.mp4' : '/assets/sequencia01_2.mp4'}
        onEnded={isFirstVideo ? advanceFromFirstVideo : complete}
        onError={isFirstVideo ? advanceFromFirstVideo : complete}
      >
        Seu navegador não suporta a reprodução deste vídeo.
      </video>
      <button
        type="button"
        onClick={complete}
        className="absolute bottom-5 right-5 rounded-full border-2 border-white/70 bg-black/45 px-4 py-2 text-sm font-bold text-white transition hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Pular vídeo
      </button>
    </main>
  );
};
