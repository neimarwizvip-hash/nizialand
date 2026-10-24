import React from 'react';

// Celular em pé: pede para girar. Só aparece pelo CSS (.rotate-overlay em index.css),
// então o jogo embaixo não pausa nem desmonta. Vale também no iPhone, que não trava a orientação.
export const RotateDeviceOverlay: React.FC = () => (
  <div className="rotate-overlay" role="alert" aria-live="polite">
    <svg className="rotate-overlay__phone" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="20" y="6" width="24" height="52" rx="5" stroke="currentColor" strokeWidth="4" />
      <line x1="28" y1="50" x2="36" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
    <p>Gire o celular para jogar</p>
  </div>
);
