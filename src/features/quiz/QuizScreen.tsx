import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Volume2, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Shield, 
  BookOpen, 
  Eye, 
  EyeOff,
  Flame,
  Award,
  Star
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { READING_TEXT, shuffleArray } from '../../data/quizQuestions';
import { getQuizSession } from '../../data/level0Content';
import { getPlayerGrade } from '../../services/grade';
import { ZeCartinha } from '../../components/ze/ZeCartinha';
import { QuizQuestion, QuizQuestionAttempt, QuizResult } from '../../types';
import { audioService } from '../../services/audio';
import { speechService } from '../../services/speech';
import { fireConfetti } from '../../components/ui/ConfettiEffect';
import { GameHeader } from '../../components/layout/GameHeader';

export const QuizScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer: maybePlayer, saveQuizResult } = useGame();
  // Guaranteed by <RequirePlayer> in App routes
  const currentPlayer = maybePlayer!;

  // Real quiz start time
  const startedAtRef = useRef<string>(new Date().toISOString());
  // O desafio só começa depois da entrada do Zé Cartinha.
  const [zeIntroPhase, setZeIntroPhase] = useState<'challenge' | 'grow' | 'card' | 'dismissed'>('challenge');
  const [zeIntroSeconds, setZeIntroSeconds] = useState<number>(5);
  const quizIsStarting = zeIntroPhase !== 'dismissed';
  const introCardVisible = zeIntroPhase === 'card';

  useEffect(() => {
    if (zeIntroPhase === 'dismissed') {
      startedAtRef.current = new Date().toISOString();
      return;
    }

    if (zeIntroPhase === 'grow') {
      const timer = window.setTimeout(() => setZeIntroPhase('card'), 850);
      return () => window.clearTimeout(timer);
    }

    if (zeIntroPhase === 'challenge') {
      const timer = window.setTimeout(() => {
        if (zeIntroSeconds <= 0) setZeIntroPhase('grow');
        else setZeIntroSeconds((seconds) => seconds - 1);
      }, 1000);
      return () => window.clearTimeout(timer);
    }
  }, [zeIntroPhase, zeIntroSeconds]);

  const handleDismissIntroZe = () => {
    audioService.playClick();
    setZeIntroPhase('dismissed');
  };

  // Duck music volume on quiz mount for concentration, restore on unmount
  useEffect(() => {
    audioService.duckVolume(true);
    return () => {
      audioService.duckVolume(false);
    };
  }, []);

  // Randomized questions & options session (order of questions + order of options are shuffled)
  // Série do aluno: 8º mantém o quiz de comparativos; 6º, 7º e 9º sorteiam do banco de questões.
  const [sessionQuestions] = useState<QuizQuestion[]>(() => getQuizSession(getPlayerGrade(currentPlayer) ?? '8'));

  // Zé Cartinha aparece em 2 ou 3 perguntas sorteadas chamando para o bafo.
  // Fechar rápido ("Agora não, Zé!") e acertar a pergunta vale +10.
  const [zeQuestions] = useState<number[]>(() => {
    const count = Math.random() < 0.5 ? 2 : 3;
    const candidates = sessionQuestions.map((_, i) => i).slice(1);
    return shuffleArray(candidates).slice(0, count);
  });
  const [zeVisible, setZeVisible] = useState<boolean>(false);
  const [zeBonusArmed, setZeBonusArmed] = useState<boolean>(false);
  const [zeToast, setZeToast] = useState<string | null>(null);
  const zeShownAtRef = useRef<number>(0);
  const zeTimersRef = useRef<number[]>([]);
  // Acertos seguidos: a partir do 2º toca o som de combo.
  const streakRef = useRef<number>(0);

  // Quiz progression state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [accumulatedScore, setAccumulatedScore] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [attemptsRecord, setAttemptsRecord] = useState<Record<number, QuizQuestionAttempt>>({});
  
  // Current question interaction state
  const [attemptsUsed, setAttemptsUsed] = useState<number>(0); // 0, 1, 2
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isQuestionResolved, setIsQuestionResolved] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showReadingText, setShowReadingText] = useState<boolean>(true);
  // First-miss feedback (shake + "try again" banner)
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const [showTryAgain, setShowTryAgain] = useState<boolean>(false);
  
  // Powerups (educational helpers)
  const [fiftyFiftyLeft, setFiftyFiftyLeft] = useState<number>(2);
  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);
  const [questionSecondsLeft, setQuestionSecondsLeft] = useState<number>(30);

  const currentQ = sessionQuestions[currentIndex] || sessionQuestions[0];
  const isBlue = currentPlayer.team === 'blue';

  const clearZeTimers = () => {
    zeTimersRef.current.forEach((t) => window.clearTimeout(t));
    zeTimersRef.current = [];
  };

  // A cada pergunta: se for uma das sorteadas, o Zé entra 1,2s depois e vai embora sozinho em ~6s.
  useEffect(() => {
    clearZeTimers();
    setZeVisible(false);
    setZeBonusArmed(false);
    if (quizIsStarting) return clearZeTimers;
    if (zeQuestions.includes(currentIndex)) {
      zeTimersRef.current.push(window.setTimeout(() => {
        zeShownAtRef.current = Date.now();
        setZeVisible(true);
        zeTimersRef.current.push(window.setTimeout(() => setZeVisible(false), 6000));
      }, 1200));
    }
    return clearZeTimers;
  }, [currentIndex, quizIsStarting, zeQuestions]);

  const handleDismissZe = () => {
    audioService.playClick();
    clearZeTimers();
    setZeVisible(false);
    if (Date.now() - zeShownAtRef.current <= 3000) setZeBonusArmed(true);
  };

  // Listen to English speech
  const handlePronounce = () => {
    audioService.playClick();
    speechService.speakEnglish(currentQ.sentence);
  };

  // 50/50 Powerup
  const handleUseFiftyFifty = () => {
    if (quizIsStarting || fiftyFiftyLeft <= 0 || isQuestionResolved || attemptsUsed > 0) return;
    audioService.playPowerup();
    setFiftyFiftyLeft(prev => prev - 1);

    // Find two wrong indices to eliminate
    const wrongIndices = currentQ.optionsQuad
      .map((opt, idx) => ({ opt, idx }))
      .filter(item => !item.opt.isCorrect)
      .map(item => item.idx);
    
    // Pick two random wrong indices
    const toEliminate = shuffleArray(wrongIndices).slice(0, 2);
    setEliminatedIndices(toEliminate);
  };

  // Option selection
  const handleSelectOption = (index: number) => {
    if (quizIsStarting || zeVisible || isQuestionResolved || shakeIndex !== null || eliminatedIndices.includes(index)) return;

    const opt = currentQ.optionsQuad[index];
    const newAttemptCount = attemptsUsed + 1;
    setSelectedOptionIndex(index);
    setAttemptsUsed(newAttemptCount);

    if (opt.isCorrect) {
      // Correct!
      const bonus = zeBonusArmed ? 10 : 0;
      const points = (newAttemptCount === 1 ? 100 : 50) + bonus;
      if (bonus) {
        setZeBonusArmed(false);
        setZeToast('Ignorei o Zé! +10');
        window.setTimeout(() => setZeToast(null), 2200);
      }
      audioService.playCorrect();
      streakRef.current += 1;
      if (streakRef.current >= 2) audioService.playCombo(streakRef.current);
      fireConfetti();
      setAccumulatedScore(prev => prev + points);
      setCorrectAnswersCount(prev => prev + 1);
      setShowTryAgain(false);
      setIsQuestionResolved(true);

      setAttemptsRecord(prev => ({
        ...prev,
        [currentQ.id]: {
          questionId: currentQ.id,
          attemptsCount: newAttemptCount,
          selectedOptionIndex: index,
          isCorrect: true,
          pointsEarned: points,
          answeredAt: new Date().toISOString()
        }
      }));
    } else {
      // Wrong!
      audioService.playWrong();
      streakRef.current = 0;
      if (newAttemptCount === 1) {
        // First strike: allow second attempt for 50 pts
        setShakeIndex(index);
        setShowTryAgain(true);
        if (navigator.vibrate) navigator.vibrate(120);
        window.setTimeout(() => {
          setShakeIndex(null);
          setEliminatedIndices(prev => [...prev, index]);
        }, 550);
      } else {
        // Second strike: resolved with 0 pts
        setShowTryAgain(false);
        setIsQuestionResolved(true);
        setAttemptsRecord(prev => ({
          ...prev,
          [currentQ.id]: {
            questionId: currentQ.id,
            attemptsCount: 2,
            selectedOptionIndex: index,
            isCorrect: false,
            pointsEarned: 0,
            answeredAt: new Date().toISOString()
          }
        }));
      }
    }
  };

  const handleQuestionTimeout = () => {
    if (isQuestionResolved) return;
    audioService.playWrong();
    streakRef.current = 0;
    setShowTryAgain(false);
    setShakeIndex(null);
    setIsQuestionResolved(true);
    setAttemptsRecord(prev => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        attemptsCount: attemptsUsed,
        selectedOptionIndex: -1,
        isCorrect: false,
        pointsEarned: 0,
        answeredAt: new Date().toISOString()
      }
    }));
  };

  useEffect(() => {
    if (!quizIsStarting) setQuestionSecondsLeft(30);
  }, [currentIndex, quizIsStarting]);

  useEffect(() => {
    if (quizIsStarting || isQuestionResolved) return;

    const timer = window.setInterval(() => {
      setQuestionSecondsLeft((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          handleQuestionTimeout();
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentIndex, isQuestionResolved, quizIsStarting]);

  // Advance to next question or complete quiz
  const handleNextQuestion = async () => {
    audioService.playClick();
    if (currentIndex < sessionQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAttemptsUsed(0);
      setSelectedOptionIndex(null);
      setIsQuestionResolved(false);
      setShowHint(false);
      setEliminatedIndices([]);
      setShowTryAgain(false);
      setShakeIndex(null);
    } else {
      // Quiz Complete!
      const totalScore = accumulatedScore;
      let stars = 1;
      if (totalScore >= 900) stars = 3;
      else if (totalScore >= 600) stars = 2;

      const result: QuizResult = {
        completed: true,
        totalScore,
        correctCount: correctAnswersCount,
        stars,
        startedAt: startedAtRef.current,
        completedAt: new Date().toISOString(),
        attempts: attemptsRecord
      };

      await saveQuizResult(result);
      navigate('/quiz/results');
    }
  };

  return (
    <div className="relative min-h-screen game-sky text-slate-900 flex flex-col justify-between overflow-x-hidden">
      {/* Background: Hallway matching approved mockup */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/assets/nisialand_hallway_bg.jpg"
          alt="Corredor da Escola"
          className="w-full h-full object-cover filter brightness-[0.88]"
        />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10">
        <GameHeader />
      </div>

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 md:py-6 flex flex-col justify-center">
        
        {/* --- MAIN FLOATING QUIZ PANEL (Neon Cyan Glow as in Mockup) --- */}
        <div className="w-full game-panel p-4 sm:p-7 flex flex-col justify-between my-auto animate-fadeIn">
          
          {/* Top Panel Bar: Question progress, Score Capsule, Team Pill */}
          <div className="border-b border-cyan-500/30 pb-4 mb-4">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-blue-600/40 border border-cyan-400 text-cyan-800 font-heading font-black text-xs sm:text-sm tracking-wider uppercase shadow-game-sm">
                  QUESTION {currentIndex + 1} OF {sessionQuestions.length}
                </span>
                <span className="text-xs font-bold text-slate-600 hidden md:inline">
                  {currentQ.activityTitle}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  role="timer"
                  aria-label={`Tempo para responder: ${questionSecondsLeft} segundos`}
                  className={`px-3 py-1 rounded-full border font-heading font-black text-xs sm:text-sm shadow-sm ${
                    questionSecondsLeft <= 10
                      ? 'bg-red-100 border-red-500 text-red-700 animate-pulse'
                      : 'bg-white/90 border-sky-300 text-cyan-800'
                  }`}
                >
                  {quizIsStarting ? 'AGUARDE' : `⏱ ${questionSecondsLeft}s`}
                </div>

                {/* Score capsule */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/80 text-amber-700 font-heading font-black text-xs sm:text-sm shadow-sm">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>{accumulatedScore} PTS</span>
                </div>

                {/* Team Pill */}
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-heading font-black border shadow-sm ${
                  isBlue 
                    ? 'bg-blue-600/30 border-cyan-400 text-cyan-700' 
                    : 'bg-purple-600/30 border-purple-400 text-purple-700'
                }`}>
                  <Shield className="w-3.5 h-3.5 fill-current" />
                  <span>{isBlue ? 'BLUE' : 'PURPLE'}</span>
                </div>
              </div>
            </div>

            {/* Neon Glowing Progress Bar */}
            <div className="w-full h-2.5 bg-white/90 rounded-full overflow-hidden border border-cyan-500/40 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                style={{ width: `${((currentIndex + 1) / sessionQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Subheader: Instruction and Powerup Controls */}
          <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-3 mb-5 flex-wrap">
            <p className="text-xs sm:text-sm font-heading font-extrabold uppercase tracking-wide text-cyan-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-600 flex-shrink-0" />
              <span>{currentQ.instruction}</span>
            </p>

            <div className="flex items-center gap-2">
              {/* Listen button (Blue Neon) */}
              <button
                type="button"
                onClick={handlePronounce}
                disabled={quizIsStarting}
                title="Ouvir frase em inglês"
                className={`px-3 py-1.5 rounded-xl border text-xs font-heading font-bold flex items-center gap-1.5 transition-all shadow-sm ${quizIsStarting ? 'bg-white/95 border-sky-200 text-slate-500 cursor-not-allowed opacity-40' : 'bg-blue-600/30 hover:bg-blue-600/50 text-cyan-700 border-cyan-400 active:scale-95'}`}
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-700" />
                <span>Listen</span>
              </button>

              {/* 50/50 Button (Gold Neon) */}
              <button
                type="button"
                onClick={handleUseFiftyFifty}
                disabled={quizIsStarting || fiftyFiftyLeft <= 0 || isQuestionResolved || attemptsUsed > 0}
                title="Eliminar 2 respostas erradas"
                className={`px-3 py-1.5 rounded-xl border text-xs font-heading font-bold flex items-center gap-1.5 transition-all ${
                  !quizIsStarting && fiftyFiftyLeft > 0 && !isQuestionResolved && attemptsUsed === 0
                    ? 'bg-amber-500/20 border-amber-400 text-amber-700 hover:bg-amber-500/30 shadow-sm active:scale-95'
                    : 'bg-white/95 border-sky-200 text-slate-500 cursor-not-allowed opacity-40'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>50/50 ({fiftyFiftyLeft})</span>
              </button>

              {/* Hint button (Purple Neon) */}
              <button
                type="button"
                disabled={quizIsStarting}
                onClick={() => {
                  if (quizIsStarting) return;
                  audioService.playClick();
                  setShowHint(!showHint);
                }}
                title="Dica gramatical"
                className={`px-3 py-1.5 rounded-xl border text-xs font-heading font-bold flex items-center gap-1.5 transition-all shadow-sm ${quizIsStarting ? 'bg-white/95 border-sky-200 text-slate-500 cursor-not-allowed opacity-40' : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-800 border-purple-400 active:scale-95'}`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-purple-700" />
                <span>Hint</span>
              </button>
            </div>
          </div>

          {/* Hint Dropdown Box */}
          {showHint && (
            <div className="mb-4 p-3.5 rounded-2xl bg-purple-100/80 border-2 border-purple-400 text-purple-800 text-xs sm:text-sm animate-fadeIn">
              <strong className="text-amber-700">Grammar Tip:</strong> {currentQ.hint}
            </div>
          )}

          {/* Activity 1: VS Battle Cards (Questions 1 to 5) */}
          {currentQ.targetStudent1 && currentQ.targetStudent2 && (
            <div className="mb-5 p-3 sm:p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd] flex items-center justify-center gap-4 sm:gap-8 shadow-inner">
              {/* Student 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-3 border-cyan-400 shadow-glow-blue bg-white/95 p-1">
                    <img 
                      src={`/assets/avatar_${currentQ.targetStudent1}.jpg`}
                      alt={currentQ.targetStudent1}
                      onError={(e) => { e.currentTarget.src = '/assets/avatar_mateus.jpg'; }}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
                <span className="mt-1.5 font-heading font-black text-xs sm:text-sm capitalize text-slate-900">
                  {currentQ.targetStudent1}
                </span>
              </div>

              {/* Glowing VS Badge in center */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 flex items-center justify-center font-heading font-black text-sm text-slate-950 border-2 border-white shadow-[0_0_15px_rgba(251,191,36,0.7)] flex-shrink-0 animate-pulse">
                VS
              </div>

              {/* Student 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-3 border-purple-400 shadow-glow-purple bg-white/95 p-1">
                    <img 
                      src={`/assets/avatar_${currentQ.targetStudent2}.jpg`}
                      alt={currentQ.targetStudent2}
                      onError={(e) => { e.currentTarget.src = '/assets/avatar_carlos.jpg'; }}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
                <span className="mt-1.5 font-heading font-black text-xs sm:text-sm capitalize text-slate-900">
                  {currentQ.targetStudent2}
                </span>
              </div>
            </div>
          )}

          {/* Activity 2: Reading Passage Snippet (Questions 6 to 10) */}
          {currentQ.activity === 2 && (
            <div className="mb-5 rounded-2xl bg-sky-50 border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd] overflow-hidden">
              <div className="px-4 py-2 bg-white/90 border-b border-cyan-500/20 flex items-center justify-between">
                <span className="text-xs font-heading font-black uppercase tracking-wider text-amber-700 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  {READING_TEXT.title}
                </span>
                <button
                  type="button"
                  onClick={() => setShowReadingText(!showReadingText)}
                  className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold"
                >
                  {showReadingText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showReadingText ? 'Hide text' : 'Show text'}</span>
                </button>
              </div>

              {showReadingText && (
                <div className="p-4 text-xs md:text-sm leading-relaxed text-slate-600 font-medium italic">
                  {READING_TEXT.passage}
                </div>
              )}
            </div>
          )}

          {/* Prompt Sentence Box (Gold Text on Dark Navy with Cyan Border) */}
          <div className="text-center py-4 px-4 bg-white rounded-2xl border-2 border-sky-300 mb-5 shadow-[0_4px_0_0_#7dd3fc]">
            <span className="text-xl sm:text-3xl font-heading font-black text-amber-700 tracking-wide block">
              {currentQ.sentence}
            </span>
            {currentQ.contextHint && (
              <p className="text-xs text-cyan-800/80 font-semibold mt-1">
                Context: {currentQ.contextHint}
              </p>
            )}
          </div>

          {/* First-miss banner */}
          {showTryAgain && !isQuestionResolved && (
            <div
              role="status"
              aria-live="polite"
              className="mb-4 p-3 rounded-2xl bg-red-100/80 border-2 border-red-500 text-red-800 text-sm font-heading font-black flex items-center justify-center gap-2 animate-fadeIn"
            >
              <XCircle className="w-4 h-4 text-red-600" />
              Not quite! Try again — you can still earn 50 PTS 💪
            </div>
          )}

          {/* 4 Interactive Neon Option Buttons (Quad Layout as in Mockup) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-4">
            {currentQ.optionsQuad.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              const isEliminated = eliminatedIndices.includes(idx);
              const isSelected = selectedOptionIndex === idx;

              let btnBorder = "border-cyan-400/70 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,210,255,0.4)]";
              let btnBg = "bg-white/90";
              let textColor = "text-slate-900";

              if (shakeIndex === idx) {
                btnBorder = "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-shake";
                btnBg = "bg-red-100/80";
                textColor = "text-red-800";
              } else if (isEliminated) {
                btnBorder = "border-sky-200 opacity-20 cursor-not-allowed";
                btnBg = "bg-white/95";
              } else if (isQuestionResolved) {
                if (opt.isCorrect) {
                  btnBorder = "border-emerald-400 bg-emerald-100/80 text-emerald-800 shadow-[0_0_20px_rgba(16,185,129,0.5)]";
                  btnBg = "bg-emerald-100/80";
                } else if (isSelected && !opt.isCorrect) {
                  btnBorder = "border-red-500 bg-red-100/80 text-red-800";
                  btnBg = "bg-red-100/80";
                } else {
                  btnBorder = "border-sky-200 opacity-40";
                }
              } else if (isSelected) {
                btnBorder = "border-amber-400 bg-amber-100/80 text-amber-800";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={quizIsStarting || isQuestionResolved || isEliminated}
                  onClick={() => handleSelectOption(idx)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border-2 font-heading font-bold text-left transition-all duration-200 flex items-center gap-3.5 cursor-pointer transform active:scale-98 ${btnBorder} ${btnBg} ${textColor}`}
                >
                  {/* Round Gold Letter Badge */}
                  <span className="w-9 h-9 rounded-full bg-white/90 border-2 border-amber-400 text-amber-600 flex items-center justify-center font-heading font-black text-sm flex-shrink-0 shadow-sm">
                    {letter}
                  </span>

                  {/* Option Text */}
                  <span className="text-sm sm:text-base font-extrabold flex-1">
                    {opt.text}
                  </span>

                  {/* Feedback icon */}
                  {isQuestionResolved && opt.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                  {isQuestionResolved && isSelected && !opt.isCorrect && (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Continue Bar */}
          {isQuestionResolved && (
            <div className="pt-4 border-t border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  {attemptsRecord[currentQ.id]?.isCorrect ? (
                    <span className="text-emerald-600 font-heading font-black text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> EXCELLENT! Resposta Correta (+{attemptsRecord[currentQ.id].pointsEarned} PTS)
                    </span>
                  ) : (
                    <span className="text-red-600 font-heading font-black text-sm flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Resposta Incorreta (0 PTS)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 max-w-xl">
                  {currentQ.explanation}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider rounded-full border-2 border-amber-600 shadow-[0_5px_0_0_#b45309] hover:from-amber-300 hover:to-amber-200 active:translate-y-1 active:shadow-[0_1px_0_0_#b45309] transition-all flex items-center justify-center gap-2 flex-shrink-0"
              >
                <span>{currentIndex < sessionQuestions.length - 1 ? 'NEXT QUESTION' : 'VIEW RESULTS'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </main>

      <ZeCartinha
        visible={quizIsStarting || zeVisible}
        message={quizIsStarting
          ? zeIntroPhase === 'grow'
            ? 'Você demorou... minha carta vai atrapalhar!'
            : `Bora jogar bafo? Feche em ${zeIntroSeconds}s para começar o quiz!`
          : 'Ei! Bora jogar bafo? 🃏'}
        actionLabel={quizIsStarting && zeIntroPhase !== 'card' ? 'Agora não, Zé!' : zeVisible ? 'Agora não, Zé!' : undefined}
        onAction={quizIsStarting && zeIntroPhase !== 'card' ? handleDismissIntroZe : zeVisible ? handleDismissZe : undefined}
        imageClassName={zeIntroPhase === 'grow' ? 'w-48 sm:w-72 animate-pulse' : ''}
      />

      {introCardVisible && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Carta lançada pelo Zé Cartinha"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm px-5"
        >
          <div className="w-full max-w-sm rounded-[2rem] border-4 border-amber-400 bg-gradient-to-br from-white via-amber-50 to-orange-100 p-6 text-center shadow-[0_12px_0_0_#92400e] animate-rise-in">
            <div className="mx-auto mb-3 flex h-20 w-16 items-center justify-center rounded-xl border-4 border-red-600 bg-white text-4xl shadow-lg">🃏</div>
            <p className="font-heading text-xs font-black uppercase tracking-[0.2em] text-amber-700">Carta do Zé Cartinha</p>
            <h2 className="mt-2 font-heading text-2xl font-black text-slate-900">Ei! Agora eu atrapalhei!</h2>
            <p className="mt-2 text-sm font-bold text-slate-700">Feche minha carta para liberar o quiz e iniciar o tempo da pergunta.</p>
            <button
              type="button"
              onClick={handleDismissIntroZe}
              className="mt-5 w-full rounded-2xl border-2 border-blue-900 bg-gradient-to-b from-blue-500 to-blue-700 px-4 py-3 font-heading text-sm font-black uppercase text-white shadow-[0_4px_0_0_#1e3a8a] active:translate-y-1 active:shadow-[0_1px_0_0_#1e3a8a]"
            >
              Fechar carta e iniciar
            </button>
          </div>
        </div>
      )}

      {zeToast && (
        <div
          role="status"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-full bg-emerald-500 text-white font-heading font-black text-sm sm:text-base border-2 border-emerald-700 shadow-[0_4px_0_0_#047857] animate-rise-in"
        >
          {zeToast}
        </div>
      )}

      {/* Footer Branding */}
      <footer className="relative z-10 w-full text-center py-3 text-xs text-slate-500 border-t border-sky-200 bg-white/80 backdrop-blur-sm">
        Escola Municipal Nísia Vilela Fernandes • Duque de Caxias • Prof. Neimar Oliveira
      </footer>
    </div>
  );
};
