import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Gamepad2 } from 'lucide-react';

interface ScreenTransitionLoaderProps {
  children: React.ReactNode;
}

const GAME_TIPS = [
  'Preparando a aventura em Duque de Caxias...',
  'Conectando à E. M. Nísia Vilela Fernandes...',
  'Carregando desafios e flashcards de inglês...',
  'Ajustando o placar das equipes Azul e Roxa...',
  'Sincronizando avatares e recompensas...',
  'O Diretor Márcio e a Orientadora Léia estão esperando!'
];

export const ScreenTransitionLoader: React.FC<ScreenTransitionLoaderProps> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [tipIndex, setTipIndex] = useState<number>(0);
  const prevPathRef = useRef<string>(location.pathname);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial site load
  useEffect(() => {
    // First load duration: ~1.2s showing the official cover with loading dots
    const firstTimer = setTimeout(() => {
      setIsFirstLoad(false);
      setIsTransitioning(false);
    }, 1200);

    return () => clearTimeout(firstTimer);
  }, []);

  // Screen transition between routes
  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      setIsTransitioning(true);
      setTipIndex(Math.floor(Math.random() * GAME_TIPS.length));

      if (timerRef.current) clearTimeout(timerRef.current);

      // Sweet spot for transitions: ~750ms as requested
      timerRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 750);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.pathname]);

  return (
    <>
      {/* Main App Content */}
      <div
        className={`transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {children}
      </div>

      {/* Screen Transition & Initial Load Overlay */}
      {isTransitioning && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-slate-950 transition-all duration-300"
          role="status"
          aria-live="polite"
          aria-label="Carregando..."
        >
          {/* Background: Official NISIALAND Cover with subtle glow */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/nisialand_cover_official.jpg"
              alt="NISIALAND Cover"
              className={`w-full h-full object-cover object-center filter ${
                isFirstLoad ? 'brightness-90 scale-100' : 'brightness-50 blur-sm scale-105'
              } transition-all duration-700`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
          </div>

          {/* Center Card: Gamified Loading Box */}
          <div className="relative z-10 flex flex-col items-center max-w-md mx-4 px-6 py-6 sm:px-8 sm:py-8 rounded-3xl bg-slate-900/85 border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.35)] backdrop-blur-md text-center transform animate-arcade-pulse">
            {/* Mascot Icon */}
            <div className="relative mb-3 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg flex items-center justify-center border border-amber-300/60">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 animate-pulse" />
                </div>
              </div>
              <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-bounce" />
            </div>

            {/* School Brand */}
            <div className="text-[11px] sm:text-xs font-heading font-black tracking-widest text-cyan-300 uppercase mb-1">
              E. M. NÍSIA VILELA FERNANDES
            </div>

            {/* "CARREGANDO" + 3 Growing Dots */}
            <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl md:text-3xl font-heading font-black tracking-wider text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]">
              <span>CARREGANDO</span>
              <span className="inline-flex items-center gap-1.5 ml-1">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 dot-1 inline-block shadow-glow-gold" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cyan-400 dot-2 inline-block shadow-glow-cyan" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-400 dot-3 inline-block shadow-glow-purple" />
              </span>
            </div>

            {/* Educational Tip Subtitle */}
            <p className="mt-3 text-xs sm:text-sm text-slate-200/90 font-medium max-w-xs leading-relaxed">
              {GAME_TIPS[tipIndex]}
            </p>

            {/* Progress Sweep Bar */}
            <div className="w-full mt-4 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-700 p-0.5 shadow-inner">
              <div className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-purple-500 rounded-full animate-[shimmer-bar_0.75s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
