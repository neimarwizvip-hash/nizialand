import React from 'react';

// Painel = objeto do cenário onde a atividade acontece: papel, lousa, mural, placa.
// Substitui o cartão branco genérico. O conteúdo decide a cor do texto (lousa é clara sobre verde).
export type TipoPainel = 'papel' | 'lousa' | 'mural' | 'placa';

interface PainelProps extends React.HTMLAttributes<HTMLDivElement> {
  tipo?: TipoPainel;
  fita?: boolean; // fita adesiva nos cantos (cartaz pregado)
  liso?: boolean; // papel sem pauta
  as?: 'div' | 'section' | 'article';
}

const CLASSES: Record<TipoPainel, string> = {
  papel: 'kit-papel',
  lousa: 'kit-lousa',
  mural: 'kit-mural',
  placa: 'kit-placa',
};

export const Painel: React.FC<PainelProps> = ({ tipo = 'papel', fita = false, liso = false, as = 'div', className = '', children, ...rest }) => {
  const Tag = as;
  return (
    <Tag
      className={`relative ${CLASSES[tipo]} ${tipo === 'papel' && liso ? 'kit-papel--liso' : ''} ${fita ? 'kit-fita' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};

// Botão de jogo (bisel + sombra sólida). Mantém o som de clique do Button antigo via onClick externo.
interface BotaoJogoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  cor?: 'sol' | 'laranja' | 'azul' | 'verde' | 'roxo' | 'papel';
  tamanho?: 'sm' | 'md' | 'lg';
}

export const BotaoJogo: React.FC<BotaoJogoProps> = ({ cor = 'sol', tamanho = 'md', className = '', type = 'button', children, ...rest }) => (
  <button
    type={type}
    className={`kit-btn kit-btn--${cor} ${tamanho === 'md' ? '' : `kit-btn--${tamanho}`} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

// Ficha pequena (etiqueta): "PERGUNTA 1 DE 5", "8º ANO", "EQUIPE AZUL".
export const Ficha: React.FC<React.HTMLAttributes<HTMLSpanElement> & { cor?: 'sol' | 'azul' | 'roxo' | 'verde' | 'papel' | 'erro' }> = ({ cor = 'sol', className = '', children, ...rest }) => (
  <span className={`kit-ficha kit-ficha--${cor} ${className}`} {...rest}>{children}</span>
);

// Título de jogo (Lilita One com contorno).
export const Titulo: React.FC<React.HTMLAttributes<HTMLHeadingElement> & { nivel?: 1 | 2 | 3; estilo?: 'sol' | 'azul' | 'giz' }> = ({ nivel = 1, estilo = 'sol', className = '', children, ...rest }) => {
  const Tag = (`h${nivel}` as unknown) as 'h1';
  return (
    <Tag className={`kit-titulo ${estilo === 'azul' ? 'kit-titulo--azul' : estilo === 'giz' ? 'kit-titulo--giz' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
};
