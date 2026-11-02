import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BotaoJogo, Estrelas, Icone, Painel } from '../../components/kit';
import { audioService } from '../../services/audio';
import { narrar } from '../../services/narracao';
import { CHEGADA, DIRECOES, LUGARES, portaErrada } from '../../data/frasesIntervalo';
import { DELTA, dicaDeDirecao, gerarLabirinto, type Lab, type Lado, type Porta } from './labirintoLogica';
import { Labirinto } from './Labirinto';
import { TEX, caixa, criarPosAlta, guardarQualidade, instalarTom, placaCanvas, preferencia, prepararMacro, qualidadeInicial, type Composer, type Qualidade } from '../tres/base3d';

// LABIRINTO DA ESCOLA EM 3D, primeira pessoa (intervalo do Nível 4).
// Três etapas graduais, cada uma num espaço diferente da escola, para o jogo não cansar:
//   1. Corredor das salas (4×4)   2. Biblioteca, entre estantes (5×5)   3. Jardim, labirinto de cerca viva a céu aberto (6×6)
// Ouça o destino em inglês ("Go to the library!") e ache a porta certa. Pedir direção: o Mané responde em inglês
// ("Turn left."), contando a partir de para onde o aluno está olhando. Porta errada: −5 segundos.
// Padrão 3D do projeto (Rota Piloto AEE v5): Alta (fotos 1K, relevo, rugosidade/oclusão, GTAO, MSAA) e Econômico
// (fotos 512 com relevo, sem pós-processamento); seletor visível (Q), alto contraste (C), modo calmo (M), minimapa,
// teclado completo, botões de toque grandes e avisos em região aria-live. Sem WebGL: cai na versão 2D.

interface Props { avatar?: string; onFim: (r: { pontos: number }) => void; onSair: () => void }

type Cena = 'corredor' | 'biblioteca' | 'jardim';
interface Etapa { cena: Cena; nome: string; chamada: string; c: number; l: number; portas: number; tempo: number; ajudas: number }
export const ETAPAS_3D: Etapa[] = [
  { cena: 'corredor', nome: 'Corredor das salas', chamada: 'Comece pelos corredores conhecidos.', c: 4, l: 4, portas: 3, tempo: 75, ajudas: 3 },
  { cena: 'biblioteca', nome: 'Biblioteca', chamada: 'Agora entre as estantes: o labirinto cresceu.', c: 5, l: 5, portas: 4, tempo: 95, ajudas: 3 },
  { cena: 'jardim', nome: 'Jardim da escola', chamada: 'Lá fora, a cerca viva é alta. Menos ajudas!', c: 6, l: 6, portas: 4, tempo: 115, ajudas: 2 },
];

const CEL = 3.2;      // metros por célula
const ESP = 0.24;     // espessura da parede
const RAIO = 0.34;    // raio do aluno (colisão)
const OLHO = 1.55;
const VEL = 2.3;
const PERTO = 1.25;   // distância para "bater" na porta

// Acabamento de cada espaço: cor sobre a foto (a foto dá o relevo real), altura das paredes e luz.
const CENAS: Record<Cena, { piso: string; pisoCor: number; pisoM: number; parede: string; paredeCor: number; barradoCor: number | null; barrado: number; altura: number; forro: boolean; ceu: boolean; luz: number; exposicao: number }> = {
  corredor: { piso: 'piso', pisoCor: 0xf2f0ec, pisoM: 1.6, parede: 'parede', paredeCor: 0xfaf5ec, barradoCor: 0xb9cdee, barrado: 1.1, altura: 3.0, forro: true, ceu: false, luz: 0xfffaf0, exposicao: 1.3 },
  biblioteca: { piso: 'piso', pisoCor: 0xeadbc0, pisoM: 1.2, parede: 'parede', paredeCor: 0xf3e8d2, barradoCor: 0xb07a48, barrado: 0.95, altura: 3.2, forro: true, ceu: false, luz: 0xffe7c2, exposicao: 1.22 },
  jardim: { piso: 'grama', pisoCor: 0xe2f0c4, pisoM: 2.2, parede: 'grama', paredeCor: 0x9cc878, barradoCor: null, barrado: 0, altura: 2.3, forro: false, ceu: true, luz: 0xfff0d8, exposicao: 1.25 },
};
const CORES_PORTA = [0x1f5fd0, 0xe2483d, 0x2e9e5b, 0xf08a24, 0x8a5cf6, 0x14a3b8];

interface Estado { x: number; z: number; giro: number }
interface Controles { frente: number; tras: number; esq: number; dir: number }

// ---------- A cena 3D de uma etapa ----------
interface CenaProps {
  lab: Lab; cena: Cena; qualidade: Qualidade; contraste: boolean; calmo: boolean; pausado: boolean;
  estado: React.MutableRefObject<Estado>; controles: React.MutableRefObject<Controles>;
  visitadas: React.MutableRefObject<Set<number>>; minimapa: React.RefObject<HTMLCanvasElement>;
  onPorta: (p: Porta) => void; onFalha: () => void; onLento: () => void;
}

const Cena3D: React.FC<CenaProps> = ({ lab, cena, qualidade, contraste, calmo, pausado, estado, controles, visitadas, minimapa, onPorta, onFalha, onLento }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const pausadoRef = useRef(pausado); pausadoRef.current = pausado;
  const cb = useRef({ onPorta, onFalha, onLento }); cb.current = { onPorta, onFalha, onLento };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    instalarTom();
    const alta = qualidade === 'alta';
    const A = CENAS[cena];
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, stencil: false, powerPreference: 'high-performance' }); } catch { cb.current.onFalha(); return undefined; }
    let escala = 1;
    const razao = () => Math.max(0.5, Math.min(window.devicePixelRatio || 1, alta ? 2 : 1.5) * escala);
    renderer.setPixelRatio(razao());
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.CustomToneMapping;
    renderer.toneMappingExposure = A.exposicao;
    renderer.shadowMap.enabled = A.ceu && !contraste;
    renderer.shadowMap.type = alta ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.filter = calmo && !contraste ? 'saturate(0.75)' : '';
    mount.appendChild(renderer.domElement);

    const descartar: Array<{ dispose: () => void }> = [];
    const guardar = <T extends { dispose: () => void }>(o: T) => { descartar.push(o); return o; };
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.05, 120);
    const W = lab.c * CEL, L = lab.l * CEL;

    // Luz: hemisfério + ambiente de foto (PMREM) + uma luz quente que acompanha o aluno (profundidade nos corredores).
    const hemi = new THREE.HemisphereLight(A.luz, A.ceu ? 0x7c8f5a : 0xd8c8a8, contraste ? 2.2 : A.ceu ? 1.3 : 1.6);
    scene.add(hemi);
    const lanterna = new THREE.PointLight(A.luz, contraste ? 0 : A.ceu ? 0 : 9, 10, 2);
    scene.add(lanterna);
    let sol: THREE.DirectionalLight | null = null;
    if (A.ceu) {
      sol = new THREE.DirectionalLight(0xfff0d8, contraste ? 1.5 : 3.2);
      sol.position.set(W / 2 + 14, 22, L / 2 + 8);
      sol.target.position.set(W / 2, 0, L / 2);
      sol.castShadow = !contraste;
      const tam = alta ? 2048 : 1024;
      sol.shadow.mapSize.set(tam, tam);
      const meia = Math.max(W, L) * 0.75;
      Object.assign(sol.shadow.camera, { left: -meia, right: meia, top: meia, bottom: -meia, near: 1, far: 70 });
      sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.03;
      scene.add(sol, sol.target);
    }
    if (contraste) scene.background = new THREE.Color(0x000000);
    else if (!A.ceu) scene.background = new THREE.Color(0x2a2620);

    // Materiais (foto + cor). No alto contraste: cores chapadas de alto contraste, sem fotos.
    const mats: THREE.MeshStandardMaterial[] = [];
    const mat = (cor: number, tex?: string, macro = 0, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
      const m = guardar(new THREE.MeshStandardMaterial({ color: cor, roughness: 0.9, metalness: 0, ...extra }));
      if (tex && !contraste) { m.userData.tex = tex; if (macro) prepararMacro(m, macro); }
      mats.push(m);
      return m;
    };
    const mPiso = mat(contraste ? 0x1c1c1c : new THREE.Color(A.pisoCor).multiplyScalar(A.piso === 'piso' ? 1.3 : 1).getHex(), A.piso, A.ceu ? 0.22 : 0.06);
    const mParede = mat(contraste ? 0xe8e8e8 : new THREE.Color(A.paredeCor).multiplyScalar(A.ceu ? 1 : 1.12).getHex(), A.parede, A.ceu ? 0.18 : 0.07);
    const mBarrado = A.barradoCor !== null ? mat(contraste ? 0xe8e8e8 : A.barradoCor, A.parede, 0.06) : null;
    const mForro = A.forro ? mat(contraste ? 0x111111 : 0xfbfaf7, 'parede', 0.03) : null;
    const mRodape = mat(contraste ? 0xffd400 : cena === 'biblioteca' ? 0x5a3a20 : 0x9a6a42, undefined, 0, { roughness: 0.55 });

    // Piso e forro
    const piso = new THREE.Mesh(guardar(caixa(-0.5, -0.1, -0.5, W + 0.5, 0, L + 0.5, CENAS[cena].pisoM)), mPiso);
    piso.receiveShadow = true; scene.add(piso);
    if (mForro) { const f = new THREE.Mesh(guardar(caixa(-0.5, A.altura, -0.5, W + 0.5, A.altura + 0.1, L + 0.5, 2.4)), mForro); scene.add(f); }

    // Paredes: segmentos sem repetição (de cima e da esquerda de cada célula, mais as bordas de baixo e da direita).
    const segH = (x: number, y: number) => (x < 0 || x >= lab.c ? false : y < lab.l ? lab.paredes[y][x][0] : lab.paredes[y - 1][x][2]);
    const segV = (x: number, y: number) => (y < 0 || y >= lab.l ? false : x < lab.c ? lab.paredes[y][x][3] : lab.paredes[y][x - 1][1]);
    const geoAlta: THREE.BufferGeometry[] = [], geoBaixa: THREE.BufferGeometry[] = [], geoRodape: THREE.BufferGeometry[] = [];
    const h0 = mBarrado ? A.barrado : 0;
    const m = A.ceu ? 1.2 : 2.0;
    const parede = (x0: number, z0: number, x1: number, z1: number) => {
      geoAlta.push(caixa(x0, h0, z0, x1, A.altura, z1, m));
      if (mBarrado) geoBaixa.push(caixa(x0, 0, z0, x1, h0, z1, m));
      if (!A.ceu) { const r = 0.012; geoRodape.push(caixa(x0 - r, 0, z0 - r, x1 + r, 0.12, z1 + r, 1)); }
    };
    for (let y = 0; y <= lab.l; y++) for (let x = 0; x < lab.c; x++) if (segH(x, y)) parede(x * CEL - ESP / 2, y * CEL - ESP / 2, (x + 1) * CEL + ESP / 2, y * CEL + ESP / 2);
    for (let y = 0; y < lab.l; y++) for (let x = 0; x <= lab.c; x++) if (segV(x, y)) parede(x * CEL - ESP / 2, y * CEL - ESP / 2, x * CEL + ESP / 2, (y + 1) * CEL + ESP / 2);
    const juntar = (lista: THREE.BufferGeometry[], mt: THREE.Material | null) => {
      if (!lista.length || !mt) return;
      const g = guardar(mergeGeometries(lista)); lista.forEach(x => x.dispose());
      const malha = new THREE.Mesh(g, mt); malha.castShadow = true; malha.receiveShadow = true; scene.add(malha);
    };
    juntar(geoAlta, mParede); juntar(geoBaixa, mBarrado); juntar(geoRodape, mRodape);

    // Faces internas livres (para portas e mobília): célula + lado.
    const faces: Array<{ x: number; y: number; lado: Lado }> = [];
    for (let y = 0; y < lab.l; y++) for (let x = 0; x < lab.c; x++) for (const lado of [0, 1, 2, 3] as Lado[]) {
      if (lab.paredes[y][x][lado] && !lab.portas.some(p => p.x === x && p.y === y && p.lado === lado)) faces.push({ x, y, lado });
    }
    // Posiciona um objeto colado à face (z local = saindo da parede para dentro da célula).
    const naFace = (obj: THREE.Object3D, x: number, y: number, lado: Lado, afast = 0) => {
      const [dx, dz] = DELTA[lado];
      const cx = (x + 0.5) * CEL, cz = (y + 0.5) * CEL;
      const d = CEL / 2 - ESP / 2 - afast;
      obj.position.set(cx + dx * d, obj.position.y, cz + dz * d);
      obj.rotation.y = Math.atan2(-dx, -dz);
      scene.add(obj);
    };

    // Portas: folha colorida, batente, maçaneta e placa com ícone e o nome em inglês.
    const gPorta = guardar(new THREE.BoxGeometry(1.16, 2.12, 0.07));
    const gBatV = guardar(new THREE.BoxGeometry(0.1, 2.24, 0.12)), gBatH = guardar(new THREE.BoxGeometry(1.4, 0.1, 0.12));
    const gMac = guardar(new THREE.SphereGeometry(0.045, 12, 8));
    const gPlaca = guardar(new THREE.PlaneGeometry(1.5, 0.56));
    const mBatente = mat(contraste ? 0xffd400 : 0xf4f1ea, undefined, 0, { roughness: 0.4 });
    const mMac = mat(contraste ? 0xffd400 : 0xd9dde2, undefined, 0, { roughness: 0.25, metalness: 0.9 });
    const posPorta = new Map<Porta, THREE.Vector3>();
    lab.portas.forEach(p => {
      const g = new THREE.Group();
      const folha = new THREE.Mesh(gPorta, mat(contraste ? 0xffffff : CORES_PORTA[p.lugar % CORES_PORTA.length], undefined, 0, { roughness: 0.45 }));
      folha.position.set(0, 1.06, 0.035); folha.castShadow = true; g.add(folha);
      const e = new THREE.Mesh(gBatV, mBatente); e.position.set(-0.63, 1.12, 0.05); g.add(e);
      const d = e.clone(); d.position.x = 0.63; g.add(d);
      const t = new THREE.Mesh(gBatH, mBatente); t.position.set(0, 2.24, 0.05); g.add(t);
      const mac = new THREE.Mesh(gMac, mMac); mac.position.set(0.42, 1.02, 0.1); g.add(mac);
      const tex = guardar(placaCanvas(LUGARES[p.lugar].emoji, LUGARES[p.lugar].en, contraste ? '#000000' : '#143F97'));
      const placa = new THREE.Mesh(gPlaca, guardar(new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })));
      placa.position.set(0, Math.min(A.altura - 0.38, 2.68), 0.03); placa.userData.semAO = true; g.add(placa);
      naFace(g, p.x, p.y, p.lado, 0);
      posPorta.set(p, g.position.clone());
    });

    // Mobília de cada espaço (cor sólida sobre arquitetura fotográfica, como no corredor 3D).
    const sorteio = (() => { let s = lab.portas.reduce((a, p) => a * 31 + p.x * 7 + p.y * 13 + p.lugar, 17) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();
    if (cena === 'biblioteca') {
      // Estantes com livros (uma malha instanciada para todos os livros).
      const mMadeira = mat(contraste ? 0x808080 : 0x7a4f2c, undefined, 0, { roughness: 0.6 });
      const gLat = guardar(new THREE.BoxGeometry(0.05, 2.3, 0.3)), gPrat = guardar(new THREE.BoxGeometry(CEL - 0.9, 0.04, 0.3)), gFundo = guardar(new THREE.BoxGeometry(CEL - 0.9, 2.3, 0.02));
      const escolhidas = faces.filter(() => sorteio() < 0.8);
      const livros = new THREE.InstancedMesh(guardar(new THREE.BoxGeometry(1, 1, 1)), mat(0xffffff, undefined, 0, { roughness: 0.7 }), escolhidas.length * 5 * 16);
      const cores = [0xb23a48, 0x2f6690, 0x3a7d44, 0xd9a441, 0x6c4f8c, 0xe07a5f, 0x2b2d42, 0xf2e8cf];
      const tmp = new THREE.Object3D(); let n = 0;
      const largura = CEL - 0.9;
      escolhidas.forEach(f => {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(gFundo, mMadeira).translateY(1.15).translateZ(0.01));
        for (const s of [-1, 1]) g.add(new THREE.Mesh(gLat, mMadeira).translateX(s * largura / 2).translateY(1.15).translateZ(0.15));
        for (let i = 0; i < 6; i++) g.add(new THREE.Mesh(gPrat, mMadeira).translateY(0.04 + i * 0.44).translateZ(0.15));
        g.children.forEach(c => { c.castShadow = true; c.receiveShadow = true; });
        naFace(g, f.x, f.y, f.lado, 0);
        g.updateMatrixWorld(true);
        for (let prat = 0; prat < 5; prat++) {
          let px = -largura / 2 + 0.06;
          while (px < largura / 2 - 0.12 && n < livros.count) {
            const esp = 0.04 + sorteio() * 0.05, alt = 0.24 + sorteio() * 0.13;
            if (sorteio() < 0.08) { px += 0.12; continue; } // vão na prateleira
            tmp.position.set(px + esp / 2, 0.06 + prat * 0.44 + alt / 2, 0.16);
            tmp.rotation.set(0, 0, sorteio() < 0.06 ? 0.18 : 0);
            tmp.scale.set(esp, alt, 0.2 + sorteio() * 0.05);
            tmp.updateMatrix();
            livros.setMatrixAt(n, new THREE.Matrix4().multiplyMatrices(g.matrixWorld, tmp.matrix));
            livros.setColorAt(n, new THREE.Color(contraste ? 0xbbbbbb : cores[Math.floor(sorteio() * cores.length)]));
            n++; px += esp + 0.004;
          }
        }
      });
      livros.count = n; livros.castShadow = true; livros.receiveShadow = true;
      scene.add(livros);
    } else if (cena === 'corredor') {
      // Armários de aço e murais de avisos, como no corredor das salas.
      const mArm = mat(contraste ? 0x808080 : 0xf08a24, undefined, 0, { roughness: 0.45, metalness: 0.55 });
      const mFresta = mat(0x5a3a18, undefined, 0, { roughness: 0.6, metalness: 0.3 });
      const gArm = guardar(new THREE.BoxGeometry(0.52, 1.85, 0.32)), gFresta = guardar(new THREE.BoxGeometry(0.3, 0.012, 0.01));
      const mMural = mat(contraste ? 0x333333 : 0xc49a6c, undefined, 0, { roughness: 0.95 });
      const gMural = guardar(new THREE.BoxGeometry(1.7, 1.0, 0.04));
      const papeis = [0xfff6df, 0xffe08a, 0xbfe0c6, 0xb9cdee, 0xf6c1cc].map(c => mat(contraste ? 0xffffff : c, undefined, 0, { roughness: 0.9 }));
      const gPapel = guardar(new THREE.PlaneGeometry(0.28, 0.36));
      faces.forEach(f => {
        const r = sorteio();
        if (r < 0.32) {
          const g = new THREE.Group();
          const qtd = 3 + Math.floor(sorteio() * 2);
          for (let i = 0; i < qtd; i++) {
            const a = new THREE.Mesh(gArm, mArm); a.position.set((i - (qtd - 1) / 2) * 0.54, 0.925, 0.16); a.castShadow = true; a.receiveShadow = true; g.add(a);
            for (let k = 0; k < 4; k++) { const fr = new THREE.Mesh(gFresta, mFresta); fr.position.set(a.position.x, 1.45 + k * 0.05, 0.325); g.add(fr); }
          }
          naFace(g, f.x, f.y, f.lado, 0);
        } else if (r < 0.55) {
          const g = new THREE.Group();
          const b = new THREE.Mesh(gMural, mMural); b.position.set(0, 1.6, 0.02); g.add(b);
          for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(gPapel, papeis[i % papeis.length]); p.position.set(-0.6 + i * 0.3, 1.6 + (sorteio() - 0.5) * 0.3, 0.045); p.rotation.z = (sorteio() - 0.5) * 0.2; p.userData.semAO = true; g.add(p); }
          naFace(g, f.x, f.y, f.lado, 0);
        }
      });
      // Luminárias no forro (painéis acesos).
      const gLum = guardar(new THREE.BoxGeometry(1.2, 0.04, 0.32));
      const mLum = mat(0xfff8e6, undefined, 0, { emissive: new THREE.Color(0xfff2d6), emissiveIntensity: contraste ? 0.4 : 1.6 });
      for (let y = 0; y < lab.l; y++) for (let x = 0; x < lab.c; x++) { const l = new THREE.Mesh(gLum, mLum); l.position.set((x + 0.5) * CEL, A.altura - 0.03, (y + 0.5) * CEL); l.userData.semAO = true; scene.add(l); }
    }
    if (cena === 'biblioteca') {
      // Luminárias redondas de sobrepor no forro, luz quente de sala de leitura.
      const gLum = guardar(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 24));
      const mLum = mat(0xfff3dc, undefined, 0, { roughness: 0.4, emissive: new THREE.Color(0xffe2b0), emissiveIntensity: contraste ? 0.4 : 1.5 });
      const gAro = guardar(new THREE.TorusGeometry(0.35, 0.025, 8, 24));
      const mAro = mat(0x6b4a2f, undefined, 0, { roughness: 0.5, metalness: 0.3 });
      for (let y = 0; y < lab.l; y++) for (let x = 0; x < lab.c; x++) {
        const l = new THREE.Mesh(gLum, mLum); l.position.set((x + 0.5) * CEL, A.altura - 0.03, (y + 0.5) * CEL); l.userData.semAO = true; scene.add(l);
        const a = new THREE.Mesh(gAro, mAro); a.rotation.x = Math.PI / 2; a.position.copy(l.position); a.position.y -= 0.03; scene.add(a);
      }
    }

    // Céu de foto no jardim (cúpula com a foto do céu; horizonte suave).
    let ceuMat: THREE.ShaderMaterial | null = null;
    if (A.ceu && !contraste) {
      ceuMat = guardar(new THREE.ShaderMaterial({
        uniforms: { ceu: { value: null }, temCeu: { value: 0 }, horizonte: { value: new THREE.Color(0x9fb2c8) }, zenite: { value: new THREE.Color(0x5d7aa8) } },
        vertexShader: /* glsl */ `varying vec3 vDir; void main() { vDir = normalize( position ); gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D ceu; uniform float temCeu; uniform vec3 horizonte; uniform vec3 zenite; varying vec3 vDir;
          void main() {
            vec3 d = normalize( vDir ); float alt = d.y;
            vec3 cor = mix( horizonte, zenite, pow( max( alt, 0.0 ), 0.6 ) );
            if ( temCeu > 0.5 && alt > 0.0 ) { float u = atan( d.z, d.x ) * 0.15915494 + 0.5; cor = texture2D( ceu, vec2( u, alt ) ).rgb; }
            cor = mix( horizonte, cor, smoothstep( 0.0, 0.05, alt ) );
            gl_FragColor = vec4( cor, 1.0 );
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
        side: THREE.BackSide, depthWrite: false,
      }));
      const cupula = new THREE.Mesh(guardar(new THREE.SphereGeometry(90, 32, 16)), ceuMat);
      cupula.renderOrder = -1; cupula.frustumCulled = false; cupula.userData.semAO = true;
      scene.add(cupula);
      // Gramado em volta, até o horizonte.
      const volta = new THREE.Mesh(guardar(caixa(-60, -0.12, -60, 60 + W, -0.02, 60 + L, 2.2)), mPiso);
      volta.receiveShadow = true; scene.add(volta);
    }

    // Texturas fotográficas do patamar escolhido (Alta: 1K + relevo + ARM; Econômico: 512 + relevo).
    const carregador = new THREE.TextureLoader();
    const cache = new Map<string, Promise<THREE.Texture>>();
    const obter = (nome: string, cor: boolean) => {
      if (!cache.has(nome)) cache.set(nome, carregador.loadAsync(TEX + nome + '.webp').then(t => {
        guardar(t); t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.colorSpace = cor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.anisotropy = Math.min(alta ? 8 : 4, renderer.capabilities.getMaxAnisotropy());
        return t;
      }));
      return cache.get(nome)!;
    };
    const NORMAL_1K = new Set(['piso']);
    if (!contraste) {
      for (const mt of mats) {
        const n = mt.userData.tex as string | undefined;
        if (!n) continue;
        const lista: Array<Promise<unknown>> = [
          obter(alta ? `${n}_c` : `${n}_c5`, true).then(t => { mt.map = t; mt.needsUpdate = true; }),
          obter(alta && NORMAL_1K.has(n) ? `${n}_n` : `${n}_n5`, false).then(t => { mt.normalMap = t; mt.needsUpdate = true; }),
        ];
        if (alta) lista.push(obter(`${n}_r`, false).then(t => { mt.aoMap = t; mt.roughnessMap = t; mt.metalnessMap = t; mt.roughness = 1; mt.metalness = 1; mt.needsUpdate = true; }));
        Promise.all(lista).catch(e => console.warn('Textura do labirinto não carregada', e));
      }
      obter('ambiente', true).then(t => {
        t.mapping = THREE.EquirectangularReflectionMapping;
        const pm = new THREE.PMREMGenerator(renderer);
        scene.environment = guardar(pm.fromEquirectangular(t).texture);
        pm.dispose();
        hemi.intensity *= 0.8;
      }).catch(() => undefined);
      if (ceuMat) obter(alta ? 'ceu' : 'ceu5', true).then(t => {
        t.wrapT = THREE.ClampToEdgeWrapping; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true;
        ceuMat!.uniforms.ceu.value = t; ceuMat!.uniforms.temCeu.value = 1;
      }).catch(() => undefined);
    }

    // Pós-processamento só na Alta.
    let composer: Composer | null = null;
    if (alta && !contraste) criarPosAlta(renderer, scene, camera, mount.clientWidth, mount.clientHeight).then(c => { composer = c; ajustar(); }).catch(() => { composer = null; });

    const ajustar = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setPixelRatio(razao()); renderer.setSize(w, h);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
    };
    const ro = new ResizeObserver(ajustar); ro.observe(mount);

    // Arrastar para olhar em volta (mouse e toque).
    let arrasto: number | null = null;
    const dn = (e: PointerEvent) => { arrasto = e.clientX; renderer.domElement.setPointerCapture?.(e.pointerId); };
    const mv = (e: PointerEvent) => { if (arrasto === null) return; estado.current.giro -= (e.clientX - arrasto) * 0.006; arrasto = e.clientX; };
    const up = () => { arrasto = null; };
    renderer.domElement.addEventListener('pointerdown', dn);
    renderer.domElement.addEventListener('pointermove', mv);
    renderer.domElement.addEventListener('pointerup', up);
    renderer.domElement.addEventListener('pointercancel', up);

    // Colisão: paredes da célula atual e os pilares nos cantos.
    const temPilar = (vx: number, vy: number) => segH(vx - 1, vy) || segH(vx, vy) || segV(vx, vy - 1) || segV(vx, vy);
    const colidir = (x: number, z: number): [number, number] => {
      const i = Math.min(lab.c - 1, Math.max(0, Math.floor(x / CEL))), j = Math.min(lab.l - 1, Math.max(0, Math.floor(z / CEL)));
      const R = RAIO + ESP / 2;
      let lx = x - i * CEL, lz = z - j * CEL;
      const p = lab.paredes[j][i];
      if (p[3] && lx < R) lx = R;
      if (p[1] && lx > CEL - R) lx = CEL - R;
      if (p[0] && lz < R) lz = R;
      if (p[2] && lz > CEL - R) lz = CEL - R;
      for (const [cx, cy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        if (!temPilar(i + cx, j + cy)) continue;
        const px = cx * CEL, pz = cy * CEL;
        const dx = lx - px, dz = lz - pz, dist = Math.hypot(dx, dz);
        if (dist < R && dist > 1e-4) { lx = px + (dx / dist) * R; lz = pz + (dz / dist) * R; }
      }
      return [i * CEL + lx, j * CEL + lz];
    };

    // Minimapa: só as células já visitadas aparecem (como um mapa que o aluno desenha andando).
    const desenharMinimapa = () => {
      const cv = minimapa.current; const g = cv?.getContext('2d');
      if (!cv || !g) return;
      const t = Math.floor(Math.min(cv.width / lab.c, cv.height / lab.l));
      const ox = (cv.width - t * lab.c) / 2, oy = (cv.height - t * lab.l) / 2;
      g.clearRect(0, 0, cv.width, cv.height);
      g.fillStyle = contraste ? '#000' : 'rgba(12,42,102,0.82)'; g.fillRect(0, 0, cv.width, cv.height);
      g.strokeStyle = contraste ? '#ffd400' : '#FFF6DF'; g.lineWidth = 2;
      for (let y = 0; y < lab.l; y++) for (let x = 0; x < lab.c; x++) {
        if (!visitadas.current.has(y * lab.c + x)) continue;
        const X = ox + x * t, Y = oy + y * t;
        g.fillStyle = contraste ? '#333' : 'rgba(255,246,223,0.22)'; g.fillRect(X, Y, t, t);
        const p = lab.paredes[y][x];
        g.beginPath();
        if (p[0]) { g.moveTo(X, Y); g.lineTo(X + t, Y); }
        if (p[1]) { g.moveTo(X + t, Y); g.lineTo(X + t, Y + t); }
        if (p[2]) { g.moveTo(X, Y + t); g.lineTo(X + t, Y + t); }
        if (p[3]) { g.moveTo(X, Y); g.lineTo(X, Y + t); }
        g.stroke();
        const porta = lab.portas.find(q => q.x === x && q.y === y);
        if (porta) { g.font = `${Math.floor(t * 0.55)}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(LUGARES[porta.lugar].emoji, X + t / 2, Y + t / 2); }
      }
      const e = estado.current;
      const px = ox + (e.x / CEL) * t, pz = oy + (e.z / CEL) * t;
      g.save(); g.translate(px, pz); g.rotate(-e.giro);
      g.fillStyle = '#FFD23F'; g.strokeStyle = '#0C2A66'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, -t * 0.32); g.lineTo(t * 0.22, t * 0.22); g.lineTo(-t * 0.22, t * 0.22); g.closePath(); g.fill(); g.stroke();
      g.restore();
    };

    // Laço: movimento suave, balanço do passo (desligado no calmo), portas, minimapa e proteção de desempenho.
    let vel = 0, dist = 0, ultimo = performance.now(), quadros = 0, medio = 1 / 60, lentoDesde = 0, bloqueada: Porta | null = null;
    let raf = 0;
    const laco = (agora: number) => {
      raf = requestAnimationFrame(laco);
      const dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora;
      medio = medio * 0.95 + dt * 0.05;
      const e = estado.current, k = controles.current;
      if (!pausadoRef.current) {
        e.giro += (k.esq - k.dir) * dt * (calmo ? 1.5 : 2.1);
        const alvoV = (k.frente - k.tras) * (calmo ? VEL * 0.72 : VEL);
        vel += (alvoV - vel) * (1 - Math.exp(-dt * 9));
        const fx = -Math.sin(e.giro), fz = -Math.cos(e.giro);
        const [nx, nz] = colidir(e.x + fx * vel * dt, e.z + fz * vel * dt);
        dist += Math.hypot(nx - e.x, nz - e.z);
        e.x = nx; e.z = nz;
        const cel = Math.floor(e.z / CEL) * lab.c + Math.floor(e.x / CEL);
        if (!visitadas.current.has(cel)) visitadas.current.add(cel);
        // Portas: chegar perto de uma aciona (uma vez até se afastar).
        const ci = Math.floor(e.x / CEL), cj = Math.floor(e.z / CEL);
        for (const p of lab.portas) {
          const pp = posPorta.get(p)!; const d = Math.hypot(pp.x - e.x, pp.z - e.z);
          if (p === bloqueada) { if (d > PERTO + 0.7) bloqueada = null; continue; }
          if (p.x === ci && p.y === cj && d < PERTO) { bloqueada = p; cb.current.onPorta(p); }
        }
      } else vel = 0;
      const bob = calmo ? 0 : Math.sin((dist / 1.4) * Math.PI * 2) * 0.03 * Math.min(1, Math.abs(vel) / VEL);
      camera.position.set(e.x, OLHO + bob, e.z);
      camera.rotation.set(0, e.giro, calmo ? 0 : Math.sin((dist / 1.4) * Math.PI) * 0.006, 'YXZ');
      lanterna.position.set(e.x, A.altura - 0.6, e.z);
      if (composer) composer.render(); else renderer.render(scene, camera);
      if (++quadros % 6 === 0) desenharMinimapa();
      // Proteção automática: primeiro a resolução; na Alta lenta por 3 s, pede o Econômico (com aviso).
      if (quadros > 90 && medio > 1 / 30) {
        if (!lentoDesde) lentoDesde = agora;
        if (agora - lentoDesde > 3000) {
          lentoDesde = 0;
          if (escala > 0.7) { escala -= 0.15; ajustar(); } else if (alta) cb.current.onLento();
        }
      } else lentoDesde = 0;
      (window as unknown as { __nisiaLab3d?: object }).__nisiaLab3d = { qps: Math.round(1 / medio), qualidade, chamadas: renderer.info.render.calls, triangulos: renderer.info.render.triangles, x: e.x, z: e.z, giro: e.giro, pos: !!composer };
    };
    raf = requestAnimationFrame(laco);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', dn);
      renderer.domElement.removeEventListener('pointermove', mv);
      renderer.domElement.removeEventListener('pointerup', up);
      renderer.domElement.removeEventListener('pointercancel', up);
      scene.traverse(o => { const g = (o as THREE.Mesh).geometry; if (g) g.dispose(); });
      descartar.forEach(d => d.dispose());
      composer?.dispose?.();
      renderer.dispose(); renderer.forceContextLoss?.();
      mount.removeChild(renderer.domElement);
    };
  }, [lab, cena, qualidade, contraste, calmo]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={mountRef} className="absolute inset-0" />;
};

// ---------- Botão de toque que fica apertado enquanto o dedo está nele ----------
const Segurar: React.FC<{ rot: string; onMudar: (v: number) => void; children: React.ReactNode; className?: string }> = ({ rot, onMudar, children, className = '' }) => (
  <button type="button" aria-label={rot}
    onPointerDown={e => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture?.(e.pointerId); onMudar(1); }}
    onPointerUp={() => onMudar(0)} onPointerCancel={() => onMudar(0)} onLostPointerCapture={() => onMudar(0)}
    className={`kit-btn kit-btn--papel !min-h-[56px] !min-w-[56px] !p-0 select-none touch-none font-display text-2xl ${className}`}>{children}</button>
);

// ---------- O jogo ----------
export const Labirinto3D: React.FC<Props> = ({ avatar, onFim, onSair }) => {
  const [fase, setFase] = useState<'instrucoes' | 'entre' | 'jogando' | 'fim'>('instrucoes');
  const [etapa, setEtapa] = useState(0);
  const [lab, setLab] = useState<Lab | null>(null);
  const [tempo, setTempo] = useState(0);
  const [ajudas, setAjudas] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [dica, setDica] = useState<string | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [falhou, setFalhou] = useState(false);
  const [qualidade, setQualidade] = useState<Qualidade>(qualidadeInicial);
  const [contraste, setContraste] = useState<boolean>(() => preferencia('(prefers-contrast: more)') || document.documentElement.hasAttribute('data-contraste'));
  const [calmo, setCalmo] = useState<boolean>(() => preferencia('(prefers-reduced-motion: reduce)') || document.documentElement.hasAttribute('data-calmo'));
  const [anuncio, setAnuncio] = useState('');
  const pontos = useRef(0);
  const estado = useRef<Estado>({ x: CEL / 2, z: CEL / 2, giro: 0 });
  const controles = useRef<Controles>({ frente: 0, tras: 0, esq: 0, dir: 0 });
  const visitadas = useRef<Set<number>>(new Set([0]));
  const minimapa = useRef<HTMLCanvasElement>(null);
  const travado = useRef(false);

  const falarDestino = useCallback((l: Lab | null = lab) => { if (l) narrar([{ texto: LUGARES[l.alvo].frase, idioma: 'en-US', personagem: 'professora' }]); }, [lab]);

  const montarEtapa = useCallback((i: number) => {
    const cfg = ETAPAS_3D[i];
    const novo = gerarLabirinto(cfg.c, cfg.l, cfg.portas);
    // Começa olhando para o corredor aberto da largada.
    const aberto = ([0, 1, 2, 3] as Lado[]).find(d => !novo.paredes[0][0][d]) ?? 2;
    estado.current = { x: CEL / 2, z: CEL / 2, giro: [0, -Math.PI / 2, Math.PI, Math.PI / 2][aberto] };
    visitadas.current = new Set([0]);
    controles.current = { frente: 0, tras: 0, esq: 0, dir: 0 };
    travado.current = false;
    setLab(novo); setTempo(Math.round(cfg.tempo * (calmo ? 1.4 : 1))); setAjudas(cfg.ajudas); setAviso(null); setDica(null);
    setEtapa(i); setFase('entre');
    setAnuncio(`Etapa ${i + 1} de ${ETAPAS_3D.length}: ${cfg.nome}. ${LUGARES[novo.alvo].frase}`);
  }, [calmo]);

  // Cartão entre etapas: mostra o novo espaço por um instante e começa.
  useEffect(() => {
    if (fase !== 'entre' || !lab) return undefined;
    const t = window.setTimeout(() => { setFase('jogando'); falarDestino(lab); }, 2600);
    return () => window.clearTimeout(t);
  }, [fase, lab, falarDestino]);

  const terminar = useCallback(() => {
    setFase('fim'); onFim({ pontos: pontos.current });
    if (pontos.current > 0) audioService.playFanfare(); else audioService.playWrong();
  }, [onFim]);

  const proxima = useCallback(() => {
    travado.current = true;
    window.setTimeout(() => { if (etapa + 1 < ETAPAS_3D.length) montarEtapa(etapa + 1); else terminar(); }, 1700);
  }, [etapa, montarEtapa, terminar]);

  // Relógio (pausa durante avisos e entre etapas).
  useEffect(() => {
    if (fase !== 'jogando' || travado.current) return undefined;
    if (tempo <= 0) { audioService.playWrong(); setAviso('O tempo acabou!'); setAnuncio('O tempo acabou.'); proxima(); return undefined; }
    const t = window.setTimeout(() => setTempo(s => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [tempo, fase, proxima]);

  const onPorta = useCallback((p: Porta) => {
    if (!lab || travado.current) return;
    if (p.lugar === lab.alvo) {
      audioService.playCorrect();
      pontos.current += 100 + tempo * 2 + ajudas * 15;
      setAcertos(a => a + 1);
      setAviso(`Isso! ${LUGARES[p.lugar].en}!`); setAnuncio(`Acertou: ${LUGARES[p.lugar].en}.`);
      proxima();
    } else {
      audioService.playWrong();
      setTempo(s => Math.max(0, s - 5));
      const frase = portaErrada(p.lugar);
      setAviso(`${frase} (−5 s)`); setAnuncio(`Porta errada: ${frase} Menos 5 segundos.`);
      narrar([{ texto: frase, idioma: 'en-US', personagem: 'professora' }]);
      window.setTimeout(() => setAviso(a => (a && a.startsWith(frase) ? null : a)), 1500);
    }
  }, [lab, tempo, ajudas, proxima]);

  const pedirDirecao = useCallback(() => {
    if (!lab || fase !== 'jogando' || ajudas <= 0) return;
    const e = estado.current;
    const r = dicaDeDirecao(lab, [Math.floor(e.x / CEL), Math.floor(e.z / CEL)], e.giro);
    if (!r) return;
    const frase = r.tipo === 'chegou' ? CHEGADA[r.rel] : DIRECOES[r.rel];
    setAjudas(a => a - 1); setDica(frase); setAnuncio(`Mané: ${frase}`);
    audioService.playChime();
    narrar([{ texto: frase, idioma: 'en-US', personagem: 'mane' }]);
  }, [lab, fase, ajudas]);

  const trocarQualidade = useCallback(() => setQualidade(q => { const n = q === 'alta' ? 'economica' : 'alta'; guardarQualidade(n); setAnuncio(n === 'alta' ? 'Qualidade alta.' : 'Modo econômico.'); return n; }), []);

  // Teclado: andar e virar (setas/WASD), H direção, O ouvir, Q qualidade, C contraste, M calmo.
  useEffect(() => {
    if (fase !== 'jogando' && fase !== 'entre') return undefined;
    const mapa: Record<string, keyof Controles> = { ArrowUp: 'frente', w: 'frente', ArrowDown: 'tras', s: 'tras', ArrowLeft: 'esq', a: 'esq', ArrowRight: 'dir', d: 'dir' };
    const tecla = (e: KeyboardEvent, v: number) => {
      const k = mapa[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (k) { e.preventDefault(); controles.current[k] = v; return; }
      if (v !== 1 || e.repeat) return;
      const l = e.key.toLowerCase();
      if (l === 'h') pedirDirecao();
      else if (l === 'o') falarDestino();
      else if (l === 'q') trocarQualidade();
      else if (l === 'c') setContraste(c => !c);
      else if (l === 'm') setCalmo(c => !c);
    };
    const dn = (e: KeyboardEvent) => tecla(e, 1), up = (e: KeyboardEvent) => tecla(e, 0);
    const solta = () => { controles.current = { frente: 0, tras: 0, esq: 0, dir: 0 }; };
    window.addEventListener('keydown', dn); window.addEventListener('keyup', up); window.addEventListener('blur', solta);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); window.removeEventListener('blur', solta); };
  }, [fase, pedirDirecao, falarDestino, trocarQualidade]);

  // Gancho de verificação automática (só com a marca de teste no aparelho): abre direto uma etapa.
  useEffect(() => {
    let liga = false; try { liga = localStorage.getItem('nisialand_teste3d') === '1'; } catch { /* sem armazenamento */ }
    if (!liga) return undefined;
    const w = window as unknown as { __nisiaLabEtapa?: (i: number) => void };
    w.__nisiaLabEtapa = i => { pontos.current = 0; montarEtapa(i); };
    return () => { delete w.__nisiaLabEtapa; };
  }, [montarEtapa]);

  const comecar = () => { audioService.playClick(); pontos.current = 0; setAcertos(0); montarEtapa(0); };

  if (falhou) return <Labirinto avatar={avatar} onFim={onFim} onSair={onSair} />;

  const cfg = ETAPAS_3D[etapa];
  const btnHud = 'kit-btn kit-btn--papel !min-h-0 !py-1 !px-2.5 text-sm';
  return (
    <Painel tipo="mural" as="section" aria-label="Labirinto da escola em 3D" className="p-3 sm:p-4 short:p-2 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="kit-placa px-5 py-1 font-display text-lg short:text-base">Intervalo · Labirinto da escola</span>
        <div className="flex items-center gap-2 flex-wrap">
          {(fase === 'jogando' || fase === 'entre') && lab && <>
            <span className="kit-ficha kit-ficha--azul">Etapa {etapa + 1} de {ETAPAS_3D.length}</span>
            <span className={`kit-ficha ${tempo <= 10 ? 'kit-ficha--erro' : 'kit-ficha--sol'}`}>{tempo}s</span>
          </>}
          <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); onSair(); }}>Sair</BotaoJogo>
        </div>
      </div>

      {fase === 'instrucoes' && (
        <Painel tipo="papel" liso className="p-4 short:p-2 flex flex-col items-center gap-3 short:gap-1.5 text-center">
          <p className="font-display text-2xl short:text-lg text-nisia-azul-700">Você dentro do labirinto, em 3D!</p>
          <ol className="flex flex-wrap justify-center gap-2" aria-label="As três etapas">
            {ETAPAS_3D.map((e, i) => <li key={e.cena} className="px-3 py-1.5 rounded-lg bg-white border-2 border-nisia-azul-400 font-display text-nisia-azul-700 text-sm sm:text-base">{i + 1}. {e.nome} <span className="text-xs text-nisia-tinta/70">({e.c}×{e.l})</span></li>)}
          </ol>
          <ul className="text-left text-sm sm:text-base short:text-xs max-w-xl list-disc pl-5 space-y-1">
            <li>Ouça e leia o destino em inglês: <b>“Go to the library!”</b> e ache a porta com a placa certa.</li>
            <li><b>↑ ↓</b> andam, <b>← →</b> viram (ou W A S D). Também dá para arrastar a tela para olhar.</li>
            <li>Perdido? <b>Pedir direção (H)</b>: o Mané responde em inglês, “Turn left.” — a partir de para onde você olha.</li>
            <li>Porta errada: <b>−5 segundos</b>. A cada etapa o espaço muda e o labirinto cresce.</li>
          </ul>
          <BotaoJogo cor="laranja" onClick={comecar} autoFocus><Icone nome="jogar" className="w-5 h-5" cor="currentColor" /> Começar</BotaoJogo>
        </Painel>
      )}

      {(fase === 'jogando' || fase === 'entre') && lab && (
        <>
          <div className="kit-papel rounded-xl px-3 py-1.5 flex items-center justify-center gap-2 flex-wrap text-center">
            <p className="font-display text-2xl short:text-lg text-nisia-azul-700">{LUGARES[lab.alvo].emoji} {LUGARES[lab.alvo].frase}</p>
            <button type="button" className="kit-btn kit-btn--azul !min-h-0 !py-1 !px-3" aria-label="Ouvir o destino de novo (tecla O)" onClick={() => falarDestino()}><Icone nome="orelha" className="w-5 h-5" cor="currentColor" /></button>
            <button type="button" className="kit-btn kit-btn--sol !min-h-0 !py-1 !px-3 font-display" disabled={ajudas <= 0 || fase !== 'jogando'} onClick={pedirDirecao} aria-label={`Pedir direção ao Mané (tecla H). Restam ${ajudas}.`}>
              <Icone nome="bussola" className="w-5 h-5" cor="currentColor" /> Pedir direção · {ajudas}
            </button>
          </div>
          <div className="relative h-[60vh] short:h-[62vh] max-h-[560px] rounded-xl overflow-hidden border-[4px] border-nisia-madeira-escura bg-nisia-tinta">
            {!falhou && <Cena3D key={`${etapa}-${lab.alvo}`} lab={lab} cena={cfg.cena} qualidade={qualidade} contraste={contraste} calmo={calmo} pausado={fase !== 'jogando' || !!(aviso && travado.current)}
              estado={estado} controles={controles} visitadas={visitadas} minimapa={minimapa}
              onPorta={onPorta} onFalha={() => setFalhou(true)} onLento={() => { setQualidade('economica'); guardarQualidade('economica'); setAnuncio('Mudei para o modo econômico para manter o movimento fluido. Para voltar, use o botão de qualidade ou a tecla Q.'); }} />}
            {/* Mira discreta no centro */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/70 ring-2 ring-nisia-tinta/40 pointer-events-none" aria-hidden="true" />
            <canvas ref={minimapa} width={150} height={150} className="absolute right-2 top-2 w-[110px] h-[110px] sm:w-[150px] sm:h-[150px] rounded-lg border-2 border-white/70 pointer-events-none" aria-hidden="true" />
            <div className="absolute left-2 top-2 flex flex-col gap-1.5">
              <button type="button" onClick={trocarQualidade} className={btnHud} aria-label={`Qualidade: ${qualidade === 'alta' ? 'alta' : 'econômico'}. Trocar (tecla Q)`}>
                <Icone nome={qualidade === 'alta' ? 'estrela' : 'relogio'} className="w-4 h-4" cor="currentColor" /> {qualidade === 'alta' ? 'Alta' : 'Econômico'}
              </button>
              <button type="button" onClick={() => setContraste(c => !c)} className={btnHud} aria-pressed={contraste} aria-label="Alto contraste (tecla C)">Contraste</button>
              <button type="button" onClick={() => setCalmo(c => !c)} className={btnHud} aria-pressed={calmo} aria-label="Modo calmo (tecla M)">Calmo</button>
            </div>
            {fase === 'entre' && (
              <div className="absolute inset-0 flex items-center justify-center bg-nisia-tinta/55 pointer-events-none">
                <div className="kit-papel rounded-2xl px-6 py-4 text-center animate-rise-in max-w-sm">
                  <p className="font-display text-sm text-nisia-tinta/70">Etapa {etapa + 1} de {ETAPAS_3D.length}</p>
                  <p className="font-display text-3xl short:text-2xl text-nisia-azul-700">{cfg.nome}</p>
                  <p className="text-sm sm:text-base mt-1">{cfg.chamada}</p>
                  <p className="font-display text-lg text-nisia-laranja-700 mt-2">{LUGARES[lab.alvo].emoji} {LUGARES[lab.alvo].frase}</p>
                </div>
              </div>
            )}
            {dica && fase === 'jogando' && (
              <div className="absolute left-2 bottom-2 flex items-end gap-2 pointer-events-none max-w-[70%]">
                <img src="/assets/mane_zoeira.png" alt="" className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow" />
                <span className="kit-balao px-3 py-2 font-display text-lg sm:text-xl text-nisia-azul-700 animate-balao-in">{dica}</span>
              </div>
            )}
            {aviso && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="kit-placa px-6 py-2 font-display text-2xl short:text-lg animate-balao-in">{aviso}</span></div>}
            {/* Controles de toque (grandes) */}
            <div className="absolute right-2 bottom-2 grid gap-1.5 [@media(pointer:fine)]:hidden" style={{ gridTemplateAreas: '". f ." "e t d"' }}>
              <div style={{ gridArea: 'f' }}><Segurar rot="Andar para a frente" onMudar={v => { controles.current.frente = v; }}>▲</Segurar></div>
              <div style={{ gridArea: 'e' }}><Segurar rot="Virar à esquerda" onMudar={v => { controles.current.esq = v; }}>⟲</Segurar></div>
              <div style={{ gridArea: 't' }}><Segurar rot="Andar para trás" onMudar={v => { controles.current.tras = v; }}>▼</Segurar></div>
              <div style={{ gridArea: 'd' }}><Segurar rot="Virar à direita" onMudar={v => { controles.current.dir = v; }}>⟳</Segurar></div>
            </div>
          </div>
          <p className="text-xs text-white/85 text-center hidden sm:block">↑ ↓ andar · ← → virar · H pedir direção · O ouvir · Q qualidade · C contraste · M calmo</p>
        </>
      )}

      {fase === 'fim' && (
        <Painel tipo="papel" liso className="p-5 short:p-2 flex flex-col items-center gap-2 text-center animate-rise-in" role="status">
          <p className="font-display text-3xl short:text-xl text-nisia-azul-700">{acertos === ETAPAS_3D.length ? 'Você conhece a escola inteira!' : acertos ? 'Quase todas!' : 'Os corredores venceram desta vez!'}</p>
          <Estrelas n={acertos} />
          <p className="font-display text-xl short:text-base">{acertos} de {ETAPAS_3D.length} salas · {pontos.current} pontos</p>
          <div className="flex gap-3 mt-1 flex-wrap justify-center">
            <BotaoJogo cor="papel" onClick={comecar}>Jogar de novo</BotaoJogo>
            <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); onSair(); }}>Voltar às atividades <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
          </div>
        </Painel>
      )}
      <p className="sr-only" role="status" aria-live="polite">{anuncio}</p>
    </Painel>
  );
};
export default Labirinto3D;
