import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Livros, colocar, texturaCanvas, type Kit } from '../cenaKit';
import { placaPlano } from './sala';

// BIBLIOTECA (Nível 6 — Consequências).
// Estantes altas cheias de livros nas paredes, estantes baixas no meio, mesas de leitura, cantinho com pufes e tapete,
// balcão da bibliotecária com computador, janelas com luz da manhã, luminárias pendentes e placas em inglês.

const B = { x0: -6, x1: 6, z0: -5, z1: 5, h: 3.4 };
const JANELAS = [-2.8, 0, 2.8];

export function construirBiblioteca(kit: Kit) {
  const { x0, x1, z0, z1, h } = B;
  const E = 0.2;
  kit.acabamento('piso', { tex: 'piso', m: 1.0, cor: 0xffe6bf, rug: 0.4, macro: 0.06, contraste: 0x1c1c1c });
  kit.acabamento('parede', { tex: 'parede', m: 2.0, cor: 0xf6ecd8, rug: 0.95, macro: 0.07, contraste: 0xe8e8e8 });
  kit.acabamento('lambri', { tex: 'parede', m: 2.0, cor: 0xb98250, rug: 0.7, macro: 0.05, contraste: 0xe8e8e8 });
  kit.acabamento('forro', { tex: 'parede', m: 2.4, cor: 0xffffff, rug: 0.95, macro: 0.03, contraste: 0x111111 });
  kit.acabamento('grama', { tex: 'grama', m: 2.2, cor: 0xd8e8bb, rug: 1, macro: 0.22, contraste: 0x0d0d0d });
  kit.acabamento('folha', { tex: 'folha', cor: 0xffffff, rug: 0.75, contraste: 0x2a2a2a });
  kit.acabamento('tronco', { cor: 0x6b4a2f, rug: 0.9 });
  kit.acabamento('caixilho', { cor: 0xdfe3e7, rug: 0.3, metal: 0.85, contraste: 0xffffff });
  kit.acabamento('estante', { cor: 0x7a4f2c, rug: 0.6, contraste: 0x808080 });
  kit.acabamento('mesa', { cor: 0xc89a64, rug: 0.5, contraste: 0xbbbbbb });
  kit.acabamento('cadeira', { cor: 0x2e9e5b, rug: 0.5, contraste: 0xffffff });
  kit.acabamento('metal', { cor: 0x8a8f99, rug: 0.35, metal: 0.8, contraste: 0x808080 });
  kit.acabamento('pufeA', { cor: 0xf08a24, rug: 0.85 });
  kit.acabamento('pufeB', { cor: 0x8a5cf6, rug: 0.85 });
  kit.acabamento('pufeC', { cor: 0x14a3b8, rug: 0.85 });
  kit.acabamento('monitor', { cor: 0x22252c, rug: 0.3, metal: 0.4 });
  kit.acabamento('tela', { cor: 0x9fd0ff, rug: 0.2, emissivo: 0.9 });
  kit.acabamento('vaso', { cor: 0xc0673f, rug: 0.85 });
  kit.acabamento('luminaria', { cor: 0x2b2d42, rug: 0.4, metal: 0.5 });
  kit.acabamento('lampada', { cor: 0xffe2b0, rug: 0.3, emissivo: 1.8 });
  kit.acabamento('livroSolto', { cor: 0xb23a48, rug: 0.7 });
  kit.acabamento('livroSolto2', { cor: 0x2f6690, rug: 0.7 });
  const livros = new Livros(11);

  // Piso, forro, paredes (janelas à esquerda), lambri de madeira embaixo
  kit.bloco('piso', x0, -0.1, z0, x1, 0, z1);
  kit.bloco('forro', x0 - E, h, z0 - E, x1 + E, h + 0.1, z1 + E);
  kit.bloco('grama', -70, -0.16, -70, x0 - E, -0.1, 70);
  let zTopo = z1;
  for (const zc of [...JANELAS].sort((a, b) => b - a)) {
    const a = zc - 0.9, b = zc + 0.9;
    kit.bloco('parede', x0 - E, 1.0, b, x0, h, zTopo); kit.bloco('lambri', x0 - E, 0, b, x0, 1.0, zTopo);
    kit.bloco('lambri', x0 - E, 0, a, x0, 0.9, b); kit.bloco('parede', x0 - E, 2.6, a, x0, h, b);
    kit.bloco('caixilho', x0 - 0.05, 0.86, a, x0 + 0.1, 0.9, b);
    for (const zz of [a, (a + b) / 2 - 0.025, b - 0.05]) kit.bloco('caixilho', x0 - 0.03, 0.9, zz, x0 + 0.03, 2.6, zz + 0.05);
    kit.bloco('caixilho', x0 - 0.03, 2.6, a, x0 + 0.03, 2.65, b);
    zTopo = a;
  }
  kit.bloco('parede', x0 - E, 1.0, z0, x0, h, zTopo); kit.bloco('lambri', x0 - E, 0, z0, x0, 1.0, zTopo);
  for (const [a0, a1, b0, b1] of [[x0 - E, x1 + E, z0 - E, z0], [x0 - E, x1 + E, z1, z1 + E], [x1, x1 + E, z0, z1]]) {
    kit.bloco('parede', a0, 1.0, b0, a1, h, b1); kit.bloco('lambri', a0, 0, b0, a1, 1.0, b1);
  }
  // Almofadas no peitoril das janelas (bancos de leitura)
  for (const zc of JANELAS) { const p = new RoundedBoxGeometry(0.45, 0.12, 1.6, 3, 0.05); kit.add(zc === 0 ? 'pufeB' : 'pufeC', colocar(p, x0 + 0.25, 0.96, zc)); kit.bloco('estante', x0, 0, zc - 0.85, x0 + 0.5, 0.9, zc + 0.85); }

  // Estante: armação de madeira (juntada) + livros (instanciados). base em x,z virada para rotY.
  const estante = (x: number, z: number, rotY: number, larg: number, alt: number, prats: number, duplaFace = false) => {
    const prof = duplaFace ? 0.6 : 0.36;
    const base = new THREE.Matrix4().makeRotationY(rotY).setPosition(x, 0, z);
    const g = (geo: THREE.BufferGeometry) => { geo.applyMatrix4(base); kit.add('estante', geo); };
    const box = (w: number, hh: number, d: number, px: number, py: number, pz: number) => { const b = new THREE.BoxGeometry(w, hh, d); b.translate(px, py, pz); g(b); };
    box(0.05, alt, prof, -larg / 2, alt / 2, 0); box(0.05, alt, prof, larg / 2, alt / 2, 0);
    if (!duplaFace) box(larg, alt, 0.02, 0, alt / 2, -prof / 2 + 0.01); else box(larg, alt, 0.02, 0, alt / 2, 0);
    const passo = (alt - 0.1) / prats;
    for (let i = 0; i <= prats; i++) box(larg, 0.04, prof, 0, 0.04 + i * passo, 0);
    for (let i = 0; i < prats; i++) {
      livros.prateleira(base, -larg / 2 + 0.05, larg / 2 - 0.05, 0.06 + i * passo, duplaFace ? 0.17 : 0.03);
      if (duplaFace) livros.prateleira(new THREE.Matrix4().makeRotationY(rotY + Math.PI).setPosition(x, 0, z), -larg / 2 + 0.05, larg / 2 - 0.05, 0.06 + i * passo, 0.17);
    }
  };
  // Paredes do fundo e da direita: estantes altas
  for (let x = -5.0; x <= 5.0; x += 2.0) estante(x, z0 + 0.2, 0, 1.95, 2.7, 6);
  for (let z = -3.6; z <= 1.2; z += 2.0) estante(x1 - 0.2, z, -Math.PI / 2, 1.95, 2.7, 6);
  // Estantes baixas de dupla face no meio-esquerdo
  estante(-3.2, -1.6, Math.PI / 2, 2.2, 1.5, 3, true);
  estante(-1.5, -1.6, Math.PI / 2, 2.2, 1.5, 3, true);

  // Mesas de leitura com cadeiras verdes, livros abertos e um globo
  for (const [mx, mz] of [[1.6, -0.6], [1.6, 2.2]]) {
    kit.bloco('mesa', mx - 1.1, 0.72, mz - 0.55, mx + 1.1, 0.76, mz + 0.55);
    for (const [dx, dz] of [[-1.0, -0.45], [1.0, -0.45], [-1.0, 0.45], [1.0, 0.45]]) kit.bloco('metal', mx + dx - 0.025, 0, mz + dz - 0.025, mx + dx + 0.025, 0.72, mz + dz + 0.025);
    for (const s of [-1, 1]) for (const dx of [-0.6, 0.6]) {
      const cz = mz + s * 0.82;
      kit.bloco('cadeira', mx + dx - 0.21, 0.44, cz - 0.2, mx + dx + 0.21, 0.47, cz + 0.2);
      kit.bloco('cadeira', mx + dx - 0.21, 0.6, cz + s * 0.18 - 0.015, mx + dx + 0.21, 0.88, cz + s * 0.18 + 0.015);
      for (const [ex, ez] of [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]]) kit.bloco('metal', mx + dx + ex - 0.012, 0, cz + ez - 0.012, mx + dx + ex + 0.012, 0.44, cz + ez + 0.012);
    }
    kit.bloco('livroSolto', mx - 0.7, 0.76, mz - 0.2, mx - 0.3, 0.79, mz + 0.08);
    kit.bloco('livroSolto2', mx + 0.25, 0.76, mz + 0.05, mx + 0.6, 0.8, mz + 0.3);
  }
  const globo = new THREE.SphereGeometry(0.16, 20, 14); kit.add('pufeC', colocar(globo, 2.4, 0.98, -0.75));
  kit.bloco('estante', 2.36, 0.76, -0.79, 2.44, 0.82, -0.71);

  // Cantinho da leitura: tapete redondo, pufes e almofadas (frente-esquerda)
  const tapete = texturaCanvas(512, 512, g => {
    const cores = ['#F2B705', '#E2483D', '#1F5FD0', '#2E9E5B', '#8A5CF6'];
    for (let i = 5; i > 0; i--) { g.fillStyle = cores[i % cores.length]; g.beginPath(); g.arc(256, 256, i * 50, 0, Math.PI * 2); g.fill(); }
  });
  const mTap = kit.guardar(new THREE.MeshStandardMaterial({ map: kit.guardar(tapete), transparent: true, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2 }));
  const pTap = new THREE.Mesh(kit.guardar(new THREE.CircleGeometry(1.5, 48)), mTap);
  pTap.rotation.x = -Math.PI / 2; pTap.position.set(-3.0, 0.006, 2.6); pTap.receiveShadow = true; kit.scene.add(pTap);
  ['pufeA', 'pufeB', 'pufeC'].forEach((c, i) => {
    const p = new THREE.SphereGeometry(0.42, 22, 16); p.scale(1, 0.62, 1);
    const a = (i / 3) * Math.PI * 2 + 0.6;
    kit.add(c, colocar(p, -3.0 + Math.cos(a) * 0.95, 0.26, 2.6 + Math.sin(a) * 0.95));
  });
  // Balcão da bibliotecária com computador (frente-direita) e carrinho de devolução
  kit.bloco('estante', 3.0, 0, 3.6, 5.2, 1.05, 4.2);
  kit.bloco('mesa', 2.95, 1.05, 3.55, 5.25, 1.1, 4.25);
  kit.bloco('monitor', 3.9, 1.1, 3.75, 4.5, 1.14, 3.95);
  kit.bloco('monitor', 4.17, 1.14, 3.82, 4.23, 1.35, 3.88);
  kit.bloco('monitor', 3.75, 1.3, 3.83, 4.65, 1.8, 3.87);
  kit.bloco('tela', 3.79, 1.34, 3.825, 4.61, 1.76, 3.83);
  kit.bloco('livroSolto', 3.2, 1.1, 3.7, 3.5, 1.2, 3.95);
  kit.bloco('livroSolto2', 3.22, 1.2, 3.72, 3.48, 1.26, 3.93);
  // Vasos com plantas nos cantos
  for (const [vx, vz] of [[-5.5, -4.5], [5.4, 4.5], [-5.5, 4.4]]) {
    const v = new THREE.CylinderGeometry(0.22, 0.17, 0.45, 16); kit.add('vaso', colocar(v, vx, 0.225, vz));
    for (let c = 0; c < 3; c++) { const f = new THREE.PlaneGeometry(0.9, 1.0); f.translate(0, 0.95, 0); f.rotateY((c * Math.PI) / 3); kit.add('folha', colocar(f, vx, 0, vz)); }
  }

  // Luminárias pendentes (luz quente)
  for (const lx of [-3, 0.5, 3.5]) for (const lz of [-2.2, 1.6]) {
    kit.bloco('luminaria', lx - 0.01, h - 0.7, lz - 0.01, lx + 0.01, h, lz + 0.01);
    const c = new THREE.CylinderGeometry(0.16, 0.3, 0.24, 20, 1, true); kit.add('luminaria', colocar(c, lx, h - 0.82, lz));
    const l = new THREE.SphereGeometry(0.09, 12, 8); kit.add('lampada', colocar(l, lx, h - 0.9, lz));
  }

  // Placas e cartazes em inglês
  const placa = (txt: string, sub: string, fundo: string, w: number, hh: number, x: number, y: number, z: number, rot: number) => {
    const t = texturaCanvas(1024, Math.round(1024 * hh / w), g => {
      const H = Math.round(1024 * hh / w);
      g.fillStyle = fundo; g.fillRect(0, 0, 1024, H);
      g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `${Math.round(H * (sub ? 0.42 : 0.58))}px "Lilita One", "Fredoka", sans-serif`; g.fillText(txt, 512, sub ? H * 0.4 : H * 0.54);
      if (sub) { g.font = `${Math.round(H * 0.2)}px "Fredoka", sans-serif`; g.fillText(sub, 512, H * 0.78); }
    });
    placaPlano(kit, kit.guardar(t), w, hh, x, y, z, rot);
  };
  placa('LIBRARY', 'Read, think, share', '#143F97', 2.2, 0.55, -1.0, 3.05, z0 + 0.4, 0);
  placa('SILENCE, PLEASE', '', '#2E9E5B', 1.6, 0.32, x1 - 0.21, 2.95, -1.4, -Math.PI / 2);
  placa('READING IS FUN!', 'Every book is an adventure', '#E2483D', 1.4, 0.8, x0 + 0.01, 1.85, 4.2, Math.PI / 2);
  placa('RETURN BOOKS HERE', '', '#F08A24', 1.4, 0.26, 4.1, 1.32, 4.26, 0);

  // Jardim visto pelas janelas
  const rnd = (k: number) => { const v = Math.sin(k * 12.9898) * 43758.5453; return v - Math.floor(v); };
  for (let k = 0; k < 6; k++) {
    const z = -8 + k * 3.4 + rnd(k) * 1.5, x = x0 - 4 - rnd(k + 3) * 5, alto = 4.4 + rnd(k * 7) * 2;
    kit.bloco('tronco', x - 0.12, -0.1, z - 0.12, x + 0.12, alto * 0.62, z + 0.12);
    for (let c = 0; c < 3; c++) { const f = new THREE.PlaneGeometry(alto * 0.95, alto * 0.7); f.translate(0, alto * 0.7, 0); f.rotateY((c * Math.PI) / 3 + k); kit.add('folha', colocar(f, x, 0, z)); }
  }

  livros.criar(kit);
  // Luz: manhã entrando pelas janelas + ambiente quente
  kit.hemi.color.setHex(0xfff2dc); kit.hemi.groundColor.setHex(0xf0e2c8);
  kit.hemi.intensity = 1.35; kit.sol.intensity = 4.8;
  kit.sol.position.set(-14, 8, 3);
  kit.sol.target.position.set(0, 0, 0);
  Object.assign(kit.sol.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 });
  kit.sol.shadow.camera.updateProjectionMatrix();
}

export const CAMERAS_BIBLIOTECA = {
  fundo: { pos: [0.9, 1.95, 4.75], alvo: [-1.0, 0.85, -4.6], fov: 66 },
  leitura: { pos: [-4.8, 1.5, 4.2], alvo: [2, 1.0, -3], fov: 62 },
} as const;
