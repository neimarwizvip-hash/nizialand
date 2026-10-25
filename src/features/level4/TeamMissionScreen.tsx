import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Box, Check, Lock, MapPinned, Trophy, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { LEVEL4 } from '../../content/level4';
import { LEVEL4_CONTENT } from '../../data/level4Content';
import { getMissionProgress } from '../../engines/progression/progress';
import { unlockForVistoria } from '../../services/vistoria';
import { PlayerAvatar } from '../../components/ui/PlayerAvatar';
import { TeamTroublemakers } from '../../features/level4/TeamTroublemakers';
import { Level4Activities } from '../../features/level4/Level4Activities';
import type { CorridorDoor } from '../level3/Corridor3D';

const SchoolCorridor3D = lazy(() => import('../level3/Corridor3D'));
const LEVEL4_MODE_KEY = 'nisialand_nivel4_modo';
function readMode(): '3d' | 'simples' {
  try { return localStorage.getItem(LEVEL4_MODE_KEY) === 'simples' ? 'simples' : '3d'; } catch { return '3d'; }
}

const PLACES = ['Biblioteca', 'Corredor', 'Sala de grupo', 'Mural', 'Quadra', 'Revisão'] as const;

export const TeamMissionScreen: React.FC = () => {
  const { currentPlayer, activityResults, saveActivityResult, vistoria } = useGame();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState<'3d' | 'simples'>(readMode);
  const lastDoor = useRef<string | null>(null);
  const grade = getPlayerGrade(currentPlayer) ?? '8';
  const progress = useMemo(() => unlockForVistoria(getMissionProgress(LEVEL4, activityResults, true), vistoria), [activityResults, vistoria]);
  const requested = params.get('atividade');
  const selected = LEVEL4.mission.activities.find(a => a.id === requested) ?? null;
  const entry = progress.activities.find(a => a.activity.id === selected?.id);
  const open = !!selected && !!entry && entry.state !== 'locked';
  useEffect(() => {
    if (requested && !open) setParams({}, { replace: true });
  }, [requested, open, setParams]);

  const total = progress.activities.reduce((sum, item) => sum + (item.result?.score ?? 0), 0);
  const doors: CorridorDoor[] = progress.activities.map(({ activity, state, result }, index) => ({
    id: activity.id, label: PLACES[index], name: activity.name,
    state: state === 'locked' ? 'locked' : result ? 'done' : 'open',
  }));
  const switchMode = (next: '3d' | 'simples') => {
    setMode(next);
    try { localStorage.setItem(LEVEL4_MODE_KEY, next); } catch { /* mantém o modo nesta visita */ }
  };
  const enter = (id: string) => { lastDoor.current = id; setParams({ atividade: id }); };
  const activityView = open && selected ? <Level4Activities key={selected.id} activity={selected} grade={grade} onExit={() => setParams({})} onSave={saveActivityResult} /> : null;

  if (mode === '3d') return <>
    <div className={open ? 'hidden' : 'fixed inset-0'}>
      <Suspense fallback={<div className="fixed inset-0 game-sky flex items-center justify-center font-black text-blue-900">Abrindo a escola…</div>}>
        <SchoolCorridor3D doors={doors} paused={open} startAt={lastDoor.current} avatarId={currentPlayer?.avatar} avatarSkinTone={currentPlayer?.skinTone} level={4} heading="MISSÃO PELA ESCOLA" simpleLabel="Mapa simples" onEnter={enter} onExit={() => navigate('/mapa')} onSimpleMode={() => switchMode('simples')} />
      </Suspense>
    </div>
    {progress.isCompleted && !open && <div role="status" className="fixed z-30 top-16 left-1/2 -translate-x-1/2 w-[min(92vw,520px)] game-panel p-3 border-amber-400 font-black text-blue-900">Nível 4 concluído! Equipe reunida · {total} pontos.</div>}
    {activityView && <div className="fixed inset-0 z-40 overflow-y-auto">{activityView}</div>}
  </>;

  if (activityView) return activityView;

  return (
    <main className="min-h-screen game-sky p-3 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-black tracking-widest text-orange-700">NISIALAND · NÍVEL 4</p>
            <h1 className="font-bungee text-3xl sm:text-5xl text-blue-900">TRABALHO EM EQUIPE</h1>
            <p className="font-bold text-slate-600">Missão pela escola · {grade}º ano</p>
            <p className="text-sm text-slate-500 mt-1">{LEVEL4_CONTENT[grade].curriculum.theme} · {LEVEL4_CONTENT[grade].curriculum.progression}</p>
          </div>
          <div className="flex gap-2"><button type="button" onClick={() => switchMode('3d')} className="px-4 py-2 rounded-xl bg-white border-2 border-sky-300 font-black inline-flex items-center gap-2"><Box size={18} /> Escola 3D</button><button type="button" onClick={() => navigate('/mapa')} className="px-4 py-2 rounded-xl bg-white border-2 border-sky-300 font-black inline-flex items-center gap-2"><ArrowLeft size={18} /> Mapa geral</button></div>
        </header>
        {progress.isCompleted && <div role="status" className="game-panel p-4 mb-4 border-amber-400 flex items-center gap-3"><Trophy className="text-amber-500" size={34} /><p className="font-heading font-black text-blue-900">Nível 4 concluído! Equipe reunida · {total} pontos.</p></div>}
        <TeamTroublemakers />
        <section aria-label="Mapa da escola" className="game-panel p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4"><MapPinned className="text-blue-800" /><h2 className="font-bungee text-xl sm:text-2xl text-blue-900">MAPA DA MISSÃO</h2><span className="ml-auto text-sm font-black text-blue-700">{progress.completedCount}/6</span></div>
          <div className="relative rounded-3xl border-4 border-sky-200 bg-gradient-to-br from-sky-100 via-amber-50 to-emerald-100 p-4 sm:p-8">
            <div className="absolute inset-x-6 top-1/2 border-t-4 border-dashed border-sky-300 pointer-events-none" />
            <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
              {progress.activities.map(({ activity, state, result }, index) => (
                <button type="button" key={activity.id} disabled={state === 'locked'} onClick={() => setParams({ atividade: activity.id })} className={`text-left rounded-2xl border-2 p-3 sm:p-5 shadow-md min-h-36 transition-transform focus-visible:outline-4 focus-visible:outline-orange-500 ${state === 'locked' ? 'bg-slate-100 border-slate-300 opacity-65' : result ? 'bg-emerald-50 border-emerald-500 hover:-translate-y-1' : 'bg-white border-orange-400 hover:-translate-y-1'}`}>
                  <span className="flex items-center justify-between"><span className="text-xs uppercase tracking-wide font-black text-slate-500">{PLACES[index]}</span>{state === 'locked' ? <Lock size={18} /> : result ? <Check size={18} className="text-emerald-600" /> : <Users size={18} className="text-orange-600" />}</span>
                  <strong className="block font-bungee text-lg text-blue-900 mt-3">{activity.name}</strong>
                  <span className="block text-sm text-slate-600 mt-1">{activity.phrase}</span>
                  <span className="block text-xs font-black mt-3 text-blue-700">{state === 'locked' ? 'BLOQUEADA' : result ? `CONCLUÍDA · ${result.score} PTS` : 'INICIAR MISSÃO'}</span>
                </button>
              ))}
            </div>
            <div className="relative mt-4 flex items-center gap-2 rounded-xl bg-white/85 border border-sky-300 w-fit px-3 py-2"><PlayerAvatar avatarId={currentPlayer?.avatar} skinTone={currentPlayer?.skinTone} size="sm" /><span className="font-black text-sm text-blue-900">Sua equipe avança pelo mapa</span></div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default TeamMissionScreen;
