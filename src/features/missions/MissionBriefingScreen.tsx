import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, Lock, Play, GraduationCap, LogOut, ArrowRight, Ear, Puzzle, MessagesSquare, MapPinned } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';
import { getPlayerGrade, setPlayerGrade } from '../../services/grade';
import { GRADE_FLASHCARD_THEME, GRADE_LABELS, GRADE_QUIZ_THEME, SCHOOL_GRADES, SchoolGrade } from '../../data/level0Content';
import { LEVEL0 } from '../../content/level0';
import { LEVEL1 } from '../../content/level1';
import { level0Results } from '../../engines/pedagogy/adapters';
import { getMissionProgress, ActivityProgress } from '../../engines/progression/progress';
import type { ActivityColor, Mechanic } from '../../core/types';
import { isGuestPlayer } from '../../types';
import { NisialandLogo } from '../../components/ui/NisialandLogo';
import { GameControls, LevelBadge } from '../../components/ui/GameControls';
import { FullscreenButton } from '../../components/ui/FullscreenButton';
import { PlayerAvatar } from '../../components/ui/PlayerAvatar';

// Cores dos cartões de atividade (fundo, borda, botão JOGAR).
const COLOR_STYLES: Record<ActivityColor, { card: string; art: string; button: string }> = {
  yellow: { card: 'bg-amber-50 border-amber-400', art: 'bg-amber-100', button: 'from-amber-400 to-amber-500 border-amber-600 shadow-[0_5px_0_0_#b45309] text-slate-950' },
  purple: { card: 'bg-purple-50 border-purple-400', art: 'bg-purple-100', button: 'from-purple-500 to-purple-600 border-purple-800 shadow-[0_5px_0_0_#581c87] text-white' },
  blue: { card: 'bg-blue-50 border-blue-400', art: 'bg-blue-100', button: 'from-blue-500 to-blue-600 border-blue-800 shadow-[0_5px_0_0_#1e3a8a] text-white' },
  green: { card: 'bg-emerald-50 border-emerald-400', art: 'bg-emerald-100', button: 'from-emerald-500 to-emerald-600 border-emerald-800 shadow-[0_5px_0_0_#065f46] text-white' },
  orange: { card: 'bg-orange-50 border-orange-400', art: 'bg-orange-100', button: 'from-orange-400 to-orange-500 border-orange-700 shadow-[0_5px_0_0_#9a3412] text-slate-950' },
  pink: { card: 'bg-pink-50 border-pink-400', art: 'bg-pink-100', button: 'from-pink-500 to-pink-600 border-pink-800 shadow-[0_5px_0_0_#9d174d] text-white' },
};

// Folha de quiz com "?" (desenho simples em SVG).
const QuizArt: React.FC = () => (
  <svg viewBox="0 0 120 100" className="h-full w-auto" aria-hidden="true">
    <rect x="28" y="10" width="64" height="82" rx="6" fill="#fff" stroke="#b45309" strokeWidth="3" transform="rotate(-6 60 51)" />
    <rect x="36" y="22" width="30" height="5" rx="2.5" fill="#fbbf24" transform="rotate(-6 60 51)" />
    <rect x="36" y="34" width="44" height="4" rx="2" fill="#e2e8f0" transform="rotate(-6 60 51)" />
    <rect x="36" y="44" width="40" height="4" rx="2" fill="#e2e8f0" transform="rotate(-6 60 51)" />
    <circle cx="84" cy="68" r="20" fill="#facc15" stroke="#b45309" strokeWidth="3" />
    <text x="84" y="78" textAnchor="middle" fontSize="28" fontWeight="900" fill="#1e3a8a" fontFamily="sans-serif">?</text>
  </svg>
);

// Cartas de memória: uma com maçã, outra com "APPLE".
const FlashcardArt: React.FC = () => (
  <svg viewBox="0 0 120 100" className="h-full w-auto" aria-hidden="true">
    <g transform="rotate(-10 40 52)">
      <rect x="12" y="16" width="52" height="70" rx="7" fill="#fff" stroke="#7e22ce" strokeWidth="3" />
      <circle cx="38" cy="54" r="14" fill="#ef4444" />
      <path d="M38 40 q2 -7 7 -9" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="45" cy="36" rx="6" ry="3" fill="#22c55e" transform="rotate(-25 45 36)" />
    </g>
    <g transform="rotate(8 82 50)">
      <rect x="56" y="14" width="52" height="70" rx="7" fill="#a855f7" stroke="#581c87" strokeWidth="3" />
      <text x="82" y="54" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff" fontFamily="sans-serif">APPLE</text>
    </g>
  </svg>
);

const ART: Partial<Record<Mechanic, React.FC>> = { quiz: QuizArt, flashcards: FlashcardArt };

// Atividades sem desenho próprio (Nível 1) usam um ícone grande.
const ICON_ART: Partial<Record<Mechanic, React.FC<{ className?: string }>>> = {
  listen: Ear, order: Puzzle, dialogue: MessagesSquare, explore: MapPinned,
};

const ActivityCard: React.FC<{ item: ActivityProgress; hint?: string; onPlay: () => void }> = ({ item, hint, onPlay }) => {
  const { activity, state, result } = item;
  const style = COLOR_STYLES[activity.color];
  const Art = ART[activity.mechanic];
  const Icon = ICON_ART[activity.mechanic];
  const done = state === 'completed';
  const locked = state === 'locked';

  return (
    <article
      data-activity={activity.id}
      data-state={state}
      className={`relative flex flex-col items-center text-center rounded-3xl border-[3px] p-4 sm:p-5 short:p-2 shadow-[0_6px_0_0_rgba(15,23,42,0.12)] ${style.card} ${locked ? 'opacity-60' : ''}`}
    >
      {done && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-black">
          <CheckCircle2 className="w-3.5 h-3.5" />
          FEITA · {result?.score ?? 0} PTS
        </span>
      )}
      {locked && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-500 text-white text-[11px] font-black">
          <Lock className="w-3.5 h-3.5" />
          BLOQUEADA
        </span>
      )}
      <div className={`w-full h-28 sm:h-32 short:h-10 rounded-2xl flex items-center justify-center mb-3 short:mb-1 ${style.art}`}>
        {Art ? <Art /> : Icon ? <Icon className="w-16 h-16 sm:w-20 sm:h-20 short:w-8 short:h-8 text-slate-700" /> : null}
      </div>
      <h3 className="font-bungee text-2xl short:text-sm short:leading-tight text-slate-900">{activity.name}</h3>
      <p className="mt-1 font-heading font-black text-blue-900 text-sm sm:text-base short:hidden leading-tight">{activity.phrase}</p>
      {hint && <p className="mt-1 text-xs text-slate-600 leading-snug short:hidden">{hint}</p>}
      <button
        type="button"
        disabled={locked}
        onClick={onPlay}
        className={`mt-4 short:mt-1 w-full max-w-[14rem] inline-flex items-center justify-center gap-2 px-6 py-3 short:px-1 short:py-1 short:whitespace-nowrap rounded-2xl bg-gradient-to-b border-[3px] font-bungee text-lg short:text-xs tracking-wider active:translate-y-1 active:shadow-none transition-all disabled:cursor-not-allowed ${style.button}`}
      >
        <Play className="w-5 h-5 fill-current" />
        {done ? 'JOGAR DE NOVO' : 'JOGAR'}
      </button>
    </article>
  );
};

// Missão do nível (cada nível tem uma missão com o mesmo número). Os cartões vêm dos dados da missão.
// A introdução da história (historia_nivel<N>.mp4) toca antes desta tela pelo PhaseStoryGate (App.tsx).
// level 0 = /missions; level 1 = /nivel1 (liberado quando a Missão 0 termina).
export const MissionBriefingScreen: React.FC<{ level?: 0 | 1 }> = ({ level = 0 }) => {
  const navigate = useNavigate();
  const { currentPlayer, quizResult, flashcardResult, activityResults, level0Completed, logout } = useGame();
  const [grade, setGrade] = useState<SchoolGrade | null>(() => getPlayerGrade(currentPlayer));
  const [choosingGrade, setChoosingGrade] = useState<boolean>(false);

  if (!currentPlayer) return null; // redirect handled by <RequirePlayer>
  if (level === 1 && !level0Completed) return <Navigate to="/missions" replace />;

  const levelData = level === 1 ? LEVEL1 : LEVEL0;
  const mission = levelData.mission;
  const progress = level === 1
    ? getMissionProgress(LEVEL1, activityResults, grade !== null)
    : getMissionProgress(LEVEL0, level0Results(quizResult, flashcardResult, grade), grade !== null);
  const isBlue = currentPlayer.team === 'blue';
  const showGradeChooser = grade === null || choosingGrade;
  const count = progress.activities.length;
  const gridCols = count >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4 short:grid-cols-4' : count >= 2 ? 'sm:grid-cols-2' : '';

  const hintFor = (mechanic: Mechanic, hint?: string): string | undefined => {
    if (!grade) return 'Escolha sua série para liberar.';
    if (level === 1) return hint;
    if (mechanic === 'quiz') return GRADE_QUIZ_THEME[grade];
    if (mechanic === 'flashcards') return GRADE_FLASHCARD_THEME[grade];
    return undefined;
  };

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

  return (
    <div className="min-h-screen game-sky text-slate-900 flex flex-col">
      {/* Barra superior */}
      <header className="w-full px-3 sm:px-5 py-2 short:py-1 flex flex-wrap short:flex-nowrap items-center justify-between gap-2 bg-white/80 backdrop-blur border-b-2 border-sky-200">
        <div className="flex items-center gap-2">
          <Link to="/" aria-label="Início" className="bg-gradient-to-b from-amber-300 to-amber-500 border-[3px] border-amber-600 rounded-2xl px-2 py-1 short:py-0 shadow-[0_4px_0_0_#b45309] short:scale-75 short:origin-left">
            <NisialandLogo size="sm" />
          </Link>
          <LevelBadge level={levelData.number} />
        </div>
        <div className="flex items-center gap-2">
          <GameControls className="short:flex-nowrap short:py-0.5 short:shadow-none" />
          <FullscreenButton />
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-5 md:py-8 short:py-1 flex flex-col">
        {/* Jogador */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-5 short:mb-1">
          <div className="inline-flex items-center gap-2 bg-white/90 border-2 border-sky-200 rounded-2xl px-3 py-1.5 short:py-0.5">
            <PlayerAvatar avatarId={currentPlayer.avatar} skinTone={currentPlayer.skinTone} size="sm" className="border-2 border-amber-400" />
            <div className="text-left leading-tight">
              <p className="font-heading font-black text-sm">
                <span className="text-slate-600">Olá, </span>
                <span className="text-amber-600 uppercase">{currentPlayer.displayName}!</span>
              </p>
              {isGuestPlayer(currentPlayer) ? (
                <p className="text-[11px] font-semibold text-slate-500 short:hidden">
                  Visitante ·{' '}
                  <Link to="/register" className="text-emerald-700 font-bold hover:underline">Fazer meu cadastro definitivo</Link>
                </p>
              ) : (
                <p className="text-[11px] font-semibold text-slate-500 short:hidden">
                  Código: <span className="text-amber-700 font-mono">{currentPlayer.playerCode}</span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Quer trocar de jogador ou sair?')) {
                  logout();
                  navigate('/');
                }
              }}
              className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-red-600"
              title="Trocar de jogador / Sair"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 short:py-0.5 rounded-2xl border-2"
            style={{
              backgroundColor: isBlue ? 'rgba(219, 234, 254, 0.95)' : 'rgba(243, 232, 255, 0.95)',
              borderColor: isBlue ? '#3b82f6' : '#a855f7',
            }}
          >
            <Shield className={`w-5 h-5 fill-current ${isBlue ? 'text-blue-600' : 'text-purple-600'}`} />
            <span className={`font-bungee text-xs sm:text-sm ${isBlue ? 'text-blue-700' : 'text-purple-700'}`}>
              {isBlue ? 'EQUIPE AZUL' : 'EQUIPE ROXA'} • TURMA {currentPlayer.className}
            </span>
          </div>

          {grade && !choosingGrade && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 short:py-0.5 rounded-2xl border-2 border-amber-400 bg-amber-50">
              <GraduationCap className="w-5 h-5 text-amber-600" />
              <span className="font-bungee text-xs sm:text-sm text-amber-700">{GRADE_LABELS[grade]}</span>
              <button
                type="button"
                onClick={() => { audioService.playClick(); setChoosingGrade(true); }}
                className="text-xs font-heading font-black text-blue-700 hover:underline uppercase"
              >
                Trocar
              </button>
            </div>
          )}

          <Link to="/admin" className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-blue-800" title="Painel do professor">
            <Lock className="w-3 h-3" />
            Professor
          </Link>
        </div>

        {/* Escolha da série */}
        {showGradeChooser && (
          <div className="game-panel-gold p-5 mb-6 text-center animate-rise-in">
            <p className="font-heading font-black text-blue-800 text-lg">
              {grade ? 'Trocar de série' : 'Em que série você está?'}
            </p>
            <p className="text-sm text-slate-600 mb-3">As perguntas do Nível {levelData.number} mudam de acordo com a sua série.</p>
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

        {/* Título da missão */}
        <div className="text-center mb-6 short:mb-2 animate-rise-in">
          <div className="flex items-center justify-center gap-3">
            {level === 1 && (
              <img src="/assets/ze_cartinha.png" alt="Zé" className="h-14 md:h-20 short:h-8 w-auto object-contain" onError={e => { e.currentTarget.style.display = 'none'; }} />
            )}
            <span className="h-[3px] w-10 sm:w-24 bg-blue-800/70 rounded-full" />
            <h1 className="font-bungee text-3xl md:text-5xl short:text-xl text-blue-900">MISSÃO {mission.number}</h1>
            <span className="h-[3px] w-10 sm:w-24 bg-blue-800/70 rounded-full" />
          </div>
          <p className="mt-2 short:mt-0 text-xl md:text-3xl short:text-base font-heading font-black text-amber-600 leading-snug">{mission.title}</p>
          <p className="mt-2 text-sm md:text-base text-slate-700 max-w-2xl mx-auto short:hidden">
            Complete as atividades e ganhe pontos para você, sua turma e sua equipe!
          </p>
          <p className="mt-2 short:mt-0 text-xs font-bold uppercase tracking-wider text-slate-500">
            {progress.completedCount} / {progress.total} atividades feitas
          </p>
        </div>

        {/* Atividades da missão */}
        <div className={`grid grid-cols-1 ${gridCols} gap-4 md:gap-6 short:gap-2 w-full max-w-4xl mx-auto ${count >= 4 ? 'lg:max-w-none short:max-w-none' : ''}`}>
          {progress.activities.map((item) => (
            <ActivityCard
              key={item.activity.id}
              item={item}
              hint={hintFor(item.activity.mechanic, item.activity.hint)}
              onPlay={() => goTo(item.activity.path)}
            />
          ))}
        </div>

        {progress.isCompleted && level === 0 && (
          <div className="mt-6 short:mt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => goTo('/results/final')}
              className="px-8 py-3 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 border-[3px] border-emerald-800 text-white font-bungee text-lg shadow-[0_5px_0_0_#065f46] active:translate-y-1 active:shadow-none"
            >
              MISSÃO COMPLETA! VER RESULTADO
            </button>
            <button
              type="button"
              onClick={() => goTo('/nivel1')}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 border-[3px] border-amber-600 text-slate-950 font-bungee text-lg shadow-[0_5px_0_0_#b45309] active:translate-y-1 active:shadow-none"
            >
              IR PARA O NÍVEL 1 <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
        {progress.isCompleted && level === 1 && (
          <div className="mt-6 text-center">
            <p className="font-bungee text-xl text-emerald-700">MISSÃO 1 COMPLETA!</p>
            <button
              type="button"
              onClick={() => goTo('/missions')}
              className="mt-3 px-8 py-3 rounded-2xl bg-white border-[3px] border-sky-300 text-blue-800 font-bungee text-lg shadow-[0_5px_0_0_#7dd3fc] active:translate-y-1 active:shadow-none"
            >
              VOLTAR AO NÍVEL 0
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
