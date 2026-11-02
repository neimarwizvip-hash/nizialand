import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import { ConviteIntervalo } from './features/intervalo/ConviteIntervalo';
import { ScreenTransitionLoader, ScreenLoadingFallback } from './components/layout/ScreenTransitionLoader';
import { RequirePlayer } from './components/layout/RequirePlayer';
import { StartScreen } from './features/start/StartScreen';
import { RegistrationScreen } from './features/auth/RegistrationScreen';
import { MissionBriefingScreen } from './features/missions/MissionBriefingScreen';
import { FinalResultsScreen } from './features/results/FinalResultsScreen';
import { PhaseStoryGate } from './components/video/PhaseStoryGate';
import { HqReuniaoGate } from './components/video/HqReuniaoGate';
import { StartupVideoScreen } from './components/video/StartupVideoScreen';
import { keepFullscreen } from './services/fullscreen';
import { RotateDeviceOverlay } from './components/ui/RotateDeviceOverlay';
import { audioService, MusicTrack } from './services/audio';
import MissionMapScreen from './features/missions/MissionMapScreen';
import { PacoteNivel } from './components/layout/PacoteNivel';

// Carregamento por fase: cada nível é um pacote separado, baixado (e guardado no aparelho) só quando o aluno entra.
const QuizScreen = lazy(() => import('./features/quiz/QuizScreen').then(m => ({ default: m.QuizScreen })));
const QuizResultsScreen = lazy(() => import('./features/quiz/QuizResultsScreen').then(m => ({ default: m.QuizResultsScreen })));
const FlashcardScreen = lazy(() => import('./features/flashcards/FlashcardScreen').then(m => ({ default: m.FlashcardScreen })));
const PatioScreen = lazy(() => import('./features/level2/PatioScreen'));
const Level2WorldScreen = lazy(() => import('./features/level2/Level2WorldScreen'));
const ClassroomScreen = lazy(() => import('./features/level3/ClassroomScreen'));
const TeamMissionScreen = lazy(() => import('./features/level4/TeamMissionScreen'));
const ChoicesMissionScreen = lazy(() => import('./features/level5/ChoicesMissionScreen'));
const Nivel6Screen = lazy(() => import('./features/levels/Nivel6Screen'));
const Nivel7Screen = lazy(() => import('./features/levels/Nivel7Screen'));
const Nivel8Screen = lazy(() => import('./features/levels/Nivel8Screen'));

// Telas pesadas ou menos usadas ficam fora do pacote principal (baixadas quando abertas).
const Level0Screen = lazy(() => import('./features/level0/Level0Screen').then(m => ({ default: m.Level0Screen })));
const ArcadeLevel0Screen = lazy(() => import('./features/level0/ArcadeLevel0Screen').then(m => ({ default: m.ArcadeLevel0Screen })));
const OrientationScreen = lazy(() => import('./features/orientation/OrientationScreen').then(m => ({ default: m.OrientationScreen })));
const LeaderboardScreen = lazy(() => import('./features/leaderboard/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })));
const ListenScreen = lazy(() => import('./features/level1/ListenScreen'));
const OrderScreen = lazy(() => import('./features/level1/OrderScreen'));
const DialogueScreen = lazy(() => import('./features/level1/DialogueScreen'));
const ExploreScreen = lazy(() => import('./features/level1/ExploreScreen'));
// Vistoria do professor: só no `npm run dev` (no build, import.meta.env.DEV é false e o código nem entra).
const VistoriaScreen = import.meta.env.DEV ? lazy(() => import('./features/vistoria/VistoriaScreen')) : null;
const IntervaloScreen = lazy(() => import('./features/intervalo/IntervaloScreen').then(m => ({ default: m.IntervaloScreen })));
const EspacoVistoria = import.meta.env.DEV ? lazy(() => import('./features/vistoria/EspacoVistoria')) : null;
const BotaoAvancar = import.meta.env.DEV ? lazy(() => import('./features/vistoria/BotaoAvancar')) : null;
const VistoriaBadge = import.meta.env.DEV ? lazy(() => import('./features/vistoria/VistoriaScreen').then(m => ({ default: m.VistoriaBadge }))) : null;
const AdminPanel = lazy(() => import('./features/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));

// Trilha de cada tela. Telas fora da lista (história, orientação, admin) mantêm a trilha atual.
const ROUTE_TRACKS: Record<string, MusicTrack> = {
  '/': 'apresentacao',
  '/missions': 'mapa',
  '/register': 'mapa',
  '/leaderboard': 'mapa',
  '/quiz': 'desafio',
  '/flashcards': 'desafio',
  '/level0': 'desafio',
  '/nivel1': 'mapa',
  '/nivel1/ouvir': 'desafio',
  '/nivel1/montar': 'desafio',
  '/nivel1/dialogo': 'desafio',
  '/nivel1/explorar': 'desafio',
  '/nivel2': 'mapa',
  '/nivel2/patio': 'mapa',
  '/mapa': 'mapa',
  '/nivel3': 'mapa',
  '/nivel3/salas': 'desafio',
  '/nivel4': 'mapa',
  '/nivel4/equipe': 'desafio',
  '/nivel5': 'mapa',
  '/nivel5/escolhas': 'desafio',
  '/nivel6': 'mapa',
  '/nivel6/consequencias': 'desafio',
  '/nivel7': 'mapa',
  '/nivel7/organizacao': 'desafio',
  '/nivel8': 'mapa',
  '/nivel8/projeto': 'desafio',
};
const VICTORY_ROUTES = ['/quiz/results', '/results/final'];

// Atividades do Nível 1 só abrem depois da Missão 0 completa.
const RequireLevel1: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { level0Completed, progressLoaded } = useGame();
  if (!progressLoaded) return null;
  return level0Completed ? <>{children}</> : <Navigate to="/missions" replace />;
};

export const RequireLevel2: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { level1Completed, progressLoaded } = useGame();
  if (!progressLoaded) return null;
  return level1Completed ? <>{children}</> : <Navigate to="/nivel1" replace />;
};

const RequireLevel3: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { level2Completed, progressLoaded } = useGame();
  if (!progressLoaded) return null;
  return level2Completed ? <>{children}</> : <Navigate to="/nivel2" replace />;
};

const RequireLevel4: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { level3Completed, progressLoaded } = useGame();
  if (!progressLoaded) return null;
  return level3Completed ? <>{children}</> : <Navigate to="/nivel3" replace />;
};

const RequireLevel5: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { level4Completed, progressLoaded } = useGame();
  if (!progressLoaded) return null;
  return level4Completed ? <>{children}</> : <Navigate to="/nivel4" replace />;
};

const RequireLevel6: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { level5Completed, progressLoaded } = useGame();
  if (!progressLoaded) return null;
  return level5Completed ? <>{children}</> : <Navigate to="/nivel5" replace />;
};

const RequireLevel7: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { level6Completed, progressLoaded } = useGame();
  if (!progressLoaded) return null;
  return level6Completed ? <>{children}</> : <Navigate to="/nivel6" replace />;
};

const RequireLevel8: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { level7Completed, progressLoaded } = useGame();
  if (!progressLoaded) return null;
  return level7Completed ? <>{children}</> : <Navigate to="/nivel7" replace />;
};

const RouteMusic: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (VICTORY_ROUTES.includes(pathname)) audioService.playVictory();
    else if (ROUTE_TRACKS[pathname]) audioService.playTrack(ROUTE_TRACKS[pathname]);
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  // Abrindo /vistoria direto (só em dev), pula o vídeo de abertura.
  const [startupVideoFinished, setStartupVideoFinished] = useState(() => import.meta.env.DEV && window.location.pathname.startsWith('/vistoria'));

  // Depois do primeiro toque, o jogo inteiro (missões incluídas) fica em tela cheia, não só a abertura.
  useEffect(() => keepFullscreen(), []);

  if (!startupVideoFinished) {
    return (
      <>
        <StartupVideoScreen onComplete={() => setStartupVideoFinished(true)} />
        <RotateDeviceOverlay />
      </>
    );
  }

  return (
    <GameProvider>
      <BrowserRouter>
        <RouteMusic />
        <ScreenTransitionLoader>
          <Suspense fallback={<ScreenLoadingFallback />}>
          <Routes>
            {/* Tela 1: Start Screen */}
            <Route path="/" element={<StartScreen />} />

            {/* Nível 0: Arcade com escolha de série e tópicos (banco de questões) */}
            <Route path="/level0" element={<PacoteNivel nivel={0}><ArcadeLevel0Screen /></PacoteNivel>} />

            {/* Modo História: HQ do Diretor Márcio que leva às Missões do 8º ano */}
            <Route path="/historia" element={<PacoteNivel nivel={0}><Level0Screen /></PacoteNivel>} />

            {/* Reunião Educativa & Orientadora Edileia */}
            <Route path="/orientation" element={<OrientationScreen />} />

            {/* Tela 2: Registration / Player Login */}
            <Route path="/register" element={<RegistrationScreen />} />

            {/* Tela 3: Mission Briefing */}
            <Route path="/missions" element={<PacoteNivel nivel={0}><RequirePlayer><PhaseStoryGate story="nivel0"><MissionBriefingScreen /></PhaseStoryGate></RequirePlayer></PacoteNivel>} />

            {/* Nível 1: liberado quando a Missão 0 termina; a HQ só toca depois da guarda */}
            <Route path="/nivel1" element={<PacoteNivel nivel={1}><RequirePlayer><RequireLevel1><HqReuniaoGate><MissionBriefingScreen level={1} /></HqReuniaoGate></RequireLevel1></RequirePlayer></PacoteNivel>} />
            <Route path="/nivel1/ouvir" element={<PacoteNivel nivel={1}><RequirePlayer><RequireLevel1><ListenScreen /></RequireLevel1></RequirePlayer></PacoteNivel>} />
            <Route path="/nivel1/montar" element={<PacoteNivel nivel={1}><RequirePlayer><RequireLevel1><OrderScreen /></RequireLevel1></RequirePlayer></PacoteNivel>} />
            <Route path="/nivel1/dialogo" element={<PacoteNivel nivel={1}><RequirePlayer><RequireLevel1><DialogueScreen /></RequireLevel1></RequirePlayer></PacoteNivel>} />
            <Route path="/nivel1/explorar" element={<PacoteNivel nivel={1}><RequirePlayer><RequireLevel1><ExploreScreen /></RequireLevel1></RequirePlayer></PacoteNivel>} />

            <Route path="/mapa" element={<RequirePlayer><MissionMapScreen /></RequirePlayer>} />

            {/* Nível 2: pátio e respeito à autoridade */}
            <Route path="/nivel2" element={<PacoteNivel nivel={2}><RequirePlayer><RequireLevel2><PhaseStoryGate story="nivel2"><MissionBriefingScreen level={2} /></PhaseStoryGate></RequireLevel2></RequirePlayer></PacoteNivel>} />
            <Route path="/nivel2/patio" element={<PacoteNivel nivel={2}><RequirePlayer><RequireLevel2><PatioScreen /></RequireLevel2></RequirePlayer></PacoteNivel>} />
            <Route path="/nivel2/atividades" element={<Navigate to="/nivel2/patio" replace />} />
            {/* Protótipo 3D opcional (só pela vistoria); o fluxo do aluno é o pátio 2D. */}
            <Route path="/nivel2/mundo3d" element={<PacoteNivel nivel={2}><RequirePlayer><RequireLevel2><Level2WorldScreen /></RequireLevel2></RequirePlayer></PacoteNivel>} />

            {/* Nível 3: convivência em sala */}
            <Route path="/nivel3" element={<PacoteNivel nivel={3}><RequirePlayer><RequireLevel3><ClassroomScreen /></RequireLevel3></RequirePlayer></PacoteNivel>} />
            <Route path="/nivel3/salas" element={<PacoteNivel nivel={3}><RequirePlayer><RequireLevel3><ClassroomScreen /></RequireLevel3></RequirePlayer></PacoteNivel>} />

            {/* Nível 4: trabalho em equipe */}
            <Route path="/nivel4" element={<PacoteNivel nivel={4}><RequirePlayer><RequireLevel4><TeamMissionScreen /></RequireLevel4></RequirePlayer></PacoteNivel>} />
            <Route path="/nivel4/equipe" element={<PacoteNivel nivel={4}><RequirePlayer><RequireLevel4><TeamMissionScreen /></RequireLevel4></RequirePlayer></PacoteNivel>} />

            {/* Nível 5: minhas escolhas */}
            <Route path="/nivel5" element={<PacoteNivel nivel={5}><RequirePlayer><RequireLevel5><ChoicesMissionScreen /></RequireLevel5></RequirePlayer></PacoteNivel>} />
            <Route path="/nivel5/escolhas" element={<PacoteNivel nivel={5}><RequirePlayer><RequireLevel5><ChoicesMissionScreen /></RequireLevel5></RequirePlayer></PacoteNivel>} />

            {/* Nível 6: consequências */}
            <Route path="/nivel6" element={<PacoteNivel nivel={6}><RequirePlayer><RequireLevel6><Nivel6Screen /></RequireLevel6></RequirePlayer></PacoteNivel>} />
            <Route path="/nivel6/consequencias" element={<PacoteNivel nivel={6}><RequirePlayer><RequireLevel6><Nivel6Screen /></RequireLevel6></RequirePlayer></PacoteNivel>} />

            {/* Nível 7: aprender a se organizar */}
            <Route path="/nivel7" element={<PacoteNivel nivel={7}><RequirePlayer><RequireLevel7><Nivel7Screen /></RequireLevel7></RequirePlayer></PacoteNivel>} />
            <Route path="/nivel7/organizacao" element={<PacoteNivel nivel={7}><RequirePlayer><RequireLevel7><Nivel7Screen /></RequireLevel7></RequirePlayer></PacoteNivel>} />

            {/* Nível 8: organizado na prática */}
            <Route path="/nivel8" element={<PacoteNivel nivel={8}><RequirePlayer><RequireLevel8><Nivel8Screen /></RequireLevel8></RequirePlayer></PacoteNivel>} />
            <Route path="/nivel8/projeto" element={<PacoteNivel nivel={8}><RequirePlayer><RequireLevel8><Nivel8Screen /></RequireLevel8></RequirePlayer></PacoteNivel>} />

            {/* Jogos de intervalo (interfase) */}
            <Route path="/intervalo/:id" element={<RequirePlayer><IntervaloScreen /></RequirePlayer>} />

            {/* Tela 4: Mission 1 Quiz */}
            <Route path="/quiz" element={<PacoteNivel nivel={0}><RequirePlayer><QuizScreen /></RequirePlayer></PacoteNivel>} />

            {/* Tela 5: Mission 1 Results */}
            <Route path="/quiz/results" element={<QuizResultsScreen />} />

            {/* Tela 6: Mission 2 Flashcard Challenge */}
            <Route path="/flashcards" element={<PacoteNivel nivel={0}><RequirePlayer><FlashcardScreen /></RequirePlayer></PacoteNivel>} />

            {/* Tela 7: Final Results */}
            <Route path="/results/final" element={<RequirePlayer><FinalResultsScreen /></RequirePlayer>} />

            {/* Tela 8: Leaderboard */}
            <Route path="/leaderboard" element={<LeaderboardScreen />} />

            {/* Painel do Professor / Admin */}
            <Route path="/admin" element={<AdminPanel />} />

            {VistoriaScreen && <Route path="/vistoria" element={<VistoriaScreen />} />}
            {EspacoVistoria && <Route path="/vistoria/espaco/:nome" element={<EspacoVistoria />} />}

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ConviteIntervalo />
          {VistoriaBadge && <VistoriaBadge />}
          {BotaoAvancar && <BotaoAvancar />}
          </Suspense>
        </ScreenTransitionLoader>
      </BrowserRouter>
      <RotateDeviceOverlay />
    </GameProvider>
  );
};

export default App;
