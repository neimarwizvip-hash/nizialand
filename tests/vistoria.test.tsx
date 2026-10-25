// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { isVistoria, setVistoria, unlockForVistoria, vistoriaAllowed } from '../src/services/vistoria';
import { getMissionProgress } from '../src/engines/progression/progress';
import { LEVEL3 } from '../src/content/level3';
import { LEVEL7 } from '../src/content/level7';
import { storageService } from '../src/services/storage';
import { gameEvents } from '../src/core/events';
import { GameProvider, useGame } from '../src/context/GameContext';
import type { ActivityResult } from '../src/core/types';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('vistoria só em dev', () => {
  it('no build de produção (DEV=false) nunca liga, mesmo com a marca na sessão', () => {
    expect(vistoriaAllowed({ DEV: false })).toBe(false);
    sessionStorage.setItem('nisialand_vistoria', '1');
    expect(isVistoria({ DEV: false })).toBe(false);
    sessionStorage.clear();
    setVistoria(true, { DEV: false });
    expect(sessionStorage.getItem('nisialand_vistoria')).toBeNull();
  });

  it('em dev liga e desliga pela sessão', () => {
    setVistoria(true, { DEV: true });
    expect(isVistoria({ DEV: true })).toBe(true);
    setVistoria(false, { DEV: true });
    expect(isVistoria({ DEV: true })).toBe(false);
  });
});

describe('vistoria não salva nada', () => {
  it('libera todos os níveis e guarda resultados só na memória', async () => {
    const saveActivity = vi.spyOn(storageService, 'saveActivityResult');
    const saveQuiz = vi.spyOn(storageService, 'saveQuizResult');
    const saveCards = vi.spyOn(storageService, 'saveFlashcardResult');
    const emit = vi.spyOn(gameEvents, 'emit');
    const wrapper = ({ children }: { children: React.ReactNode }) => <GameProvider>{children}</GameProvider>;
    const { result } = renderHook(() => useGame(), { wrapper });

    act(() => result.current.setVistoriaMode(true));
    expect(result.current.vistoria).toBe(true);
    expect(result.current.currentPlayer?.id).toBe('vistoria');
    expect(result.current.level1Completed && result.current.level2Completed && result.current.progressLoaded).toBe(true);

    const activity = { activityId: 'n2_ditado', score: 50, maxScore: 100, completed: true } as ActivityResult;
    act(() => result.current.saveActivityResult(activity));
    await act(async () => {
      await result.current.saveQuizResult({ totalScore: 10 } as never);
      await result.current.saveFlashcardResult({ totalScore: 5 } as never);
    });

    expect(saveActivity).not.toHaveBeenCalled();
    expect(saveQuiz).not.toHaveBeenCalled();
    expect(saveCards).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(result.current.activityResults.n2_ditado?.score).toBe(50);

    // Saindo, volta ao progresso real (sem o resultado da vistoria).
    act(() => result.current.setVistoriaMode(false));
    expect(result.current.vistoria).toBe(false);
    expect(result.current.activityResults.n2_ditado).toBeUndefined();
  });
});

describe('vistoria abre atividades fora da ordem', () => {
  it('nos níveis 3 a 7 nenhuma atividade fica bloqueada; fora da vistoria segue sequencial', () => {
    for (const level of [LEVEL3, LEVEL7]) {
      const normal = getMissionProgress(level, {}, true);
      expect(normal.activities.some(a => a.state === 'locked')).toBe(true);
      expect(unlockForVistoria(normal, false)).toBe(normal);
      expect(unlockForVistoria(normal, true).activities.every(a => a.state === 'available')).toBe(true);
    }
  });
});
