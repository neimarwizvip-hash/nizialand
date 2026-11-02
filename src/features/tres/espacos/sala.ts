import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { texturaCanvas, type Kit } from '../cenaKit';

// SALA DE AULA (Nível 3 — dentro das salas do corredor; também as salas do Nível 4).
// Lousa verde com a aula de inglês, carteiras em fileiras, janelas para o jardim (sol entrando), mural de regras,
// alfabeto sobre a lousa, mesa da professora, ventiladores de teto e porta azul igual à do corredor.

export const SALA = { x0: -4, x1: 4, z0: -4.6, z1: 4.6, h: 3.1 };
const JANELAS = [-2.5, 0.1, 2.7];
const JL = 1.8, PEITORIL = 0.95, VERGA = 2.45;

const giz = 'rgba(245,241,230,0.93)';

function placaPlano(kit: Kit, tex: THREE.Texture, w: number, h: number, x: number, y: number, z: number, rotY: number, emissivo = 0) {
  const m = kit.guardar(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
  if (emissivo) { m.emissive = new THREE.Color(0xffffff); m.emissiveMap = tex; m.emissiveIntensity = emissivo; }
  const p = new THREE.Mesh(kit.guardar(new THREE.PlaneGeometry(w, h)), m);
  p.position.set(x, y, z); p.rotation.y = rotY; p.receiveShadow = true;
  kit.scene.add(p);
  return p;
}

export function construirSala(kit: Kit) {
  const { x0, x1, z0, z1, h } = SALA;
  const E = 0.18;
  kit.acabamento('piso', { tex: 'piso', m: 1.2, cor: 0xffffff, rug: 0.35, macro: 0.06, contraste: 0x1c1c1c });
  kit.acabamento('parede', { tex: 'parede', m: 2.0, cor: 0xfdf8ef, rug: 0.95, macro: 0.07, contraste: 0xe8e8e8 });
  kit.acabamento('barrado', { tex: 'parede', m: 2.0, cor: 0xb9cdee, rug: 0.9, macro: 0.06, contraste: 0xe8e8e8 });
  kit.acabamento('forro', { tex: 'parede', m: 2.4, cor: 0xffffff, rug: 0.95, macro: 0.03, contraste: 0x111111 });
  kit.acabamento('grama', { tex: 'grama', m: 2.2, cor: 0xd8e8bb, rug: 1, macro: 0.22, contraste: 0x0d0d0d });
  kit.acabamento('folha', { tex: 'folha', cor: 0xffffff, rug: 0.75, contraste: 0x2a2a2a });
  kit.acabamento('tronco', { cor: 0x6b4a2f, rug: 0.9 });
  kit.acabamento('muro', { tex: 'parede', m: 2.4, cor: 0xe8dcc6, rug: 0.95, macro: 0.12 });
  kit.acabamento('rodape', { cor: 0x9a6a42, rug: 0.55, contraste: 0xffd400 });
  kit.acabamento('caixilho', { cor: 0xdfe3e7, rug: 0.3, metal: 0.85, contraste: 0xffffff });
  kit.acabamento('madeira', { cor: 0xb98250, rug: 0.55, contraste: 0x808080 });
  kit.acabamento('madeiraEscura', { cor: 0x7a4f2c, rug: 0.6, contraste: 0x808080 });
  kit.acabamento('tampo', { cor: 0xd8b07c, rug: 0.5, contraste: 0xbbbbbb });
  kit.acabamento('metal', { cor: 0x8a8f99, rug: 0.35, metal: 0.8, contraste: 0x808080 });
  kit.acabamento('assento', { cor: 0x1f5fd0, rug: 0.45, contraste: 0xffffff });
  kit.acabamento('porta', { cor: 0x1f5fd0, rug: 0.45, contraste: 0xffffff });
  kit.acabamento('batente', { cor: 0xf4f1ea, rug: 0.4, contraste: 0xffd400 });
  kit.acabamento('luminaria', { cor: 0xfff8e6, rug: 0.3, emissivo: 1.6 });
  kit.acabamento('cortica', { cor: 0xc49a6c, rug: 0.95, contraste: 0x333333 });
  kit.acabamento('lousaMoldura', { cor: 0x8a5a2b, rug: 0.5, contraste: 0xffd400 });
  kit.acabamento('ventilador', { cor: 0x3a3f4a, rug: 0.4, metal: 0.5 });
  for (const [n, c] of Object.entries({ mochilaA: 0xf08a24, mochilaB: 0x8a5cf6, mochilaC: 0xe2483d, mochilaD: 0x2e9e5b, cadernoA: 0xfff6df, cadernoB: 0x1f5fd0, cadernoC: 0xffd23f })) kit.acabamento(n, { cor: c, rug: 0.7 });

  // Piso, forro e o gramado lá fora
  kit.bloco('piso', x0, -0.1, z0, x1, 0, z1);
  kit.bloco('forro', x0 - E, h, z0 - E, x1 + E, h + 0.1, z1 + E);
  kit.bloco('grama', -70, -0.16, -70, x0 - E, -0.1, 70);
  kit.bloco('grama', x0 - E, -0.16, z1 + E, 70, -0.1, 70);

  // Parede esquerda com três janelas para o jardim
  let zTopo = z1;
  const xa = x0 - E, xb = x0;
  for (const zc of [...JANELAS].sort((a, b) => b - a)) {
    const a = zc - JL / 2, b = zc + JL / 2;
    kit.bloco('parede', xa, 1.0, b, xb, h, zTopo); kit.bloco('barrado', xa, 0, b, xb, 1.0, zTopo);
    kit.bloco('barrado', xa, 0, a, xb, PEITORIL, b); kit.bloco('parede', xa, VERGA, a, xb, h, b);
    kit.bloco('caixilho', xb - 0.05, PEITORIL - 0.04, a, xb + 0.08, PEITORIL, b);
    kit.bloco('caixilho', xb - 0.04, VERGA, a, xb + 0.04, VERGA + 0.05, b);
    for (const zz of [a, (a + b) / 2 - 0.025, b - 0.05]) kit.bloco('caixilho', xb - 0.03, PEITORIL, zz, xb + 0.03, VERGA, zz + 0.05);
    kit.bloco('caixilho', xb - 0.03, 1.75, a, xb + 0.03, 1.79, b);
    zTopo = a;
  }
  kit.bloco('parede', xa, 1.0, z0, xb, h, zTopo); kit.bloco('barrado', xa, 0, z0, xb, 1.0, zTopo);
  // Parede da frente (lousa), do fundo e da direita (porta perto da frente)
  kit.bloco('parede', x0 - E, 1.0, z0 - E, x1 + E, h, z0); kit.bloco('barrado', x0 - E, 0, z0 - E, x1 + E, 1.0, z0);
  kit.bloco('parede', x0 - E, 1.0, z1, x1 + E, h, z1 + E); kit.bloco('barrado', x0 - E, 0, z1, x1 + E, 1.0, z1 + E);
  const pz = -3.3, pl = 1.0;
  kit.bloco('parede', x1, 1.0, pz + pl / 2, x1 + E, h, z1); kit.bloco('barrado', x1, 0, pz + pl / 2, x1 + E, 1.0, z1);
  kit.bloco('parede', x1, 1.0, z0, x1 + E, h, pz - pl / 2); kit.bloco('barrado', x1, 0, z0, x1 + E, 1.0, pz - pl / 2);
  kit.bloco('parede', x1, 2.2, pz - pl / 2, x1 + E, h, pz + pl / 2);
  kit.bloco('porta', x1 + 0.02, 0.01, pz - pl / 2, x1 + 0.06, 2.18, pz + pl / 2);
  kit.bloco('batente', x1 - 0.05, 0, pz - pl / 2 - 0.08, x1 + 0.02, 2.26, pz - pl / 2);
  kit.bloco('batente', x1 - 0.05, 0, pz + pl / 2, x1 + 0.02, 2.26, pz + pl / 2 + 0.08);
  kit.bloco('batente', x1 - 0.05, 2.18, pz - pl / 2 - 0.08, x1 + 0.02, 2.26, pz + pl / 2 + 0.08);
  kit.bloco('metal', x1 - 0.06, 1.0, pz + 0.3, x1 + 0.02, 1.05, pz + 0.42);
  // Rodapé e faixa do barrado
  for (const [ax, az, bx, bz] of [[x0, z0, x0 + 0.02, z1], [x1 - 0.02, z0, x1, z1], [x0, z0, x1, z0 + 0.02], [x0, z1 - 0.02, x1, z1]]) {
    kit.bloco('rodape', ax, 0, az, bx, 0.12, bz); kit.bloco('rodape', ax, 0.98, az, bx, 1.04, bz);
  }

  // Luminárias e dois ventiladores de teto
  for (const lx of [-1.8, 1.8]) for (const lz of [-2.6, 0, 2.6]) kit.bloco('luminaria', lx - 0.55, h - 0.03, lz - 0.16, lx + 0.55, h, lz + 0.16);
  for (const vz of [-1.3, 1.6]) {
    kit.bloco('ventilador', -0.03, h - 0.45, vz - 0.03, 0.03, h, vz + 0.03);
    const cubo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16); cubo.translate(0, h - 0.5, vz); kit.add('ventilador', cubo);
    for (let k = 0; k < 4; k++) {
      const p = new THREE.BoxGeometry(0.75, 0.015, 0.14); p.translate(0.48, 0, 0); p.rotateY(k * Math.PI / 2 + 0.4); p.translate(0, h - 0.5, vz);
      kit.add('ventilador', p);
    }
  }

  // Lousa verde com a aula de inglês (giz), moldura e calha do giz
  const lw = 4.4, lh = 1.35, ly = 1.62;
  kit.bloco('lousaMoldura', -lw / 2 - 0.08, ly - lh / 2 - 0.08, z0, lw / 2 + 0.08, ly + lh / 2 + 0.08, z0 + 0.04);
  kit.bloco('lousaMoldura', -lw / 2, ly - lh / 2 - 0.12, z0, lw / 2, ly - lh / 2 - 0.06, z0 + 0.14);
  const lousa = texturaCanvas(1600, 490, g => {
    g.fillStyle = '#2F6B57'; g.fillRect(0, 0, 1600, 490);
    // marcas de apagador
    for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,255,255,${0.025 + (i % 3) * 0.01})`; g.beginPath(); g.ellipse(100 + (i * 173) % 1450, 60 + (i * 97) % 380, 120, 26, (i % 5) * 0.3, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = giz; g.textBaseline = 'top';
    g.font = '44px "Fredoka", sans-serif'; g.fillText('Monday, November 2nd', 60, 40);
    g.font = '96px "Lilita One", "Fredoka", sans-serif'; g.textAlign = 'center'; g.fillText('ENGLISH CLASS', 800, 120);
    g.font = '52px "Fredoka", sans-serif'; g.fillText('Today: classroom objects & rules', 800, 250);
    g.textAlign = 'left'; g.font = '44px "Fredoka", sans-serif';
    g.fillText('desk · chair · board · book · pen', 160, 345);
    g.fillText('Raise your hand, please!', 860, 345);
    g.strokeStyle = giz; g.lineWidth = 5; g.beginPath(); g.moveTo(560, 228); g.lineTo(1040, 228); g.stroke();
    // solzinho no canto
    g.beginPath(); g.arc(1470, 90, 34, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; g.beginPath(); g.moveTo(1470 + Math.cos(a) * 46, 90 + Math.sin(a) * 46); g.lineTo(1470 + Math.cos(a) * 66, 90 + Math.sin(a) * 66); g.stroke(); }
  });
  placaPlano(kit, kit.guardar(lousa), lw, lh, 0, ly, z0 + 0.045, 0);

  // Alfabeto colorido sobre a lousa
  const alfabeto = texturaCanvas(2048, 128, g => {
    const cores = ['#E2483D', '#F08A24', '#F2B705', '#2E9E5B', '#1F5FD0', '#8A5CF6'];
    g.fillStyle = '#FFF6DF'; g.fillRect(0, 0, 2048, 128);
    g.font = '60px "Lilita One", "Fredoka", sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center';
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((l, i) => { g.fillStyle = cores[i % cores.length]; g.fillText(l + l.toLowerCase(), 40 + i * 76.6, 68); });
  });
  placaPlano(kit, kit.guardar(alfabeto), 6.4, 0.4, 0, 2.72, z0 + 0.02, 0);

  // Relógio na parede da frente
  const relogio = texturaCanvas(256, 256, g => {
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(128, 128, 120, 0, Math.PI * 2); g.fill();
    g.lineWidth = 12; g.strokeStyle = '#1A2A4A'; g.stroke();
    g.fillStyle = '#1A2A4A'; for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; g.fillRect(128 + Math.cos(a) * 92 - 4, 128 + Math.sin(a) * 92 - 4, 8, 8); }
    g.lineCap = 'round'; g.lineWidth = 9; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + 50 * Math.cos(-0.9), 128 + 50 * Math.sin(-0.9)); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 48); g.stroke();
  });
  const relogioMalha = placaPlano(kit, kit.guardar(relogio), 0.42, 0.42, 3.0, 2.45, z0 + 0.02, 0);
  (relogioMalha.material as THREE.MeshStandardMaterial).transparent = true;

  // Mesa da professora (frente, à esquerda) com livros, maçã e globo
  const mx = -2.4, mz = -3.2;
  kit.bloco('madeira', mx - 0.75, 0.72, mz - 0.38, mx + 0.75, 0.77, mz + 0.38);
  kit.bloco('madeiraEscura', mx - 0.72, 0.05, mz + 0.3, mx + 0.72, 0.72, mz + 0.35);
  kit.bloco('madeiraEscura', mx - 0.72, 0, mz - 0.36, mx - 0.66, 0.72, mz + 0.36);
  kit.bloco('madeiraEscura', mx + 0.66, 0, mz - 0.36, mx + 0.72, 0.72, mz + 0.36);
  kit.bloco('cadernoB', mx - 0.5, 0.77, mz - 0.1, mx - 0.2, 0.83, mz + 0.12);
  kit.bloco('mochilaC', mx - 0.48, 0.83, mz - 0.08, mx - 0.22, 0.88, mz + 0.1);
  kit.bloco('cadernoC', mx - 0.46, 0.88, mz - 0.07, mx - 0.24, 0.92, mz + 0.09);
  const maca = new THREE.SphereGeometry(0.05, 14, 10); maca.translate(mx + 0.1, 0.82, mz + 0.05); kit.add('mochilaC', maca);
  const globo = new THREE.SphereGeometry(0.13, 20, 14); globo.translate(mx + 0.48, 0.98, mz - 0.05); kit.add('assento', globo);
  kit.bloco('madeiraEscura', mx + 0.44, 0.77, mz - 0.09, mx + 0.52, 0.85, mz - 0.01);

  // Carteiras em fileiras (4 × 4): tampo, estrutura de metal, cadeira azul; cadernos e mochilas variados
  const colunas = [-2.2, -0.75, 0.75, 2.2], fileiras = [-1.3, 0.25, 1.8, 3.35];
  let n = 0;
  for (const fz of fileiras) for (const cx of colunas) {
    n++;
    kit.bloco('tampo', cx - 0.36, 0.71, fz - 0.26, cx + 0.36, 0.74, fz + 0.26);
    for (const [dx, dz] of [[-0.32, -0.22], [0.32, -0.22], [-0.32, 0.22], [0.32, 0.22]]) kit.bloco('metal', cx + dx - 0.015, 0, fz + dz - 0.015, cx + dx + 0.015, 0.71, fz + dz + 0.015);
    kit.bloco('metal', cx - 0.33, 0.5, fz - 0.2, cx + 0.33, 0.52, fz + 0.2);
    // cadeira (atrás da carteira, virada para a lousa)
    const cz = fz + 0.48;
    kit.bloco('assento', cx - 0.21, 0.44, cz - 0.2, cx + 0.21, 0.47, cz + 0.2);
    kit.bloco('assento', cx - 0.21, 0.6, cz + 0.17, cx + 0.21, 0.88, cz + 0.2);
    for (const [dx, dz] of [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]]) kit.bloco('metal', cx + dx - 0.012, 0, cz + dz - 0.012, cx + dx + 0.012, 0.44, cz + dz + 0.012);
    kit.bloco('metal', cx - 0.19, 0.47, cz + 0.17, cx - 0.17, 0.6, cz + 0.19); kit.bloco('metal', cx + 0.17, 0.47, cz + 0.17, cx + 0.19, 0.6, cz + 0.19);
    // caderno aberto ou fechado, às vezes um estojo
    const cad = ['cadernoA', 'cadernoB', 'cadernoC'][n % 3];
    kit.bloco(cad, cx - 0.16 + (n % 2) * 0.05, 0.74, fz - 0.1, cx + 0.12 + (n % 2) * 0.05, 0.755, fz + 0.12);
    if (n % 4 === 1) kit.bloco('mochilaA', cx + 0.15, 0.74, fz - 0.18, cx + 0.3, 0.78, fz - 0.12);
    // mochila pendurada em algumas cadeiras
    if (n % 3 !== 0) {
      const mb = ['mochilaA', 'mochilaB', 'mochilaC', 'mochilaD'][n % 4];
      const corpo = new RoundedBoxGeometry(0.34, 0.36, 0.17, 4, 0.06); corpo.translate(cx, 0.68, cz + 0.29); kit.add(mb, corpo);
      const bolso = new RoundedBoxGeometry(0.26, 0.17, 0.08, 3, 0.035); bolso.translate(cx, 0.6, cz + 0.39); kit.add(mb, bolso);
      for (const s of [-1, 1]) kit.bloco('ventilador', cx + s * 0.09 - 0.015, 0.72, cz + 0.2, cx + s * 0.09 + 0.015, 0.86, cz + 0.215);
    }
  }

  // Mural de cortiça com as regras da sala (parede da direita) e cartaz de vocabulário (fundo)
  kit.bloco('cortica', x1 - 0.04, 1.05, -1.6, x1, 2.25, 1.4);
  kit.bloco('lousaMoldura', x1 - 0.06, 1.0, -1.65, x1 - 0.02, 1.05, 1.45);
  const regras = texturaCanvas(800, 1000, g => {
    g.fillStyle = '#FFF6DF'; g.fillRect(0, 0, 800, 1000);
    g.fillStyle = '#1F5FD0'; g.fillRect(0, 0, 800, 170);
    g.fillStyle = '#FFFFFF'; g.font = '86px "Lilita One", "Fredoka", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CLASS RULES', 400, 92);
    g.textAlign = 'left'; g.font = '58px "Fredoka", sans-serif'; g.fillStyle = '#1A2A4A';
    ['1. Raise your hand', '2. Listen carefully', '3. Be kind', '4. Be on time', '5. Take turns'].forEach((t, i) => g.fillText(t, 70, 280 + i * 140));
  });
  placaPlano(kit, kit.guardar(regras), 0.9, 1.1, x1 - 0.05, 1.65, -0.85, -Math.PI / 2);
  const palavras = texturaCanvas(900, 650, g => {
    g.fillStyle = '#FFE08A'; g.fillRect(0, 0, 900, 650);
    g.fillStyle = '#E2483D'; g.font = '80px "Lilita One", "Fredoka", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('My English words', 450, 90);
    g.fillStyle = '#1A2A4A'; g.font = '56px "Fredoka", sans-serif';
    [['book', 'pen'], ['ruler', 'eraser'], ['desk', 'chair']].forEach(([a, b], i) => { g.fillText(a, 250, 230 + i * 140); g.fillText(b, 650, 230 + i * 140); });
  });
  placaPlano(kit, kit.guardar(palavras), 1.0, 0.72, x1 - 0.05, 1.7, 0.75, -Math.PI / 2);
  const bemvindo = texturaCanvas(1400, 400, g => {
    g.fillStyle = '#2E9E5B'; g.fillRect(0, 0, 1400, 400);
    g.fillStyle = '#FFFFFF'; g.font = '150px "Lilita One", "Fredoka", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('WELCOME!', 700, 160);
    g.font = '64px "Fredoka", sans-serif'; g.fillText('Turma 801 · English', 700, 310);
  });
  placaPlano(kit, kit.guardar(bemvindo), 2.4, 0.68, -1.0, 2.15, z1 - 0.02, Math.PI);
  // Estante baixa com caixas no fundo
  kit.bloco('madeira', 1.0, 0, z1 - 0.42, 3.6, 0.9, z1 - 0.02);
  for (let k = 0; k < 4; k++) kit.bloco(['mochilaA', 'mochilaB', 'mochilaD', 'cadernoC'][k], 1.12 + k * 0.62, 0.92, z1 - 0.38, 1.6 + k * 0.62, 1.2, z1 - 0.08);

  // Jardim lá fora (árvores com folhagem fotográfica) e muro ao fundo
  const rnd = (k: number) => { const x = Math.sin(k * 12.9898) * 43758.5453; return x - Math.floor(x); };
  for (let k = 0; k < 7; k++) {
    const z = -9 + k * 3.4 + rnd(k) * 1.5, x = x0 - 4 - rnd(k + 3) * 6, alto = 4.4 + rnd(k * 7) * 2;
    kit.bloco('tronco', x - 0.12, -0.1, z - 0.12, x + 0.12, alto * 0.62, z + 0.12);
    for (let c = 0; c < 3; c++) {
      const g = new THREE.PlaneGeometry(alto * 0.95, alto * 0.7); g.translate(0, alto * 0.7, 0); g.rotateY((c * Math.PI) / 3 + k); g.translate(x, 0, z);
      kit.add('folha', g);
    }
  }
  kit.bloco('muro', x0 - 16, -0.1, -40, x0 - 15.7, 1.8, 40);

  // Luz interna: o forro e o piso claros (hemisfério com o chão claro) e o sol pelas janelas
  kit.hemi.groundColor.setHex(0xf2ece2);
  kit.hemi.intensity = 1.1; kit.sol.intensity = 4.6;
  kit.sol.position.set(-14, 9, 4);
  kit.sol.target.position.set(0, 0, 0);
  Object.assign(kit.sol.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
  kit.sol.shadow.camera.updateProjectionMatrix();
}

/** Câmeras de cada enquadramento (fundo do quadro, fundo da atividade). */
export const CAMERAS_SALA = {
  fundo: { pos: [2.6, 1.85, 4.2], alvo: [-0.4, 0.7, -4.6], fov: 64 }, // lousa no terço de cima (o painel da atividade fica no meio)
  lousa: { pos: [0.4, 1.45, 2.6], alvo: [0, 1.55, -4.6], fov: 58 },
} as const;
