import React, { useEffect, useRef } from 'react';
import { AVATAR_CATALOG } from '../../components/ui/PlayerAvatar';

// Peças comuns dos jogos de grade (labirinto e missão do bebedouro): teclado, botões de direção e o retrato do aluno.
export type Direcao = 'cima' | 'baixo' | 'esq' | 'dir';
export const PASSO: Record<Direcao, [number, number]> = { cima: [0, -1], baixo: [0, 1], esq: [-1, 0], dir: [1, 0] };

/** Chama `mover` ao apertar as setas/WASD (com repetição enquanto segura). */
export function useDirecoes(mover: (d: Direcao) => void, ativo: boolean) {
  const ref = useRef(mover); ref.current = mover;
  useEffect(() => {
    if (!ativo) return undefined;
    const mapa: Record<string, Direcao> = { ArrowUp: 'cima', w: 'cima', W: 'cima', ArrowDown: 'baixo', s: 'baixo', S: 'baixo', ArrowLeft: 'esq', a: 'esq', A: 'esq', ArrowRight: 'dir', d: 'dir', D: 'dir' };
    const segurando = new Map<string, number>();
    const down = (e: KeyboardEvent) => {
      const d = mapa[e.key]; if (!d) return;
      e.preventDefault();
      if (segurando.has(e.key)) return;
      ref.current(d);
      segurando.set(e.key, window.setInterval(() => ref.current(d), 140));
    };
    const up = (e: KeyboardEvent) => { const t = segurando.get(e.key); if (t) { window.clearInterval(t); segurando.delete(e.key); } };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); segurando.forEach(t => window.clearInterval(t)); };
  }, [ativo]);
}

/** Cruz de direção para toque (aparece no celular). */
export const Cruzeta: React.FC<{ onMover: (d: Direcao) => void }> = ({ onMover }) => {
  const repetir = useRef(0);
  const iniciar = (d: Direcao) => { onMover(d); window.clearInterval(repetir.current); repetir.current = window.setInterval(() => onMover(d), 160); };
  const parar = () => window.clearInterval(repetir.current);
  useEffect(() => () => window.clearInterval(repetir.current), []);
  const b = (d: Direcao, rot: string, seta: string, area: string) => (
    <button type="button" aria-label={rot} style={{ gridArea: area }}
      onPointerDown={e => { e.preventDefault(); iniciar(d); }} onPointerUp={parar} onPointerLeave={parar} onPointerCancel={parar}
      className="kit-btn kit-btn--papel !min-h-[48px] !min-w-[48px] !p-0 select-none touch-none font-display text-xl">{seta}</button>
  );
  return (
    <div className="grid gap-1 w-[9.5rem]" style={{ gridTemplateAreas: '". c ." "e . d" ". b ."' }}>
      {b('cima', 'Para cima', '▲', 'c')}{b('esq', 'Para a esquerda', '◀', 'e')}{b('dir', 'Para a direita', '▶', 'd')}{b('baixo', 'Para baixo', '▼', 'b')}
    </div>
  );
};

export function imagemDoAvatar(avatar?: string): HTMLImageElement {
  const img = new Image();
  img.src = AVATAR_CATALOG.find(a => a.id === avatar && a.type === 'image')?.src ?? '/assets/student_boy_hoodie.png';
  return img;
}

/** Desenha o aluno numa célula (retrato dentro de um círculo). */
export function desenharAluno(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cx: number, cy: number, t: number) {
  ctx.save();
  ctx.fillStyle = '#FFD23F'; ctx.strokeStyle = '#0C2A66'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, t * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, t * 0.38, 0, Math.PI * 2); ctx.clip();
  if (img.complete && img.naturalWidth) {
    const h = t * 1.3, w = h * (img.naturalWidth / img.naturalHeight);
    ctx.drawImage(img, cx - w / 2, cy - t * 0.38, w, h);
  }
  ctx.restore();
}

export const calmo = () => { try { return document.documentElement.hasAttribute('data-calmo'); } catch { return false; } };
