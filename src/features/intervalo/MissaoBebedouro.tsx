import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BotaoJogo, Estrelas, Icone, Painel, ANFITRIOES } from '../../components/kit';
import { audioService } from '../../services/audio';
import { narrar } from '../../services/narracao';
import { ETAPAS, type Etapa } from '../../data/frasesIntervalo';
import { calmo, Cruzeta, desenharAluno, imagemDoAvatar, PASSO, useDirecoes, type Direcao } from './grade';

// MISSÃO BEBEDOURO (intervalo do Nível 5): a professora deixou ir beber água. Desça a rampa até o bebedouro,
// fique lá o tempo de beber e volte para a sala antes do tempo acabar. O Zé Cartinha anda pelos corredores
// atrapalhando: encostou nele, perde 3 segundos. As placas e os comandos estão em inglês.

interface Props { avatar?: string; onFim: (r: { pontos: number }) => void; onSair: () => void }
interface Patrulha { y: number; x0: number; x1: number }


const MAPAS: Array<{ mapa: string[]; tempo: number; ze: Patrulha[]; beber: number }> = [
  { tempo: 30, beber: 3, ze: [{ y: 7, x0: 1, x1: 11 }], mapa: [
    '#############',
    '#S...#......#',
    '#.##.#.####.#',
    '#.#..#....#.#',
    '#.#.####.##.#',
    '#...#....#..#',
    '###.#.####.##',
    '#...RRRR....#',
    '#.###RR####B#',
    '#############'] },
  { tempo: 34, beber: 3, ze: [{ y: 7, x0: 1, x1: 13 }, { y: 5, x0: 1, x1: 5 }], mapa: [
    '###############',
    '#S..#.........#',
    '#.#.#.#######.#',
    '#.#...#.....#.#',
    '#.#####.###.#.#',
    '#.....#...#...#',
    '#####.###.###.#',
    '#.....RRRRR...#',
    '#.###.RRR.###.#',
    '#...#.....#..B#',
    '###############'] },
  { tempo: 40, beber: 4, ze: [{ y: 7, x0: 1, x1: 15 }, { y: 9, x0: 3, x1: 11 }, { y: 11, x0: 1, x1: 11 }], mapa: [
    '#################',
    '#S....#.........#',
    '#.###.#.#######.#',
    '#...#...#.....#.#',
    '###.#####.###.#.#',
    '#...#.....#...#.#',
    '#.###.#####.###.#',
    '#.....RRRRRR....#',
    '#.#####RRRR####.#',
    '#.#.........#...#',
    '#.#.#######.#.#B#',
    '#...........#...#',
    '#################'] },
];

const acha = (m: string[], c: string): [number, number] => { for (let y = 0; y < m.length; y++) { const x = m[y].indexOf(c); if (x >= 0) return [x, y]; } return [1, 1]; };

export const MissaoBebedouro: React.FC<Props> = ({ avatar, onFim, onSair }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const caixaRef = useRef<HTMLDivElement>(null);
  const [fase, setFase] = useState<'instrucoes' | 'jogando' | 'fim'>('instrucoes');
  const [rodada, setRodada] = useState(0);
  const [etapa, setEtapa] = useState<Etapa>('ida');
  const [pos, setPos] = useState<[number, number]>([1, 1]);
  const [tempo, setTempo] = useState(0);
  const [gole, setGole] = useState(0); // segundos bebendo
  const [aviso, setAviso] = useState<string | null>(null);
  const [zes, setZes] = useState<Array<{ x: number; y: number; dir: 1 | -1 }>>([]);
  const [concluidas, setConcluidas] = useState(0);
  const img = useRef(imagemDoAvatar(avatar));
  const zeImg = useRef<HTMLImageElement | null>(null);
  const pontos = useRef(0);
  const posRef = useRef<[number, number]>([1, 1]);
  const avancando = useRef(false);
  posRef.current = pos;
  const cfg = MAPAS[rodada];
  const lento = calmo() ? 1.5 : 1;

  useEffect(() => { const i = new Image(); i.src = ANFITRIOES.ze.src; zeImg.current = i; }, []);

  const falarEtapa = (e: Etapa) => narrar([{ texto: ETAPAS[e], idioma: 'en-US', personagem: 'professora' }]);
  const iniciarRodada = useCallback((r: number) => {
    const m = MAPAS[r];
    const s = acha(m.mapa, 'S');
    setPos(s); posRef.current = s; setEtapa('ida'); setGole(0); setAviso(null);
    setTempo(Math.round(m.tempo * lento));
    setZes(m.ze.map(p => ({ x: p.x0 + Math.floor(Math.random() * (p.x1 - p.x0)), y: p.y, dir: Math.random() < 0.5 ? 1 : -1 })));
    falarEtapa('ida');
  }, [lento]); // eslint-disable-line react-hooks/exhaustive-deps

  const terminar = useCallback(() => { setFase('fim'); onFim({ pontos: pontos.current }); if (pontos.current > 0) audioService.playFanfare(); else audioService.playWrong(); }, [onFim]);
  const avancar = useCallback(() => {
    if (avancando.current) return;
    avancando.current = true;
    window.setTimeout(() => { avancando.current = false; if (rodada + 1 < MAPAS.length) { setRodada(rodada + 1); iniciarRodada(rodada + 1); } else terminar(); }, 1400);
  }, [rodada, iniciarRodada, terminar]);

  // relógio e gole
  useEffect(() => {
    if (fase !== 'jogando' || avancando.current) return undefined;
    if (tempo <= 0) { audioService.playWrong(); setAviso('O sinal tocou! Você se atrasou.'); avancar(); return undefined; }
    const t = window.setTimeout(() => {
      setTempo(s => s - 1);
      if (etapa === 'beber') {
        setGole(g => {
          const n = g + 1;
          if (n >= cfg.beber) { audioService.playCorrect(); setEtapa('volta'); falarEtapa('volta'); }
          return n;
        });
      }
    }, 1000);
    return () => window.clearTimeout(t);
  }, [tempo, fase, etapa, cfg.beber, avancar]); // eslint-disable-line react-hooks/exhaustive-deps

  // Zé patrulhando
  useEffect(() => {
    if (fase !== 'jogando') return undefined;
    const t = window.setInterval(() => {
      setZes(lista => lista.map((z, i) => {
        const p = cfg.ze[i];
        let nx = z.x + z.dir, dir = z.dir;
        if (nx > p.x1 || nx < p.x0 || cfg.mapa[z.y][nx] === '#') { dir = (-z.dir) as 1 | -1; nx = z.x + dir; }
        return { x: nx, y: z.y, dir };
      }));
    }, 480 * lento);
    return () => window.clearInterval(t);
  }, [fase, rodada, cfg, lento]);

  // colisão com o Zé
  useEffect(() => {
    if (fase !== 'jogando' || avancando.current || aviso) return;
    if (zes.some(z => z.x === pos[0] && z.y === pos[1])) {
      audioService.playWrong(); try { navigator.vibrate?.(90); } catch { /* segue */ }
      setTempo(s => Math.max(0, s - 3)); setAviso('O Zé te distraiu! −3 s');
      if (etapa === 'beber') { setEtapa('ida'); setGole(0); }
      window.setTimeout(() => setAviso(null), 900);
    }
  }, [zes, pos, fase, aviso, etapa]);

  const mover = useCallback((d: Direcao) => {
    if (fase !== 'jogando' || avancando.current) return;
    const [x, y] = posRef.current;
    const nx = x + PASSO[d][0], ny = y + PASSO[d][1];
    const c = cfg.mapa[ny]?.[nx];
    if (!c || c === '#') return;
    posRef.current = [nx, ny]; setPos([nx, ny]);
    if (etapa === 'beber' && c !== 'B') { setEtapa('ida'); setGole(0); setAviso('Fique no bebedouro até terminar!'); window.setTimeout(() => setAviso(null), 900); return; }
    if (etapa === 'ida' && c === 'B') { setEtapa('beber'); setGole(0); falarEtapa('beber'); audioService.playChime(); return; }
    if (etapa === 'volta' && c === 'S') {
      audioService.playCorrect(); pontos.current += 100 + tempo * 3; setConcluidas(n => n + 1);
      setAviso('Voltou a tempo!'); avancar(); return;
    }
    audioService.playTick();
  }, [fase, cfg, etapa, tempo, avancar]); // eslint-disable-line react-hooks/exhaustive-deps
  useDirecoes(mover, fase === 'jogando');

  // desenho
  useEffect(() => {
    if (fase !== 'jogando') return;
    const canvas = canvasRef.current, caixa = caixaRef.current;
    if (!canvas || !caixa) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = caixa.clientWidth, H = caixa.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const m = cfg.mapa, cols = m[0].length, lins = m.length;
    const t = Math.floor(Math.min(W / cols, H / lins));
    const ox = (W - t * cols) / 2, oy = (H - t * lins) / 2;
    ctx.fillStyle = '#6CC877'; ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < lins; y++) for (let x = 0; x < cols; x++) {
      const c = m[y][x], X = ox + x * t, Y = oy + y * t;
      if (c === '#') { ctx.fillStyle = '#1F5FD0'; ctx.fillRect(X, Y, t, t); ctx.fillStyle = '#143F97'; ctx.fillRect(X, Y + t * 0.75, t, t * 0.25); continue; }
      ctx.fillStyle = c === 'R' ? '#E0A96A' : '#F3E4BE'; ctx.fillRect(X, Y, t, t);
      if (c === 'R') { ctx.strokeStyle = '#C98A4B'; ctx.lineWidth = 2; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(X, Y + (t * k) / 4); ctx.lineTo(X + t, Y + (t * k) / 4); ctx.stroke(); } }
      if (c === 'S' || c === 'B') {
        ctx.fillStyle = c === 'S' ? '#FFD23F' : '#A9CDFF'; ctx.fillRect(X + 2, Y + 2, t - 4, t - 4);
        ctx.font = `${t * 0.6}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(c === 'S' ? '🏫' : '🚰', X + t / 2, Y + t / 2);
      }
    }
    // placas em inglês
    const placa = (txt: string, cx: number, cy: number) => {
      ctx.font = `700 ${Math.max(10, t * 0.32)}px Fredoka, sans-serif`; const w = ctx.measureText(txt).width + 10;
      ctx.fillStyle = '#0C2A66'; ctx.fillRect(cx - w / 2, cy - t * 0.22, w, t * 0.44); ctx.fillStyle = '#FFD23F'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, cx, cy);
    };
    const [sx, sy] = acha(m, 'S'), [bx, by] = acha(m, 'B'), [rx, ry] = acha(m, 'R');
    placa('CLASSROOM', ox + sx * t + t * 1.2, oy + sy * t - t * 0.05 + t * 0.5 - t * 0.5);
    placa('WATER', ox + bx * t + t / 2, oy + by * t - t * 0.3);
    placa('RAMP', ox + rx * t + t, oy + ry * t - t * 0.3);
    // Zés
    for (const z of zes) {
      const X = ox + z.x * t, Y = oy + z.y * t, i = zeImg.current;
      if (i && i.complete && i.naturalWidth) { const h = t * 1.2, w = h * (i.naturalWidth / i.naturalHeight); ctx.drawImage(i, X + t / 2 - w / 2, Y + t - h, w, h); }
      else { ctx.fillStyle = '#E5484D'; ctx.beginPath(); ctx.arc(X + t / 2, Y + t / 2, t * 0.4, 0, Math.PI * 2); ctx.fill(); }
    }
    desenharAluno(ctx, img.current, ox + pos[0] * t + t / 2, oy + pos[1] * t + t / 2, t);
    // barra do gole
    if (etapa === 'beber') {
      const X = ox + bx * t, Y = oy + by * t;
      ctx.fillStyle = '#0C2A66'; ctx.fillRect(X - t * 0.3, Y - t * 0.55, t * 1.6, 8);
      ctx.fillStyle = '#4F86E8'; ctx.fillRect(X - t * 0.3, Y - t * 0.55, t * 1.6 * Math.min(1, gole / cfg.beber), 8);
    }
  }, [fase, cfg, pos, zes, etapa, gole]);

  const comecar = () => { audioService.playClick(); pontos.current = 0; setConcluidas(0); setRodada(0); setFase('jogando'); iniciarRodada(0); };

  return (
    <Painel tipo="mural" as="section" aria-label="Missão bebedouro" className="p-3 sm:p-4 short:p-2 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="kit-placa px-5 py-1 font-display text-lg short:text-base">Intervalo · Missão bebedouro</span>
        <div className="flex items-center gap-2">
          {fase === 'jogando' && <>
            <span className="kit-ficha kit-ficha--azul">Rodada {rodada + 1} de {MAPAS.length}</span>
            <span className={`kit-ficha ${tempo <= 8 ? 'kit-ficha--erro' : 'kit-ficha--sol'}`}>{tempo}s</span>
          </>}
          <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); onSair(); }}>Sair</BotaoJogo>
        </div>
      </div>
      {fase === 'instrucoes' && (
        <Painel tipo="papel" liso className="p-4 short:p-2 flex flex-col items-center gap-3 short:gap-1.5 text-center">
          <p className="font-display text-2xl short:text-lg text-nisia-azul-700">A professora deixou ir beber água. Vá e volte antes do sinal!</p>
          <p className="text-2xl" aria-hidden="true">🏫 → 🚰 → 🏫 &nbsp; cuidado com o Zé!</p>
          <ul className="text-left text-sm sm:text-base short:text-xs max-w-xl list-disc pl-5 space-y-1">
            <li>Ande com as <b>setas</b> (ou W A S D) e siga as placas em inglês: <b>RAMP</b>, <b>WATER</b>, <b>CLASSROOM</b>.</li>
            <li>No bebedouro, <b>fique parado</b> até a barra encher. Saiu antes, começa de novo.</li>
            <li>Encostou no Zé Cartinha: <b>−3 segundos</b>. São 3 rodadas, com mais Zés a cada uma.</li>
          </ul>
          <BotaoJogo cor="laranja" onClick={comecar} autoFocus><Icone nome="jogar" className="w-5 h-5" cor="currentColor" /> Começar</BotaoJogo>
        </Painel>
      )}
      {fase === 'jogando' && (
        <>
          <div className="kit-papel rounded-xl px-3 py-1.5 text-center flex items-center justify-center gap-3" aria-live="polite">
            <p className="font-display text-xl sm:text-2xl short:text-base text-nisia-azul-700">{ETAPAS[etapa]}{etapa === 'beber' ? ` (${Math.min(gole, cfg.beber)}/${cfg.beber})` : ''}</p>
            <button type="button" className="kit-btn kit-btn--azul !min-h-0 !py-1 !px-3" aria-label="Ouvir de novo" onClick={() => falarEtapa(etapa)}><Icone nome="orelha" className="w-5 h-5" cor="currentColor" /></button>
          </div>
          <div className="flex gap-3 items-center">
            <div ref={caixaRef} className="relative flex-1 h-[52vh] short:h-[56vh] max-h-[460px] rounded-xl overflow-hidden border-[4px] border-nisia-madeira-escura">
              <canvas ref={canvasRef} className="block" role="img" aria-label="Mapa da escola com a sala, a rampa e o bebedouro. Use as setas." />
              {aviso && <div className="absolute inset-0 flex items-center justify-center pointer-events-none" role="status"><span className="kit-placa px-6 py-2 font-display text-2xl short:text-lg animate-balao-in">{aviso}</span></div>}
            </div>
            <div className="sm:hidden short:block"><Cruzeta onMover={mover} /></div>
          </div>
        </>
      )}
      {fase === 'fim' && (
        <Painel tipo="papel" liso className="p-5 short:p-2 flex flex-col items-center gap-2 text-center animate-rise-in" role="status">
          <p className="font-display text-3xl short:text-xl text-nisia-azul-700">{concluidas === MAPAS.length ? 'Missão cumprida!' : concluidas ? 'Quase sempre a tempo!' : 'O Zé atrapalhou demais!'}</p>
          <Estrelas n={concluidas} />
          <p className="font-display text-xl short:text-base">{concluidas} de {MAPAS.length} voltas a tempo · {pontos.current} pontos</p>
          <div className="flex gap-3 mt-1">
            <BotaoJogo cor="papel" onClick={comecar}>Jogar de novo</BotaoJogo>
            <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); onSair(); }}>Voltar às atividades <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
          </div>
        </Painel>
      )}
    </Painel>
  );
};
