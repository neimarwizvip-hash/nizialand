import React, { useState } from 'react';
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
  Award
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { QUIZ_QUESTIONS, READING_TEXT } from '../../data/quizQuestions';
import { QuizQuestionAttempt, QuizResult } from '../../types';
import { audioService } from '../../services/audio';
import { speechService } from '../../services/speech';
import { fireConfetti } from '../../components/ui/ConfettiEffect';
import { GameHeader } from '../../components/layout/GameHeader';

export const QuizScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, saveQuizResult } = useGame();

  if (!currentPlayer) {
    navigate('/register');
    return null;
  }

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
  
  // Powerups (educational helpers)
  const [fiftyFiftyLeft, setFiftyFiftyLeft] = useState<number>(2);
  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);

  const currentQ = QUIZ_QUESTIONS[currentIndex];
  const isBlue = currentPlayer.team === 'blue';

  // Listen to English speech
  const handlePronounce = () => {
    audioService.playClick();
    speechService.speakEnglish(currentQ.sentence);
  };

  // 50/50 Powerup
  const handleUseFiftyFifty = () => {
    if (fiftyFiftyLeft <= 0 || isQuestionResolved || attemptsUsed > 0) return;
    audioService.playPowerup();
    setFiftyFiftyLeft(prev => prev - 1);

    // Find two wrong indices to eliminate
    const wrongIndices = currentQ.optionsQuad
      .map((opt, idx) => ({ opt, idx }))
      .filter(item => !item.opt.isCorrect)
      .map(item => item.idx);
    
    // Pick first two wrong
    const toEliminate = wrongIndices.slice(0, 2);
    setEliminatedIndices(toEliminate);
  };

  // Option selection
  const handleSelectOption = (index: number) => {
    if (isQuestionResolved || eliminatedIndices.includes(index)) return;

    const opt = currentQ.optionsQuad[index];
    const newAttemptCount = attemptsUsed + 1;
    setSelectedOptionIndex(index);
    setAttemptsUsed(newAttemptCount);

    if (opt.isCorrect) {
      // Correct!
      const points = newAttemptCount === 1 ? 100 : 50;
      audioService.playCorrect();
      fireConfetti();
      setAccumulatedScore(prev => prev + points);
      setCorrectAnswersCount(prev => prev + 1);
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
      if (newAttemptCount === 1) {
        // First strike: allow second attempt for 50 pts
        setEliminatedIndices(prev => [...prev, index]);
      } else {
        // Second strike: resolved with 0 pts
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

  // Advance to next question or complete quiz
  const handleNextQuestion = async () => {
    audioService.playClick();
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAttemptsUsed(0);
      setSelectedOptionIndex(null);
      setIsQuestionResolved(false);
      setShowHint(false);
      setEliminatedIndices([]);
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
        startedAt: new Date(Date.now() - 300000).toISOString(),
        completedAt: new Date().toISOString(),
        attempts: attemptsRecord
      };

      await saveQuizResult(result);
      navigate('/quiz/results');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <GameHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-5 md:py-6 flex flex-col justify-between">
        
        {/* Top HUD: Progress Bar & Current Score */}
        <div className="bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-4 shadow-xl backdrop-blur-sm mb-4">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-blue-600/30 border border-blue-400 text-blue-300 font-bungee text-xs tracking-wider">
                QUESTION {currentIndex + 1} OF {QUIZ_QUESTIONS.length}
              </span>
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                {currentQ.activityTitle}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Score HUD */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-black text-sm">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{accumulatedScore} PTS</span>
              </div>

              {/* Team Pill */}
              <div className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                isBlue ? 'bg-blue-900/40 border-blue-400 text-blue-300' : 'bg-purple-900/40 border-purple-400 text-purple-300'
              }`}>
                <Shield className="w-3.5 h-3.5 fill-current" />
                <span>{isBlue ? 'BLUE' : 'PURPLE'}</span>
              </div>
            </div>
          </div>

          {/* Progress track */}
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-amber-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* --- MAIN QUESTION CARD --- */}
        <div className="flex-1 bg-slate-900/80 border-2 border-slate-700 rounded-3xl p-5 md:p-7 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          
          <div>
            {/* Instruction bar with Audio & Helpers */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
              <p className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                {currentQ.instruction}
              </p>

              <div className="flex items-center gap-2">
                {/* Speech pronunciation button */}
                <button
                  type="button"
                  onClick={handlePronounce}
                  title="Listen pronunciation in English"
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-400/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline">Listen</span>
                </button>

                {/* 50/50 Powerup */}
                <button
                  type="button"
                  onClick={handleUseFiftyFifty}
                  disabled={fiftyFiftyLeft <= 0 || isQuestionResolved || attemptsUsed > 0}
                  title="Eliminate two wrong answers"
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    fiftyFiftyLeft > 0 && !isQuestionResolved && attemptsUsed === 0
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 hover:bg-amber-500/30 cursor-pointer'
                      : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>50/50 ({fiftyFiftyLeft})</span>
                </button>

                {/* Hint toggle */}
                <button
                  type="button"
                  onClick={() => {
                    audioService.playClick();
                    setShowHint(!showHint);
                  }}
                  title="Show grammar rule"
                  className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-400/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span className="hidden sm:inline">Hint</span>
                </button>
              </div>
            </div>

            {/* Hint Box (if active) */}
            {showHint && (
              <div className="mb-4 p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/50 text-purple-200 text-xs md:text-sm animate-in fade-in duration-200">
                <strong className="text-purple-300">Grammar Tip:</strong> {currentQ.hint}
              </div>
            )}

            {/* Visual Spotlight: Activity 1 Duel Cards (Questions 1 to 5) */}
            {currentQ.targetStudent1 && currentQ.targetStudent2 && (
              <div className="mb-5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-around gap-2 shadow-inner">
                {/* Student 1 Card */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <img 
                      src={`/assets/avatar_${currentQ.targetStudent1}.jpg`}
                      alt={currentQ.targetStudent1}
                      onError={(e) => { e.currentTarget.src = '/assets/avatar_mateus.jpg'; }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-400 shadow-md"
                    />
                  </div>
                  <span className="mt-1 font-bold text-xs sm:text-sm capitalize text-white">
                    {currentQ.targetStudent1}
                  </span>
                </div>

                {/* VS Badge */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center font-bungee text-xs text-slate-950 font-black shadow-lg border-2 border-white">
                  VS
                </div>

                {/* Student 2 Card */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <img 
                      src={`/assets/avatar_${currentQ.targetStudent2}.jpg`}
                      alt={currentQ.targetStudent2}
                      onError={(e) => { e.currentTarget.src = '/assets/avatar_carlos.jpg'; }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-purple-400 shadow-md"
                    />
                  </div>
                  <span className="mt-1 font-bold text-xs sm:text-sm capitalize text-white">
                    {currentQ.targetStudent2}
                  </span>
                </div>
              </div>
            )}

            {/* Visual Spotlight: Activity 2 Reading Snippet (Questions 6 to 10) */}
            {currentQ.activity === 2 && (
              <div className="mb-5 rounded-2xl bg-slate-950/70 border border-slate-800 overflow-hidden shadow-inner">
                <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    {READING_TEXT.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowReadingText(!showReadingText)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold"
                  >
                    {showReadingText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showReadingText ? 'Hide text' : 'Show text'}</span>
                  </button>
                </div>

                {showReadingText && (
                  <div className="p-4 text-xs md:text-sm leading-relaxed text-slate-300 font-medium italic border-b border-slate-800/50">
                    {READING_TEXT.passage}
                  </div>
                )}
              </div>
            )}

            {/* Sentence with Gap Prompt */}
            <div className="text-center py-3 px-4 bg-slate-800/60 rounded-2xl border-2 border-slate-700 mb-6 shadow-md">
              <span className="text-lg md:text-2xl font-black text-amber-300 tracking-wide font-bungee">
                {currentQ.sentence}
              </span>
              {currentQ.contextHint && (
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Context: {currentQ.contextHint}
                </p>
              )}
            </div>

            {/* 4 Interactive Options (Quad Layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
              {currentQ.optionsQuad.map((opt, idx) => {
                const isEliminated = eliminatedIndices.includes(idx);
                const isSelected = selectedOptionIndex === idx;
                const isCorrect = opt.isCorrect;
                
                let btnStyle = "bg-slate-800/90 border-slate-600 hover:border-blue-400 hover:bg-slate-750 text-white";
                
                if (isQuestionResolved) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-600/30 border-emerald-400 text-emerald-200 ring-4 ring-emerald-500/40 font-black";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-red-600/30 border-red-500 text-red-300 opacity-60";
                  } else {
                    btnStyle = "bg-slate-900 border-slate-800 text-slate-500 opacity-40";
                  }
                } else if (isEliminated) {
                  btnStyle = "bg-slate-900/40 border-slate-800 text-slate-600 line-through opacity-30 cursor-not-allowed";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isQuestionResolved || isEliminated}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-150 flex items-center justify-between text-left group shadow-lg ${btnStyle} ${
                      !isQuestionResolved && !isEliminated ? 'cursor-pointer active:scale-98' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-950/80 border border-slate-600 flex items-center justify-center font-bungee text-sm text-amber-400 group-hover:scale-110 transition-transform">
                        {opt.letter || String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-base md:text-lg font-bold">
                        {opt.text}
                      </span>
                    </div>

                    {isQuestionResolved && isCorrect && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    )}
                    {isQuestionResolved && isSelected && !isCorrect && (
                      <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Action Footer */}
          <div>
            {/* Feedback message banner */}
            {attemptsUsed > 0 && (
              <div className={`p-4 rounded-2xl border-2 mb-4 flex items-center gap-3 animate-in fade-in duration-200 ${
                isQuestionResolved
                  ? attemptsRecord[currentQ.id]?.isCorrect
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                    : 'bg-red-950/70 border-red-500 text-red-200'
                  : 'bg-amber-950/70 border-amber-500 text-amber-200'
              }`}>
                {isQuestionResolved ? (
                  attemptsRecord[currentQ.id]?.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="font-bungee text-base text-emerald-300">
                          {attemptsRecord[currentQ.id]?.pointsEarned === 100 ? '+100 PTS! GREAT JOB!' : '+50 PTS! CORRECT ON 2ND TRY!'}
                        </div>
                        <p className="text-xs text-emerald-200 mt-0.5">{currentQ.explanation}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-7 h-7 text-red-400 flex-shrink-0" />
                      <div>
                        <div className="font-bungee text-base text-red-300">0 PTS • KEEP LEARNING!</div>
                        <p className="text-xs text-red-200 mt-0.5">{currentQ.explanation}</p>
                      </div>
                    </>
                  )
                ) : (
                  <>
                    <HelpCircle className="w-7 h-7 text-amber-400 flex-shrink-0" />
                    <div>
                      <div className="font-bungee text-sm text-amber-300">TRY AGAIN!</div>
                      <p className="text-xs text-amber-200">
                        1 attempt remaining for <strong>50 points</strong>. Look at the ages carefully!
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Advance button */}
            {isQuestionResolved && (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-b from-blue-500 via-indigo-600 to-blue-700 hover:from-blue-400 hover:to-indigo-500 text-white font-bungee text-lg md:text-xl tracking-wider shadow-[0_8px_0_#1e3a8a,0_15px_25px_rgba(59,130,246,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#1e3a8a] border-2 border-blue-300 flex items-center justify-center gap-3 transition-all cursor-pointer animate-arcade-pulse"
              >
                <span>{currentIndex < QUIZ_QUESTIONS.length - 1 ? 'NEXT QUESTION' : 'COMPLETE QUIZ & SEE RESULTS'}</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </button>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};
