import { describe, expect, it } from 'vitest';
import { LEVEL5 } from '../src/content/level5';
import { LEVEL6 } from '../src/content/level6';
import { LEVEL7 } from '../src/content/level7';
import { LEVEL8 } from '../src/content/level8';
import { dadosDoJogo, tipoDoJogo } from '../src/data/jogosFases';

const SERIES = ['6', '7', '8', '9'] as const;
const ATIVIDADES = [LEVEL5, LEVEL6, LEVEL7, LEVEL8].flatMap(l => l.mission.activities);

describe('Minijogos dos Níveis 5 a 8', () => {
  it('cada nível mistura vários tipos de jogo (não é só pergunta)', () => {
    for (const nivel of [LEVEL5, LEVEL6, LEVEL7, LEVEL8]) {
      const tipos = nivel.mission.activities.map(a => tipoDoJogo(a.id));
      expect(new Set(tipos).size, nivel.id).toBeGreaterThanOrEqual(3);
      expect(tipos.filter(t => t === 'rodada').length, nivel.id).toBeLessThanOrEqual(Math.ceil(tipos.length / 2));
    }
  });

  it('todo jogo tem conteúdo nas quatro séries e as fases crescem', () => {
    for (const a of ATIVIDADES) for (const s of SERIES) {
      const d = dadosDoJogo(a.id, s);
      expect(d.tipo, a.id).toBe(tipoDoJogo(a.id));
      if (d.tipo === 'rodada') continue;
      expect(d.fases.length, `${a.id} ${s}º`).toBeGreaterThanOrEqual(2);
      for (const fase of d.fases) expect(fase.length, `${a.id} ${s}º`).toBeGreaterThan(0);
      if (d.tipo === 'pares' || d.tipo === 'memoria') {
        const tamanhos = d.fases.map(f => f.length);
        expect(tamanhos[tamanhos.length - 1]).toBeGreaterThan(tamanhos[0]);
      }
      if (d.tipo === 'ordem') for (const f of d.fases) for (const seq of f) expect(seq.passos.length).toBeGreaterThanOrEqual(3);
      if (d.tipo === 'chuva' || d.tipo === 'travessia' || d.tipo === 'corrida') for (const f of d.fases) for (const it of f) expect(it.answer).toBeLessThan(it.options.length);
    }
  });
});
