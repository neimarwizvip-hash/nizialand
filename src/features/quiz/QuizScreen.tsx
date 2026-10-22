import React, { useState, useEffect } from 'react';
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
import { READING_TEXT, getRandomizedQuizSession, shuffleArray } from '../../data/quizQuestions';
import { QuizQuestion, QuizQuestionAttempt, QuizResult } from '../../types';
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

  // Duck music volume on quiz mount for concentration, restore on unmount
  useEffect(() => {
    audioService.duckVolume(true);
    return () => {
      audioService.duckVolume(false);
    };
  }, []);

  // Randomized questions & options session (order of questions + order of options are shuffled)
  const [sessionQuestions] = useState<QuizQuestion[]>(() => getRandomizedQuizSession());

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

  const currentQ = sessionQuestions[currentIndex] || sessionQuestions[0];
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
    
    // Pick two random wrong indices
    const toEliminate = shuffleArray(wrongIndices).slice(0, 2);
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
    if (currentIndex < sessionQuestions.length - 1) {
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

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 md:py-6 flex flex-col justify-center">
        
        {/* --- MAIN FLOATING QUIZ PANEL (Neon Cyan Glow as in Mockup) --- */}
        <div className="w-full rounded-3xl border-2 border-cyan-400 bg-[#0b1528]/95 p-4 sm:p-7 shadow-[0_0_35px_rgba(0,210,255,0.4)] backdrop-blur-xl flex flex-col justify-between my-auto animate-fadeIn">
          
          {/* Top Panel Bar: Question progress, Score Capsule, Team Pill */}
          <div className="border-b border-cyan-500/30 pb-4 mb-4">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-blue-600/40 border border-cyan-400 text-cyan-200 font-heading font-black text-xs sm:text-sm tracking-wider uppercase shadow-game-sm">
                  QUESTION {currentIndex + 1} OF {sessionQuestions.length}
                </span>
                <span className="text-xs font-bold text-slate-300 hidden md:inline">
                  {currentQ.activityTitle}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Score capsule */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/80 text-amber-300 font-heading font-black text-xs sm:text-sm shadow-sm">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{accumulatedScore} PTS</span>
                </div>

                {/* Team Pill */}
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-heading font-black border shadow-sm ${
                  isBlue 
                    ? 'bg-blue-600/30 border-cyan-400 text-cyan-300' 
                    : 'bg-purple-600/30 border-purple-400 text-purple-300'
                }`}>
                  <Shield className="w-3.5 h-3.5 fill-current" />
                  <span>{isBlue ? 'BLUE' : 'PURPLE'}</span>
                </div>
              </div>
            </div>

            {/* Neon Glowing Progress Bar */}
            <div className="w-full h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-cyan-500/40 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                style={{ width: `${((currentIndex + 1) / sessionQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Subheader: Instruction and Powerup Controls */}
          <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-3 mb-5 flex-wrap">
            <p className="text-xs sm:text-sm font-heading font-extrabold uppercase tracking-wide text-cyan-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>{currentQ.instruction}</span>
            </p>

            <div className="flex items-center gap-2">
              {/* Listen button (Blue Neon) */}
              <button
                type="button"
                onClick={handlePronounce}
                title="Ouvir frase em inglês"
                className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-cyan-400 text-xs font-heading font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
                <span>Listen</span>
              </button>

              {/* 50/50 Button (Gold Neon) */}
              <button
                type="button"
                onClick={handleUseFiftyFifty}
                disabled={fiftyFiftyLeft <= 0 || isQuestionResolved || attemptsUsed > 0}
                title="Eliminar 2 respostas erradas"
                className={`px-3 py-1.5 rounded-xl border text-xs font-heading font-bold flex items-center gap-1.5 transition-all ${
                  fiftyFiftyLeft > 0 && !isQuestionResolved && attemptsUsed === 0
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 hover:bg-amber-500/30 shadow-sm active:scale-95'
                    : 'bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed opacity-40'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>50/50 ({fiftyFiftyLeft})</span>
              </button>

              {/* Hint button (Purple Neon) */}
              <button
                type="button"
                onClick={() => {
                  audioService.playClick();
                  setShowHint(!showHint);
                }}
                title="Dica gramatical"
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400 text-xs font-heading font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <HelpCircle className="w-3.5 h-3.5 text-purple-300" />
                <span>Hint</span>
              </button>
            </div>
          </div>

          {/* Hint Dropdown Box */}
          {showHint && (
            <div className="mb-4 p-3.5 rounded-2xl bg-purple-950/80 border-2 border-purple-400 text-purple-200 text-xs sm:text-sm animate-fadeIn">
              <strong className="text-amber-300">Grammar Tip:</strong> {currentQ.hint}
            </div>
          )}

          {/* Activity 1: VS Battle Cards (Questions 1 to 5) */}
          {currentQ.targetStudent1 && currentQ.targetStudent2 && (
            <div className="mb-5 p-3 sm:p-4 rounded-2xl bg-[#07101e]/80 border border-cyan-500/30 flex items-center justify-center gap-4 sm:gap-8 shadow-inner">
              {/* Student 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-3 border-cyan-400 shadow-glow-blue bg-slate-950 p-1">
                    <img 
                      src={`/assets/avatar_${currentQ.targetStudent1}.jpg`}
                      alt={currentQ.targetStudent1}
                      onError={(e) => { e.currentTarget.src = '/assets/avatar_mateus.jpg'; }}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
                <span className="mt-1.5 font-heading font-black text-xs sm:text-sm capitalize text-white">
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
                  <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-3 border-purple-400 shadow-glow-purple bg-slate-950 p-1">
                    <img 
                      src={`/assets/avatar_${currentQ.targetStudent2}.jpg`}
                      alt={currentQ.targetStudent2}
                      onError={(e) => { e.currentTarget.src = '/assets/avatar_carlos.jpg'; }}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
                <span className="mt-1.5 font-heading font-black text-xs sm:text-sm capitalize text-white">
                  {currentQ.targetStudent2}
                </span>
              </div>
            </div>
          )}

          {/* Activity 2: Reading Passage Snippet (Questions 6 to 10) */}
          {currentQ.activity === 2 && (
            <div className="mb-5 rounded-2xl bg-[#07101e]/80 border border-cyan-500/30 overflow-hidden shadow-inner">
              <div className="px-4 py-2 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
                <span className="text-xs font-heading font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
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
                <div className="p-4 text-xs md:text-sm leading-relaxed text-slate-300 font-medium italic">
                  {READING_TEXT.passage}
                </div>
              )}
            </div>
          )}

          {/* Prompt Sentence Box (Gold Text on Dark Navy with Cyan Border) */}
          <div className="text-center py-4 px-4 bg-[#081324] rounded-2xl border-2 border-cyan-500/60 mb-5 shadow-lg">
            <span className="text-xl sm:text-3xl font-heading font-black text-amber-300 tracking-wide block">
              {currentQ.sentence}
            </span>
            {currentQ.contextHint && (
              <p className="text-xs text-cyan-200/80 font-semibold mt-1">
                Context: {currentQ.contextHint}
              </p>
            )}
          </div>

          {/* 4 Interactive Neon Option Buttons (Quad Layout as in Mockup) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-4">
            {currentQ.optionsQuad.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              const isEliminated = eliminatedIndices.includes(idx);
              const isSelected = selectedOptionIndex === idx;

              let btnBorder = "border-cyan-400/70 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,210,255,0.4)]";
              let btnBg = "bg-[#0a1830]/90";
              let textColor = "text-white";

              if (isEliminated) {
                btnBorder = "border-slate-800 opacity-20 cursor-not-allowed";
                btnBg = "bg-slate-950";
              } else if (isQuestionResolved) {
                if (opt.isCorrect) {
                  btnBorder = "border-emerald-400 bg-emerald-950/80 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.5)]";
                  btnBg = "bg-emerald-950/80";
                } else if (isSelected && !opt.isCorrect) {
                  btnBorder = "border-red-500 bg-red-950/80 text-red-200";
                  btnBg = "bg-red-950/80";
                } else {
                  btnBorder = "border-slate-800 opacity-40";
                }
              } else if (isSelected) {
                btnBorder = "border-amber-400 bg-amber-950/60 text-amber-200";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isQuestionResolved || isEliminated}
                  onClick={() => handleSelectOption(idx)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border-2 font-heading font-bold text-left transition-all duration-200 flex items-center gap-3.5 cursor-pointer transform active:scale-98 ${btnBorder} ${btnBg} ${textColor}`}
                >
                  {/* Round Gold Letter Badge */}
                  <span className="w-9 h-9 rounded-full bg-[#07101e] border-2 border-amber-400 text-amber-400 flex items-center justify-center font-heading font-black text-sm flex-shrink-0 shadow-sm">
                    {letter}
                  </span>

                  {/* Option Text */}
                  <span className="text-sm sm:text-base font-extrabold flex-1">
                    {opt.text}
                  </span>

                  {/* Feedback icon */}
                  {isQuestionResolved && opt.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                  {isQuestionResolved && isSelected && !opt.isCorrect && (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
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
                    <span className="text-emerald-400 font-heading font-black text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> EXCELLENT! Resposta Correta (+{attemptsRecord[currentQ.id].pointsEarned} PTS)
                    </span>
                  ) : (
                    <span className="text-red-400 font-heading font-black text-sm flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Resposta Incorreta (0 PTS)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  {currentQ.explanation}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider rounded-full border-2 border-amber-600 shadow-glow-gold hover:from-amber-300 hover:to-amber-200 transform active:scale-95 transition-all flex items-center justify-center gap-2 flex-shrink-0"
              >
                <span>{currentIndex < sessionQuestions.length - 1 ? 'NEXT QUESTION' : 'VIEW RESULTS'}</span>
                <ArrowRight className="w-4 h-4" />
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
