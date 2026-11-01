import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';
import { fireConfetti } from '../../components/ui/ConfettiEffect';
import { isGuestPlayer } from '../../types';
import { getPlayerGrade } from '../../services/grade';
import { GRADE_LABELS, GRADE_QUIZ_THEME } from '../../data/level0Content';
import { Anfitriao, BotaoJogo, Cenario, Estrelas, Ficha, Fita, Hud, Icone, Painel, Titulo } from '../../components/kit';
import { fala as falaDoRoteiro } from '../../data/falasAnfitrioes';

// Resultado do Quiz (Missão 0, atividade 1): celebração com o Diretor Márcio e o placar da equipe.
export const QuizResultsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, quizResult } = useGame();

  useEffect(() => {
    audioService.playFanfare();
    fireConfetti();
  }, []);

  const falaMarcio = useMemo(() => falaDoRoteiro(0, 'meio', { nome: currentPlayer?.displayName, proxima: 'os Flashcards' }), [currentPlayer?.displayName]);

  if (!currentPlayer || !quizResult) {
    navigate('/missions');
    return null;
  }

  const isBlue = currentPlayer.team === 'blue';
  const isGuest = isGuestPlayer(currentPlayer);
  const grade = getPlayerGrade(currentPlayer) ?? '8';
  const quizTitle = `${GRADE_LABELS[grade]} · ${GRADE_QUIZ_THEME[grade]}`;
  const questionCount = quizResult.questionCount ?? 10;
  const maximo = questionCount * 100;

  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col">
      <Cenario nome="corredor" escurecer={0.22} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={0} />
        <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-5 py-4 short:py-1 grid grid-cols-1 wide:grid-cols-[14rem_1fr] short:grid-cols-1 gap-4 short:gap-2 items-end">
          <div className="hidden wide:flex short:hidden items-end">
            <Anfitriao nome="marcio" lado="esq" altura="h-[22rem] short:h-32" fala={falaMarcio.pt} traducao={falaMarcio.en} />
          </div>

          <Painel tipo="papel" liso className="p-5 sm:p-8 short:p-3 mb-4 short:mb-0.5 animate-rise-in">
            <div className="text-center">
              <Ficha cor="verde"><Icone nome="check" className="w-4 h-4" /> Quiz concluído</Ficha>
              <Titulo nivel={1} estilo="azul" className="text-4xl sm:text-5xl short:text-2xl mt-2 leading-none">Muito bem, {currentPlayer.displayName}!</Titulo>
              <p className="mt-2 short:mt-0 font-semibold text-nisia-tinta-suave short:text-sm">{quizTitle}</p>
              <div className="mt-4 short:mt-2 flex items-center justify-center">
                <Estrelas n={quizResult.stars} tamanho="w-14 h-14 short:w-9 short:h-9" />
              </div>
            </div>

            <div className="mt-5 short:mt-2 grid grid-cols-3 gap-3 short:gap-1.5">
              <Painel tipo="papel" className="p-3 short:p-2 text-center">
                <p className="text-xs uppercase tracking-wider font-display text-nisia-tinta-suave">Pontos</p>
                <p className="font-display text-3xl short:text-xl text-nisia-sol-700 inline-flex items-center gap-1"><Icone nome="moeda" className="w-7 h-7 short:w-5 short:h-5" /> {quizResult.totalScore}</p>
                <p className="text-xs font-semibold text-nisia-tinta-suave">de {maximo}</p>
              </Painel>
              <Painel tipo="papel" className="p-3 short:p-2 text-center">
                <p className="text-xs uppercase tracking-wider font-display text-nisia-tinta-suave">Certas</p>
                <p className="font-display text-3xl short:text-xl text-nisia-verde-700">{quizResult.correctCount}/{questionCount}</p>
                <p className="text-xs font-semibold text-nisia-tinta-suave">perguntas</p>
              </Painel>
              {isGuest ? (
                <Painel tipo="papel" className="p-3 short:p-2 text-center">
                  <p className="text-xs uppercase tracking-wider font-display text-nisia-tinta-suave">Equipe</p>
                  <p className="text-xs font-semibold text-nisia-tinta mt-1">Pontos de visitante não contam para as equipes.</p>
                  <Link to="/register" className="inline-block mt-1 text-xs font-display text-nisia-azul-700 underline">Fazer meu cadastro</Link>
                </Painel>
              ) : (
                <Painel tipo="papel" className={`p-3 short:p-2 text-center ${isBlue ? '!bg-nisia-azul-100' : '!bg-nisia-roxo-100'}`}>
                  <p className="text-xs uppercase tracking-wider font-display text-nisia-tinta-suave">Para a equipe</p>
                  <p className={`font-display text-3xl short:text-xl inline-flex items-center gap-1 ${isBlue ? 'text-nisia-azul-700' : 'text-nisia-roxo-700'}`}><Icone nome="escudo" className="w-7 h-7 short:w-5 short:h-5" cor={isBlue ? '#A9CDFF' : '#EDE3FF'} /> +{quizResult.totalScore}</p>
                  <p className="text-xs font-semibold text-nisia-tinta-suave">{isBlue ? 'Equipe Azul' : 'Equipe Roxa'}</p>
                </Painel>
              )}
            </div>

            <div className="mt-4 short:mt-1.5 flex items-center gap-3 short:hidden">
              <span className="text-xs uppercase tracking-wider font-display text-nisia-tinta-suave whitespace-nowrap">Missão 0</span>
              <Fita frac={0.5} className="flex-1" rotulo="Progresso da Missão 0" />
              <span className="font-display text-nisia-tinta whitespace-nowrap">1 de 2</span>
            </div>

            <div className="mt-5 short:mt-1.5 flex flex-col sm:flex-row items-center justify-center gap-3 short:gap-1.5 short:[&_.kit-btn]:min-h-[34px] short:[&_.kit-btn]:text-sm short:[&_.kit-btn]:py-0.5">
              <BotaoJogo cor="roxo" tamanho="lg" className="short:min-h-[40px] short:text-base w-full sm:w-auto" onClick={() => { audioService.playClick(); navigate('/flashcards'); }}>
                <Icone nome="carta" className="w-6 h-6" /> Próxima: Flashcards <Icone nome="seta" className="w-5 h-5" />
              </BotaoJogo>
              <BotaoJogo cor="papel" className="w-full sm:w-auto short:min-h-[36px] short:text-sm" onClick={() => { audioService.playClick(); navigate('/missions'); }}>Voltar à missão</BotaoJogo>
            </div>
          </Painel>
        </main>
      </div>
    </div>
  );
};
