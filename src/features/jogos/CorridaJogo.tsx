import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ItemRodada } from '../../data/rodadasFases';
import { useGame } from '../../context/GameContext';
import { PlayerAvatar } from '../../components/ui/PlayerAvatar';
import { ANFITRIOES, Icone } from '../../components/kit';
import { AvisoFase, embaralhar, falarIngles, MolduraJogo, modoCalmo, somAcerto, somErro, type FimDeJogo } from './comum';
import { audioService } from '../../services/audio';

// Corrida contra o Zé (revisão): cada resposta certa é um passo seu; o Zé dá um passo a cada poucos segundos.
// Quem cruzar a faixa primeiro vence a fase. As fases têm mais perguntas e o Zé fica mais rápido.
interface Props { nivel: number; nome: string; fases: ItemRodada[][]; onFim: (r: FimDeJogo) => void; onVoltar: () => void }

const PASSO_ZE_S = [10, 8, 6.5];

export const CorridaJogo: React.FC<Props> = ({ nivel, nome, fases, onFim, onVoltar }) => {
  const { currentPlayer } = useGame();
  const [f, setF] = useState(0);
  const [k, setK] = useState(0);
  const [eu, setEu] = useState(0);
  const [ze, setZe] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [vitorias, setVitorias] = useState(0);
  const acertos = useRef(0);
  const total = useMemo(() => fases.reduce((s, x) => s + x.length, 0), [fases]);
  const itens = fases[f];
  const meta = itens.length;
  const item = itens[k];
  const ordem = useMemo(() => embaralhar(item.options.map((_, i) => i)), [item]);
  const fimFase = useRef(false);

  useEffect(() => { setEu(0); setZe(0); setK(0); fimFase.current = false; }, [f]);
  useEffect(() => { setEscolha(null); if (item.ouvir) falarIngles(item.ouvir); }, [item]);

  // O Zé corre sozinho
  useEffect(() => {
    if (aviso) return;
    const s = PASSO_ZE_S[Math.min(f, PASSO_ZE_S.length - 1)] * (modoCalmo() ? 1.8 : 1);
    const t = window.setInterval(() => setZe(z => Math.min(meta, z + 1)), s * 1000);
    return () => window.clearInterval(t);
  }, [f, meta, aviso]);

  const terminarFase = (venceu: boolean) => {
    if (fimFase.current) return;
    fimFase.current = true;
    if (venceu) setVitorias(v => v + 1);
    const ultima = f + 1 >= fases.length;
    setAviso(venceu ? 'Você chegou primeiro!' : 'O Zé chegou primeiro!');
    window.setTimeout(() => {
      setAviso(null);
      if (ultima) onFim({ acertos: acertos.current, total, detalhes: { vitorias: vitorias + (venceu ? 1 : 0) } });
      else setF(f + 1);
    }, 1300);
  };
  useEffect(() => { if (ze >= meta && !fimFase.current) terminarFase(false); }, [ze]); // eslint-disable-line react-hooks/exhaustive-deps

  const responder = (orig: number) => {
    if (escolha !== null || fimFase.current) return;
    audioService.playClick();
    setEscolha(orig);
    const certo = orig === item.answer;
    if (certo) { somAcerto(); acertos.current += 1; } else somErro();
    const novoEu = certo ? eu + 1 : eu;
    if (certo) setEu(novoEu);
    window.setTimeout(() => {
      if (novoEu >= meta) { terminarFase(true); return; }
      if (k + 1 < itens.length) setK(k + 1);
      else terminarFase(novoEu > ze);
    }, certo ? 600 : 1400);
  };

  const pos = (n: number) => `calc(${(n / meta) * 86}% + 0.25rem)`;
  return (
    <MolduraJogo nivel={nivel} nome={nome} tipo="Corrida contra o Zé" instrucao="Cada resposta certa é um passo. Chegue antes do Zé!" fase={f + 1} fases={fases.length}
      extra={<span className="ml-auto inline-flex items-center gap-1 font-display text-sm"><Icone nome="trofeu" className="w-4 h-4" cor="#FFD23F" /> {vitorias} vitórias</span>} onVoltar={onVoltar}>
      <div className="relative rounded-xl border-[3px] border-nisia-madeira-escura bg-nisia-verde-400 overflow-hidden" aria-label={`Você: ${eu} de ${meta} passos. Zé: ${ze} de ${meta}.`}>
        {aviso && <AvisoFase texto={aviso} />}
        {[0, 1].map(raia => (
          <div key={raia} className={`relative h-14 short:h-10 ${raia === 0 ? 'border-b-2 border-dashed border-white/70' : ''}`}>
            <div className="absolute right-[8%] inset-y-0 w-3 bg-[repeating-linear-gradient(0deg,#1A2A4A_0_8px,#fff_8px_16px)]" aria-hidden="true" />
            <div className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-300" style={{ left: pos(raia === 0 ? eu : ze) }}>
              {raia === 0
                ? (currentPlayer ? <PlayerAvatar avatarId={currentPlayer.avatar} skinTone={currentPlayer.skinTone} size="sm" className="border-2 border-white" /> : <span className="font-display text-white">Você</span>)
                : <img src={ANFITRIOES.ze.src} alt="Zé Cartinha" className="h-12 short:h-9 w-auto" />}
            </div>
          </div>
        ))}
      </div>
      <div className="kit-papel rounded-xl px-3 py-2 short:py-1 text-center">
        <p className="font-display text-xl sm:text-2xl short:text-base text-nisia-azul-700 leading-tight">{item.prompt}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 short:gap-1">
        {ordem.map(orig => (
          <button key={`${f}-${k}-${orig}`} type="button" disabled={escolha !== null} onClick={() => responder(orig)}
            className={`text-left px-3 py-2.5 short:py-1 rounded-xl border-2 font-semibold text-base short:text-sm shadow-[0_4px_0_0_#E7D3A6]
              ${escolha !== null && orig === item.answer ? 'bg-nisia-verde-100 border-nisia-verde-500' : escolha === orig ? 'bg-red-50 border-nisia-erro' : 'bg-nisia-papel border-nisia-papel-linha hover:-translate-y-0.5'}`}>
            {item.options[orig]}
          </button>
        ))}
      </div>
    </MolduraJogo>
  );
};
