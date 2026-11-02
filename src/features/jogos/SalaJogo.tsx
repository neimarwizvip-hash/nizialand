import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AlvoSala, OrdemSala } from '../../data/jogosFases';
import { BotaoJogo, Icone } from '../../components/kit';
import { AvisoFase, falarIngles, MolduraJogo, somAcerto, somErro, type FimDeJogo } from './comum';

// Monte a sala (inspirado em jogos de construir): ouça a instrução em inglês e toque o lugar certo da sala.
// Os objetos ficam onde o aluno acertou; a sala vai se montando fase a fase.
interface Props { nivel: number; nome: string; fases: OrdemSala[][]; onFim: (r: FimDeJogo) => void; onVoltar: () => void }

// Zonas clicáveis da sala (viewBox 800 × 450) e onde o objeto aparece.
const ZONAS: Record<AlvoSala, { x: number; y: number; w: number; h: number; rotulo: string; obj: [number, number] }> = {
  'atras-porta': { x: 20, y: 150, w: 70, h: 180, rotulo: 'atrás da porta', obj: [52, 300] },
  'entre-porta-quadro': { x: 160, y: 140, w: 80, h: 190, rotulo: 'entre a porta e o quadro', obj: [200, 300] },
  'na-estante': { x: 552, y: 92, w: 96, h: 40, rotulo: 'na estante', obj: [600, 112] },
  'na-mesa': { x: 318, y: 228, w: 164, h: 28, rotulo: 'em cima da mesa', obj: [400, 236] },
  'embaixo-mesa': { x: 330, y: 262, w: 140, h: 62, rotulo: 'embaixo da mesa', obj: [400, 300] },
  'na-frente-quadro': { x: 255, y: 335, w: 290, h: 80, rotulo: 'na frente do quadro', obj: [400, 380] },
  'perto-janela': { x: 640, y: 245, w: 120, h: 120, rotulo: 'perto da janela', obj: [700, 320] },
  'no-canto': { x: 700, y: 375, w: 100, h: 75, rotulo: 'no canto', obj: [752, 418] },
};

export const SalaJogo: React.FC<Props> = ({ nivel, nome, fases, onFim, onVoltar }) => {
  const [f, setF] = useState(0);
  const [k, setK] = useState(0);
  const [colocados, setColocados] = useState<Array<{ alvo: AlvoSala; objeto: string }>>([]);
  const [resposta, setResposta] = useState<null | { alvo: AlvoSala; certo: boolean }>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const acertos = useRef(0);
  const total = useMemo(() => fases.reduce((s, x) => s + x.length, 0), [fases]);
  const ordem = fases[f][k];

  useEffect(() => { setResposta(null); falarIngles(ordem.instrucao); }, [ordem]);

  const escolher = (alvo: AlvoSala) => {
    if (resposta) return;
    const certo = alvo === ordem.alvo;
    setResposta({ alvo, certo });
    if (certo) { somAcerto(); acertos.current += 1; } else somErro();
    setColocados(c => [...c, { alvo: ordem.alvo, objeto: ordem.objeto }]);
  };
  const seguir = () => {
    if (k + 1 < fases[f].length) { setK(k + 1); return; }
    if (f + 1 < fases.length) { setAviso(`Fase ${f + 2}!`); window.setTimeout(() => { setAviso(null); setK(0); setF(f + 1); }, 900); return; }
    onFim({ acertos: acertos.current, total });
  };

  return (
    <MolduraJogo nivel={nivel} nome={nome} tipo="Monte a sala" instrucao="Ouça a instrução e toque o lugar certo da sala." fase={f + 1} fases={fases.length}
      extra={<span className="ml-auto font-display text-sm">Ordem {k + 1} de {fases[f].length}</span>} onVoltar={onVoltar}>
      <div className="kit-papel rounded-xl px-3 py-2 short:py-1 flex items-center justify-center gap-3">
        <span className="text-3xl short:text-xl" aria-hidden="true">{ordem.objeto}</span>
        <p className="font-display text-xl sm:text-2xl short:text-base text-nisia-azul-700 leading-tight">“{ordem.instrucao}”</p>
        <button type="button" onClick={() => falarIngles(ordem.instrucao)} className="kit-btn kit-btn--azul !min-h-0 !py-1 !px-3 text-sm" aria-label="Ouvir a instrução">
          <Icone nome="orelha" className="w-5 h-5" cor="currentColor" />
        </button>
      </div>
      <div className="relative">
        {aviso && <AvisoFase texto={aviso} />}
        <svg viewBox="0 0 800 450" className="w-full h-auto max-h-[22rem] short:max-h-[11rem] rounded-xl border-[3px] border-nisia-madeira-escura bg-[#F6E7C8]" role="group" aria-label="Sala de aula">
          {/* parede e piso */}
          <rect x="0" y="0" width="800" height="330" fill="#F3E4BE" />
          <rect x="0" y="300" width="800" height="30" fill="#E0C98F" />
          <rect x="0" y="330" width="800" height="120" fill="#C98A4B" />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 100} y1="330" x2={i * 100 - 40} y2="450" stroke="#B87A3E" strokeWidth="2" />)}
          {/* porta */}
          <rect x="40" y="110" width="110" height="220" fill="#1F5FD0" stroke="#143F97" strokeWidth="5" />
          <circle cx="135" cy="225" r="6" fill="#FFD23F" />
          {/* quadro */}
          <rect x="250" y="60" width="300" height="140" rx="6" fill="#2F6B57" stroke="#8A5A2B" strokeWidth="10" />
          <text x="400" y="140" textAnchor="middle" fontSize="34" fill="#F5F1E6" fontFamily="Fredoka, sans-serif">Hello!</text>
          {/* estante */}
          <rect x="552" y="130" width="96" height="10" fill="#8A5A2B" />
          <rect x="560" y="140" width="6" height="18" fill="#8A5A2B" /><rect x="634" y="140" width="6" height="18" fill="#8A5A2B" />
          {/* janela */}
          <rect x="660" y="80" width="110" height="150" fill="#A9CDFF" stroke="#FFF6DF" strokeWidth="8" />
          <line x1="715" y1="80" x2="715" y2="230" stroke="#FFF6DF" strokeWidth="6" /><line x1="660" y1="155" x2="770" y2="155" stroke="#FFF6DF" strokeWidth="6" />
          {/* mesa do professor */}
          <rect x="315" y="250" width="170" height="14" rx="3" fill="#8A5A2B" />
          <rect x="325" y="264" width="10" height="66" fill="#8A5A2B" /><rect x="465" y="264" width="10" height="66" fill="#8A5A2B" />
          {/* objetos já colocados */}
          {colocados.map((c, i) => (
            <text key={i} x={ZONAS[c.alvo].obj[0] + (i % 3) * 6 - 6} y={ZONAS[c.alvo].obj[1]} textAnchor="middle" dominantBaseline="middle" fontSize="40">{c.objeto}</text>
          ))}
          {/* zonas clicáveis */}
          {(Object.keys(ZONAS) as AlvoSala[]).map(alvo => {
            const z = ZONAS[alvo];
            const marcada = resposta && (alvo === ordem.alvo || alvo === resposta.alvo);
            const cor = !marcada ? 'transparent' : alvo === ordem.alvo ? 'rgba(63,163,77,0.35)' : 'rgba(229,72,77,0.35)';
            return (
              <g key={alvo} role="button" tabIndex={resposta ? -1 : 0} aria-label={z.rotulo} className="cursor-pointer focus:outline-none [&:focus-visible>rect]:stroke-[#1F5FD0] [&:hover>rect]:stroke-[#1F5FD0]"
                onClick={() => escolher(alvo)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); escolher(alvo); } }}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="10" fill={cor} stroke="transparent" strokeWidth="4" strokeDasharray="10 6" />
              </g>
            );
          })}
        </svg>
      </div>
      {resposta && (
        <div className="kit-papel rounded-xl px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 animate-rise-in" role="status">
          <p className={`font-display text-lg ${resposta.certo ? 'text-nisia-verde-700' : 'text-nisia-erro'}`}>
            {resposta.certo ? 'Lugar certo! +100' : `Era ${ZONAS[ordem.alvo].rotulo}.`}
          </p>
          <BotaoJogo cor="laranja" onClick={seguir} autoFocus>Próxima <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
        </div>
      )}
    </MolduraJogo>
  );
};
