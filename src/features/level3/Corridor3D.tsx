import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowLeft, DoorOpen, LayoutList, Lock } from 'lucide-react';
import { audioService } from '../../services/audio';
import { AVATAR_CATALOG, skinToneFilter, type SkinTone } from '../../components/ui/PlayerAvatar';

// Corredor 3D do Nível 3: mesmas técnicas do protótipo public/prototipos/nivel2-3d.html
// (PNGs oficiais como sprites virados para a câmera, instancing, materiais compartilhados,
// sem MSAA, DPR adaptativo, dt suavizado, joystick + WASD, arrastar para olhar).

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

const DOOR_GAP = 7;
const HALF_W = 3;
const NEAR = 2.4;
const SPEED = 4.2;
const ZE_LINES = ['Essa porta aí você não abre!', 'Hehe, aposto que você erra a próxima!', 'Corre não... a sala não foge!', 'Eu sei a resposta e não conto!'];

const doorZ = (i: number) => -4 - i * DOOR_GAP;
const doorSide = (i: number) => (i % 2 === 0 ? -1 : 1);

function labelTexture(lines: string[], color: string) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 160;
  const g = c.getContext('2d');
  if (g) {
    g.fillStyle = color; g.fillRect(0, 0, 512, 160);
    g.fillStyle = '#ffffff'; g.textAlign = 'center';
    g.font = 'bold 56px sans-serif'; g.fillText(lines[0], 256, 66);
    g.font = 'bold 36px sans-serif'; g.fillText(lines[1] ?? '', 256, 128);
  }
  const t = new THREE.CanvasTexture(c);
  return t;
}

const Corridor3D: React.FC<Corridor3DProps> = ({ doors, paused, startAt, avatarId, avatarSkinTone, level = 3, heading = 'SALAS DE AULA', simpleLabel = 'Modo simples', zeLine, onEnter, onExit, onSimpleMode }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const zeRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState<CorridorDoor | null>(null);
  const [failed, setFailed] = useState(false);
  const [zeText, setZeText] = useState(ZE_LINES[0]);

  // Valores que o laço lê sem recriar a cena.
  const pausedRef = useRef(paused);
  const doorsRef = useRef(doors);
  const nearRef = useRef<CorridorDoor | null>(null);
  const onEnterRef = useRef(onEnter);
  const resumeRef = useRef<() => void>(() => {});
  const doorMatsRef = useRef<THREE.MeshLambertMaterial[]>([]);
  const labelRef = useRef<THREE.Sprite[]>([]);
  onEnterRef.current = onEnter;
  doorsRef.current = doors;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    } catch {
      setFailed(true);
      return;
    }
    const maxDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let dpr = maxDpr;
    renderer.setPixelRatio(dpr);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#bfe3ff');
    const length = doors.length * DOOR_GAP + 10;
    scene.fog = new THREE.Fog('#bfe3ff', 12, length);
    const camera = new THREE.PerspectiveCamera(62, mount.clientWidth / mount.clientHeight, 0.1, 120);
    scene.add(new THREE.HemisphereLight('#ffffff', '#8a7a66', 1.0));
    const sun = new THREE.DirectionalLight('#ffffff', 0.5);
    sun.position.set(2, 6, 3);
    scene.add(sun);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(o: T) => { disposables.push(o); return o; };
    const loader = new THREE.TextureLoader();
    const tex = (src: string) => { const t = track(loader.load(src)); t.encoding = THREE.sRGBEncoding; return t; };

    // Piso, teto e paredes (materiais compartilhados).
    const plane = track(new THREE.PlaneGeometry(1, 1));
    const floorMat = track(new THREE.MeshLambertMaterial({ color: level === 4 ? '#c8d5c8' : '#d9c7a3' }));
    const wallMat = track(new THREE.MeshLambertMaterial({ color: level === 4 ? '#e8f1e8' : '#f4efe4' }));
    const ceilMat = track(new THREE.MeshLambertMaterial({ color: '#ffffff' }));
    const midZ = -length / 2 + 4;
    const floor = new THREE.Mesh(plane, floorMat);
    floor.rotation.x = -Math.PI / 2; floor.scale.set(HALF_W * 2, length, 1); floor.position.set(0, 0, midZ);
    const ceil = new THREE.Mesh(plane, ceilMat);
    ceil.rotation.x = Math.PI / 2; ceil.scale.set(HALF_W * 2, length, 1); ceil.position.set(0, 3.4, midZ);
    scene.add(floor, ceil);
    for (const side of [-1, 1]) {
      const w = new THREE.Mesh(plane, wallMat);
      w.rotation.y = side * -Math.PI / 2; w.scale.set(length, 3.4, 1); w.position.set(side * HALF_W, 1.7, midZ);
      scene.add(w);
    }
    const end = new THREE.Mesh(plane, wallMat);
    end.scale.set(HALF_W * 2, 3.4, 1); end.position.set(0, 1.7, -length + 4);
    scene.add(end);

    // Faixa azul da escola, armários e luminárias: um InstancedMesh para cada.
    const box = track(new THREE.BoxGeometry(1, 1, 1));
    const stripeMat = track(new THREE.MeshLambertMaterial({ color: level === 4 ? '#16a34a' : '#2563eb' }));
    const stripes = new THREE.InstancedMesh(box, stripeMat, 2);
    const m = new THREE.Matrix4();
    [-1, 1].forEach((s, i) => { m.compose(new THREE.Vector3(s * (HALF_W - 0.02), 0.5, midZ), new THREE.Quaternion(), new THREE.Vector3(0.04, 0.12, length)); stripes.setMatrixAt(i, m); });
    scene.add(stripes);
    const lockerSpots: THREE.Vector3[] = [];
    doors.forEach((_, i) => {
      const s = -doorSide(i);
      for (let k = -1; k <= 1; k++) lockerSpots.push(new THREE.Vector3(s * (HALF_W - 0.25), 0.9, doorZ(i) + k * 0.75));
    });
    const lockerMat = track(new THREE.MeshLambertMaterial({ color: level === 4 ? '#5b8c6f' : '#f59e0b' }));
    const lockers = new THREE.InstancedMesh(box, lockerMat, lockerSpots.length);
    lockerSpots.forEach((p, i) => { m.compose(p, new THREE.Quaternion(), new THREE.Vector3(0.45, 1.8, 0.7)); lockers.setMatrixAt(i, m); });
    scene.add(lockers);
    const lampMat = track(new THREE.MeshBasicMaterial({ color: '#fffbe6' }));
    const lampCount = Math.ceil(length / 4);
    const lamps = new THREE.InstancedMesh(box, lampMat, lampCount);
    for (let i = 0; i < lampCount; i++) { m.compose(new THREE.Vector3(0, 3.38, 2 - i * 4), new THREE.Quaternion(), new THREE.Vector3(1.4, 0.04, 0.3)); lamps.setMatrixAt(i, m); }
    scene.add(lamps);

    // Portas: cor por estado; a disponível pulsa.
    const doorGeo = track(new THREE.BoxGeometry(0.12, 2.3, 1.3));
    const frameMat = track(new THREE.MeshLambertMaterial({ color: '#1e3a8a' }));
    const frameGeo = track(new THREE.BoxGeometry(0.08, 2.5, 1.55));
    doorMatsRef.current = [];
    labelRef.current = [];
    doors.forEach((d, i) => {
      const s = doorSide(i);
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.set(s * (HALF_W - 0.02), 1.25, doorZ(i));
      const mat = track(new THREE.MeshLambertMaterial({ color: '#94a3b8' }));
      doorMatsRef.current.push(mat);
      const door = new THREE.Mesh(doorGeo, mat);
      door.position.set(s * (HALF_W - 0.08), 1.15, doorZ(i));
      const lmat = track(new THREE.SpriteMaterial({ map: track(labelTexture([d.label, d.name], '#1e3a8a')), depthWrite: false }));
      const label = new THREE.Sprite(lmat);
      label.scale.set(1.6, 0.5, 1);
      label.position.set(s * (HALF_W - 0.5), 2.75, doorZ(i));
      labelRef.current.push(label);
      scene.add(frame, door, label);
    });

    // Usa o avatar escolhido pelo aluno, inclusive os recortes dos painéis de avatares.
    const chosen = AVATAR_CATALOG.find(a => a.id === avatarId || a.src === avatarId);
    let avatarTexture: THREE.Texture;
    let imageActive = true;
    if (chosen?.type === 'sprite-board' || chosen?.type === 'sprite-inc') {
      const board = chosen.type === 'sprite-board';
      const canvasAvatar = document.createElement('canvas');
      canvasAvatar.width = 256; canvasAvatar.height = 384;
      const ctx = canvasAvatar.getContext('2d');
      avatarTexture = track(new THREE.CanvasTexture(canvasAvatar));
      avatarTexture.encoding = THREE.sRGBEncoding;
      const img = new Image();
      img.onload = () => {
        if (!imageActive || !ctx) return;
        const w = img.width / (board ? 8.2 : 4.2);
        const h = img.height / 2.1;
        const x = (img.width - w) * ((chosen.col ?? 0) / (board ? 7 : 3));
        const y = (img.height - h) * ((chosen.row ?? 0) === 0 ? (board ? 0.08 : 0.10) : (board ? 0.92 : 0.90));
        ctx.clearRect(0, 0, 256, 384);
        if (chosen.allowsSkinTone && avatarSkinTone) ctx.filter = skinToneFilter[avatarSkinTone];
        ctx.drawImage(img, x, y, w, h, 0, 0, 256, 384);
        ctx.filter = 'none';
        avatarTexture.needsUpdate = true;
      };
      img.src = board ? '/assets/nisialand_16_avatars_board.jpg' : '/assets/nisialand_inclusive_students.png';
    } else {
      avatarTexture = tex(chosen?.src || '/assets/student_boy_hoodie.png');
    }
    const avatarMat = track(new THREE.SpriteMaterial({ map: avatarTexture, transparent: true }));
    const avatar = new THREE.Sprite(avatarMat);
    avatar.scale.set(0.9, 1.6, 1);
    avatar.center.set(0.5, 0);
    scene.add(avatar);
    const zeMat = track(new THREE.SpriteMaterial({ map: tex('/assets/ze_cartinha.png'), transparent: true }));
    const ze = new THREE.Sprite(zeMat);
    ze.scale.set(1, 1.5, 1);
    ze.center.set(0.5, 0);
    scene.add(ze);

    // Estado do jogador.
    const startIdx = Math.max(0, doors.findIndex(d => d.id === startAt));
    const pos = new THREE.Vector3(0, 0, startAt ? doorZ(startIdx) + 1.2 : 2);
    let yaw = 0;
    const keys = new Set<string>();
    const stick = { x: 0, y: 0 };
    let zeT = 0;
    let zeLineAt = 0;
    let lineIdx = 0;

    const onKey = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase();
      if (down && (k === 'enter' || k === 'e') && nearRef.current && nearRef.current.state !== 'locked' && !pausedRef.current) {
        onEnterRef.current(nearRef.current.id);
        return;
      }
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        e.preventDefault();
        if (down) keys.add(k); else keys.delete(k);
      }
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    // Arrastar na tela gira a câmera.
    const canvas = renderer.domElement;
    let dragId: number | null = null;
    let dragX = 0;
    const pd = (e: PointerEvent) => { dragId = e.pointerId; dragX = e.clientX; canvas.setPointerCapture(e.pointerId); };
    const pm = (e: PointerEvent) => { if (e.pointerId !== dragId) return; yaw -= (e.clientX - dragX) * 0.006; dragX = e.clientX; };
    const pu = (e: PointerEvent) => { if (e.pointerId === dragId) dragId = null; };
    canvas.addEventListener('pointerdown', pd);
    canvas.addEventListener('pointermove', pm);
    canvas.addEventListener('pointerup', pu);
    canvas.addEventListener('pointercancel', pu);

    // Joystick.
    const base = stickRef.current;
    const knob = knobRef.current;
    let stickId: number | null = null;
    const moveStick = (e: PointerEvent) => {
      if (!base || !knob) return;
      const r = base.getBoundingClientRect();
      let dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      let dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const len = Math.hypot(dx, dy);
      if (len > 1) { dx /= len; dy /= len; }
      stick.x = dx; stick.y = dy;
      knob.style.transform = `translate(${dx * 32}px, ${dy * 32}px)`;
    };
    const sd = (e: PointerEvent) => { stickId = e.pointerId; base?.setPointerCapture(e.pointerId); moveStick(e); };
    const sm = (e: PointerEvent) => { if (e.pointerId === stickId) moveStick(e); };
    const su = (e: PointerEvent) => {
      if (e.pointerId !== stickId) return;
      stickId = null; stick.x = 0; stick.y = 0;
      if (knob) knob.style.transform = '';
    };
    base?.addEventListener('pointerdown', sd);
    base?.addEventListener('pointermove', sm);
    base?.addEventListener('pointerup', su);
    base?.addEventListener('pointercancel', su);

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    const fwd = new THREE.Vector3();
    const right = new THREE.Vector3();
    const look = new THREE.Vector3();
    const screen = new THREE.Vector3();
    let raf = 0;
    let last = performance.now();
    let smooth = 1 / 60;
    let frames = 0;
    let fpsAt = last;
    let elapsed = 0;

    const frame = (now: number) => {
      raf = 0;
      if (pausedRef.current) return;
      const raw = Math.min(0.05, (now - last) / 1000);
      last = now;
      smooth = smooth * 0.8 + raw * 0.2;
      const dt = smooth;
      elapsed += dt;

      // Movimento relativo à câmera.
      fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw));
      right.set(-fwd.z, 0, fwd.x);
      let mx = stick.x, my = -stick.y;
      if (keys.has('w') || keys.has('arrowup')) my += 1;
      if (keys.has('s') || keys.has('arrowdown')) my -= 1;
      if (keys.has('d')) mx += 1;
      if (keys.has('a')) mx -= 1;
      if (keys.has('arrowleft')) yaw += 1.8 * dt;
      if (keys.has('arrowright')) yaw -= 1.8 * dt;
      const ml = Math.hypot(mx, my);
      if (ml > 0.05) {
        const k = Math.min(1, ml) * SPEED * dt / ml;
        pos.addScaledVector(fwd, my * k).addScaledVector(right, mx * k);
        pos.x = Math.max(-HALF_W + 0.5, Math.min(HALF_W - 0.5, pos.x));
        pos.z = Math.max(-length + 5, Math.min(3, pos.z));
      }
      avatar.position.copy(pos);

      camera.position.set(pos.x - fwd.x * 3.2, 2.0, pos.z - fwd.z * 3.2);
      camera.position.x = Math.max(-HALF_W + 0.3, Math.min(HALF_W - 0.3, camera.position.x));
      look.set(pos.x + fwd.x * 2, 1.2, pos.z + fwd.z * 2);
      camera.lookAt(look);

      // Portas: brilho na disponível, verde na concluída.
      const ds = doorsRef.current;
      let closest: CorridorDoor | null = null;
      ds.forEach((d, i) => {
        const mat = doorMatsRef.current[i];
        if (mat) {
          if (d.state === 'locked') { mat.color.set('#94a3b8'); mat.emissive.set('#000000'); }
          else if (d.state === 'done') { mat.color.set('#16a34a'); mat.emissive.set('#052e16'); }
          else { mat.color.set('#f59e0b'); mat.emissive.setRGB(0.5 + 0.4 * Math.sin(elapsed * 4), 0.3, 0); }
        }
        // Só a distância ao longo do corredor: andar pelo meio já mostra o ENTRAR.
        if (Math.abs(doorZ(i) - pos.z) < NEAR / 2) closest = d;
      });
      if (closest !== nearRef.current) { nearRef.current = closest; setNear(closest); }

      // Zé passeia pelo corredor com o balão.
      zeT += dt * 0.25;
      const zeZ = -length / 2 + 4 + Math.sin(zeT) * (length / 2 - 6);
      ze.position.set(Math.sin(zeT * 2.3) * 1.4, 0, zeZ);
      if (elapsed - zeLineAt > 5) { zeLineAt = elapsed; lineIdx = (lineIdx + 1) % ZE_LINES.length; setZeText(ZE_LINES[lineIdx]); }
      const balloon = zeRef.current;
      if (balloon) {
        screen.set(ze.position.x, 1.75, ze.position.z).project(camera);
        const visible = screen.z < 1 && Math.abs(screen.x) < 1.1 && Math.abs(screen.y) < 1.1 && ze.position.distanceTo(pos) < 14;
        balloon.style.display = visible ? 'block' : 'none';
        if (visible) balloon.style.transform = `translate(${(screen.x + 1) / 2 * mount.clientWidth}px, ${(1 - screen.y) / 2 * mount.clientHeight}px) translate(-50%, -100%)`;
      }

      renderer.render(scene, camera);

      // DPR adaptativo: mede 1 s de quadros e ajusta a resolução.
      frames++;
      if (now - fpsAt >= 1000) {
        const fps = frames * 1000 / (now - fpsAt);
        (window as unknown as { __nisiaFps?: number }).__nisiaFps = Math.round(fps);
        if (fps < 45 && dpr > 0.75) { dpr = Math.max(0.75, dpr - 0.25); renderer.setPixelRatio(dpr); }
        else if (fps > 58 && dpr < maxDpr) { dpr = Math.min(maxDpr, dpr + 0.25); renderer.setPixelRatio(dpr); }
        frames = 0; fpsAt = now;
      }
      raf = requestAnimationFrame(frame);
    };
    resumeRef.current = () => {
      if (raf || pausedRef.current) return;
      // Um link direto para uma sala monta a cena oculta; ao voltar, mede o canvas visível.
      onResize();
      last = performance.now(); fpsAt = last; frames = 0;
      keys.clear(); stick.x = 0; stick.y = 0;
      raf = requestAnimationFrame(frame);
    };
    resumeRef.current();

    return () => {
      imageActive = false;
      cancelAnimationFrame(raf);
      resumeRef.current = () => {};
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', pd);
      canvas.removeEventListener('pointermove', pm);
      canvas.removeEventListener('pointerup', pu);
      canvas.removeEventListener('pointercancel', pu);
      base?.removeEventListener('pointerdown', sd);
      base?.removeEventListener('pointermove', sm);
      base?.removeEventListener('pointerup', su);
      base?.removeEventListener('pointercancel', su);
      stripes.dispose(); lockers.dispose(); lamps.dispose();
      disposables.forEach(d => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
    // A cena é montada uma vez; portas mudam de cor pelo doorsRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pausa o laço enquanto a sala está aberta e retoma ao voltar.
  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) resumeRef.current();
  }, [paused]);

  if (failed) {
    return (
      <div className="fixed inset-0 game-sky flex flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="font-heading font-black text-blue-900">Este aparelho não abriu o corredor 3D.</p>
        <button type="button" onClick={onSimpleMode} className="px-6 py-3 rounded-full bg-amber-400 border-2 border-amber-600 font-heading font-black uppercase text-sm">Usar modo simples</button>
      </div>
    );
  }

  const enterNear = () => { if (near && near.state !== 'locked') { audioService.playClick(); onEnter(near.id); } };

  return (
    <div className="fixed inset-0 overflow-hidden select-none touch-none">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2 pointer-events-none">
        <div className="px-3 py-1 rounded-xl bg-white/85 border-2 border-sky-300">
          <p className="text-[10px] font-black tracking-widest text-emerald-700">NISIALAND · NÍVEL {level}</p>
          <p className="font-bungee text-lg short:text-base text-blue-900 leading-none">{heading}</p>
        </div>
        <div className="flex gap-2 pointer-events-auto">
          <button type="button" onClick={onSimpleMode} className="px-3 py-2 short:py-1 rounded-xl bg-white border-2 border-sky-300 font-black text-sm flex items-center gap-2">
            <LayoutList className="w-4 h-4" /> {simpleLabel}
          </button>
          <button type="button" onClick={onExit} className="px-3 py-2 short:py-1 rounded-xl bg-white border-2 border-sky-300 font-black text-sm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Mapa
          </button>
        </div>
      </div>

      <div ref={zeRef} className="absolute left-0 top-0 pointer-events-none max-w-[220px] px-3 py-2 rounded-2xl bg-white border-2 border-pink-400 text-xs font-black text-pink-700 shadow" style={{ display: 'none' }}>
        {zeLine ?? zeText}
      </div>

      <div ref={stickRef} aria-label="Controle de movimento" className="absolute left-4 bottom-4 short:left-3 short:bottom-3 w-28 h-28 short:w-24 short:h-24 rounded-full bg-white/40 border-2 border-white/80 flex items-center justify-center touch-none">
        <div ref={knobRef} className="w-12 h-12 rounded-full bg-white/90 border-2 border-sky-400 pointer-events-none" />
      </div>

      {near && (
        <div className="absolute right-4 bottom-4 short:right-3 short:bottom-3 flex flex-col items-end gap-1">
          <p className="px-3 py-1 rounded-xl bg-white/90 text-xs font-black text-blue-900">{near.label} · {near.name}</p>
          {near.state === 'locked' ? (
            <span className="px-5 py-3 short:py-2 rounded-full bg-slate-300 border-2 border-slate-500 font-heading font-black uppercase text-sm flex items-center gap-2"><Lock className="w-4 h-4" /> Trancada</span>
          ) : (
            <button type="button" onClick={enterNear} className="px-7 py-3 short:py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 border-2 border-amber-600 shadow-[0_5px_0_0_#b45309] font-heading font-black uppercase text-base flex items-center gap-2 active:translate-y-1">
              <DoorOpen className="w-5 h-5" /> Entrar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Corridor3D;
