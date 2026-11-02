import React, { useEffect, useRef, useState } from 'react';
import { criarKit } from './cenaKit';
import { qualidadeInicial, type Qualidade } from './base3d';
import { ESPACOS, type NomeEspaco } from './espacos';

// Mostra um espaço 3D da escola com uma câmera fixa (com leve respiração, desligada no modo calmo).
// Usado na vistoria e para gerar as imagens de fundo dos níveis (scripts de captura).
interface Props { nome: NomeEspaco; camera?: string; qualidade?: Qualidade; contraste?: boolean; respirar?: boolean; semPos?: boolean; className?: string }

export const Espaco3D: React.FC<Props> = ({ nome, camera = 'fundo', qualidade, contraste = false, respirar = true, semPos = false, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [falhou, setFalhou] = useState(false);
  useEffect(() => {
    const mount = ref.current;
    if (!mount) return undefined;
    const espaco = ESPACOS[nome];
    let kit: ReturnType<typeof criarKit>;
    try { kit = criarKit(mount, { qualidade: qualidade ?? qualidadeInicial(), contraste, exposicao: espaco.exposicao, semPos }); } catch { setFalhou(true); return undefined; }
    espaco.construir(kit);
    const cam = espaco.cameras[camera] ?? Object.values(espaco.cameras)[0];
    kit.camera.fov = cam.fov; kit.camera.position.set(cam.pos[0], cam.pos[1], cam.pos[2]); kit.camera.lookAt(cam.alvo[0], cam.alvo[1], cam.alvo[2]); kit.camera.updateProjectionMatrix();
    const base = kit.camera.position.clone();
    const calmo = document.documentElement.hasAttribute('data-calmo') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const w = window as unknown as { __nisiaEspaco?: { pronto: boolean; nome: string } };
    w.__nisiaEspaco = { pronto: false, nome };
    kit.finalizar().then(() => { w.__nisiaEspaco = { pronto: true, nome }; });
    const ro = new ResizeObserver(() => kit.ajustar()); ro.observe(mount);
    let raf = 0; const t0 = performance.now();
    const laco = (agora: number) => {
      raf = requestAnimationFrame(laco);
      if (respirar && !calmo) {
        const t = (agora - t0) / 1000;
        kit.camera.position.set(base.x + Math.sin(t * 0.15) * 0.12, base.y + Math.sin(t * 0.21) * 0.03, base.z);
        kit.camera.lookAt(cam.alvo[0], cam.alvo[1], cam.alvo[2]);
      }
      kit.render();
    };
    raf = requestAnimationFrame(laco);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); kit.dispose(); };
  }, [nome, camera, qualidade, contraste, respirar, semPos]);
  if (falhou) return null;
  return <div ref={ref} className={`absolute inset-0 ${className}`} aria-hidden="true" />;
};
export default Espaco3D;
