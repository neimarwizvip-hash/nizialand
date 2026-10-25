// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ActivityResult } from '../src/core/types';

const game = vi.hoisted(() => ({
  currentPlayer: null,
  vistoria: false,
  activityResults: {} as Record<string, unknown>,
  saveActivityResult: vi.fn(),
}));
vi.mock('../src/context/GameContext', () => ({ useGame: () => game }));
vi.mock('../src/services/audio', () => ({
  audioService: { playClick: vi.fn(), playCorrect: vi.fn(), playWrong: vi.fn(), playTrack: vi.fn(), playVictory: vi.fn(), duckVolume: vi.fn(), playFlip: vi.fn(), isSoundOn: () => false },
}));
vi.mock('../src/components/ui/ConfettiEffect', () => ({ triggerConfetti: vi.fn() }));
vi.mock('../src/components/story/ProvisionalStoryGate', () => ({ ProvisionalStoryGate: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
// O corredor real usa WebGL; aqui só importa o que ele recebe.
vi.mock('../src/features/level3/Corridor3D', () => ({
  default: (p: { doors: { id: string; state: string }[]; onEnter: (id: string) => void; onSimpleMode: () => void }) => (
    <div>
      <p data-testid="portas">{p.doors.map(d => d.state).join(',')}</p>
      <button type="button" onClick={() => p.onEnter(p.doors[0].id)}>porta 1</button>
      <button type="button" onClick={p.onSimpleMode}>Modo simples</button>
    </div>
  ),
}));
vi.mock('../src/features/level3/Level3Activities', async orig => {
  const real = await orig<typeof import('../src/features/level3/Level3Activities')>();
  const views = Object.fromEntries(real.LEVEL3_ROOM_ORDER.map(id => [id, () => <p>sala {id}</p>]));
  return { ...real, LEVEL3_ACTIVITY_VIEWS: views };
});

import { LEVEL3 } from '../src/content/level3';
import { getMissionProgress } from '../src/engines/progression/progress';
import { buildLevel3Result, buildReviewItems, level3MissionMaxScore, LEVEL3_MAX_SCORE, shuffleOptions } from '../src/features/level3/level3Rules';
import { ClassroomScreen, LEVEL3_MODE_KEY, readLevel3Mode } from '../src/features/level3/ClassroomScreen';
import { storageService } from '../src/services/storage';
import { MANE_CORRIDOR_LINES, MANE_ROOM_START, MANE_ROOM_TIP } from '../src/data/level3Mane';

const acts = LEVEL3.mission.activities;
const done = (i: number): ActivityResult => buildLevel3Result(acts[i], '8', [{ points: 100, correct: true }], '2026-10-25T00:00:00.000Z');

describe('Nível 3: regras', () => {
  it('libera as salas na ordem', () => {
    const results = { [acts[0].id]: done(0) };
    expect(getMissionProgress(LEVEL3, results, true).activities.map(a => a.state)).toEqual([
      'completed', 'available', 'locked', 'locked', 'locked', 'locked',
    ]);
  });
  it('100 por acerto e teto de 1000 pontos', () => {
    const many = Array.from({ length: 14 }, () => ({ points: 150, correct: true }));
    const r = buildLevel3Result(acts[0], '8', many, '2026-10-25T00:00:00.000Z');
    expect(r.score).toBe(LEVEL3_MAX_SCORE);
    expect(r.maxScore).toBe(LEVEL3_MAX_SCORE);
    const r2 = buildLevel3Result(acts[0], '8', [{ points: 100, correct: true }, { points: 0, correct: false }], '2026-10-25T00:00:00.000Z');
    expect(r2).toMatchObject({ score: 100, maxScore: 200, correctCount: 1 });
  });
  it('labirinto: o teto vem das palavras esperadas', () => {
    const r = buildLevel3Result(acts[4], '8', [{ points: 100, correct: true }], '2026-10-25T00:00:00.000Z', 5);
    expect(r).toMatchObject({ maxScore: 500, totalItems: 5 });
  });
  it('embaralha as opções sem perder a resposta', () => {
    const seq = [0.9, 0.1, 0.5, 0.3];
    let i = 0;
    const rng = () => seq[i++ % seq.length];
    const s = shuffleOptions(['a', 'b', 'c', 'd'], 0, rng);
    expect(s.options[s.answer]).toBe('a');
    expect([...s.options].sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(s.options).not.toEqual(['a', 'b', 'c', 'd']);
  });
  it('revisão tem 10 itens com resposta válida em todas as séries', () => {
    for (const g of ['6', '7', '8', '9'] as const) {
      const items = buildReviewItems(g);
      expect(items).toHaveLength(10);
      expect(items.every(it => it.answer >= 0 && it.answer < it.options.length)).toBe(true);
    }
  });
  it('mostra o total realmente alcançável em cada série', () => {
    for (const grade of ['6', '7', '8', '9'] as const) {
      expect(level3MissionMaxScore(grade)).toBe(3800);
    }
  });
});

describe('Nível 3: tela das salas', () => {
  const tree = (url = '/nivel3/salas') => render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/nivel3/salas" element={<ClassroomScreen />} />
        <Route path="/mapa" element={<p>mapa</p>} />
      </Routes>
    </MemoryRouter>,
  );
  beforeEach(() => { localStorage.clear(); game.activityResults = {}; });
  afterEach(cleanup);

  it('modo 3D é o padrão e passa o estado das portas', async () => {
    expect(readLevel3Mode()).toBe('3d');
    game.activityResults = { [acts[0].id]: done(0) };
    tree();
    expect((await screen.findByTestId('portas')).textContent).toBe('done,open,locked,locked,locked,locked');
  });

  it('modo simples fica guardado', async () => {
    tree();
    fireEvent.click(await screen.findByText('Modo simples'));
    expect(localStorage.getItem(LEVEL3_MODE_KEY)).toBe('simples');
    expect(screen.getByText('SALAS DE AULA')).toBeTruthy();
    cleanup();
    tree();
    expect(screen.getByText('SALAS DE AULA')).toBeTruthy();
    expect(screen.queryByTestId('portas')).toBeNull();
  });

  it('Mané Zoeira aparece no cabeçalho do modo simples', () => {
    localStorage.setItem(LEVEL3_MODE_KEY, 'simples');
    tree();
    expect(screen.getByTestId('mane-header')).toBeTruthy();
    expect(screen.getByAltText('Mané Zoeira')).toBeTruthy();
  });

  it('falas provisórias do Mané: uma por sala', () => {
    expect(MANE_CORRIDOR_LINES).toHaveLength(6);
    expect(MANE_ROOM_START).toHaveLength(6);
    expect(MANE_ROOM_TIP).toHaveLength(6);
    MANE_CORRIDOR_LINES.forEach(l => { expect(l.pt).toBeTruthy(); expect(l.en).toBeTruthy(); });
  });

  it('localStorage indisponível não quebra a tela', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado'); });
    expect(readLevel3Mode()).toBe('3d');
    spy.mockRestore();
  });

  it('a porta abre a sala e sala trancada no endereço não abre', async () => {
    tree(`/nivel3/salas?atividade=${acts[2].id}`);
    expect(screen.queryByText(`sala ${acts[2].id}`)).toBeNull();
    fireEvent.click(await screen.findByText('porta 1'));
    expect(screen.getByText(`sala ${acts[0].id}`)).toBeTruthy();
  });

  it('salvar o resultado não fecha o painel final da sala', () => {
    localStorage.setItem(LEVEL3_MODE_KEY, 'simples');
    const view = tree(`/nivel3/salas?atividade=${acts[0].id}`);
    expect(screen.getByText(`sala ${acts[0].id}`)).toBeTruthy();
    game.activityResults = { [acts[0].id]: done(0) };
    act(() => { view.rerender(
      <MemoryRouter initialEntries={[`/nivel3/salas?atividade=${acts[0].id}`]}>
        <Routes><Route path="/nivel3/salas" element={<ClassroomScreen />} /></Routes>
      </MemoryRouter>,
    ); });
    expect(screen.getByText(`sala ${acts[0].id}`)).toBeTruthy();
  });

  it('festa com o total de pontos quando tudo termina', () => {
    localStorage.setItem(LEVEL3_MODE_KEY, 'simples');
    game.activityResults = Object.fromEntries(acts.map((a, i) => [a.id, done(i)]));
    tree();
    expect(screen.getByText(/Nível 3 concluído/)).toBeTruthy();
    expect(screen.getByText('600')).toBeTruthy();
    expect(screen.getByText('/ 3800 pts')).toBeTruthy();
  });

  it('mostra a conclusão também no corredor 3D', async () => {
    game.activityResults = Object.fromEntries(acts.map((a, i) => [a.id, done(i)]));
    tree();
    expect((await screen.findByRole('status')).textContent).toContain('600');
    expect(screen.getByRole('status').textContent).toContain('/ 3800 pts');
  });
});

describe('Nível 3: progresso local', () => {
  it('recupera a sala concluída e libera a próxima após recarregar os resultados', () => {
    localStorage.clear();
    const send = vi.spyOn(storageService, 'enviarResultado').mockImplementation(() => {});
    const playerId = 'teste-local-nivel3';
    storageService.saveActivityResult(playerId, done(0));

    const restored = storageService.getActivityResults(playerId);
    expect(restored[acts[0].id].score).toBe(100);
    expect(getMissionProgress(LEVEL3, restored, true).activities.map(a => a.state)).toEqual([
      'completed', 'available', 'locked', 'locked', 'locked', 'locked',
    ]);
    expect(send).toHaveBeenCalledTimes(1);
    send.mockRestore();
    localStorage.clear();
  });
});
