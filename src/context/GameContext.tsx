import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlayerProfile, QuizResult, FlashcardResult, TeamId } from '../types';
import { storageService } from '../services/storage';
import { audioService } from '../services/audio';

interface GameContextType {
  currentPlayer: PlayerProfile | null;
  setCurrentPlayer: (player: PlayerProfile | null) => void;
  register: (data: { name: string; age: number; className: string; team: TeamId; avatar?: string }) => Promise<PlayerProfile>;
  loginWithCode: (code: string) => Promise<boolean>;
  logout: () => void;
  quizResult: QuizResult | null;
  saveQuizResult: (result: QuizResult) => Promise<void>;
  flashcardResult: FlashcardResult | null;
  saveFlashcardResult: (result: FlashcardResult) => Promise<void>;
  totalScore: number;
  missionsCompletedCount: number;
  isSoundOn: boolean;
  toggleSound: () => void;
  isMusicOn: boolean;
  toggleMusic: () => void;
  refreshUserData: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPlayer, setCurrentPlayer] = useState<PlayerProfile | null>(() => storageService.getStoredCurrentPlayer());
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [flashcardResult, setFlashcardResult] = useState<FlashcardResult | null>(null);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [isMusicOn, setIsMusicOn] = useState<boolean>(false);

  // Sync results on player change
  const refreshUserData = () => {
    if (currentPlayer) {
      const qRes = storageService.getQuizResult(currentPlayer.id);
      const fcRes = storageService.getFlashcardResult(currentPlayer.id);
      setQuizResult(qRes);
      setFlashcardResult(fcRes);
    } else {
      setQuizResult(null);
      setFlashcardResult(null);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, [currentPlayer]);

  const register = async (data: { name: string; age: number; className: string; team: TeamId; avatar?: string }) => {
    const newPlayer = await storageService.registerPlayer(data);
    setCurrentPlayer(newPlayer);
    return newPlayer;
  };

  const loginWithCode = async (code: string) => {
    const player = await storageService.loginWithCode(code);
    if (player) {
      setCurrentPlayer(player);
      return true;
    }
    return false;
  };

  const logout = () => {
    storageService.setStoredCurrentPlayer(null);
    setCurrentPlayer(null);
    setQuizResult(null);
    setFlashcardResult(null);
  };

  const saveQuizResult = async (result: QuizResult) => {
    if (!currentPlayer) return;
    await storageService.saveQuizResult(currentPlayer.id, result);
    setQuizResult(result);
  };

  const saveFlashcardResult = async (result: FlashcardResult) => {
    if (!currentPlayer) return;
    await storageService.saveFlashcardResult(currentPlayer.id, result);
    setFlashcardResult(result);
  };

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    audioService.setSoundMuted(!next);
  };

  const toggleMusic = () => {
    const next = !isMusicOn;
    setIsMusicOn(next);
    audioService.setMusicMuted(!next);
  };

  const totalScore = (quizResult?.totalScore || 0) + (flashcardResult?.totalScore || 0);
  const missionsCompletedCount = (quizResult?.completed ? 1 : 0) + (flashcardResult?.completed ? 1 : 0);

  return (
    <GameContext.Provider
      value={{
        currentPlayer,
        setCurrentPlayer,
        register,
        loginWithCode,
        logout,
        quizResult,
        saveQuizResult,
        flashcardResult,
        saveFlashcardResult,
        totalScore,
        missionsCompletedCount,
        isSoundOn,
        toggleSound,
        isMusicOn,
        toggleMusic,
        refreshUserData
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
