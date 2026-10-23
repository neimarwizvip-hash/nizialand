import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, BookOpen, Layers, Award, CheckCircle2, Play, Trophy, GraduationCap } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';
import { GameHeader } from '../../components/layout/GameHeader';
import { getPlayerGrade, setPlayerGrade } from '../../services/grade';
import { GRADE_FLASHCARD_THEME, GRADE_LABELS, GRADE_QUIZ_THEME, SCHOOL_GRADES, SchoolGrade } from '../../data/level0Content';
import { LEVEL0, LEVEL0_MISSION_FLASHCARDS, LEVEL0_MISSION_QUIZ } from '../../content/level0';
import { level0Results } from '../../engines/pedagogy/adapters';
import { getLevelProgress } from '../../engines/progression/progress';

// Mapa do Nível 0 — Missão: desviar das distrações do Zé Cartinha e da brincadeira do bafo.
// GANCHO DE HISTÓRIA: quando a HQ de abertura do nível existir, envolver esta tela com
// <PhaseStoryGate level={0} video="/assets/historia_nivel0.mp4"> para mostrá-la uma vez
// antes do mapa. Por enquanto o mapa abre direto.
export const MissionBriefingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, quizResult, flashcardResult } = useGame();
  const [grade, setGrade] = useState<SchoolGrade | null>(() => getPlayerGrade(currentPlayer));
  const [choosingGrade, setChoosingGrade] = useState<boolean>(false);

  if (!currentPlayer) return null; // redirect handled by <RequirePlayer>

  // Estado das missões vem do progresso do Nível 0 (src/engines/progression).
  const progress = getLevelProgress(LEVEL0, level0Results(quizResult, flashcardResult, grade), grade !== null);
  const stateOf = (missionId: string) => progress.missions.find(m => m.mission.id === missionId)?.state;
  const isQuizDone = stateOf(LEVEL0_MISSION_QUIZ.id) === 'completed';
  const isFlashcardsDone = stateOf(LEVEL0_MISSION_FLASHCARDS.id) === 'completed';
  const missionsCompletedCount = progress.completedCount;
  const quizPath = LEVEL0_MISSION_QUIZ.activity.path;
  const flashcardsPath = LEVEL0_MISSION_FLASHCARDS.activity.path;
  const isBlue = currentPlayer.team === 'blue';
  const showGradeChooser = grade === null || choosingGrade;

  const chooseGrade = (g: SchoolGrade) => {
    audioService.playClick();
    setPlayerGrade(currentPlayer, g);
    setGrade(g);
    setChoosingGrade(false);
  };

  const goTo = (path: string) => {
    if (!grade) return;
    audioService.playClick();
    navigate(path);
  };

  const handleStartPlay = () => {
    if (!isQuizDone) goTo(quizPath);
    else if (!isFlashcardsDone) goTo(flashcardsPath);
    else goTo('/results/final');
  };

  const locked = grade === null;

  return (
    <div className="min-h-screen game-sky text-slate-900 flex flex-col">
      <GameHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col justify-center">
        {/* Cabeçalho do nível */}
        <div className="text-center mb-6 animate-rise-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 border border-blue-400 text-blue-700 font-bold text-xs uppercase tracking-widest mb-3">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Escola Municipal Nísia Vilela Fernandes</span>
          </div>

          <h1 className="text-3xl md:text-5xl game-title">NÍVEL 0</h1>
          <p className="mt-2 text-base md:text-xl font-heading font-black text-blue-800 max-w-3xl mx-auto leading-snug">
            Missão: Desvie das distrações do Zé Cartinha e da brincadeira do bafo
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 text-lg md:text-xl font-bold">
            <span className="text-slate-600">Olá,</span>
            <span className="text-amber-600 font-extrabold uppercase">{currentPlayer.displayName}!</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {/* Equipe */}
            <div
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border-[3px] shadow-[0_4px_0_0_#bae6fd]"
              style={{
                backgroundColor: isBlue ? 'rgba(219, 234, 254, 0.95)' : 'rgba(243, 232, 255, 0.95)',
                borderColor: isBlue ? '#3b82f6' : '#a855f7'
              }}
            >
              <Shield className={`w-6 h-6 fill-current ${isBlue ? 'text-blue-600' : 'text-purple-600'}`} />
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600">Sua equipe</p>
                <p className={`font-bungee text-sm md:text-base ${isBlue ? 'text-blue-700' : 'text-purple-700'}`}>
                  {isBlue ? 'EQUIPE AZUL' : 'EQUIPE ROXA'} • TURMA {currentPlayer.className}
                </p>
              </div>
            </div>

            {/* Série */}
            {grade && !choosingGrade && (
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl border-[3px] border-amber-400 bg-amber-50 shadow-[0_4px_0_0_#f59e0b]">
                <GraduationCap className="w-6 h-6 text-amber-600" />
                <div className="text-left">
                  <p className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600">Sua série</p>
                  <p className="font-bungee text-sm md:text-base text-amber-700">{GRADE_LABELS[grade]}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { audioService.playClick(); setChoosingGrade(true); }}
                  className="ml-1 text-xs font-heading font-black text-blue-700 hover:underline uppercase"
                >
                  Trocar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Escolha da série */}
        {showGradeChooser && (
          <div className="game-panel-gold p-5 mb-6 text-center animate-rise-in">
            <p className="font-heading font-black text-blue-800 text-lg">
              {grade ? 'Trocar de série' : 'Em que série você está?'}
            </p>
            <p className="text-sm text-slate-600 mb-3">As perguntas do Nível 0 mudam de acordo com a sua série.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl mx-auto">
              {SCHOOL_GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => chooseGrade(g)}
                  className={`px-4 py-3 rounded-2xl font-bungee text-lg border-[3px] transition-all active:translate-y-1 ${
                    grade === g
                      ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-[0_4px_0_0_#b45309]'
                      : 'bg-white border-sky-300 text-blue-800 shadow-[0_4px_0_0_#7dd3fc] hover:bg-sky-50'
                  }`}
                >
                  {GRADE_LABELS[g]}
                </button>
              ))}
            </div>
            {grade && (
              <button
                type="button"
                onClick={() => setChoosingGrade(false)}
                className="mt-3 text-xs font-heading font-black text-slate-500 hover:underline uppercase"
              >
                Cancelar
              </button>
            )}
          </div>
        )}

        {/* Atividades do nível */}
        <div className={`game-panel p-6 md:p-8 mb-8 ${locked ? 'opacity-60' : ''}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-200 pb-5 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bungee text-slate-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-600" />
                ATIVIDADES DO NÍVEL 0
              </h2>
              <p className="text-slate-600 text-sm md:text-base mt-1">
                Complete as duas atividades sem cair nas distrações do Zé Cartinha e ganhe pontos para você, sua turma e sua equipe!
              </p>
            </div>

            <div className="bg-sky-50 border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd] px-4 py-3 rounded-2xl flex items-center gap-4">
              <div>
                <div className="text-xs uppercase font-extrabold text-slate-500">Progresso</div>
                <div className="text-lg font-bungee text-amber-600 whitespace-nowrap">
                  {missionsCompletedCount} / {progress.total} FEITAS
                </div>
              </div>
              <div className="w-16 h-3 bg-white/95 rounded-full overflow-hidden border border-sky-200">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${(missionsCompletedCount / progress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* ATIVIDADE 1: QUIZ */}
            <button
              type="button"
              disabled={locked}
              onClick={() => goTo(quizPath)}
              title={`Missão 1: ${LEVEL0_MISSION_QUIZ.title}`}
              className={`text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden group disabled:cursor-not-allowed ${
                isQuizDone
                  ? 'bg-emerald-100/80 border-emerald-500/60 hover:border-emerald-400'
                  : 'bg-blue-100/80 border-blue-500 hover:border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-700 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                {isQuizDone ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    FEITA ({quizResult?.totalScore ?? 0} PTS)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400 text-blue-700 text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    PRONTA
                  </span>
                )}
              </div>

              <h3 className="text-lg md:text-xl font-bungee text-slate-900 mb-2">ATIVIDADE 1 — QUIZ</h3>
              <p className="text-slate-600 text-sm mb-1 leading-relaxed">
                {grade ? GRADE_QUIZ_THEME[grade] : 'Escolha sua série para ver o tema.'}
              </p>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                10 perguntas, até <strong>1.000 pontos</strong>. Cuidado: o Zé vai aparecer chamando para o bafo!
              </p>

              <div className="flex items-center justify-between text-xs font-bold text-blue-600">
                <span>10 perguntas • 1 por tela</span>
                <span className="group-hover:translate-x-1 transition-transform">{isQuizDone ? 'Rever' : 'Começar'} →</span>
              </div>
            </button>

            {/* ATIVIDADE 2: FLASHCARDS */}
            <button
              type="button"
              disabled={locked}
              onClick={() => goTo(flashcardsPath)}
              title={`Missão 2: ${LEVEL0_MISSION_FLASHCARDS.title}`}
              className={`text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden group disabled:cursor-not-allowed ${
                isFlashcardsDone
                  ? 'bg-emerald-100/80 border-emerald-500/60 hover:border-emerald-400'
                  : 'bg-purple-100/80 border-purple-500 hover:border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-400 flex items-center justify-center text-purple-700 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                {isFlashcardsDone ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    FEITA ({flashcardResult?.totalScore ?? 0} PTS)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400 text-purple-700 text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    PRONTA
                  </span>
                )}
              </div>

              <h3 className="text-lg md:text-xl font-bungee text-slate-900 mb-2">ATIVIDADE 2 — FLASHCARDS</h3>
              <p className="text-slate-600 text-sm mb-1 leading-relaxed">
                {grade ? GRADE_FLASHCARD_THEME[grade] : 'Escolha sua série para ver o tema.'}
              </p>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Memorize os 8 estudantes e encontre as cartas certas. O Zé vai tentar embaralhar tudo! Até <strong>500 pontos</strong>.
              </p>

              <div className="flex items-center justify-between text-xs font-bold text-purple-600">
                <span>8 cartas • 5 rodadas</span>
                <span className="group-hover:translate-x-1 transition-transform">{isFlashcardsDone ? 'Rever' : 'Começar'} →</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            disabled={locked}
            onClick={handleStartPlay}
            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bungee text-xl tracking-wider shadow-[0_6px_0_0_#b45309] active:translate-y-1 active:shadow-[0_2px_0_0_#b45309] border-[3px] border-amber-600 flex items-center justify-center gap-3 transition-all cursor-pointer animate-arcade-pulse disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Play className="w-7 h-7 fill-slate-950" />
            <span>VAMOS JOGAR!</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              navigate('/leaderboard');
            }}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-sky-50 text-blue-800 border-2 border-sky-300 shadow-[0_4px_0_0_#7dd3fc] active:translate-y-1 active:shadow-[0_1px_0_0_#7dd3fc] font-heading font-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-amber-600" />
            <span>RANKING</span>
          </button>
        </div>
      </main>
    </div>
  );
};
