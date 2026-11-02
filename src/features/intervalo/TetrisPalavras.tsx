import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BotaoJogo, Estrelas, Icone, Painel } from '../../components/kit';
import { audioService } from '../../services/audio';
import { narrar } from '../../services/narracao';
import { TEMAS_TETRIS } from '../../data/frasesIntervalo';
import { calmo } from './grade';
import { COLS, CORES_FORMA, FORMAS, LINHAS, cabe, fixar, girar, limparLinhas, tabuleiroVazio, type Celula, type Forma } from './tetrisLogica';

// TETRIS DAS PALAVRAS (intervalo dos Níveis 4 e 6): cada peça cai com uma palavra em inglês.
// Tema falado no começo da rodada ("Keep the school places!"): peça do tema, encaixe; peça fora do tema,
// jogue no lixo (X) antes de ela cair — se cair, vira bagunça cinza no tabuleiro. Linha completa some, como no Tetris.
// Três rodadas de 50 segundos, cada uma com outro tema, outra cor de sala e peças mais rápidas.

interface Props { dificuldade: 1 | 2 | 3; onFim: (r: { pontos: number }) => void; onSair: () => void }
type Tipo = keyof typeof FORMAS;
interface Peca { tipo: Tipo; forma: Forma; x: number; y: number; palavra: string; certa: boolean }

const TEMPO_RODADA = 50;
const FUNDOS = ['#16324F', '#2B2147', '#173B2E'];

export const TetrisPalavras: React.FC<Props> = ({ dificuldade, onFim, onSair }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const caixaRef = useRef<HTMLDivElement>(null);
  const [fase, setFase] = useState<'instrucoes' | 'jogando' | 'fim'>('instrucoes');
  const [rodada, setRodada] = useState(0);
  const [hud, setHud] = useState({ pontos: 0, tempo: TEMPO_RODADA, linhas: 0, proxima: '', aviso: null as string | null, avisoBom: true });
  const [motivo, setMotivo] = useState<'tempo' | 'cheio'>('tempo');
  const acao = useRef<(a: 'esq' | 'dir' | 'girar' | 'descer' | 'cair' | 'lixo') => void>(() => undefined);
  const pontosTotal = useRef(0);
  const temas = useRef(TEMAS_TETRIS);

  const falarTema = useCallback((r: number) => narrar([{ texto: temas.current[r].ordem, idioma: 'en-US', personagem: 'professora' }]), []);

  useEffect(() => {
    if (fase !== 'jogando') return undefined;
    const tema = temas.current[rodada];
    const tab = tabuleiroVazio();
    const fator = (calmo() ? 1.4 : 1) * (dificuldade >= 2 ? 0.85 : 1);
    const queda = [0.8, 0.62, 0.48][rodada] * fator; // segundos por linha
    let pontos = pontosTotal.current, linhas = 0, tempo = TEMPO_RODADA, acumulado = 0, segundo = 0, aviso: { texto: string; bom: boolean; ate: number } | null = null, relogio = 0, fim = false;
    // Sorteio de palavras: ~60 % do tema, sem repetir a mesma em seguida.
    let ultima = '';
    const sortear = (): Peca => {
      const tipos = Object.keys(FORMAS) as Tipo[];
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const certa = Math.random() < 0.6;
      const lista = (certa ? tema.certas : tema.erradas).filter(p => p !== ultima);
      const palavra = lista[Math.floor(Math.random() * lista.length)];
      ultima = palavra;
      return { tipo, forma: FORMAS[tipo], x: 3, y: -1, palavra, certa };
    };
    let peca = sortear(), prox = sortear();
    const avisar = (texto: string, bom: boolean) => { aviso = { texto, bom, ate: relogio + 1.6 }; };
    const hudAgora = () => setHud({ pontos, tempo, linhas, proxima: prox.palavra, aviso: aviso && aviso.ate > relogio ? aviso.texto : null, avisoBom: aviso?.bom ?? true });

    const terminar = (por: 'tempo' | 'cheio') => {
      fim = true; pontosTotal.current = pontos;
      if (por === 'cheio' || rodada + 1 >= temas.current.length) {
        setMotivo(por); setFase('fim'); onFim({ pontos });
        if (pontos > 0) audioService.playFanfare(); else audioService.playWrong();
      } else { audioService.playChime(); setRodada(r => r + 1); }
    };
    const proxPeca = () => {
      peca = prox; prox = sortear();
      if (!cabe(tab, peca.forma, peca.x, peca.y)) { audioService.playWrong(); terminar('cheio'); }
      hudAgora();
    };
    const travar = () => {
      const ok = fixar(tab, peca.forma, peca.x, peca.y, { cor: peca.certa ? CORES_FORMA[peca.tipo] : '#8C8F99', baguna: !peca.certa });
      if (peca.certa) { pontos += 10; audioService.playTick(); }
      else { pontos = Math.max(0, pontos - 30); audioService.playWrong(); avisar(`${peca.palavra}: fora do tema! (−30)`, false); }
      const n = limparLinhas(tab);
      if (n) { pontos += [0, 100, 250, 450, 700][n]; linhas += n; audioService.playCombo(); avisar(n > 1 ? `${n} linhas! (+${[0, 100, 250, 450, 700][n]})` : 'Linha! (+100)', true); }
      if (!ok) { terminar('cheio'); return; }
      proxPeca();
    };
    acao.current = a => {
      if (fim) return;
      if (a === 'esq' || a === 'dir') { const dx = a === 'esq' ? -1 : 1; if (cabe(tab, peca.forma, peca.x + dx, peca.y)) peca.x += dx; }
      else if (a === 'girar') {
        const g = girar(peca.forma, peca.tipo);
        for (const chute of [0, -1, 1, -2, 2]) if (cabe(tab, g, peca.x + chute, peca.y)) { peca.forma = g; peca.x += chute; audioService.playFlip(); break; }
      } else if (a === 'descer') { if (cabe(tab, peca.forma, peca.x, peca.y + 1)) { peca.y++; acumulado = 0; } else travar(); }
      else if (a === 'cair') { while (cabe(tab, peca.forma, peca.x, peca.y + 1)) { peca.y++; pontos += 1; } travar(); }
      else if (a === 'lixo') {
        if (peca.certa) { pontos = Math.max(0, pontos - 20); audioService.playWrong(); avisar(`${peca.palavra} era do tema! (−20)`, false); }
        else { pontos += 40; audioService.playCorrect(); avisar(`Isso! ${peca.palavra} no lixo (+40)`, true); }
        proxPeca();
      }
      hudAgora();
    };

    const caixa = caixaRef.current!, canvas = canvasRef.current!, ctx = canvas.getContext('2d')!;
    let W = 0, H = 0, t = 0, ox = 0, oy = 0;
    const medir = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = caixa.clientWidth; H = caixa.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      t = Math.floor(Math.min(W / COLS, H / LINHAS)); ox = (W - t * COLS) / 2; oy = (H - t * LINHAS) / 2;
    };
    medir();
    const ro = new ResizeObserver(medir); ro.observe(caixa);

    const bloco = (x: number, y: number, cor: string, baguna = false, alfa = 1) => {
      const X = ox + x * t, Y = oy + y * t;
      ctx.globalAlpha = alfa;
      ctx.fillStyle = cor; ctx.fillRect(X + 1, Y + 1, t - 2, t - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(X + 1, Y + 1, t - 2, t * 0.18);
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(X + 1, Y + t * 0.82, t - 2, t * 0.18 - 1);
      if (baguna) { ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X + t * 0.3, Y + t * 0.3); ctx.lineTo(X + t * 0.7, Y + t * 0.7); ctx.moveTo(X + t * 0.7, Y + t * 0.3); ctx.lineTo(X + t * 0.3, Y + t * 0.7); ctx.stroke(); }
      ctx.globalAlpha = 1;
    };
    const desenhar = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = FUNDOS[rodada % FUNDOS.length]; ctx.fillRect(ox, oy, t * COLS, t * LINHAS);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
      for (let x = 1; x < COLS; x++) { ctx.beginPath(); ctx.moveTo(ox + x * t, oy); ctx.lineTo(ox + x * t, oy + t * LINHAS); ctx.stroke(); }
      for (let y = 0; y < LINHAS; y++) for (let x = 0; x < COLS; x++) { const c = tab[y][x]; if (c) bloco(x, y, c.cor, c.baguna); }
      // sombra de onde a peça vai cair
      let gy = peca.y; while (cabe(tab, peca.forma, peca.x, gy + 1)) gy++;
      for (const [x, y] of peca.forma) if (gy + y >= 0) bloco(peca.x + x, gy + y, '#FFFFFF', false, 0.12);
      for (const [x, y] of peca.forma) if (peca.y + y >= 0) bloco(peca.x + x, peca.y + y, CORES_FORMA[peca.tipo]);
      // palavra sobre a peça
      const xs = peca.forma.map(c => c[0]), ys = peca.forma.map(c => c[1]);
      const cx = ox + (peca.x + (Math.min(...xs) + Math.max(...xs) + 1) / 2) * t, cy = oy + (peca.y + (Math.min(...ys) + Math.max(...ys) + 1) / 2) * t;
      const tam = Math.max(10, Math.min(t * 0.6, (t * 4.6) / (peca.palavra.length * 0.6)));
      ctx.font = `700 ${tam}px Fredoka, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lw = ctx.measureText(peca.palavra).width + 12;
      ctx.fillStyle = 'rgba(255,246,223,0.95)'; ctx.strokeStyle = '#0C2A66'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.rect(cx - lw / 2, cy - tam * 0.7, lw, tam * 1.4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#0C2A66'; ctx.fillText(peca.palavra, cx, cy + 1);
      ctx.strokeStyle = '#FFD23F'; ctx.lineWidth = 3; ctx.strokeRect(ox - 1.5, oy - 1.5, t * COLS + 3, t * LINHAS + 3);
    };

    // Teclado: ← → mover, ↑ girar, ↓ descer, Espaço cair, X lixo.
    const tecla = (e: KeyboardEvent) => {
      const m: Record<string, 'esq' | 'dir' | 'girar' | 'descer' | 'cair' | 'lixo'> = { ArrowLeft: 'esq', a: 'esq', ArrowRight: 'dir', d: 'dir', ArrowUp: 'girar', w: 'girar', ArrowDown: 'descer', s: 'descer', ' ': 'cair', x: 'lixo', Delete: 'lixo', Backspace: 'lixo' };
      const a = m[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (!a) return;
      e.preventDefault();
      if (e.repeat && (a === 'cair' || a === 'lixo' || a === 'girar')) return;
      acao.current(a);
    };
    window.addEventListener('keydown', tecla);
    falarTema(rodada);
    hudAgora();

    let raf = 0, ultimo = performance.now(), espera = 1.2;
    const laco = (agora: number) => {
      raf = requestAnimationFrame(laco);
      const dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora; relogio += dt;
      if (fim) return;
      if (espera > 0) { espera -= dt; desenhar(); return; }
      acumulado += dt; segundo += dt;
      if (acumulado >= queda) { acumulado = 0; if (cabe(tab, peca.forma, peca.x, peca.y + 1)) peca.y++; else travar(); }
      if (segundo >= 1) { segundo -= 1; tempo -= 1; hudAgora(); if (tempo <= 0) { terminar('tempo'); return; } }
      if (aviso && aviso.ate < relogio) { aviso = null; hudAgora(); }
      desenhar();
    };
    raf = requestAnimationFrame(laco);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', tecla); };
  }, [fase, rodada]); // eslint-disable-line react-hooks/exhaustive-deps

  const comecar = () => {
    audioService.playClick(); pontosTotal.current = 0;
    temas.current = [...TEMAS_TETRIS].sort(() => Math.random() - 0.5);
    setRodada(0); setFase('jogando');
  };
  const tema = temas.current[rodada];
  const botao = (rot: string, a: Parameters<typeof acao.current>[0], txt: React.ReactNode, extra = '') => (
    <button type="button" aria-label={rot} onPointerDown={e => { e.preventDefault(); acao.current(a); }} className={`kit-btn !min-h-[52px] !min-w-[52px] !p-0 select-none touch-none font-display text-xl ${extra || 'kit-btn--papel'}`}>{txt}</button>
  );

  return (
    <Painel tipo="mural" as="section" aria-label="Tetris das palavras" className="p-3 sm:p-4 short:p-2 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="kit-placa px-5 py-1 font-display text-lg short:text-base">Intervalo · Tetris das palavras</span>
        <div className="flex items-center gap-2 flex-wrap">
          {fase === 'jogando' && <>
            <span className="kit-ficha kit-ficha--azul">Rodada {rodada + 1} de {temas.current.length}</span>
            <span className={`kit-ficha ${hud.tempo <= 10 ? 'kit-ficha--erro' : 'kit-ficha--sol'}`}>{hud.tempo}s</span>
            <span className="kit-ficha">{hud.pontos} pts</span>
          </>}
          <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); onSair(); }}>Sair</BotaoJogo>
        </div>
      </div>

      {fase === 'instrucoes' && (
        <Painel tipo="papel" liso className="p-4 short:p-2 flex flex-col items-center gap-3 short:gap-1.5 text-center">
          <p className="font-display text-2xl short:text-lg text-nisia-azul-700">Cada peça cai com uma palavra em inglês.</p>
          <div className="flex flex-wrap justify-center gap-2 text-sm font-display" aria-hidden="true">
            <span className="px-3 py-1 rounded-lg bg-nisia-verde-100 border-2 border-nisia-verde-500 text-nisia-verde-700">LIBRARY → encaixe</span>
            <span className="px-3 py-1 rounded-lg bg-white border-2 border-nisia-erro text-nisia-erro">APPLE → lixo (X)</span>
          </div>
          <ul className="text-left text-sm sm:text-base short:text-xs max-w-xl list-disc pl-5 space-y-1">
            <li>Ouça o tema, por exemplo <b>“Keep the school places!”</b>. Peça do tema: encaixe e complete linhas.</li>
            <li>Peça fora do tema: aperte <b>X</b> (lixo) antes de ela cair. Se cair, vira <b>bagunça cinza</b> e custa pontos.</li>
            <li><b>← →</b> mover · <b>↑</b> girar · <b>↓</b> descer · <b>Espaço</b> cair de uma vez.</li>
            <li>Três rodadas de {TEMPO_RODADA} segundos, cada uma com outro tema e peças mais rápidas.</li>
          </ul>
          <BotaoJogo cor="laranja" onClick={comecar} autoFocus><Icone nome="jogar" className="w-5 h-5" cor="currentColor" /> Começar</BotaoJogo>
        </Painel>
      )}

      {fase === 'jogando' && tema && (
        <>
          <div className="kit-papel rounded-xl px-3 py-1.5 flex items-center justify-center gap-2 flex-wrap text-center">
            <p className="font-display text-xl sm:text-2xl short:text-lg text-nisia-azul-700">{tema.ordem}</p>
            <button type="button" className="kit-btn kit-btn--azul !min-h-0 !py-1 !px-3" aria-label="Ouvir o tema de novo" onClick={() => falarTema(rodada)}><Icone nome="orelha" className="w-5 h-5" cor="currentColor" /></button>
            <span className="text-sm text-nisia-tinta/80">({tema.tema})</span>
          </div>
          <div className="flex gap-3 items-stretch justify-center">
            <div ref={caixaRef} className="relative w-full max-w-[380px] h-[58vh] short:h-[60vh] max-h-[560px]">
              <canvas ref={canvasRef} className="block" role="img" aria-label={`Tabuleiro. Tema: ${tema.ordem}`} />
              {hud.aviso && <div className="absolute inset-x-0 top-1/3 flex justify-center pointer-events-none" role="status"><span className={`kit-placa px-4 py-1.5 font-display text-lg animate-balao-in ${hud.avisoBom ? '' : '!bg-nisia-erro !text-white'}`}>{hud.aviso}</span></div>}
            </div>
            <div className="flex flex-col gap-2 w-40 short:w-32">
              <div className="kit-papel rounded-xl p-2 text-center">
                <p className="text-xs font-semibold text-nisia-tinta/70">Próxima peça</p>
                <p className="font-display text-lg text-nisia-azul-700 break-words">{hud.proxima}</p>
              </div>
              <div className="kit-papel rounded-xl p-2 text-center"><p className="text-xs font-semibold text-nisia-tinta/70">Linhas</p><p className="font-display text-2xl text-nisia-azul-700">{hud.linhas}</p></div>
              <button type="button" onClick={() => acao.current('lixo')} className="kit-btn kit-btn--laranja font-display" aria-label="Jogar a peça no lixo (tecla X)">🗑️ Lixo (X)</button>
              <div className="grid grid-cols-3 gap-1 [@media(pointer:fine)]:hidden mt-auto">
                <span />{botao('Girar', 'girar', '⟳')}<span />
                {botao('Mover para a esquerda', 'esq', '◀')}{botao('Descer', 'descer', '▼')}{botao('Mover para a direita', 'dir', '▶')}
                <span />{botao('Cair de uma vez', 'cair', '⤓', 'kit-btn--azul')}<span />
              </div>
            </div>
          </div>
        </>
      )}

      {fase === 'fim' && (
        <Painel tipo="papel" liso className="p-5 short:p-2 flex flex-col items-center gap-2 text-center animate-rise-in" role="status">
          <p className="font-display text-3xl short:text-xl text-nisia-azul-700">{motivo === 'cheio' ? 'O tabuleiro encheu!' : 'Fim das três rodadas!'}</p>
          <Estrelas n={pontosTotal.current >= 900 ? 3 : pontosTotal.current >= 450 ? 2 : pontosTotal.current > 0 ? 1 : 0} />
          <p className="font-display text-xl short:text-base">{pontosTotal.current} pontos</p>
          <div className="flex gap-3 mt-1 flex-wrap justify-center">
            <BotaoJogo cor="papel" onClick={comecar}>Jogar de novo</BotaoJogo>
            <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); onSair(); }}>Voltar às atividades <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
          </div>
        </Painel>
      )}
    </Painel>
  );
};
export default TetrisPalavras;
