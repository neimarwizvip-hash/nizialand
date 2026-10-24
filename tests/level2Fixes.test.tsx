// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ActivityResult } from '../src/core/types';

const game = vi.hoisted(() => ({
  saveActivityResult: vi.fn(),
  level1Completed: false,
  progressLoaded: false,
}));
vi.mock('../src/context/GameContext', () => ({ useGame: () => game }));
vi.mock('../src/services/audio', () => ({
  audioService: { playCorrect: vi.fn(), playWrong: vi.fn(), playTrack: vi.fn(), playVictory: vi.fn(), duckVolume: vi.fn(), playFlip: vi.fn() },
}));

import { LEVEL2 } from '../src/data/level2Content';
import {
  buildLevel2Result, buildWordGrid, cellsBetween, duelStart, duelStep, matchSelection, resolveRequestedActivity, GRID_SIZE,
} from '../src/features/level2/level2Rules';
import { useLevel2Run } from '../src/features/level2/useLevel2Run';
import { RequireLevel2 } from '../src/App';

const acts = LEVEL2.mission.activities;
const done = (i: number): ActivityResult => buildLevel2Result(acts[i], '8', [{ points: 100, correct: true }], '2026-10-24T00:00:00.000Z');

describe('Correção 1: guard espera o progresso', () => {
  const tree = () => render(
    <MemoryRouter initialEntries={['/nivel2']}>
      <Routes>
        <Route path="/nivel2" element={<RequireLevel2><p>pátio</p></RequireLevel2>} />
        <Route path="/nivel1" element={<p>nível 1</p>} />
      </Routes>
    </MemoryRouter>,
  );
  afterEach(cleanup);

  it('não redireciona antes de carregar', () => {
    Object.assign(game, { progressLoaded: false, level1Completed: false });
    tree();
    expect(screen.queryByText('nível 1')).toBeNull();
    expect(screen.queryByText('pátio')).toBeNull();
  });
  it('carregado e Nível 1 completo: entra', () => {
    Object.assign(game, { progressLoaded: true, level1Completed: true });
    tree();
    expect(screen.getByText('pátio')).toBeTruthy();
  });
  it('carregado sem Nível 1: volta ao Nível 1', () => {
    Object.assign(game, { progressLoaded: true, level1Completed: false });
    tree();
    expect(screen.getByText('nível 1')).toBeTruthy();
  });
});

describe('Correções 2 e 3: cronômetro de 20 s e avanço automático', () => {
  beforeEach(() => { vi.useFakeTimers(); game.saveActivityResult.mockClear(); });
  afterEach(() => vi.useRealTimers());

  it('no 0 o item conta errado com 0 ponto e avança após 1,5 s', () => {
    const { result } = renderHook(() => useLevel2Run({ activity: acts[2], grade: '8', total: 3 }));
    expect(result.current.secondsLeft).toBe(20);
    for (let s = 0; s < 20; s++) act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.feedback).toBe('timeout');
    expect(result.current.outcomes).toEqual([{ points: 0, correct: false }]);
    expect(result.current.index).toBe(0);
    act(() => { vi.advanceTimersByTime(1500); });
    expect(result.current.index).toBe(1);
    expect(result.current.feedback).toBeNull();
    expect(result.current.secondsLeft).toBe(20);
  });

  it('erro mostra feedback e avança sozinho; uma tentativa só', () => {
    const { result } = renderHook(() => useLevel2Run({ activity: acts[2], grade: '8', total: 2 }));
    act(() => result.current.answer(false));
    act(() => result.current.answer(true)); // ignorado durante o feedback
    expect(result.current.outcomes).toHaveLength(1);
    act(() => { vi.advanceTimersByTime(1500); });
    act(() => result.current.answer(true));
    act(() => { vi.advanceTimersByTime(1500); });
    expect(result.current.finished).toBe(true);
    expect(result.current.score).toBe(100);
    expect(game.saveActivityResult).toHaveBeenCalledTimes(1);
  });
});

describe('Correção 5: corrida e duelo', () => {
  beforeEach(() => { vi.useFakeTimers(); game.saveActivityResult.mockClear(); });
  afterEach(() => vi.useRealTimers());

  it('corrida encerra aos 60 s', () => {
    const { result } = renderHook(() => useLevel2Run({ activity: acts[4], grade: '8', total: Infinity, itemSeconds: null, runSeconds: 60 }));
    act(() => result.current.answer(true));
    for (let s = 0; s < 59; s++) act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.finished).toBe(false);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.finished).toBe(true);
    expect(game.saveActivityResult).toHaveBeenCalledTimes(1);
  });

  it('aluno vence quando o Zé fica sem cartas', () => {
    let s = duelStart(3);
    s = duelStep(s, true); s = duelStep(s, false); s = duelStep(s, true);
    expect(s).toMatchObject({ zeCards: 1, myCards: 2, winner: null });
    s = duelStep(s, true);
    expect(s.winner).toBe('player');
    expect(duelStep(s, false)).toBe(s);
  });

  it('Zé vence quando o aluno fica sem cartas', () => {
    let s = duelStart(3);
    for (let i = 0; i < 3; i++) s = duelStep(s, false);
    expect(s.winner).toBe('ze');
  });
});

describe('Correção 6: caça-palavras 8x8', () => {
  const words = ['RULES', 'TEACHER', 'QUIET', 'RESPECT', 'LISTEN', 'CLASS'];
  it('coloca as 6 palavras numa grade 8x8', () => {
    const { grid, placements } = buildWordGrid(words);
    expect(grid).toHaveLength(GRID_SIZE);
    grid.forEach(row => expect(row).toHaveLength(GRID_SIZE));
    expect(placements.map(p => p.word).sort()).toEqual([...words].sort());
    for (const p of placements) expect(p.cells.map(([r, c]) => grid[r][c]).join('')).toBe(p.word);
  });
  it('seleção reta acha a palavra nos dois sentidos', () => {
    const { placements } = buildWordGrid(words);
    const p = placements[0];
    const first = p.cells[0];
    const last = p.cells[p.cells.length - 1];
    expect(matchSelection(placements, first, last)).toBe(p.word);
    expect(matchSelection(placements, last, first)).toBe(p.word);
    expect(cellsBetween(first, last)).toHaveLength(p.word.length);
    expect(cellsBetween([0, 0], [1, 2])).toBeNull();
  });
});

describe('Correção 8: ?atividade= respeita a ordem', () => {
  it('abre a primeira; bloqueia as seguintes até concluir', () => {
    expect(resolveRequestedActivity(LEVEL2, {}, acts[0].id, true)?.id).toBe(acts[0].id);
    expect(resolveRequestedActivity(LEVEL2, {}, acts[3].id, true)).toBeNull();
    expect(resolveRequestedActivity(LEVEL2, {}, 'nao-existe', true)).toBeNull();
    expect(resolveRequestedActivity(LEVEL2, {}, null, true)).toBeNull();
    const results = { [acts[0].id]: done(0), [acts[1].id]: done(1) };
    expect(resolveRequestedActivity(LEVEL2, results, acts[2].id, true)?.id).toBe(acts[2].id);
    expect(resolveRequestedActivity(LEVEL2, results, acts[0].id, true)?.id).toBe(acts[0].id);
  });
});
