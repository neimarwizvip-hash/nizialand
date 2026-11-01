import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';
import { fireConfetti } from '../../components/ui/ConfettiEffect';
import { storageService } from '../../services/storage';
import { isGuestPlayer } from '../../types';
import { getPlayerGrade } from '../../services/grade';
import { GRADE_LABELS, GRADE_QUIZ_THEME } from '../../data/level0Content';
import { Anfitriao, BotaoJogo, Cenario, Ficha, Hud, Icone, Painel, Titulo } from '../../components/kit';

// Resultado final da Missão 0 (quiz + flashcards): medalha, placar e caminho para o Nível 1.
export const FinalResultsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, quizResult, flashcardResult, totalScore, level0Completed } = useGame();
  const [playerRank, setPlayerRank] = useState<number | null>(null);

  useEffect(() => {
    audioService.playFanfare();
    fireConfetti();
    const loadRank = async () => {
      if (currentPlayer) {
        const board = await storageService.getLeaderboard();
        const found = board.find(e => e.playerId === currentPlayer.id);
        if (found) setPlayerRank(found.rank);
      }
    };
    loadRank();
  }, [currentPlayer]);

  if (!currentPlayer) return null; // redirect handled by <RequirePlayer>
  const isGuest = isGuestPlayer(currentPlayer);
  const grade = getPlayerGrade(currentPlayer) ?? '8';
  const quizTitle = `${GRADE_LABELS[grade]} · ${GRADE_QUIZ_THEME[grade]}`;
  const qScore = quizResult?.totalScore || 0;
  const fcScore = flashcardResult?.totalScore || 0;
  const isBlue = currentPlayer.team === 'blue';

  // Medalha da Missão 0 pela pontuação total (mesmas faixas de antes).
  const medalha = totalScore >= 1300
    ? { nome: 'Estrela de Ouro', cor: '#FFD23F', borda: '#D98E00' }
    : totalScore >= 900
      ? { nome: 'Estrela de Prata', cor: '#D9DEE7', borda: '#8A94A6' }
      : { nome: 'Estrela de Bronze', cor: '#D9955B', borda: '#8A5A2B' };

  const ir = (caminho: string) => { audioService.playClick(); navigate(caminho); };

  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col">
      <Cenario nome="fachada" escurecer={0.25} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={0} />
        <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-5 py-4 short:py-1 grid grid-cols-1 wide:grid-cols-[14rem_1fr] short:grid-cols-1 gap-4 short:gap-2 items-end">
          <div className="hidden wide:flex short:hidden items-end">
            <Anfitriao nome="marcio" lado="esq" altura="h-[22rem] short:h-32"
              fala={`Missão 0 completa, ${currentPlayer.displayName}! O Zé Cartinha foi embora resmungando.`}
              traducao="Mission complete! Congratulations!" />
          </div>

          <Painel tipo="papel" liso className="p-5 sm:p-8 short:p-3 mb-4 short:mb-0.5 animate-rise-in">
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 short:gap-2 items-center">
              {/* Medalha */}
              <div className="justify-self-center">
                <svg viewBox="0 0 120 150" className="w-28 h-36 short:w-16 short:h-20 drop-shadow-[0_8px_8px_rgba(26,42,74,0.35)]" role="img" aria-label={`Medalha: ${medalha.nome}`}>
                  <path d="M40 0h18l6 44-24 10z" fill="#1F5FD0" /><path d="M80 0H62l-6 44 24 10z" fill="#143F97" />
                  <circle cx="60" cy="92" r="46" fill={medalha.cor} stroke={medalha.borda} strokeWidth="5" />
                  <circle cx="60" cy="92" r="36" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" />
                  <path d="M60 62l9 19 21 3-15 14 4 21-19-10-19 10 4-21-15-14 21-3z" fill="#fff" stroke={medalha.borda} strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <Ficha cor="verde"><Icone nome="trofeu" className="w-4 h-4" /> Missão 0 completa</Ficha>
                <Titulo nivel={1} estilo="azul" className="text-4xl sm:text-5xl short:text-2xl mt-2 leading-none">Parabéns, {currentPlayer.displayName}!</Titulo>
                <p className="mt-2 short:mt-1 font-display text-xl short:text-base text-nisia-sol-700">{medalha.nome}</p>
                <p className="text-sm font-semibold text-nisia-tinta-suave short:hidden">{quizTitle}</p>
              </div>
            </div>

            <div className="mt-5 short:mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 short:gap-1.5">
              <Painel tipo="papel" className="p-3 short:p-2 text-center">
                <p className="text-xs uppercase tracking-wider font-display text-nisia-tinta-suave">Quiz</p>
                <p className="font-display text-2xl short:text-lg text-nisia-azul-700">{qScore}</p>
              </Painel>
              <Painel tipo="papel" className="p-3 short:p-2 text-center">
                <p className="text-xs uppercase tracking-wider font-display text-nisia-tinta-suave">Flashcards</p>
                <p className="font-display text-2xl short:text-lg text-nisia-roxo-700">{fcScore}</p>
              </Painel>
              <Painel tipo="papel" className="p-3 short:p-2 text-center !bg-nisia-sol-100">
                <p className="text-xs uppercase tracking-wider font-display text-nisia-tinta-suave">Total</p>
                <p className="font-display text-2xl short:text-lg text-nisia-sol-700 inline-flex items-center gap-1"><Icone nome="moeda" className="w-6 h-6" /> {totalScore}</p>
              </Painel>
              <Painel tipo="papel" className={`p-3 short:p-2 text-center ${isBlue ? '!bg-nisia-azul-100' : '!bg-nisia-roxo-100'}`}>
                <p className="text-xs uppercase tracking-wider font-display text-nisia-tinta-suave">{isGuest ? 'Visitante' : 'Ranking'}</p>
                <p className={`font-display text-2xl short:text-lg ${isBlue ? 'text-nisia-azul-700' : 'text-nisia-roxo-700'}`}>{isGuest ? '—' : playerRank ? `#${playerRank}` : '…'}</p>
                <p className="text-[11px] font-semibold text-nisia-tinta-suave">{isGuest ? 'não entra no ranking' : isBlue ? 'Equipe Azul' : 'Equipe Roxa'}</p>
              </Painel>
            </div>

            <p className="mt-3 short:hidden text-sm text-nisia-tinta-suave text-center">
              {isGuest
                ? 'Você jogou como visitante: seus pontos não entram no ranking. Faça seu cadastro para guardá-los.'
                : 'Seu resultado foi guardado para o ranking da escola.'}
            </p>

            <div className="mt-5 short:mt-1.5 flex flex-wrap items-center justify-center gap-3 short:gap-1.5 short:[&_.kit-btn]:min-h-[34px] short:[&_.kit-btn]:text-sm short:[&_.kit-btn]:py-0.5">
              {isGuest && <BotaoJogo cor="verde" onClick={() => ir('/register')}><Icone nome="professor" className="w-5 h-5" cor="#DDF5D9" /> Fazer meu cadastro</BotaoJogo>}
              {level0Completed && <BotaoJogo cor="laranja" tamanho="lg" className="short:min-h-[40px] short:text-base" onClick={() => ir('/nivel1')}>Ir para o Nível 1 <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>}
              <BotaoJogo cor="sol" onClick={() => ir('/leaderboard')}><Icone nome="trofeu" className="w-5 h-5" cor="#0C2A66" /> Ver ranking</BotaoJogo>
              <BotaoJogo cor="papel" onClick={() => ir('/mapa')}><Icone nome="mapa" className="w-5 h-5" cor="#1F5FD0" /> Mapa</BotaoJogo>
              <BotaoJogo cor="papel" onClick={() => ir('/missions')}>Rever atividades</BotaoJogo>
            </div>
          </Painel>
        </main>
      </div>
    </div>
  );
};
