import React, { useEffect, useRef, useState } from 'react';
import { Icone } from './Icones';

// Medidores desenhados: cronômetro em anel, moedas que pulam ao somar, estrelas de 1 a 3.

// Cronômetro: anel que esvazia; fica vermelho e treme nos últimos segundos.
export const Cronometro: React.FC<{ segundos: number; total: number; alerta?: number; tamanho?: number; className?: string }> = ({
  segundos, total, alerta = 5, tamanho = 56, className = '',
}) => {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const frac = total > 0 ? Math.max(0, Math.min(1, segundos / total)) : 0;
  const emAlerta = segundos <= alerta;
  const cor = emAlerta ? '#E5484D' : frac < 0.5 ? '#F2811D' : '#3FA34D';
  return (
    <div
      role="timer"
      aria-label={`Tempo para responder: ${segundos} segundos`}
      className={`relative inline-flex items-center justify-center ${emAlerta ? 'kit-cronometro--alerta' : ''} ${className}`}
      style={{ width: tamanho, height: tamanho }}
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="#FFF6DF" stroke="#E7D3A6" strokeWidth="6" />
        <circle
          cx="24" cy="24" r={r} fill="none" stroke={cor} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - frac)}
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
        />
        <circle cx="24" cy="24" r="23" fill="none" stroke="#1A2A4A" strokeWidth="2" />
      </svg>
      <span className="relative font-display text-nisia-tinta leading-none" style={{ fontSize: tamanho * 0.36 }}>{segundos}</span>
    </div>
  );
};

// Moedas: contador com ícone; anima quando o valor sobe.
export const Moedas: React.FC<{ valor: number; rotulo?: string; className?: string; compacto?: boolean }> = ({ valor, rotulo = 'pts', className = '', compacto = false }) => {
  const anterior = useRef(valor);
  const [pulo, setPulo] = useState(false);
  useEffect(() => {
    if (valor > anterior.current) {
      setPulo(true);
      const t = window.setTimeout(() => setPulo(false), 520);
      anterior.current = valor;
      return () => window.clearTimeout(t);
    }
    anterior.current = valor;
  }, [valor]);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-nisia-papel border-2 border-nisia-sol-700 text-nisia-tinta font-display shadow-[0_3px_0_0_#B36E00] ${compacto ? 'px-2 py-0.5 text-sm' : 'px-3 py-1 text-base'} ${className}`}>
      <Icone nome="moeda" className={`${compacto ? 'w-5 h-5' : 'w-6 h-6'} text-nisia-sol-700 ${pulo ? 'animate-moeda-pop' : ''}`} />
      <span className="tabular-nums">{valor.toLocaleString('pt-BR')}</span>
      {!compacto && <span className="text-xs uppercase tracking-wider text-nisia-tinta-suave">{rotulo}</span>}
    </span>
  );
};

// Estrelas de 0 a 3.
export const Estrelas: React.FC<{ n: number; total?: number; tamanho?: string; className?: string }> = ({ n, total = 3, tamanho = 'w-5 h-5', className = '' }) => (
  <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${n} de ${total} estrelas`} role="img">
    {Array.from({ length: total }, (_, i) => (
      <Icone key={i} nome="estrela" className={`${tamanho} ${i < n ? 'text-nisia-sol-700' : 'text-nisia-papel-linha'}`} cor={i < n ? '#FFD23F' : '#F3E4BE'} />
    ))}
  </span>
);

// Barra de progresso em fita amarela.
export const Fita: React.FC<{ frac: number; className?: string; rotulo?: string }> = ({ frac, className = '', rotulo }) => (
  <div className={`relative h-3.5 rounded-full bg-nisia-papel border-2 border-nisia-madeira-escura overflow-hidden ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(frac * 100)} aria-label={rotulo}>
    <div className="h-full rounded-full bg-gradient-to-r from-nisia-sol-400 to-nisia-laranja-500 transition-all duration-500" style={{ width: `${Math.max(0, Math.min(1, frac)) * 100}%` }} />
  </div>
);
