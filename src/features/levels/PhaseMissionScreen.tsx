import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { getMissionProgress } from '../../engines/progression/progress';
import type { Level } from '../../core/types';
import { unlockForVistoria } from '../../services/vistoria';
import { TelaFaseMissao } from './TelaFaseMissao';

// Missões dos Níveis 6 e 7 (e 3/4 em modo simples): uma pergunta por atividade (conteúdo amplia na Fase 3).
export const PhaseMissionScreen: React.FC<{ level: Level; content: any; accent: string }> = ({ level, content }) => {
  const { currentPlayer, activityResults, saveActivityResult, vistoria } = useGame();
  const navigate = useNavigate();
  const [p, setP] = useSearchParams();
  const grade = getPlayerGrade(currentPlayer) ?? '8';
  const progress = useMemo(() => unlockForVistoria(getMissionProgress(level, activityResults, true), vistoria), [level, activityResults, vistoria]);
  const selected = level.mission.activities.find(a => a.id === p.get('atividade')) ?? null;
  const completed = progress.isCompleted;
  const entry = progress.activities.find(x => x.activity.id === selected?.id);
  const [done, setDone] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  useEffect(() => {
    setDone(false);
    setChoice(null);
    if (p.get('atividade') && (!selected || entry?.state === 'locked')) setP({}, { replace: true });
  }, [p, selected, entry?.state, setP]);
  const item = content[grade].items[0];
  const answer = (i: number) => {
    if (!selected || done) return;
    setChoice(i);
    const now = new Date().toISOString();
    saveActivityResult({ activityId: selected.id, missionId: level.mission.id, grade, mechanic: selected.mechanic, score: i === item.answer ? 100 : 0, maxScore: 100, correctCount: i === item.answer ? 1 : 0, totalItems: 1, completed: true, startedAt: now, completedAt: now, evidence: item });
    setDone(true);
  };
  const aberta = selected && entry?.state !== 'locked' ? selected : null;
  return (
    <TelaFaseMissao
      nivel={level.number}
      titulo={level.title}
      subtitulo={`${grade}º ano · ${content[grade].curriculum.theme}`}
      descricao={content[grade].curriculum.progression}
      atividades={progress.activities}
      concluido={completed}
      notaConclusao={level.number === 7 ? 'O Nível 8 será lançado em breve. Seu progresso do Nível 7 foi registrado.' : 'Continue sua jornada no próximo nível.'}
      selecionada={aberta ? { nome: aberta.name } : null}
      item={aberta ? item : null}
      respondido={done}
      escolha={choice}
      onResponder={answer}
      onAbrir={id => setP({ atividade: id })}
      onVoltar={() => setP({})}
      onMapa={() => navigate('/mapa')}
    />
  );
};
