import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { LEVEL3 } from '../../content/level3';
import { LEVEL3_CONTENT } from '../../data/level3Content';
import { MANE_IMG, MANE_SIMPLE_LINE } from '../../data/level3Mane';
import { getMissionProgress } from '../../engines/progression/progress';
import { unlockForVistoria } from '../../services/vistoria';
import { audioService } from '../../services/audio';
import { triggerConfetti } from '../../components/ui/ConfettiEffect';
import { ProvisionalStoryGate } from '../../components/story/ProvisionalStoryGate';
import { LEVEL3_ACTIVITY_VIEWS, LEVEL3_ROOM_ORDER } from './Level3Activities';
import { level3MissionMaxScore, ZE_ROOM_SIZES } from './level3Rules';
import type { CorridorDoor } from './Corridor3D';
import { BotaoJogo, Icone } from '../../components/kit';
import { ConclusaoNivel, QuadroMissao } from '../levels/QuadroMissao';
import type { ItemQuadro } from '../levels/QuadroMissao';

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
    <ConclusaoNivel
      texto="Nível 3 concluído! Você arrumou todas as salas."
      total={total}
      maximo={maxTotal}
      extra={<img src="/assets/ze_cartinha.png" alt="Zé" className={`${zeSize} object-contain`} onError={e => { e.currentTarget.style.display = 'none'; }} />}
    />
  ) : null;

  const modeButton = (
    <BotaoJogo cor="azul" tamanho="sm" onClick={() => switchMode(mode === '3d' ? 'simples' : '3d')}>
      <Icone nome={mode === '3d' ? 'livro' : 'escola'} className="w-5 h-5" />
      {mode === '3d' ? 'Modo simples' : 'Corredor 3D'}
    </BotaoJogo>
  );

  if (mode === '3d') {
    return (
      <ProvisionalStoryGate story="nivel3" bypass={!!requested}>
      <>
        {/* O corredor continua montado (pausado) enquanto a sala está aberta: ao sair, o aluno volta na porta. */}
        <div className={open ? 'hidden' : 'fixed inset-0'}>
          <Suspense fallback={<div className="fixed inset-0 bg-nisia-azul-900 flex items-center justify-center font-display text-2xl text-nisia-sol-400">Abrindo o corredor…</div>}>
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

  const itens: ItemQuadro[] = progress.activities.map(({ activity, state, result }, i) => ({
    id: activity.id,
    rotulo: ROOM_LABEL[i] ?? `Sala ${i + 1}`,
    nome: activity.name,
    frase: activity.hint ?? activity.phrase,
    estado: state === 'locked' ? 'locked' : result ? 'completed' : 'available',
    resultado: result ?? null,
    icone: i === ROOM_LABEL.length - 1 ? 'livro' : 'cadeira',
  }));

  return (
    <ProvisionalStoryGate story="nivel3" bypass={!!requested}>
      <QuadroMissao
        nivel={3}
        titulo="SALAS DE AULA"
        placa="Convivência em sala"
        subtitulo={`${grade}º ano`}
        descricao={`${content.curriculum.theme} · ${content.curriculum.progression}`}
        anfitriao="rosana"
        cenario="corredor"
        itens={itens}
        rotuloAbrir="Abrir sala"
        conclusao={celebration}
        onAbrir={enter}
        acoes={<>
          {modeButton}
          <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); navigate('/mapa'); }}><Icone nome="mapa" className="w-5 h-5" cor="#1F5FD0" /> Mapa</BotaoJogo>
        </>}
        extraCabecalho={
          <div className="flex items-end gap-1 min-w-0 short:hidden" data-testid="mane-header">
            <img src={MANE_IMG} alt="Mané Zoeira" className="w-14 short:w-9 h-auto object-contain drop-shadow-[0_4px_6px_rgba(12,42,102,0.4)]" onError={e => { e.currentTarget.style.display = 'none'; }} />
            <p className="kit-balao kit-balao--esq !py-1.5 !px-3 max-w-md text-xs short:text-[10px] font-semibold">
              {MANE_SIMPLE_LINE.pt} <span className="italic text-nisia-tinta-suave">{MANE_SIMPLE_LINE.en}</span>
            </p>
          </div>
        }
      />
    </ProvisionalStoryGate>
  );
};

export default ClassroomScreen;
