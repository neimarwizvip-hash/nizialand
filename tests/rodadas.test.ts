import { describe, expect, it } from 'vitest';
import { LEVEL5 } from '../src/content/level5';
import { LEVEL6 } from '../src/content/level6';
import { LEVEL7 } from '../src/content/level7';
import { LEVEL8 } from '../src/content/level8';
import { LEVEL5_CONTENT } from '../src/data/level5Content';
import { itensDaRodada } from '../src/data/rodadasFases';

const SERIES = ['6', '7', '8', '9'] as const;
const L5_CHAVE: Record<string, keyof typeof LEVEL5_CONTENT['6']> = {
  'nivel5-dialogos': 'dialogos', 'nivel5-caminhos': 'caminhos', 'nivel5-sentimentos': 'sentimentos', 'nivel5-conselho': 'conselho',
  'nivel5-se': 'se', 'nivel5-ritmo': 'ritmo', 'nivel5-revisao': 'revisao',
};

describe('Rodadas dos Níveis 5 a 8', () => {
  const casos = [
    ...LEVEL5.mission.activities.map(a => ({ a, primeiras: (s: typeof SERIES[number]) => LEVEL5_CONTENT[s][L5_CHAVE[a.id]] as never[] })),
    ...LEVEL6.mission.activities.map(a => ({ a, primeiras: () => [] })),
    ...LEVEL7.mission.activities.map(a => ({ a, primeiras: () => [] })),
    ...LEVEL8.mission.activities.map(a => ({ a, primeiras: () => [] })),
  ];

  it('toda atividade tem pelo menos 3 perguntas em cada série', () => {
    for (const { a, primeiras } of casos) for (const s of SERIES) {
      expect(itensDaRodada(a.id, s, primeiras(s)).length, `${a.id} ${s}º`).toBeGreaterThanOrEqual(3);
    }
  });

  it('cada pergunta tem resposta válida, alternativas distintas e explicação', () => {
    for (const { a, primeiras } of casos) for (const s of SERIES) for (const it of itensDaRodada(a.id, s, primeiras(s))) {
      expect(it.answer).toBeGreaterThanOrEqual(0);
      expect(it.answer).toBeLessThan(it.options.length);
      expect(new Set(it.options).size, it.prompt).toBe(it.options.length);
      expect(it.explanation).toBeTruthy();
    }
  });

  it('as perguntas de escuta trazem a frase que será falada', () => {
    for (const { a, primeiras } of casos) for (const s of SERIES) for (const it of itensDaRodada(a.id, s, primeiras(s))) {
      if (it.skill === 'listening') expect(it.ouvir, it.prompt).toBeTruthy();
    }
  });

  it('as atividades de um mesmo nível não repetem a mesma pergunta', () => {
    for (const nivel of [LEVEL6, LEVEL7, LEVEL8]) for (const s of SERIES) {
      const primeiras = nivel.mission.activities.map(a => itensDaRodada(a.id, s)[0].prompt);
      expect(new Set(primeiras).size).toBe(primeiras.length);
    }
  });
});
