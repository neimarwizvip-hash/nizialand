import { describe, expect, it } from 'vitest';
import { chaveFala, limparNome } from '../src/services/vozesArquivo';
import { ELENCO } from '../src/data/elenco';
import { VOZES } from '../src/services/narracao';
import { fala } from '../src/data/falasAnfitrioes';

describe('Vozes gravadas', () => {
  it('tira o nome do aluno da fala falada', () => {
    expect(limparNome('Olá, Ana! Eu sou o Diretor Márcio.', ['Ana'])).toBe('Olá! Eu sou o Diretor Márcio.');
    expect(limparNome('Mandou bem, Ana! Próxima: Revisão.', ['Ana'])).toBe('Mandou bem! Próxima: Revisão.');
    expect(limparNome('Agora o plano vira prática, Ana: semana organizada.', ['Ana'])).toBe('Agora o plano vira prática: semana organizada.');
    expect(limparNome('Ana, venha comigo.', ['Ana'])).toBe('Venha comigo.');
  });

  it('a fala com o nome do aluno cai na mesma gravação da fala sem nome', () => {
    const comNome = fala(8, 'meio', { nome: 'Ana Clara', proxima: 'Revisão do projeto' }).pt;
    const semNome = fala(8, 'meio', { proxima: 'Revisão do projeto' }).pt; // usa "estudante"
    const voz = ELENCO.rosana.pt;
    expect(chaveFala('pt-BR', voz, limparNome(comNome, ['Ana Clara', 'estudante']))).toBe(chaveFala('pt-BR', voz, limparNome(semNome, ['estudante'])));
  });

  it('todo personagem do elenco tem voz em português e em inglês e um ajuste de reserva', () => {
    for (const [p, v] of Object.entries(ELENCO)) {
      expect(v.pt, p).toBeTruthy();
      expect(v.en, p).toBeTruthy();
      expect(VOZES[p as keyof typeof VOZES], p).toBeTruthy();
    }
  });

  it('a chave muda com a voz (trocar a voz regrava a fala)', () => {
    expect(chaveFala('pt-BR', 'Otávio', 'Bom dia')).not.toBe(chaveFala('pt-BR', 'Marcelo', 'Bom dia'));
    expect(chaveFala('pt-BR', 'Otávio', 'Bom  dia ')).toBe(chaveFala('pt-BR', 'Otávio', 'Bom dia'));
  });
});
