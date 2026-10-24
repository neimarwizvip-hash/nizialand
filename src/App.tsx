import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { ScreenTransitionLoader, ScreenLoadingFallback } from './components/layout/ScreenTransitionLoader';
import { RequirePlayer } from './components/layout/RequirePlayer';
import { StartScreen } from './features/start/StartScreen';
import { RegistrationScreen } from './features/auth/RegistrationScreen';
import { MissionBriefingScreen } from './features/missions/MissionBriefingScreen';
import { QuizScreen } from './features/quiz/QuizScreen';
import { QuizResultsScreen } from './features/quiz/QuizResultsScreen';
import { FlashcardScreen } from './features/flashcards/FlashcardScreen';
import { FinalResultsScreen } from './features/results/FinalResultsScreen';
import { PhaseStoryGate } from './components/video/PhaseStoryGate';
import { StartupVideoScreen } from './components/video/StartupVideoScreen';
import { keepFullscreen } from './services/fullscreen';
import { RotateDeviceOverlay } from './components/ui/RotateDeviceOverlay';
import { audioService, MusicTrack } from './services/audio';

// Telas pesadas ou menos usadas ficam fora do pacote principal (baixadas quando abertas).
const Level0Screen = lazy(() => import('./features/level0/Level0Screen').then(m => ({ default: m.Level0Screen })));
const ArcadeLevel0Screen = lazy(() => import('./features/level0/ArcadeLevel0Screen').then(m => ({ default: m.ArcadeLevel0Screen })));
const OrientationScreen = lazy(() => import('./features/orientation/OrientationScreen').then(m => ({ default: m.OrientationScreen })));
const LeaderboardScreen = lazy(() => import('./features/leaderboard/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })));
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
};
const VICTORY_ROUTES = ['/quiz/results', '/results/final'];

const RouteMusic: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (VICTORY_ROUTES.includes(pathname)) audioService.playVictory();
    else if (ROUTE_TRACKS[pathname]) audioService.playTrack(ROUTE_TRACKS[pathname]);
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  const [startupVideoFinished, setStartupVideoFinished] = useState(false);

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
            <Route path="/level0" element={<ArcadeLevel0Screen />} />

            {/* Modo História: HQ do Diretor Márcio que leva às Missões do 8º ano */}
            <Route path="/historia" element={<Level0Screen />} />

            {/* Reunião Educativa & Orientadora Edileia */}
            <Route path="/orientation" element={<OrientationScreen />} />

            {/* Tela 2: Registration / Player Login */}
            <Route path="/register" element={<RegistrationScreen />} />

            {/* Tela 3: Mission Briefing */}
            <Route path="/missions" element={<RequirePlayer><PhaseStoryGate story="nivel0"><MissionBriefingScreen /></PhaseStoryGate></RequirePlayer>} />

            {/* Tela 4: Mission 1 Quiz */}
            <Route path="/quiz" element={<RequirePlayer><QuizScreen /></RequirePlayer>} />

            {/* Tela 5: Mission 1 Results */}
            <Route path="/quiz/results" element={<QuizResultsScreen />} />

            {/* Tela 6: Mission 2 Flashcard Challenge */}
            <Route path="/flashcards" element={<RequirePlayer><FlashcardScreen /></RequirePlayer>} />

            {/* Tela 7: Final Results */}
            <Route path="/results/final" element={<RequirePlayer><FinalResultsScreen /></RequirePlayer>} />

            {/* Tela 8: Leaderboard */}
            <Route path="/leaderboard" element={<LeaderboardScreen />} />

            {/* Painel do Professor / Admin */}
            <Route path="/admin" element={<AdminPanel />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </ScreenTransitionLoader>
      </BrowserRouter>
      <RotateDeviceOverlay />
    </GameProvider>
  );
};

export default App;
