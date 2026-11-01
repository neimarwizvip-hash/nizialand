import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { READING_TEXT, shuffleArray } from '../../data/quizQuestions';
import { getQuizSession } from '../../data/level0Content';
import { getPlayerGrade } from '../../services/grade';
import { ZeCartinha } from '../../components/ze/ZeCartinha';
import { QuizQuestion, QuizQuestionAttempt, QuizResult } from '../../types';

import {
  QUESTION_SECONDS, QUESTION_WARNING_SECONDS, ZE_LINE_MS, ZE_SIZES,
  zeSizeStage, isZeBlocking, zeLine, pickZeQuestions, timedOutAttempt,
} from './zeRules';
import { audioService } from '../../services/audio';
import { speechService } from '../../services/speech';
import { fireConfetti } from '../../components/ui/ConfettiEffect';
import { BotaoJogo, Cenario, Cronometro, Ficha, Fita, Hud, Icone, Moedas, Painel } from '../../components/kit';

export const QuizScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer: maybePlayer, saveQuizResult } = useGame();
  // Guaranteed by <RequirePlayer> in App routes
  const currentPlayer = maybePlayer!;

  // Real quiz start time
  const startedAtRef = useRef<string>(new Date().toISOString());
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

  // Zé Cartinha aparece em exatamente 2 perguntas sorteadas (nunca a 1ª).
  // Chega pequeno no canto, cresce no lugar a cada fala (~2 s) e em ~6 s cobre e trava as respostas até ser fechado.
  // O tempo da pergunta continua correndo. Fechar rápido ("Agora não, Zé!") e acertar vale +10.
  const [zeQuestions] = useState<number[]>(() => pickZeQuestions(sessionQuestions.length));
  const [zeVisible, setZeVisible] = useState<boolean>(false);
  const [zeTick, setZeTick] = useState<number>(0);
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
  const [showReadingText, setShowReadingText] = useState<boolean>(() => !(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-height: 480px)').matches));
  // First-miss feedback (shake + "try again" banner)
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const [showTryAgain, setShowTryAgain] = useState<boolean>(false);
  
  // Powerups (educational helpers)
  const [fiftyFiftyLeft, setFiftyFiftyLeft] = useState<number>(2);
  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);
  const [questionSecondsLeft, setQuestionSecondsLeft] = useState<number>(QUESTION_SECONDS);

  const currentQ = sessionQuestions[currentIndex] || sessionQuestions[0];
  const isBlue = currentPlayer.team === 'blue';

  const clearZeTimers = () => {
    zeTimersRef.current.forEach((t) => { window.clearTimeout(t); window.clearInterval(t); });
    zeTimersRef.current = [];
  };

  // A cada pergunta sorteada o Zé entra 1,2s depois e troca de fala a cada ZE_LINE_MS.
  // Não vai embora sozinho: insiste até o aluno fechar ou a pergunta acabar.
  useEffect(() => {
    clearZeTimers();
    setZeVisible(false);
    setZeTick(0);
    setZeBonusArmed(false);
    window.speechSynthesis?.cancel();
    if (zeQuestions.includes(currentIndex)) {
      zeTimersRef.current.push(window.setTimeout(() => {
        zeShownAtRef.current = Date.now();
        setZeVisible(true);
        zeTimersRef.current.push(window.setInterval(() => setZeTick((t) => t + 1), ZE_LINE_MS));
      }, 1200));
    }
    return () => {
      clearZeTimers();
      window.speechSynthesis?.cancel();
    };
  }, [currentIndex, zeQuestions]);

  // Cada fala nova: balão + voz (se o som estiver ligado). Some quando a pergunta é resolvida.
  useEffect(() => {
    if (zeVisible && isQuestionResolved) {
      clearZeTimers();
      setZeVisible(false);
      window.speechSynthesis?.cancel();
      return;
    }
    if (zeVisible && audioService.isSoundOn()) speechService.speakPortuguese(zeLine(zeTick));
  }, [zeVisible, zeTick, isQuestionResolved]);

  const zeBlocking = zeVisible && isZeBlocking(zeTick);

  const handleDismissZe = () => {
    audioService.playClick();
    clearZeTimers();
    setZeVisible(false);
    window.speechSynthesis?.cancel();
    if (Date.now() - zeShownAtRef.current <= 3000) setZeBonusArmed(true);
  };

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
    if (zeBlocking || isQuestionResolved || shakeIndex !== null || eliminatedIndices.includes(index)) return;

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
    setAttemptsRecord(prev => ({ ...prev, [currentQ.id]: timedOutAttempt(currentQ.id, attemptsUsed) }));
  };

  useEffect(() => {
    startedAtRef.current = new Date().toISOString();
  }, []);

  useEffect(() => {
    setQuestionSecondsLeft(QUESTION_SECONDS);
  }, [currentIndex]);

  useEffect(() => {
    if (isQuestionResolved) return;

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
  }, [currentIndex, isQuestionResolved]);

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
      if (totalScore >= sessionQuestions.length * 90) stars = 3;
      else if (totalScore >= sessionQuestions.length * 60) stars = 2;

      const result: QuizResult = {
        completed: true,
        totalScore,
        correctCount: correctAnswersCount,
        questionCount: sessionQuestions.length,
        stars,
        startedAt: startedAtRef.current,
        completedAt: new Date().toISOString(),
        attempts: attemptsRecord
      };

      await saveQuizResult(result);
      navigate('/quiz/results');
    }
  };

  const fracTempo = QUESTION_SECONDS > 0 ? questionSecondsLeft / QUESTION_SECONDS : 0;
  const ultimo = currentIndex >= sessionQuestions.length - 1;

  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col overflow-x-hidden">
      {/* Cenário: corredor da escola, sem véu branco */}
      <Cenario nome="corredor" escurecer={0.22} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={0} mostrarMoedas={false} />

        <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 py-3 md:py-5 short:py-1 flex flex-col justify-center">
          {/* Mural de cortiça: a pergunta e as respostas são papéis pregados nele */}
          <Painel tipo="mural" as="section" aria-label="Quiz" className="p-3 sm:p-5 short:p-2 flex flex-col gap-3 short:gap-1">

            {/* Linha de cima: pergunta, tempo, pontos, equipe */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Ficha cor="sol">Pergunta {currentIndex + 1} de {sessionQuestions.length}</Ficha>
                <span className="hidden md:inline short:hidden text-sm font-semibold text-nisia-papel drop-shadow-[0_1px_0_rgba(90,50,10,0.8)]">{currentQ.activityTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                <Cronometro segundos={questionSecondsLeft} total={QUESTION_SECONDS} alerta={QUESTION_WARNING_SECONDS} tamanho={52} className="short:!w-10 short:!h-10" />
                <Moedas valor={accumulatedScore} compacto />
                <Ficha cor={isBlue ? 'azul' : 'roxo'}><Icone nome="escudo" className="w-4 h-4" cor={isBlue ? '#A9CDFF' : '#EDE3FF'} /> {isBlue ? 'Azul' : 'Roxa'}</Ficha>
              </div>
            </div>
            <Fita frac={(currentIndex + 1) / sessionQuestions.length} rotulo="Progresso do quiz" className="short:hidden" />

            {/* Instrução + apoios */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="inline-flex items-center gap-2 font-display text-base sm:text-lg short:text-sm text-nisia-papel drop-shadow-[0_2px_0_rgba(90,50,10,0.8)]">
                <Icone nome="livro" className="w-5 h-5" cor="#FFD23F" />
                <span>{currentQ.instruction}</span>
              </p>
              <div className="flex items-center gap-2">
                <BotaoJogo cor="azul" tamanho="sm" onClick={handlePronounce} title="Ouvir a frase em inglês">
                  <Icone nome="som" className="w-5 h-5" cor="#FFD23F" /> Ouvir
                </BotaoJogo>
                <BotaoJogo
                  cor="sol" tamanho="sm"
                  onClick={handleUseFiftyFifty}
                  disabled={fiftyFiftyLeft <= 0 || isQuestionResolved || attemptsUsed > 0}
                  title="Eliminar duas respostas erradas"
                >
                  <Icone nome="fogo" className="w-5 h-5" /> 50/50 ({fiftyFiftyLeft})
                </BotaoJogo>
                <BotaoJogo cor="roxo" tamanho="sm" onClick={() => { audioService.playClick(); setShowHint(!showHint); }} title="Dica de gramática" aria-pressed={showHint}>
                  <Icone nome="dica" className="w-5 h-5" /> Dica
                </BotaoJogo>
              </div>
            </div>

            {showHint && (
              <Painel tipo="papel" liso fita className="px-4 py-3 pt-4 short:py-2 text-sm sm:text-base animate-rise-in">
                <span className="font-display text-nisia-roxo-700">Dica · Grammar tip: </span>{currentQ.hint}
              </Painel>
            )}

            <div className="contents short:flex short:items-stretch short:gap-2">
            {/* Atividade 1: duelo VS com as fotos dos alunos pregadas */}
            {currentQ.targetStudent1 && currentQ.targetStudent2 && (
              <div className="relative flex items-center justify-center gap-5 sm:gap-10 short:gap-3 py-1 short:py-0 short:shrink-0">
                {[currentQ.targetStudent1, currentQ.targetStudent2].map((aluno, i) => (
                  <figure key={aluno} className={`relative kit-papel kit-papel--liso kit-fita p-1.5 pb-2 ${i === 0 ? '-rotate-2' : 'rotate-2'}`}>
                    <img
                      src={`/assets/avatar_${aluno}.jpg`}
                      alt={aluno}
                      onError={(e) => { e.currentTarget.src = i === 0 ? '/assets/avatar_mateus.jpg' : '/assets/avatar_carlos.jpg'; }}
                      className="w-24 h-24 sm:w-28 sm:h-28 short:w-14 short:h-14 object-cover rounded-md border border-nisia-papel-linha"
                    />
                    <figcaption className="mt-1 text-center font-display text-base short:text-sm capitalize text-nisia-tinta">{aluno}</figcaption>
                  </figure>
                ))}
                <span className="absolute left-1/2 -translate-x-1/2 kit-ficha kit-ficha--sol text-lg px-3 py-1 shadow-[0_4px_0_0_#B36E00]" aria-hidden="true">VS</span>
              </div>
            )}

            {/* Atividade 2: texto de leitura (bilhete pregado) */}
            {currentQ.activity === 2 && (
              <Painel tipo="papel" fita className="px-4 py-3 pt-4 short:py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 font-display text-nisia-laranja-700">
                    <Icone nome="livro" className="w-5 h-5" /> {READING_TEXT.title}
                  </span>
                  <button type="button" onClick={() => setShowReadingText(!showReadingText)} className="inline-flex items-center gap-1 text-sm font-semibold text-nisia-azul-700 underline">
                    <Icone nome="olho" className="w-4 h-4" /> {showReadingText ? 'Esconder texto' : 'Mostrar texto'}
                  </button>
                </div>
                {showReadingText && <p className="mt-2 short:mt-1 text-sm md:text-base short:text-xs leading-relaxed short:leading-snug font-medium italic">{READING_TEXT.passage}</p>}
              </Painel>
            )}

            {/* A pergunta, em papel grande */}
            <Painel tipo="papel" liso className="text-center px-4 py-4 short:py-2 short:flex-1 short:flex short:flex-col short:justify-center">
              <svg viewBox="0 0 24 24" className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 drop-shadow-[0_3px_2px_rgba(0,0,0,0.35)]" aria-hidden="true"><circle cx="12" cy="10" r="7" fill="#E5484D" /><circle cx="9.5" cy="7.5" r="2.2" fill="#fff" fillOpacity="0.7" /><path d="M12 17v5" stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" /></svg>
              <p className="font-display text-2xl sm:text-4xl short:text-xl leading-tight text-nisia-azul-700">{currentQ.sentence}</p>
              {currentQ.contextHint && <p className="mt-1 text-sm short:text-xs text-nisia-tinta-suave font-semibold">{currentQ.contextHint}</p>}
            </Painel>
            </div>

            {/* Aviso de 1ª tentativa errada */}
            {showTryAgain && !isQuestionResolved && (
              <p role="status" aria-live="polite" className="kit-ficha kit-ficha--erro self-center text-sm normal-case tracking-normal px-4 py-1.5 animate-rise-in">
                <Icone nome="x" className="w-5 h-5" /> Quase! Tente de novo: ainda vale 50 pontos.
              </p>
            )}

            {/* Quatro respostas: papéis pregados no mural */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 short:gap-1.5">
              {currentQ.optionsQuad.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isEliminated = eliminatedIndices.includes(idx);
                const isSelected = selectedOptionIndex === idx;
                let estado = 'bg-nisia-papel border-nisia-papel-linha hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#E7D3A6]';
                let bolinha = 'bg-nisia-sol-400 border-nisia-sol-700 text-nisia-tinta';
                let marca: React.ReactNode = null;
                if (shakeIndex === idx) {
                  estado = 'bg-red-50 border-nisia-erro animate-shake';
                  bolinha = 'bg-nisia-erro border-red-800 text-white';
                } else if (isEliminated) {
                  estado = 'bg-nisia-papel-escuro border-nisia-papel-linha opacity-35 line-through';
                } else if (isQuestionResolved) {
                  if (opt.isCorrect) {
                    estado = 'bg-nisia-verde-100 border-nisia-verde-500 ring-4 ring-nisia-verde-400/50';
                    bolinha = 'bg-nisia-verde-500 border-nisia-verde-700 text-white';
                    marca = <Icone nome="check" className="w-7 h-7 shrink-0" />;
                  } else if (isSelected) {
                    estado = 'bg-red-50 border-nisia-erro';
                    bolinha = 'bg-nisia-erro border-red-800 text-white';
                    marca = <Icone nome="x" className="w-7 h-7 shrink-0" />;
                  } else {
                    estado = 'bg-nisia-papel border-nisia-papel-linha opacity-50';
                  }
                } else if (isSelected) {
                  estado = 'bg-nisia-sol-100 border-nisia-sol-500';
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={zeBlocking || isQuestionResolved || isEliminated}
                    onClick={() => handleSelectOption(idx)}
                    className={`relative text-left flex items-center gap-3 px-3.5 py-3 short:py-1 short:px-2.5 rounded-xl border-2 shadow-[0_4px_0_0_#E7D3A6] transition-all duration-150 disabled:cursor-not-allowed font-body text-nisia-tinta ${['-rotate-[0.7deg]', 'rotate-[0.6deg]', 'rotate-[0.5deg]', '-rotate-[0.6deg]'][idx]} hover:rotate-0 ${estado}`}
                  >
                    <svg viewBox="0 0 24 24" className="absolute -top-2.5 right-4 w-5 h-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]" aria-hidden="true"><circle cx="12" cy="10" r="7" fill={isEliminated ? '#8A8A8A' : '#1F5FD0'} /><circle cx="9.5" cy="7.5" r="2.2" fill="#fff" fillOpacity="0.7" /><path d="M12 17v5" stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" /></svg>
                    <span className={`w-10 h-10 short:w-7 short:h-7 rounded-full border-2 flex items-center justify-center font-display text-lg short:text-base shrink-0 shadow-[0_2px_0_0_rgba(26,42,74,0.25)] ${bolinha}`}>{letter}</span>
                    <span className="text-base sm:text-lg short:text-sm font-semibold flex-1 leading-snug">{opt.text}</span>
                    {marca}
                  </button>
                );
              })}
            </div>

            {/* Resultado da pergunta + seguir */}
            {isQuestionResolved && (
              <Painel tipo="papel" liso className="px-4 py-3 short:py-2 flex flex-col sm:flex-row items-center justify-between gap-3 animate-rise-in">
                <div className="text-left">
                  {attemptsRecord[currentQ.id]?.isCorrect ? (
                    <p className="inline-flex items-center gap-2 font-display text-lg text-nisia-verde-700">
                      <Icone nome="check" className="w-6 h-6" /> Muito bem! Resposta certa (+{attemptsRecord[currentQ.id].pointsEarned} pts)
                    </p>
                  ) : (
                    <p className="inline-flex items-center gap-2 font-display text-lg text-nisia-erro">
                      <Icone nome="x" className="w-6 h-6" /> Resposta errada (0 pts)
                    </p>
                  )}
                  <p className="mt-1 text-sm sm:text-base text-nisia-tinta max-w-xl leading-snug">{currentQ.explanation}</p>
                </div>
                <BotaoJogo cor="laranja" onClick={handleNextQuestion} className="w-full sm:w-auto shrink-0">
                  {ultimo ? 'Ver resultado' : 'Próxima'} <Icone nome="seta" className="w-5 h-5" />
                </BotaoJogo>
              </Painel>
            )}
          </Painel>
          {/* Mané Zoeira espia pela borda do mural (só em tela larga; nunca cobre respostas) */}
          <img
            src="/assets/mane_zoeira.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="hidden largo:block fixed left-0 bottom-0 h-[38vh] max-h-80 w-auto object-contain object-bottom pointer-events-none select-none drop-shadow-[0_10px_12px_rgba(12,42,102,0.45)] -scale-x-100 opacity-95"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        </main>
      </div>

      <ZeCartinha
        visible={zeVisible}
        message={zeLine(zeTick)}
        actionLabel={zeVisible ? 'Agora não, Zé!' : undefined}
        onAction={zeVisible ? handleDismissZe : undefined}
        imageClassName={ZE_SIZES[zeSizeStage(zeTick)]}
      />

      {zeToast && (
        <div role="status" className="fixed top-20 left-1/2 -translate-x-1/2 z-40 kit-ficha kit-ficha--verde text-base normal-case tracking-normal px-5 py-2 animate-rise-in">
          {zeToast}
        </div>
      )}
    </div>
  );
};
