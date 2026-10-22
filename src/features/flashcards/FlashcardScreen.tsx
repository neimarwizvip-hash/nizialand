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
import { shuffleArray } from '../../data/quizQuestions';
import { FlashcardStudent, FlashcardChallenge, FlashcardRoundAttempt, FlashcardResult } from '../../types';
import { audioService } from '../../services/audio';
import { speechService } from '../../services/speech';
import { fireConfetti } from '../../components/ui/ConfettiEffect';
import { GameHeader } from '../../components/layout/GameHeader';

type GamePhase = 'memorize' | 'challenge' | 'round_completed' | 'finished';

// Vibrant card header colors matching mockups
const STUDENT_COLORS: Record<string, { bg: string; text: string; ageBg: string }> = {
  juliana: { bg: 'bg-[#fbcfe8]', text: 'text-slate-900', ageBg: 'bg-amber-400 text-slate-950' },
  mateus: { bg: 'bg-[#bae6fd]', text: 'text-slate-900', ageBg: 'bg-amber-400 text-slate-950' },
  carlos: { bg: 'bg-[#bbf7d0]', text: 'text-slate-900', ageBg: 'bg-amber-400 text-slate-950' },
  gabriel: { bg: 'bg-[#fef08a]', text: 'text-slate-900', ageBg: 'bg-amber-400 text-slate-950' },
  rafael: { bg: 'bg-[#bfdbfe]', text: 'text-slate-900', ageBg: 'bg-amber-400 text-slate-950' },
  beatriz: { bg: 'bg-[#fed7aa]', text: 'text-slate-900', ageBg: 'bg-amber-400 text-slate-950' },
  larissa: { bg: 'bg-[#e9d5ff]', text: 'text-slate-900', ageBg: 'bg-amber-400 text-slate-950' },
  sofia: { bg: 'bg-[#99f6e4]', text: 'text-slate-900', ageBg: 'bg-amber-400 text-slate-950' }
};

export const FlashcardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, saveFlashcardResult } = useGame();

  if (!currentPlayer) {
    navigate('/register');
    return null;
  }

  // Shuffled cards array on every game session / mount so memorization positions are never identical
  const [sessionStudents] = useState<FlashcardStudent[]>(() => shuffleArray(FLASHCARD_STUDENTS));
  // Shuffled challenges for dynamic round variation
  const [sessionChallenges] = useState<FlashcardChallenge[]>(() => shuffleArray(FLASHCARD_CHALLENGES));

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

  const currentChallenge = sessionChallenges[currentRoundIndex] || sessionChallenges[0];
  const isBlue = currentPlayer.team === 'blue';

  // Duck music volume on flashcard mount for focus, restore on unmount
  useEffect(() => {
    audioService.duckVolume(true);
    return () => {
      audioService.duckVolume(false);
    };
  }, []);

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

  // Card click interaction in Challenge Phase
  const handleCardClick = (student: FlashcardStudent) => {
    if (phase !== 'challenge' || revealedCardIds.includes(student.id)) return;

    audioService.playFlip();
    const isCorrect = currentChallenge.validateCard(student);
    const newAttemptNumber = attemptsThisRound + 1;
    setAttemptsThisRound(newAttemptNumber);
    setRevealedCardIds(prev => [...prev, student.id]);
    setLastPickedStudent(student);

    if (isCorrect) {
      // Correct!
      const points = newAttemptNumber === 1 ? 100 : newAttemptNumber === 2 ? 50 : 25;
      audioService.playCorrect();
      fireConfetti();
      setAccumulatedScore(prev => prev + points);

      setRoundFeedback({
        type: 'correct',
        message: `CORRECT! ${student.name} is ${student.age} years old!`,
        detail: currentChallenge.ruleExplanation
      });

      setRoundAttempts(prev => [
        ...prev,
        {
          round: currentRoundIndex + 1,
          challengeId: currentChallenge.id,
          attemptsUsed: newAttemptNumber,
          chosenStudentId: student.id,
          isCorrect: true,
          pointsEarned: points
        }
      ]);

      setPhase('round_completed');
    } else {
      // Wrong card chosen!
      audioService.playWrong();
      const newHearts = heartsLeft - 1;
      setHeartsLeft(newHearts);

      if (newHearts <= 0) {
        // Out of hearts for this round
        setRoundFeedback({
          type: 'wrong',
          message: `NO MORE HEARTS! ${student.name} is ${student.age} years old.`,
          detail: currentChallenge.ruleExplanation
        });

        setRoundAttempts(prev => [
          ...prev,
          {
            round: currentRoundIndex + 1,
            challengeId: currentChallenge.id,
            attemptsUsed: 3,
            chosenStudentId: student.id,
            isCorrect: false,
            pointsEarned: 0
          }
        ]);

        setPhase('round_completed');
      } else {
        // Still has hearts left
        setRoundFeedback({
          type: 'wrong',
          message: `Not quite! ${student.name} is ${student.age} years old.`,
          detail: `You have ${newHearts} ${newHearts === 1 ? 'heart' : 'hearts'} left! Try again.`
        });
      }
    }
  };

  // --- ADVANCE TO NEXT ROUND OR COMPLETE MISSION ---
  const handleNextRound = async () => {
    audioService.playClick();
    if (currentRoundIndex < sessionChallenges.length - 1) {
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
        roundsCompleted: sessionChallenges.length,
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
    <div className="relative min-h-screen bg-slate-950 text-white flex flex-col justify-between overflow-x-hidden">
      {/* Background: Hallway matching approved mockup */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/assets/nisialand_hallway_bg.jpg"
          alt="Corredor da Escola"
          className="w-full h-full object-cover filter brightness-[0.88]"
        />
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10">
        <GameHeader />
      </div>

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-3 md:py-6 flex flex-col justify-center">
        
        {/* --- MAIN FLOATING FLASHCARD PANEL (Neon Cyan Glow as in Mockup) --- */}
        <div className="w-full rounded-3xl border-2 border-cyan-400 bg-[#0b1528]/95 p-4 sm:p-6 shadow-[0_0_35px_rgba(0,210,255,0.4)] backdrop-blur-xl flex flex-col justify-between my-auto animate-fadeIn">
          
          {/* Top Control Bar: Phase, Team, Timer, Hearts, Score */}
          <div className="border-b border-cyan-500/30 pb-3 mb-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              
              {/* Phase info pill */}
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-purple-600/40 border border-purple-400 text-purple-200 font-heading font-black text-xs sm:text-sm tracking-wider uppercase shadow-game-sm">
                  {phase === 'memorize' ? 'PHASE 1: MEMORIZE' : `ROUND ${currentRoundIndex + 1} OF ${sessionChallenges.length}`}
                </span>
                
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-heading font-black border shadow-sm ${
                  isBlue ? 'bg-blue-600/30 border-cyan-400 text-cyan-300' : 'bg-purple-600/30 border-purple-400 text-purple-300'
                }`}>
                  <Shield className="w-3.5 h-3.5 fill-current" />
                  <span>{isBlue ? 'BLUE' : 'PURPLE'}</span>
                </div>
              </div>

              {/* Phase 1 Countdown or Phase 2 Hearts */}
              {phase === 'memorize' ? (
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border-2 border-amber-400 text-amber-300 rounded-full font-heading font-black text-xs sm:text-sm shadow-sm animate-pulse">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>⏱️ {countdown}s</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSkipTimer}
                    className="px-3.5 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-full text-xs font-heading font-black border border-white shadow-sm transition-all transform active:scale-95"
                  >
                    I'm Ready! →
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-[#07101e] px-3 py-1 rounded-full border border-slate-700">
                  <span className="text-[11px] text-slate-300 font-heading font-bold uppercase hidden sm:inline">Chances:</span>
                  {[1, 2, 3].map((heartIndex) => (
                    <Heart
                      key={heartIndex}
                      className={`w-5 h-5 transition-transform ${
                        heartIndex <= heartsLeft
                          ? 'text-red-500 fill-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                          : 'text-slate-700 fill-slate-800 scale-90'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Score tracker */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-heading font-black text-xs sm:text-sm shadow-sm">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{accumulatedScore} PTS</span>
              </div>

            </div>
          </div>

          {/* Prompt Banner (Center Header) */}
          <div className="bg-[#081324] border border-cyan-500/40 rounded-2xl p-3.5 mb-4 text-center shadow-lg">
            {phase === 'memorize' ? (
              <div>
                <h2 className="text-base sm:text-xl font-heading font-black text-amber-300 flex items-center justify-center gap-2">
                  <span>🃏</span> MEMORIZE THE 8 STUDENTS AND THEIR AGES! <span>🃏</span>
                </h2>
                <p className="text-xs text-cyan-200 mt-1 font-medium">
                  You have <strong className="text-amber-400">{countdown} seconds</strong> before the cards flip face-down!
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-xs font-heading font-black text-cyan-400 uppercase tracking-widest">
                    🎯 MISSION 2 • FIND THE RIGHT CARD:
                  </span>
                  <button
                    type="button"
                    onClick={handlePronounce}
                    className="p-1 rounded-lg bg-blue-600/30 text-cyan-300 hover:bg-blue-600/50 transition-colors"
                    title="Ouvir desafio em inglês"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h2 className="text-lg sm:text-2xl font-heading font-black text-amber-300">
                  {currentChallenge?.questionEn}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 italic">
                  ({currentChallenge?.questionPt})
                </p>
              </div>
            )}
          </div>

          {/* 8 Flashcards Grid (4 columns x 2 rows as in Mockup) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mb-3">
            {sessionStudents.map((student) => {
              const isRevealed = phase === 'memorize' || revealedCardIds.includes(student.id);
              const isLastPicked = lastPickedStudent?.id === student.id;
              const isCorrectMatch = currentChallenge?.validateCard(student);
              const colorInfo = STUDENT_COLORS[student.id] || { bg: 'bg-[#bae6fd]', text: 'text-slate-900', ageBg: 'bg-amber-400 text-slate-950' };

              let borderEffect = "border-cyan-500/40 hover:border-cyan-300";
              if (isRevealed && phase !== 'memorize') {
                if (isCorrectMatch) {
                  borderEffect = "border-emerald-400 ring-4 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.7)]";
                } else if (isLastPicked) {
                  borderEffect = "border-red-500 ring-4 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.7)]";
                }
              }

              return (
                <div
                  key={student.id}
                  onClick={() => handleCardClick(student)}
                  className={`perspective-1000 aspect-[3/4] max-h-52 sm:max-h-60 cursor-pointer transition-transform duration-200 select-none ${
                    phase === 'challenge' && !revealedCardIds.includes(student.id) ? 'hover:scale-103 active:scale-97' : ''
                  }`}
                >
                  <div
                    className={`w-full h-full relative transition-transform duration-500 transform-style-preserve-3d rounded-2xl ${
                      isRevealed ? '' : 'rotate-y-180'
                    }`}
                  >
                    {/* FRONT: Colorful Pastel Background Card */}
                    <div
                      className={`absolute inset-0 w-full h-full rounded-2xl border-2 bg-[#0c1a32] backface-hidden p-2 flex flex-col justify-between items-center shadow-lg ${borderEffect}`}
                    >
                      {/* Top Header of Card: Name and Age Badge */}
                      <div className="w-full flex items-center justify-between px-1">
                        <span className="font-heading font-black text-xs sm:text-sm text-white truncate">
                          {student.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-heading font-black text-[10px] sm:text-xs shadow">
                          {student.age} yrs
                        </span>
                      </div>

                      {/* Photo Container with Pastel Background */}
                      <div className={`relative w-full flex-1 my-1.5 rounded-xl overflow-hidden ${colorInfo.bg} flex items-center justify-center p-1 border border-slate-700/60`}>
                        <img
                          src={student.img}
                          alt={student.name}
                          onError={(e) => { e.currentTarget.src = `/assets/avatar_${student.id}.jpg`; }}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Footer: Name + Age + School */}
                      <div className="w-full text-center leading-tight">
                        <div className="text-xs font-heading font-black text-white">
                          {student.name}
                        </div>
                        <div className="text-[11px] font-bold text-amber-300">
                          {student.age} years old
                        </div>
                        <span className="text-[9px] text-slate-400 block truncate">
                          Nísia Vilela Fernandes
                        </span>
                      </div>
                    </div>

                    {/* BACK: NISIALAND Official Card Back */}
                    <div
                      className="absolute inset-0 w-full h-full rounded-2xl border-2 border-cyan-400/80 bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 backface-hidden rotate-y-180 p-2 flex flex-col items-center justify-center text-center shadow-xl hover:border-amber-300 transition-colors"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-blue-900/80 border-2 border-cyan-400 flex items-center justify-center text-amber-300 shadow-md mb-2">
                        <Layers className="w-6 h-6 text-cyan-300" />
                      </div>
                      <span className="font-heading font-black text-xs sm:text-sm text-amber-300 tracking-wider">
                        NISIALAND
                      </span>
                      <span className="text-[9px] text-cyan-200 font-heading font-bold uppercase mt-1">
                        Tap to reveal
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback & Continue Bar after round */}
          {phase === 'round_completed' && (
            <div className="pt-3 border-t border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  {roundFeedback.type === 'correct' ? (
                    <span className="text-emerald-400 font-heading font-black text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> {roundFeedback.message}
                    </span>
                  ) : (
                    <span className="text-red-400 font-heading font-black text-sm flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {roundFeedback.message}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  {roundFeedback.detail}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNextRound}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider rounded-full border-2 border-amber-600 shadow-glow-gold hover:from-amber-300 hover:to-amber-200 transform active:scale-95 transition-all flex items-center justify-center gap-2 flex-shrink-0"
              >
                <span>{currentRoundIndex < sessionChallenges.length - 1 ? 'NEXT ROUND →' : 'FINAL RESULTS →'}</span>
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full text-center py-3 text-xs text-slate-400 border-t border-slate-900 bg-slate-950/70 backdrop-blur-sm">
        Escola Municipal Nísia Vilela Fernandes • Duque de Caxias • Prof. Neimar Oliveira
      </footer>
    </div>
  );
};
