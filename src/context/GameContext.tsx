import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlayerProfile, QuizResult, FlashcardResult, TeamId, calculatePlayerLevel, isGuestPlayer } from '../types';
import { storageService } from '../services/storage';
import { audioService } from '../services/audio';
import { getPlayerGrade, setPlayerGrade } from '../services/grade';
import { gameEvents } from '../core/events';
import type { ActivityResult } from '../core/types';
import { LEVEL0 } from '../content/level0';
import { LEVEL1 } from '../content/level1';
import { fromFlashcardResult, fromQuizResult, level0Results } from '../engines/pedagogy/adapters';
import { getMissionProgress } from '../engines/progression/progress';
import type { SchoolGrade } from '../data/level0Content';

interface GameContextType {
  currentPlayer: PlayerProfile | null;
  setCurrentPlayer: (player: PlayerProfile | null) => void;
  register: (data: { name: string; age: number; className: string; team: TeamId; avatar?: string; skinTone?: 'light' | 'medium' | 'dark' | 'warm' }) => Promise<PlayerProfile>;
  startGuest: (data: { name: string; grade: SchoolGrade; avatar: string }) => PlayerProfile;
  loginWithCode: (code: string) => Promise<boolean>;
  logout: () => void;
  quizResult: QuizResult | null;
  saveQuizResult: (result: QuizResult) => Promise<void>;
  flashcardResult: FlashcardResult | null;
  saveFlashcardResult: (result: FlashcardResult) => Promise<void>;
  // Nível 1 em diante: melhor resultado por activityId.
  activityResults: Record<string, ActivityResult>;
  saveActivityResult: (result: ActivityResult) => void;
  // Missão 0 concluída = Nível 1 liberado.
  level0Completed: boolean;
  totalScore: number;
  playerLevel: number;
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
  const [activityResults, setActivityResults] = useState<Record<string, ActivityResult>>({});
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [isMusicOn, setIsMusicOn] = useState<boolean>(() => audioService.isMusicOn());

  // Sync results on player change
  const refreshUserData = () => {
    if (currentPlayer) {
      const qRes = storageService.getQuizResult(currentPlayer.id);
      const fcRes = storageService.getFlashcardResult(currentPlayer.id);
      setQuizResult(qRes);
      setFlashcardResult(fcRes);
      setActivityResults(storageService.getActivityResults(currentPlayer.id));
    } else {
      setActivityResults({});
      setQuizResult(null);
      setFlashcardResult(null);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, [currentPlayer]);

  // Reenvia para a planilha o que ficou na fila (ao abrir e quando a internet volta).
  useEffect(() => {
    storageService.iniciarSincronizacao();
  }, []);

  const register = async (data: { name: string; age: number; className: string; team: TeamId; avatar?: string; skinTone?: 'light' | 'medium' | 'dark' | 'warm' }) => {
    // Visitante fazendo o cadastro definitivo: leva pontos e série para o novo aluno.
    const guest = isGuestPlayer(currentPlayer) ? currentPlayer : null;
    const newPlayer = await storageService.registerPlayer(data);
    if (guest) {
      const guestGrade = getPlayerGrade(guest);
      await storageService.convertGuest(guest.id, newPlayer.id);
      if (guestGrade) setPlayerGrade(newPlayer, guestGrade);
    }
    setCurrentPlayer(newPlayer);
    return newPlayer;
  };

  const startGuest = (data: { name: string; grade: SchoolGrade; avatar: string }) => {
    const guest = storageService.startGuest(data);
    setPlayerGrade(guest, data.grade);
    setCurrentPlayer(guest);
    return guest;
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
    setActivityResults({});
  };

  // Avisa o resto do jogo (eventos tipados) depois que um resultado é salvo.
  const emitProgress = (player: PlayerProfile, result: ActivityResult, nextQuiz: QuizResult | null, nextFlashcards: FlashcardResult | null) => {
    const grade = result.grade;
    const wasCompleted = getMissionProgress(LEVEL0, level0Results(quizResult, flashcardResult, grade), true).isCompleted;
    gameEvents.emit('activity.completed', { playerId: player.id, result });
    // A missão termina quando todas as atividades estão concluídas; cada nível tem uma missão só.
    const isCompleted = getMissionProgress(LEVEL0, level0Results(nextQuiz, nextFlashcards, grade), true).isCompleted;
    if (isCompleted && !wasCompleted) {
      gameEvents.emit('mission.completed', { playerId: player.id, levelId: LEVEL0.id, missionId: LEVEL0.mission.id, result });
      gameEvents.emit('level.completed', { playerId: player.id, levelId: LEVEL0.id });
    }
  };

  const saveQuizResult = async (result: QuizResult) => {
    if (!currentPlayer) return;
    await storageService.saveQuizResult(currentPlayer.id, result);
    setQuizResult(result);
    emitProgress(currentPlayer, fromQuizResult(result, getPlayerGrade(currentPlayer)), result, flashcardResult);
  };

  const saveFlashcardResult = async (result: FlashcardResult) => {
    if (!currentPlayer) return;
    await storageService.saveFlashcardResult(currentPlayer.id, result);
    setFlashcardResult(result);
    emitProgress(currentPlayer, fromFlashcardResult(result, getPlayerGrade(currentPlayer)), quizResult, result);
  };

  const saveActivityResult = (result: ActivityResult) => {
    if (!currentPlayer) return;
    const wasCompleted = getMissionProgress(LEVEL1, activityResults, true).isCompleted;
    storageService.saveActivityResult(currentPlayer.id, result);
    const next = storageService.getActivityResults(currentPlayer.id);
    setActivityResults(next);
    gameEvents.emit('activity.completed', { playerId: currentPlayer.id, result });
    if (getMissionProgress(LEVEL1, next, true).isCompleted && !wasCompleted) {
      gameEvents.emit('mission.completed', { playerId: currentPlayer.id, levelId: LEVEL1.id, missionId: LEVEL1.mission.id, result });
      gameEvents.emit('level.completed', { playerId: currentPlayer.id, levelId: LEVEL1.id });
    }
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

  const activityTotal = Object.values(activityResults).reduce((t, r) => t + (r.score || 0), 0);
  const totalScore = (quizResult?.totalScore || 0) + (flashcardResult?.totalScore || 0) + activityTotal;
  const level0Completed = getMissionProgress(LEVEL0, level0Results(quizResult, flashcardResult, null), true).isCompleted;
  const playerLevel = calculatePlayerLevel(totalScore);
  const missionsCompletedCount = (quizResult?.completed ? 1 : 0) + (flashcardResult?.completed ? 1 : 0)
    + Object.values(activityResults).filter(r => r.completed).length;

  return (
    <GameContext.Provider
      value={{
        currentPlayer,
        setCurrentPlayer,
        register,
        startGuest,
        loginWithCode,
        logout,
        quizResult,
        saveQuizResult,
        flashcardResult,
        saveFlashcardResult,
        activityResults,
        saveActivityResult,
        level0Completed,
        totalScore,
        playerLevel,
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
