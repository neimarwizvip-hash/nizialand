import * as THREE from 'three';

// Peças comuns das cenas 3D do jogo (corredor dos Níveis 3 e 4, labirinto em primeira pessoa):
// patamares de qualidade, curva de tom PBR Neutral, variação de tom em grande escala e caixas com UV em metros.
// Padrão mínimo do projeto: Rota Piloto AEE v5 (Alta e Econômico; abaixo do Econômico nada é entregue).

export type Qualidade = 'alta' | 'economica';
export const CHAVE_QUALIDADE = 'nisialand.3d.qualidade';
export const TEX = '/assets/3d/tex/';

// Curva de tom "PBR Neutral" (Khronos), a mesma da Rota Piloto: preserva as cores reais.
export const TOM_NEUTRO = /* glsl */ `
vec3 tomNeutro( vec3 color ) {
  const float inicio = 0.8 - 0.04;
  const float dessat = 0.15;
  float x = min( color.r, min( color.g, color.b ) );
  float desloc = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= desloc;
  float pico = max( color.r, max( color.g, color.b ) );
  if ( pico < inicio ) return color;
  const float d = 1.0 - inicio;
  float novoPico = 1.0 - d * d / ( pico + d - inicio );
  color *= novoPico / pico;
  float g = 1.0 - 1.0 / ( dessat * ( pico - novoPico ) + 1.0 );
  return mix( color, vec3( novoPico ), g );
}`;
let tomInstalado = false;
export function instalarTom() {
  if (tomInstalado) return;
  tomInstalado = true;
  THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
    'vec3 CustomToneMapping( vec3 color ) { return color; }',
    TOM_NEUTRO + '\nvec3 CustomToneMapping( vec3 color ) { return tomNeutro( toneMappingExposure * color ); }',
  );
}

// Variação de tom em grande escala (esconde a repetição das fotos) a partir da posição no mundo.
export function prepararMacro(m: THREE.MeshStandardMaterial, forca: number) {
  m.onBeforeCompile = shader => {
    shader.uniforms.uMacro = { value: forca };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vPosMundo;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvPosMundo = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vPosMundo; uniform float uMacro;
        float hashM( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
        float ruidoM( vec2 p ) { vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f );
          return mix( mix( hashM( i ), hashM( i + vec2( 1, 0 ) ), f.x ), mix( hashM( i + vec2( 0, 1 ) ), hashM( i + vec2( 1, 1 ) ), f.x ), f.y ); }`)
      .replace('#include <map_fragment>', `#include <map_fragment>
        vec2 pm = vPosMundo.xz * 0.22 + vPosMundo.yy * 0.15;
        diffuseColor.rgb *= 1.0 + uMacro * ( ruidoM( pm ) * 0.7 + ruidoM( pm * 3.1 ) * 0.3 - 0.5 ) * 2.0;`);
  };
  m.customProgramCacheKey = () => `macro-${forca}`;
}

/** Patamar inicial: o que a pessoa escolheu antes; senão Econômico em toque, economia de dados ou pouca memória. */
export function qualidadeInicial(): Qualidade {
  try {
    const salva = localStorage.getItem(CHAVE_QUALIDADE);
    if (salva === 'alta' || salva === 'economica') return salva;
  } catch { /* sem armazenamento: escolha automática */ }
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  const toque = window.matchMedia?.('(pointer: coarse)').matches;
  const economia = !!nav.connection?.saveData;
  const poucaMemoria = !!nav.deviceMemory && nav.deviceMemory <= 4;
  return toque || economia || poucaMemoria ? 'economica' : 'alta';
}
export const guardarQualidade = (q: Qualidade) => { try { localStorage.setItem(CHAVE_QUALIDADE, q); } catch { /* vale só nesta visita */ } };
export const preferencia = (q: string) => { try { return window.matchMedia(q).matches; } catch { return false; } };

// Caixa com UV em metros projetada pela face (as texturas não esticam).
export function caixa(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, m = 1): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0));
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (ay > 0.5) uv.setXY(i, x / m, z / m);
    else if (ax > 0.5) uv.setXY(i, z / m, y / m);
    else uv.setXY(i, x / m, y / m);
  }
  return g;
}

/** Pós-processamento da Alta (baixado só quando usado): MSAA 4×, oclusão de ambiente GTAO, tom neutro e pontilhado. */
export type Composer = { render: () => void; setSize: (w: number, h: number) => void; setPixelRatio: (r: number) => void; dispose?: () => void };
export async function criarPosAlta(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, w: number, h: number): Promise<Composer> {
  const [{ EffectComposer }, { RenderPass }, { ShaderPass }, { GTAOPass }] = await Promise.all([
    import('three/examples/jsm/postprocessing/EffectComposer.js'),
    import('three/examples/jsm/postprocessing/RenderPass.js'),
    import('three/examples/jsm/postprocessing/ShaderPass.js'),
    import('three/examples/jsm/postprocessing/GTAOPass.js'),
  ]);
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
  return c as unknown as Composer;
}

/** Placa desenhada em canvas (ícone + palavra em inglês), com as fontes do kit. */
export function placaCanvas(icone: string, palavra: string, fundo: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 192;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  const desenhar = () => {
    const g = c.getContext('2d');
    if (!g) return;
    g.clearRect(0, 0, 512, 192);
    const r = 24;
    g.beginPath();
    g.moveTo(8 + r, 8); g.lineTo(504 - r, 8); g.quadraticCurveTo(504, 8, 504, 8 + r); g.lineTo(504, 184 - r);
    g.quadraticCurveTo(504, 184, 504 - r, 184); g.lineTo(8 + r, 184); g.quadraticCurveTo(8, 184, 8, 184 - r); g.lineTo(8, 8 + r); g.quadraticCurveTo(8, 8, 8 + r, 8);
    g.fillStyle = fundo; g.fill();
    g.lineWidth = 10; g.strokeStyle = '#FFD23F'; g.stroke();
    g.textBaseline = 'middle';
    g.font = '96px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
    g.textAlign = 'center';
    g.fillText(icone, 92, 100);
    g.fillStyle = '#FFFFFF';
    const tam = palavra.length > 8 ? 56 : 70;
    g.font = `${tam}px "Lilita One", "Fredoka", sans-serif`;
    g.fillText(palavra, 320, 102);
    t.needsUpdate = true;
  };
  desenhar();
  document.fonts?.ready.then(desenhar).catch(() => undefined);
  return t;
}
