import React from 'react';

// Cenário de fundo: a arte oficial da escola em tela cheia, com vinheta azul discreta.
// Nunca véu branco por cima: o cenário é o palco; o que precisa de contraste vai sobre um Painel (papel, lousa, mural).
export type NomeCenario = 'corredor' | 'auditorio' | 'fachada' | 'escola' | 'titulo' | 'patio';

const IMAGENS: Record<NomeCenario, { src: string; alt: string; posicao?: string }> = {
  corredor: { src: '/assets/nisialand_hallway_bg.jpg', alt: 'Corredor da escola' },
  auditorio: { src: '/assets/nisialand_auditorium_bg.jpg', alt: 'Auditório da escola' },
  fachada: { src: '/assets/nisialand_school_facade_clean.jpg', alt: 'Fachada da escola', posicao: 'center 70%' },
  escola: { src: '/assets/nizialand_school_alt.jpg', alt: 'Escola vista da rua', posicao: 'center 65%' },
  titulo: { src: '/assets/nisialand_title_bg.jpg', alt: 'Escola com a equipe' },
  // Pátio: ainda sem arte própria (Fase 1); usa a fachada mais baixa para mostrar o chão.
  patio: { src: '/assets/nisialand_school_facade_clean.jpg', alt: 'Pátio da escola', posicao: 'center 100%' },
};

export const Cenario: React.FC<{ nome: NomeCenario; escurecer?: number; desfoque?: boolean; className?: string }> = ({
  nome, escurecer = 0, desfoque = false, className = '',
}) => {
  const img = IMAGENS[nome];
  return (
    <div className={`kit-cenario ${className}`} aria-hidden="true">
      <img
        src={img.src}
        alt=""
        draggable={false}
        style={{ objectPosition: img.posicao ?? 'center', filter: `${desfoque ? 'blur(2px) ' : ''}brightness(${1 - escurecer})` }}
      />
      <div className="kit-cenario__vinheta" />
    </div>
  );
};
