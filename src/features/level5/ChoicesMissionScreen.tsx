import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { LEVEL5 } from '../../content/level5';
import { LEVEL5_CONTENT, Level5Question } from '../../data/level5Content';
import { buildLevel5Result } from './level5Rules';
import { getMissionProgress } from '../../engines/progression/progress';
import { unlockForVistoria } from '../../services/vistoria';
import { itensDaRodada } from '../../data/rodadasFases';
import { TelaFaseMissao } from '../levels/TelaFaseMissao';
import { SEGUNDOS_POR_PERGUNTA } from '../levels/PhaseMissionScreen';
import type { ResultadoRodada } from '../levels/RodadaAtividade';

// Nível 5 (Minhas escolhas): cada atividade abre uma rodada — a pergunta da série e mais as do banco da faixa.
export const ChoicesMissionScreen: React.FC = () => {
  const { currentPlayer, activityResults, saveActivityResult, vistoria } = useGame();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const grade = getPlayerGrade(currentPlayer) ?? '8';
  const progress = useMemo(() => unlockForVistoria(getMissionProgress(LEVEL5, activityResults, true), vistoria), [activityResults, vistoria]);
  const requested = params.get('atividade');
  const selected = LEVEL5.mission.activities.find(a => a.id === requested) ?? null;
  const entry = progress.activities.find(a => a.activity.id === selected?.id);
  useEffect(() => {
    if (requested && (!selected || entry?.state === 'locked')) setParams({}, { replace: true });
  }, [requested, selected, entry?.state, setParams]);
  const content = LEVEL5_CONTENT[grade];
  const aberta = selected && entry?.state !== 'locked' ? selected : null;
  const itens = useMemo(() => {
    if (!aberta) return null;
    const porAtividade: Record<string, Level5Question[]> = { 'nivel5-dialogos': content.dialogos, 'nivel5-caminhos': content.caminhos, 'nivel5-sentimentos': content.sentimentos, 'nivel5-conselho': content.conselho, 'nivel5-se': content.se, 'nivel5-ritmo': content.ritmo, 'nivel5-revisao': content.revisao };
    return itensDaRodada(aberta.id, grade, porAtividade[aberta.id] ?? []);
  }, [aberta, grade, content]);

  const concluir = (r: ResultadoRodada) => {
    if (!aberta || !itens) return;
    const result = buildLevel5Result(aberta, grade, r.acertos * 100, r.acertos, itens[0] as Level5Question);
    saveActivityResult({ ...result, maxScore: r.total * 100, totalItems: r.total, evidence: { itens, respostas: r.respostas } as never });
  };

  return (
    <TelaFaseMissao
      nivel={5}
      titulo="Minhas escolhas"
      subtitulo={`${grade}º ano · Reflexão e decisão`}
      descricao={`${content.curriculum.theme} · ${content.curriculum.progression}`}
      atividades={progress.activities}
      concluido={progress.isCompleted}
      notaConclusao="Continue sua jornada no próximo nível."
      selecionada={aberta ? { id: aberta.id, nome: aberta.name } : null}
      itens={itens}
      cronometro={aberta?.mechanic === 'timed' ? SEGUNDOS_POR_PERGUNTA : undefined}
      onConcluir={concluir}
      onAbrir={id => setParams({ atividade: id })}
      onVoltar={() => setParams({})}
      onMapa={() => navigate('/mapa')}
    />
  );
};
export default ChoicesMissionScreen;
