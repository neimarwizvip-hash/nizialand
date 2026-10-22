import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { StartScreen } from './features/start/StartScreen';
import { Level0Screen } from './features/level0/Level0Screen';
import { OrientationScreen } from './features/orientation/OrientationScreen';
import { RegistrationScreen } from './features/auth/RegistrationScreen';
import { MissionBriefingScreen } from './features/missions/MissionBriefingScreen';
import { QuizScreen } from './features/quiz/QuizScreen';
import { QuizResultsScreen } from './features/quiz/QuizResultsScreen';
import { FlashcardScreen } from './features/flashcards/FlashcardScreen';
import { FinalResultsScreen } from './features/results/FinalResultsScreen';
import { LeaderboardScreen } from './features/leaderboard/LeaderboardScreen';
import { AdminPanel } from './features/admin/AdminPanel';

export const App: React.FC = () => {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          {/* Tela 1: Start Screen */}
          <Route path="/" element={<StartScreen />} />

          {/* Nível 0: Ingresso na Aventura & Modo Visitante */}
          <Route path="/level0" element={<Level0Screen />} />

          {/* Reunião Educativa & Orientadora Edileia */}
          <Route path="/orientation" element={<OrientationScreen />} />

          {/* Tela 2: Registration / Player Login */}
          <Route path="/register" element={<RegistrationScreen />} />

          {/* Tela 3: Mission Briefing */}
          <Route path="/missions" element={<MissionBriefingScreen />} />

          {/* Tela 4: Mission 1 Quiz */}
          <Route path="/quiz" element={<QuizScreen />} />

          {/* Tela 5: Mission 1 Results */}
          <Route path="/quiz/results" element={<QuizResultsScreen />} />

          {/* Tela 6: Mission 2 Flashcard Challenge */}
          <Route path="/flashcards" element={<FlashcardScreen />} />

          {/* Tela 7: Final Results */}
          <Route path="/results/final" element={<FinalResultsScreen />} />

          {/* Tela 8: Leaderboard */}
          <Route path="/leaderboard" element={<LeaderboardScreen />} />

          {/* Painel do Professor / Admin */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
};

export default App;
