import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Sequencia } from '../../data/jogosFases';
import { BotaoJogo, Icone, Painel } from '../../components/kit';
import { AvisoFase, embaralharDiferente, falarIngles, MolduraJogo, somAcerto, somErro, type FimDeJogo } from './comum';

// Coloque em ordem: toque os cartões na sequência certa (rotina, linha do tempo, receita, apresentação).
// Cada passo certo de primeira vale ponto. Na cozinha, as instruções são faladas em inglês.
interface Props { nivel: number; nome: string; fases: Sequencia[][]; falar?: boolean; onFim: (r: FimDeJogo) => void; onVoltar: () => void }

export const OrdemJogo: React.FC<Props> = ({ nivel, nome, fases, falar, onFim, onVoltar }) => {
  const [f, setF] = useState(0);
  const [k, setK] = useState(0);
  const [colocados, setColocados] = useState<number[]>([]);
  const [errado, setErrado] = useState<number | null>(null);
  const [errouNoPasso, setErrouNoPasso] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const acertos = useRef(0);
  const total = useMemo(() => fases.flat().reduce((s, x) => s + x.passos.length, 0), [fases]);
  const seq = fases[f][k];
  const ordem = useMemo(() => embaralharDiferente(seq.passos.map((_, i) => i)), [seq]);
  const fim = colocados.length === seq.passos.length;

  useEffect(() => { setColocados([]); setErrouNoPasso(false); }, [seq]);

  const tocar = (i: number) => {
    if (fim || colocados.includes(i)) return;
    if (falar) falarIngles(seq.passos[i]);
    if (i === colocados.length) {
      somAcerto();
      if (!errouNoPasso) acertos.current += 1;
      setErrouNoPasso(false);
      setColocados(c => [...c, i]);
    } else {
      somErro();
      setErrouNoPasso(true);
      setErrado(i);
      window.setTimeout(() => setErrado(null), 500);
    }
  };
  const seguir = () => {
    if (k + 1 < fases[f].length) { setK(k + 1); return; }
    if (f + 1 < fases.length) { setAviso(`Fase ${f + 2}!`); window.setTimeout(() => { setAviso(null); setK(0); setF(f + 1); }, 900); return; }
    onFim({ acertos: acertos.current, total });
  };

  return (
    <MolduraJogo nivel={nivel} nome={nome} tipo="Coloque em ordem" instrucao={falar ? 'Ouça e toque as instruções na ordem da receita.' : 'Toque os cartões na ordem em que acontecem.'} fase={f + 1} fases={fases.length}
      extra={<span className="ml-auto font-display text-sm">{seq.titulo}</span>} onVoltar={onVoltar}>
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 short:gap-2">
        {aviso && <AvisoFase texto={aviso} />}
        <div className="flex flex-col gap-2 short:gap-1" aria-label="Cartões">
          {ordem.map(i => (
            <button key={`c${f}-${k}-${i}`} type="button" disabled={colocados.includes(i)} onClick={() => tocar(i)}
              className={`text-left px-3 py-2.5 short:py-1 rounded-xl border-2 font-semibold text-base short:text-sm shadow-[0_4px_0_0_#E7D3A6] transition-all
                ${colocados.includes(i) ? 'opacity-30 bg-nisia-papel border-nisia-papel-linha' : errado === i ? 'bg-red-50 border-nisia-erro animate-shake-wrong' : 'bg-nisia-papel border-nisia-papel-linha hover:-translate-y-0.5'}`}>
              {seq.passos[i]}
            </button>
          ))}
        </div>
        <Painel tipo="papel" liso className="px-3 py-2 short:py-1 flex flex-col gap-1.5 short:gap-1" aria-label="Sua sequência">
          {seq.passos.map((_, pos) => (
            <div key={pos} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 short:py-0.5 border-2 ${pos < colocados.length ? 'border-nisia-verde-500 bg-nisia-verde-100' : 'border-dashed border-nisia-papel-linha'}`}>
              <span className="w-7 h-7 short:w-5 short:h-5 rounded-full bg-nisia-azul-500 text-white font-display flex items-center justify-center text-sm shrink-0">{pos + 1}</span>
              <span className="text-sm sm:text-base short:text-xs font-semibold">{pos < colocados.length ? seq.passos[colocados[pos]] : ''}</span>
            </div>
          ))}
        </Painel>
      </div>
      {fim && (
        <div className="flex justify-center animate-rise-in" role="status">
          <BotaoJogo cor="laranja" onClick={seguir} autoFocus>Sequência completa! Próxima <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
        </div>
      )}
    </MolduraJogo>
  );
};
