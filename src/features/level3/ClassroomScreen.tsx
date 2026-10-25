import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Box, Check, LayoutList, Lock, School, Trophy } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { LEVEL3 } from '../../content/level3';
import { LEVEL3_CONTENT } from '../../data/level3Content';
import { getMissionProgress } from '../../engines/progression/progress';
import { unlockForVistoria } from '../../services/vistoria';
import { audioService } from '../../services/audio';
import { triggerConfetti } from '../../components/ui/ConfettiEffect';
import { ProvisionalStoryGate } from '../../components/story/ProvisionalStoryGate';
import { LEVEL3_ACTIVITY_VIEWS, LEVEL3_ROOM_ORDER } from './Level3Activities';
import { level3MissionMaxScore, ZE_ROOM_SIZES } from './level3Rules';
import type { CorridorDoor } from './Corridor3D';

// O corredor 3D (three.js) só é baixado quando o aluno entra no modo 3D.
const Corridor3D = lazy(() => import('./Corridor3D'));

export const LEVEL3_MODE_KEY = 'nisialand_nivel3_modo';
export type Level3Mode = '3d' | 'simples';

export function readLevel3Mode(): Level3Mode {
  try { return localStorage.getItem(LEVEL3_MODE_KEY) === 'simples' ? 'simples' : '3d'; } catch { return '3d'; }
}
function saveLevel3Mode(mode: Level3Mode) {
  try { localStorage.setItem(LEVEL3_MODE_KEY, mode); } catch { /* aparelho sem armazenamento: vale só nesta visita */ }
}

const ROOM_LABEL = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5', 'Revisão'];

export const ClassroomScreen: React.FC = () => {
  const { currentPlayer, activityResults, vistoria } = useGame();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const grade = getPlayerGrade(currentPlayer) ?? '8';
  const content = LEVEL3_CONTENT[grade];
  const progress = useMemo(() => unlockForVistoria(getMissionProgress(LEVEL3, activityResults, true), vistoria), [activityResults, vistoria]);
  const [mode, setMode] = useState<Level3Mode>(readLevel3Mode);
  const [runKey, setRunKey] = useState(0);
  const lastDoor = useRef<string | null>(null);

  const requested = params.get('atividade');
  const selected = LEVEL3.mission.activities.find(a => a.id === requested) ?? null;
  const entry = progress.activities.find(a => a.activity.id === selected?.id);
  const open = !!selected && !!entry && entry.state !== 'locked';

  // Só limpa o endereço quando a sala pedida não existe ou está trancada.
  // Salvar o resultado muda o estado da sala para "concluída" e não pode fechar o painel final.
  useEffect(() => {
    if (requested && !open) setParams({}, { replace: true });
  }, [requested, open, setParams]);

  const enter = useCallback((id: string) => {
    lastDoor.current = id;
    setRunKey(k => k + 1);
    setParams({ atividade: id });
  }, [setParams]);
  const exitRoom = useCallback(() => setParams({}), [setParams]);

  const switchMode = (next: Level3Mode) => { audioService.playClick(); setMode(next); saveLevel3Mode(next); };

  const doors = useMemo<CorridorDoor[]>(() => LEVEL3_ROOM_ORDER.map((id, i) => {
    const e = progress.activities.find(a => a.activity.id === id);
    return { id, label: ROOM_LABEL[i], name: e?.activity.name ?? id, state: e?.state === 'locked' ? 'locked' : e?.result ? 'done' : 'open' };
  }), [progress]);

  const total = progress.activities.reduce((s, a) => s + (a.result?.score ?? 0), 0);
  const maxTotal = useMemo(() => level3MissionMaxScore(grade), [grade]);
  const doneCount = doors.filter(d => d.state === 'done').length;
  const zeSize = ZE_ROOM_SIZES[Math.min(doneCount, ZE_ROOM_SIZES.length - 1)];

  // Festa uma vez, quando a última sala termina e o aluno volta para o corredor.
  const celebrated = useRef(progress.isCompleted);
  useEffect(() => {
    if (!progress.isCompleted || open || celebrated.current) return;
    celebrated.current = true;
    audioService.playVictory();
    triggerConfetti(90);
  }, [progress.isCompleted, open]);

  const View = open && selected ? LEVEL3_ACTIVITY_VIEWS[selected.id] : null;
  const roomView = View && selected ? (
    <View key={`${selected.id}-${runKey}`} grade={grade} onExit={exitRoom} onReplay={() => setRunKey(k => k + 1)} />
  ) : null;

  const celebration = progress.isCompleted ? (
    <div role="status" aria-live="polite" className="game-panel p-4 short:p-2 mb-4 short:mb-2 flex items-center gap-4 short:gap-2 border-amber-400">
      <Trophy className="w-12 h-12 short:w-8 short:h-8 text-amber-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-heading font-black text-lg short:text-base text-blue-900">Nível 3 concluído! Você arrumou todas as salas.</p>
        <p className="font-heading font-black text-2xl short:text-lg text-blue-700">{total} <span className="text-sm text-slate-500">/ {maxTotal} pts</span></p>
      </div>
      <img src="/assets/ze_cartinha.png" alt="Zé" className={`${zeSize} object-contain`} onError={e => { e.currentTarget.style.display = 'none'; }} />
    </div>
  ) : null;

  const modeButton = (
    <button
      type="button"
      onClick={() => switchMode(mode === '3d' ? 'simples' : '3d')}
      className="px-3 py-2 short:py-1 rounded-xl bg-white border-2 border-sky-300 font-black text-sm flex items-center gap-2"
    >
      {mode === '3d' ? <><LayoutList className="w-4 h-4" /> Modo simples</> : <><Box className="w-4 h-4" /> Corredor 3D</>}
    </button>
  );

  if (mode === '3d') {
    return (
      <ProvisionalStoryGate story="nivel3" bypass={!!requested}>
      <>
        {/* O corredor continua montado (pausado) enquanto a sala está aberta: ao sair, o aluno volta na porta. */}
        <div className={open ? 'hidden' : 'fixed inset-0'}>
          <Suspense fallback={<div className="fixed inset-0 game-sky flex items-center justify-center font-heading font-black text-blue-900">Abrindo o corredor…</div>}>
            <Corridor3D
              doors={doors}
              paused={open}
              startAt={lastDoor.current}
              avatarId={currentPlayer?.avatar}
              avatarSkinTone={currentPlayer?.skinTone}
              zeLine={progress.isCompleted ? `Você fez ${total} pontos... eu vou te alcançar!` : undefined}
              onEnter={enter}
              onExit={() => navigate('/mapa')}
              onSimpleMode={() => switchMode('simples')}
            />
          </Suspense>
        </div>
        {progress.isCompleted && !open && (
          <div className="fixed z-30 top-16 sm:top-20 left-1/2 -translate-x-1/2 w-[min(92vw,520px)] pointer-events-none">
            {celebration}
          </div>
        )}
        {roomView && <div className="fixed inset-0 z-40 overflow-y-auto">{roomView}</div>}
      </>
      </ProvisionalStoryGate>
    );
  }

  if (roomView) return <ProvisionalStoryGate story="nivel3" bypass>{roomView}</ProvisionalStoryGate>;

  return (
    <ProvisionalStoryGate story="nivel3" bypass={!!requested}>
    <div className="min-h-screen game-sky p-4 sm:p-8 short:p-2">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between gap-2 mb-6 short:mb-2">
          <div className="min-w-0">
            <p className="text-xs font-black tracking-widest text-emerald-700">NISIALAND · NÍVEL 3</p>
            <h1 className="font-bungee text-3xl sm:text-5xl short:text-2xl text-blue-900">SALAS DE AULA</h1>
            <p className="font-bold text-slate-600 short:text-xs">Convivência em sala · {grade}º ano</p>
            <p className="text-sm short:text-xs text-slate-500">{content.curriculum.theme} · {content.curriculum.progression}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {modeButton}
            <button type="button" onClick={() => navigate('/mapa')} className="px-4 py-2 short:py-1 rounded-xl bg-white border-2 border-sky-300 font-black flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Mapa
            </button>
          </div>
        </header>
        {celebration}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 short:grid-cols-3 gap-4 short:gap-2">
          {progress.activities.map(({ activity, state, result }, i) => {
            const locked = state === 'locked';
            return (
              <button
                key={activity.id}
                type="button"
                disabled={locked}
                onClick={() => enter(activity.id)}
                className={`game-panel p-5 short:p-2 text-left transition-transform ${locked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-1'}`}
              >
                <div className="flex items-center justify-between">
                  <School className="w-8 h-8 short:w-5 short:h-5 text-blue-700" />
                  {locked ? <Lock className="w-5 h-5 text-slate-500" /> : result ? <Check className="w-5 h-5 text-emerald-600" /> : null}
                </div>
                <p className="text-xs font-black tracking-widest text-slate-500 mt-2 short:mt-1">{ROOM_LABEL[i] ?? `Sala ${i + 1}`}</p>
                <h2 className="font-heading font-black text-xl short:text-sm text-slate-800">{activity.name}</h2>
                <p className="text-sm short:hidden text-slate-600 mt-1">{activity.hint ?? activity.phrase}</p>
                <p className={`mt-3 short:mt-1 text-xs font-black tracking-widest ${locked ? 'text-slate-500' : result ? 'text-emerald-700' : 'text-blue-700'}`}>
                  {locked ? 'BLOQUEADA' : result ? `CONCLUÍDA · ${result.score} pts` : 'ABRIR SALA'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
    </ProvisionalStoryGate>
  );
};

export default ClassroomScreen;
