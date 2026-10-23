import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, HelpCircle, Volume2, VolumeX, Music, Sparkles, Film, KeyRound, Gamepad2 } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../components/ui/Button';
import { IntroVideoModal } from '../../components/video/IntroVideoModal';
import { TitleSplash } from '../../components/video/TitleSplash';
import { FullscreenButton } from '../../components/ui/FullscreenButton';

export const StartScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, isSoundOn, toggleSound, isMusicOn, toggleMusic } = useGame();
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showIntroVideo, setShowIntroVideo] = useState<boolean>(false);

  // JOGAR leva ao Nível 0 (mapa das missões); sem aluno logado, primeiro entra com o código.
  const handleStartLevel0 = () => {
    navigate(currentPlayer ? '/missions' : '/register');
  };

  const handleFreeTraining = () => {
    navigate('/level0');
  };

  const handleGoToLogin = () => {
    navigate('/register');
  };

  // A arte oficial aparece inteira (16:9), sem nada por cima dos rostos e do logo.
  // No computador ela fica ao lado do painel de ações; no celular, o painel vem logo abaixo.
  return (
    <div className="game-sky relative min-h-[100dvh] flex flex-col overflow-x-hidden">
      <div className="absolute inset-0 sky-clouds pointer-events-none opacity-70" />

      {/* Faixa superior: escola + selos */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-4 flex flex-wrap items-center justify-between gap-2 animate-rise-in">
        <div className="flex items-center gap-2 bg-white/90 border-2 border-sky-200 rounded-2xl px-3 py-1.5 shadow-[0_3px_0_0_#bae6fd]">
          <span className="w-2 h-8 rounded-full bg-gradient-to-b from-blue-600 to-amber-400" />
          <div className="leading-tight">
            <div className="text-[10px] font-heading font-black tracking-widest text-amber-600 uppercase">Escola Municipal</div>
            <div className="text-xs sm:text-sm font-heading font-black text-blue-800">NÍSIA VILELA FERNANDES</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex gap-2">
            <span className="game-chip">📖 Read &amp; Explore</span>
            <span className="game-chip">🗣️ Speak English</span>
            <span className="game-chip">🛡️ Blue &amp; Purple</span>
          </div>
          <FullscreenButton />
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 py-4 lg:py-6 flex flex-col lg:flex-row items-center justify-center gap-5 lg:gap-8">
        {/* Arte oficial, inteira */}
        <figure
          className="w-full lg:flex-1 animate-rise-in [animation-delay:120ms]"
          style={{ maxWidth: 'min(100%, max(320px, calc((100dvh - 150px) * 1.7778)))' }}
        >
          <div className="relative rounded-[1.75rem] overflow-hidden border-4 border-white shadow-[0_8px_0_0_#7dd3fc,0_24px_50px_-16px_rgba(14,116,144,0.55)] bg-sky-200 aspect-video">
            <img
              src="/assets/nisialand_cover_official.jpg"
              alt="NISIALAND - Escola Municipal Nísia Vilela Fernandes"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          <h1 className="sr-only">NISIALAND — English Adventure</h1>
        </figure>

        {/* Painel de ações */}
        <section className="game-panel w-full max-w-xl lg:max-w-sm xl:max-w-md p-5 sm:p-6 flex flex-col items-center text-center animate-rise-in [animation-delay:260ms]">
          <span className="game-chip mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Explore • Learn • Play
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </span>

          <div className="relative w-full">
            <span className="glow-ring absolute inset-0 rounded-full border-4 border-amber-300 pointer-events-none" />
            <button
              onClick={handleStartLevel0}
              className="btn-shine overflow-hidden group relative flex items-center justify-center w-full px-8 py-4 sm:py-5 text-2xl sm:text-3xl font-heading font-black tracking-widest uppercase text-slate-950 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 rounded-full border-4 border-amber-600 shadow-[0_6px_0_0_#b45309] hover:from-amber-200 hover:to-amber-400 transition-all duration-150 active:translate-y-1 active:shadow-[0_2px_0_0_#b45309]"
              aria-label="Iniciar NISIALAND Nível 0"
            >
              <span className="flex items-center gap-3 drop-shadow-sm">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-slate-950 text-slate-950" />
                JOGAR
              </span>
            </button>
          </div>
          <p className="text-xs text-slate-600 font-semibold mt-3">
            🎮 Nível 0 • Desvie das distrações do Zé Cartinha! (6º ao 9º ano)
          </p>

          <div className="w-full flex items-center gap-3 my-4 text-[10px] font-heading font-black tracking-widest text-sky-500">
            <span className="h-0.5 flex-1 bg-sky-200 rounded-full" /> OU <span className="h-0.5 flex-1 bg-sky-200 rounded-full" />
          </div>

          <button
            onClick={handleGoToLogin}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-b from-blue-500 to-blue-700 text-white font-heading font-black text-sm uppercase rounded-2xl border-2 border-blue-900 shadow-[0_5px_0_0_#1e3a8a] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#1e3a8a] hover:from-blue-400 hover:to-blue-600"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>Já sou aluno (entrar com código)</span>
          </button>

          {currentPlayer && (
            <div className="mt-4 w-full bg-sky-50 border-2 border-sky-200 px-3 py-2 rounded-2xl flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span className="text-xs text-slate-600 font-semibold">
                Jogando como: <strong className="text-blue-800 font-heading">{currentPlayer.displayName}</strong> ({currentPlayer.className})
              </span>
              <button
                onClick={() => navigate('/missions')}
                className="text-xs font-heading font-black text-amber-600 hover:underline uppercase"
              >
                Continuar missões →
              </button>
            </div>
          )}

          {/* Ações secundárias */}
          <div className="mt-5 w-full grid grid-cols-2 gap-2">
            <Button variant="sky" size="sm" onClick={() => setShowIntroVideo(true)} className="gap-1.5">
              <Film className="w-4 h-4 text-blue-600" />
              <span>Abertura</span>
            </Button>
            <Button variant="sky" size="sm" onClick={() => setShowHowToPlay(true)} className="gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Como jogar</span>
            </Button>
            <Button variant="sky" size="sm" onClick={handleFreeTraining} className="gap-1.5 col-span-2" title="Arcade livre: escolha série (6º ao Ensino Médio) e tópicos, sem cadastro">
              <Gamepad2 className="w-4 h-4 text-purple-600" />
              <span>Treino livre (sem cadastro)</span>
            </Button>
            <Button variant="sky" size="sm" onClick={() => navigate('/leaderboard')} className="gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Ranking</span>
            </Button>
            <Button variant="sky" size="sm" onClick={toggleSound} className="gap-1.5">
              {isSoundOn ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>{isSoundOn ? 'SFX ON' : 'SFX OFF'}</span>
            </Button>
            <Button
              variant="sky"
              size="sm"
              onClick={toggleMusic}
              className={`gap-1.5 col-span-2 ${isMusicOn ? '!border-amber-400 !bg-amber-50 !text-amber-800 !shadow-[0_4px_0_0_#f59e0b]' : ''}`}
              title="Trilha Sonora Oficial: Cleyton Kauffman - Superhero Theme"
            >
              <Music className={`w-4 h-4 ${isMusicOn ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>{isMusicOn ? 'Música ON 🎵' : 'Música OFF'}</span>
            </Button>
          </div>
        </section>
      </main>

      {/* ABERTURA: vídeo + "Toque para começar" (uma vez por sessão) */}
      {/* Música de fundo fica desligada até o aluno ligar no botão "Música" */}
      <TitleSplash onStart={() => {}} />

      {/* INTRO VIDEO MODAL */}
      <IntroVideoModal
        isOpen={showIntroVideo}
        onClose={() => setShowIntroVideo(false)}
        onComplete={() => {
          setShowIntroVideo(false);
          handleStartLevel0();
        }}
      />

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
                  <strong className="text-blue-900 block font-heading">Modo História: Reunião com a Orientadora Leia</strong>
                  A HQ do <strong>Diretor Márcio</strong> abre as Missões do 8º ano. Conheça as regras escolares de Convivência, Jogo e Aprendizagem com o lema <em>"LEIA! Know the rules, learn and go further!"</em>
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
