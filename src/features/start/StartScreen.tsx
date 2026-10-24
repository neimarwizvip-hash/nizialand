import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, HelpCircle, KeyRound } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../components/ui/Button';
import { FullscreenButton } from '../../components/ui/FullscreenButton';
import { GameControls, LevelBadge } from '../../components/ui/GameControls';
import { NisialandLogo } from '../../components/ui/NisialandLogo';

export const StartScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer } = useGame();
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  // JOGAR leva ao Nível 0 (mapa das missões); sem aluno logado, primeiro entra com o código.
  const handleStartLevel0 = () => {
    navigate(currentPlayer ? '/missions' : '/register');
  };

  const handleGoToLogin = () => {
    navigate('/register');
  };

  // Tela de início: fachada da escola, logo e personagens oficiais ocupando a tela, como um "palco" 16:9.
  // No computador, selo, JOGAR e controles ficam nas áreas livres da arte (sem cobrir rostos nem o logo).
  // No celular, tudo empilha abaixo da arte, sem cortar.
  return (
    <div className="game-sky relative min-h-[100dvh] wide:h-[100dvh] wide:overflow-hidden flex flex-col items-center wide:justify-center overflow-x-hidden">
      <div className="absolute inset-0 sky-clouds pointer-events-none opacity-70" />
      <h1 className="sr-only">NISIALAND — English Adventure</h1>

      <div className="relative z-10 w-full wide:h-full flex flex-col gap-3 wide:gap-0 px-4 py-4 wide:p-0">
        {/* Arte oficial */}
        <figure className="order-2 wide:order-none relative w-full aspect-video wide:aspect-auto wide:absolute wide:inset-0 rounded-[1.5rem] wide:rounded-none overflow-hidden border-4 wide:border-0 border-white shadow-[0_8px_0_0_#7dd3fc] wide:shadow-none bg-sky-200 animate-rise-in">
          {/* Fachada sem personagens + logo e personagens oficiais por cima */}
          <img
            src="/assets/nisialand_school_facade_clean.jpg"
            alt="Escola Municipal Nísia Vilela Fernandes"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dois adultos de cada lado e as duas crianças no centro, abaixo do nome da escola.
              No celular deitado o painel da direita ocupa o canto: a Rosana sai e a Leia chega para perto das crianças */}
          <img
            src="/assets/diretor_marcio_hd.png"
            alt="Diretor Márcio"
            className="absolute bottom-0 left-[-4%] h-[70%] w-auto object-contain drop-shadow-[0_6px_10px_rgba(15,23,42,0.35)]"
          />
          <img
            src="/assets/coordenadora_vania.png"
            alt="Coordenadora Vânia"
            className="absolute bottom-0 left-[15%] h-[64%] w-auto object-contain drop-shadow-[0_6px_10px_rgba(15,23,42,0.35)]"
          />
          <img
            src="/assets/ze_cartinha.png"
            alt="Zé Cartinha"
            className="absolute bottom-0 right-[48%] h-[47%] w-auto object-contain drop-shadow-[0_6px_10px_rgba(15,23,42,0.35)]"
          />
          <img
            src="/assets/mane_zoeira.png"
            alt="Mané Zoeira"
            className="absolute bottom-0 left-[48%] h-[47%] w-auto object-contain drop-shadow-[0_6px_10px_rgba(15,23,42,0.35)]"
          />
          <img
            src="/assets/orientadora_leia.png"
            alt="Orientadora Leia"
            className="absolute bottom-0 right-[15%] short:right-[22%] h-[62%] short:h-[56%] w-auto object-contain drop-shadow-[0_6px_10px_rgba(15,23,42,0.35)]"
          />
          <img
            src="/assets/rosana.png"
            alt="Rosana"
            className="absolute bottom-0 right-[-3%] short:hidden h-[64%] w-auto object-contain drop-shadow-[0_6px_10px_rgba(15,23,42,0.35)]"
          />
          {/* Logo 20% maior, em primeiro plano */}
          <NisialandLogo size="xl" className="absolute z-20 top-[3%] left-1/2 -translate-x-1/2" />
        </figure>

        {/* Selo de nível + tela cheia (canto superior direito) */}
        <div className="order-1 wide:order-none flex items-center justify-end gap-2 wide:absolute wide:top-[2.5%] wide:right-[1.5%] animate-rise-in">
          <LevelBadge level={0} />
          <FullscreenButton />
        </div>

        {/* Como jogar (canto superior esquerdo, área livre do céu) */}
        <div className="order-5 wide:order-none flex justify-center wide:flex-col gap-2 wide:absolute wide:top-[2.5%] wide:left-[1.5%] wide:w-[11%] animate-rise-in">
          <Button variant="sky" size="sm" onClick={() => setShowHowToPlay(true)} className="gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Como jogar</span>
          </Button>
        </div>

        {/* JOGAR + acesso por código (área livre à direita do logo) */}
        <section className="order-3 wide:order-none w-full max-w-md mx-auto wide:mx-0 wide:max-w-none flex flex-col items-center gap-2 wide:absolute wide:top-[13%] short:top-[12.5%] wide:right-[1.5%] wide:w-[20%] animate-rise-in [animation-delay:200ms]">
          <div className="relative w-full">
            <span className="glow-ring absolute inset-0 rounded-full border-4 border-amber-300 pointer-events-none" />
            <button
              onClick={handleStartLevel0}
              className="btn-shine overflow-hidden group relative flex items-center justify-center w-full px-6 wide:px-3 py-4 short:py-2 xl:py-5 text-2xl short:text-xl xl:text-3xl font-heading font-black tracking-widest uppercase text-slate-950 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 rounded-full border-4 border-amber-600 shadow-[0_6px_0_0_#b45309] hover:from-amber-200 hover:to-amber-400 transition-all duration-150 active:translate-y-1 active:shadow-[0_2px_0_0_#b45309]"
              aria-label="Iniciar NISIALAND Nível 0"
            >
              <span className="flex items-center gap-2 xl:gap-3 drop-shadow-sm">
                <Play className="w-7 h-7 xl:w-8 xl:h-8 fill-slate-950 text-slate-950" />
                JOGAR
              </span>
            </button>
          </div>

          <button
            onClick={handleGoToLogin}
            className="mt-1 short:mt-0 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/90 text-blue-800 font-heading font-black text-[11px] xl:text-xs uppercase rounded-xl border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd] hover:bg-white transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            <span>Já tenho código</span>
          </button>

          {currentPlayer && (
            <div className="w-full bg-white/90 border-2 border-sky-200 px-2 py-1.5 rounded-xl flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center">
              <span className="text-[11px] text-slate-600 font-semibold">
                Jogando como: <strong className="text-blue-800 font-heading">{currentPlayer.displayName}</strong> ({currentPlayer.className})
              </span>
              <button
                onClick={() => navigate('/missions')}
                className="text-[11px] font-heading font-black text-amber-600 hover:underline uppercase"
              >
                Continuar missões →
              </button>
            </div>
          )}
        </section>

        {/* Treino livre, Ranking, Som e Música: no computador abaixo do "Como jogar" (não cobre os personagens);
            no celular deitado (sem espaço ao lado do logo) fica no canto inferior direito */}
        <GameControls className="order-4 wide:order-none w-full max-w-md mx-auto wide:w-auto wide:max-w-none wide:mx-0 wide:flex-nowrap wide:absolute wide:top-[9%] wide:left-[1.5%] short:top-auto short:left-auto short:bottom-[1%] short:right-[1.5%] short:w-[20%] short:flex-wrap short:justify-center animate-rise-in [animation-delay:320ms]" />
      </div>

      {/* A introdução da história (historia_nivel0.mp4) toca ao entrar na Missão 0 (PhaseStoryGate em /missions). */}
      {/* Música de fundo fica desligada até o aluno ligar no botão "Música" */}

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="animate-rise-in [animation-duration:0.45s] game-panel-gold max-w-lg w-full p-6 text-slate-700 max-h-[90dvh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b-2 border-amber-200">
              <h3 className="font-heading font-black text-xl text-blue-800 flex items-center gap-2">
                🎮 Como jogar NISIALAND
              </h3>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-9 h-9 rounded-full bg-white border-2 border-amber-300 text-amber-700 hover:bg-amber-50 text-base font-black"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <span className="bg-cyan-600 text-white font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">0</span>
                <div>
                  <strong className="text-blue-900 block font-heading">Nível 0: Desvie do Zé Cartinha!</strong>
                  Entre com seu código, confirme sua série (6º ao 9º ano) e complete as 2 atividades. O Zé Cartinha vai aparecer chamando para o bafo e embaralhando as cartas: mantenha o foco!
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-emerald-600 text-white font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">★</span>
                <div>
                  <strong className="text-blue-900 block font-heading">Introdução da história</strong>
                  Antes da Missão 0, um vídeo curto apresenta a escola e o <strong>Zé Cartinha</strong>. Você pode pular a história se já assistiu.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">1</span>
                <div>
                  <strong className="text-blue-900 block font-heading">Atividade 1: Quiz</strong>
                  Responda 10 perguntas de inglês da sua série. Até 100 pontos por pergunta! Dispense o Zé rapidinho com "Agora não, Zé!" e acerte para ganhar +10.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-purple-600 text-white font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">2</span>
                <div>
                  <strong className="text-blue-900 block font-heading">Atividade 2: Flashcards</strong>
                  Memorize os 8 estudantes em 30 segundos! Depois encontre as cartas certas sem perder seus 3 corações, mesmo quando o Zé embaralhar tudo!
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-cyan-600 text-white font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">🎮</span>
                <div>
                  <strong className="text-blue-900 block font-heading">Treino livre</strong>
                  Arcade sem cadastro: escolha sua série (6º ano ao Ensino Médio) e até 2 tópicos, faça combos e use os poderes 50/50 e +10s.
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <Button
                variant="gold"
                size="md"
                onClick={() => {
                  setShowHowToPlay(false);
                  handleStartLevel0();
                }}
                className="w-full"
              >
                Começar o Nível 0 ▶
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
