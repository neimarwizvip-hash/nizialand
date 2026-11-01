import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { BotaoJogo, Icone, Painel } from '../../components/kit';
import type { NomeIcone } from '../../components/kit';
import { audioService } from '../../services/audio';
import { FullscreenButton } from '../../components/ui/FullscreenButton';
import { GameControls, LevelBadge } from '../../components/ui/GameControls';
import { NisialandLogo } from '../../components/ui/NisialandLogo';

const COMO_JOGAR: { titulo: string; texto: string; icone: NomeIcone; cor: 'sol' | 'azul' | 'verde' | 'roxo' }[] = [
  { titulo: 'Nível 0: desvie do Zé Cartinha!', texto: 'Entre com seu código, confirme sua série (6º ao 9º ano) e complete as 2 atividades. O Zé vai chamar para o bafo e embaralhar as cartas: mantenha o foco!', icone: 'controle', cor: 'sol' },
  { titulo: 'Introdução da história', texto: 'Antes da Missão 0, um vídeo curto apresenta a escola e o Zé Cartinha. Você pode pular se já assistiu.', icone: 'estrela', cor: 'verde' },
  { titulo: 'Atividade 1: quiz', texto: 'Responda 5 perguntas de inglês da sua série, até 100 pontos cada. Dispense o Zé com "Agora não, Zé!" e acerte para ganhar +10.', icone: 'lupa', cor: 'azul' },
  { titulo: 'Atividade 2: flashcards', texto: 'Memorize os 8 estudantes em 30 segundos e encontre as cartas certas sem perder seus 3 corações, mesmo quando o Zé embaralhar tudo.', icone: 'carta', cor: 'roxo' },
  { titulo: 'Treino livre', texto: 'Arcade sem cadastro: escolha a série (6º ano ao Ensino Médio) e até 2 tópicos, faça combos e use os poderes 50/50 e +10s.', icone: 'jogar', cor: 'azul' },
];

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
      {/* Vistoria do professor: só aparece no `npm run dev`, nunca no site publicado. */}
      {import.meta.env.DEV && (
        <button type="button" onClick={() => navigate('/vistoria')} className="absolute bottom-2 left-2 z-50 text-xs text-white/60 hover:text-white underline">
          Vistoria
        </button>
      )}

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
        <div className="order-5 wide:order-none flex justify-center wide:flex-col gap-2 wide:absolute wide:top-[2.5%] wide:left-[1.5%] animate-rise-in">
          <BotaoJogo cor="papel" tamanho="sm" className="whitespace-nowrap" onClick={() => { audioService.playClick(); setShowHowToPlay(true); }}>
            <Icone nome="dica" className="w-4 h-4" />
            <span>Como jogar</span>
          </BotaoJogo>
        </div>

        {/* JOGAR + acesso por código (área livre à direita do logo) */}
        <section className="order-3 wide:order-none w-full max-w-md mx-auto wide:mx-0 wide:max-w-none flex flex-col items-center gap-2 wide:absolute wide:top-[13%] short:top-[12.5%] wide:right-[1.5%] wide:w-[20%] animate-rise-in [animation-delay:200ms]">
          <div className="relative w-full">
            <span className="absolute inset-0 rounded-2xl bg-nisia-sol-400 animate-anel-pulsa pointer-events-none" aria-hidden="true" />
            <BotaoJogo
              cor="sol"
              tamanho="lg"
              onClick={handleStartLevel0}
              className="btn-shine overflow-hidden relative w-full !text-3xl short:!text-xl xl:!text-4xl tracking-widest short:min-h-[44px]"
              aria-label="Iniciar NISIALAND Nível 0"
            >
              <Icone nome="jogar" className="w-8 h-8 short:w-6 short:h-6" cor="#1A2A4A" />
              JOGAR
            </BotaoJogo>
          </div>

          <BotaoJogo cor="papel" tamanho="sm" onClick={handleGoToLogin} className="mt-1 short:mt-0 whitespace-nowrap">
            <Icone nome="chave" className="w-4 h-4" />
            <span>Já tenho código</span>
          </BotaoJogo>

          {currentPlayer && (
            <Painel tipo="papel" liso className="w-full px-2 py-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center">
              <span className="text-[11px] text-nisia-tinta-suave font-semibold">
                Jogando como <strong className="text-nisia-azul-700 font-display">{currentPlayer.displayName}</strong> ({currentPlayer.className})
              </span>
              <button
                type="button"
                onClick={() => navigate('/mapa')}
                className="text-[11px] font-display text-nisia-laranja-700 hover:underline uppercase tracking-wide"
              >
                Continuar →
              </button>
            </Painel>
          )}
        </section>

        {/* Treino livre, Ranking, Som e Música: no computador abaixo do "Como jogar" (não cobre os personagens);
            no celular deitado (sem espaço ao lado do logo) fica no canto inferior direito */}
        <GameControls className="order-4 wide:order-none w-full max-w-md mx-auto wide:w-auto wide:max-w-none wide:mx-0 wide:flex-nowrap wide:absolute wide:top-[9%] wide:left-[1.5%] short:top-auto short:left-auto short:bottom-[1%] short:right-[1.5%] short:w-[20%] short:flex-wrap short:justify-center animate-rise-in [animation-delay:320ms]" />
      </div>

      {/* A introdução da história (historia_nivel0.mp4) toca ao entrar na Missão 0 (PhaseStoryGate em /missions). */}
      {/* Música de fundo fica desligada até o aluno ligar no botão "Música" */}

      {/* Como jogar: folha de regras pregada */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nisia-tinta/55 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true" aria-label="Como jogar NISIALAND">
          <Painel tipo="papel" fita className="animate-balao-in max-w-lg w-full p-5 pt-7 short:p-3 short:pt-5 max-h-[90dvh] overflow-y-auto">
            <div className="flex justify-between items-center gap-2 pb-2 border-b-2 border-dashed border-nisia-papel-linha">
              <h3 className="font-display text-xl short:text-base text-nisia-azul-700 inline-flex items-center gap-2">
                <Icone nome="controle" className="w-7 h-7" /> Como jogar NISIALAND
              </h3>
              <button type="button" onClick={() => setShowHowToPlay(false)} className="kit-btn kit-btn--papel kit-btn--sm !min-w-0 !px-2" aria-label="Fechar">
                <Icone nome="x" className="w-4 h-4" cor="#E5484D" />
              </button>
            </div>
            <ol className="py-3 short:py-2 flex flex-col gap-3 short:gap-1.5 text-sm short:text-xs text-nisia-tinta">
              {COMO_JOGAR.map(item => (
                <li key={item.titulo} className="flex items-start gap-3">
                  <span className={`kit-ficha kit-ficha--${item.cor} !w-8 !h-8 !p-0 justify-center shrink-0`}><Icone nome={item.icone} className="w-5 h-5" /></span>
                  <span className="leading-snug">
                    <strong className="block font-display text-nisia-azul-700">{item.titulo}</strong>
                    {item.texto}
                  </span>
                </li>
              ))}
            </ol>
            <BotaoJogo cor="sol" onClick={() => { setShowHowToPlay(false); handleStartLevel0(); }} className="w-full">
              Começar o Nível 0 <Icone nome="seta" className="w-5 h-5" />
            </BotaoJogo>
          </Painel>
        </div>
      )}
    </div>
  );
};
