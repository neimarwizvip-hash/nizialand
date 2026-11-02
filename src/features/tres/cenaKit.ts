import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { TEX, caixa, criarPosAlta, instalarTom, prepararMacro, type Composer, type Qualidade } from './base3d';

// Kit para montar os espaços 3D da escola (sala de aula, quadra, biblioteca…) no padrão da Rota Piloto:
// acabamentos com foto (cor + relevo; na Alta também rugosidade/oclusão), céu de foto, luz de ambiente (PMREM),
// sol com sombra suave, GTAO + MSAA na Alta. As peças estáticas são juntadas por acabamento (poucas chamadas).

export interface Acabamento { tex?: 'piso' | 'parede' | 'grama' | 'folha'; m?: number; cor: number; rug?: number; metal?: number; macro?: number; emissivo?: number; contraste?: number }

export interface OpcoesKit { qualidade: Qualidade; contraste?: boolean; externo?: boolean; exposicao?: number; fundo?: number; semPos?: boolean }

export interface Kit {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  sol: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  guardar: <T extends { dispose: () => void }>(o: T) => T;
  /** Registra um acabamento (nome → material). */
  acabamento: (nome: string, a: Acabamento) => THREE.MeshStandardMaterial;
  /** Peça estática: entra no balde do acabamento e é juntada no fim. */
  add: (nome: string, g: THREE.BufferGeometry) => void;
  /** Caixa com UV em metros, já no balde. */
  bloco: (nome: string, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => void;
  /** Junta os baldes e baixa as fotos do patamar escolhido. Resolve quando tudo carregou. */
  finalizar: () => Promise<void>;
  render: () => void;
  ajustar: () => void;
  dispose: () => void;
}

const NORMAL_1K = new Set(['piso']);

export function criarKit(mount: HTMLElement, op: OpcoesKit): Kit {
  instalarTom();
  const alta = op.qualidade === 'alta';
  const contraste = !!op.contraste;
  const renderer = new THREE.WebGLRenderer({ antialias: true, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, alta ? 2 : 1.5));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.toneMapping = THREE.CustomToneMapping;
  renderer.toneMappingExposure = op.exposicao ?? 1.3;
  renderer.shadowMap.enabled = !contraste;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  mount.appendChild(renderer.domElement);

  const descartar: Array<{ dispose: () => void }> = [];
  const guardar = <T extends { dispose: () => void }>(o: T) => { descartar.push(o); return o; };
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(contraste ? 0x000000 : op.fundo ?? 0x9fb2c8);
  const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / Math.max(1, mount.clientHeight), 0.05, 400);

  const hemi = new THREE.HemisphereLight(0xfffaf0, 0xd8c8a8, contraste ? 2.2 : 1.4);
  scene.add(hemi);
  const sol = new THREE.DirectionalLight(0xfff0d8, contraste ? 1.2 : 3.2);
  sol.castShadow = !contraste;
  const tam = alta ? 2048 : 1024;
  sol.shadow.mapSize.set(tam, tam);
  sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.03;
  scene.add(sol, sol.target);

  // Acabamentos
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const defs: Record<string, Acabamento> = {};
  const acabamento = (nome: string, a: Acabamento) => {
    defs[nome] = a;
    const cor = contraste ? a.contraste ?? 0x808080 : a.cor;
    const m = guardar(new THREE.MeshStandardMaterial({ color: cor, roughness: a.rug ?? 0.8, metalness: a.metal ?? 0 }));
    // As fotos de piso e reboco são escuras: clareia como no corredor (cores reais, escola ensolarada).
    if (!contraste && (a.tex === 'piso' || a.tex === 'parede')) m.color.multiplyScalar(a.tex === 'piso' ? 1.3 : 1.12);
    if (a.emissivo) { m.emissive = new THREE.Color(cor); m.emissiveIntensity = contraste ? 0.4 : a.emissivo; }
    if (a.tex === 'folha') { m.transparent = false; m.alphaTest = 0.5; m.side = THREE.DoubleSide; }
    if (a.tex && a.tex !== 'folha' && !contraste && a.macro) prepararMacro(m, a.macro);
    mats[nome] = m;
    return m;
  };
  const baldes: Record<string, THREE.BufferGeometry[]> = {};
  const add = (nome: string, g: THREE.BufferGeometry) => { (baldes[nome] ||= []).push(g); };
  const bloco = (nome: string, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => add(nome, caixa(x0, y0, z0, x1, y1, z1, defs[nome]?.m ?? 1));

  // Céu de foto (só nos espaços com vista para fora).
  let ceuMat: THREE.ShaderMaterial | null = null;
  if (!contraste) {
    ceuMat = guardar(new THREE.ShaderMaterial({
      uniforms: { ceu: { value: null }, temCeu: { value: 0 }, horizonte: { value: new THREE.Color(0x9fb2c8) }, zenite: { value: new THREE.Color(0x5d7aa8) } },
      vertexShader: /* glsl */ `varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); gl_Position.z = gl_Position.w * 0.99999; }`,
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
    }));
    const cupula = new THREE.Mesh(guardar(new THREE.SphereGeometry(300, 32, 16)), ceuMat);
    cupula.renderOrder = -1; cupula.frustumCulled = false; cupula.userData.semAO = true;
    scene.add(cupula);
  }

  let composer: Composer | null = null;
  const ajustar = () => {
    const w = mount.clientWidth, h = mount.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
  };

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

  const finalizar = async () => {
    for (const [nome, geos] of Object.entries(baldes)) {
      if (!geos.length || !mats[nome]) continue;
      // Junta só geometrias com os mesmos atributos (sem índice; posição, normal e UV).
      const prontas = geos.map(x => {
        const y = x.index ? x.toNonIndexed() : x;
        for (const k of Object.keys(y.attributes)) if (!['position', 'normal', 'uv'].includes(k)) y.deleteAttribute(k);
        return y;
      });
      const juntada = mergeGeometries(prontas, false);
      geos.forEach(x => x.dispose()); prontas.forEach(x => x.dispose());
      if (!juntada) { console.warn('Peças do acabamento não juntaram:', nome); continue; }
      const g = guardar(juntada);
      const malha = new THREE.Mesh(g, mats[nome]);
      malha.receiveShadow = true;
      malha.castShadow = !defs[nome].emissivo && nome !== 'piso' && nome !== 'grama';
      if (defs[nome].tex === 'folha') {
        malha.castShadow = false;
        malha.userData.folha = true;
      }
      scene.add(malha);
    }
    if (contraste) return;
    const tarefas: Array<Promise<unknown>> = [];
    for (const [nome, a] of Object.entries(defs)) {
      if (!a.tex) continue;
      const mt = mats[nome];
      if (a.tex === 'folha') {
        tarefas.push(obter(alta ? 'copa' : 'copa5', true).then(t => {
          mt.map = t; mt.needsUpdate = true;
          scene.traverse(o => {
            const ms = o as THREE.Mesh;
            if (ms.userData.folha && ms.material === mt) { ms.customDepthMaterial = guardar(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.5 })); ms.castShadow = true; }
          });
        }));
        continue;
      }
      const n = a.tex;
      tarefas.push(obter(alta ? `${n}_c` : `${n}_c5`, true).then(t => { mt.map = t; mt.needsUpdate = true; }));
      tarefas.push(obter(alta && NORMAL_1K.has(n) ? `${n}_n` : `${n}_n5`, false).then(t => { mt.normalMap = t; mt.needsUpdate = true; }));
      if (alta) tarefas.push(obter(`${n}_r`, false).then(t => { mt.aoMap = t; mt.roughnessMap = t; mt.metalnessMap = t; mt.roughness = 1; mt.metalness = 1; mt.needsUpdate = true; }));
    }
    tarefas.push(obter('ambiente', true).then(t => {
      t.mapping = THREE.EquirectangularReflectionMapping;
      const pm = new THREE.PMREMGenerator(renderer);
      scene.environment = guardar(pm.fromEquirectangular(t).texture);
      pm.dispose();
      hemi.intensity *= 0.75;
    }));
    if (ceuMat) tarefas.push(obter(alta ? 'ceu' : 'ceu5', true).then(t => {
      t.wrapT = THREE.ClampToEdgeWrapping; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true;
      ceuMat!.uniforms.ceu.value = t; ceuMat!.uniforms.temCeu.value = 1;
    }));
    if (alta && !op.semPos) tarefas.push(criarPosAlta(renderer, scene, camera, mount.clientWidth, mount.clientHeight).then(c => { composer = c; ajustar(); }).catch(() => { composer = null; }));
    await Promise.all(tarefas.map(p => p.catch(e => console.warn('Acabamento do espaço não carregou', e))));
  };

  const render = () => { if (composer) composer.render(); else renderer.render(scene, camera); };
  const dispose = () => {
    scene.traverse(o => { const g = (o as THREE.Mesh).geometry; if (g) g.dispose(); });
    descartar.forEach(d => d.dispose());
    composer?.dispose?.();
    renderer.dispose(); renderer.forceContextLoss?.();
    if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
  };
  return { scene, camera, renderer, sol, hemi, guardar, acabamento, add, bloco, finalizar, render, ajustar, dispose };
}

/** Textura desenhada em canvas (cartazes, lousa, placas). */
export function texturaCanvas(w: number, h: number, desenhar: (g: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  const pintar = () => { const g = c.getContext('2d'); if (!g) return; g.clearRect(0, 0, w, h); desenhar(g); t.needsUpdate = true; };
  pintar();
  document.fonts?.ready.then(pintar).catch(() => undefined);
  return t;
}
