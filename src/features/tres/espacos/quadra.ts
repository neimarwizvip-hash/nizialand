import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { colocar, texturaCanvas, type Kit } from '../cenaKit';
import { placaPlano } from './sala';

// ÁREA EXTERNA E QUADRA (Nível 4 — Trabalho em equipe).
// Quadra poliesportiva pintada com as linhas de futsal e basquete, tabelas e traves, arquibancada de concreto,
// alambrado, horta com canteiros, bebedouro, mural externo, o prédio da escola ao fundo e árvores com folhagem de foto.

const QX = 14, QZ = 8; // meia quadra (28 × 16 m)

export function construirQuadra(kit: Kit) {
  kit.acabamento('grama', { tex: 'grama', m: 2.2, cor: 0xd8e8bb, rug: 1, macro: 0.22, contraste: 0x0d0d0d });
  kit.acabamento('calcada', { tex: 'piso', m: 1.6, cor: 0xe6e0d6, rug: 0.6, macro: 0.08, contraste: 0x333333 });
  kit.acabamento('quadraPiso', { tex: 'piso', m: 3.0, cor: 0x4f9e74, rug: 0.55, macro: 0.05, contraste: 0x1c1c1c });
  kit.acabamento('quadraBorda', { tex: 'piso', m: 3.0, cor: 0xc2554a, rug: 0.55, macro: 0.05, contraste: 0x1c1c1c });
  kit.acabamento('concreto', { tex: 'parede', m: 2.0, cor: 0xe2ddd4, rug: 0.95, macro: 0.08, contraste: 0x808080 });
  kit.acabamento('predio', { tex: 'parede', m: 2.4, cor: 0xfaf3e4, rug: 0.95, macro: 0.07, contraste: 0xe8e8e8 });
  kit.acabamento('predioBarrado', { tex: 'parede', m: 2.4, cor: 0x9fbbe8, rug: 0.9, macro: 0.06, contraste: 0xe8e8e8 });
  kit.acabamento('vidro', { cor: 0x5d7aa8, rug: 0.08, metal: 0.6, contraste: 0x000000 });
  kit.acabamento('caixilho', { cor: 0xdfe3e7, rug: 0.3, metal: 0.85, contraste: 0xffffff });
  kit.acabamento('telhado', { cor: 0xb5653a, rug: 0.7, contraste: 0x808080 });
  kit.acabamento('assento', { cor: 0x1f5fd0, rug: 0.45, contraste: 0xffffff });
  kit.acabamento('assentoB', { cor: 0xffd23f, rug: 0.45, contraste: 0xffffff });
  kit.acabamento('metal', { cor: 0x8a8f99, rug: 0.35, metal: 0.8, contraste: 0x808080 });
  kit.acabamento('branco', { cor: 0xf4f4f2, rug: 0.4, contraste: 0xffffff });
  kit.acabamento('aro', { cor: 0xf0641e, rug: 0.4, metal: 0.4, contraste: 0xffd400 });
  kit.acabamento('madeira', { cor: 0x8a5a35, rug: 0.7, contraste: 0x808080 });
  kit.acabamento('terra', { tex: 'grama', m: 1.0, cor: 0x7a5236, rug: 1, contraste: 0x333333 });
  kit.acabamento('folha', { tex: 'folha', cor: 0xffffff, rug: 0.75, contraste: 0x2a2a2a });
  kit.acabamento('tronco', { cor: 0x6b4a2f, rug: 0.9 });
  kit.acabamento('inox', { cor: 0xc9ced6, rug: 0.25, metal: 0.9, contraste: 0xffffff });
  kit.acabamento('cortica', { cor: 0xc49a6c, rug: 0.95, contraste: 0x333333 });
  kit.acabamento('bola', { cor: 0xe8742a, rug: 0.6 });

  // Chão: gramado, calçada em volta da quadra, borda e piso pintado
  kit.bloco('grama', -90, -0.16, -90, 90, -0.1, 90);
  kit.bloco('calcada', -22, -0.1, -15, 22, -0.02, 15.5);
  kit.bloco('quadraBorda', -QX - 2, -0.02, -QZ - 1.6, QX + 2, 0, QZ + 1.6);
  kit.bloco('quadraPiso', -QX, 0, -QZ, QX, 0.006, QZ);

  // Linhas da quadra (futsal + garrafão de basquete), desenhadas em canvas sobre o piso
  const PX = 64; // pixels por metro
  const linhas = texturaCanvas(QX * 2 * PX, QZ * 2 * PX, g => {
    const W = QX * 2 * PX, H = QZ * 2 * PX, m = (v: number) => v * PX;
    g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = m(0.08);
    g.strokeRect(m(0.05), m(0.05), W - m(0.1), H - m(0.1));
    g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.stroke();
    g.beginPath(); g.arc(W / 2, H / 2, m(3), 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.arc(W / 2, H / 2, m(0.15), 0, Math.PI * 2); g.fill();
    for (const lado of [0, 1]) {
      const x = lado ? W : 0, s = lado ? -1 : 1;
      // área do goleiro (futsal)
      g.beginPath(); g.arc(x, H / 2 - m(1.6), m(6), lado ? Math.PI : -Math.PI / 2, lado ? Math.PI * 1.5 : 0); g.stroke();
      g.beginPath(); g.moveTo(x + s * m(6), H / 2 - m(1.6)); g.lineTo(x + s * m(6), H / 2 + m(1.6)); g.stroke();
      g.beginPath(); g.arc(x, H / 2 + m(1.6), m(6), lado ? Math.PI / 2 : 0, lado ? Math.PI : Math.PI / 2); g.stroke();
      // garrafão (basquete), em amarelo
      g.strokeStyle = 'rgba(255,214,63,0.95)';
      g.strokeRect(lado ? W - m(5.8) : 0, H / 2 - m(2.45), m(5.8), m(4.9));
      g.beginPath(); g.arc(x + s * m(5.8), H / 2, m(1.8), 0, Math.PI * 2); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.95)';
    }
  });
  const mLinhas = kit.guardar(new THREE.MeshStandardMaterial({ map: kit.guardar(linhas), transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }));
  const pLinhas = new THREE.Mesh(kit.guardar(new THREE.PlaneGeometry(QX * 2, QZ * 2)), mLinhas);
  pLinhas.rotation.x = -Math.PI / 2; pLinhas.position.y = 0.009; pLinhas.receiveShadow = true; pLinhas.userData.semAO = true;
  kit.scene.add(pLinhas);

  // Tabelas de basquete e traves de futsal nas duas pontas
  for (const s of [-1, 1]) {
    const xb = s * (QX + 1.2);
    kit.bloco('metal', xb - 0.09, 0, -0.09, xb + 0.09, 3.4, 0.09);
    kit.bloco('metal', Math.min(xb, s * (QX - 0.9)) - 0.04, 3.2, -0.04, Math.max(xb, s * (QX - 0.9)) + 0.04, 3.28, 0.04);
    const xt = s * (QX - 0.9);
    kit.bloco('branco', xt - 0.03, 2.6, -0.9, xt + 0.03, 3.65, 0.9);
    kit.bloco('aro', xt - 0.035, 2.85, -0.3, xt + 0.035, 2.89, 0.3);
    const aro = new THREE.TorusGeometry(0.23, 0.015, 8, 24); aro.rotateX(Math.PI / 2); kit.add('aro', colocar(aro, xt - s * 0.27, 3.05, 0));
    const rede = new THREE.CylinderGeometry(0.23, 0.15, 0.4, 16, 1, true); kit.add('branco', colocar(rede, xt - s * 0.27, 2.84, 0));
    // trave de futsal (3 × 2 m)
    const xg = s * QX;
    for (const zz of [-1.5, 1.5]) { const p = new THREE.CylinderGeometry(0.05, 0.05, 2, 12); kit.add('branco', colocar(p, xg, 1, zz)); }
    const tr = new THREE.CylinderGeometry(0.05, 0.05, 3.1, 12); tr.rotateX(Math.PI / 2); kit.add('branco', colocar(tr, xg, 2, 0));
    for (const zz of [-1.5, 1.5]) { const p = new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8); p.rotateZ(Math.PI / 2); kit.add('metal', colocar(p, xg + s * 0.5, 0.02, zz)); }
  }
  // Rede das traves (tela transparente)
  const tela = texturaCanvas(256, 256, g => { g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 3; for (let k = 0; k <= 256; k += 32) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 256); g.stroke(); g.beginPath(); g.moveTo(0, k); g.lineTo(256, k); g.stroke(); } });
  tela.wrapS = tela.wrapT = THREE.RepeatWrapping; tela.repeat.set(6, 4);
  const mTela = kit.guardar(new THREE.MeshStandardMaterial({ map: kit.guardar(tela), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.8 }));
  for (const s of [-1, 1]) { const p = new THREE.Mesh(kit.guardar(new THREE.PlaneGeometry(3.0, 2.0)), mTela); p.position.set(s * (QX + 0.95), 1, 0); p.rotation.y = Math.PI / 2; p.rotation.x = s * 0.25; kit.scene.add(p); }

  // Arquibancada de concreto (lado sul), degraus com assentos pintados
  for (let d = 0; d < 5; d++) {
    const z0 = QZ + 2.4 + d * 0.8;
    kit.bloco('concreto', -12, 0, z0, 12, 0.45 * (d + 1), z0 + 0.8);
    for (let k = -12; k < 12; k += 2) kit.bloco((k / 2 + d) % 2 ? 'assento' : 'assentoB', k + 0.1, 0.45 * (d + 1), z0 + 0.05, k + 1.9, 0.45 * (d + 1) + 0.04, z0 + 0.45);
  }
  // Mochilas e uma bola esquecidas na arquibancada
  for (const [x, d, cor] of [[-7.4, 0, 'assento'], [3.1, 1, 'aro'], [8.6, 0, 'assentoB']] as const) { const m = new RoundedBoxGeometry(0.34, 0.38, 0.18, 3, 0.06); kit.add(cor, colocar(m, x, 0.45 * (d + 1) + 0.2, QZ + 2.8 + d * 0.8)); }
  const bola = new THREE.SphereGeometry(0.11, 20, 14); kit.add('bola', colocar(bola, -2.5, 0.11, 2.6));

  // Alambrado nas laterais (postes, travessas e tela)
  const alambrado = texturaCanvas(256, 256, g => {
    g.strokeStyle = 'rgba(190,196,204,0.9)'; g.lineWidth = 3;
    for (let k = -256; k <= 512; k += 32) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 256, 256); g.stroke(); g.beginPath(); g.moveTo(k + 256, 0); g.lineTo(k, 256); g.stroke(); }
  });
  alambrado.wrapS = alambrado.wrapT = THREE.RepeatWrapping; alambrado.repeat.set(30, 3);
  const mAl = kit.guardar(new THREE.MeshStandardMaterial({ map: kit.guardar(alambrado), transparent: true, alphaTest: 0.25, side: THREE.DoubleSide, metalness: 0.6, roughness: 0.4 }));
  for (const s of [-1, 1]) {
    const x = s * 19.5;
    for (let z = -14; z <= 14; z += 3.5) kit.bloco('metal', x - 0.05, 0, z - 0.05, x + 0.05, 3.2, z + 0.05);
    kit.bloco('metal', x - 0.03, 3.15, -14, x + 0.03, 3.21, 14);
    const p = new THREE.Mesh(kit.guardar(new THREE.PlaneGeometry(28, 3.1)), mAl); p.position.set(x, 1.55, 0); p.rotation.y = Math.PI / 2; kit.scene.add(p);
  }

  // Prédio da escola ao fundo (norte): dois andares, janelas, faixa azul, telhado e placa
  const zp = -QZ - 7, prof = 9, alt = 7.2, larg = 46;
  kit.bloco('predioBarrado', -larg / 2, 0, zp - prof, larg / 2, 1.1, zp);
  kit.bloco('predio', -larg / 2, 1.1, zp - prof, larg / 2, alt, zp);
  kit.bloco('predioBarrado', -larg / 2, 3.55, zp - 0.02, larg / 2, 3.8, zp + 0.02);
  kit.bloco('telhado', -larg / 2 - 0.6, alt, zp - prof - 0.6, larg / 2 + 0.6, alt + 0.35, zp + 0.8);
  for (const y0 of [1.3, 4.6]) for (let x = -larg / 2 + 2; x < larg / 2 - 2; x += 3.2) {
    if (y0 < 2 && Math.abs(x + 0.4) < 2) continue; // porta
    kit.bloco('vidro', x, y0, zp - 0.02, x + 1.9, y0 + 1.5, zp + 0.01);
    kit.bloco('caixilho', x - 0.06, y0 - 0.06, zp, x + 1.96, y0, zp + 0.08);
    kit.bloco('caixilho', x - 0.06, y0 + 1.5, zp, x + 1.96, y0 + 1.56, zp + 0.05);
    kit.bloco('caixilho', x + 0.92, y0, zp, x + 0.98, y0 + 1.5, zp + 0.05);
  }
  kit.bloco('assento', -1.6, 0, zp - 0.05, 0.8, 2.6, zp + 0.03); // porta azul
  kit.bloco('caixilho', -1.7, 2.6, zp, 0.9, 2.7, zp + 0.1);
  const placa = texturaCanvas(2048, 256, g => {
    g.fillStyle = '#1F5FD0'; g.fillRect(0, 0, 2048, 256);
    g.fillStyle = '#FFFFFF'; g.font = '120px "Lilita One", "Fredoka", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('E. M. NÍSIA VILELA FERNANDES', 1024, 136);
  });
  placaPlano(kit, kit.guardar(placa), 12, 1.5, -0.4, 6.1, zp + 0.06, 0);

  // Horta com canteiros (canto noroeste) e mural externo
  for (let k = 0; k < 3; k++) {
    const x0 = -18 + k * 1.6;
    kit.bloco('madeira', x0, 0, 6, x0 + 1.2, 0.35, 10);
    kit.bloco('terra', x0 + 0.06, 0.3, 6.06, x0 + 1.14, 0.34, 9.94);
    for (let j = 0; j < 6; j++) for (let c = 0; c < 2; c++) {
      const f = new THREE.PlaneGeometry(0.42, 0.36); f.translate(0, 0.18, 0); f.rotateY((c * Math.PI) / 2 + j);
      kit.add('folha', colocar(f, x0 + 0.6, 0.33, 6.4 + j * 0.62));
    }
  }
  const plHorta = texturaCanvas(512, 200, g => { g.fillStyle = '#2E9E5B'; g.fillRect(0, 0, 512, 200); g.fillStyle = '#FFF6DF'; g.font = '80px "Lilita One", "Fredoka", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('GARDEN', 256, 104); });
  kit.bloco('madeira', -16.05, 0, 10.6, -15.95, 1.3, 10.7);
  placaPlano(kit, kit.guardar(plHorta), 1.1, 0.43, -16, 1.5, 10.72, 0);
  // Bebedouro de inox junto à arquibancada
  kit.bloco('inox', 13.2, 0, QZ + 2.0, 13.8, 1.0, QZ + 2.4);
  kit.bloco('inox', 13.15, 1.0, QZ + 1.95, 13.85, 1.06, QZ + 2.45);
  const plAgua = texturaCanvas(512, 200, g => { g.fillStyle = '#14A3B8'; g.fillRect(0, 0, 512, 200); g.fillStyle = '#FFFFFF'; g.font = '70px "Lilita One", "Fredoka", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('WATER', 256, 104); });
  placaPlano(kit, kit.guardar(plAgua), 0.8, 0.31, 13.5, 1.55, QZ + 1.93, Math.PI);
  // Mural externo coberto, perto do prédio
  kit.bloco('cortica', 9, 0.9, zp + 1.2, 13, 2.4, zp + 1.3);
  kit.bloco('madeira', 8.9, 0, zp + 1.15, 9.0, 2.6, zp + 1.35); kit.bloco('madeira', 13.0, 0, zp + 1.15, 13.1, 2.6, zp + 1.35);
  kit.bloco('telhado', 8.7, 2.6, zp + 0.9, 13.3, 2.7, zp + 1.7);
  const aviso = texturaCanvas(1024, 400, g => {
    g.fillStyle = '#FFF6DF'; g.fillRect(40, 30, 440, 340); g.fillStyle = '#FFE08A'; g.fillRect(540, 50, 440, 300);
    g.fillStyle = '#1A2A4A'; g.font = '56px "Lilita One", "Fredoka", sans-serif'; g.fillText('TEAM WORK', 80, 110); g.fillText('SPORTS DAY', 580, 125);
    g.font = '40px "Fredoka", sans-serif'; ['Help each other', 'Share the ball', 'Play fair'].forEach((t, i) => g.fillText(t, 80, 190 + i * 60)); ['Friday, 9 a.m.', 'Bring water!'].forEach((t, i) => g.fillText(t, 580, 210 + i * 60));
  });
  placaPlano(kit, kit.guardar(aviso), 3.6, 1.4, 11, 1.65, zp + 1.32, 0);

  // Árvores com folhagem de foto (atrás da arquibancada, nas laterais e perto do prédio)
  const rnd = (k: number) => { const v = Math.sin(k * 12.9898) * 43758.5453; return v - Math.floor(v); };
  const arvore = (x: number, z: number, alto: number, k: number) => {
    kit.bloco('tronco', x - 0.16, -0.1, z - 0.16, x + 0.16, alto * 0.6, z + 0.16);
    for (let c = 0; c < 4; c++) {
      const f = new THREE.PlaneGeometry(alto * 1.0, alto * 0.75); f.translate(0, alto * 0.72, 0); f.rotateY((c * Math.PI) / 4 + k);
      kit.add('folha', colocar(f, x, 0, z));
    }
  };
  let k = 0;
  for (let x = -26; x <= 26; x += 5.5) arvore(x + rnd(k) * 2, 19 + rnd(k + 9) * 4, 5.5 + rnd(k + 3) * 2.5, k++);
  for (const s of [-1, 1]) for (let z = -12; z <= 14; z += 6) arvore(s * (23 + rnd(k) * 3), z + rnd(k + 5) * 2, 5 + rnd(k + 2) * 2.5, k++);

  // Sol da manhã (leste), sombras longas e suaves
  kit.hemi.intensity = 1.25;
  kit.sol.intensity = 3.6;
  kit.sol.position.set(26, 24, 18);
  kit.sol.target.position.set(0, 0, 0);
  Object.assign(kit.sol.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 90 });
  kit.sol.shadow.camera.updateProjectionMatrix();
}

export const CAMERAS_QUADRA = {
  fundo: { pos: [11.5, 4.6, 14.8], alvo: [-3, 0.6, -9], fov: 60 },
  arquibancada: { pos: [0, 2.8, 12.5], alvo: [0, 1.2, -6], fov: 62 },
} as const;
