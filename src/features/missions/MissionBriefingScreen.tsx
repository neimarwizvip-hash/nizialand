import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';
import { getPlayerGrade, setPlayerGrade } from '../../services/grade';
import { GRADE_FLASHCARD_THEME, GRADE_LABELS, GRADE_QUIZ_THEME, SCHOOL_GRADES, SchoolGrade } from '../../data/level0Content';
import { LEVEL0 } from '../../content/level0';
import { LEVEL1 } from '../../content/level1';
import { LEVEL2 } from '../../data/level2Content';
import { level0Results } from '../../engines/pedagogy/adapters';
import { getMissionProgress, ActivityProgress } from '../../engines/progression/progress';
import type { ActivityColor, Mechanic } from '../../core/types';
import { Anfitriao, BotaoJogo, Cenario, Estrelas, Ficha, Fita, Hud, Icone, Painel, Titulo } from '../../components/kit';
import type { NomeAnfitriao, NomeCenario, NomeIcone } from '../../components/kit';

// ===== Arte dos cartazes =====
// Fita colorida no alto de cada cartaz (uma cor por atividade).
const FAIXA: Record<ActivityColor, string> = {
  yellow: 'from-nisia-sol-400 to-nisia-sol-500',
  purple: 'from-nisia-roxo-400 to-nisia-roxo-500',
  blue: 'from-nisia-azul-400 to-nisia-azul-500',
  green: 'from-nisia-verde-400 to-nisia-verde-500',
  orange: 'from-nisia-laranja-400 to-nisia-laranja-500',
  pink: 'from-pink-400 to-pink-500',
};
const BOTAO: Record<ActivityColor, 'sol' | 'roxo' | 'azul' | 'verde' | 'laranja'> = {
  yellow: 'sol', purple: 'roxo', blue: 'azul', green: 'verde', orange: 'laranja', pink: 'roxo',
};

// Folha de quiz com "?" (desenho próprio).
const QuizArt: React.FC = () => (
  <svg viewBox="0 0 120 100" className="h-full w-auto" aria-hidden="true">
    <rect x="28" y="10" width="64" height="82" rx="6" fill="#fff" stroke="#8A5A2B" strokeWidth="3" transform="rotate(-6 60 51)" />
    <rect x="36" y="22" width="30" height="5" rx="2.5" fill="#FFC000" transform="rotate(-6 60 51)" />
    <rect x="36" y="34" width="44" height="4" rx="2" fill="#E7D3A6" transform="rotate(-6 60 51)" />
    <rect x="36" y="44" width="40" height="4" rx="2" fill="#E7D3A6" transform="rotate(-6 60 51)" />
    <rect x="36" y="54" width="36" height="4" rx="2" fill="#E7D3A6" transform="rotate(-6 60 51)" />
    <circle cx="84" cy="68" r="20" fill="#FFD23F" stroke="#D98E00" strokeWidth="3" />
    <text x="84" y="78" textAnchor="middle" fontSize="28" fontWeight="900" fill="#0C2A66" fontFamily="Lilita One, sans-serif">?</text>
  </svg>
);

// Cartas de memória: uma com maçã, outra com "APPLE".
const FlashcardArt: React.FC = () => (
  <svg viewBox="0 0 120 100" className="h-full w-auto" aria-hidden="true">
    <g transform="rotate(-10 40 52)">
      <rect x="12" y="16" width="52" height="70" rx="7" fill="#fff" stroke="#5325A8" strokeWidth="3" />
      <circle cx="38" cy="54" r="14" fill="#E5484D" />
      <path d="M38 40 q2 -7 7 -9" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="45" cy="36" rx="6" ry="3" fill="#3FA34D" transform="rotate(-25 45 36)" />
    </g>
    <g transform="rotate(8 82 50)">
      <rect x="56" y="14" width="52" height="70" rx="7" fill="#7B3FE4" stroke="#3B1A7A" strokeWidth="3" />
      <text x="82" y="54" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff" fontFamily="Lilita One, sans-serif">APPLE</text>
    </g>
  </svg>
);

const ART: Partial<Record<Mechanic, React.FC>> = { quiz: QuizArt, flashcards: FlashcardArt };

// Demais mecânicas: ícone próprio grande.
const ICONE_MECANICA: Partial<Record<Mechanic, NomeIcone>> = {
  listen: 'orelha', order: 'livro', dialogue: 'balao', explore: 'lupa',
  dictation: 'orelha', wordsearch: 'lupa', truefalse: 'check', gapfill: 'balao', timed: 'relogio', duel: 'carta',
};

const CENARIO_NIVEL: Record<0 | 1 | 2, NomeCenario> = { 0: 'corredor', 1: 'auditorio', 2: 'patio' };
const ANFITRIAO_NIVEL: Record<0 | 1 | 2, NomeAnfitriao> = { 0: 'marcio', 1: 'leia', 2: 'vania' };

// Percevejo (alfinete) que prende o cartaz no mural.
const Percevejo: React.FC<{ className?: string; cor?: string }> = ({ className = '', cor = '#E5484D' }) => (
  <svg viewBox="0 0 24 24" className={`absolute w-6 h-6 drop-shadow-[0_3px_2px_rgba(0,0,0,0.35)] ${className}`} aria-hidden="true">
    <circle cx="12" cy="10" r="7" fill={cor} />
    <circle cx="9.5" cy="7.5" r="2.2" fill="#fff" fillOpacity="0.7" />
    <path d="M12 17v5" stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Cartaz: React.FC<{ item: ActivityProgress; indice: number; hint?: string; onPlay: () => void }> = ({ item, indice, hint, onPlay }) => {
  const { activity, state, result } = item;
  const Art = ART[activity.mechanic];
  const icone = ICONE_MECANICA[activity.mechanic];
  const done = state === 'completed';
  const locked = state === 'locked';
  const estrelas = result && result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 3) : 0;
  const giro = ['-rotate-1', 'rotate-[0.8deg]', '-rotate-[0.6deg]', 'rotate-1'][indice % 4];

  return (
    <Painel
      as="article"
      tipo="papel"
      liso
      data-activity={activity.id}
      data-state={state}
      className={`flex flex-col items-center text-center p-4 pt-6 short:p-2 short:pt-3 ${giro} hover:rotate-0 transition-transform ${locked ? 'opacity-75 grayscale-[0.5]' : ''}`}
    >
      <Percevejo className="-top-2 left-1/2 -translate-x-1/2" cor={locked ? '#8A8A8A' : done ? '#3FA34D' : '#E5484D'} />
      <div className={`absolute top-0 left-0 right-0 h-2.5 rounded-t-[12px] bg-gradient-to-r ${FAIXA[activity.color]}`} aria-hidden="true" />
      <span className={`absolute -top-3 -left-3 w-10 h-10 short:w-8 short:h-8 rounded-full border-[3px] border-nisia-tinta bg-gradient-to-b ${FAIXA[activity.color]} text-nisia-tinta font-display text-lg short:text-base flex items-center justify-center shadow-[0_3px_0_0_rgba(26,42,74,0.35)]`} aria-hidden="true">{indice + 1}</span>
      <div className="absolute top-2 right-2 short:top-1 short:right-1 short:hidden">
        {done && (
          <span className="inline-flex items-center gap-1 kit-ficha kit-ficha--verde text-[11px] px-2 py-0.5">
            <Icone nome="check" className="w-3.5 h-3.5" /> Feita
          </span>
        )}
        {locked && (
          <span className="inline-flex items-center gap-1 kit-ficha kit-ficha--papel text-[11px] px-2 py-0.5 text-nisia-tinta-suave">
            <Icone nome="cadeado" className="w-3.5 h-3.5" cor="#F3E4BE" /> Fechada
          </span>
        )}
      </div>
      <div className="w-full h-32 sm:h-40 short:h-10 flex items-center justify-center mb-2 short:mb-0.5 drop-shadow-[0_6px_6px_rgba(26,42,74,0.25)]">
        {locked ? (
          <>
            <span className="hidden short:block"><Icone nome="cadeado" className="w-9 h-9 text-nisia-tinta-suave" cor="#F3E4BE" /></span>
            <span className="short:hidden h-full flex items-center justify-center">{Art ? <Art /> : icone ? <Icone nome={icone} className="w-20 h-20 text-nisia-tinta" /> : null}</span>
          </>
        ) : (
          Art ? <Art /> : icone ? <Icone nome={icone} className="w-20 h-20 short:w-10 short:h-10 text-nisia-tinta" /> : null
        )}
      </div>
      <h3 className="font-display text-2xl short:text-base leading-tight text-nisia-azul-700">{activity.name}</h3>
      <p className="mt-1 font-body font-semibold text-nisia-tinta text-base short:hidden leading-tight">{activity.phrase}</p>
      {hint && <p className="mt-1 text-sm text-nisia-tinta-suave leading-snug short:hidden">{hint}</p>}
      {done && (
        <div className="mt-2 short:mt-1 flex items-center gap-2">
          <Estrelas n={estrelas} />
          <span className="font-display text-nisia-tinta">{result?.score ?? 0} pts</span>
        </div>
      )}
      <BotaoJogo
        cor={BOTAO[activity.color]}
        disabled={locked}
        onClick={onPlay}
        className="mt-3 short:mt-1 w-full max-w-[14rem] short:min-h-[34px] short:text-sm short:py-0.5"
      >
        <Icone nome="jogar" className="w-5 h-5" cor="currentColor" />
        {done ? 'Jogar de novo' : 'Jogar'}
      </BotaoJogo>
    </Painel>
  );
};

// Missão do nível (cada nível tem uma missão com o mesmo número). Os cartazes vêm dos dados da missão.
// A introdução da história (historia_nivel<N>.mp4) toca antes desta tela pelo PhaseStoryGate (App.tsx).
// level 0 = /missions; level 1 = /nivel1 (liberado quando a Missão 0 termina).
export const MissionBriefingScreen: React.FC<{ level?: 0 | 1 | 2 }> = ({ level = 0 }) => {
  const navigate = useNavigate();
  const { currentPlayer, quizResult, flashcardResult, activityResults, level0Completed, level1Completed, progressLoaded } = useGame();
  const [grade, setGrade] = useState<SchoolGrade | null>(() => getPlayerGrade(currentPlayer));
  const [choosingGrade, setChoosingGrade] = useState<boolean>(false);

  if (!currentPlayer || !progressLoaded) return null; // redirect handled by <RequirePlayer>
  if (level === 1 && !level0Completed) return <Navigate to="/missions" replace />;
  if (level === 2 && !level1Completed) return <Navigate to="/nivel1" replace />;

  const levelData = level === 2 ? LEVEL2 : level === 1 ? LEVEL1 : LEVEL0;
  const mission = levelData.mission;
  const level2Results = Object.fromEntries(LEVEL2.mission.activities.map(a => [a.id, activityResults[a.id] ?? null]));
  const progress = level === 2
    ? getMissionProgress(LEVEL2, level2Results, grade !== null)
    : level === 1
      ? getMissionProgress(LEVEL1, activityResults, grade !== null)
      : getMissionProgress(LEVEL0, level0Results(quizResult, flashcardResult, grade), grade !== null);
  const isBlue = currentPlayer.team === 'blue';
  const showGradeChooser = grade === null || choosingGrade;
  const count = progress.activities.length;
  const gridCols = count >= 4 ? 'sm:grid-cols-2 xl:grid-cols-4 short:grid-cols-4' : count >= 2 ? 'sm:grid-cols-2' : '';

  const hintFor = (mechanic: Mechanic, hint?: string): string | undefined => {
    if (!grade) return 'Escolha sua série para liberar.';
    if (level >= 1) return hint;
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

  // Fala do anfitrião conforme o momento.
  const fala = !grade
    ? { texto: `Olá, ${currentPlayer.displayName}! Em que série você está?`, traducao: 'Hello! What grade are you in?' }
    : progress.isCompleted
      ? { texto: `Missão ${mission.number} completa, ${currentPlayer.displayName}! Parabéns!`, traducao: 'Mission complete! Congratulations!' }
      : { texto: `Sua missão: ${mission.title}. Vamos lá!`, traducao: "Your mission. Let's go!" };

  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col">
      <Cenario nome={CENARIO_NIVEL[level]} escurecer={0.18} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={levelData.number} />

        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 py-4 short:py-0.5 grid grid-cols-1 wide:grid-cols-[15rem_1fr] short:grid-cols-[9rem_1fr] gap-4 short:gap-2 items-end">
          {/* Anfitrião do nível */}
          <div className="hidden wide:flex short:flex items-end justify-start">
            <Anfitriao nome={ANFITRIAO_NIVEL[level]} fala={fala.texto} traducao={fala.traducao} lado="esq" altura="h-[22rem] short:h-32" className="wide:mb-10 short:mb-0" />
          </div>

          <div className="flex flex-col gap-3 short:gap-1.5 pb-4 short:pb-1">
            {/* Título e fichas */}
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <Titulo nivel={1} className="text-4xl sm:text-5xl short:text-2xl leading-none">Missão {mission.number}</Titulo>
                {mission.title.trim().toLowerCase() !== `missão ${mission.number}` && (
                  <p className="mt-2 short:mt-1 inline-block kit-placa px-7 py-1.5 short:px-6 short:py-0.5 font-display text-lg sm:text-xl short:text-sm -rotate-1">{mission.title}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 short:gap-1 short:[&_.kit-ficha]:text-[11px] short:[&_.kit-ficha]:py-0.5">
                <Ficha cor={isBlue ? 'azul' : 'roxo'}><Icone nome="escudo" className="w-4 h-4" cor={isBlue ? '#A9CDFF' : '#EDE3FF'} /> {isBlue ? 'Equipe Azul' : 'Equipe Roxa'} · {currentPlayer.className}</Ficha>
                {grade && !choosingGrade && (
                  <button type="button" onClick={() => { audioService.playClick(); setChoosingGrade(true); }} className="kit-ficha kit-ficha--sol" title="Trocar de série">
                    <Icone nome="chapeu" className="w-4 h-4" cor="#0C2A66" /> {GRADE_LABELS[grade]} <span className="text-[10px] opacity-70">trocar</span>
                  </button>
                )}
                <Ficha cor="papel">{progress.completedCount} / {progress.total} feitas</Ficha>
              </div>
            </div>
            <Fita frac={progress.total ? progress.completedCount / progress.total : 0} rotulo="Progresso da missão" className="max-w-md short:hidden" />

            {/* Escolha da série: placa de madeira */}
            {showGradeChooser && (
              <Painel tipo="placa" className="p-4 short:p-2 text-center animate-rise-in">
                <p className="font-display text-2xl short:text-lg">{grade ? 'Trocar de série' : 'Em que série você está?'}</p>
                <p className="text-sm short:hidden opacity-90">As atividades do Nível {levelData.number} mudam de acordo com a sua série.</p>
                <div className="mt-3 short:mt-1.5 grid grid-cols-4 gap-2 max-w-xl mx-auto">
                  {SCHOOL_GRADES.map((g) => (
                    <BotaoJogo key={g} cor={grade === g ? 'sol' : 'papel'} onClick={() => chooseGrade(g)} className="short:min-h-[36px] short:text-sm">
                      {GRADE_LABELS[g]}
                    </BotaoJogo>
                  ))}
                </div>
                {grade && (
                  <button type="button" onClick={() => setChoosingGrade(false)} className="mt-2 text-sm font-semibold underline">Cancelar</button>
                )}
              </Painel>
            )}

            {/* Cartazes das atividades */}
            <div className={`grid grid-cols-1 ${gridCols} gap-4 short:gap-2 w-full`}>
              {progress.activities.map((item, i) => (
                <Cartaz key={item.activity.id} item={item} indice={i} hint={hintFor(item.activity.mechanic, item.activity.hint)} onPlay={() => goTo(item.activity.path)} />
              ))}
            </div>

            {progress.isCompleted && level === 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3 short:gap-2">
                <BotaoJogo cor="verde" onClick={() => goTo('/results/final')}><Icone nome="trofeu" className="w-5 h-5" /> Ver resultado</BotaoJogo>
                <BotaoJogo cor="laranja" onClick={() => goTo('/nivel1')}>Ir para o Nível 1 <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
              </div>
            )}
            {progress.isCompleted && level === 1 && (
              <div className="flex flex-wrap items-center justify-center gap-3 short:gap-2">
                <BotaoJogo cor="papel" onClick={() => goTo('/missions')}>Voltar ao Nível 0</BotaoJogo>
                <BotaoJogo cor="laranja" onClick={() => goTo('/nivel2')}>Ir para o Nível 2 <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
              </div>
            )}
            {progress.isCompleted && level === 2 && (
              <div className="flex flex-wrap items-center justify-center gap-3 short:gap-2">
                <BotaoJogo cor="papel" onClick={() => goTo('/nivel1')}>Voltar ao Nível 1</BotaoJogo>
                <BotaoJogo cor="laranja" onClick={() => goTo('/mapa')}><Icone nome="mapa" className="w-5 h-5" /> Ver o mapa</BotaoJogo>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
