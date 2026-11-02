import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BotaoJogo, Icone, Painel } from '../../components/kit';
import { AvisoFase, embaralharDiferente, falarIngles, MolduraJogo, somAcerto, somErro, type FimDeJogo } from './comum';

// Monte a frase (inspirado no Tetris de palavras): os blocos chegam embaralhados e o aluno encaixa na ordem.
// As frases ficam mais longas a cada fase. Acerto de primeira vale ponto; errou, vê a frase certa e segue.
interface Props { nivel: number; nome: string; fases: string[][]; onFim: (r: FimDeJogo) => void; onVoltar: () => void }

const blocos = (frase: string) => frase.split(' ');

export const FraseJogo: React.FC<Props> = ({ nivel, nome, fases, onFim, onVoltar }) => {
  const [f, setF] = useState(0);
  const [k, setK] = useState(0);
  const [montada, setMontada] = useState<number[]>([]);
  const [estado, setEstado] = useState<'montando' | 'certo' | 'errado'>('montando');
  const [aviso, setAviso] = useState<string | null>(null);
  const acertos = useRef(0);
  const total = useMemo(() => fases.reduce((s, x) => s + x.length, 0), [fases]);
  const frase = fases[f][k];
  const palavras = useMemo(() => blocos(frase), [frase]);
  const ordem = useMemo(() => embaralharDiferente(palavras.map((_, i) => i)), [palavras]);

  useEffect(() => { setMontada([]); setEstado('montando'); }, [frase]);

  const conferir = () => {
    const resposta = montada.map(i => palavras[i]).join(' ');
    if (resposta === frase) { somAcerto(); acertos.current += 1; setEstado('certo'); }
    else { somErro(); setEstado('errado'); }
    falarIngles(frase);
  };
  const seguir = () => {
    if (k + 1 < fases[f].length) { setK(k + 1); return; }
    if (f + 1 < fases.length) { setAviso(`Fase ${f + 2}!`); window.setTimeout(() => { setAviso(null); setK(0); setF(f + 1); }, 900); return; }
    onFim({ acertos: acertos.current, total });
  };

  const completa = montada.length === palavras.length;
  return (
    <MolduraJogo nivel={nivel} nome={nome} tipo="Monte a frase" instrucao="Toque as palavras na ordem certa. Toque de novo para tirar." fase={f + 1} fases={fases.length}
      extra={<span className="ml-auto font-display text-sm">Frase {k + 1} de {fases[f].length}</span>} onVoltar={onVoltar}>
      <div className="relative flex flex-col gap-3 short:gap-1.5">
        {aviso && <AvisoFase texto={aviso} />}
        <Painel tipo="papel" liso className={`min-h-[4.5rem] short:min-h-[2.8rem] px-3 py-3 short:py-1.5 flex flex-wrap items-center gap-2 border-2 border-dashed ${estado === 'certo' ? 'border-nisia-verde-500' : estado === 'errado' ? 'border-nisia-erro' : 'border-nisia-papel-linha'}`} aria-label="Sua frase">
          {montada.length === 0 && <span className="text-nisia-tinta-suave text-sm">Toque as palavras abaixo…</span>}
          {montada.map((i, pos) => (
            <button key={`m${pos}`} type="button" disabled={estado !== 'montando'} onClick={() => setMontada(m => m.filter((_, j) => j !== pos))}
              className="px-3 py-1.5 short:py-1 rounded-lg bg-nisia-azul-500 text-white font-display text-lg short:text-base shadow-[0_3px_0_0_#0C2A66]">{palavras[i]}</button>
          ))}
        </Painel>
        <div className="flex flex-wrap justify-center gap-2 min-h-[3rem]">
          {ordem.map(i => montada.includes(i) ? null : (
            <button key={`b${i}`} type="button" disabled={estado !== 'montando'} onClick={() => setMontada(m => [...m, i])}
              className="px-3 py-2 short:py-1 rounded-lg bg-gradient-to-b from-nisia-sol-300 to-nisia-sol-500 border-2 border-nisia-sol-700 text-nisia-tinta font-display text-lg short:text-base shadow-[0_4px_0_0_#B36E00] hover:-translate-y-0.5 transition-transform">{palavras[i]}</button>
          ))}
        </div>
        {estado === 'montando' ? (
          <div className="flex justify-center gap-3">
            <BotaoJogo cor="papel" tamanho="sm" onClick={() => setMontada([])} disabled={!montada.length}>Limpar</BotaoJogo>
            <BotaoJogo cor="verde" onClick={conferir} disabled={!completa}><Icone nome="check" className="w-5 h-5" /> Conferir</BotaoJogo>
          </div>
        ) : (
          <Painel tipo="papel" liso className="px-4 py-3 short:py-2 flex flex-col sm:flex-row items-center justify-between gap-3 animate-rise-in" role="status">
            <p className={`font-display text-lg ${estado === 'certo' ? 'text-nisia-verde-700' : 'text-nisia-erro'}`}>
              {estado === 'certo' ? 'Frase certa! +100' : <>Quase! A frase certa é: <span className="text-nisia-tinta">“{frase}”</span></>}
            </p>
            <BotaoJogo cor="laranja" onClick={seguir} autoFocus>Próxima <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
          </Painel>
        )}
      </div>
    </MolduraJogo>
  );
};
