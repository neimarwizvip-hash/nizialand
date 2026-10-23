import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, FastForward, Sparkles } from 'lucide-react';
import { soundEffects } from '../../services/audio';

interface IntroVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const IntroVideoModal: React.FC<IntroVideoModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setProgress(0);
      setHasError(false);
      // Mark as seen
      try {
        localStorage.setItem('nisialand_intro_seen', 'true');
      } catch (e) {
        // Ignore storage errors
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 1;
      setProgress((current / total) * 100);
      setDuration(total);
    }
  };

  const handleVideoEnded = () => {
    soundEffects.fanfare();
    if (onComplete) {
      onComplete();
    } else {
      onClose();
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleSkip = () => {
    soundEffects.buttonClick();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (onComplete) {
      onComplete();
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/75 backdrop-blur-md animate-fadeIn p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Vídeo de Abertura do Nisialand"
    >
      <div className="relative w-full max-w-5xl bg-white border-2 sm:border-4 border-white rounded-2xl sm:rounded-[1.75rem] shadow-[0_8px_0_0_#7dd3fc,0_30px_60px_-20px_rgba(8,47,73,0.6)] overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-sky-50 via-white to-amber-50 border-b-2 border-sky-200 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🎬</span>
            <div>
              <h2 className="text-sm sm:text-base font-heading font-black tracking-wider text-blue-800 uppercase flex items-center gap-1.5">
                NISIALAND: THE TRANSFORMATION <Sparkles className="w-4 h-4 text-amber-500" />
              </h2>
              <p className="text-[11px] text-slate-500 font-semibold hidden sm:block">
                Escola Municipal Nísia Vilela Fernandes se transforma em aventura!
              </p>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-heading font-black text-xs sm:text-sm rounded-full border-2 border-amber-600 shadow-[0_3px_0_0_#b45309] transition-all transform active:scale-95"
            aria-label="Pular abertura"
          >
            <span>PULAR ABERTURA</span>
            <FastForward className="w-4 h-4 fill-slate-950" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {!hasError ? (
            <video
              ref={videoRef}
              src="/assets/nisialand_hq.mp4"
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="p-8 text-center text-slate-300 flex flex-col items-center">
              <span className="text-5xl mb-4">🏫✨</span>
              <h3 className="font-heading font-black text-xl text-amber-400 mb-2">
                Bem-vindo ao Nisialand!
              </h3>
              <p className="text-sm max-w-md mb-6 text-slate-400">
                A Escola Municipal Nísia Vilela Fernandes agora é um mundo repleto de desafios, equipes e aprendizado!
              </p>
              <button
                onClick={handleSkip}
                className="px-6 py-2.5 bg-amber-400 text-slate-950 font-heading font-black rounded-xl"
              >
                Continuar Aventura →
              </button>
            </div>
          )}

          {/* Quick Overlay Controls on Hover/Bottom */}
          <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-2 z-20">
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-blue-500 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Buttons Row */}
            <div className="flex items-center justify-between text-white text-xs sm:text-sm pt-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlay}
                  className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-amber-400 transition-colors"
                  aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-amber-400" />}
                </button>

                <button
                  onClick={handleToggleMute}
                  className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-cyan-400 transition-colors"
                  aria-label={isMuted ? "Ativar som" : "Desativar som"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  {videoRef.current ? Math.floor(videoRef.current.currentTime) : 0}s / {Math.floor(duration || 0)}s
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-amber-200 font-heading font-bold hidden md:inline">
                  Prof. Neimar Oliveira • Língua Inglesa
                </span>
                <button
                  onClick={handleSkip}
                  className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Fechar"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
