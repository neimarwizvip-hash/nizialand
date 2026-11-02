import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BotaoJogo, Estrelas, Icone, Painel } from '../../components/kit';
import { audioService } from '../../services/audio';
import { narrar, type Trecho } from '../../services/narracao';
import { COLETAS_FUGA, PERSEGUIDORES, type Perseguidor } from '../../data/frasesIntervalo';
import { calmo, Cruzeta, desenharAluno, imagemDoAvatar, useDirecoes, type Direcao } from './grade';
import { DIRS, RODADAS_FUGA, acharNoMapa, escolherDirecao, livre, type Dir } from './fugaLogica';

// FUGA NO CORREDOR (intervalo do Nível 6, estilo Pac-Man): o aluno saiu da sala sem permissão e é perseguido.
// Rodada 1: a Coordenadora Vânia · Rodada 2: a Orientadora Edileia (mais esperta: mira à frente do aluno)
// Rodada 3: o Diretor Márcio (o mais rápido), com a Vânia ajudando.
// Conteúdo: recolha as palavras do tema falado em inglês ("Collect the feelings!"); palavra fora do tema custa pontos.
// O passe de corredor (HALL PASS) deixa quem persegue confuso por alguns segundos — encostar nele manda de volta à sala.

interface Props { avatar?: string; onFim: (r: { pontos: number }) => void; onSair: () => void }

interface Ent { ax: number; ay: number; bx: number; by: number; t: number; dir: Dir; vel: number }
interface Perseg extends Ent { quem: Perseguidor; mira: 'direto' | 'adiante'; espera: number; canto: [number, number] }
interface Carta { palavra: string; certa: boolean }

const VIDAS = 3;
const POR_RODADA = 4; // palavras certas para fechar a rodada
const VEL_ALUNO = 5.2;

const pos = (e: Ent): [number, number] => [e.ax + (e.bx - e.ax) * e.t, e.ay + (e.by - e.ay) * e.t];
const parado = (x: number, y: number, vel: number): Ent => ({ ax: x, ay: y, bx: x, by: y, t: 0, dir: [0, 0], vel });
const DIR_TECLA: Record<Direcao, Dir> = { cima: [0, -1], dir: [1, 0], baixo: [0, 1], esq: [-1, 0] };

export const FugaCorredor: React.FC<Props> = ({ avatar, onFim, onSair }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const caixaRef = useRef<HTMLDivElement>(null);
  const [fase, setFase] = useState<'instrucoes' | 'jogando' | 'fim'>('instrucoes');
  const [rodada, setRodada] = useState(0);
  const [hud, setHud] = useState({ pontos: 0, vidas: VIDAS, coletadas: [] as string[], aviso: null as string | null, passe: 0 });
  const [venceu, setVenceu] = useState(0);
  const imgAluno = useRef(imagemDoAvatar(avatar));
  const imgs = useRef<Record<Perseguidor, HTMLImageElement> | null>(null);
  const desejo = useRef<Dir>([0, 0]);
  const parar = useRef<() => void>(() => undefined);

  if (!imgs.current && typeof Image !== 'undefined') {
    imgs.current = Object.fromEntries((Object.keys(PERSEGUIDORES) as Perseguidor[]).map(p => { const i = new Image(); i.src = PERSEGUIDORES[p].img; return [p, i]; })) as Record<Perseguidor, HTMLImageElement>;
  }
  const falar = useCallback((t: Trecho[]) => { parar.current(); parar.current = narrar(t); }, []);
  useEffect(() => () => parar.current(), []);

  const mover = useCallback((d: Direcao) => { desejo.current = DIR_TECLA[d]; }, []);
  useDirecoes(mover, fase === 'jogando');

  // ---------- Uma rodada inteira vive neste efeito (laço do jogo com estado em variáveis locais) ----------
  useEffect(() => {
    if (fase !== 'jogando') return undefined;
    const R = RODADAS_FUGA[rodada];
    const tema = COLETAS_FUGA[rodada];
    const mapa = R.mapa;
    const largada = acharNoMapa(mapa, 'P'), sala = acharNoMapa(mapa, 'C');
    const fator = calmo() ? 0.75 : 1;
    const cantos: Array<[number, number]> = [[1, 1], [13, 9], [13, 1], [1, 9]];
    const estrelas = new Set<string>(), passes = new Set<string>();
    const cartas = new Map<string, Carta>();
    for (let y = 0; y < mapa.length; y++) for (let x = 0; x < mapa[0].length; x++) {
      if (mapa[y][x] === '.') estrelas.add(`${x},${y}`);
      if (mapa[y][x] === 'H') passes.add(`${x},${y}`);
    }
    // Cartas: longe da largada e da sala; 4 certas (de 5) e 3 fora do tema.
    const lugares = [...estrelas].filter(k => { const [x, y] = k.split(',').map(Number); return Math.abs(x - largada[0]) + Math.abs(y - largada[1]) >= 4 && Math.abs(x - sala[0]) + Math.abs(y - sala[1]) >= 2; }).sort(() => Math.random() - 0.5);
    const palavras = [...[...tema.certas].sort(() => Math.random() - 0.5).slice(0, POR_RODADA).map(p => ({ palavra: p, certa: true })), ...tema.erradas.map(p => ({ palavra: p, certa: false }))];
    // Cartas espaçadas (nenhuma colada na outra), para as palavras não se sobreporem.
    const usados: Array<[number, number]> = [];
    for (const c of palavras) {
      const k = lugares.find(l => { const [x, y] = l.split(',').map(Number); return usados.every(([ux, uy]) => Math.abs(ux - x) + Math.abs(uy - y) >= 3 && !(uy === y && Math.abs(ux - x) < 4)); });
      const livreQualquer = c.certa ? lugares.find(l => !cartas.has(l)) : undefined; // a certa sempre entra
      const k2 = k ?? livreQualquer;
      if (!k2) continue;
      if (!k) { cartas.set(k2, c); estrelas.delete(k2); continue; }
      usados.push(k.split(',').map(Number) as [number, number]); cartas.set(k, c); estrelas.delete(k);
    }

    let aluno = parado(largada[0], largada[1], VEL_ALUNO);
    const novosPerseg = (): Perseg[] => R.perseguidores.map((p, i) => ({ ...parado(sala[0], sala[1], p.vel * fator), quem: p.quem, mira: p.mira, espera: 1.6 + i * 2.2, canto: cantos[i % cantos.length] }));
    let perseg = novosPerseg();
    desejo.current = [0, 0];
    let pontos = hud.pontos, vidas = hud.vidas, coletadas: string[] = [], confuso = 0, pausa = 1.2, relogio = 0, bolha: { quem: Perseguidor; texto: string; ate: number } | null = null, aviso: { texto: string; ate: number } | null = null, acabou = false;
    const atualizarHud = () => setHud({ pontos, vidas, coletadas: [...coletadas], aviso: aviso && aviso.ate > relogio ? aviso.texto : null, passe: Math.ceil(confuso) });

    // Fala de abertura: o tema (professora) e o grito de quem persegue.
    const primeiro = R.perseguidores[0].quem;
    bolha = { quem: primeiro, texto: PERSEGUIDORES[primeiro].grito, ate: 3.5 };
    falar([{ texto: tema.ordem, idioma: 'en-US', personagem: 'professora' }, { texto: PERSEGUIDORES[primeiro].grito, idioma: 'en-US', personagem: primeiro }]);
    atualizarHud();

    const avisar = (texto: string, s = 1.6) => { aviso = { texto, ate: relogio + s }; atualizarHud(); };

    const chegouAluno = (x: number, y: number) => {
      const k = `${x},${y}`;
      if (estrelas.delete(k)) { pontos += 10; if (estrelas.size % 4 === 0) audioService.playTick(); }
      if (passes.delete(k)) {
        confuso = calmo() ? 8 : 6; pontos += 50; audioService.playPowerup();
        avisar('“I have a hall pass!”', 2);
        perseg.forEach(p => { if (p.espera <= 0) { p.dir = [-p.dir[0], -p.dir[1]] as Dir; } });
      }
      const carta = cartas.get(k);
      if (carta) {
        cartas.delete(k);
        if (carta.certa) {
          coletadas.push(carta.palavra); pontos += 100; audioService.playCorrect();
          avisar(`${carta.palavra} ✓`, 1.1);
          if (coletadas.length >= POR_RODADA) { acabou = true; pontos += 150 + vidas * 50; audioService.playFanfare(); avisar('Rodada completa!', 2); }
        } else {
          pontos = Math.max(0, pontos - 50); audioService.playWrong();
          avisar(`${carta.palavra}: não é ${tema.tema}! (−50)`, 1.8);
        }
      }
      atualizarHud();
    };
    // Anda uma entidade; `decidir` escolhe a direção em cada centro de célula.
    const andar = (e: Ent, dt: number, decidir: (x: number, y: number) => Dir, aoChegar?: (x: number, y: number) => void) => {
      if (e.ax === e.bx && e.ay === e.by) {
        const d = decidir(e.ax, e.ay);
        if (!(d[0] || d[1]) || !livre(mapa, e.ax + d[0], e.ay + d[1])) return;
        e.dir = d; e.bx = e.ax + d[0]; e.by = e.ay + d[1]; e.t = 0;
      }
      e.t += e.vel * dt;
      while (e.t >= 1) {
        e.t -= 1; e.ax = e.bx; e.ay = e.by;
        aoChegar?.(e.ax, e.ay);
        const d = decidir(e.ax, e.ay);
        if ((d[0] || d[1]) && livre(mapa, e.ax + d[0], e.ay + d[1])) { e.dir = d; e.bx = e.ax + d[0]; e.by = e.ay + d[1]; }
        else { e.t = 0; break; }
      }
    };

    let raf = 0, ultimo = performance.now();
    const caixa = caixaRef.current!, canvas = canvasRef.current!, ctx = canvas.getContext('2d')!;
    let W = 0, H = 0, t = 0, ox = 0, oy = 0;
    const medir = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = caixa.clientWidth; H = caixa.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      t = Math.floor(Math.min(W / mapa[0].length, H / mapa.length));
      ox = (W - t * mapa[0].length) / 2; oy = (H - t * mapa.length) / 2;
    };
    medir();
    const ro = new ResizeObserver(medir); ro.observe(caixa);

    const desenhar = () => {
      ctx.fillStyle = '#1B2140'; ctx.fillRect(0, 0, W, H);
      // piso e paredes (armários)
      for (let y = 0; y < mapa.length; y++) for (let x = 0; x < mapa[0].length; x++) {
        const X = ox + x * t, Y = oy + y * t;
        if (mapa[y][x] === '#') {
          ctx.fillStyle = R.parede; ctx.fillRect(X, Y, t + 0.5, t + 0.5);
          ctx.fillStyle = R.brilho;
          if (livre(mapa, x, y + 1)) ctx.fillRect(X, Y + t - t * 0.12, t, t * 0.12);
          if (livre(mapa, x, y - 1)) ctx.fillRect(X, Y, t, t * 0.07);
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          if (livre(mapa, x, y + 1) || livre(mapa, x, y - 1)) for (let k = 1; k < 3; k++) ctx.fillRect(X + (t * k) / 3, Y + t * 0.18, 1.5, t * 0.6);
        } else {
          ctx.fillStyle = (x + y) % 2 ? R.piso : shade(R.piso);
          ctx.fillRect(X, Y, t + 0.5, t + 0.5);
        }
      }
      // estrelinhas, passes e cartas
      for (const k of estrelas) { const [x, y] = k.split(',').map(Number); ctx.fillStyle = '#F2B705'; ctx.beginPath(); ctx.arc(ox + (x + 0.5) * t, oy + (y + 0.5) * t, Math.max(2, t * 0.09), 0, Math.PI * 2); ctx.fill(); }
      const pulso = 1 + Math.sin(relogio * 6) * 0.08;
      for (const k of passes) {
        const [x, y] = k.split(',').map(Number); const cx = ox + (x + 0.5) * t, cy = oy + (y + 0.5) * t;
        ctx.save(); ctx.translate(cx, cy); ctx.scale(pulso, pulso); ctx.rotate(-0.15);
        ctx.fillStyle = '#FFD23F'; ctx.strokeStyle = '#8A5A2B'; ctx.lineWidth = 2;
        ret(ctx, -t * 0.4, -t * 0.24, t * 0.8, t * 0.48, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#5A3A18'; ctx.font = `700 ${Math.max(8, t * 0.2)}px Fredoka, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PASS', 0, 1);
        ctx.restore();
      }
      for (const [k, c] of cartas) {
        const [x, y] = k.split(',').map(Number); const cx = ox + (x + 0.5) * t, cy = oy + (y + 0.5) * t;
        const tam = Math.max(8, Math.min(t * 0.3, (t * 1.7) / (c.palavra.length * 0.62)));
        ctx.font = `700 ${tam}px Fredoka, sans-serif`;
        const lw = Math.max(t * 0.9, ctx.measureText(c.palavra).width + 10);
        ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#143F97'; ctx.lineWidth = 2;
        ret(ctx, cx - lw / 2, cy - t * 0.28, lw, t * 0.56, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#143F97'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c.palavra, cx, cy + 1);
      }
      // aluno
      const [px, py] = pos(aluno);
      desenharAluno(ctx, imgAluno.current, ox + (px + 0.5) * t, oy + (py + 0.5) * t, t);
      // quem persegue
      for (const p of perseg) {
        const [x, y] = pos(p); const cx = ox + (x + 0.5) * t, cy = oy + (y + 0.5) * t;
        const piscando = confuso > 0 && (confuso > 1.5 || Math.floor(relogio * 8) % 2 === 0);
        ctx.save();
        ctx.fillStyle = piscando ? '#B8BCC8' : PERSEGUIDORES[p.quem].cor; ctx.strokeStyle = '#0C2A66'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy, t * 0.46, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, t * 0.4, 0, Math.PI * 2); ctx.clip();
        const img = imgs.current?.[p.quem];
        if (img?.complete && img.naturalWidth) { const h = t * 1.35, w = h * (img.naturalWidth / img.naturalHeight); if (piscando) ctx.filter = 'grayscale(1)'; ctx.drawImage(img, cx - w / 2, cy - t * 0.4, w, h); }
        ctx.restore();
        if (piscando) { ctx.fillStyle = '#FFFFFF'; ctx.font = `700 ${t * 0.42}px Fredoka, sans-serif`; ctx.textAlign = 'center'; ctx.fillText('?', cx + t * 0.42, cy - t * 0.36); }
      }
      // balão de quem persegue
      if (bolha && bolha.ate > relogio) {
        const p = perseg.find(q => q.quem === bolha!.quem);
        if (p) {
          const [x, y] = pos(p); const cx = Math.min(W - 10, Math.max(10, ox + (x + 0.5) * t)), cy = oy + y * t - 4;
          ctx.font = `700 ${Math.max(12, t * 0.36)}px Fredoka, sans-serif`;
          const lw = ctx.measureText(bolha.texto).width + 18, bx = Math.min(W - lw - 4, Math.max(4, cx - lw / 2)), by = Math.max(4, cy - t * 0.62);
          ctx.fillStyle = '#FFF6DF'; ctx.strokeStyle = '#0C2A66'; ctx.lineWidth = 2;
          ret(ctx, bx, by, lw, t * 0.56, 8); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#0C2A66'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(bolha.texto, bx + 9, by + t * 0.28);
        }
      }
    };

    const reiniciarPosicoes = () => { aluno = parado(largada[0], largada[1], VEL_ALUNO); perseg = novosPerseg(); desejo.current = [0, 0]; confuso = 0; pausa = 1.4; };

    const laco = (agora: number) => {
      raf = requestAnimationFrame(laco);
      const dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora; relogio += dt;
      if (acabou) {
        desenhar();
        if (aviso && relogio > aviso.ate) { cancelAnimationFrame(raf); setHud(h => ({ ...h, pontos })); finalizarRodada(pontos, vidas, true); }
        return;
      }
      if (pausa > 0) { pausa -= dt; desenhar(); return; }
      // aluno: vira na hora para trás; nas encruzilhadas usa a direção desejada
      const d = desejo.current;
      if ((d[0] || d[1]) && aluno.dir[0] === -d[0] && aluno.dir[1] === -d[1] && (aluno.ax !== aluno.bx || aluno.ay !== aluno.by)) {
        [aluno.ax, aluno.bx] = [aluno.bx, aluno.ax]; [aluno.ay, aluno.by] = [aluno.by, aluno.ay]; aluno.t = 1 - aluno.t; aluno.dir = d;
      }
      andar(aluno, dt, (x, y) => (livre(mapa, x + desejo.current[0], y + desejo.current[1]) ? desejo.current : livre(mapa, x + aluno.dir[0], y + aluno.dir[1]) ? aluno.dir : [0, 0]), chegouAluno);
      if (acabou) return;
      // quem persegue: sai da sala aos poucos; alterna perseguir (12 s) e ir para o canto (4 s); confuso foge
      if (confuso > 0) { confuso -= dt; if (confuso <= 0) atualizarHud(); }
      const espalhar = relogio % 16 > 12;
      const [ax, ay] = [Math.round(pos(aluno)[0]), Math.round(pos(aluno)[1])];
      for (const p of perseg) {
        if (p.espera > 0) { p.espera -= dt; continue; }
        const vel = p.vel * (confuso > 0 ? 0.55 : 1);
        p.vel = vel; // vale para este passo
        const alvo: [number, number] = espalhar ? p.canto : p.mira === 'adiante' ? [ax + aluno.dir[0] * 3, ay + aluno.dir[1] * 3] : [ax, ay];
        andar(p, dt, (x, y) => escolherDirecao(mapa, x, y, p.dir, confuso > 0 ? [ax, ay] : alvo, confuso > 0));
        p.vel = R.perseguidores.find(q => q.quem === p.quem)!.vel * fator;
        // encontro
        const [qx, qy] = pos(p), [bx, by] = pos(aluno);
        if (Math.hypot(qx - bx, qy - by) < 0.62) {
          if (confuso > 0) {
            pontos += 200; audioService.playCombo();
            Object.assign(p, parado(sala[0], sala[1], p.vel)); p.espera = 2.5;
            avisar(`${PERSEGUIDORES[p.quem].nome} voltou para a sala! (+200)`, 1.6);
          } else {
            vidas -= 1; audioService.playWrong();
            bolha = { quem: p.quem, texto: PERSEGUIDORES[p.quem].pegou, ate: relogio + 2.4 };
            falar([{ texto: PERSEGUIDORES[p.quem].pegou, idioma: 'en-US', personagem: p.quem }]);
            atualizarHud();
            if (vidas <= 0) { acabou = true; aviso = { texto: 'Você foi pego!', ate: relogio + 2.2 }; atualizarHud(); return; }
            reiniciarPosicoes(); bolha.ate = relogio + 2.4;
            return;
          }
        }
      }
      if (Math.floor(relogio * 10) % 5 === 0) atualizarHud();
      desenhar();
    };
    // Fim da rodada: próxima, ou fim do jogo (sem vidas ou depois da terceira).
    const finalizarRodada = (p: number, v: number, _ok: boolean) => {
      if (v <= 0 || rodada + 1 >= RODADAS_FUGA.length) {
        const ganhas = v > 0 ? rodada + 1 : rodada;
        setVenceu(ganhas); setFase('fim'); onFim({ pontos: p });
        if (ganhas) audioService.playVictory(); else audioService.playWrong();
      } else { setHud(h => ({ ...h, pontos: p, vidas: v, coletadas: [], aviso: null })); setRodada(r => r + 1); }
    };
    raf = requestAnimationFrame(laco);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [fase, rodada]); // eslint-disable-line react-hooks/exhaustive-deps

  const comecar = () => { audioService.playClick(); setHud({ pontos: 0, vidas: VIDAS, coletadas: [], aviso: null, passe: 0 }); setVenceu(0); setRodada(0); setFase('jogando'); };
  const R = RODADAS_FUGA[rodada];
  const tema = COLETAS_FUGA[rodada];

  return (
    <Painel tipo="mural" as="section" aria-label="Fuga no corredor" className="p-3 sm:p-4 short:p-2 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="kit-placa px-5 py-1 font-display text-lg short:text-base">Intervalo · Fuga no corredor</span>
        <div className="flex items-center gap-2 flex-wrap">
          {fase === 'jogando' && <>
            <span className="kit-ficha kit-ficha--azul">Rodada {rodada + 1} de {RODADAS_FUGA.length}</span>
            <span className="kit-ficha kit-ficha--sol" aria-label={`${hud.vidas} vidas`}>{'❤'.repeat(Math.max(0, hud.vidas))}<span className="opacity-30">{'❤'.repeat(Math.max(0, VIDAS - hud.vidas))}</span></span>
            <span className="kit-ficha">{hud.pontos} pts</span>
          </>}
          <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); onSair(); }}>Sair</BotaoJogo>
        </div>
      </div>

      {fase === 'instrucoes' && (
        <Painel tipo="papel" liso className="p-4 short:p-2 flex flex-col items-center gap-3 short:gap-1.5 text-center">
          <p className="font-display text-2xl short:text-lg text-nisia-azul-700">Você saiu da sala sem permissão… e alguém viu!</p>
          <div className="flex justify-center gap-3" aria-label="Quem persegue, em ordem">
            {(['vania', 'leia', 'marcio'] as Perseguidor[]).map((p, i) => (
              <figure key={p} className="flex flex-col items-center gap-1">
                <img src={PERSEGUIDORES[p].img} alt="" className="w-16 h-16 short:w-12 short:h-12 rounded-full object-cover object-top border-4" style={{ borderColor: PERSEGUIDORES[p].cor }} />
                <figcaption className="text-xs font-display">{i + 1}. {PERSEGUIDORES[p].nome}</figcaption>
              </figure>
            ))}
          </div>
          <ul className="text-left text-sm sm:text-base short:text-xs max-w-xl list-disc pl-5 space-y-1">
            <li>Ouça o tema em inglês, por exemplo <b>“Collect the feelings!”</b>, e pegue <b>4 palavras certas</b>.</li>
            <li>Palavra fora do tema: <b>−50</b>. Estrelinhas valem pontos extras.</li>
            <li>Pegue o <b>HALL PASS</b>: quem persegue fica confuso — encoste nele e ele volta para a sala.</li>
            <li>Setas ou W A S D. Você tem <b>3 vidas</b>. A cada rodada, quem persegue fica mais rápido e esperto.</li>
          </ul>
          <BotaoJogo cor="laranja" onClick={comecar} autoFocus><Icone nome="jogar" className="w-5 h-5" cor="currentColor" /> Fugir!</BotaoJogo>
        </Painel>
      )}

      {fase === 'jogando' && (
        <>
          <div className="kit-papel rounded-xl px-3 py-1.5 flex items-center justify-center gap-2 flex-wrap text-center">
            <p className="font-display text-xl sm:text-2xl short:text-lg text-nisia-azul-700">{tema.ordem}</p>
            <button type="button" className="kit-btn kit-btn--azul !min-h-0 !py-1 !px-3" aria-label="Ouvir o tema de novo" onClick={() => falar([{ texto: tema.ordem, idioma: 'en-US', personagem: 'professora' }])}><Icone nome="orelha" className="w-5 h-5" cor="currentColor" /></button>
            <span className="text-sm font-semibold text-nisia-tinta/80">{R.nome}</span>
            <span className="flex gap-1" aria-label={`Palavras certas: ${hud.coletadas.length} de ${POR_RODADA}`}>
              {Array.from({ length: POR_RODADA }, (_, i) => <span key={i} className={`px-2 py-0.5 rounded-md text-xs font-display border-2 ${hud.coletadas[i] ? 'bg-nisia-verde-100 border-nisia-verde-500 text-nisia-verde-700' : 'bg-white/70 border-dashed border-nisia-azul-400 text-transparent'}`}>{hud.coletadas[i] ?? '----'}</span>)}
            </span>
          </div>
          <div className="flex gap-3 items-center">
            <div ref={caixaRef} className="relative flex-1 h-[56vh] short:h-[58vh] max-h-[520px] rounded-xl overflow-hidden border-[4px] border-nisia-madeira-escura">
              <canvas ref={canvasRef} className="block" role="img" aria-label={`Corredor. Tema: ${tema.ordem}. Use as setas para fugir.`} />
              {hud.passe > 0 && <span className="absolute left-2 top-2 kit-ficha kit-ficha--sol font-display">HALL PASS · {hud.passe}s</span>}
              {hud.aviso && <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none" role="status"><span className="kit-placa px-5 py-1.5 font-display text-xl short:text-base animate-balao-in">{hud.aviso}</span></div>}
            </div>
            <div className="sm:hidden short:block"><Cruzeta onMover={mover} /></div>
          </div>
        </>
      )}

      {fase === 'fim' && (
        <Painel tipo="papel" liso className="p-5 short:p-2 flex flex-col items-center gap-2 text-center animate-rise-in" role="status">
          <p className="font-display text-3xl short:text-xl text-nisia-azul-700">{venceu === RODADAS_FUGA.length ? 'Escapou até do Diretor Márcio!' : venceu ? 'Boa fuga!' : 'Pego no corredor!'}</p>
          <Estrelas n={venceu} />
          <p className="font-display text-xl short:text-base">{venceu} de {RODADAS_FUGA.length} corredores · {hud.pontos} pontos</p>
          <p className="text-sm text-nisia-tinta/80">Na vida real, peça licença: <b>“May I go to the bathroom, please?”</b></p>
          <div className="flex gap-3 mt-1 flex-wrap justify-center">
            <BotaoJogo cor="papel" onClick={comecar}>Jogar de novo</BotaoJogo>
            <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); onSair(); }}>Voltar às atividades <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
          </div>
        </Painel>
      )}
    </Painel>
  );
};

function shade(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.round(v * 0.95));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
function ret(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
export default FugaCorredor;
