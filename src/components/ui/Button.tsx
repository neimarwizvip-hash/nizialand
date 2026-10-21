import React from 'react';
import { audioService } from '../../services/audio';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'blue' | 'purple' | 'green' | 'slate' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  glow = false,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      audioService.playClick();
      if (onClick) onClick(e);
    }
  };

  const baseStyles = "relative inline-flex items-center justify-center font-heading font-black tracking-wider uppercase transition-all duration-150 rounded-2xl select-none active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs shadow-game-sm",
    md: "px-5 py-2.5 text-sm shadow-game",
    lg: "px-7 py-3 text-base shadow-game-lg",
    xl: "px-9 py-4 text-xl shadow-game-lg"
  };

  const variantStyles = {
    gold: "bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 border-2 border-amber-600 hover:from-amber-200 hover:to-amber-400",
    blue: "bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700 text-white border-2 border-blue-900 hover:from-blue-300 hover:to-blue-600",
    purple: "bg-gradient-to-b from-purple-400 via-purple-500 to-purple-700 text-white border-2 border-purple-950 hover:from-purple-300 hover:to-purple-600",
    green: "bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 text-white border-2 border-emerald-900 hover:from-emerald-300 hover:to-emerald-500",
    slate: "bg-gradient-to-b from-slate-700 to-slate-800 text-slate-100 border-2 border-slate-900 hover:from-slate-600 hover:to-slate-700",
    outline: "bg-white/10 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/60"
  };

  const glowStyles = glow ? {
    gold: "shadow-glow-gold animate-pulse-glow",
    blue: "shadow-glow-blue animate-pulse-glow",
    purple: "shadow-glow-purple animate-pulse-glow",
    green: "shadow-game-green animate-pulse-glow",
    slate: "",
    outline: ""
  }[variant] : "";

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${glowStyles} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
