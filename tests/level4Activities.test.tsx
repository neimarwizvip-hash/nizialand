// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LEVEL4 } from '../src/content/level4';
import { buildLevel4RunResult } from '../src/features/level4/level4Rules';
import { Level4Activities } from '../src/features/level4/Level4Activities';
import { level4QuestionPool } from '../src/features/level4/level4QuestionPool';

vi.mock('../src/services/speech', () => ({ speechService: { speakEnglish: vi.fn() } }));

describe('Nível 4: atividades da equipe', () => {
  afterEach(cleanup);

  it('tem revezamento e revisão com várias etapas em todas as séries', () => {
    for (const grade of ['6', '7', '8', '9'] as const) {
      expect(level4QuestionPool('nivel4-revezamento', grade)).toHaveLength(3);
      expect(level4QuestionPool('nivel4-revisao', grade)).toHaveLength(8);
      expect(level4QuestionPool('nivel4-revisao', grade).every(q => q.options[q.answer])).toBe(true);
    }
  });

  it('salva pontos e teto pelas etapas realmente realizadas', () => {
    const result = buildLevel4RunResult(LEVEL4.mission.activities[4], '8', [true, false, true], '2026-10-25T00:00:00.000Z');
    expect(result).toMatchObject({ score: 200, maxScore: 300, correctCount: 2, totalItems: 3, completed: true });
  });

  it('exige encontrar três pistas antes da pergunta e salva uma vez', () => {
    const save = vi.fn();
    render(<Level4Activities activity={LEVEL4.mission.activities[0]} grade="8" onExit={vi.fn()} onSave={save} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pátio' }));
    expect(screen.getByText('Pistas encontradas: 0/3')).toBeTruthy();
    for (const place of ['Biblioteca', 'Pátio', 'Secretaria']) fireEvent.click(screen.getByRole('button', { name: place }));
    expect(screen.getByText(level4QuestionPool('nivel4-pistas', '8')[0].prompt)).toBeTruthy();
    const answer = level4QuestionPool('nivel4-pistas', '8')[0].options[0];
    fireEvent.click(screen.getByRole('button', { name: answer }));
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0]).toMatchObject({ activityId: 'nivel4-pistas', score: 300, maxScore: 400, completed: true });
  });
});
