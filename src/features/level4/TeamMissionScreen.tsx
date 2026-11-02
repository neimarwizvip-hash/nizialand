import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { LEVEL4 } from '../../content/level4';
import { LEVEL4_CONTENT } from '../../data/level4Content';
import { getMissionProgress } from '../../engines/progression/progress';
import { unlockForVistoria } from '../../services/vistoria';
import { ProvisionalStoryGate } from '../../components/story/ProvisionalStoryGate';
import { TeamTroublemakers } from '../../features/level4/TeamTroublemakers';
import { Level4Activities } from '../../features/level4/Level4Activities';
import type { CorridorDoor } from '../level3/Corridor3D';
import { CORREDOR_3D_LIBERADO } from '../../config/corredor3d';
import { audioService } from '../../services/audio';
import { BotaoJogo, Cenario, Hud, Icone } from '../../components/kit';
import type { NomeIcone } from '../../components/kit';
import { ConclusaoNivel, QuadroMissao } from '../levels/QuadroMissao';
import type { ItemQuadro } from '../levels/QuadroMissao';
import { PORTAS_N4 } from '../../data/falasCorredor';

const SchoolCorridor3D = lazy(() => import('../level3/Corridor3D'));
const LEVEL4_MODE_KEY = 'nisialand_nivel4_modo';
function readMode(): '3d' | 'simples' {
  try { return localStorage.getItem(LEVEL4_MODE_KEY) === 'simples' ? 'simples' : '3d'; } catch { return '3d'; }
}

const PLACES = PORTAS_N4;
const ICONE_LUGAR: NomeIcone[] = ['livro', 'bussola', 'pessoas', 'balao', 'trofeu', 'check'];

export const TeamMissionScreen: React.FC = () => {
  const { currentPlayer, activityResults, saveActivityResult, vistoria } = useGame();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [mode, setMode] = useState<'3d' | 'simples'>(() => (CORREDOR_3D_LIBERADO ? readMode() : 'simples'));
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
  const activityView = open && selected ? (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col">
      <Cenario nome="sala" escurecer={0.2} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={4} />
        <Level4Activities key={selected.id} activity={selected} grade={grade} onExit={() => setParams({})} onSave={saveActivityResult} />
      </div>
    </div>
  ) : null;

  if (mode === '3d') return <ProvisionalStoryGate story="nivel4" bypass={!!requested}><>
    <div className={open ? 'hidden' : 'fixed inset-0'}>
      <Suspense fallback={<div className="fixed inset-0 bg-nisia-azul-900 flex items-center justify-center font-display text-2xl text-nisia-sol-400">Abrindo a escola…</div>}>
        <SchoolCorridor3D doors={doors} paused={open} startAt={lastDoor.current} avatarId={currentPlayer?.avatar} avatarSkinTone={currentPlayer?.skinTone} level={4} heading="MISSÃO PELA ESCOLA" simpleLabel="Mapa simples" onEnter={enter} onExit={() => navigate('/mapa')} onSimpleMode={() => switchMode('simples')} />
      </Suspense>
    </div>
    {progress.isCompleted && !open && <div className="fixed z-30 top-16 left-1/2 -translate-x-1/2 w-[min(92vw,520px)] pointer-events-none"><ConclusaoNivel texto="Nível 4 concluído! Equipe reunida." total={total} /></div>}
    {activityView && <div className="fixed inset-0 z-40 overflow-y-auto">{activityView}</div>}
  </></ProvisionalStoryGate>;

  if (activityView) return <ProvisionalStoryGate story="nivel4" bypass>{activityView}</ProvisionalStoryGate>;

  const itens: ItemQuadro[] = progress.activities.map(({ activity, state, result }, index) => ({
    id: activity.id,
    rotulo: PLACES[index] ?? activity.name,
    nome: activity.name,
    frase: activity.phrase,
    estado: state === 'locked' ? 'locked' : result ? 'completed' : 'available',
    resultado: result ?? null,
    icone: ICONE_LUGAR[index] ?? 'pessoas',
  }));

  return (
    <ProvisionalStoryGate story="nivel4" bypass={!!requested}>
      <QuadroMissao
        nivel={4}
        titulo="Trabalho em equipe"
        placa="Missão pela escola"
        subtitulo={`${grade}º ano`}
        descricao={`${LEVEL4_CONTENT[grade].curriculum.theme} · ${LEVEL4_CONTENT[grade].curriculum.progression}`}
        anfitriao="mane"
        cenario="escola"
        itens={itens}
        rotuloAbrir="Começar"
        conclusao={progress.isCompleted ? <ConclusaoNivel texto="Nível 4 concluído! Equipe reunida." total={total} /> : undefined}
        extraCabecalho={<TeamTroublemakers />}
        onAbrir={id => setParams({ atividade: id })}
        acoes={<>
          {CORREDOR_3D_LIBERADO && <BotaoJogo cor="azul" tamanho="sm" onClick={() => { audioService.playClick(); switchMode('3d'); }}><Icone nome="escola" className="w-5 h-5" /> Escola 3D</BotaoJogo>}
          <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); navigate('/mapa'); }}><Icone nome="mapa" className="w-5 h-5" cor="#1F5FD0" /> Mapa</BotaoJogo>
        </>}
      />
    </ProvisionalStoryGate>
  );
};

export default TeamMissionScreen;
