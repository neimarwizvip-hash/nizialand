import { describe, expect, it } from 'vitest';
import { alunoAutorizado, alunoNaLista, gerarPergunta, idAtividadeDoDia, janela, respostaCerta, somarTeste8, sorteioComSemente } from '../src/data/teste8';

describe('Teste do 8º ano — comparativos', () => {
  it('cada fase gera perguntas válidas e variadas', () => {
    for (let fase = 1; fase <= 6; fase++) {
      const frases = new Set<string>();
      for (let s = 1; s <= 300; s++) {
        const p = gerarPergunta(fase, sorteioComSemente(s * 7919 + fase));
        expect(p.fase).toBe(fase);
        expect(p.cartoes).toHaveLength(2);
        if (p.tipo === 'escolha') {
          expect(p.opcoes).toContain(p.certa);
          expect(new Set(p.opcoes).size).toBe(p.opcoes.length);
          expect(p.opcoes.length).toBeGreaterThanOrEqual(3);
          expect(p.frase).toContain('___');
          expect(respostaCerta(p, p.certa)).toBe(true);
          frases.add(p.frase + p.opcoes.join());
        } else if (p.tipo === 'montar') {
          const sobra = [...p.palavras];
          for (const w of p.resposta) { const i = sobra.indexOf(w); expect(i).toBeGreaterThanOrEqual(0); sobra.splice(i, 1); }
          expect(sobra.length).toBe(1); // sempre uma palavra intrusa
          expect(respostaCerta(p, p.resposta)).toBe(true);
          frases.add(p.resposta.join(' '));
        } else {
          expect(p.frase).not.toContain('___');
          expect(respostaCerta(p, p.certo)).toBe(true);
          frases.add(p.frase);
        }
      }
      expect(frases.size).toBeGreaterThan(200); // quase nunca repete
    }
  });

  it('respostas lógicas: igualdade só com valores iguais; o primeiro da frase tem mais (sup) ou menos (inferioridade)', () => {
    const num = (v: string) => (v.match(/★/g)?.length ?? 0) + Number(v.replace(/[^\d,-]/g, '').replace(',', '.')) * (/ h$/.test(v) ? 60 : 1);
    for (let s = 1; s <= 600; s++) {
      for (const fase of [1, 2, 3, 4, 5]) {
        const p = gerarPergunta(fase, sorteioComSemente(s * 31 + fase));
        if (p.tipo !== 'escolha') continue;
        const [a, b] = p.cartoes.map(c => c.valor);
        if (p.certa.startsWith('as ')) expect(a).toBe(b);
        else expect(a).not.toBe(b);
        const primeiro = p.frase.replace(/^.*?: /, '').replace(/^(So|According to the cards), /, '').split(' is ')[0].toLowerCase();
        const cA = p.cartoes.find(c => c.nome.toLowerCase() === primeiro);
        const cB = p.cartoes.find(c => c.nome.toLowerCase() !== primeiro);
        expect(cA, p.frase).toBeTruthy();
        const maior = num(cA!.valor) > num(cB!.valor);
        const negativos = ['short', 'young', 'cheap', 'light', 'small', 'slow', 'safe', 'cold', 'bad'];
        const sinal = negativos.includes(p.dica) ? -1 : 1;
        if (/than$/.test(p.certa) && !p.certa.startsWith('less')) expect(maior === (sinal === 1), `${p.frase} ${p.certa} ${JSON.stringify(p.cartoes)}`).toBe(true);
        if (p.certa.startsWith('less') || p.certa.startsWith('not as')) expect(maior === (sinal === 1), `${p.frase} ${p.certa} ${JSON.stringify(p.cartoes)}`).toBe(false);
      }
    }
  });

  it('cadastro mínimo: primeiro nome + sobrenome da chamada da 805', () => {
    expect(alunoNaLista('Eduarda Barros')).toBe(true);
    expect(alunoNaLista('eduarda souza')).toBe(true);
    expect(alunoNaLista('Eduarda')).toBe(false);
    expect(alunoNaLista('Isabela Ramos')).toBe(true); // grafia aproximada
    expect(alunoNaLista('Kaiki Pereira')).toBe(true);
    expect(alunoNaLista('Alexsandro Silva')).toBe(true); // "da Sil…" cortado na chamada
    expect(alunoNaLista('Pedro Assis')).toBe(true);
    expect(alunoNaLista('Pedro Freitas')).toBe(true);
    expect(alunoNaLista('Pedro Souza')).toBe(false);
    expect(alunoNaLista('João Silva')).toBe(false);
    expect(alunoAutorizado(['Duda', 'Eduarda Barros de Souza'], '8')).toBe(true);
  });

  it('janela e id do dia no horário de Brasília', () => {
    expect(janela(Date.parse('2026-11-04T16:59:00-03:00'))).toBe('antes');
    expect(janela(Date.parse('2026-11-04T17:00:00-03:00'))).toBe('aberto');
    expect(janela(Date.parse('2026-11-12T00:01:00-03:00'))).toBe('encerrado');
    expect(idAtividadeDoDia(Date.parse('2026-11-04T23:30:00-03:00'))).toBe('teste8-2026-11-04');
  });

  it('área do professor: melhor de cada dia, dias somam', () => {
    const m = somarTeste8([
      { jogadorId: 'a', atividade: 'teste8-2026-11-04', pontos: 120, detalhes: { fase: 3 } },
      { jogadorId: 'a', atividade: 'teste8-2026-11-04', pontos: 300, detalhes: JSON.stringify({ fase: 4 }) },
      { jogadorId: 'a', atividade: 'teste8-2026-11-05', pontos: 200, detalhes: { fase: 2 } },
      { jogadorId: 'a', atividade: 'quiz', pontos: 999 },
      { jogadorId: 'b', atividade: 'teste8-2026-11-05', pontos: 50 },
    ]);
    expect(m.get('a')).toMatchObject({ acessos: 2, pontos: 500, melhorFase: 4 });
    expect(m.get('b')).toMatchObject({ acessos: 1, pontos: 50 });
  });
});
