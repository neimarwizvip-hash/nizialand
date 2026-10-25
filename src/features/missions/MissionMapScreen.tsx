import React from 'react';
import { Lock, CheckCircle2, ArrowRight, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getMissionMapState } from '../../data/missionMap';
import { GameHeader } from '../../components/layout/GameHeader';

export const MissionMapScreen: React.FC = () => {
  const navigate = useNavigate();
  const { activityResults, quizResult, flashcardResult } = useGame();
  const levels = getMissionMapState(activityResults, quizResult, flashcardResult);
  const current = levels.find(l => l.state === 'available');
  return <div className="min-h-screen game-sky text-slate-900"><GameHeader /><main className="max-w-6xl mx-auto px-4 py-6 sm:py-10"><div className="text-center mb-7"><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-sky-300 text-blue-800 font-black"><Map className="w-5 h-5"/> MAPA DAS MISSÕES</div><h1 className="font-bungee text-3xl sm:text-5xl text-blue-900 mt-3">SUA JORNADA</h1><p className="font-bold text-slate-600 mt-2">Veja onde você está, o que falta e o próximo desafio até o Nível 10.</p></div><div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">{levels.map(level => <article key={level.number} className={`relative rounded-3xl border-4 p-4 sm:p-5 bg-white/90 shadow-[0_6px_0_0_rgba(15,23,42,0.12)] ${level.state === 'locked' ? 'opacity-55 grayscale' : level.state === 'completed' ? 'border-emerald-400' : 'border-amber-400 ring-4 ring-amber-200/50'}`}><div className="flex items-start justify-between"><div className="text-5xl" aria-hidden="true">{level.icon}</div><span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-black">NÍVEL {level.number}</span></div><h2 className="font-bungee text-xl text-blue-900 mt-3">{level.title}</h2><p className="text-sm font-black text-amber-700 mt-1">{level.theme}</p><p className="text-sm text-slate-600 mt-2 min-h-10">{level.description}</p><div className="mt-4 flex items-center justify-between text-xs font-black"><span>{level.activityCount} atividades</span>{level.completed ? <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> COMPLETO</span> : level.available ? <span className="text-amber-700">DISPONÍVEL</span> : <span className="text-slate-500 flex items-center gap-1"><Lock className="w-4 h-4"/> BLOQUEADO</span>}</div>{level.available && <button onClick={() => navigate(level.path)} className="mt-4 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 border-2 border-amber-700 font-black flex items-center justify-center gap-2">{level.completed ? 'Revisitar nível' : level.number === current?.number ? 'Continuar missão' : 'Abrir'} <ArrowRight className="w-4 h-4"/></button>}</article>)}</div></main></div>;
};
export default MissionMapScreen;
