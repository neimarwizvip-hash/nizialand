import React, { useEffect, useRef, useState } from 'react';

interface StartupVideoScreenProps {
  onComplete: () => void;
}

/** Vídeo institucional exibido antes de a tela de abertura do jogo ser montada. */
export const StartupVideoScreen: React.FC<StartupVideoScreenProps> = ({ onComplete }) => {
  const hasCompleted = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasPlayedPlim = useRef(false);
  const [stage, setStage] = useState<'first-video' | 'loading' | 'second-video'>('first-video');
  const [requiresSoundActivation, setRequiresSoundActivation] = useState(false);

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

  useEffect(() => {
    if (stage === 'loading') return;

    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1;
    video.play().then(
      () => setRequiresSoundActivation(false),
      () => setRequiresSoundActivation(true),
    );
  }, [stage]);

  const advanceFromFirstVideo = () => setStage('loading');

  const playPlim = () => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const context = audioContextRef.current ?? new AudioCtx();
    audioContextRef.current = context;

    void context.resume().then(() => {
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1046.5, now);
      oscillator.frequency.exponentialRampToValueAtTime(1568, now + 0.12);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    });
  };

  const handleFirstVideoTimeUpdate = () => {
    const currentTime = videoRef.current?.currentTime ?? 0;
    if (currentTime < 2 || hasPlayedPlim.current) return;

    hasPlayedPlim.current = true;
    playPlim();
  };

  const startWithSound = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1;
    void video.play().then(
      () => setRequiresSoundActivation(false),
      () => setRequiresSoundActivation(true),
    );
  };

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
        ref={videoRef}
        className={`h-full w-full ${isFirstVideo ? 'object-contain' : 'object-cover'}`}
        autoPlay
        playsInline
        preload="auto"
        src={isFirstVideo ? '/assets/sequencia01_1.mp4' : '/assets/sequencia01_2.mp4'}
        onEnded={isFirstVideo ? advanceFromFirstVideo : complete}
        onError={isFirstVideo ? advanceFromFirstVideo : complete}
        onTimeUpdate={isFirstVideo ? handleFirstVideoTimeUpdate : undefined}
      >
        Seu navegador não suporta a reprodução deste vídeo.
      </video>
      {requiresSoundActivation && (
        <button
          type="button"
          onClick={startWithSound}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-700 px-7 py-4 font-heading text-lg font-black uppercase tracking-wide text-white shadow-[0_5px_0_0_#1e3a8a] transition hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          ▶ Iniciar com som
        </button>
      )}
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
