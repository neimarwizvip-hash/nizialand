import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Lock, School } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { LEVEL3 } from '../../content/level3';
import { LEVEL3_CONTENT, Level3Question } from '../../data/level3Content';
import { buildLevel3Result } from './level3Rules';
import { getMissionProgress } from '../../engines/progression/progress';

export const ClassroomScreen: React.FC = () => {
  const { currentPlayer, activityResults, saveActivityResult } = useGame();
  const navigate = useNavigate(); const [params, setParams] = useSearchParams();
  const grade = getPlayerGrade(currentPlayer) ?? '8';
  const progress = useMemo(() => getMissionProgress(LEVEL3, activityResults, true), [activityResults]);
  const requested = params.get('atividade');
  const selected = LEVEL3.mission.activities.find(a => a.id === requested) ?? null;
  const entry = progress.activities.find(a => a.activity.id === selected?.id);
  const [done, setDone] = useState(false); const [choice, setChoice] = useState<number | null>(null);
  useEffect(() => { setDone(false); setChoice(null); if (requested && (!selected || entry?.state === 'locked')) setParams({}, { replace: true }); }, [requested, selected, entry?.state, setParams]);
  const content = LEVEL3_CONTENT[grade];
  const questions: Record<string, Level3Question[]> = { 'nivel3-arrume': content.arrange, 'nivel3-lousa': content.board, 'nivel3-quem': content.who, 'nivel3-memoria': content.memory, 'nivel3-labirinto': content.maze, 'nivel3-revisao': content.review };
  const question = selected ? questions[selected.id][0] : null;
  const answer = (i: number) => { if (!selected || !question || done) return; setChoice(i); const result = buildLevel3Result(selected, grade, i === question.answer ? 100 : 0, i === question.answer ? 1 : 0, question); saveActivityResult(result); setDone(true); };
  if (selected && entry?.state !== 'locked' && question) return <div className="min-h-screen game-sky p-4 sm:p-8"><div className="max-w-3xl mx-auto"><button onClick={() => setParams({})} className="mb-4 px-4 py-2 rounded-xl bg-white border-2 border-sky-300 font-black flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Salas</button><div className="game-panel p-6 sm:p-8"><p className="text-xs font-black tracking-widest text-blue-700">NÍVEL 3 · SALA DE AULA</p><h1 className="font-bungee text-2xl sm:text-4xl text-blue-900 mt-2">{selected.name}</h1><p className="font-bold text-slate-600 mt-3">{question.prompt}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-black"><span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">Habilidade: {question.skill}</span><span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800">Foco: {question.languageFocus}</span></div><div className="grid gap-3 mt-6">{question.options.map((option, i) => <button key={option} disabled={done} onClick={() => answer(i)} className={`text-left p-4 rounded-2xl border-2 font-heading font-black ${done && i === question.answer ? 'bg-emerald-100 border-emerald-500' : done && i === choice ? 'bg-red-100 border-red-500' : 'bg-white border-slate-300 hover:border-blue-500'}`}>{option}</button>)}</div>{done && <div className="mt-5 rounded-2xl bg-sky-50 border-2 border-sky-200 p-4"><p className="font-black">{choice === question.answer ? 'Resposta correta! +100 pontos.' : 'Veja a resposta correta.'}</p><p className="text-sm text-slate-600 mt-1">{question.explanation}</p><button onClick={() => setParams({})} className="mt-3 px-5 py-2 rounded-xl bg-amber-400 border-2 border-amber-700 font-black">Voltar às salas</button></div>}</div></div></div>;
  return <div className="min-h-screen game-sky p-4 sm:p-8"><div className="max-w-6xl mx-auto"><header className="flex items-center justify-between mb-6"><div><p className="text-xs font-black tracking-widest text-emerald-700">NISIALAND · NÍVEL 3</p><h1 className="font-bungee text-3xl sm:text-5xl text-blue-900">SALAS DE AULA</h1><p className="font-bold text-slate-600">Convivência em sala · {grade}º ano</p><p className="text-sm text-slate-500 mt-2 max-w-2xl">{content.curriculum.theme} · {content.curriculum.progression}</p></div><button onClick={() => navigate('/mapa')} className="px-4 py-2 rounded-xl bg-white border-2 border-sky-300 font-black">Mapa</button></header><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{progress.activities.map(({ activity, state, result }) => <button key={activity.id} disabled={state === 'locked'} onClick={() => setParams({ atividade: activity.id })} className={`text-left game-panel p-5 transition ${state === 'locked' ? 'opacity-50 grayscale' : 'hover:-translate-y-1'}`}><School className="w-10 h-10 text-emerald-600"/><h2 className="font-bungee text-xl text-blue-900 mt-3">{activity.name}</h2><p className="text-sm font-bold text-slate-600 mt-2">{activity.phrase}</p><span className="inline-flex items-center gap-1 mt-4 text-xs font-black">{state === 'locked' ? <><Lock className="w-4 h-4"/> BLOQUEADA</> : result?.completed ? <><Check className="w-4 h-4 text-emerald-600"/> CONCLUÍDA · {result.score} PTS</> : 'ABRIR SALA'}</span></button>)}</div></div></div>;
};
export default ClassroomScreen;
