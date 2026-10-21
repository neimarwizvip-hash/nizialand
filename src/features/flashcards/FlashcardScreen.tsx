import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Volume2, 
  Heart, 
  Award, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Layers,
  HelpCircle,
  Flame
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { FLASHCARD_STUDENTS, FLASHCARD_CHALLENGES } from '../../data/flashcardData';
import { FlashcardStudent, FlashcardRoundAttempt, FlashcardResult } from '../../types';
import { audioService } from '../../services/audio';
import { speechService } from '../../services/speech';
import { fireConfetti } from '../../components/ui/ConfettiEffect';
import { GameHeader } from '../../components/layout/GameHeader';

type GamePhase = 'memorize' | 'challenge' | 'round_completed' | 'finished';

export const FlashcardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, saveFlashcardResult } = useGame();

  if (!currentPlayer) {
    navigate('/register');
    return null;
  }

  // --- GAME STATE ---
  const [phase, setPhase] = useState<GamePhase>('memorize');
  const [countdown, setCountdown] = useState<number>(30);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [heartsLeft, setHeartsLeft] = useState<number>(3);
  const [accumulatedScore, setAccumulatedScore] = useState<number>(0);
  const [roundAttempts, setRoundAttempts] = useState<FlashcardRoundAttempt[]>([]);

  // Per-round state
  const [attemptsThisRound, setAttemptsThisRound] = useState<number>(0);
  const [revealedCardIds, setRevealedCardIds] = useState<string[]>([]);
  const [lastPickedStudent, setLastPickedStudent] = useState<FlashcardStudent | null>(null);
  const [roundFeedback, setRoundFeedback] = useState<{
    type: 'correct' | 'wrong' | 'none';
    message: string;
    detail: string;
  }>({ type: 'none', message: '', detail: '' });

  const currentChallenge = FLASHCARD_CHALLENGES[currentRoundIndex];
  const isBlue = currentPlayer.team === 'blue';

  // --- 30S COUNTDOWN TIMER ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 'memorize') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            startChallengePhase();
            return 0;
          }
          if (prev <= 6) {
            audioService.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase]);

  const startChallengePhase = () => {
    audioService.playFlip();
    setPhase('challenge');
    setRevealedCardIds([]);
  };

  const handleSkipTimer = () => {
    audioService.playClick();
    startChallengePhase();
  };

  // English pronunciation
  const handlePronounce = () => {
    audioService.playClick();
    if (currentChallenge) {
      speechService.speakEnglish(currentChallenge.questionEn);
    }
  };

  // --- CARD CLICK INTERACTION ---
  const handleCardClick = (student: FlashcardStudent) => {
    if (phase !== 'challenge' || revealedCardIds.includes(student.id)) return;

    audioService.playFlip();
    const newRevealed = [...revealedCardIds, student.id];
    setRevealedCardIds(newRevealed);
    setLastPickedStudent(student);

    const newAttemptsCount = attemptsThisRound + 1;
    setAttemptsThisRound(newAttemptsCount);

    const isMatch = currentChallenge.validateCard(student);

    if (isMatch) {
      // Correct Match!
      const points = newAttemptsCount === 1 ? 100 : (newAttemptsCount === 2 ? 50 : 25);
      audioService.playCorrect();
      fireConfetti();
      setAccumulatedScore((prev) => prev + points);

      setRoundFeedback({
        type: 'correct',
        message: `CORRECT! +${points} POINTS!`,
        detail: `${student.name} is ${student.age} years old! (${currentChallenge.compText} ${currentChallenge.targetName})`
      });

      // Record round attempt
      setRoundAttempts((prev) => [
        ...prev,
        {
          round: currentRoundIndex + 1,
          challengeId: currentChallenge.id,
          attemptsUsed: newAttemptsCount,
          chosenStudentId: student.id,
          isCorrect: true,
          pointsEarned: points
        }
      ]);

      setPhase('round_completed');
    } else {
      // Wrong Match!
      audioService.playWrong();
      const nextHearts = heartsLeft - 1;
      setHeartsLeft(nextHearts);

      if (nextHearts > 0 && newAttemptsCount < 3) {
        setRoundFeedback({
          type: 'wrong',
          message: 'TRY AGAIN!',
          detail: `${student.name} is ${student.age} years old. Find someone ${currentChallenge.compText} ${currentChallenge.targetName} (${currentChallenge.targetAge})!`
        });
      } else {
        // Out of attempts for this round
        setRoundFeedback({
          type: 'wrong',
          message: 'ROUND OVER (0 PTS)',
          detail: currentChallenge.ruleExplanation
        });

        setRoundAttempts((prev) => [
          ...prev,
          {
            round: currentRoundIndex + 1,
            challengeId: currentChallenge.id,
            attemptsUsed: newAttemptsCount,
            chosenStudentId: student.id,
            isCorrect: false,
            pointsEarned: 0
          }
        ]);

        setPhase('round_completed');
      }
    }
  };

  // --- ADVANCE TO NEXT ROUND OR COMPLETE MISSION ---
  const handleNextRound = async () => {
    audioService.playClick();
    if (currentRoundIndex < FLASHCARD_CHALLENGES.length - 1) {
      setCurrentRoundIndex((prev) => prev + 1);
      setAttemptsThisRound(0);
      setRevealedCardIds([]);
      setHeartsLeft(3);
      setLastPickedStudent(null);
      setRoundFeedback({ type: 'none', message: '', detail: '' });
      setPhase('challenge');
    } else {
      // All 5 rounds completed!
      const totalScore = accumulatedScore;
      let stars = 1;
      if (totalScore >= 450) stars = 3;
      else if (totalScore >= 300) stars = 2;

      const result: FlashcardResult = {
        completed: true,
        totalScore,
        roundsCompleted: FLASHCARD_CHALLENGES.length,
        stars,
        startedAt: new Date(Date.now() - 300000).toISOString(),
        completedAt: new Date().toISOString(),
        roundAttempts
      };

      await saveFlashcardResult(result);
      navigate('/results/final');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between overflow-x-hidden">
      <GameHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-3 py-3 md:py-4 flex flex-col justify-between">
        
        {/* Top Control Bar: Round, Hearts, Timer, Points */}
        <div className="bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-3 md:p-4 shadow-xl backdrop-blur-sm mb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            
            {/* Round info */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-purple-600/30 border border-purple-400 text-purple-300 font-bungee text-xs tracking-wider">
                {phase === 'memorize' ? 'PHASE 1: MEMORIZE' : `ROUND ${currentRoundIndex + 1} OF ${FLASHCARD_CHALLENGES.length}`}
              </span>
              <div className={`hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-xs font-bold border ${
                isBlue ? 'bg-blue-900/40 border-blue-400 text-blue-300' : 'bg-purple-900/40 border-purple-400 text-purple-300'
              }`}>
                <Shield className="w-3.5 h-3.5 fill-current" />
                <span>{isBlue ? 'BLUE' : 'PURPLE'}</span>
              </div>
            </div>

            {/* Phase 1 Countdown or Hearts */}
            {phase === 'memorize' ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400 text-amber-300 rounded-xl font-bungee text-sm">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>{countdown}s</span>
                </div>
                <button
                  type="button"
                  onClick={handleSkipTimer}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold border border-blue-400 shadow-sm transition-all cursor-pointer"
                >
                  I'm Ready! →
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-bold uppercase hidden sm:inline">Chances:</span>
                {[1, 2, 3].map((heartIndex) => (
                  <Heart
                    key={heartIndex}
                    className={`w-5 h-5 transition-transform ${
                      heartIndex <= heartsLeft
                        ? 'text-red-500 fill-red-500 scale-105'
                        : 'text-slate-700 fill-slate-800'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Score tracker */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-black text-sm">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{accumulatedScore} PTS</span>
            </div>

          </div>
        </div>

        {/* --- CHALLENGE QUESTION PROMPT (Static top area) --- */}
        <div className="bg-slate-900/80 border-2 border-slate-700 rounded-2xl p-4 shadow-xl backdrop-blur-md mb-3 text-center relative overflow-hidden">
          {phase === 'memorize' ? (
            <div>
              <h2 className="text-base sm:text-xl font-black font-bungee text-amber-300">
                MEMORIZE THE 8 STUDENTS AND THEIR AGES!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                You have <strong>{countdown} seconds</strong> before the cards flip face-down!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-400 text-purple-300">
                  CHALLENGE {currentRoundIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={handlePronounce}
                  title="Pronounce in English"
                  className="p-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-400/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Volume2 className="w-4 h-4 text-blue-400" />
                  <span className="text-[11px] hidden sm:inline">Listen</span>
                </button>
              </div>

              <h2 className="text-lg sm:text-2xl font-black font-bungee text-amber-300 tracking-wide">
                "{currentChallenge.questionEn}"
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                {currentChallenge.questionPt}
              </p>
            </div>
          )}
        </div>

        {/* --- 8 FLASHCARDS GRID (4 columns x 2 rows, compact, no scroll) --- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 my-auto">
          {FLASHCARD_STUDENTS.map((student) => {
            const isRevealed = phase === 'memorize' || revealedCardIds.includes(student.id);
            const isLastPicked = lastPickedStudent?.id === student.id;
            const isCorrectMatch = currentChallenge?.validateCard(student);

            let borderEffect = "border-slate-700 hover:border-purple-400";
            if (isRevealed && phase !== 'memorize') {
              if (isCorrectMatch) {
                borderEffect = "border-emerald-400 ring-4 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.5)]";
              } else if (isLastPicked) {
                borderEffect = "border-red-500 ring-4 ring-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.5)]";
              }
            }

            return (
              <div
                key={student.id}
                onClick={() => handleCardClick(student)}
                className={`perspective-1000 aspect-[3/4] max-h-48 sm:max-h-56 cursor-pointer transition-transform duration-200 select-none ${
                  phase === 'challenge' && !revealedCardIds.includes(student.id) ? 'hover:scale-103 active:scale-97' : ''
                }`}
              >
                <div
                  className={`w-full h-full relative transition-transform duration-500 transform-style-preserve-3d rounded-2xl ${
                    isRevealed ? '' : 'rotate-y-180'
                  }`}
                >
                  {/* FRONT: Student Photo, Name & Age Badge */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-2xl border-3 bg-gradient-to-b from-slate-800 to-slate-900 backface-hidden p-2 flex flex-col justify-between items-center shadow-lg ${borderEffect}`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="font-bungee text-xs sm:text-sm text-white truncate">
                        {student.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-xs shadow">
                        {student.age} yrs
                      </span>
                    </div>

                    <div className="relative w-full flex-1 my-1.5 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                      <img
                        src={student.img}
                        alt={student.name}
                        onError={(e) => { e.currentTarget.src = `/assets/avatar_${student.id}.jpg`; }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="w-full text-center">
                      <span className="text-[10px] font-semibold text-slate-400">
                        Nísia Vilela Fernandes
                      </span>
                    </div>
                  </div>

                  {/* BACK: NIZIALAND Game Card Back */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-2xl border-3 border-indigo-400/60 bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-900 backface-hidden rotate-y-180 p-2 flex flex-col items-center justify-center text-center shadow-xl hover:border-amber-300 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-800/80 border-2 border-indigo-300 flex items-center justify-center text-amber-300 shadow-md mb-2">
                      <Layers className="w-6 h-6" />
                    </div>
                    <span className="font-bungee text-xs sm:text-sm text-amber-300 tracking-wider">
                      NIZIALAND
                    </span>
                    <span className="text-[10px] text-purple-300 font-bold uppercase mt-1">
                      Tap to reveal
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* --- BOTTOM FEEDBACK & NEXT ACTION BAR --- */}
        <div className="mt-3">
          {roundFeedback.type !== 'none' && (
            <div className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
              roundFeedback.type === 'correct'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : 'bg-red-950/80 border-red-500 text-red-200'
            }`}>
              <div className="flex items-center gap-2.5">
                {roundFeedback.type === 'correct' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <div className="font-bungee text-sm sm:text-base">
                    {roundFeedback.message}
                  </div>
                  <p className="text-xs sm:text-sm opacity-90">
                    {roundFeedback.detail}
                  </p>
                </div>
              </div>

              {phase === 'round_completed' && (
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-bungee text-xs sm:text-sm tracking-wider shadow-md active:translate-y-0.5 border border-yellow-200 flex items-center gap-2 transition-all cursor-pointer flex-shrink-0"
                >
                  <span>{currentRoundIndex < FLASHCARD_CHALLENGES.length - 1 ? 'NEXT ROUND' : 'SEE FINAL RESULTS'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};
