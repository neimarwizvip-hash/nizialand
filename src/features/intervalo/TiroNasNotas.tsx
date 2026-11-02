import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BotaoJogo, Icone, Painel, Estrelas } from '../../components/kit';
import { audioService } from '../../services/audio';
import { narrar } from '../../services/narracao';
import { numeroEmIngles } from './numerosIngles';

// TIRO NAS NOTAS (jogo de intervalo, estilo "aviãozinho"): as notas caem do quadro escritas em inglês.
// O aluno move o lápis (setas ou A/D) e apaga as notas que não quer (espaço). As que chegam ao chão somam.
// Meta: somar 100. Passou ou faltou, perde a diferença: nota = 100 − |100 − soma|. Abaixo de 50, REPROVADO.

interface Props { dificuldade: 1 | 2 | 3; onFim: (r: { nota: number; soma: number }) => void; onSair: () => void }

interface Carta { id: number; valor: number; texto: string; x: number; y: number; w: number; h: number; vel: number; estado: 'caindo' | 'apagada' | 'somada'; t: number }
interface Tiro { x: number; y: number }
interface Flutuante { x: number; y: number; texto: string; cor: string; t: number }

const CONFIG = {
  1: { cartas: 14, valores: [5, 10, 15, 20, 25, -5, -10], queda: 8.5, intervalo: 1.7 },
  2: { cartas: 16, valores: [7, 12, 18, 23, 31, 9, -8, -15], queda: 7, intervalo: 1.45 },
  3: { cartas: 18, valores: [13, 27, 34, 41, 16, -12, -21, 8], queda: 5.8, intervalo: 1.25 },
} as const;

// Baralho: soma positiva entre 130 % e 175 % da meta, com algumas notas negativas (do Zé).
function montarBaralho(d: 1 | 2 | 3): number[] {
  const { cartas, valores } = CONFIG[d];
  for (let t = 0; t < 200; t++) {
    const b = Array.from({ length: cartas }, () => valores[Math.floor(Math.random() * valores.length)]);
    const pos = b.filter(v => v > 0).reduce((s, v) => s + v, 0);
    const neg = b.filter(v => v < 0).length;
    if (pos >= 130 && pos <= 175 && neg >= 2 && neg <= 4) return b;
  }
  return Array.from({ length: cartas }, (_, i) => valores[i % valores.length]);
}

// Retângulo arredondado (ctx.roundRect não existe em navegadores antigos)
function retangulo(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

const calmo = () => { try { return document.documentElement.hasAttribute('data-calmo'); } catch { return false; } };

export const TiroNasNotas: React.FC<Props> = ({ dificuldade, onFim, onSair }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const caixaRef = useRef<HTMLDivElement>(null);
  const [fase, setFase] = useState<'instrucoes' | 'jogando' | 'fim'>('instrucoes');
  const [hud, setHud] = useState({ soma: 0, restantes: CONFIG[dificuldade].cartas });
  const [resultado, setResultado] = useState<{ nota: number; soma: number } | null>(null);
  const teclas = useRef<Record<string, boolean>>({});
  const toque = useRef({ esq: false, dir: false, tiro: false });

  const comecar = () => { audioService.playClick(); setFase('jogando'); };

  // Laço do jogo
  useEffect(() => {
    if (fase !== 'jogando') return;
    const canvas = canvasRef.current!, caixa = caixaRef.current!;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0, dpr = 1;
    const medir = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = caixa.clientWidth; H = caixa.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    medir();
    window.addEventListener('resize', medir);

    const cfg = CONFIG[dificuldade];
    const lento = calmo() ? 1.5 : 1;
    const baralho = montarBaralho(dificuldade);
    const cartas: Carta[] = [];
    const tiros: Tiro[] = [];
    const flut: Flutuante[] = [];
    let proxima = 0.6, lancadas = 0, soma = 0, recarga = 0, idCarta = 0;
    let lapisX = W / 2;
    let ultimo = performance.now(), raf = 0, acabou = false;

    const tamanhoFonte = () => Math.max(14, Math.min(22, W / 34));
    const lancar = () => {
      const valor = baralho[lancadas++];
      const texto = numeroEmIngles(valor);
      ctx.font = `700 ${tamanhoFonte()}px Fredoka, system-ui, sans-serif`;
      const w = Math.max(92, ctx.measureText(texto).width + 28), h = tamanhoFonte() * 2.4;
      cartas.push({ id: idCarta++, valor, texto, x: 20 + Math.random() * Math.max(10, W - w - 40), y: -h, w, h, vel: (H + h) / (cfg.queda * lento), estado: 'caindo', t: 0 });
    };

    const desenhar = () => {
      // Lousa
      ctx.fillStyle = '#2F6B57'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(245,241,230,0.08)';
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, H * (i / 6)); ctx.lineTo(W, H * (i / 6) + 20); ctx.stroke(); }
      ctx.fillStyle = '#8A5A2B'; ctx.fillRect(0, H - 14, W, 14); // calha de giz
      // Linha da meta
      ctx.fillStyle = 'rgba(245,241,230,0.85)'; ctx.font = `600 ${Math.max(11, tamanhoFonte() * 0.6)}px Fredoka, sans-serif`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('O que chegar ao chão soma na nota', 12, H - 22);
      // Cartas
      for (const c of cartas) {
        if (c.estado === 'apagada' && c.t > 0.35) continue;
        ctx.save();
        if (c.estado === 'apagada') { ctx.globalAlpha = 1 - c.t / 0.35; }
        ctx.fillStyle = c.valor < 0 ? '#FFE4CC' : '#FFFBF0';
        ctx.strokeStyle = c.valor < 0 ? '#E5484D' : '#1F5FD0'; ctx.lineWidth = 3;
        const r = 10;
        retangulo(ctx, c.x, c.y, c.w, c.h, r); ctx.fill(); ctx.stroke();
        ctx.fillStyle = c.valor < 0 ? '#C93A3E' : '#143F97';
        ctx.font = `700 ${tamanhoFonte()}px Fredoka, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(c.texto, c.x + c.w / 2, c.y + c.h / 2);
        ctx.restore();
      }
      // Tiros (borrachas)
      ctx.fillStyle = '#F2811D';
      for (const t of tiros) { retangulo(ctx, t.x - 5, t.y - 10, 10, 18, 3); ctx.fill(); ctx.fillStyle = '#FFF6DF'; ctx.fillRect(t.x - 5, t.y + 2, 10, 6); ctx.fillStyle = '#F2811D'; }
      // Lápis
      const ly = H - 46;
      ctx.save(); ctx.translate(lapisX, ly);
      ctx.fillStyle = '#FFD23F'; ctx.fillRect(-12, -6, 24, 40);
      ctx.fillStyle = '#E5484D'; ctx.fillRect(-12, 30, 24, 10);
      ctx.fillStyle = '#F3E4BE'; ctx.beginPath(); ctx.moveTo(-12, -6); ctx.lineTo(12, -6); ctx.lineTo(0, -28); ctx.fill();
      ctx.fillStyle = '#1A2A4A'; ctx.beginPath(); ctx.moveTo(-4, -20); ctx.lineTo(4, -20); ctx.lineTo(0, -28); ctx.fill();
      ctx.restore();
      // Textos flutuantes
      for (const f of flut) {
        ctx.globalAlpha = Math.max(0, 1 - f.t / 1.2); ctx.fillStyle = f.cor; ctx.font = `700 ${tamanhoFonte() * 1.1}px Lilita One, Fredoka, sans-serif`;
        ctx.textAlign = 'center'; ctx.fillText(f.texto, f.x, f.y - f.t * 40); ctx.globalAlpha = 1;
      }
    };

    const passo = (agora: number) => {
      const dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora;
      if (!document.hidden) {
        // Lápis
        const vel = W * 0.9;
        if (teclas.current.ArrowLeft || teclas.current.a || toque.current.esq) lapisX -= vel * dt;
        if (teclas.current.ArrowRight || teclas.current.d || toque.current.dir) lapisX += vel * dt;
        lapisX = Math.max(16, Math.min(W - 16, lapisX));
        recarga -= dt;
        if ((teclas.current[' '] || toque.current.tiro) && recarga <= 0) { tiros.push({ x: lapisX, y: H - 78 }); recarga = 0.28; audioService.playFlip(); }
        // Lançar cartas
        proxima -= dt;
        const caindo = cartas.filter(c => c.estado === 'caindo').length;
        if (proxima <= 0 && lancadas < baralho.length && caindo < 3) { lancar(); proxima = cfg.intervalo * lento; }
        // Movimento
        for (const t of tiros) t.y -= 620 * dt;
        for (let i = tiros.length - 1; i >= 0; i--) if (tiros[i].y < -20) tiros.splice(i, 1);
        for (const c of cartas) {
          c.t += dt;
          if (c.estado !== 'caindo') continue;
          c.y += c.vel * dt;
          for (let i = tiros.length - 1; i >= 0; i--) {
            const t = tiros[i];
            if (t.x > c.x && t.x < c.x + c.w && t.y > c.y && t.y < c.y + c.h) {
              tiros.splice(i, 1); c.estado = 'apagada'; c.t = 0;
              flut.push({ x: c.x + c.w / 2, y: c.y, texto: `apagou ${c.valor > 0 ? '+' : ''}${c.valor}`, cor: '#FFE27A', t: 0 });
              audioService.playTick();
              break;
            }
          }
          if (c.estado === 'caindo' && c.y + c.h >= H - 14) {
            c.estado = 'somada'; c.t = 0; soma += c.valor;
            flut.push({ x: c.x + c.w / 2, y: H - 40, texto: `${c.valor > 0 ? '+' : ''}${c.valor}`, cor: c.valor < 0 ? '#FF8A8D' : '#9BE7A5', t: 0 });
            if (c.valor < 0) audioService.playWrong(); else audioService.playCorrect();
          }
        }
        for (let i = flut.length - 1; i >= 0; i--) { flut[i].t += dt; if (flut[i].t > 1.2) flut.splice(i, 1); }
        for (let i = cartas.length - 1; i >= 0; i--) if (cartas[i].estado !== 'caindo' && cartas[i].t > 0.4) cartas.splice(i, 1);
        setHud(h => (h.soma === soma && h.restantes === baralho.length - lancadas + caindo ? h : { soma, restantes: baralho.length - lancadas + cartas.filter(c => c.estado === 'caindo').length }));
        if (!acabou && lancadas >= baralho.length && cartas.every(c => c.estado !== 'caindo') && flut.length === 0) {
          acabou = true;
          const nota = Math.max(0, 100 - Math.abs(100 - soma));
          setResultado({ nota, soma }); setFase('fim');
          if (nota >= 50) audioService.playFanfare(); else audioService.playWrong();
          narrar([{ texto: nota >= 50 ? 'Approved!' : 'Failed!', idioma: 'en-US', personagem: 'professora' }]);
          onFim({ nota, soma });
        }
      }
      desenhar();
      if (!acabou) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', medir); };
  }, [fase, dificuldade]); // eslint-disable-line react-hooks/exhaustive-deps

  // Teclado
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (['ArrowLeft', 'ArrowRight', ' ', 'a', 'd'].includes(e.key)) { e.preventDefault(); teclas.current[e.key] = true; } };
    const up = (e: KeyboardEvent) => { teclas.current[e.key] = false; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const botaoToque = useCallback((k: 'esq' | 'dir' | 'tiro', rotulo: string, icone: React.ReactNode) => (
    <button type="button" aria-label={rotulo}
      onPointerDown={e => { e.preventDefault(); toque.current[k] = true; }} onPointerUp={() => { toque.current[k] = false; }} onPointerLeave={() => { toque.current[k] = false; }} onPointerCancel={() => { toque.current[k] = false; }}
      className="kit-btn kit-btn--papel !min-h-[56px] !px-5 select-none touch-none">{icone}</button>
  ), []);

  const metaFalta = 100 - hud.soma;
  return (
    <Painel tipo="mural" as="section" aria-label="Tiro nas notas" className="p-3 sm:p-4 short:p-2 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="kit-placa px-5 py-1 font-display text-lg short:text-base">Intervalo · Tiro nas notas</span>
        <div className="flex items-center gap-2">
          {fase === 'jogando' && <>
            <span className="kit-ficha kit-ficha--sol">Soma: {hud.soma}</span>
            <span className={`kit-ficha ${metaFalta < 0 ? 'kit-ficha--erro' : 'kit-ficha--azul'}`}>{metaFalta >= 0 ? `Faltam ${metaFalta}` : `Passou ${-metaFalta}`}</span>
            <span className="kit-ficha kit-ficha--papel">Notas: {hud.restantes}</span>
          </>}
          <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); onSair(); }}>Sair</BotaoJogo>
        </div>
      </div>

      {fase === 'instrucoes' && (
        <Painel tipo="papel" liso className="p-4 short:p-2 flex flex-col items-center gap-3 short:gap-1.5 text-center">
          <p className="font-display text-2xl short:text-lg text-nisia-azul-700">As notas estão caindo do quadro!</p>
          <div className="flex flex-wrap justify-center gap-2" aria-hidden="true">
            {['twenty', 'five', 'minus ten', 'fifteen'].map(t => (
              <span key={t} className={`px-3 py-1.5 rounded-lg border-[3px] font-display ${t.startsWith('minus') ? 'bg-nisia-laranja-100 border-nisia-erro text-nisia-erro' : 'bg-white border-nisia-azul-500 text-nisia-azul-700'}`}>{t}</span>
            ))}
          </div>
          <ul className="text-left text-sm sm:text-base short:text-xs max-w-xl list-disc pl-5 space-y-1">
            <li>Cada nota está escrita <b>em inglês</b>. A que chega ao chão <b>soma</b> na sua nota.</li>
            <li>Mova o lápis com <b>← →</b> (ou A e D) e <b>apague</b> com a <b>barra de espaço</b> as notas que você não quer.</li>
            <li>A meta é somar <b>100</b>. Se passar ou faltar, perde a diferença. Abaixo de <b>50</b>: reprovado!</li>
          </ul>
          <BotaoJogo cor="laranja" onClick={comecar} autoFocus><Icone nome="jogar" className="w-5 h-5" cor="currentColor" /> Começar</BotaoJogo>
        </Painel>
      )}

      {fase === 'jogando' && (
        <>
          <div ref={caixaRef} className="relative w-full h-[60vh] short:h-[62vh] max-h-[520px] rounded-xl overflow-hidden border-[4px] border-nisia-madeira-escura">
            <canvas ref={canvasRef} className="block" aria-label="Lousa com notas caindo. Use as setas e a barra de espaço." role="img" />
          </div>
          <div className="flex justify-between gap-2 sm:hidden short:flex">
            <div className="flex gap-2">{botaoToque('esq', 'Mover para a esquerda', <span className="font-display text-2xl">◀</span>)}{botaoToque('dir', 'Mover para a direita', <span className="font-display text-2xl">▶</span>)}</div>
            {botaoToque('tiro', 'Apagar', <span className="font-display text-lg">Apagar</span>)}
          </div>
        </>
      )}

      {fase === 'fim' && resultado && (
        <Painel tipo="papel" liso className="p-5 short:p-2 flex flex-col items-center gap-2 text-center animate-rise-in" role="status">
          <span className={`font-display text-5xl short:text-3xl -rotate-6 px-6 py-1 border-[6px] rounded-xl ${resultado.nota >= 50 ? 'text-nisia-verde-700 border-nisia-verde-500' : 'text-nisia-erro border-nisia-erro'}`}>
            {resultado.nota >= 50 ? 'APROVADO' : 'REPROVADO'}
          </span>
          <Estrelas n={resultado.nota >= 90 ? 3 : resultado.nota >= 70 ? 2 : resultado.nota >= 50 ? 1 : 0} />
          <p className="font-display text-2xl short:text-lg text-nisia-azul-700">Nota {resultado.nota}</p>
          <p className="text-sm text-nisia-tinta-suave">Você somou {resultado.soma}. {resultado.soma === 100 ? 'Na mosca!' : resultado.soma > 100 ? `Passou ${resultado.soma - 100} da meta.` : `Faltaram ${100 - resultado.soma}.`}</p>
          <div className="flex gap-3 mt-1">
            <BotaoJogo cor="papel" onClick={() => { setResultado(null); setHud({ soma: 0, restantes: CONFIG[dificuldade].cartas }); setFase('jogando'); }}>Jogar de novo</BotaoJogo>
            <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); onSair(); }}>Voltar às atividades <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
          </div>
        </Painel>
      )}
    </Painel>
  );
};
