import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Par } from '../../data/jogosFases';
import { AvisoFase, embaralhar, falarIngles, MolduraJogo, somAcerto, somErro, type FimDeJogo } from './comum';

// Jogo da memória inglês–português: cada fase tem mais cartas. Acerto de primeira vale ponto.
interface Props { nivel: number; nome: string; fases: Par[][]; onFim: (r: FimDeJogo) => void; onVoltar: () => void }
interface Carta { id: string; par: number; texto: string; ingles: boolean }

export const MemoriaJogo: React.FC<Props> = ({ nivel, nome, fases, onFim, onVoltar }) => {
  const [f, setF] = useState(0);
  const [abertas, setAbertas] = useState<string[]>([]);
  const [achados, setAchados] = useState<number[]>([]);
  const [tentativas, setTentativas] = useState<Record<number, number>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const acertos = useRef(0);
  const total = useMemo(() => fases.reduce((s, x) => s + x.length, 0), [fases]);
  const cartas = useMemo<Carta[]>(() => embaralhar(fases[f].flatMap((p, i) => [
    { id: `${f}-${i}-en`, par: i, texto: p[0], ingles: true },
    { id: `${f}-${i}-pt`, par: i, texto: p[1], ingles: false },
  ])), [fases, f]);

  useEffect(() => { setAbertas([]); setAchados([]); setTentativas({}); }, [f]);

  const virar = (c: Carta) => {
    if (abertas.length >= 2 || abertas.includes(c.id) || achados.includes(c.par)) return;
    if (c.ingles) falarIngles(c.texto);
    const novas = [...abertas, c.id];
    setAbertas(novas);
    if (novas.length < 2) return;
    const [a, b] = novas.map(id => cartas.find(x => x.id === id)!);
    if (a.par === b.par) {
      somAcerto();
      if (!tentativas[a.par]) acertos.current += 1;
      const novos = [...achados, a.par];
      window.setTimeout(() => { setAchados(novos); setAbertas([]); }, 450);
      if (novos.length === fases[f].length) {
        if (f + 1 < fases.length) window.setTimeout(() => { setAviso(`Fase ${f + 2}!`); window.setTimeout(() => { setAviso(null); setF(f + 1); }, 900); }, 500);
        else window.setTimeout(() => onFim({ acertos: acertos.current, total }), 700);
      }
    } else {
      somErro();
      setTentativas(t => ({ ...t, [a.par]: (t[a.par] ?? 0) + 1, [b.par]: (t[b.par] ?? 0) + 1 }));
      window.setTimeout(() => setAbertas([]), 900);
    }
  };

  const cols = cartas.length <= 6 ? 'grid-cols-3' : cartas.length <= 8 ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-5';
  return (
    <MolduraJogo nivel={nivel} nome={nome} tipo="Jogo da memória" instrucao="Vire duas cartas e ache os pares inglês–português." fase={f + 1} fases={fases.length}
      extra={<span className="ml-auto font-display text-sm">{achados.length} de {fases[f].length} pares</span>} onVoltar={onVoltar}>
      <div className={`relative grid ${cols} gap-2 sm:gap-3 short:gap-1.5`}>
        {aviso && <AvisoFase texto={aviso} />}
        {cartas.map(c => {
          const visivel = abertas.includes(c.id) || achados.includes(c.par);
          return (
            <button key={c.id} type="button" onClick={() => virar(c)} aria-label={visivel ? c.texto : 'Carta virada'}
              className={`min-h-[5.5rem] short:min-h-[3.2rem] rounded-xl border-[3px] px-2 py-2 font-semibold text-sm sm:text-base short:text-xs leading-tight flex items-center justify-center text-center transition-all shadow-[0_4px_0_0_rgba(26,42,74,0.25)]
                ${achados.includes(c.par) ? 'bg-nisia-verde-100 border-nisia-verde-500 text-nisia-verde-700' : visivel ? (c.ingles ? 'bg-nisia-azul-100 border-nisia-azul-500 text-nisia-azul-700' : 'bg-nisia-papel border-nisia-sol-700 text-nisia-tinta') : 'bg-gradient-to-b from-nisia-roxo-400 to-nisia-roxo-500 border-nisia-roxo-700 hover:-translate-y-0.5'}`}>
              {visivel ? c.texto : <span className="font-display text-4xl short:text-2xl text-nisia-sol-300 drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]" aria-hidden="true">?</span>}
            </button>
          );
        })}
      </div>
    </MolduraJogo>
  );
};
