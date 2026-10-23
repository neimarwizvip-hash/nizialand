import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Zap,
  Flame,
  ChevronLeft,
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  BookOpen,
  Check,
  X,
  Scissors,
  Clock,
  Languages,
  House,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import { soundEffects, audioService } from '../../services/audio';
import { speechService } from '../../services/speech';
import {
  GRADES,
  GradeId,
  TopicInfo,
  RoundQuestion,
  buildRound,
  countByTopic,
  getBestScore,
  saveBestScore,
  topicsForGrade,
} from '../../data/questionBank';

type Stage = 'grade' | 'topics' | 'countdown' | 'play' | 'result';

const QUESTION_TIME = 20;
const ROUND_SIZE = 10;
const MAX_LIVES = 3;
const MAX_TOPICS = 2;

// Cores e formas no estilo game show, uma para cada alternativa
const OPTION_STYLES = [
  { shape: '▲', key: 'A', bg: 'from-rose-500 to-rose-700', ring: 'ring-rose-300', shadow: 'shadow-[0_6px_0_#881337]' },
  { shape: '◆', key: 'B', bg: 'from-sky-500 to-blue-700', ring: 'ring-sky-300', shadow: 'shadow-[0_6px_0_#1e3a8a]' },
  { shape: '●', key: 'C', bg: 'from-amber-400 to-orange-600', ring: 'ring-amber-200', shadow: 'shadow-[0_6px_0_#9a3412]' },
  { shape: '■', key: 'D', bg: 'from-emerald-500 to-green-700', ring: 'ring-emerald-300', shadow: 'shadow-[0_6px_0_#14532d]' },
];

const RANKS = [
  { min: 0, title: 'Rookie', emoji: '🥚' },
  { min: 500, title: 'Apprentice', emoji: '🐣' },
  { min: 1000, title: 'Word Warrior', emoji: '⚔️' },
  { min: 1500, title: 'Grammar Hero', emoji: '🦸' },
  { min: 2200, title: 'English Legend', emoji: '👑' },
];

const rankFor = (score: number) => [...RANKS].reverse().find((r) => score >= r.min) || RANKS[0];
const comboMultiplier = (streak: number) => (streak >= 5 ? 3 : streak >= 3 ? 2 : 1);

interface AnswerLog {
  question: RoundQuestion;
  chosen: number | null; // null = tempo esgotado
  correct: boolean;
  points: number;
}

export const ArcadeLevel0Screen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer } = useGame();
  const playerName = currentPlayer?.displayName || 'Visitante';

  const [stage, setStage] = useState<Stage>('grade');
  const [grade, setGrade] = useState<GradeId | null>(null);
  const [topics, setTopics] = useState<string[]>([]);

  // Partida
  const [round, setRound] = useState<RoundQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hidden, setHidden] = useState<number[]>([]);
  const [used5050, setUsed5050] = useState(false);
  const [usedTime, setUsedTime] = useState(false);
  const [showPt, setShowPt] = useState(false);
  const [popup, setPopup] = useState<{ text: string; good: boolean; id: number } | null>(null);
  const [log, setLog] = useState<AnswerLog[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [newRecord, setNewRecord] = useState(false);

  const current = round[index];
  const gradeInfo = GRADES.find((g) => g.id === grade);
  const gradeTopics = useMemo(() => (grade ? topicsForGrade(grade) : []), [grade]);
  const recordKey = `${grade}|${[...topics].sort().join('+')}`;

  // ─── Fluxo de seleção ───
  const pickGrade = (g: GradeId) => {
    soundEffects.cardFlip();
    setGrade(g);
    setTopics([]);
    setStage('topics');
  };

  const toggleTopic = (id: string) => {
    soundEffects.buttonClick();
    setTopics((prev) => {
      if (prev.includes(id)) return prev.filter((t) => t !== id);
      if (prev.length >= MAX_TOPICS) return [prev[1], id];
      return [...prev, id];
    });
  };

  const startRound = () => {
    if (topics.length === 0) return;
    const questions = buildRound(topics, ROUND_SIZE);
    if (questions.length === 0) return;
    setRound(questions);
    setIndex(0);
    setLives(MAX_LIVES);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLog([]);
    setUsed5050(false);
    setUsedTime(false);
    setNewRecord(false);
    resetQuestionState();
    setCountdown(3);
    setStage('countdown');
    soundEffects.levelUp();
  };

  const resetQuestionState = () => {
    setTimeLeft(QUESTION_TIME);
    setChosen(null);
    setRevealed(false);
    setHidden([]);
    setShowPt(false);
  };

  // ─── Contagem 3-2-1 ───
  useEffect(() => {
    if (stage !== 'countdown') return;
    if (countdown === 0) {
      const t = setTimeout(() => setStage('play'), 600);
      return () => clearTimeout(t);
    }
    audioService.playTick();
    const t = setTimeout(() => setCountdown((c) => c - 1), 750);
    return () => clearTimeout(t);
  }, [stage, countdown]);

  // ─── Relógio da questão ───
  useEffect(() => {
    if (stage !== 'play' || revealed) return;
    if (timeLeft <= 0) {
      handleAnswer(null);
      return;
    }
    if (timeLeft <= 5) audioService.playTick();
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, timeLeft, revealed]);

  const finishRound = useCallback(
    (finalScore: number, cleared: boolean) => {
      const record = saveBestScore(recordKey, finalScore);
      setNewRecord(record && finalScore > 0);
      setStage('result');
      if (cleared) soundEffects.fanfare();
      else soundEffects.incorrect();
      if (cleared && finalScore > 0) {
        confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
      }
    },
    [recordKey]
  );

  const handleAnswer = (optionIndex: number | null) => {
    if (!current || revealed) return;
    const correct = optionIndex === current.correctIndex;
    setChosen(optionIndex);
    setRevealed(true);

    let points = 0;
    if (correct) {
      const nextStreak = streak + 1;
      const mult = comboMultiplier(nextStreak);
      points = (100 + Math.round((timeLeft / QUESTION_TIME) * 50)) * mult;
      setStreak(nextStreak);
      setMaxStreak((m) => Math.max(m, nextStreak));
      setScore((s) => s + points);
      setPopup({ text: mult > 1 ? `+${points}  COMBO x${mult}!` : `+${points}`, good: true, id: Date.now() });
      soundEffects.correct();
      if (mult > 1) {
        soundEffects.combo(mult);
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.4 } });
      }
    } else {
      setStreak(0);
      setLives((l) => l - 1);
      setPopup({ text: optionIndex === null ? 'TIME UP!' : 'OOPS!', good: false, id: Date.now() });
      soundEffects.incorrect();
    }
    setLog((prev) => [...prev, { question: current, chosen: optionIndex, correct, points }]);
  };

  const goNext = () => {
    soundEffects.buttonClick();
    const outOfLives = lives <= 0;
    const last = index >= round.length - 1;
    if (outOfLives || last) {
      finishRound(score, !outOfLives);
      return;
    }
    setIndex((i) => i + 1);
    resetQuestionState();
  };

  // ─── Poderes ───
  const use5050 = () => {
    if (used5050 || revealed || !current) return;
    soundEffects.levelUp();
    const wrong = current.shuffled.map((_, i) => i).filter((i) => i !== current.correctIndex);
    const remove = wrong.sort(() => Math.random() - 0.5).slice(0, Math.max(0, current.shuffled.length - 2));
    setHidden(remove);
    setUsed5050(true);
  };

  const useExtraTime = () => {
    if (usedTime || revealed) return;
    soundEffects.levelUp();
    setTimeLeft((t) => t + 10);
    setUsedTime(true);
  };

  // ─── Teclado: 1-4 ou A-D respondem, Enter avança ───
  useEffect(() => {
    if (stage !== 'play') return;
    const onKey = (e: KeyboardEvent) => {
      if (revealed && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        goNext();
        return;
      }
      const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
      const idx = map[e.key.toLowerCase()];
      if (idx !== undefined && current && idx < current.shuffled.length && !hidden.includes(idx)) handleAnswer(idx);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (!popup) return;
    const t = setTimeout(() => setPopup(null), 1300);
    return () => clearTimeout(t);
  }, [popup]);

  const correctCount = log.filter((l) => l.correct).length;
  const accuracy = log.length ? Math.round((correctCount / round.length) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
  const rank = rankFor(score);

  // ─── Render ───
  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-200 text-slate-900">
      <ArcadeBackdrop hue={gradeInfo?.gradient} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-5 sm:py-8">
        {/* Barra superior */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <button
            onClick={() => {
              soundEffects.buttonClick();
              if (stage === 'topics') setStage('grade');
              else if (stage === 'grade') navigate('/');
              else setStage('topics');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/85 hover:bg-white border-2 border-white text-sky-800 shadow-md text-sm font-heading font-black uppercase tracking-wider backdrop-blur-md transition"
          >
            <ChevronLeft className="w-4 h-4" />
            {stage === 'grade' ? 'Menu' : stage === 'topics' ? 'Séries' : 'Sair'}
          </button>
          <div className="text-center">
            <div className="text-[10px] sm:text-xs tracking-[0.3em] text-sky-800 font-black">NISIALAND ARCADE</div>
            <div className="font-[Bungee] text-xl sm:text-3xl text-amber-500 [text-shadow:0_2px_0_#fff,0_4px_10px_rgba(180,83,9,0.35)]">
              TREINO LIVRE
            </div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/85 border-2 border-white text-slate-800 shadow-md text-xs sm:text-sm font-heading font-bold backdrop-blur-md max-w-[40%] truncate">
            🎮 {playerName}
          </div>
        </div>

        {stage === 'grade' && (
          <section className="animate-rise-in">
            <h2 className="text-center font-heading font-black text-2xl sm:text-4xl mb-1 game-title">Escolha sua série</h2>
            <p className="text-center text-sky-900 font-semibold mb-6 text-sm sm:text-base">Cada série tem seus próprios desafios. Choose your level, player!</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {GRADES.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => pickGrade(g.id)}
                  style={{ animationDelay: `${i * 80}ms` }}
                  className={`animate-rise-in group relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br ${g.gradient} shadow-[0_6px_0_0_rgba(15,23,42,0.25)] hover:-translate-y-1 active:translate-y-1 active:shadow-[0_2px_0_0_rgba(15,23,42,0.25)] transition-transform ${
                    i === GRADES.length - 1 ? 'col-span-2 sm:col-span-1' : ''
                  }`}
                >
                  <div className="rounded-[20px] bg-white/10 group-hover:bg-white/0 text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.25)] transition px-3 py-5 sm:py-7 h-full flex flex-col items-center">
                    <span className="text-4xl sm:text-5xl mb-2 group-hover:animate-bounce">{g.emoji}</span>
                    <span className="font-[Bungee] text-3xl sm:text-4xl">{g.short}</span>
                    <span className="font-heading font-black text-sm sm:text-base mt-1">{g.label}</span>
                    <span className="mt-2 text-[10px] tracking-[0.25em] uppercase text-white/90 font-black">{g.tagline}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                soundEffects.buttonClick();
                navigate('/historia');
              }}
              className="mt-8 w-full group flex items-center gap-4 rounded-3xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-white to-sky-50 shadow-[0_6px_0_0_#f59e0b] p-4 sm:p-5 text-left hover:border-amber-400 hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_0_#f59e0b] transition"
            >
              <img src="/assets/nisialand_institutional_characters.jpg" alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-300/70" />
              <div className="flex-1">
                <div className="text-[10px] tracking-[0.25em] text-amber-600 font-black">MODO HISTÓRIA</div>
                <div className="font-heading font-black text-lg sm:text-xl">Missões NISIALAND: Turmas 801 a 804</div>
                <div className="text-xs sm:text-sm text-slate-600">HQ com o Diretor Márcio, cadastro na equipe, Missão 1 (comparativos) e Missão 2 (flashcards) com ranking.</div>
              </div>
              <BookOpen className="w-7 h-7 text-amber-500 group-hover:translate-x-1 transition" />
            </button>
          </section>
        )}

        {stage === 'topics' && gradeInfo && (
          <section className="animate-rise-in">
            <div className="flex items-center justify-center gap-3 mb-1">
              <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${gradeInfo.gradient} font-black text-sm`}>
                {gradeInfo.emoji} {gradeInfo.label}
              </span>
            </div>
            <h2 className="text-center font-heading font-black text-2xl sm:text-4xl mb-1 game-title">Escolha até 2 tópicos</h2>
            <p className="text-center text-sky-900 font-semibold mb-6 text-sm sm:text-base">
              Misture dois assuntos para uma partida mais desafiadora.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {gradeTopics.map((t, i) => (
                <TopicCard key={t.id} topic={t} delay={i * 70} selected={topics.includes(t.id)} order={topics.indexOf(t.id)} onClick={() => toggleTopic(t.id)} />
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 game-panel p-4">
              <div className="text-sm text-slate-700 font-semibold text-center sm:text-left">
                <div className="flex items-center gap-4 justify-center sm:justify-start">
                  <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> 3 vidas</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-sky-600" /> {QUESTION_TIME}s</span>
                  <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> combo até x3</span>
                </div>
                {topics.length > 0 && getBestScore(recordKey) > 0 && (
                  <div className="mt-1 text-amber-600 font-bold">🏆 Seu recorde nesta combinação: {getBestScore(recordKey)}</div>
                )}
              </div>
              <button
                disabled={topics.length === 0}
                onClick={startRound}
                className="btn-shine relative overflow-hidden flex items-center gap-2 px-8 py-4 rounded-full font-heading font-black text-xl tracking-widest uppercase text-slate-950 bg-gradient-to-b from-amber-300 to-amber-500 border-4 border-amber-600 shadow-[0_6px_0_0_#b45309] active:translate-y-1 active:shadow-[0_2px_0_0_#b45309] transition disabled:opacity-40 disabled:active:translate-y-0 disabled:cursor-not-allowed"
              >
                <Play className="w-6 h-6 fill-slate-950" /> Jogar
              </button>
            </div>
          </section>
        )}

        {stage === 'countdown' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-sm tracking-[0.4em] text-sky-800 font-black mb-4">GET READY, {playerName.toUpperCase()}!</div>
            <div key={countdown} className="font-[Bungee] text-[8rem] sm:text-[12rem] leading-none animate-countdown-pop text-amber-500 [text-shadow:0_6px_0_#fff,0_12px_30px_rgba(180,83,9,0.45)]">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
          </div>
        )}

        {stage === 'play' && current && (
          <section>
            {/* HUD */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-1" aria-label={`${lives} vidas`}>
                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 ${i < lives ? 'text-rose-500 fill-rose-500 drop-shadow-[0_2px_0_#fff]' : 'text-slate-400/60 scale-75'}`}
                  />
                ))}
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full font-black text-sm transition ${streak >= 3 ? 'bg-orange-500 text-white animate-pulse shadow-md' : 'bg-white/85 text-slate-800 shadow-md'}`}>
                <Flame className="w-4 h-4" /> {streak} {comboMultiplier(streak) > 1 && <span>x{comboMultiplier(streak)}</span>}
              </div>
              <div className="font-[Bungee] text-xl sm:text-2xl text-amber-500 tabular-nums [text-shadow:0_2px_0_#fff]">{score.toString().padStart(5, '0')}</div>
            </div>

            {/* Progresso */}
            <div className="flex gap-1 mb-4">
              {round.map((_, i) => {
                const entry = log[i];
                return (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      entry ? (entry.correct ? 'bg-emerald-400' : 'bg-rose-500') : i === index ? 'bg-amber-300 animate-pulse' : 'bg-white/70'
                    }`}
                  />
                );
              })}
            </div>

            <div className="relative grid lg:grid-cols-[1fr_auto] gap-4 items-start">
              {/* Cartão da pergunta */}
              <div key={current.id} className="animate-rise-in [animation-duration:0.45s] game-panel text-slate-900 p-5 sm:p-7">
                <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-black tracking-widest uppercase text-slate-500">
                    Question {index + 1}/{round.length} · {gradeTopics.find((t) => t.id === current.topic)?.title}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => speechService.speak(current.prompt.replace(/_+/g, 'blank'), 'en-US')}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-cyan-100 text-cyan-700 transition"
                      title="Ouvir em inglês"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {current.promptPt && (
                      <button
                        onClick={() => setShowPt((v) => !v)}
                        className={`p-2 rounded-xl transition ${showPt ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 hover:bg-amber-100 text-amber-700'}`}
                        title="Ver em português"
                      >
                        <Languages className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="font-heading font-black text-xl sm:text-3xl leading-snug">{current.prompt}</h3>
                {showPt && current.promptPt && <p className="mt-2 text-slate-500 font-semibold">{current.promptPt}</p>}
              </div>

              {/* Relógio e poderes */}
              <div className="flex lg:flex-col items-center justify-center gap-3">
                <TimerRing seconds={timeLeft} total={QUESTION_TIME} />
                <button
                  onClick={use5050}
                  disabled={used5050 || revealed}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 border-2 border-purple-300/50 font-black text-sm disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Elimina duas alternativas erradas (1 vez por partida)"
                >
                  <Scissors className="w-4 h-4" /> 50/50
                </button>
                <button
                  onClick={useExtraTime}
                  disabled={usedTime || revealed}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-300/50 font-black text-sm disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Ganhe 10 segundos (1 vez por partida)"
                >
                  <Zap className="w-4 h-4" /> +10s
                </button>
              </div>

              {popup && (
                <div
                  key={popup.id}
                  className={`pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 z-20 font-[Bungee] text-3xl sm:text-5xl whitespace-nowrap animate-score-pop ${
                    popup.good ? 'text-emerald-500 [text-shadow:0_3px_0_#fff,0_0_20px_rgba(16,185,129,0.6)]' : 'text-rose-500 [text-shadow:0_3px_0_#fff,0_0_20px_rgba(244,63,94,0.6)]'
                  }`}
                >
                  {popup.text}
                </div>
              )}
            </div>

            {/* Alternativas */}
            <div className="grid sm:grid-cols-2 gap-3 mt-5">
              {current.shuffled.map((opt, i) => {
                const style = OPTION_STYLES[i % OPTION_STYLES.length];
                const isCorrect = i === current.correctIndex;
                const isChosen = chosen === i;
                const isHidden = hidden.includes(i);
                let state = '';
                if (revealed) {
                  if (isCorrect) state = 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-sky-100 scale-[1.02] brightness-110';
                  else if (isChosen) state = 'opacity-80 animate-shake grayscale';
                  else state = 'opacity-30';
                }
                return (
                  <button
                    key={`${current.id}-${i}`}
                    onClick={() => handleAnswer(i)}
                    disabled={revealed || isHidden}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className={`${revealed ? '' : 'animate-rise-in'} relative flex items-center gap-3 rounded-2xl px-4 py-4 sm:py-5 text-left bg-gradient-to-b ${style.bg} ${style.shadow} text-white font-heading font-black text-base sm:text-lg transition-all active:translate-y-1 active:shadow-none hover:brightness-110 disabled:cursor-default ${state} ${
                      isHidden ? 'invisible' : ''
                    }`}
                  >
                    <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-black/25 flex items-center justify-center text-lg">{style.shape}</span>
                    <span className="flex-1">{opt}</span>
                    {revealed && isCorrect && <Check className="w-7 h-7 flex-shrink-0" />}
                    {revealed && isChosen && !isCorrect && <X className="w-7 h-7 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explicação */}
            {revealed && (
              <div className="animate-rise-in [animation-duration:0.4s] mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 game-panel !rounded-2xl p-4">
                <div className="flex-1">
                  <div className={`font-black text-sm tracking-widest ${log[log.length - 1]?.correct ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {log[log.length - 1]?.correct ? 'CORRECT! 🎉' : chosen === null ? 'TEMPO ESGOTADO ⏰' : 'NOT QUITE… 💡'}
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base">
                    {!log[log.length - 1]?.correct && (
                      <>
                        Resposta certa: <strong className="text-slate-900">{current.options[0]}</strong>.{' '}
                      </>
                    )}
                    {current.explanation}
                  </p>
                </div>
                <button
                  onClick={goNext}
                  autoFocus
                  className="px-6 py-3 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 font-heading font-black uppercase tracking-wider border-2 border-amber-600 shadow-[0_6px_0_0_#b45309] active:translate-y-1 active:shadow-[0_2px_0_0_#b45309] transition"
                >
                  {lives <= 0 ? 'Ver resultado' : index >= round.length - 1 ? 'Finalizar' : 'Próxima ▶'}
                </button>
              </div>
            )}
          </section>
        )}

        {stage === 'result' && (
          <section className="animate-rise-in max-w-2xl mx-auto text-center">
            <div className={`font-[Bungee] text-4xl sm:text-6xl mb-2 ${lives <= 0 ? 'text-rose-500 [text-shadow:0_4px_0_#fff]' : 'text-amber-500 [text-shadow:0_4px_0_#fff,0_8px_24px_rgba(180,83,9,0.35)]'}`}>
              {lives <= 0 ? 'GAME OVER' : 'STAGE CLEAR!'}
            </div>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  style={{ animationDelay: `${s * 250}ms` }}
                  className={`text-5xl sm:text-6xl animate-star-in ${s <= stars ? 'drop-shadow-[0_3px_0_#fff]' : 'grayscale opacity-40'}`}
                >
                  ⭐
                </span>
              ))}
            </div>
            {newRecord && (
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black tracking-widest animate-pulse">🏆 NOVO RECORDE!</div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <Stat label="Pontos" value={score.toString()} />
              <Stat label="Acertos" value={`${correctCount}/${round.length}`} />
              <Stat label="Maior combo" value={`${maxStreak}🔥`} />
              <Stat label="Recorde" value={getBestScore(recordKey).toString()} />
            </div>

            <div className="mb-6 rounded-3xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white border-[3px] border-blue-700 shadow-[0_6px_0_0_#1e3a8a] p-4">
              <div className="text-xs tracking-[0.3em] text-sky-100 font-black">SEU TÍTULO</div>
              <div className="font-heading font-black text-2xl sm:text-3xl">
                {rank.emoji} {rank.title}
              </div>
            </div>

            {log.some((l) => !l.correct) && (
              <div className="text-left mb-6 game-panel p-4">
                <div className="font-heading font-black text-amber-600 mb-2">📚 Revise o que errou</div>
                <ul className="space-y-2 text-sm">
                  {log.filter((l) => !l.correct).map((l) => (
                    <li key={l.question.id} className="border-b border-slate-200 pb-2">
                      <div className="text-slate-700">{l.question.prompt}</div>
                      <div className="text-emerald-600 font-bold">✔ {l.question.options[0]}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={startRound} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 font-heading font-black uppercase border-2 border-amber-600 shadow-[0_6px_0_0_#b45309] active:translate-y-1 active:shadow-[0_2px_0_0_#b45309] transition">
                <RotateCcw className="w-5 h-5" /> Jogar de novo
              </button>
              <button onClick={() => setStage('topics')} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-sky-50 text-blue-800 border-2 border-sky-300 shadow-[0_4px_0_0_#7dd3fc] active:translate-y-1 active:shadow-[0_1px_0_0_#7dd3fc] font-heading font-black uppercase transition">
                <Layers className="w-5 h-5" /> Trocar tópicos
              </button>
              <button onClick={() => navigate('/leaderboard')} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-sky-50 text-blue-800 border-2 border-sky-300 shadow-[0_4px_0_0_#7dd3fc] active:translate-y-1 active:shadow-[0_1px_0_0_#7dd3fc] font-heading font-black uppercase transition">
                <Trophy className="w-5 h-5" /> Ranking
              </button>
              <button onClick={() => navigate('/')} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-sky-50 text-blue-800 border-2 border-sky-300 shadow-[0_4px_0_0_#7dd3fc] active:translate-y-1 active:shadow-[0_1px_0_0_#7dd3fc] font-heading font-black uppercase transition">
                <House className="w-5 h-5" /> Menu
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// ─── Componentes auxiliares ───

const TopicCard: React.FC<{ topic: TopicInfo; selected: boolean; order: number; delay: number; onClick: () => void }> = ({ topic, selected, order, delay, onClick }) => {
  const count = countByTopic(topic.id);
  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={`animate-rise-in relative flex items-center gap-4 rounded-3xl p-4 text-left border-2 backdrop-blur-md transition-all active:scale-95 ${
        selected ? 'bg-amber-50 border-amber-400 shadow-[0_6px_0_rgba(217,119,6,0.35)] scale-[1.02]' : 'bg-white/85 border-white shadow-[0_6px_0_rgba(2,132,199,0.18)] hover:border-sky-300 hover:-translate-y-0.5'
      }`}
    >
      <span className="text-4xl">{topic.emoji}</span>
      <div className="flex-1">
        <div className="font-heading font-black text-lg leading-tight text-sky-950">{topic.title}</div>
        <div className="text-sm text-slate-600">{topic.titlePt}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{count} questões</div>
      </div>
      <span className={`w-9 h-9 rounded-full flex items-center justify-center font-black border-2 ${selected ? 'bg-amber-400 text-slate-950 border-amber-200' : 'border-slate-300 text-transparent'}`}>
        {selected ? order + 1 : '·'}
      </span>
    </button>
  );
};

const TimerRing: React.FC<{ seconds: number; total: number }> = ({ seconds, total }) => {
  const r = 30;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, seconds / total));
  const color = seconds <= 5 ? '#e11d48' : seconds <= 10 ? '#f59e0b' : '#0284c7';
  return (
    <div className={`relative w-20 h-20 rounded-full shadow-lg ${seconds <= 5 ? 'animate-pulse' : ''}`} aria-label={`${seconds} segundos`}>
      <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
        <circle cx="36" cy="36" r={r} stroke="rgba(2,132,199,0.15)" strokeWidth="7" fill="#ffffff" />
        <circle
          cx="36"
          cy="36"
          r={r}
          stroke={color}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-[Bungee] text-2xl" style={{ color }}>
        {seconds}
      </span>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-2xl bg-white border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd] p-3">
    <div className="text-[10px] tracking-[0.2em] uppercase text-slate-500 font-black">{label}</div>
    <div className="font-[Bungee] text-xl sm:text-2xl text-sky-900">{value}</div>
  </div>
);

const ArcadeBackdrop: React.FC<{ hue?: string }> = ({ hue }) => {
  const dots = useRef(
    Array.from({ length: 26 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 3 + Math.random() * 6,
      duration: 10 + Math.random() * 12,
      delay: -Math.random() * 20,
      color: ['#fbbf24', '#ffffff', '#38bdf8', '#f472b6'][i % 4],
    }))
  ).current;
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-200 to-sky-50" />
      <img src="/assets/nisialand_school_facade_clean.jpg" alt="" className="absolute inset-x-0 bottom-0 w-full h-[55%] object-cover object-top opacity-35 [mask-image:linear-gradient(to_bottom,transparent,black_40%)]" />
      <div className={`absolute inset-0 bg-gradient-to-br ${hue || 'from-sky-300 to-indigo-300'} opacity-15 transition-all duration-700`} />
      <div className="sky-clouds absolute inset-x-0 top-0 h-64" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/50" />
      
      {dots.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
