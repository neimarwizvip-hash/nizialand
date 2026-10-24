import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { audioService } from '../../services/audio';
import { LEVEL2 } from '../../data/level2Content';
import { getMissionProgress } from '../../engines/progression/progress';
import { resolveRequestedActivity } from './level2Rules';
import { LEVEL2_ACTIVITY_VIEWS } from './Level2Activities';

const stationStyle = ['bg-blue-100 border-blue-500', 'bg-orange-100 border-orange-500', 'bg-emerald-100 border-emerald-500', 'bg-pink-100 border-pink-500', 'bg-purple-100 border-purple-500', 'bg-amber-100 border-amber-500'];

// Pátio do Nível 2: mapa com as 6 estações. ?atividade=<id> abre direto (só se já estiver liberada).
export const PatioScreen: React.FC = () => {
  const { currentPlayer, activityResults } = useGame();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const grade = getPlayerGrade(currentPlayer) ?? '8';
  const unlocked = true; // a rota já exige o Nível 1 completo (RequireLevel2)
  const requested = params.get('atividade');
  const selected = resolveRequestedActivity(LEVEL2, activityResults, requested, unlocked);
  const stations = useMemo(() => getMissionProgress(LEVEL2, activityResults, unlocked).activities, [activityResults]);
  const [runKey, setRunKey] = useState(0);

  // Atividade inválida ou ainda bloqueada na URL: volta para o mapa.
  useEffect(() => {
    if (requested && !selected) setParams({}, { replace: true });
  }, [requested, selected, setParams]);

  // Trilha do mapa no pátio, trilha de desafio dentro da atividade (depois da RouteMusic).
  const playing = selected?.id ?? null;
  useEffect(() => {
    const t = setTimeout(() => audioService.playTrack(playing ? 'desafio' : 'mapa'), 0);
    return () => clearTimeout(t);
  }, [playing]);

  if (selected) {
    const View = LEVEL2_ACTIVITY_VIEWS[selected.id];
    return (
      <View
        key={`${selected.id}-${runKey}`}
        grade={grade}
        onExit={() => setParams({})}
        onReplay={() => setRunKey(k => k + 1)}
      />
    );
  }

  return <div className="min-h-screen game-sky text-slate-900 p-4 sm:p-8 short:p-2">
    <div className="max-w-6xl mx-auto">
      <header className="flex items-center justify-between gap-3 mb-6 short:mb-2"><div><p className="text-xs font-black tracking-widest text-blue-700">NISIALAND · NÍVEL 2</p><h1 className="font-bungee text-2xl sm:text-4xl short:text-xl text-blue-900">PÁTIO DA ESCOLA</h1><p className="font-bold text-slate-600 short:text-xs">Respeito à autoridade · {grade}º ano</p></div><button onClick={() => navigate('/nivel2')} className="px-4 py-2 rounded-xl bg-white border-2 border-sky-300 font-black">Missão</button></header>
      <div className="relative game-panel p-5 min-h-[60vh] short:min-h-[70vh]"><div className="absolute inset-4 short:inset-2 rounded-3xl bg-gradient-to-br from-sky-200 via-emerald-100 to-amber-100 border-4 border-sky-300 overflow-hidden"><div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,white_0_5%,transparent_6%),linear-gradient(135deg,transparent_45%,#60a5fa_46%_48%,transparent_49%)]" /><div className="absolute top-4 short:top-1 left-1/2 -translate-x-1/2 bg-white/90 rounded-full px-4 py-2 short:py-0.5 font-bungee text-blue-800 short:text-sm whitespace-nowrap">Escolha uma estação</div>{stations.map(({ activity: a, state }, i) => { const open = state !== 'locked'; return <button key={a.id} onClick={() => open && setParams({ atividade: a.id })} disabled={!open} className={`absolute p-3 sm:p-4 short:p-1.5 rounded-2xl border-4 shadow-lg text-left w-40 sm:w-52 short:w-40 ${stationStyle[i]} ${!open ? 'opacity-40 grayscale' : 'hover:-translate-y-1'} transition`} style={{ left: `${12 + (i % 3) * 34}%`, top: `${22 + Math.floor(i / 3) * 35}%` }}><MapPin className="w-6 h-6 short:w-4 short:h-4 text-slate-700"/><b className="block mt-1 short:mt-0 short:text-sm">{a.name}</b><span className="text-xs font-bold">{state === 'completed' ? 'Concluída' : open ? 'Disponível' : 'Bloqueada'}</span></button>; })}</div></div>
    </div>
  </div>;
};
export default PatioScreen;
