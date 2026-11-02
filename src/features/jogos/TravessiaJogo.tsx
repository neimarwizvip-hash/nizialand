import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ItemRodada } from '../../data/rodadasFases';
import { useGame } from '../../context/GameContext';
import { PlayerAvatar } from '../../components/ui/PlayerAvatar';
import { AvisoFase, embaralhar, falarIngles, MolduraJogo, somAcerto, somErro, type FimDeJogo } from './comum';
import { audioService } from '../../services/audio';

// Travessia do corredor (inspirada no Frogger): cada faixa é uma pergunta; só a pedra certa aguenta o pulo.
// Errou, a pedra afunda e custa uma vida. Três faixas por fase.
interface Props { nivel: number; nome: string; fases: ItemRodada[][]; onFim: (r: FimDeJogo) => void; onVoltar: () => void }

export const TravessiaJogo: React.FC<Props> = ({ nivel, nome, fases, onFim, onVoltar }) => {
  const { currentPlayer } = useGame();
  const [f, setF] = useState(0);
  const [k, setK] = useState(0); // faixa atual (0 = a de baixo)
  const [vidas, setVidas] = useState(3);
  const [afundou, setAfundou] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const acertos = useRef(0);
  const vidasRef = useRef(3);
  const errouAqui = useRef(false);
  const total = useMemo(() => fases.reduce((s, x) => s + x.length, 0), [fases]);
  const faixas = fases[f];
  const item = faixas[k];
  const ordens = useMemo(() => faixas.map(it => embaralhar(it.options.map((_, i) => i))), [faixas]);

  useEffect(() => { errouAqui.current = false; if (item?.ouvir) falarIngles(item.ouvir); }, [item]);

  const pisar = (orig: number) => {
    audioService.playClick();
    if (orig === item.answer) {
      somAcerto();
      if (!errouAqui.current) acertos.current += 1;
      if (k + 1 < faixas.length) { window.setTimeout(() => setK(k + 1), 350); return; }
      if (f + 1 < fases.length) { setAviso(`Atravessou! Fase ${f + 2}`); window.setTimeout(() => { setAviso(null); setK(0); setF(f + 1); }, 1100); return; }
      window.setTimeout(() => onFim({ acertos: acertos.current, total }), 700);
    } else {
      somErro();
      errouAqui.current = true;
      setAfundou(orig);
      vidasRef.current -= 1; setVidas(vidasRef.current);
      window.setTimeout(() => setAfundou(null), 700);
      if (vidasRef.current <= 0) window.setTimeout(() => onFim({ acertos: acertos.current, total }), 900);
    }
  };

  return (
    <MolduraJogo nivel={nivel} nome={nome} tipo="Travessia do corredor" instrucao="Pise só na pedra com a resposta certa." fase={f + 1} fases={fases.length} vidas={vidas} onVoltar={onVoltar}>
      <div className="kit-papel rounded-xl px-3 py-2 short:py-1 text-center">
        <p className="font-display text-xl sm:text-2xl short:text-base text-nisia-azul-700 leading-tight">{item?.prompt}</p>
      </div>
      <div className="relative rounded-xl overflow-hidden border-[3px] border-nisia-madeira-escura flex flex-col-reverse">
        {aviso && <AvisoFase texto={aviso} />}
        {/* Margem de partida */}
        <div className="h-14 short:h-8 bg-nisia-cortica flex items-center justify-center relative">
          {k === 0 && currentPlayer && <PlayerAvatar avatarId={currentPlayer.avatar} skinTone={currentPlayer.skinTone} size="sm" className="border-2 border-white" />}
          <span className="absolute left-2 text-xs font-bold text-nisia-tinta/70">Partida</span>
        </div>
        {faixas.map((it, idx) => {
          const ativa = idx === k;
          return (
            <div key={`${f}-${idx}`} className={`h-20 short:h-10 flex items-center justify-around gap-2 px-2 relative ${ativa ? 'bg-nisia-azul-400' : idx < k ? 'bg-nisia-azul-500/70' : 'bg-nisia-azul-700/80'}`}>
              {idx < k && currentPlayer && idx === k - 1 && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 animate-bounce-slight"><PlayerAvatar avatarId={currentPlayer.avatar} skinTone={currentPlayer.skinTone} size="sm" className="border-2 border-white" /></span>
              )}
              {ordens[idx].map(orig => (
                <button key={orig} type="button" disabled={!ativa} onClick={() => pisar(orig)}
                  className={`min-w-[22%] max-w-[32%] px-2 py-2 short:py-1 rounded-[40%] border-[3px] font-display text-sm sm:text-base short:text-xs leading-tight shadow-[0_5px_0_0_rgba(0,0,0,0.3)] transition-all
                    ${!ativa ? 'bg-nisia-papel-escuro/50 border-nisia-madeira-escura text-transparent' : afundou === orig ? 'bg-nisia-erro border-red-800 text-white translate-y-2 opacity-60' : 'bg-nisia-papel border-nisia-madeira-escura text-nisia-tinta hover:-translate-y-0.5'}`}>
                  {ativa ? it.options[orig] : '•'}
                </button>
              ))}
            </div>
          );
        })}
        <div className="h-10 short:h-6 bg-nisia-verde-500 flex items-center justify-center text-white font-display text-sm">Chegada</div>
      </div>
    </MolduraJogo>
  );
};
