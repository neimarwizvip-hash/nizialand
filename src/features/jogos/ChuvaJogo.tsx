import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ItemRodada } from '../../data/rodadasFases';
import { ANFITRIOES } from '../../components/kit';
import { AvisoFase, embaralhar, falarIngles, MolduraJogo, modoCalmo, somAcerto, somErro, type FimDeJogo } from './comum';
import { audioService } from '../../services/audio';

// Chuva de palavras (Ataque das distrações): o Zé joga as respostas lá de cima; derrube a certa antes que ela
// chegue ao chão. Errar ou deixar a certa cair custa uma vida. Cada fase cai mais rápido.
interface Props { nivel: number; nome: string; fases: ItemRodada[][]; onFim: (r: FimDeJogo) => void; onVoltar: () => void }

const QUEDA_S = [9, 7, 5.5]; // segundos para cair, por fase

export const ChuvaJogo: React.FC<Props> = ({ nivel, nome, fases, onFim, onVoltar }) => {
  const [f, setF] = useState(0);
  const [k, setK] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [resolvido, setResolvido] = useState<null | 'certo' | 'errado' | 'caiu'>(null);
  const [clicado, setClicado] = useState<number | null>(null);
  const [caindo, setCaindo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const acertos = useRef(0);
  const vidasRef = useRef(3);
  const total = useMemo(() => fases.reduce((s, x) => s + x.length, 0), [fases]);
  const item = fases[f][k];
  const ordem = useMemo(() => embaralhar(item.options.map((_, i) => i)), [item]);
  const posicoes = useMemo(() => ordem.map((_, i) => 6 + (i * 88) / Math.max(1, ordem.length) + Math.random() * 6), [ordem]);
  const atraso = useMemo(() => ordem.map(() => Math.random() * 0.8), [ordem]);
  const duracao = QUEDA_S[Math.min(f, QUEDA_S.length - 1)] * (modoCalmo() ? 1.6 : 1);

  useEffect(() => {
    setResolvido(null); setClicado(null); setCaindo(false);
    if (item.ouvir) falarIngles(item.ouvir);
    const t = window.requestAnimationFrame(() => window.requestAnimationFrame(() => setCaindo(true)));
    return () => window.cancelAnimationFrame(t);
  }, [item]);

  const perderVida = () => { vidasRef.current = Math.max(0, vidasRef.current - 1); setVidas(vidasRef.current); };
  const avancar = () => {
    if (vidasRef.current <= 0) { onFim({ acertos: acertos.current, total }); return; }
    if (k + 1 < fases[f].length) { setK(k + 1); return; }
    if (f + 1 < fases.length) { setAviso(`Fase ${f + 2}: mais rápido!`); window.setTimeout(() => { setAviso(null); setK(0); setF(f + 1); }, 1100); return; }
    onFim({ acertos: acertos.current, total });
  };
  const resolver = (r: 'certo' | 'errado' | 'caiu', i: number | null) => {
    if (resolvido) return;
    setResolvido(r); setClicado(i);
    if (r === 'certo') { somAcerto(); acertos.current += 1; }
    else { somErro(); perderVida(); }
    window.setTimeout(avancar, r === 'certo' ? 700 : 1600);
  };

  return (
    <MolduraJogo nivel={nivel} nome={nome} tipo="Chuva de palavras" instrucao="Derrube a resposta certa antes que ela chegue ao chão." fase={f + 1} fases={fases.length} vidas={vidas}
      extra={<span className="ml-auto font-display text-sm">{acertos.current} certas</span>} onVoltar={onVoltar}>
      <div className="kit-papel rounded-xl px-3 py-2 short:py-1 text-center">
        <p className="font-display text-xl sm:text-2xl short:text-base text-nisia-azul-700 leading-tight">{item.prompt}</p>
      </div>
      <div className="relative h-[19rem] short:h-[10.5rem] rounded-xl overflow-hidden border-[3px] border-nisia-madeira-escura bg-gradient-to-b from-nisia-azul-200 via-nisia-azul-100 to-nisia-verde-100" aria-live="polite">
        {aviso && <AvisoFase texto={aviso} />}
        <img src={ANFITRIOES.ze.src} alt="Zé Cartinha jogando as palavras" className="absolute right-2 top-1 h-16 short:h-10 w-auto drop-shadow" />
        <div className="absolute bottom-0 inset-x-0 h-4 bg-nisia-verde-500/70" aria-hidden="true" />
        {ordem.map((orig, i) => {
          const certa = orig === item.answer;
          const sumir = resolvido && !certa && clicado !== i;
          return (
            <button key={`${f}-${k}-${orig}`} type="button" disabled={!!resolvido}
              onClick={() => { audioService.playClick(); resolver(certa ? 'certo' : 'errado', i); }}
              onTransitionEnd={e => { if (e.propertyName === 'top' && certa && !resolvido) resolver('caiu', null); }}
              className={`absolute -translate-x-1/2 max-w-[44%] px-3 py-2 short:py-1 rounded-2xl border-[3px] font-display text-base sm:text-lg short:text-sm leading-tight shadow-[0_4px_0_0_rgba(26,42,74,0.3)]
                ${resolvido && certa ? 'bg-nisia-verde-500 border-nisia-verde-700 text-white scale-110' : clicado === i ? 'bg-nisia-erro border-red-800 text-white animate-shake-wrong' : 'bg-nisia-papel border-nisia-sol-700 text-nisia-tinta hover:scale-105'} ${sumir ? 'opacity-0' : ''}`}
              style={{
                left: `${posicoes[i]}%`,
                top: resolvido ? undefined : caindo ? 'calc(100% - 3.2rem)' : '-3rem',
                transition: resolvido ? 'opacity 0.3s' : `top ${duracao}s linear ${atraso[i]}s`,
              }}>
              {item.options[orig]}
            </button>
          );
        })}
        {resolvido && resolvido !== 'certo' && (
          <p className="absolute bottom-6 inset-x-0 text-center font-display text-lg short:text-sm text-nisia-erro drop-shadow-[0_1px_0_#fff]" role="status">
            {resolvido === 'caiu' ? 'Caiu no chão!' : 'Essa não!'} A certa: {item.options[item.answer]}
          </p>
        )}
      </div>
    </MolduraJogo>
  );
};
