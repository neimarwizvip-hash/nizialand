import React from 'react';
import { Hud } from '../kit/Hud';

// Cabeçalho das telas do jogo. Desde a Fase 0 do aprimoramento gráfico é a HUD única de 56 px
// (src/components/kit/Hud.tsx); este arquivo fica como atalho para as telas que ainda importam GameHeader.
export const GameHeader: React.FC<{ nivel?: number; children?: React.ReactNode }> = ({ nivel, children }) => (
  <Hud nivel={nivel}>{children}</Hud>
);
