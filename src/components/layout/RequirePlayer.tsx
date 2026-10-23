import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';

/**
 * Route guard: renders children only when a player is logged in,
 * otherwise redirects to /register (declaratively, without calling navigate during render).
 */
export const RequirePlayer: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { currentPlayer } = useGame();
  if (!currentPlayer) return <Navigate to="/register" replace />;
  return children;
};
