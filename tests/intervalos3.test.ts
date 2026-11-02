import { describe, expect, it } from 'vitest';
import { caminho, dicaDeDirecao, gerarLabirinto, ladoDoGiro, relativa } from '../src/features/intervalo/labirintoLogica';
import { ETAPAS_3D } from '../src/features/intervalo/Labirinto3D';
import { RODADAS_FUGA, escolherDirecao, livre, acharNoMapa } from '../src/features/intervalo/fugaLogica';
import { COLS, FORMAS, LINHAS, cabe, fixar, girar, limparLinhas, tabuleiroVazio } from '../src/features/intervalo/tetrisLogica';
import { nivelDaRota, proximoPasso, NIVEIS_COM_ATIVIDADES } from '../src/services/avancar';
import { COLETAS_FUGA, FALAS_INTERVALO, TEMAS_TETRIS } from '../src/data/frasesIntervalo';
import { INTERVALOS } from '../src/features/intervalo/intervalos';

describe('Labirinto 3D', () => {
  it('as etapas crescem e mudam de espaço', () => {
    expect(new Set(ETAPAS_3D.map(e => e.cena)).size).toBe(ETAPAS_3D.length);
    for (let i = 1; i < ETAPAS_3D.length; i++) expect(ETAPAS_3D[i].c * ETAPAS_3D[i].l).toBeGreaterThan(ETAPAS_3D[i - 1].c * ETAPAS_3D[i - 1].l);
  });
  it('toda porta é alcançável, tem lugar diferente e fica numa parede', () => {
    for (let k = 0; k < 40; k++) for (const e of ETAPAS_3D) {
      const lab = gerarLabirinto(e.c, e.l, e.portas);
      expect(lab.portas.length).toBeGreaterThanOrEqual(2);
      expect(new Set(lab.portas.map(p => p.lugar)).size).toBe(lab.portas.length);
      expect(lab.portas.some(p => p.lugar === lab.alvo)).toBe(true);
      for (const p of lab.portas) {
        expect(lab.paredes[p.y][p.x][p.lado]).toBe(true);
        expect(caminho(lab, [0, 0], [p.x, p.y]).length).toBeGreaterThan(1);
      }
    }
  });
  it('a dica leva até a porta certa', () => {
    for (let k = 0; k < 30; k++) {
      const lab = gerarLabirinto(5, 5, 4);
      const alvo = lab.portas.find(p => p.lugar === lab.alvo)!;
      let cel: [number, number] = [0, 0], giro = 0, passos = 0;
      while (passos++ < 60) {
        const d = dicaDeDirecao(lab, cel, giro)!;
        if (d.tipo === 'chegou') { expect(cel).toEqual([alvo.x, alvo.y]); break; }
        giro += { frente: 0, esquerda: Math.PI / 2, direita: -Math.PI / 2, tras: Math.PI }[d.rel];
        const lado = ladoDoGiro(giro);
        expect(lab.paredes[cel[1]][cel[0]][lado]).toBe(false);
        cel = [cel[0] + [0, 1, 0, -1][lado], cel[1] + [-1, 0, 1, 0][lado]];
      }
      expect(passos).toBeLessThan(60);
    }
  });
  it('direção relativa', () => {
    expect(relativa(0, 1)).toBe('direita');
    expect(relativa(0, 3)).toBe('esquerda');
    expect(relativa(2, 0)).toBe('tras');
    expect(ladoDoGiro(-Math.PI / 2)).toBe(1);
  });
});

describe('Fuga no corredor', () => {
  it('mapas fechados, todos os corredores ligados e com largada, sala e 4 passes', () => {
    for (const r of RODADAS_FUGA) {
      const m = r.mapa;
      expect(m.every(l => l.length === m[0].length)).toBe(true);
      expect(m[0].replace(/#/g, '')).toBe('');
      const livres: string[] = [];
      m.forEach((l, y) => [...l].forEach((c, x) => { if (c !== '#') livres.push(`${x},${y}`); }));
      const [sx, sy] = acharNoMapa(m, 'P');
      const visto = new Set([`${sx},${sy}`]); const fila = [[sx, sy]];
      while (fila.length) { const [x, y] = fila.pop()!; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = `${x + dx},${y + dy}`; if (livre(m, x + dx, y + dy) && !visto.has(k)) { visto.add(k); fila.push([x + dx, y + dy]); } } }
      expect(visto.size).toBe(livres.length);
      expect(m.join('').split('H').length - 1).toBe(4);
      expect(m.join('')).toContain('C');
    }
  });
  it('quem persegue não volta para trás numa encruzilhada', () => {
    const m = RODADAS_FUGA[1].mapa;
    expect(escolherDirecao(m, 7, 7, [1, 0], [1, 7])).not.toEqual([-1, 0]);
  });
  it('há palavras certas suficientes e vozes para tudo', () => {
    for (const c of COLETAS_FUGA) expect(c.certas.length).toBeGreaterThanOrEqual(4);
    for (const c of [...COLETAS_FUGA, ...TEMAS_TETRIS]) expect(FALAS_INTERVALO.some(f => f.texto === c.ordem)).toBe(true);
  });
});

describe('Tetris das palavras', () => {
  it('gira, encaixa e limpa linhas', () => {
    const tab = tabuleiroVazio();
    expect(cabe(tab, FORMAS.I, 0, LINHAS - 2)).toBe(true);
    expect(cabe(tab, FORMAS.I, COLS - 3, 0)).toBe(false);
    expect(girar(girar(girar(girar(FORMAS.T, 'T'), 'T'), 'T'), 'T')).toEqual(FORMAS.T);
    for (let x = 0; x < COLS; x++) tab[LINHAS - 1][x] = { cor: '#000', baguna: false };
    expect(limparLinhas(tab)).toBe(1);
    expect(tab[LINHAS - 1].every(c => c === null)).toBe(true);
    expect(fixar(tab, FORMAS.O, 0, -1, { cor: '#fff', baguna: false })).toBe(false);
  });
});

describe('Avançar (modo de teste)', () => {
  it('reconhece o nível pela rota', () => {
    expect(nivelDaRota('/nivel4/equipe')).toBe(4);
    expect(nivelDaRota('/quiz')).toBe(0);
    expect(nivelDaRota('/intervalo/fuga-n6')).toBe(6);
    expect(nivelDaRota('/mapa')).toBeNull();
  });
  it('percorre todas as atividades e sobe de nível até o 8', () => {
    let res: Record<string, never> = {};
    let quiz = null as never, flash = null as never;
    expect(proximoPasso(0, res, quiz, flash).tipo).toBe('quiz');
    for (let n = 1; n <= 8; n++) {
      const total = NIVEIS_COM_ATIVIDADES[n].mission.activities.length;
      for (let i = 0; i < total; i++) {
        const p = proximoPasso(n, res, quiz, flash);
        expect(p.tipo).toBe('atividade');
        if (p.tipo === 'atividade') res = { ...res, [p.resultado.activityId]: p.resultado as never };
      }
      expect(proximoPasso(n, res, quiz, flash)).toMatchObject(n < 8 ? { tipo: 'proximo-nivel', nivel: n + 1 } : { tipo: 'fim' });
    }
  });
  it('cada nível de interfase tem seus intervalos com jogos diferentes', () => {
    expect(INTERVALOS.find(i => i.id === 'labirinto-n4')?.jogo).toBe('labirinto');
    expect(INTERVALOS.filter(i => i.nivel === 6).map(i => i.jogo)).toEqual(['fuga', 'tetris']);
  });
});
