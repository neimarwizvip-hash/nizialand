import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScreenTransitionLoaderProps {
  children: React.ReactNode;
}

// Indicador "CARREGANDO" (mesmo visual na troca de tela e enquanto uma tela é baixada).
const LoadingPill: React.FC = () => (
  <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/90 border-2 border-sky-200 shadow-[0_8px_24px_rgba(14,116,144,0.18)] backdrop-blur">
    <span className="relative w-5 h-5">
      <span className="absolute inset-0 rounded-full border-[3px] border-sky-200" />
      <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 border-r-amber-400 animate-spin" />
    </span>
    <span className="font-heading font-black text-sm tracking-[0.2em] text-blue-700">CARREGANDO</span>
  </div>
);

// Fallback do <Suspense> para telas carregadas sob demanda.
export const ScreenLoadingFallback: React.FC = () => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center" role="status" aria-live="polite">
    <LoadingPill />
  </div>
);

// Troca de tela leve: o conteúdo some (fade), aparece só um indicador discreto
// "carregando" no centro e a nova tela volta com fade. Sem cartão, sem capa.
export const ScreenTransitionLoader: React.FC<ScreenTransitionLoaderProps> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  const prevPathRef = useRef<string>(location.pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Primeira carga do site
  useEffect(() => {
    const firstTimer = setTimeout(() => setIsTransitioning(false), 450);
    return () => clearTimeout(firstTimer);
  }, []);

  // Troca de rota
  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      setIsTransitioning(true);
      window.scrollTo({ top: 0 });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsTransitioning(false), 380);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.pathname]);

  return (
    <>
      <div
        className={`transition-opacity duration-300 ease-out ${
          isTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {children}
      </div>

      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
        role="status"
        aria-live="polite"
        aria-hidden={!isTransitioning}
      >
        <LoadingPill />
      </div>
    </>
  );
};
