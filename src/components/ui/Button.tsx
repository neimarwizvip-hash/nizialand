import React from 'react';
import { audioService } from '../../services/audio';

// Botão antigo, agora desenhado com o kit (bisel + sombra sólida, paleta Nísia).
// As variantes antigas continuam aceitas e são mapeadas para as cores do kit.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'blue' | 'purple' | 'green' | 'slate' | 'outline' | 'sky' | 'orange';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
}

const COR: Record<NonNullable<ButtonProps['variant']>, string> = {
  gold: 'kit-btn--sol',
  orange: 'kit-btn--laranja',
  blue: 'kit-btn--azul',
  purple: 'kit-btn--roxo',
  green: 'kit-btn--verde',
  slate: 'kit-btn--azul',
  outline: 'kit-btn--papel',
  sky: 'kit-btn--papel',
};

const TAMANHO: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'kit-btn--sm',
  md: '',
  lg: 'kit-btn--lg',
  xl: 'kit-btn--lg text-2xl',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  glow = false,
  className = '',
  onClick,
  disabled,
  type = 'button',
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      audioService.playClick();
      if (onClick) onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={`kit-btn ${COR[variant]} ${TAMANHO[size]} ${glow ? 'animate-pulse-glow' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
