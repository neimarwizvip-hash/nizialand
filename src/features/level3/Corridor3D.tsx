import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { audioService } from '../../services/audio';
import { falarComo, narrar } from '../../services/narracao';
import { AVATAR_CATALOG, skinToneFilter, type SkinTone } from '../../components/ui/PlayerAvatar';
import { MANE_CORRIDOR_LINES, MANE_IMG } from '../../data/level3Mane';
import { AVISOS_CORREDOR, falaDaPorta } from '../../data/falasCorredor';
import { Icone } from '../../components/kit/Icones';
import { CHAVE_QUALIDADE, TEX, TOM_NEUTRO, caixa, instalarTom, preferencia, prepararMacro, qualidadeInicial, type Qualidade } from '../tres/base3d';

// Corredor 3D dos Níveis 3 e 4 no padrão da Rota Piloto AEE (piso de qualidade do projeto):
//   ALTA       texturas fotográficas 1K (cor, relevo, rugosidade/oclusão), céu de foto que ilumina,
//              sol entrando pelas janelas com sombra suave 2048, oclusão de ambiente (GTAO), MSAA 4×,
//              curva de tom PBR Neutral e pontilhado. ≈ 1 MB baixado uma vez.
//   ECONÔMICO  mesmas fotos em 512, sombra 1024, sem pós-processamento (tom no material). ≈ 0,46 MB.
// Proteção automática: primeiro a resolução, depois Alta → Econômico, por último as sombras; sempre com aviso.
// Acessibilidade: alto contraste, modo calmo, voz pt-BR com região aria-live, teclado completo,
// controles de toque grandes, minimapa e respeito a prefers-reduced-motion/prefers-contrast.
// Texturas e licenças: public/assets/3d/ORIGENS.csv.

export interface CorridorDoor { id: string; label: string; name: string; state: 'locked' | 'open' | 'done' }

interface Corridor3DProps {
  doors: CorridorDoor[];
  paused: boolean;
  startAt: string | null;
  avatarId?: string;
  avatarSkinTone?: SkinTone;
  level?: 3 | 4;
  heading?: string;
  simpleLabel?: string;
  zeLine?: string;
  onEnter: (id: string) => void;
  onExit: () => void;
  onSimpleMode: () => void;
}

// Medidas do corredor (metros).
const HALF_W = 1.7;
const ALTURA = 3.2;
const DOOR_GAP = 6;
const PERTO = 1.25;
const VEL = 2.6;      // m/s: passo de aluno apressado
const PASSADA = 1.4;  // metros por ciclo completo (dois passos)
const ESPESSURA = 0.16;
const JANELA = { larg: 1.7, peitoril: 0.95, verga: 2.45 };

const ZE_LINES = ['Essa porta aí você não abre!', 'Hehe, aposto que você erra a próxima!', 'Corre não... a sala não foge!', 'Eu sei a resposta e não conto!'];
const SINAIS_N4 = ['LIBRARY', 'HALLWAY', 'TEAM ROOM', 'NOTICE BOARD', 'GYM', 'REVIEW'];

const doorZ = (i: number) => -3 - i * DOOR_GAP;
// Portas sempre na parede das salas (esquerda); a parede da direita tem as janelas para o jardim.
// (Antes alternavam e algumas portas ficavam na parede das janelas: uma porta que "daria para fora".)
const doorSide = (_i: number) => -1;

// Sol pelas janelas do lado direito (+x), alto o bastante para desenhar as janelas no piso.
const ALT_SOL = (38 * Math.PI) / 180;
const DIR_SOL = new THREE.Vector3(Math.cos(ALT_SOL) * 0.9, Math.sin(ALT_SOL), Math.cos(ALT_SOL) * 0.45).normalize();
const COR_HORIZONTE = 0x9fb2c8;
const COR_ZENITE = 0x5d7aa8;

// Acabamentos: textura, metros por repetição, rugosidade/metal quando não há mapa.
interface Acab { tex?: string; m?: number; rug?: number; metal?: number; env?: number; folha?: boolean; emissivo?: number }
const ACAB: Record<string, Acab> = {
  piso: { tex: 'piso', m: 1.6, rug: 0.35 },
  parede: { tex: 'parede', m: 2.0, rug: 0.95 },
  barrado: { tex: 'parede', m: 2.0, rug: 0.9 },
  forro: { tex: 'parede', m: 2.4, rug: 0.95 },
  grama: { tex: 'grama', m: 2.2, rug: 1 },
  rodape: { rug: 0.55 },
  porta: { rug: 0.45 },
  batente: { rug: 0.4 },
  macaneta: { rug: 0.25, metal: 0.9 },
  armario: { rug: 0.45, metal: 0.55 },
  frestas: { rug: 0.6, metal: 0.3 },
  caixilho: { rug: 0.3, metal: 0.85 },
  banco: { rug: 0.65 },
  vaso: { rug: 0.85 },
  folha: { rug: 0.75, folha: true },
  luminaria: { rug: 0.3, emissivo: 1.6 },
  placa: { rug: 0.5 },
  tronco: { rug: 0.9 },
  muro: { tex: 'parede', m: 2.4, rug: 0.95 },
};
const NORMAL_1K = new Set(['piso']);

const PALETAS: Record<'normal' | 'contraste', Record<string, number>> = {
  normal: {
    piso: 0xf2f0ec, parede: 0xfaf5ec, barrado: 0xb9cdee, forro: 0xfbfaf7, grama: 0xd8e8bb, rodape: 0x9a6a42,
    porta: 0x1f5fd0, batente: 0xf4f1ea, macaneta: 0xd9dde2, armario: 0xf08a24, frestas: 0x5a3a18, caixilho: 0xdfe3e7,
    banco: 0xa77447, vaso: 0xc0673f, folha: 0xffffff, luminaria: 0xfff8e6, placa: 0xffffff, tronco: 0x6b4a2f, muro: 0xe8dcc6,
  },
  contraste: {
    piso: 0x262626, parede: 0x3a3a3a, barrado: 0x3a3a3a, forro: 0x1a1a1a, grama: 0x0d0d0d, rodape: 0xffffff,
    porta: 0xffffff, batente: 0xffd400, macaneta: 0xffd400, armario: 0x808080, frestas: 0x000000, caixilho: 0xffffff,
    banco: 0x808080, vaso: 0x808080, folha: 0x2a2a2a, luminaria: 0xffffff, placa: 0xffffff, tronco: 0x2a2a2a, muro: 0x1a1a1a,
  },
};
const COR_N4 = { barrado: 0xbfe0c6, armario: 0x3f8f5f };

// Variação de tom em grande escala (esconde a repetição das fotos) a partir da posição no mundo.
const MACRO: Record<string, number> = { piso: 0.06, parede: 0.07, barrado: 0.06, forro: 0.03, grama: 0.22, muro: 0.12 };
// Textura das placas das portas (desenhada com as fontes do kit).
function placaTextura(linha1: string, linha2: string, cor: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 176;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  const desenhar = () => {
    const g = c.getContext('2d');
    if (!g) return;
    g.clearRect(0, 0, 512, 176);
    g.fillStyle = cor;
    g.beginPath(); g.roundRect(6, 6, 500, 164, 22); g.fill();
    g.lineWidth = 8; g.strokeStyle = '#FFD23F'; g.stroke();
    g.textAlign = 'center';
    g.fillStyle = '#FFD23F';
    g.font = '64px "Lilita One", "Fredoka", sans-serif';
    g.fillText(linha1, 256, 82);
    g.fillStyle = '#FFFFFF';
    g.font = '600 38px "Fredoka", sans-serif';
    g.fillText(linha2.length > 24 ? linha2.slice(0, 23) + '…' : linha2, 256, 140);
    t.needsUpdate = true;
  };
  desenhar();
  document.fonts?.ready.then(desenhar).catch(() => undefined);
  return t;
}

// Sombra de contato redonda sob os personagens (sprites não projetam sombra).
function texturaSombraContato(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  if (g) {
    const r = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    r.addColorStop(0, 'rgba(20,24,40,0.55)');
    r.addColorStop(1, 'rgba(20,24,40,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(c);
}

const Corridor3D: React.FC<Corridor3DProps> = ({ doors, paused, startAt, avatarId, avatarSkinTone, level = 3, heading = 'SALAS DE AULA', simpleLabel = 'Modo simples', zeLine, onEnter, onExit, onSimpleMode }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const zeRef = useRef<HTMLDivElement>(null);
  const maneRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<HTMLCanvasElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [maneIdx, setManeIdx] = useState(-1);
  const [near, setNear] = useState<CorridorDoor | null>(null);
  const [failed, setFailed] = useState(false);
  const [zeText, setZeText] = useState(ZE_LINES[0]);
  const [qualidade, setQualidade] = useState<Qualidade>(qualidadeInicial);
  const [contraste, setContraste] = useState<boolean>(() => preferencia('(prefers-contrast: more)') || document.documentElement.hasAttribute('data-contraste'));
  const [calmo, setCalmo] = useState<boolean>(() => preferencia('(prefers-reduced-motion: reduce)') || document.documentElement.hasAttribute('data-calmo'));
  const [voz, setVoz] = useState(true);
  const [sombras, setSombras] = useState(true);
  const [ajuda, setAjuda] = useState(false);
  const [aviso, setAviso] = useState('');
  const [carga, setCarga] = useState('');

  const pausedRef = useRef(paused);
  const doorsRef = useRef(doors);
  const nearRef = useRef<CorridorDoor | null>(null);
  const onEnterRef = useRef(onEnter);
  const resumeRef = useRef<() => void>(() => {});
  const vozRef = useRef(voz);
  const opcoes = useRef({ qualidade, contraste, calmo, sombras });
  const aplicarRef = useRef<(motivo?: string) => void>(() => {});
  onEnterRef.current = onEnter;
  doorsRef.current = doors;
  vozRef.current = voz;

  // Mensagem visível + região aria-live + voz pt-BR (quando ligada).
  const pararVoz = useRef<() => void>(() => undefined);
  const avisar = (texto: string, falar = true) => {
    setAviso(texto);
    if (falar && vozRef.current) { pararVoz.current(); pararVoz.current = narrar([{ texto, idioma: 'pt-BR', personagem: 'narrador' }]); }
  };
  const avisarRef = useRef(avisar);
  avisarRef.current = avisar;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    instalarTom();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, stencil: false, powerPreference: 'high-performance' });
    } catch {
      setFailed(true);
      return;
    }
    let escala = 1;
    const razaoPixels = () => Math.max(0.5, Math.min(window.devicePixelRatio || 1, opcoes.current.qualidade === 'alta' ? 2 : 1.5) * escala);
    renderer.setPixelRatio(razaoPixels());
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.CustomToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.info.autoReset = false; // soma todos os passos do quadro (cena + oclusão + final) na medição
    mount.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const scene = new THREE.Scene();
    const comprimento = doors.length * DOOR_GAP + 8;
    const zIni = 3.5;
    const zFim = -(comprimento - 4);
    const camera = new THREE.PerspectiveCamera(64, mount.clientWidth / mount.clientHeight, 0.1, 300);

    const descartar: { dispose: () => void }[] = [];
    const guardar = <T extends { dispose: () => void }>(o: T) => { descartar.push(o); return o; };

    // Luz: céu (hemisfério até a foto chegar), sol pelas janelas e ambiente de foto (PMREM).
    // Luz interna difusa e quente (o que as luminárias do forro fariam), somada ao ambiente de foto.
    const hemi = new THREE.HemisphereLight(0xfffaf0, 0xe2d2b2, 1.7);
    scene.add(hemi);
    const sol = new THREE.DirectionalLight(0xfff0d8, 3.4);
    sol.castShadow = true;
    sol.shadow.bias = -0.0004;
    sol.shadow.normalBias = 0.03;
    scene.add(sol, sol.target);

    // ---------- Materiais PBR por acabamento ----------
    const mats: Record<string, THREE.MeshStandardMaterial> = {};
    const paleta = (): Record<string, number> => ({ ...PALETAS[opcoes.current.contraste ? 'contraste' : 'normal'], ...(level === 4 && !opcoes.current.contraste ? COR_N4 : {}) });
    const mat = (chave: string) => {
      if (!mats[chave]) {
        const a = ACAB[chave] ?? {};
        const m = guardar(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: a.rug ?? 0.8, metalness: a.metal ?? 0 }));
        if (a.folha) { m.alphaTest = 0.5; m.side = THREE.DoubleSide; m.alphaToCoverage = true; }
        if (a.emissivo) { m.emissive.set(0xfff4dc); m.emissiveIntensity = a.emissivo; }
        m.envMapIntensity = a.env ?? 0.55;
        m.userData.acab = a;
        if (MACRO[chave]) prepararMacro(m, MACRO[chave]);
        mats[chave] = m;
      }
      return mats[chave];
    };
    const baldes: Record<string, THREE.BufferGeometry[]> = {};
    const add = (chave: string, g: THREE.BufferGeometry) => { (baldes[chave] ||= []).push(g); };
    const m = (chave: string) => ACAB[chave]?.m ?? 1;

    // ---------- Corredor: piso, forro, paredes com janelas, barrado e rodapé ----------
    add('piso', caixa(-HALF_W, -0.1, zFim - 0.2, HALF_W, 0, zIni + 0.2, m('piso')));
    add('forro', caixa(-HALF_W - ESPESSURA, ALTURA, zFim - 0.2, HALF_W + ESPESSURA, ALTURA + 0.1, zIni + 0.2, m('forro')));
    add('grama', caixa(-60, -0.16, zFim - 40, -HALF_W - ESPESSURA, -0.1, zIni + 40, m('grama')));
    add('grama', caixa(HALF_W + ESPESSURA, -0.16, zFim - 40, 60, -0.1, zIni + 40, m('grama')));

    // Janelas só na parede do jardim (direita), uma entre cada porta e uma diante de cada porta.
    const janelasPorLado: Record<number, Array<[number, number]>> = { [-1]: [], [1]: [] };
    for (let i = 0; i < doors.length; i++) {
      const zc = doorZ(i) - DOOR_GAP / 2;
      janelasPorLado[1].push([zc - JANELA.larg / 2, zc + JANELA.larg / 2]);
    }
    janelasPorLado[1].push([doorZ(0) + 2.4 - JANELA.larg / 2, doorZ(0) + 2.4 + JANELA.larg / 2]);
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? -HALF_W - ESPESSURA : HALF_W;
      const x1 = s < 0 ? -HALF_W : HALF_W + ESPESSURA;
      const aberturas = janelasPorLado[s].filter(([a, b]) => b < zIni && a > zFim).sort((a, b) => b[0] - a[0]);
      let zTopo = zIni + 0.2;
      for (const [a, b] of aberturas) {
        add('parede', caixa(x0, 1.0, b, x1, ALTURA, zTopo, m('parede')));
        add('barrado', caixa(x0, 0, b, x1, 1.0, zTopo, m('barrado')));
        add('barrado', caixa(x0, 0, a, x1, JANELA.peitoril, b, m('barrado')));
        add('parede', caixa(x0, JANELA.verga, a, x1, ALTURA, b, m('parede')));
        // Caixilho e peitoril (as janelas ficam abertas para o jardim: luz e céu de verdade).
        const xi = s < 0 ? -HALF_W : HALF_W;
        add('caixilho', caixa(xi - 0.05, JANELA.peitoril - 0.04, a, xi + 0.05, JANELA.peitoril, b));
        add('caixilho', caixa(xi - 0.04, JANELA.verga, a, xi + 0.04, JANELA.verga + 0.05, b));
        add('caixilho', caixa(xi - 0.03, JANELA.peitoril, (a + b) / 2 - 0.025, xi + 0.03, JANELA.verga, (a + b) / 2 + 0.025));
        add('caixilho', caixa(xi - 0.03, JANELA.peitoril, a, xi + 0.03, JANELA.verga, a + 0.05));
        add('caixilho', caixa(xi - 0.03, JANELA.peitoril, b - 0.05, xi + 0.03, JANELA.verga, b));
        zTopo = a;
      }
      add('parede', caixa(x0, 1.0, zFim - 0.2, x1, ALTURA, zTopo, m('parede')));
      add('barrado', caixa(x0, 0, zFim - 0.2, x1, 1.0, zTopo, m('barrado')));
      // Rodapé de madeira e faixa no alto do barrado.
      const xr = s < 0 ? -HALF_W : HALF_W - 0.02;
      add('rodape', caixa(xr, 0, zFim, xr + 0.02, 0.12, zIni));
      add('rodape', caixa(xr, 0.98, zFim, xr + 0.02, 1.04, zIni));
    }
    // Fundo e entrada do corredor.
    add('parede', caixa(-HALF_W, 1.0, zFim - 0.2 - ESPESSURA, HALF_W, ALTURA, zFim - 0.2, m('parede')));
    add('barrado', caixa(-HALF_W, 0, zFim - 0.2 - ESPESSURA, HALF_W, 1.0, zFim - 0.2, m('barrado')));
    add('parede', caixa(-HALF_W, 1.0, zIni + 0.2, HALF_W, ALTURA, zIni + 0.2 + ESPESSURA, m('parede')));
    add('barrado', caixa(-HALF_W, 0, zIni + 0.2, HALF_W, 1.0, zIni + 0.2 + ESPESSURA, m('barrado')));

    // Luminárias embutidas no forro.
    for (let z = zIni - 1.5; z > zFim + 0.5; z -= 3) add('luminaria', caixa(-0.55, ALTURA - 0.03, z - 0.25, 0.55, ALTURA, z + 0.25));

    // ---------- Portas, armários, bancos e vasos ----------
    const placas: THREE.Mesh[] = [];
    const luzesPorta: THREE.MeshStandardMaterial[] = [];
    const aneis: THREE.Mesh[] = [];
    const geoPlaca = guardar(new THREE.PlaneGeometry(1.1, 0.38));
    const geoLuz = guardar(new THREE.BoxGeometry(0.08, 0.08, 0.08));
    const geoAnel = guardar(new THREE.RingGeometry(0.5, 0.62, 40));
    doors.forEach((d, i) => {
      const s = doorSide(i);
      const z = doorZ(i);
      const xw = s * HALF_W;
      const dentro = -s;
      // Batente, folha azul, maçaneta e visor.
      add('batente', caixa(xw + dentro * 0.06, 0, z - 0.62, xw, 2.24, z - 0.54));
      add('batente', caixa(xw + dentro * 0.06, 0, z + 0.54, xw, 2.24, z + 0.62));
      add('batente', caixa(xw + dentro * 0.06, 2.16, z - 0.62, xw, 2.26, z + 0.62));
      add('porta', caixa(xw + dentro * 0.035, 0.01, z - 0.54, xw, 2.16, z + 0.54));
      add('macaneta', caixa(xw + dentro * 0.07, 1.0, z + 0.36, xw + dentro * 0.035, 1.05, z + 0.46));
      add('caixilho', caixa(xw + dentro * 0.04, 1.45, z - 0.16, xw + dentro * 0.036, 1.85, z + 0.16));
      // Placa com o nome da sala (sobre a porta, virada para o corredor).
      const pt = guardar(placaTextura(level === 4 ? (SINAIS_N4[i] ?? d.label).toUpperCase() : d.label.toUpperCase(), d.name, level === 4 ? '#22703A' : '#0C2A66'));
      const pm = guardar(new THREE.MeshStandardMaterial({ map: pt, roughness: 0.5, transparent: true }));
      const placa = new THREE.Mesh(geoPlaca, pm);
      placa.position.set(xw + dentro * 0.03, 2.62, z);
      placa.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2;
      placa.userData.semAO = true;
      placas.push(placa);
      scene.add(placa);
      // Luz de estado acima da placa.
      const lm = guardar(new THREE.MeshStandardMaterial({ color: 0x333333, emissive: 0x000000, roughness: 0.3 }));
      const luz = new THREE.Mesh(geoLuz, lm);
      luz.position.set(xw + dentro * 0.05, 2.9, z);
      luzesPorta.push(lm);
      scene.add(luz);
      // Anel no piso diante da porta aberta (guia de jogo).
      const am = guardar(new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.0, depthWrite: false }));
      const anel = new THREE.Mesh(geoAnel, am);
      anel.rotation.x = -Math.PI / 2;
      anel.position.set(xw + dentro * 0.75, 0.012, z);
      anel.userData.semAO = true;
      aneis.push(anel);
      scene.add(anel);
      // Armários do lado oposto (três portas cada, com frestas e puxadores).
      const xo = -s * HALF_W;
      for (let k = -1; k <= 1; k++) {
        const zc = z + k * 0.62;
        add('armario', caixa(xo + s * 0.38, 0.06, zc - 0.29, xo, 1.85, zc + 0.29));
        add('frestas', caixa(xo + s * 0.386, 1.55, zc - 0.2, xo + s * 0.378, 1.58, zc + 0.2));
        add('frestas', caixa(xo + s * 0.386, 1.45, zc - 0.2, xo + s * 0.378, 1.48, zc + 0.2));
        add('macaneta', caixa(xo + s * 0.40, 0.95, zc + 0.16, xo + s * 0.38, 1.15, zc + 0.2));
      }
      // Banco de madeira sob a janela seguinte (lado da porta) e um vaso com folhagem.
      const zj = z - DOOR_GAP / 2;
      const xb = HALF_W - 0.25; // banco sob a janela (parede do jardim)
      add('banco', caixa(xb - 0.2, 0.42, zj - 0.7, xb + 0.2, 0.47, zj + 0.7));
      add('banco', caixa(xb - 0.18, 0, zj - 0.65, xb + 0.18, 0.42, zj - 0.58));
      add('banco', caixa(xb - 0.18, 0, zj + 0.58, xb + 0.18, 0.42, zj + 0.65));
      const xv = s * (HALF_W - 0.3); // vaso entre as portas, na parede das salas
      add('vaso', caixa(xv - 0.2, 0, zj - 0.2, xv + 0.2, 0.42, zj + 0.2));
      for (let c = 0; c < 3; c++) {
        const g = new THREE.PlaneGeometry(0.95, 1.05);
        g.translate(0, 0.95, 0);
        g.rotateY((c * Math.PI) / 3 + i);
        g.translate(xv, 0, zj);
        add('folha', g);
      }
    });

    // Jardim lá fora: árvores de folhagem fotográfica e um muro baixo ao fundo (entorno visto pelas janelas).
    const rnd = (k: number) => { const x = Math.sin(k * 12.9898) * 43758.5453; return x - Math.floor(x); };
    for (const s of [-1, 1]) {
      for (let k = 0; k < Math.ceil((zIni - zFim) / 7) + 2; k++) {
        const z = zIni + 4 - k * 7 - rnd(k + s * 10) * 3;
        const x = s * (HALF_W + 4.5 + rnd(k * 3 + s) * 6);
        const alto = 4.2 + rnd(k * 7 + s) * 2.2;
        add('tronco', caixa(x - 0.12, -0.1, z - 0.12, x + 0.12, alto * 0.62, z + 0.12));
        for (let c = 0; c < 3; c++) {
          const g = new THREE.PlaneGeometry(alto * 0.95, alto * 0.7);
          g.translate(0, alto * 0.7, 0);
          g.rotateY((c * Math.PI) / 3 + k);
          g.translate(x, 0, z);
          add('folha', g);
        }
      }
      const xm = s * (HALF_W + 16);
      add('muro', caixa(xm - 0.15, -0.1, zFim - 40, xm + 0.15, 1.8, zIni + 40, m('parede')));
    }

    // Junta tudo por acabamento (poucas chamadas de desenho).
    const chao = ['piso', 'grama'];
    let malhaFolha: THREE.Mesh | null = null;
    for (const [chave, geos] of Object.entries(baldes)) {
      const g = guardar(mergeGeometries(geos, false) as THREE.BufferGeometry);
      geos.forEach(x => x.dispose());
      const malha = new THREE.Mesh(g, mat(chave));
      malha.receiveShadow = true;
      malha.castShadow = !chao.includes(chave);
      if (chave === 'folha') { malhaFolha = malha; malha.castShadow = false; }
      scene.add(malha);
    }
    // A folhagem só projeta sombra quando a foto (com o recorte) chega: sombra recortada, não retângulo.
    const sombraDaFolha = (t: THREE.Texture) => {
      if (!malhaFolha) return;
      malhaFolha.customDepthMaterial = guardar(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.5 }));
      malhaFolha.castShadow = true;
    };

    // ---------- Céu: foto do céu pela direção do olhar (vista pelas janelas) ----------
    const cupula = new THREE.Mesh(
      guardar(new THREE.SphereGeometry(200, 32, 16)),
      guardar(new THREE.ShaderMaterial({
        uniforms: { ceu: { value: null }, temCeu: { value: 0 }, horizonte: { value: new THREE.Color(COR_HORIZONTE) }, zenite: { value: new THREE.Color(COR_ZENITE) } },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); gl_Position.z = gl_Position.w * 0.99999; }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D ceu; uniform float temCeu; uniform vec3 horizonte; uniform vec3 zenite; varying vec3 vDir;
          void main() {
            vec3 d = normalize( vDir );
            float alt = asin( clamp( d.y, -1.0, 1.0 ) ) * 0.63661977;
            vec3 cor = mix( horizonte, zenite, pow( max( alt, 0.0 ), 0.6 ) );
            if ( temCeu > 0.5 && alt > 0.0 ) { float u = atan( d.z, d.x ) * 0.15915494 + 0.5; cor = texture2D( ceu, vec2( u, alt ) ).rgb; }
            cor = mix( horizonte, cor, smoothstep( 0.0, 0.05, alt ) );
            gl_FragColor = vec4( cor, 1.0 );
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
        side: THREE.BackSide, depthWrite: false,
      })),
    );
    cupula.renderOrder = -1;
    cupula.frustumCulled = false;
    cupula.userData.semAO = true;
    scene.add(cupula);
    const ceuMat = cupula.material as THREE.ShaderMaterial;

    // ---------- Personagens oficiais (sprites) com sombra de contato ----------
    const carregador = new THREE.TextureLoader();
    const texSprite = (src: string) => { const t = guardar(carregador.load(src)); t.colorSpace = THREE.SRGBColorSpace; return t; };
    const sombraTex = guardar(texturaSombraContato());
    const sombraMat = guardar(new THREE.MeshBasicMaterial({ map: sombraTex, transparent: true, depthWrite: false }));
    const geoSombra = guardar(new THREE.PlaneGeometry(1, 1));
    const sombraDe = (largura: number) => {
      const s = new THREE.Mesh(geoSombra, sombraMat);
      s.rotation.x = -Math.PI / 2; s.scale.set(largura, largura * 0.55, 1); s.position.y = 0.01; s.userData.semAO = true;
      scene.add(s);
      return s;
    };
    const chosen = AVATAR_CATALOG.find(a => a.id === avatarId || a.src === avatarId);
    let avatarTex: THREE.Texture;
    let imagemAtiva = true;
    if (chosen?.type === 'sprite-board' || chosen?.type === 'sprite-inc') {
      const board = chosen.type === 'sprite-board';
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 384;
      const ctx = cv.getContext('2d');
      avatarTex = guardar(new THREE.CanvasTexture(cv));
      avatarTex.colorSpace = THREE.SRGBColorSpace;
      const img = new Image();
      img.onload = () => {
        if (!imagemAtiva || !ctx) return;
        const w = img.width / (board ? 8.2 : 4.2);
        const h = img.height / 2.1;
        const x = (img.width - w) * ((chosen.col ?? 0) / (board ? 7 : 3));
        const y = (img.height - h) * ((chosen.row ?? 0) === 0 ? (board ? 0.08 : 0.10) : (board ? 0.92 : 0.90));
        ctx.clearRect(0, 0, 256, 384);
        if (chosen.allowsSkinTone && avatarSkinTone) ctx.filter = skinToneFilter[avatarSkinTone];
        ctx.drawImage(img, x, y, w, h, 0, 0, 256, 384);
        ctx.filter = 'none';
        avatarTex.needsUpdate = true;
      };
      img.src = board ? '/assets/nisialand_16_avatars_board.jpg' : '/assets/nisialand_inclusive_students.png';
    } else {
      avatarTex = texSprite(chosen?.src || '/assets/student_boy_hoodie.png');
    }
    const sprite = (t: THREE.Texture, w: number, h: number) => {
      const s = new THREE.Sprite(guardar(new THREE.SpriteMaterial({ map: t, transparent: true })));
      s.scale.set(w, h, 1); s.center.set(0.5, 0); s.userData.semAO = true;
      scene.add(s);
      return s;
    };
    const avatar = sprite(avatarTex, 0.85, 1.55);
    const sombraAvatar = sombraDe(0.8);
    const ze = sprite(texSprite('/assets/ze_cartinha.png'), 0.95, 1.45);
    const sombraZe = sombraDe(0.8);
    const mane = sprite(texSprite(MANE_IMG), 0.95, 1.45);
    const sombraMane = sombraDe(0.8);
    mane.visible = false; sombraMane.visible = false;
    let maneAt = -2;

    // ---------- Texturas fotográficas e ambiente, por qualidade ----------
    const cache = new Map<string, Promise<THREE.Texture>>();
    const obter = (nome: string, cor: boolean) => {
      if (!cache.has(nome)) {
        cache.set(nome, carregador.loadAsync(TEX + nome + '.webp').then(t => {
          guardar(t);
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.colorSpace = cor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
          t.anisotropy = Math.min(opcoes.current.qualidade === 'alta' ? 8 : 4, renderer.capabilities.getMaxAnisotropy());
          return t;
        }));
      }
      return cache.get(nome)!;
    };
    const aplicarMapas = (mt: THREE.MeshStandardMaterial) => {
      const a = mt.userData.acab as Acab;
      const mp = opcoes.current.contraste && !a.folha ? {} : (mt.userData.mapas ?? {});
      for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'] as const) {
        const v = (mp as Record<string, THREE.Texture | undefined>)[k] ?? null;
        if (mt[k] !== v) { mt[k] = v; mt.needsUpdate = true; }
      }
      const arm = !!(mp as Record<string, unknown>).roughnessMap;
      mt.roughness = arm ? 1 : opcoes.current.contraste ? 0.9 : a.rug ?? 0.8;
      mt.metalness = arm ? 1 : opcoes.current.contraste ? 0 : a.metal ?? 0;
    };
    let geracao = 0;
    let ambientePronto = false;
    const carregarTexturas = async () => {
      const alta = opcoes.current.qualidade === 'alta';
      const minha = ++geracao;
      const tarefas: Promise<unknown>[] = [];
      let feitas = 0, total = 0;
      const pegar = (nome: string, cor: boolean) => {
        total++;
        return obter(nome, cor).then(t => { feitas++; if (minha === geracao) setCarga(feitas < total ? `Carregando acabamento ${feitas} de ${total}` : ''); return t; });
      };
      for (const [chave, a] of Object.entries(ACAB)) {
        if (!a.tex || !mats[chave]) continue;
        const n = a.tex;
        const lista = [pegar(alta ? `${n}_c` : `${n}_c5`, true), pegar(alta && NORMAL_1K.has(n) ? `${n}_n` : `${n}_n5`, false)];
        if (alta) lista.push(pegar(`${n}_r`, false));
        tarefas.push(Promise.all(lista).then(([map, normalMap, arm]) => {
          if (minha !== geracao) return;
          mats[chave].userData.mapas = { map, normalMap, roughnessMap: arm, metalnessMap: arm, aoMap: arm };
          aplicarMapas(mats[chave]);
        }));
      }
      tarefas.push(pegar(alta ? 'copa' : 'copa5', true).then(t => { if (minha !== geracao || !mats.folha) return; mats.folha.userData.mapas = { map: t }; aplicarMapas(mats.folha); sombraDaFolha(t); }));
      tarefas.push(pegar(alta ? 'ceu' : 'ceu5', true).then(t => {
        if (minha !== geracao) return;
        t.wrapT = THREE.ClampToEdgeWrapping; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true;
        ceuMat.uniforms.ceu.value = t; ceuMat.uniforms.temCeu.value = 1;
      }));
      tarefas.push(pegar('ambiente', true).then(t => {
        if (ambientePronto) return;
        ambientePronto = true;
        t.mapping = THREE.EquirectangularReflectionMapping;
        const pm = new THREE.PMREMGenerator(renderer);
        scene.environment = guardar(pm.fromEquirectangular(t).texture);
        pm.dispose();
        hemi.intensity = 1.35;
      }));
      try { await Promise.all(tarefas); } catch (e) {
        console.warn('Textura do corredor não carregada', e);
        avisarRef.current(AVISOS_CORREDOR.acabamento, false);
      }
      if (minha === geracao) setCarga('');
    };

    // ---------- Pós-processamento da Alta (baixado só quando usado) ----------
    type Composer = { render: () => void; setSize: (w: number, h: number) => void; setPixelRatio: (r: number) => void };
    let composer: Composer | null = null;
    let passoFinal: { uniforms: Record<string, { value: number }> } | null = null;
    let posPromessa: Promise<void> | null = null;
    const prepararPos = () => {
      posPromessa ||= Promise.all([
        import('three/examples/jsm/postprocessing/EffectComposer.js'),
        import('three/examples/jsm/postprocessing/RenderPass.js'),
        import('three/examples/jsm/postprocessing/ShaderPass.js'),
        import('three/examples/jsm/postprocessing/GTAOPass.js'),
      ]).then(([{ EffectComposer }, { RenderPass }, { ShaderPass }, { GTAOPass }]) => {
        const w = mount.clientWidth, h = mount.clientHeight;
        const alvo = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 });
        const c = new EffectComposer(renderer, alvo);
        c.addPass(new RenderPass(scene, camera));
        const ao = new GTAOPass(scene, camera, w, h, {});
        const aoInterno = ao as unknown as { _visibilityCache: Map<THREE.Object3D, boolean>; scene: THREE.Scene; overrideVisibility: () => void };
        aoInterno.overrideVisibility = function () {
          const cacheV = this._visibilityCache;
          this.scene.traverse(o => { cacheV.set(o, o.visible); if ((o as THREE.Points).isPoints || (o as THREE.Line).isLine || o.userData.semAO) o.visible = false; });
        };
        ao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1.4, thickness: 1.0, scale: 1.1, samples: 12, distanceFallOff: 1.0, screenSpaceRadius: false });
        ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
        ao.blendIntensity = 1.0;
        c.addPass(ao);
        const final = new ShaderPass({
          uniforms: { tDiffuse: { value: null }, exposicao: { value: renderer.toneMappingExposure }, tempo: { value: 0 } },
          vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
          fragmentShader: /* glsl */ `
            uniform sampler2D tDiffuse; uniform float exposicao; uniform float tempo; varying vec2 vUv;
            ${TOM_NEUTRO.replace('tomNeutro', 'tomNeutroFinal')}
            void main() {
              vec3 c = tomNeutroFinal( texture2D( tDiffuse, vUv ).rgb * exposicao );
              vec2 p = vUv - 0.5;
              c *= 1.0 - 0.18 * dot( p, p ) * 2.0;
              c = clamp( c, 0.0, 1.0 );
              c = mix( c * 12.92, 1.055 * pow( c, vec3( 1.0 / 2.4 ) ) - 0.055, step( 0.0031308, c ) );
              float n = fract( sin( dot( gl_FragCoord.xy + tempo * 61.0, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
              gl_FragColor = vec4( c + ( n - 0.5 ) / 255.0, 1.0 );
            }`,
        });
        final.material.toneMapped = false;
        c.addPass(final);
        passoFinal = final as unknown as { uniforms: Record<string, { value: number }> };
        composer = c as unknown as Composer;
        ajustarTamanho();
      }).catch(e => { console.warn('Pós-processamento indisponível; seguindo sem ele.', e); composer = null; });
      return posPromessa;
    };
    const usaPos = () => !!composer && opcoes.current.qualidade === 'alta' && !opcoes.current.contraste;

    const ajustarTamanho = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setPixelRatio(razaoPixels());
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
    };

    const aplicarSombras = () => {
      const ligadas = opcoes.current.sombras && !opcoes.current.contraste;
      if (sol.castShadow !== ligadas) { sol.castShadow = ligadas; Object.values(mats).forEach(x => { x.needsUpdate = true; }); }
    };
    const aplicarPaleta = () => {
      const p = paleta();
      for (const [chave, mt] of Object.entries(mats)) {
        if (p[chave] !== undefined) mt.color.setHex(p[chave]);
        // Fotos de piso e reboco são escuras: clareia um pouco no modo normal (cores reais, escola ensolarada).
        if (!opcoes.current.contraste && ACAB[chave]?.tex) mt.color.multiplyScalar(chave === 'piso' ? 1.35 : 1.15);
        aplicarMapas(mt);
      }
      scene.background = opcoes.current.contraste ? new THREE.Color(0x000000) : null;
      cupula.visible = !opcoes.current.contraste;
      renderer.domElement.style.filter = opcoes.current.calmo && !opcoes.current.contraste ? 'saturate(0.72)' : '';
    };

    // Aplica qualidade, contraste, calmo e sombras (chamado pelos botões).
    const aplicar = async (motivo?: string) => {
      const alta = opcoes.current.qualidade === 'alta';
      escala = 1;
      lentos = lentosQ = 0;
      const tam = alta ? 2048 : 1024;
      if (sol.shadow.mapSize.x !== tam) {
        sol.shadow.mapSize.set(tam, tam);
        if (sol.shadow.map) { sol.shadow.map.dispose(); (sol.shadow as unknown as { map: THREE.WebGLRenderTarget | null }).map = null; }
      }
      const meia = alta ? 9 : 7;
      Object.assign(sol.shadow.camera, { left: -meia, right: meia, top: meia, bottom: -meia, near: 0.5, far: 60 });
      sol.shadow.camera.updateProjectionMatrix();
      const tipo = alta ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
      if (renderer.shadowMap.type !== tipo) { renderer.shadowMap.type = tipo; Object.values(mats).forEach(x => { x.needsUpdate = true; }); }
      aplicarSombras();
      aplicarPaleta();
      ajustarTamanho();
      if (motivo) avisarRef.current(motivo);
      const prontas = carregarTexturas();
      if (alta) await prepararPos();
      ajustarTamanho();
      await prontas;
    };
    aplicarRef.current = (motivo?: string) => { void aplicar(motivo); };

    // ---------- Estado do jogador e controles ----------
    const startIdx = Math.max(0, doors.findIndex(d => d.id === startAt));
    const pos = new THREE.Vector3(0, 0, startAt ? doorZ(startIdx) + 1.4 : zIni - 1);
    let yaw = 0;
    const teclas = new Set<string>();
    const stick = { x: 0, y: 0 };
    let zeLineAt = 0, lineIdx = 0;
    let zeSpot = 0, zeTrocaAt = 0;

    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (pausedRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea|select/i.test(target.tagName)) return;
      const k = e.key.toLowerCase();
      if (down && (k === 'enter' || k === 'e') && nearRef.current && nearRef.current.state !== 'locked') { onEnterRef.current(nearRef.current.id); return; }
      if (down && k === 'q') { (window as unknown as { __nisia3dQualidade?: () => void }).__nisia3dQualidade?.(); return; }
      if (down && k === 'h') { setAjuda(a => !a); return; }
      if (down && k === 'c') { setContraste(v => !v); return; }
      if (down && k === 'm') { setCalmo(v => !v); return; }
      if (down && k === 'v') { setVoz(v => !v); return; }
      if (down && k === 'escape') { setAjuda(false); return; }
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        e.preventDefault();
        if (down) teclas.add(k); else teclas.delete(k);
      }
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    const canvas = renderer.domElement;
    let dragId: number | null = null, dragX = 0;
    const pd = (e: PointerEvent) => { dragId = e.pointerId; dragX = e.clientX; canvas.setPointerCapture(e.pointerId); };
    const pmv = (e: PointerEvent) => { if (e.pointerId !== dragId) return; yaw -= (e.clientX - dragX) * 0.006; dragX = e.clientX; };
    const pu = (e: PointerEvent) => { if (e.pointerId === dragId) dragId = null; };
    canvas.addEventListener('pointerdown', pd);
    canvas.addEventListener('pointermove', pmv);
    canvas.addEventListener('pointerup', pu);
    canvas.addEventListener('pointercancel', pu);

    const base = stickRef.current, knob = knobRef.current;
    let stickId: number | null = null;
    const moveStick = (e: PointerEvent) => {
      if (!base || !knob) return;
      const r = base.getBoundingClientRect();
      let dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      let dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const len = Math.hypot(dx, dy);
      if (len > 1) { dx /= len; dy /= len; }
      stick.x = dx; stick.y = dy;
      knob.style.transform = `translate(${dx * 34}px, ${dy * 34}px)`;
    };
    const sd = (e: PointerEvent) => { stickId = e.pointerId; base?.setPointerCapture(e.pointerId); moveStick(e); };
    const sm = (e: PointerEvent) => { if (e.pointerId === stickId) moveStick(e); };
    const su = (e: PointerEvent) => { if (e.pointerId !== stickId) return; stickId = null; stick.x = 0; stick.y = 0; if (knob) knob.style.transform = ''; };
    base?.addEventListener('pointerdown', sd);
    base?.addEventListener('pointermove', sm);
    base?.addEventListener('pointerup', su);
    base?.addEventListener('pointercancel', su);
    window.addEventListener('resize', ajustarTamanho);

    // ---------- Minimapa ----------
    const desenharMapa = () => {
      const cv = mapaRef.current;
      if (!cv) return;
      const g = cv.getContext('2d');
      if (!g) return;
      const W = cv.width, H = cv.height;
      const sx = (x: number) => W / 2 + (x / (HALF_W + 0.4)) * (W / 2 - 6);
      const sz = (z: number) => 8 + ((zIni - z) / (zIni - zFim)) * (H - 16);
      g.clearRect(0, 0, W, H);
      g.fillStyle = opcoes.current.contraste ? '#000' : 'rgba(255,246,223,0.95)';
      g.fillRect(0, 0, W, H);
      g.fillStyle = opcoes.current.contraste ? '#333' : '#E7D3A6';
      g.fillRect(sx(-HALF_W), sz(zIni), sx(HALF_W) - sx(-HALF_W), sz(zFim) - sz(zIni));
      doorsRef.current.forEach((d, i) => {
        const cor = d.state === 'locked' ? '#8A8A8A' : d.state === 'done' ? '#3FA34D' : '#F2811D';
        g.fillStyle = cor;
        const x = doorSide(i) < 0 ? sx(-HALF_W) - 5 : sx(HALF_W) - 1;
        g.fillRect(x, sz(doorZ(i)) - 6, 6, 12);
      });
      g.fillStyle = '#1F5FD0';
      g.beginPath(); g.arc(sx(pos.x), sz(pos.z), 5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#1F5FD0'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(sx(pos.x), sz(pos.z)); g.lineTo(sx(pos.x - Math.sin(yaw) * 0.9), sz(pos.z - Math.cos(yaw) * 0.9)); g.stroke();
    };

    // ---------- Laço ----------
    const fwd = new THREE.Vector3(), right = new THREE.Vector3(), look = new THREE.Vector3(), tela = new THREE.Vector3();
    const camAlvo = new THREE.Vector3(), lookAlvo = new THREE.Vector3();
    let raf = 0, last = performance.now(), elapsed = 0, passo = 0;
    let velX = 0, velZ = 0, giroVel = 0, inclina = 0, camPronta = false, lookPronto = false;
    let soma = 0, n = 0, t1 = 0, lentos = 0, lentosQ = 0;

    const posicionarBalao = (el: HTMLDivElement | null, alvo: THREE.Object3D, mostrar: boolean) => {
      if (!el) return;
      let ok = mostrar;
      if (ok) {
        tela.set(alvo.position.x, 1.75, alvo.position.z).project(camera);
        ok = tela.z < 1 && Math.abs(tela.x) < 1.1 && Math.abs(tela.y) < 1.1;
      }
      el.style.display = ok ? 'block' : 'none';
      if (ok) el.style.transform = `translate(${(tela.x + 1) / 2 * mount.clientWidth}px, ${(1 - tela.y) / 2 * mount.clientHeight}px) translate(-50%, -100%)`;
    };

    const frame = (agora: number) => {
      raf = 0;
      if (pausedRef.current) return;
      const dt = Math.min(0.05, (agora - last) / 1000);
      last = agora;
      elapsed += dt;
      const o = opcoes.current;

      // Movimento relativo à câmera (modo calmo: mais devagar).
      fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw));
      right.set(-fwd.z, 0, fwd.x);
      let mx = stick.x, my = -stick.y;
      if (teclas.has('w') || teclas.has('arrowup')) my += 1;
      if (teclas.has('s') || teclas.has('arrowdown')) my -= 1;
      if (teclas.has('d')) mx += 1;
      if (teclas.has('a')) mx -= 1;
      // Giro com aceleração (sem tranco ao apertar ou soltar a seta).
      const giro = o.calmo ? 1.2 : 1.8;
      const giroAlvo = (teclas.has('arrowleft') ? giro : 0) - (teclas.has('arrowright') ? giro : 0);
      giroVel += (giroAlvo - giroVel) * (1 - Math.exp(-dt * 10));
      yaw += giroVel * dt;

      // Velocidade com arranque e freada suaves (~0,15 s), em vez de liga/desliga.
      const ml = Math.hypot(mx, my);
      const vMax = o.calmo ? VEL * 0.7 : VEL;
      let alvoX = 0, alvoZ = 0;
      if (ml > 0.05) {
        const k = (Math.min(1, ml) / ml) * vMax;
        alvoX = (fwd.x * my + right.x * mx) * k;
        alvoZ = (fwd.z * my + right.z * mx) * k;
      }
      const resp = 1 - Math.exp(-dt * (ml > 0.05 ? 8 : 11));
      velX += (alvoX - velX) * resp;
      velZ += (alvoZ - velZ) * resp;
      pos.x += velX * dt; pos.z += velZ * dt;
      const limX = HALF_W - 0.72;
      if (pos.x < -limX || pos.x > limX) { pos.x = Math.max(-limX, Math.min(limX, pos.x)); velX = 0; }
      if (pos.z < zFim + 0.8 || pos.z > zIni - 0.4) { pos.z = Math.max(zFim + 0.8, Math.min(zIni - 0.4, pos.z)); velZ = 0; }
      const rapidez = Math.hypot(velX, velZ);
      const r = Math.min(1, rapidez / VEL); // 0 parado … 1 andando no máximo

      // Passada presa à distância percorrida: o ritmo dos passos acompanha a velocidade (o pé não "patina").
      passo += (rapidez * dt * Math.PI * 2) / PASSADA;
      if (r < 0.03) passo += (Math.round(passo / Math.PI) * Math.PI - passo) * (1 - Math.exp(-dt * 8)); // assenta o passo ao parar
      const lateral = (velX * right.x + velZ * right.z) / VEL; // -1 esquerda … 1 direita, na visão da câmera
      inclina += (lateral * 0.14 - inclina) * (1 - Math.exp(-dt * 7));
      const anima = !o.calmo;
      const quique = anima ? Math.abs(Math.sin(passo)) * 0.06 * r : 0;                  // dois apoios por ciclo
      const balanco = anima ? Math.sin(passo) * 0.05 * r : 0;                            // peso de um pé para o outro
      const amassa = anima ? 1 - 0.035 * r * Math.cos(passo * 2) : 1;                    // estica no alto, encolhe no apoio
      const respira = anima ? 1 + 0.012 * (1 - r) * Math.sin(elapsed * 2.2) : 1;         // parado, respira
      avatar.position.set(pos.x, quique, pos.z);
      avatar.scale.set(0.85 * (2 - amassa), 1.55 * amassa * respira, 1);
      (avatar.material as THREE.SpriteMaterial).rotation = anima ? -(balanco + inclina) : 0;
      sombraAvatar.position.set(pos.x, 0.01, pos.z);
      const sombraK = 1 - quique * 2.5;
      sombraAvatar.scale.set(0.8 * sombraK, 0.8 * 0.55 * sombraK, 1);

      // Câmera segue com atraso suave (não gruda no aluno a cada passo).
      camAlvo.set(pos.x - fwd.x * 3.0, 1.95, pos.z - fwd.z * 3.0);
      camAlvo.x = Math.max(-HALF_W + 0.25, Math.min(HALF_W - 0.25, camAlvo.x));
      camAlvo.z = Math.min(zIni + 0.1, Math.max(zFim - 0.1, camAlvo.z));
      if (!camPronta) { camera.position.copy(camAlvo); camPronta = true; }
      else camera.position.lerp(camAlvo, 1 - Math.exp(-dt * 7));
      lookAlvo.set(pos.x + fwd.x * 2, 1.15, pos.z + fwd.z * 2);
      if (!lookPronto) { look.copy(lookAlvo); lookPronto = true; }
      else look.lerp(lookAlvo, 1 - Math.exp(-dt * 9));
      camera.lookAt(look);
      cupula.position.copy(camera.position);

      // O sol (e o recorte da sombra) acompanha o aluno, em passos de meio metro.
      const sxp = Math.round(pos.x * 2) / 2, szp = Math.round(pos.z * 2) / 2;
      sol.target.position.set(sxp, 0, szp - 2);
      sol.position.copy(sol.target.position).addScaledVector(DIR_SOL, 30);

      // Portas: luz de estado, anel no piso da porta aberta e porta mais próxima.
      const ds = doorsRef.current;
      let maisPerto: CorridorDoor | null = null;
      ds.forEach((d, i) => {
        const lm = luzesPorta[i];
        const anel = aneis[i];
        const pulso = o.calmo ? 0.8 : 0.6 + 0.4 * Math.sin(elapsed * 3);
        if (lm) {
          if (d.state === 'locked') { lm.color.setHex(0x553333); lm.emissive.setHex(0x330000); lm.emissiveIntensity = 1; }
          else if (d.state === 'done') { lm.color.setHex(0x3fa34d); lm.emissive.setHex(0x3fa34d); lm.emissiveIntensity = 1.4; }
          else { lm.color.setHex(0xffd23f); lm.emissive.setHex(0xffb000); lm.emissiveIntensity = 1 + pulso; }
        }
        if (anel) (anel.material as THREE.MeshBasicMaterial).opacity = d.state === 'open' ? 0.35 + 0.35 * pulso : 0;
        if (Math.abs(doorZ(i) - pos.z) < PERTO) maisPerto = d;
      });
      if (maisPerto !== nearRef.current) {
        nearRef.current = maisPerto;
        setNear(maisPerto);
        const d = maisPerto as CorridorDoor | null;
        if (d) avisarRef.current(falaDaPorta(d.label, d.name, d.state));
      }

      // Zé: fica parado numa porta à frente e muda de lugar quando o aluno chega perto (sem deslizar).
      const alvoZe = Math.min(ds.length - 1, Math.max(0, Math.round((zIni - 1 - pos.z) / DOOR_GAP) + 1));
      if ((alvoZe !== zeSpot && elapsed - zeTrocaAt > 6) || zeTrocaAt === 0) {
        zeSpot = alvoZe; zeTrocaAt = elapsed;
        ze.position.set(-doorSide(zeSpot) * 0.55, 0, doorZ(zeSpot) - 1.6);
        sombraZe.position.set(ze.position.x, 0.01, ze.position.z);
      }
      ze.scale.y = 1.45 * (1 + (o.calmo ? 0 : 0.012 * Math.sin(elapsed * 2)));
      if (elapsed - zeLineAt > 6) { zeLineAt = elapsed; lineIdx = (lineIdx + 1) % ZE_LINES.length; setZeText(ZE_LINES[lineIdx]); }
      posicionarBalao(zeRef.current, ze, ze.position.distanceTo(pos) < 9);

      // Mané (Nível 3): espera na primeira porta aberta (aparece direto, não desliza).
      const openIdx = level === 3 ? ds.findIndex(d => d.state === 'open') : -1;
      if (openIdx !== maneAt) {
        maneAt = openIdx;
        setManeIdx(openIdx);
        if (openIdx >= 0 && MANE_CORRIDOR_LINES[openIdx] && vozRef.current) falarComo('mane', MANE_CORRIDOR_LINES[openIdx].pt, 'pt-BR', MANE_CORRIDOR_LINES[openIdx].en);
        mane.visible = sombraMane.visible = openIdx >= 0;
        if (openIdx >= 0) {
          mane.position.set(doorSide(openIdx) * (HALF_W - 0.85), 0, doorZ(openIdx) + 0.95);
          sombraMane.position.set(mane.position.x, 0.01, mane.position.z);
        }
      }
      posicionarBalao(maneRef.current, mane, mane.visible && Math.abs(mane.position.z - pos.z) < 4);

      renderer.info.reset();
      if (usaPos() && composer) {
        if (passoFinal) passoFinal.uniforms.tempo.value = (performance.now() % 10000) / 1000;
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      // Medição a cada segundo e proteção automática (resolução → econômico → sombras).
      soma += dt; n++; t1 += dt;
      if (t1 >= 1) {
        const medio = soma / n;
        const alta = o.qualidade === 'alta';
        const alvo = alta ? 50 : 30;
        const minimo = alta ? 0.6 : 0.5;
        if (medio > 1 / alvo + 0.002 && escala > minimo) escala = Math.max(minimo, escala - 0.1);
        else if (medio < 1 / (alvo * 1.3) && escala < 1) escala = Math.min(1, escala + 0.05);
        if (alta && escala <= 0.6 && medio > 1 / 30) {
          if (++lentosQ >= 3) {
            lentosQ = 0;
            opcoes.current = { ...opcoes.current, qualidade: 'economica' };
            setQualidade('economica');
            void aplicar(AVISOS_CORREDOR.economicoAuto);
          }
        } else lentosQ = 0;
        if (!alta && o.sombras && !o.contraste && medio > 1 / 28) {
          if (++lentos >= 3) {
            lentos = 0;
            opcoes.current = { ...opcoes.current, sombras: false };
            setSombras(false);
            aplicarSombras();
            avisarRef.current(AVISOS_CORREDOR.sombras);
          }
        } else lentos = 0;
        if (Math.abs(renderer.getPixelRatio() - razaoPixels()) > 0.01) ajustarTamanho();
        const info = renderer.info.render;
        (window as unknown as { __nisia3d?: object }).__nisia3d = { qps: Math.round(1 / medio), qualidade: o.qualidade, pos: usaPos(), chamadas: info.calls, triangulos: info.triangles, pixel: renderer.getPixelRatio(), escala };
        soma = n = t1 = 0;
        desenharMapa();
      }
      raf = requestAnimationFrame(frame);
    };
    resumeRef.current = () => {
      if (raf || pausedRef.current) return;
      ajustarTamanho();
      last = performance.now();
      teclas.clear(); stick.x = 0; stick.y = 0;
      raf = requestAnimationFrame(frame);
    };
    void aplicar();
    desenharMapa();
    resumeRef.current();

    return () => {
      imagemAtiva = false;
      cancelAnimationFrame(raf);
      resumeRef.current = () => {};
      aplicarRef.current = () => {};
      pararVoz.current();
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('resize', ajustarTamanho);
      canvas.removeEventListener('pointerdown', pd);
      canvas.removeEventListener('pointermove', pmv);
      canvas.removeEventListener('pointerup', pu);
      canvas.removeEventListener('pointercancel', pu);
      base?.removeEventListener('pointerdown', sd);
      base?.removeEventListener('pointermove', sm);
      base?.removeEventListener('pointerup', su);
      base?.removeEventListener('pointercancel', su);
      descartar.forEach(d => d.dispose());
      sol.shadow.map?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
    // A cena é montada uma vez; portas mudam pelo doorsRef e as opções por aplicarRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Botões de opção → cena.
  useEffect(() => {
    const antes = opcoes.current;
    opcoes.current = { qualidade, contraste, calmo, sombras };
    if (antes.qualidade !== qualidade) {
      aplicarRef.current(qualidade === 'alta'
        ? AVISOS_CORREDOR.alta
        : AVISOS_CORREDOR.economico);
    } else if (antes.contraste !== contraste || antes.calmo !== calmo || antes.sombras !== sombras) {
      aplicarRef.current(antes.contraste !== contraste ? (contraste ? AVISOS_CORREDOR.contrasteOn : AVISOS_CORREDOR.contrasteOff) : antes.calmo !== calmo ? (calmo ? AVISOS_CORREDOR.calmoOn : AVISOS_CORREDOR.calmoOff) : undefined);
    }
  }, [qualidade, contraste, calmo, sombras]);

  // Atalho Q e botão de qualidade usam a mesma troca (com a escolha guardada no aparelho).
  const alternarQualidade = () => {
    setQualidade(q => {
      const nova: Qualidade = q === 'alta' ? 'economica' : 'alta';
      try { localStorage.setItem(CHAVE_QUALIDADE, nova); } catch { /* vale só nesta visita */ }
      return nova;
    });
  };
  useEffect(() => {
    (window as unknown as { __nisia3dQualidade?: () => void }).__nisia3dQualidade = alternarQualidade;
    return () => { delete (window as unknown as { __nisia3dQualidade?: () => void }).__nisia3dQualidade; };
  });

  // Pausa o laço enquanto a sala está aberta e retoma ao voltar.
  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) resumeRef.current();
  }, [paused]);

  if (failed) {
    return (
      <div className="fixed inset-0 bg-nisia-azul-900 flex flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="font-display text-xl text-nisia-sol-400">Este aparelho não abriu o corredor 3D.</p>
        <button type="button" onClick={onSimpleMode} className="kit-btn kit-btn--sol">Usar o quadro das salas</button>
      </div>
    );
  }

  const enterNear = () => { if (near && near.state !== 'locked') { audioService.playClick(); onEnter(near.id); } };
  const btn = 'kit-hud__btn';

  return (
    <div className="fixed inset-0 overflow-hidden select-none touch-none bg-nisia-azul-900" role="application" aria-label={`${heading}: corredor 3D. Use as setas ou W A S D para andar, Enter para entrar na sala, H para ajuda.`}>
      <div ref={mountRef} className="absolute inset-0" />

      {/* Topo: nome do nível e controles (seletor de qualidade sempre visível) */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 pointer-events-none">
        <div className="kit-placa px-5 py-1.5 short:px-4 short:py-0.5 -rotate-1">
          <p className="text-[10px] font-display tracking-widest opacity-80">NISIALAND · NÍVEL {level}</p>
          <p className="font-display text-lg short:text-sm leading-none">{heading}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5 pointer-events-auto max-w-[70%]">
          <button type="button" onClick={alternarQualidade} className={btn} aria-label={`Qualidade: ${qualidade === 'alta' ? 'alta' : 'econômico'}. Trocar (tecla Q)`} title="Trocar a qualidade (tecla Q)">
            <Icone nome={qualidade === 'alta' ? 'estrela' : 'relogio'} className="w-5 h-5" cor={qualidade === 'alta' ? '#FFD23F' : '#A9CDFF'} />
            <span>{qualidade === 'alta' ? 'Alta' : 'Econômico'}</span>
          </button>
          <button type="button" onClick={() => setAjuda(a => !a)} className={btn} aria-expanded={ajuda} aria-label="Ajuda e acessibilidade (tecla H)"><Icone nome="dica" className="w-5 h-5" /> <span className="hidden sm:inline">Ajuda</span></button>
          <button type="button" onClick={onSimpleMode} className={btn}><Icone nome="livro" className="w-5 h-5" /> <span className="hidden sm:inline">{simpleLabel}</span></button>
          <button type="button" onClick={onExit} className={btn}><Icone nome="mapa" className="w-5 h-5" /> <span className="hidden sm:inline">Mapa</span></button>
        </div>
      </div>

      {/* Minimapa */}
      <canvas ref={mapaRef} width={70} height={180} className="absolute right-3 top-16 short:top-12 w-[70px] h-[180px] short:h-[120px] rounded-lg border-2 border-nisia-tinta shadow-[0_3px_0_0_rgba(26,42,74,0.35)]" aria-label="Minimapa do corredor" role="img" />

      {/* Aviso falado (também lido por leitores de tela) */}
      <p className="absolute left-1/2 -translate-x-1/2 bottom-24 short:bottom-20 max-w-[min(92vw,560px)] px-4 py-2 rounded-xl bg-nisia-tinta/85 text-white text-sm font-semibold text-center pointer-events-none" role="status" aria-live="polite" style={{ display: aviso ? 'block' : 'none' }}>{aviso}</p>
      {carga && <p className="absolute left-1/2 -translate-x-1/2 top-16 px-3 py-1 rounded-full bg-nisia-papel text-nisia-tinta text-xs font-semibold pointer-events-none">{carga}</p>}

      {/* Ajuda e acessibilidade */}
      {ajuda && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,460px)] kit-papel kit-papel--liso p-4 text-nisia-tinta" role="dialog" aria-label="Ajuda do corredor">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-lg text-nisia-azul-700">Ajuda</h2>
            <button type="button" onClick={() => setAjuda(false)} className="kit-btn kit-btn--papel kit-btn--sm !min-w-0 !px-2" aria-label="Fechar a ajuda"><Icone nome="x" className="w-4 h-4" cor="#E5484D" /></button>
          </div>
          <ul className="text-sm space-y-1 mb-3">
            <li><b>Andar:</b> setas ou W A S D · no toque, o círculo à esquerda</li>
            <li><b>Olhar:</b> arrastar na tela · setas ← →</li>
            <li><b>Entrar na sala:</b> Enter ou o botão Entrar</li>
            <li><b>Atalhos:</b> Q qualidade · C contraste · M calmo · V voz · H ajuda</li>
          </ul>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setContraste(v => !v)} aria-pressed={contraste} className={`kit-btn kit-btn--sm ${contraste ? 'kit-btn--sol' : 'kit-btn--papel'}`}>Alto contraste</button>
            <button type="button" onClick={() => setCalmo(v => !v)} aria-pressed={calmo} className={`kit-btn kit-btn--sm ${calmo ? 'kit-btn--sol' : 'kit-btn--papel'}`}>Modo calmo</button>
            <button type="button" onClick={() => setVoz(v => !v)} aria-pressed={voz} className={`kit-btn kit-btn--sm ${voz ? 'kit-btn--sol' : 'kit-btn--papel'}`}>Voz</button>
            <button type="button" onClick={() => setSombras(v => !v)} aria-pressed={sombras} className={`kit-btn kit-btn--sm ${sombras ? 'kit-btn--sol' : 'kit-btn--papel'}`}>Sombras</button>
          </div>
        </div>
      )}

      <div ref={zeRef} className="absolute left-0 top-0 pointer-events-none kit-balao !px-3 !py-1.5 max-w-[220px] text-xs font-semibold" style={{ display: 'none' }}>
        <span className="block text-[10px] font-display uppercase tracking-widest text-nisia-laranja-700">Zé Cartinha</span>
        {zeLine ?? zeText}
      </div>
      <div ref={maneRef} data-testid="mane-balloon" className="absolute left-0 top-0 pointer-events-none kit-balao !px-3 !py-1.5 max-w-[220px] short:max-w-[170px] text-xs short:text-[10px] font-semibold" style={{ display: 'none' }}>
        {maneIdx >= 0 && MANE_CORRIDOR_LINES[maneIdx] && (
          <>
            <span className="block text-[10px] font-display uppercase tracking-widest text-nisia-laranja-700">Mané</span>
            <span className="block">{MANE_CORRIDOR_LINES[maneIdx].pt}</span>
            <span className="block text-nisia-tinta-suave italic">{MANE_CORRIDOR_LINES[maneIdx].en}</span>
          </>
        )}
      </div>

      {/* Joystick grande (toque) */}
      <div ref={stickRef} aria-label="Controle de movimento" role="img" className="absolute left-4 bottom-4 short:left-3 short:bottom-3 w-32 h-32 short:w-28 short:h-28 rounded-full bg-white/35 border-[3px] border-white/85 flex items-center justify-center touch-none backdrop-blur-[2px]">
        <div ref={knobRef} className="w-14 h-14 rounded-full bg-nisia-papel border-[3px] border-nisia-azul-500 shadow-[0_3px_0_0_rgba(26,42,74,0.35)] pointer-events-none" />
      </div>

      {near && (
        <div className="absolute right-4 bottom-4 short:right-3 short:bottom-3 flex flex-col items-end gap-1.5">
          <p className="kit-ficha kit-ficha--papel normal-case tracking-normal">{near.label} · {near.name}</p>
          {near.state === 'locked' ? (
            <span className="kit-btn kit-btn--papel opacity-80 cursor-not-allowed"><Icone nome="cadeado" className="w-5 h-5" cor="#F3E4BE" /> Trancada</span>
          ) : (
            <button type="button" onClick={enterNear} className="kit-btn kit-btn--sol kit-btn--lg">
              <Icone nome="jogar" className="w-6 h-6" cor="#1A2A4A" /> {near.state === 'done' ? 'Jogar de novo' : 'Entrar'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Corridor3D;
