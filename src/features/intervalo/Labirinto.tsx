import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BotaoJogo, Estrelas, Icone, Painel } from '../../components/kit';
import { audioService } from '../../services/audio';
import { narrar } from '../../services/narracao';
import { LUGARES } from '../../data/frasesIntervalo';
import { calmo, Cruzeta, desenharAluno, imagemDoAvatar, PASSO, useDirecoes, type Direcao } from './grade';

// LABIRINTO DA ESCOLA (intervalo do Nível 4): ouça o destino em inglês ("Go to the library!") e ache a porta certa
// no labirinto de corredores antes do tempo acabar. Porta errada custa 5 segundos. Três rodadas, labirintos maiores.

interface Props { avatar?: string; onFim: (r: { pontos: number }) => void; onSair: () => void }

const RODADAS = [{ c: 7, l: 5, tempo: 45 }, { c: 9, l: 6, tempo: 50 }, { c: 11, l: 7, tempo: 55 }];

interface Lab { c: number; l: number; paredes: boolean[][][]; portas: Array<{ x: number; y: number; lugar: number }>; alvo: number }

// Labirinto perfeito (busca em profundidade). paredes[y][x] = [cima, dir, baixo, esq]
function gerar(c: number, l: number): Lab {
  const paredes = Array.from({ length: l }, () => Array.from({ length: c }, () => [true, true, true, true]));
  const visto = Array.from({ length: l }, () => Array(c).fill(false));
  const pilha: Array<[number, number]> = [[0, 0]]; visto[0][0] = true;
  const viz: Array<[number, number, number, number]> = [[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]];
  while (pilha.length) {
    const [x, y] = pilha[pilha.length - 1];
    const op = viz.filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < c && ny < l && !visto[ny][nx]; });
    if (!op.length) { pilha.pop(); continue; }
    const [dx, dy, p, q] = op[Math.floor(Math.random() * op.length)];
    paredes[y][x][p] = false; paredes[y + dy][x + dx][q] = false; visto[y + dy][x + dx] = true; pilha.push([x + dx, y + dy]);
  }
  // portas: becos sem saída longe da largada
  const becos: Array<[number, number]> = [];
  for (let y = 0; y < l; y++) for (let x = 0; x < c; x++) if ((x + y) > 3 && paredes[y][x].filter(Boolean).length === 3) becos.push([x, y]);
  becos.sort(() => Math.random() - 0.5);
  const lugares = [...LUGARES.keys()].sort(() => Math.random() - 0.5);
  const portas = becos.slice(0, 4).map(([x, y], i) => ({ x, y, lugar: lugares[i] }));
  return { c, l, paredes, portas, alvo: portas.length ? portas[Math.floor(Math.random() * portas.length)].lugar : 0 };
}

export const Labirinto: React.FC<Props> = ({ avatar, onFim, onSair }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const caixaRef = useRef<HTMLDivElement>(null);
  const [fase, setFase] = useState<'instrucoes' | 'jogando' | 'fim'>('instrucoes');
  const [rodada, setRodada] = useState(0);
  const [lab, setLab] = useState<Lab | null>(null);
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [tempo, setTempo] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [acertos, setAcertos] = useState(0);
  const img = useRef(imagemDoAvatar(avatar));
  const pontos = useRef(0);

  const iniciarRodada = useCallback((r: number) => {
    const cfg = RODADAS[r];
    const novo = gerar(cfg.c, cfg.l);
    setLab(novo); setPos([0, 0]); setTempo(Math.round(cfg.tempo * (calmo() ? 1.5 : 1))); setAviso(null);
    narrar([{ texto: LUGARES[novo.alvo].frase, idioma: 'en-US', personagem: 'professora' }]);
  }, []);

  const terminar = useCallback(() => {
    setFase('fim'); onFim({ pontos: pontos.current });
    if (pontos.current > 0) audioService.playFanfare(); else audioService.playWrong();
  }, [onFim]);

  // passagem para a próxima rodada (uma vez só, mesmo se tempo e acerto coincidirem)
  const avancando = useRef(false);
  const avancar = useCallback(() => {
    if (avancando.current) return;
    avancando.current = true;
    window.setTimeout(() => {
      avancando.current = false;
      if (rodada + 1 < RODADAS.length) { setRodada(rodada + 1); iniciarRodada(rodada + 1); } else terminar();
    }, 1300);
  }, [rodada, iniciarRodada, terminar]);

  // relógio (pausa enquanto um aviso está na tela)
  useEffect(() => {
    if (fase !== 'jogando' || !lab || aviso || avancando.current) return undefined;
    if (tempo <= 0) { audioService.playWrong(); setAviso('O tempo acabou!'); avancar(); return undefined; }
    const t = window.setTimeout(() => setTempo(s => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [tempo, fase, lab, aviso, avancar]);

  const posRef = useRef<[number, number]>([0, 0]);
  posRef.current = pos;
  const mover = useCallback((d: Direcao) => {
    if (!lab || aviso) return;
    const [x, y] = posRef.current;
    const idx = { cima: 0, dir: 1, baixo: 2, esq: 3 }[d];
    if (lab.paredes[y][x][idx]) return;
    const nx = x + PASSO[d][0], ny = y + PASSO[d][1];
    posRef.current = [nx, ny];
    setPos([nx, ny]);
    const porta = lab.portas.find(p => p.x === nx && p.y === ny);
    if (!porta) { audioService.playTick(); return; }
    if (porta.lugar === lab.alvo) {
      audioService.playCorrect(); pontos.current += 100 + tempo * 2; setAcertos(a => a + 1);
      setAviso(`Isso! ${LUGARES[porta.lugar].en}!`);
      avancar();
    } else {
      audioService.playWrong(); setTempo(s => Math.max(0, s - 5));
      setAviso(`That's the ${LUGARES[porta.lugar].en}! (−5 s)`); window.setTimeout(() => setAviso(null), 1100);
    }
  }, [lab, aviso, tempo, avancar]);
  useDirecoes(mover, fase === 'jogando');

  // desenho
  useEffect(() => {
    if (fase !== 'jogando' || !lab) return;
    const canvas = canvasRef.current!, caixa = caixaRef.current!, ctx = canvas.getContext('2d')!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = caixa.clientWidth, H = caixa.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const t = Math.floor(Math.min(W / lab.c, H / lab.l));
    const ox = (W - t * lab.c) / 2, oy = (H - t * lab.l) / 2;
    ctx.fillStyle = '#C98A4B'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#F3E4BE'; ctx.fillRect(ox, oy, t * lab.c, t * lab.l);
    ctx.strokeStyle = '#1F5FD0'; ctx.lineWidth = Math.max(4, t * 0.12); ctx.lineCap = 'round';
    for (let y = 0; y < lab.l; y++) for (let x = 0; x < lab.c; x++) {
      const [c, d, b, e] = lab.paredes[y][x]; const X = ox + x * t, Y = oy + y * t;
      ctx.beginPath();
      if (c) { ctx.moveTo(X, Y); ctx.lineTo(X + t, Y); }
      if (d) { ctx.moveTo(X + t, Y); ctx.lineTo(X + t, Y + t); }
      if (b) { ctx.moveTo(X, Y + t); ctx.lineTo(X + t, Y + t); }
      if (e) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + t); }
      ctx.stroke();
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const p of lab.portas) {
      const X = ox + p.x * t, Y = oy + p.y * t;
      ctx.fillStyle = '#FFF6DF'; ctx.fillRect(X + t * 0.12, Y + t * 0.12, t * 0.76, t * 0.76);
      ctx.font = `${t * 0.38}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; ctx.fillText(LUGARES[p.lugar].emoji, X + t / 2, Y + t * 0.42);
      ctx.fillStyle = '#143F97'; ctx.font = `700 ${Math.max(9, t * 0.15)}px Fredoka, sans-serif`; ctx.fillText(LUGARES[p.lugar].en, X + t / 2, Y + t * 0.78);
    }
    desenharAluno(ctx, img.current, ox + pos[0] * t + t / 2, oy + pos[1] * t + t / 2, t);
  }, [fase, lab, pos]);

  return (
    <Painel tipo="mural" as="section" aria-label="Labirinto da escola" className="p-3 sm:p-4 short:p-2 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="kit-placa px-5 py-1 font-display text-lg short:text-base">Intervalo · Labirinto da escola</span>
        <div className="flex items-center gap-2">
          {fase === 'jogando' && lab && <>
            <span className="kit-ficha kit-ficha--azul">Rodada {rodada + 1} de {RODADAS.length}</span>
            <span className={`kit-ficha ${tempo <= 10 ? 'kit-ficha--erro' : 'kit-ficha--sol'}`}>{tempo}s</span>
          </>}
          <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); onSair(); }}>Sair</BotaoJogo>
        </div>
      </div>
      {fase === 'instrucoes' && (
        <Painel tipo="papel" liso className="p-4 short:p-2 flex flex-col items-center gap-3 short:gap-1.5 text-center">
          <p className="font-display text-2xl short:text-lg text-nisia-azul-700">Ache a sala certa nos corredores da escola!</p>
          <div className="flex flex-wrap justify-center gap-2 text-lg" aria-hidden="true">{LUGARES.slice(0, 4).map(l => <span key={l.en} className="px-3 py-1 rounded-lg bg-white border-2 border-nisia-azul-400 font-display text-nisia-azul-700">{l.emoji} {l.en}</span>)}</div>
          <ul className="text-left text-sm sm:text-base short:text-xs max-w-xl list-disc pl-5 space-y-1">
            <li>Ouça e leia o destino em inglês: <b>“Go to the library!”</b></li>
            <li>Ande com as <b>setas</b> (ou W A S D). Porta errada: <b>−5 segundos</b>.</li>
            <li>São 3 rodadas, cada labirinto maior que o outro. Quanto mais tempo sobrar, mais pontos.</li>
          </ul>
          <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); pontos.current = 0; setAcertos(0); setRodada(0); setFase('jogando'); iniciarRodada(0); }} autoFocus><Icone nome="jogar" className="w-5 h-5" cor="currentColor" /> Começar</BotaoJogo>
        </Painel>
      )}
      {fase === 'jogando' && lab && (
        <>
          <div className="kit-papel rounded-xl px-3 py-1.5 text-center flex items-center justify-center gap-3">
            <p className="font-display text-2xl short:text-lg text-nisia-azul-700">{LUGARES[lab.alvo].emoji} {LUGARES[lab.alvo].frase}</p>
            <button type="button" className="kit-btn kit-btn--azul !min-h-0 !py-1 !px-3" aria-label="Ouvir de novo" onClick={() => narrar([{ texto: LUGARES[lab.alvo].frase, idioma: 'en-US', personagem: 'professora' }])}><Icone nome="orelha" className="w-5 h-5" cor="currentColor" /></button>
          </div>
          <div className="flex gap-3 items-center">
            <div ref={caixaRef} className="relative flex-1 h-[52vh] short:h-[56vh] max-h-[460px] rounded-xl overflow-hidden border-[4px] border-nisia-madeira-escura">
              <canvas ref={canvasRef} className="block" role="img" aria-label={`Labirinto. Destino: ${LUGARES[lab.alvo].en}. Use as setas.`} />
              {aviso && <div className="absolute inset-0 flex items-center justify-center pointer-events-none" role="status"><span className="kit-placa px-6 py-2 font-display text-2xl short:text-lg animate-balao-in">{aviso}</span></div>}
            </div>
            <div className="sm:hidden short:block"><Cruzeta onMover={mover} /></div>
          </div>
        </>
      )}
      {fase === 'fim' && (
        <Painel tipo="papel" liso className="p-5 short:p-2 flex flex-col items-center gap-2 text-center animate-rise-in" role="status">
          <p className="font-display text-3xl short:text-xl text-nisia-azul-700">{acertos === RODADAS.length ? 'Você conhece a escola!' : acertos ? 'Quase todas!' : 'Os corredores venceram desta vez!'}</p>
          <Estrelas n={acertos} />
          <p className="font-display text-xl short:text-base">{acertos} de {RODADAS.length} salas · {pontos.current} pontos</p>
          <div className="flex gap-3 mt-1">
            <BotaoJogo cor="papel" onClick={() => { pontos.current = 0; setAcertos(0); setRodada(0); setFase('jogando'); iniciarRodada(0); }}>Jogar de novo</BotaoJogo>
            <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); onSair(); }}>Voltar às atividades <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
          </div>
        </Painel>
      )}
    </Painel>
  );
};
