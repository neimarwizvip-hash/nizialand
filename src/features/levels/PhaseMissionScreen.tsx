import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { getMissionProgress } from '../../engines/progression/progress';
import type { Level } from '../../core/types';
import { unlockForVistoria } from '../../services/vistoria';
import { itensDaRodada } from '../../data/rodadasFases';
import { TelaFaseMissao } from './TelaFaseMissao';
import type { ResultadoRodada } from './RodadaAtividade';

// Missões dos Níveis 6 e 7: cada atividade abre uma rodada de perguntas (data/rodadasFases.ts).
export const SEGUNDOS_POR_PERGUNTA = 20;

export const PhaseMissionScreen: React.FC<{ level: Level; content: any; accent: string }> = ({ level, content }) => {
  const { currentPlayer, activityResults, saveActivityResult, vistoria } = useGame();
  const navigate = useNavigate();
  const [p, setP] = useSearchParams();
  const grade = getPlayerGrade(currentPlayer) ?? '8';
  const progress = useMemo(() => unlockForVistoria(getMissionProgress(level, activityResults, true), vistoria), [level, activityResults, vistoria]);
  const selected = level.mission.activities.find(a => a.id === p.get('atividade')) ?? null;
  const entry = progress.activities.find(x => x.activity.id === selected?.id);
  useEffect(() => {
    if (p.get('atividade') && (!selected || entry?.state === 'locked')) setP({}, { replace: true });
  }, [p, selected, entry?.state, setP]);
  const aberta = selected && entry?.state !== 'locked' ? selected : null;
  // Atividade sem rodada própria: usa os itens gerais da série (conteúdo antigo).
  const itens = useMemo(() => {
    if (!aberta) return null;
    const lista = itensDaRodada(aberta.id, grade);
    return lista.length ? lista : content[grade].items;
  }, [aberta, grade, content]);

  const concluir = (r: ResultadoRodada) => {
    if (!aberta || !itens) return;
    const now = new Date().toISOString();
    saveActivityResult({ activityId: aberta.id, missionId: level.mission.id, grade, mechanic: aberta.mechanic, score: r.acertos * 100, maxScore: r.total * 100, correctCount: r.acertos, totalItems: r.total, completed: true, startedAt: now, completedAt: now, evidence: { itens, respostas: r.respostas } });
  };

  return (
    <TelaFaseMissao
      nivel={level.number}
      titulo={level.title}
      subtitulo={`${grade}º ano · ${content[grade].curriculum.theme}`}
      descricao={content[grade].curriculum.progression}
      atividades={progress.activities}
      concluido={progress.isCompleted}
      notaConclusao={level.number === 7 ? 'O Nível 8 será lançado em breve. Seu progresso do Nível 7 foi registrado.' : 'Continue sua jornada no próximo nível.'}
      selecionada={aberta ? { id: aberta.id, nome: aberta.name } : null}
      itens={itens}
      cronometro={aberta?.mechanic === 'timed' ? SEGUNDOS_POR_PERGUNTA : undefined}
      onConcluir={concluir}
      onAbrir={id => setP({ atividade: id })}
      onVoltar={() => setP({})}
      onMapa={() => navigate('/mapa')}
    />
  );
};
