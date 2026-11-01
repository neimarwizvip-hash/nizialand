import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { LEVEL5 } from '../../content/level5';
import { LEVEL5_CONTENT, Level5Question } from '../../data/level5Content';
import { buildLevel5Result } from './level5Rules';
import { getMissionProgress } from '../../engines/progression/progress';
import { unlockForVistoria } from '../../services/vistoria';
import { TelaFaseMissao } from '../levels/TelaFaseMissao';

// Nível 5 (Minhas escolhas): uma pergunta por atividade (conteúdo amplia na Fase 3).
export const ChoicesMissionScreen: React.FC = () => {
  const { currentPlayer, activityResults, saveActivityResult, vistoria } = useGame();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const grade = getPlayerGrade(currentPlayer) ?? '8';
  const progress = useMemo(() => unlockForVistoria(getMissionProgress(LEVEL5, activityResults, true), vistoria), [activityResults, vistoria]);
  const requested = params.get('atividade');
  const selected = LEVEL5.mission.activities.find(a => a.id === requested) ?? null;
  const entry = progress.activities.find(a => a.activity.id === selected?.id);
  const [done, setDone] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  useEffect(() => {
    setDone(false);
    setChoice(null);
    if (requested && (!selected || entry?.state === 'locked')) setParams({}, { replace: true });
  }, [requested, selected, entry?.state, setParams]);
  const content = LEVEL5_CONTENT[grade];
  const questions: Record<string, Level5Question[]> = { 'nivel5-dialogos': content.dialogos, 'nivel5-caminhos': content.caminhos, 'nivel5-sentimentos': content.sentimentos, 'nivel5-conselho': content.conselho, 'nivel5-se': content.se, 'nivel5-ritmo': content.ritmo, 'nivel5-revisao': content.revisao };
  const question = selected ? questions[selected.id][0] : null;
  const answer = (i: number) => {
    if (!selected || !question || done) return;
    setChoice(i);
    saveActivityResult(buildLevel5Result(selected, grade, i === question.answer ? 100 : 0, i === question.answer ? 1 : 0, question));
    setDone(true);
  };
  const aberta = selected && entry?.state !== 'locked' && question ? selected : null;
  return (
    <TelaFaseMissao
      nivel={5}
      titulo="Minhas escolhas"
      subtitulo={`${grade}º ano · Reflexão e decisão`}
      descricao={`${content.curriculum.theme} · ${content.curriculum.progression}`}
      atividades={progress.activities}
      concluido={progress.isCompleted}
      notaConclusao="Continue sua jornada no próximo nível."
      selecionada={aberta ? { nome: aberta.name } : null}
      item={aberta ? question : null}
      respondido={done}
      escolha={choice}
      onResponder={answer}
      onAbrir={id => setParams({ atividade: id })}
      onVoltar={() => setParams({})}
      onMapa={() => navigate('/mapa')}
    />
  );
};
export default ChoicesMissionScreen;
