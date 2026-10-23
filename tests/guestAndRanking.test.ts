// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storage';
import { isGuestPlayer } from '../src/types';
import type { FlashcardResult, QuizResult } from '../src/types';

const quiz: QuizResult = {
  completed: true,
  totalScore: 700,
  correctCount: 7,
  stars: 2,
  startedAt: '2026-10-23T10:00:00.000Z',
  completedAt: '2026-10-23T10:05:00.000Z',
  attempts: {},
};

const flashcards: FlashcardResult = {
  completed: true,
  totalScore: 300,
  roundsCompleted: 5,
  stars: 2,
  startedAt: '2026-10-23T10:10:00.000Z',
  completedAt: '2026-10-23T10:15:00.000Z',
  roundAttempts: [],
};

const register = (name: string, className = '801') =>
  storageService.registerPlayer({ name, age: 13, className, team: 'blue' });

beforeEach(() => {
  localStorage.clear();
});

describe('Ranking', () => {
  it('is empty when nobody registered (no fictional players)', async () => {
    expect(await storageService.getLeaderboard()).toEqual([]);
  });

  it('lists only registered players, ordered by score', async () => {
    const ana = await register('Ana Souza');
    const bia = await register('Bia Lima');
    await storageService.saveQuizResult(ana.id, { ...quiz, totalScore: 400 });
    await storageService.saveQuizResult(bia.id, quiz);
    const board = await storageService.getLeaderboard();
    expect(board.map(e => e.playerId)).toEqual([bia.id, ana.id]);
    expect(board.map(e => e.rank)).toEqual([1, 2]);
  });
});

describe('Guest mode', () => {
  it('starts a guest without code, outside the players list', () => {
    const guest = storageService.startGuest({ name: 'Visitante Teste', grade: '7', avatar: '/a.png' });
    expect(isGuestPlayer(guest)).toBe(true);
    expect(guest.id.startsWith('guest_')).toBe(true);
    expect(guest.playerCode).toBe('');
    expect(guest.className).toBe('7º ano');
    expect(storageService.getStoredCurrentPlayer()?.id).toBe(guest.id);
    expect(storageService.getAllPlayers()).toEqual([]);
  });

  it('keeps guest points out of the ranking', async () => {
    const guest = storageService.startGuest({ name: 'Visitante Teste', grade: '6', avatar: '/a.png' });
    await storageService.saveQuizResult(guest.id, quiz);
    const ana = await register('Ana Souza');
    const board = await storageService.getLeaderboard();
    expect(board.map(e => e.playerId)).toEqual([ana.id]);
  });

  it('cannot log in with an empty code', async () => {
    storageService.startGuest({ name: 'Visitante Teste', grade: '8', avatar: '/a.png' });
    expect(await storageService.loginWithCode('')).toBeNull();
  });
});

describe('Guest conversion', () => {
  it('moves the points to the new player and removes the guest results', async () => {
    const guest = storageService.startGuest({ name: 'Visitante Teste', grade: '9', avatar: '/a.png' });
    await storageService.saveQuizResult(guest.id, quiz);
    await storageService.saveFlashcardResult(guest.id, flashcards);

    const player = await register('Carla Dias', '901');
    await storageService.convertGuest(guest.id, player.id);

    expect(storageService.getQuizResult(player.id)?.totalScore).toBe(700);
    expect(storageService.getFlashcardResult(player.id)?.totalScore).toBe(300);
    expect(storageService.getQuizResult(guest.id)).toBeNull();
    expect(storageService.getFlashcardResult(guest.id)).toBeNull();

    const board = await storageService.getLeaderboard();
    expect(board).toHaveLength(1);
    expect(board[0]).toMatchObject({ playerId: player.id, totalScore: 1000 });
    expect(player.playerCode).toMatch(/^NSL-901-/);
    expect((await storageService.loginWithCode(player.playerCode))?.id).toBe(player.id);
  });
});
