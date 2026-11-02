import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BotaoJogo, Estrelas, Icone, Painel } from '../../components/kit';
import { AVATAR_CATALOG } from '../../components/ui/PlayerAvatar';
import { audioService } from '../../services/audio';
import { narrar } from '../../services/narracao';

// PULA DISTRAÇÃO (jogo de intervalo, estilo plataforma): o aluno corre pelo corredor até a sala de aula.
// Pule na cabeça das distrações (cartas de bafo do Zé, celular, videogame) para ganhar pontos.
// Antes dos obstáculos aparece o comando em inglês: JUMP! (mochila no chão) ou DUCK! (aviãozinho de papel).

interface Props { dificuldade: 1 | 2 | 3; avatar?: string; onFim: (r: { pontos: number; vidas: number }) => void; onSair: () => void }

type Tipo = 'carta' | 'celular' | 'game' | 'mochila' | 'aviao';
interface Ente { tipo: Tipo; x: number; y: number; w: number; h: number; vivo: boolean; t: number; avisado: boolean; passou?: boolean }
interface Texto { x: number; y: number; texto: string; cor: string; t: number }

const CFG = {
  1: { vel: 230, dur: 40, intervalo: [1.5, 2.3], tipos: ['carta', 'celular', 'carta', 'mochila', 'game'] as Tipo[] },
  2: { vel: 285, dur: 46, intervalo: [1.25, 2.0], tipos: ['carta', 'celular', 'mochila', 'aviao', 'game', 'carta'] as Tipo[] },
  3: { vel: 330, dur: 50, intervalo: [1.05, 1.7], tipos: ['carta', 'mochila', 'aviao', 'celular', 'game', 'aviao'] as Tipo[] },
} as const;
const EMOJI: Record<Tipo, string> = { carta: '🃏', celular: '📱', game: '🎮', mochila: '🎒', aviao: '✈️' };
const PISAVEL: Record<Tipo, boolean> = { carta: true, celular: true, game: true, mochila: false, aviao: false };
const calmo = () => { try { return document.documentElement.hasAttribute('data-calmo'); } catch { return false; } };

export const PulaDistracao: React.FC<Props> = ({ dificuldade, avatar, onFim, onSair }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const caixaRef = useRef<HTMLDivElement>(null);
  const [fase, setFase] = useState<'instrucoes' | 'jogando' | 'fim'>('instrucoes');
  const [hud, setHud] = useState<{ pontos: number; vidas: number; falta: number }>({ pontos: 0, vidas: 3, falta: CFG[dificuldade].dur });
  const [res, setRes] = useState<{ pontos: number; vidas: number; pisadas: number } | null>(null);
  const comando = useRef({ pular: false, abaixar: false });

  useEffect(() => {
    if (fase !== 'jogando') return;
    const canvas = canvasRef.current!, caixa = caixaRef.current!, ctx = canvas.getContext('2d')!;
    let W = 0, H = 0;
    const medir = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = caixa.clientWidth; H = caixa.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    medir(); window.addEventListener('resize', medir);
    const img = new Image();
    const opc = AVATAR_CATALOG.find(a => a.id === avatar && a.type === 'image');
    img.src = opc?.src ?? '/assets/student_boy_hoodie.png';

    const cfg = CFG[dificuldade];
    const lento = calmo() ? 0.75 : 1;
    const vel = cfg.vel * lento;
    const chao = () => H * 0.82;
    const P = { x: 0, y: 0, w: 46, h: 78, vy: 0, noChao: true, abaixado: false, inv: 0 };
    const dimensionar = () => { P.h = Math.max(70, H * 0.3); P.w = P.h * 0.5; };
    dimensionar();
    const entes: Ente[] = [];
    const textos: Texto[] = [];
    let tempo = 0, proximo = 1.2, pontos = 0, vidas = 3, pisadas = 0, desloc = 0, acabou = false, aviso: { texto: string; t: number } | null = null;
    let ultimo = performance.now(), raf = 0;
    P.y = chao() - P.h;

    const criar = () => {
      const tipo = cfg.tipos[Math.floor(Math.random() * cfg.tipos.length)];
      const s = Math.max(38, H * 0.13);
      const y = tipo === 'aviao' ? chao() - P.h - 4 : chao() - s;
      entes.push({ tipo, x: W + 40, y, w: s, h: tipo === 'aviao' ? s * 0.7 : s, vivo: true, t: 0, avisado: false });
    };
    const flutuar = (x: number, y: number, texto: string, cor: string) => textos.push({ x, y, texto, cor, t: 0 });

    const desenhar = () => {
      // corredor: teto com luminárias, parede com cartazes em inglês, armários e barrado
      const c = chao();
      ctx.fillStyle = '#F3E4BE'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#E0C98F'; ctx.fillRect(0, 0, W, H * 0.09);
      const offLuz = (desloc * 0.6) % 220;
      for (let x = -offLuz; x < W + 220; x += 220) { ctx.fillStyle = 'rgba(255,226,122,0.35)'; ctx.beginPath(); ctx.moveTo(x + 20, H * 0.09); ctx.lineTo(x + 100, H * 0.09); ctx.lineTo(x + 140, H * 0.4); ctx.lineTo(x - 20, H * 0.4); ctx.fill(); ctx.fillStyle = '#FFF6DF'; ctx.fillRect(x + 20, H * 0.06, 80, H * 0.03); }
      const offCart = (desloc * 0.5) % 360;
      const palavras = ['READ', 'LEARN', 'RESPECT', 'FOCUS'];
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = 0, x = -offCart; x < W + 360; x += 360, i++) {
        const idx = Math.floor((desloc * 0.5) / 360) + i;
        ctx.fillStyle = ['#7B3FE4', '#F2811D', '#3FA34D', '#E5484D'][idx % 4]; ctx.fillRect(x + 150, H * 0.14, 110, H * 0.13);
        ctx.fillStyle = '#FFF6DF'; ctx.font = `400 ${Math.max(14, H * 0.05)}px "Lilita One", Fredoka, sans-serif`; ctx.fillText(palavras[idx % 4], x + 205, H * 0.205);
      }
      ctx.fillStyle = '#A9CDFF'; ctx.fillRect(0, c - H * 0.12, W, H * 0.12); // barrado
      const passoArm = Math.max(90, H * 0.3), off = desloc % passoArm, hArm = H * 0.36, wArm = passoArm * 0.72;
      for (let x = -off; x < W + passoArm; x += passoArm) { // armários
        ctx.fillStyle = '#1F5FD0'; ctx.fillRect(x + 8, c - hArm, wArm, hArm);
        ctx.fillStyle = '#143F97'; ctx.fillRect(x + 8 + wArm / 2 - 1, c - hArm + 6, 2, hArm - 12);
        for (let k = 0; k < 4; k++) ctx.fillRect(x + 14, c - hArm + 10 + k * 5, wArm / 2 - 12, 2);
        ctx.fillStyle = '#FFD23F'; ctx.fillRect(x + 8 + wArm / 2 - 9, c - hArm * 0.55, 4, 12); ctx.fillRect(x + 8 + wArm / 2 + 5, c - hArm * 0.55, 4, 12);
      }
      ctx.fillStyle = '#C98A4B'; ctx.fillRect(0, chao(), W, H - chao());
      ctx.fillStyle = '#B87A3E'; for (let x = -(desloc % 60); x < W; x += 60) ctx.fillRect(x, chao(), 3, H - chao());
      // chegada
      const restante = (cfg.dur - tempo) * vel;
      if (restante < W) {
        const px = P.x + P.w + restante;
        ctx.fillStyle = '#3FA34D'; ctx.fillRect(px, chao() - 130, 80, 130);
        ctx.fillStyle = '#FFF6DF'; ctx.font = '700 16px Fredoka, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('CLASS', px + 40, chao() - 100);
      }
      // entes
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const e of entes) {
        if (!e.vivo && e.t > 0.4) continue;
        ctx.save();
        ctx.font = `${e.h}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
        if (!e.vivo) { ctx.translate(e.x + e.w / 2, e.y + e.h); ctx.scale(1.2, 0.3); ctx.fillText(EMOJI[e.tipo], 0, -e.h / 2); }
        else ctx.fillText(EMOJI[e.tipo], e.x + e.w / 2, e.y + e.h / 2);
        ctx.restore();
      }
      // aluno
      const ph = P.abaixado ? P.h * 0.6 : P.h;
      if (!(P.inv > 0 && Math.floor(P.inv * 10) % 2 === 0)) {
        if (img.complete && img.naturalWidth) {
          const proporcao = img.naturalWidth / img.naturalHeight;
          const wImg = ph * proporcao;
          ctx.drawImage(img, P.x + P.w / 2 - wImg / 2, P.y + (P.h - ph), wImg, ph);
        } else { ctx.fillStyle = '#1F5FD0'; ctx.fillRect(P.x, P.y + (P.h - ph), P.w, ph); }
      }
      // aviso em inglês
      if (aviso && aviso.t < 1.1) {
        ctx.save(); ctx.globalAlpha = Math.min(1, 2.2 - aviso.t * 2);
        ctx.font = `400 ${Math.max(32, W / 14)}px "Lilita One", Fredoka, sans-serif`; ctx.textAlign = 'center';
        ctx.lineWidth = 8; ctx.strokeStyle = '#0C2A66'; ctx.strokeText(aviso.texto, W / 2, H * 0.28);
        ctx.fillStyle = '#FFD23F'; ctx.fillText(aviso.texto, W / 2, H * 0.28); ctx.restore();
      }
      for (const t of textos) {
        ctx.globalAlpha = Math.max(0, 1 - t.t); ctx.fillStyle = t.cor; ctx.font = '700 20px "Lilita One", Fredoka, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(t.texto, t.x, t.y - t.t * 40); ctx.globalAlpha = 1;
      }
    };

    const passo = (agora: number) => {
      const dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora;
      if (!document.hidden && !acabou) {
        tempo += dt; desloc += vel * dt;
        P.x = W * 0.18;
        // controles
        P.abaixado = comando.current.abaixar && P.noChao;
        if (comando.current.pular && P.noChao) { P.vy = -Math.sqrt(2 * 2600 * Math.max(150, H * 0.42)); P.noChao = false; audioService.playFlip(); }
        P.vy += 2600 * dt; P.y += P.vy * dt;
        if (P.y + P.h >= chao()) { P.y = chao() - P.h; P.vy = 0; P.noChao = true; }
        P.inv = Math.max(0, P.inv - dt);
        // gerar
        proximo -= dt;
        if (proximo <= 0 && tempo < cfg.dur - 2.5) { criar(); const [a, b] = cfg.intervalo; proximo = (a + Math.random() * (b - a)) / lento; }
        // mover e colidir
        const ph = P.abaixado ? P.h * 0.6 : P.h; const py = P.y + (P.h - ph);
        for (const e of entes) {
          e.t += dt;
          if (!e.vivo) continue;
          e.x -= (vel + (e.tipo === 'aviao' ? 120 : PISAVEL[e.tipo] ? 40 : 0)) * dt;
          if (!e.avisado && !PISAVEL[e.tipo] && e.x - P.x < vel * 1.25) {
            e.avisado = true; aviso = { texto: e.tipo === 'aviao' ? 'DUCK!' : 'JUMP!', t: 0 };
            narrar([{ texto: e.tipo === 'aviao' ? 'Duck!' : 'Jump!', idioma: 'en-US', personagem: 'professora' }]);
          }
          const sobre = P.x + P.w * 0.8 > e.x && P.x + P.w * 0.2 < e.x + e.w && py + ph > e.y && py < e.y + e.h;
          if (!sobre) {
            if (!PISAVEL[e.tipo] && e.x + e.w < P.x && !e.passou) { e.passou = true; pontos += 20; flutuar(P.x + 20, py - 10, e.tipo === 'aviao' ? 'Duck! +20' : 'Jump! +20', '#3FA34D'); }
            continue;
          }
          if (PISAVEL[e.tipo] && P.vy > 0 && py + ph - e.y < e.h * 0.55) {
            e.vivo = false; e.t = 0; P.vy = -700; pontos += 50; pisadas += 1;
            flutuar(e.x + e.w / 2, e.y, '+50', '#F2811D'); audioService.playCorrect();
          } else if (P.inv <= 0) {
            vidas -= 1; P.inv = 1.3; flutuar(P.x + 20, py, 'Ai!', '#E5484D'); audioService.playWrong();
            if (!PISAVEL[e.tipo]) e.vivo = false;
          }
        }
        for (let i = entes.length - 1; i >= 0; i--) if (entes[i].x < -80 || (!entes[i].vivo && entes[i].t > 0.4)) entes.splice(i, 1);
        for (let i = textos.length - 1; i >= 0; i--) { textos[i].t += dt; if (textos[i].t > 1) textos.splice(i, 1); }
        if (aviso) aviso.t += dt;
        pontos += dt * 2;
        setHud(h => {
          const n = { pontos: Math.floor(pontos), vidas, falta: Math.max(0, Math.ceil(cfg.dur - tempo)) };
          return n.pontos === h.pontos && n.vidas === h.vidas && n.falta === h.falta ? h : n;
        });
        if (vidas <= 0 || tempo >= cfg.dur) {
          acabou = true;
          const final = { pontos: Math.floor(pontos) + (vidas > 0 ? 100 : 0), vidas: Math.max(0, vidas), pisadas };
          setRes(final); setFase('fim');
          if (vidas > 0) audioService.playFanfare(); else audioService.playWrong();
          onFim({ pontos: final.pontos, vidas: final.vidas });
        }
      }
      desenhar();
      if (!acabou) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', medir); };
  }, [fase, dificuldade, avatar]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const set = (e: KeyboardEvent, v: boolean) => {
      if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) { e.preventDefault(); comando.current.pular = v; }
      if (['ArrowDown', 's', 'S'].includes(e.key)) { e.preventDefault(); comando.current.abaixar = v; }
    };
    const d = (e: KeyboardEvent) => set(e, true), u = (e: KeyboardEvent) => set(e, false);
    window.addEventListener('keydown', d); window.addEventListener('keyup', u);
    return () => { window.removeEventListener('keydown', d); window.removeEventListener('keyup', u); };
  }, []);

  const botao = useCallback((k: 'pular' | 'abaixar', rotulo: string) => (
    <button type="button" aria-label={rotulo}
      onPointerDown={e => { e.preventDefault(); comando.current[k] = true; }} onPointerUp={() => { comando.current[k] = false; }} onPointerLeave={() => { comando.current[k] = false; }} onPointerCancel={() => { comando.current[k] = false; }}
      className="kit-btn kit-btn--papel !min-h-[56px] !px-6 select-none touch-none font-display text-lg">{rotulo}</button>
  ), []);

  return (
    <Painel tipo="mural" as="section" aria-label="Pula distração" className="p-3 sm:p-4 short:p-2 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="kit-placa px-5 py-1 font-display text-lg short:text-base">Intervalo · Pula distração</span>
        <div className="flex items-center gap-2">
          {fase === 'jogando' && <>
            <span className="kit-ficha kit-ficha--sol">{hud.pontos} pts</span>
            <span className="kit-ficha kit-ficha--erro">{'♥'.repeat(Math.max(0, hud.vidas))}</span>
            <span className="kit-ficha kit-ficha--azul">Sala em {hud.falta}s</span>
          </>}
          <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); onSair(); }}>Sair</BotaoJogo>
        </div>
      </div>
      {fase === 'instrucoes' && (
        <Painel tipo="papel" liso className="p-4 short:p-2 flex flex-col items-center gap-3 short:gap-1.5 text-center">
          <p className="font-display text-2xl short:text-lg text-nisia-azul-700">Corra até a sala de aula sem se distrair!</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xl sm:text-2xl short:text-base" aria-hidden="true"><span>🃏 📱 🎮 → pule em cima!</span><span>🎒 → JUMP!</span><span>✈️ → DUCK!</span></div>
          <ul className="text-left text-sm sm:text-base short:text-xs max-w-xl list-disc pl-5 space-y-1">
            <li><b>Pular:</b> barra de espaço ou ↑. <b>Abaixar:</b> ↓.</li>
            <li>Pule na cabeça das distrações do Zé para ganhar <b>50 pontos</b>. Encostou de lado, perde uma vida.</li>
            <li>Quando aparecer <b>JUMP!</b> ou <b>DUCK!</b>, faça o que a instrução em inglês pede.</li>
          </ul>
          <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); setFase('jogando'); }} autoFocus><Icone nome="jogar" className="w-5 h-5" cor="currentColor" /> Começar</BotaoJogo>
        </Painel>
      )}
      {fase === 'jogando' && (
        <>
          <div ref={caixaRef} className="relative w-full h-[55vh] short:h-[60vh] max-h-[460px] rounded-xl overflow-hidden border-[4px] border-nisia-madeira-escura">
            <canvas ref={canvasRef} className="block" role="img" aria-label="Corredor da escola. Pule com espaço ou seta para cima, abaixe com seta para baixo." />
          </div>
          <div className="flex justify-between gap-2 sm:hidden short:flex">{botao('abaixar', 'Abaixar')}{botao('pular', 'Pular')}</div>
        </>
      )}
      {fase === 'fim' && res && (
        <Painel tipo="papel" liso className="p-5 short:p-2 flex flex-col items-center gap-2 text-center animate-rise-in" role="status">
          <p className="font-display text-3xl short:text-xl text-nisia-azul-700">{res.vidas > 0 ? 'Chegou na aula a tempo!' : 'As distrações venceram desta vez!'}</p>
          <Estrelas n={res.vidas >= 3 ? 3 : res.vidas >= 2 ? 2 : res.vidas >= 1 ? 1 : 0} />
          <p className="font-display text-xl short:text-base">{res.pontos} pontos · {res.pisadas} distrações derrubadas</p>
          <div className="flex gap-3 mt-1">
            <BotaoJogo cor="papel" onClick={() => { setRes(null); setHud({ pontos: 0, vidas: 3, falta: CFG[dificuldade].dur }); setFase('jogando'); }}>Jogar de novo</BotaoJogo>
            <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); onSair(); }}>Voltar às atividades <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
          </div>
        </Painel>
      )}
    </Painel>
  );
};
