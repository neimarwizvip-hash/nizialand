import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { shuffleArray } from '../../data/quizQuestions';
import { cardFact, getFlashcardSet } from '../../data/level0Content';
import { getPlayerGrade } from '../../services/grade';
import { ZeCartinha } from '../../components/ze/ZeCartinha';
import { FlashcardStudent, FlashcardChallenge, FlashcardRoundAttempt, FlashcardResult } from '../../types';
import { audioService } from '../../services/audio';
import { speechService } from '../../services/speech';
import { fireConfetti } from '../../components/ui/ConfettiEffect';
import { BotaoJogo, Cenario, Cronometro, Ficha, Hud, Icone, Moedas, Painel } from '../../components/kit';

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
  const { currentPlayer: maybePlayer, saveFlashcardResult } = useGame();
  // Guaranteed by <RequirePlayer> in App routes
  const currentPlayer = maybePlayer!;

  // Conjunto de cartas da série do aluno (8º = idades; 6º, 7º e 9º = fatos em inglês)
  const [flashcardSet] = useState(() => getFlashcardSet(getPlayerGrade(currentPlayer) ?? '8'));
  // Shuffled cards array on every game session / mount so memorization positions are never identical
  const [sessionStudents, setSessionStudents] = useState<FlashcardStudent[]>(() => shuffleArray(flashcardSet.students));
  // Shuffled challenges for dynamic round variation
  const [sessionChallenges] = useState<FlashcardChallenge[]>(() => shuffleArray(flashcardSet.challenges));
  const showsAge = !flashcardSet.students.some((s) => s.info);

  // Zé Cartinha embaralha as cartas em 1 ou 2 rodadas (nunca na primeira).
  // Depois do embaralhamento há uma espiada rápida de 3s; cliques ficam bloqueados durante o evento.
  const [zeRounds] = useState<number[]>(() => shuffleArray([1, 2, 3, 4]).slice(0, Math.random() < 0.5 ? 1 : 2));
  const zeDoneRef = useRef<number[]>([]);
  const zeTimersRef = useRef<number[]>([]);
  // Acertos seguidos: a partir do 2º toca o som de combo.
  const streakRef = useRef<number>(0);
  const [zeVisible, setZeVisible] = useState<boolean>(false);
  const [zeShuffling, setZeShuffling] = useState<boolean>(false);
  const [zePeek, setZePeek] = useState<boolean>(false);
  const zeEventActive = zeVisible || zeShuffling || zePeek;

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

  // Evento do Zé no início das rodadas sorteadas
  useEffect(() => {
    if (phase !== 'challenge' || !zeRounds.includes(currentRoundIndex) || zeDoneRef.current.includes(currentRoundIndex)) return;
    zeDoneRef.current.push(currentRoundIndex);
    setZeVisible(true);
    setZeShuffling(true);
    zeTimersRef.current.push(window.setTimeout(() => {
      audioService.playFlip();
      setSessionStudents((prev) => shuffleArray(prev));
      setZeShuffling(false);
      setZePeek(true);
    }, 1400));
    zeTimersRef.current.push(window.setTimeout(() => {
      setZePeek(false);
      setZeVisible(false);
    }, 4400));
  }, [phase, currentRoundIndex, zeRounds]);

  useEffect(() => () => zeTimersRef.current.forEach((t) => window.clearTimeout(t)), []);

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
    if (phase !== 'challenge' || zeEventActive || revealedCardIds.includes(student.id)) return;

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
      streakRef.current += 1;
      if (streakRef.current >= 2) audioService.playCombo(streakRef.current);
      fireConfetti();
      setAccumulatedScore(prev => prev + points);

      setRoundFeedback({
        type: 'correct',
        message: showsAge ? `CORRECT! ${student.name} is ${student.age} years old!` : `CORRECT! ${student.name}: "${cardFact(student)}"`,
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
      streakRef.current = 0;
      const newHearts = heartsLeft - 1;
      setHeartsLeft(newHearts);

      if (newHearts <= 0) {
        // Out of hearts for this round
        setRoundFeedback({
          type: 'wrong',
          message: showsAge ? `NO MORE HEARTS! ${student.name} is ${student.age} years old.` : `NO MORE HEARTS! ${student.name}: "${cardFact(student)}"`,
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
          message: showsAge ? `Not quite! ${student.name} is ${student.age} years old.` : `Not quite! ${student.name}: "${cardFact(student)}"`,
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

  const Coracao: React.FC<{ cheio: boolean }> = ({ cheio }) => (
    <svg viewBox="0 0 24 24" className={`w-6 h-6 short:w-5 short:h-5 ${cheio ? 'scale-110' : 'opacity-40'}`} aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.1 3.4 4.5 7 4.5c2 0 3.6 1.2 5 3 1.4-1.8 3-3 5-3 3.6 0 6 3.6 4.5 7.3C19.5 16.4 12 21 12 21z" fill={cheio ? '#E5484D' : '#F3E4BE'} stroke="#1A2A4A" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col overflow-x-hidden">
      <Cenario nome="corredor" escurecer={0.22} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={0} mostrarMoedas={false} />

        <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 py-3 md:py-5 short:py-1 flex flex-col justify-center">
          <Painel tipo="mural" as="section" aria-label="Flashcards" className="p-3 sm:p-5 short:p-2 flex flex-col gap-3 short:gap-1">

            {/* Linha de cima: fase, equipe, tempo/corações, pontos */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Ficha cor="roxo">{phase === 'memorize' ? 'Fase 1: memorize' : `Rodada ${currentRoundIndex + 1} de ${sessionChallenges.length}`}</Ficha>
                <Ficha cor={isBlue ? 'azul' : 'roxo'} className="hidden sm:inline-flex"><Icone nome="escudo" className="w-4 h-4" cor={isBlue ? '#A9CDFF' : '#EDE3FF'} /> {isBlue ? 'Azul' : 'Roxa'}</Ficha>
              </div>
              <div className="flex items-center gap-2">
                {phase === 'memorize' ? (
                  <>
                    <Cronometro segundos={countdown} total={30} alerta={5} tamanho={52} className="short:!w-10 short:!h-10" />
                    <BotaoJogo cor="azul" tamanho="sm" onClick={handleSkipTimer}>Estou pronto! <Icone nome="seta" className="w-4 h-4" /></BotaoJogo>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-nisia-papel border-2 border-nisia-papel-linha px-2 py-1" aria-label={`${heartsLeft} chances restantes`} role="img">
                    {[1, 2, 3].map(i => <Coracao key={i} cheio={i <= heartsLeft} />)}
                  </span>
                )}
                <Moedas valor={accumulatedScore} compacto />
              </div>
            </div>

            {/* Enunciado em papel */}
            <Painel tipo="papel" liso className="px-4 py-3 short:py-1.5 text-center">
              {phase === 'memorize' ? (
                <>
                  <p className="font-display text-xl sm:text-2xl short:text-base text-nisia-azul-700 leading-tight">{flashcardSet.memorizeTitle}</p>
                  <p className="text-sm text-nisia-tinta-suave font-semibold mt-0.5 short:hidden">Você tem <strong className="text-nisia-laranja-700">{countdown} segundos</strong> antes de as cartas virarem.</p>
                </>
              ) : (
                <>
                  <p className="inline-flex items-center gap-2 text-xs font-display uppercase tracking-widest text-nisia-tinta-suave">
                    {zePeek ? 'Espiada rápida!' : 'Encontre a carta certa'}
                    <button type="button" onClick={handlePronounce} className="kit-hud__btn !h-7 !min-w-0 !px-1.5 !bg-nisia-azul-500 !border-nisia-azul-700" title="Ouvir em inglês" aria-label="Ouvir em inglês"><Icone nome="som" className="w-4 h-4" /></button>
                  </p>
                  <p className="font-display text-xl sm:text-3xl short:text-lg text-nisia-azul-700 leading-tight">{currentChallenge?.questionEn}</p>
                  <p className="text-sm short:text-xs text-nisia-tinta-suave italic short:hidden">({currentChallenge?.questionPt})</p>
                </>
              )}
            </Painel>

            {/* 8 cartas (4 × 2) */}
            <div className={`grid grid-cols-4 short:grid-cols-8 gap-2.5 sm:gap-3.5 short:gap-1 ${zeShuffling ? 'animate-card-shuffle' : ''}`}>
              {sessionStudents.map((student) => {
                const isRevealed = phase === 'memorize' || zePeek || revealedCardIds.includes(student.id);
                const isLastPicked = lastPickedStudent?.id === student.id;
                const isCorrectMatch = currentChallenge?.validateCard(student);
                const colorInfo = STUDENT_COLORS[student.id] || { bg: 'bg-[#bae6fd]', text: 'text-slate-900', ageBg: 'bg-amber-400 text-slate-950' };
                let borda = 'border-nisia-papel-linha';
                if (revealedCardIds.includes(student.id) && phase !== 'memorize') {
                  if (isCorrectMatch) borda = 'border-nisia-verde-500 ring-4 ring-nisia-verde-400/60';
                  else if (isLastPicked) borda = 'border-nisia-erro ring-4 ring-red-400/60';
                }
                const clicavel = phase === 'challenge' && !zeEventActive && !revealedCardIds.includes(student.id);
                return (
                  <button
                    type="button"
                    key={student.id}
                    onClick={() => handleCardClick(student)}
                    disabled={!clicavel}
                    aria-label={isRevealed ? `${student.name}: ${cardFact(student)}` : 'Carta virada'}
                    className={`perspective-1000 aspect-[3/4] max-h-56 short:max-h-none w-full select-none transition-transform duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-nisia-azul-400 rounded-xl ${clicavel ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'}`}
                  >
                    <span className={`block w-full h-full relative transition-transform duration-500 transform-style-preserve-3d rounded-xl ${isRevealed ? '' : 'rotate-y-180'}`}>
                      {/* Frente: foto do estudante em papel */}
                      <span className={`absolute inset-0 rounded-xl border-2 kit-papel kit-papel--liso backface-hidden p-1.5 short:p-1 flex flex-col items-center ${borda}`}>
                        <span className="w-full flex items-center justify-between px-0.5">
                          <span className="font-display text-sm short:text-[10px] text-nisia-tinta truncate">{student.name}</span>
                          {showsAge && <span className="kit-ficha kit-ficha--sol text-[10px] short:text-[9px] px-1.5 short:px-1 py-0">{student.age}</span>}
                        </span>
                        <span className={`relative w-full flex-1 my-1 short:my-0.5 rounded-lg overflow-hidden ${colorInfo.bg} border border-nisia-papel-linha`}>
                          <img src={student.img} alt="" onError={(e) => { e.currentTarget.src = `/assets/avatar_${student.id}.jpg`; }} className="w-full h-full object-cover" draggable={false} />
                        </span>
                        <span className={`w-full text-center font-semibold text-nisia-laranja-700 leading-tight ${showsAge ? 'text-[11px]' : 'text-[10px] short:text-[9px] line-clamp-2 short:line-clamp-1'}`}>{cardFact(student)}</span>
                      </span>
                      {/* Verso: carta oficial NISIALAND */}
                      <span className="absolute inset-0 rounded-xl border-[3px] border-nisia-sol-500 backface-hidden rotate-y-180 flex flex-col items-center justify-center text-center overflow-hidden shadow-[0_4px_0_0_#B36E00]" style={{ background: 'repeating-linear-gradient(45deg, #1F5FD0 0 10px, #1A4FB0 10px 20px)' }}>
                        <span className="absolute inset-2 rounded-lg border-2 border-nisia-sol-400/70" aria-hidden="true" />
                        <Icone nome="carta" className="w-10 h-10 short:w-7 short:h-7 text-nisia-sol-400 drop-shadow" />
                        <span className="font-display text-sm short:text-[9px] text-nisia-sol-400 tracking-wider mt-1 drop-shadow">NISIALAND</span>
                        <span className="text-[10px] short:hidden text-white/90 font-semibold mt-0.5">toque para virar</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Resultado da rodada */}
            {phase === 'round_completed' && (
              <Painel tipo="papel" liso className="px-4 py-3 short:py-2 flex flex-col sm:flex-row items-center justify-between gap-3 animate-rise-in">
                <div className="text-left">
                  <p className={`inline-flex items-center gap-2 font-display text-lg short:text-base ${roundFeedback.type === 'correct' ? 'text-nisia-verde-700' : 'text-nisia-erro'}`}>
                    <Icone nome={roundFeedback.type === 'correct' ? 'check' : 'x'} className="w-6 h-6" /> {roundFeedback.message}
                  </p>
                  <p className="text-sm text-nisia-tinta max-w-xl leading-snug">{roundFeedback.detail}</p>
                </div>
                <BotaoJogo cor="laranja" onClick={handleNextRound} className="shrink-0">
                  {currentRoundIndex < sessionChallenges.length - 1 ? 'Próxima rodada' : 'Ver resultado'} <Icone nome="seta" className="w-5 h-5" />
                </BotaoJogo>
              </Painel>
            )}
          </Painel>
        </main>
      </div>

      <ZeCartinha
        visible={zeVisible}
        message={zePeek ? 'Espia rápida! Lembra onde cada um foi parar?' : 'Hehe! Vou embaralhar essas cartas!'}
      />
    </div>
  );
};
