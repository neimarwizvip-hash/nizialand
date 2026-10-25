// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ProvisionalStoryGate } from '../src/components/story/ProvisionalStoryGate';

describe('HQs provisórias dos Níveis 3 e 4', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(cleanup);

  it('mostra três quadros antes da missão e não repete na sessão', () => {
    const { unmount } = render(<ProvisionalStoryGate story="nivel3"><p>salas</p></ProvisionalStoryGate>);
    expect(screen.getByRole('dialog', { name: /HQ provisória/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Próximo quadro/ }));
    fireEvent.click(screen.getByRole('button', { name: /Próximo quadro/ }));
    fireEvent.click(screen.getByRole('button', { name: /Começar missão/ }));
    expect(screen.getByText('salas')).toBeTruthy();
    expect(sessionStorage.getItem('nisialand_story_seen_nivel3')).toBe('1');
    unmount();
    render(<ProvisionalStoryGate story="nivel3"><p>salas</p></ProvisionalStoryGate>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('link direto para atividade ignora a HQ e marca a sessão', () => {
    render(<ProvisionalStoryGate story="nivel4" bypass><p>atividade</p></ProvisionalStoryGate>);
    expect(screen.getByText('atividade')).toBeTruthy();
    expect(sessionStorage.getItem('nisialand_story_seen_nivel4')).toBe('1');
  });
});
