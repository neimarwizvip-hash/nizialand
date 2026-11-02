import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Par } from '../../data/jogosFases';
import { AvisoFase, embaralhar, falarIngles, MolduraJogo, somAcerto, somErro, type FimDeJogo } from './comum';

// Ligue os pares: toque um cartão da esquerda e depois o par dele na direita. Cada fase tem mais pares.
interface Props { nivel: number; nome: string; fases: Par[][]; falarEsquerda?: boolean; onFim: (r: FimDeJogo) => void; onVoltar: () => void }

export const ParesJogo: React.FC<Props> = ({ nivel, nome, fases, falarEsquerda, onFim, onVoltar }) => {
  const [f, setF] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [feitos, setFeitos] = useState<number[]>([]);
  const [errado, setErrado] = useState<number | null>(null);
  const [erradosNaFase, setErradosNaFase] = useState<Set<number>>(new Set());
  const [acertos, setAcertos] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const total = useMemo(() => fases.reduce((s, x) => s + x.length, 0), [fases]);
  const pares = fases[f];
  const direita = useMemo(() => embaralhar(pares.map((_, i) => i)), [pares]);
  const acertosRef = useRef(0);

  useEffect(() => { setSel(null); setFeitos([]); setErradosNaFase(new Set()); }, [f]);

  const escolherEsquerda = (i: number) => {
    if (feitos.includes(i)) return;
    setSel(i);
    if (falarEsquerda) falarIngles(pares[i][0]);
  };
  const escolherDireita = (i: number) => {
    if (sel === null || feitos.includes(i)) return;
    if (i === sel) {
      somAcerto();
      const novos = [...feitos, i];
      setFeitos(novos);
      if (!erradosNaFase.has(i)) { acertosRef.current += 1; setAcertos(acertosRef.current); }
      setSel(null);
      if (novos.length === pares.length) {
        if (f + 1 < fases.length) { setAviso(`Fase ${f + 2}!`); window.setTimeout(() => { setAviso(null); setF(f + 1); }, 900); }
        else window.setTimeout(() => onFim({ acertos: acertosRef.current, total }), 500);
      }
    } else {
      somErro();
      setErrado(i);
      setErradosNaFase(s => new Set(s).add(sel));
      window.setTimeout(() => setErrado(null), 500);
    }
  };

  const base = 'relative w-full text-left px-3 py-3 short:py-1.5 rounded-xl border-2 font-semibold text-base sm:text-lg short:text-sm leading-snug transition-all shadow-[0_4px_0_0_#E7D3A6]';
  return (
    <MolduraJogo nivel={nivel} nome={nome} tipo="Ligue os pares" instrucao="Toque um cartão da esquerda e depois o par dele na direita." fase={f + 1} fases={fases.length}
      extra={<span className="ml-auto font-display text-sm">{acertos} de {total} de primeira</span>} onVoltar={onVoltar}>
      <div className="relative grid grid-cols-2 gap-3 sm:gap-6 short:gap-2">
        {aviso && <AvisoFase texto={aviso} />}
        <div className="flex flex-col gap-2 short:gap-1">
          {pares.map((p, i) => (
            <button key={`e${f}-${i}`} type="button" disabled={feitos.includes(i)} onClick={() => escolherEsquerda(i)} aria-pressed={sel === i}
              className={`${base} ${feitos.includes(i) ? 'bg-nisia-verde-100 border-nisia-verde-500 text-nisia-verde-700' : sel === i ? 'bg-nisia-sol-100 border-nisia-sol-700 ring-4 ring-nisia-sol-400/60' : 'bg-nisia-papel border-nisia-papel-linha hover:-translate-y-0.5'}`}>
              {p[0]}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 short:gap-1">
          {direita.map(i => (
            <button key={`d${f}-${i}`} type="button" disabled={feitos.includes(i) || sel === null} onClick={() => escolherDireita(i)}
              className={`${base} ${feitos.includes(i) ? 'bg-nisia-verde-100 border-nisia-verde-500 text-nisia-verde-700' : errado === i ? 'bg-red-50 border-nisia-erro animate-shake-wrong' : 'bg-nisia-papel border-nisia-papel-linha hover:-translate-y-0.5 disabled:cursor-default'}`}>
              {pares[i][1]}
            </button>
          ))}
        </div>
      </div>
    </MolduraJogo>
  );
};
