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
      <main className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-nisia-azul-900 text-center text-white" aria-live="polite">
        <img src="/assets/nisialand_logo_oficial.png" alt="" className="h-20 w-auto drop-shadow-[0_4px_0_rgba(0,0,0,0.35)]" aria-hidden="true" />
        <p className="font-display text-xl text-nisia-sol-400 tracking-wide animate-pulse">Carregando…</p>
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
          className="kit-btn kit-btn--sol kit-btn--lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          ▶ Iniciar com som
        </button>
      )}
      <button
        type="button"
        onClick={complete}
        className="kit-hud__btn absolute bottom-5 right-5"
      >
        Pular vídeo
      </button>
    </main>
  );
};
