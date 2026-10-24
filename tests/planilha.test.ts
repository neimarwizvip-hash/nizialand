// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { QuizResult } from '../src/types';
import { converterListaProfessor } from '../src/features/admin/listaProfessor';

const URL_FALSA = 'https://planilha.test/exec';

const quiz = (totalScore: number): QuizResult => ({
  completed: true,
  totalScore,
  correctCount: 7,
  stars: 2,
  startedAt: '2026-10-23T10:00:00.000Z',
  completedAt: '2026-10-23T10:05:00.000Z',
  attempts: {},
});

const resposta = (corpo: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(corpo) }) as Response;

type Chamada = { url: string; metodo: string; corpo: Record<string, unknown> | null; headers?: HeadersInit };

// Cada teste carrega módulos novos (o storageService guarda cache do ranking).
async function carregar() {
  vi.resetModules();
  const { backendConfig } = await import('../src/config/backend');
  backendConfig.planilhaUrl = URL_FALSA;
  backendConfig.timeoutMs = 50;
  const { planilha } = await import('../src/services/planilha');
  const { storageService } = await import('../src/services/storage');
  return { backendConfig, planilha, storageService };
}

let chamadas: Chamada[];
function mockFetch(responder: (c: Chamada) => Promise<Response> | Response) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const c: Chamada = {
      url,
      metodo: init?.method ?? 'GET',
      corpo: init?.body ? JSON.parse(String(init.body)) : null,
      headers: init?.headers,
    };
    chamadas.push(c);
    return responder(c);
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

const semInternet = () => mockFetch(() => Promise.reject(new TypeError('Failed to fetch')));

beforeEach(() => {
  localStorage.clear();
  chamadas = [];
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Cliente da planilha', () => {
  it('GET usa ?acao= e POST manda JSON como text/plain', async () => {
    const { planilha } = await carregar();
    mockFetch(() => resposta({ ok: true, jogadores: [] }));
    await planilha.ranking();
    await planilha.entrar('ABCD');
    expect(chamadas[0]).toMatchObject({ url: `${URL_FALSA}?acao=ranking`, metodo: 'GET' });
    expect(chamadas[1]).toMatchObject({ url: URL_FALSA, metodo: 'POST', corpo: { acao: 'entrar', codigo: 'ABCD' } });
    expect(chamadas[1].headers).toEqual({ 'Content-Type': 'text/plain;charset=utf-8' });
  });

  it('sem internet, HTTP de erro e resposta estranha viram falha de rede (sem lançar erro)', async () => {
    const { planilha } = await carregar();
    semInternet();
    expect(await planilha.ping()).toEqual({ ok: false, erro: 'sem_conexao', rede: true });
    mockFetch(() => resposta({}, 403));
    expect(await planilha.ping()).toEqual({ ok: false, erro: 'http_403', rede: true });
    mockFetch(() => ({ ok: true, status: 200, text: async () => '<html>login</html>' }) as Response);
    expect(await planilha.ping()).toEqual({ ok: false, erro: 'resposta_invalida', rede: true });
  });

  it('tempo esgotado vira falha de rede', async () => {
    const { planilha } = await carregar();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_ok, falhou) => {
            init?.signal?.addEventListener('abort', () => falhou(Object.assign(new Error('abort'), { name: 'AbortError' })));
          })
      )
    );
    expect(await planilha.ranking()).toEqual({ ok: false, erro: 'tempo_esgotado', rede: true });
  });

  it('recusa do servidor não é falha de rede', async () => {
    const { planilha } = await carregar();
    mockFetch(() => resposta({ ok: false, erro: 'senha_incorreta' }));
    expect(await planilha.profEntrar('x')).toEqual({ ok: false, erro: 'senha_incorreta' });
  });

  it('sem endereço configurado não chama a internet', async () => {
    const { backendConfig, planilha } = await carregar();
    backendConfig.planilhaUrl = '';
    const fn = mockFetch(() => resposta({ ok: true }));
    expect(await planilha.ping()).toMatchObject({ ok: false, rede: true });
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('Fila de envio', () => {
  it('sem internet guarda na fila em ordem e envia tudo quando a conexão volta', async () => {
    const { storageService } = await carregar();
    semInternet();
    const aluno = await storageService.registerPlayer({ name: 'Teste Fila', age: 12, className: '609', team: 'blue' });
    await storageService.saveQuizResult(aluno.id, quiz(600));
    await storageService.enviarFila();
    expect(storageService.getFilaPlanilha().map(i => i.tipo)).toEqual(['cadastrar', 'resultado']);
    // O jogo continua salvo neste computador.
    expect(storageService.getQuizResult(aluno.id)?.totalScore).toBe(600);

    chamadas = [];
    mockFetch(c => resposta(c.corpo?.acao === 'cadastrar' ? { ok: true, id: 'remoto-1' } : { ok: true }));
    await storageService.enviarFila();
    expect(chamadas.map(c => c.corpo?.acao)).toEqual(['cadastrar', 'salvarResultado']);
    expect(chamadas[1].corpo).toMatchObject({ jogadorId: 'remoto-1', codigo: aluno.playerCode, atividade: 'quiz', pontos: 600 });
    expect(storageService.getFilaPlanilha()).toEqual([]);
  });

  it('depois de falha de rede tenta sozinha (30 s x3, depois 2 min) e para quando a fila esvazia', async () => {
    vi.useFakeTimers();
    try {
      const { storageService } = await carregar();
      semInternet();
      await storageService.registerPlayer({ name: 'Teste Timer', age: 12, className: '609', team: 'blue' });
      await storageService.enviarFila();
      const n = () => chamadas.length;

      for (let i = 0; i < 3; i++) {
        const antes = n();
        await vi.advanceTimersByTimeAsync(29_999);
        expect(n()).toBe(antes);
        await vi.advanceTimersByTimeAsync(1);
        expect(n()).toBe(antes + 1);
      }
      const antes = n();
      await vi.advanceTimersByTimeAsync(119_999);
      expect(n()).toBe(antes);

      mockFetch(() => resposta({ ok: true }));
      await vi.advanceTimersByTimeAsync(1);
      expect(storageService.getFilaPlanilha()).toEqual([]);
      const depois = n();
      await vi.advanceTimersByTimeAsync(10 * 60_000);
      expect(n()).toBe(depois);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('reenvia quando a aba volta a ficar visível e quando a internet volta', async () => {
    const { storageService } = await carregar();
    semInternet();
    await storageService.registerPlayer({ name: 'Teste Aba', age: 12, className: '609', team: 'blue' });
    storageService.iniciarSincronizacao();
    await storageService.enviarFila();

    let antes = chamadas.length;
    document.dispatchEvent(new Event('visibilitychange'));
    await storageService.enviarFila();
    expect(chamadas.length).toBeGreaterThan(antes);

    antes = chamadas.length;
    mockFetch(() => resposta({ ok: true }));
    window.dispatchEvent(new Event('online'));
    await storageService.enviarFila();
    expect(chamadas.length).toBeGreaterThan(antes);
    expect(storageService.getFilaPlanilha()).toEqual([]);
  });

  it('fica só o melhor resultado de cada atividade na fila', async () => {
    const { storageService } = await carregar();
    semInternet();
    const aluno = await storageService.registerPlayer({ name: 'Teste Melhor', age: 12, className: '609', team: 'blue' });
    await storageService.saveQuizResult(aluno.id, quiz(500));
    await storageService.saveQuizResult(aluno.id, quiz(800));
    storageService.enviarResultado(aluno.id, 'quiz', 300, 3, 1);
    await storageService.enviarFila();
    const resultados = storageService.getFilaPlanilha().filter(i => i.tipo === 'resultado');
    expect(resultados).toHaveLength(1);
    expect(resultados[0]).toMatchObject({ pontos: 800 });
  });

  it('código novo tem 4 caracteres', async () => {
    const { storageService } = await carregar();
    semInternet();
    const aluno = await storageService.registerPlayer({ name: 'Teste Codigo', age: 12, className: '609', team: 'blue' });
    expect(aluno.playerCode).toMatch(/^NSL-609-[A-Z0-9]{4}$/);
  });

  it('visitante nunca é enviado', async () => {
    const { storageService } = await carregar();
    const fn = mockFetch(() => resposta({ ok: true }));
    const visitante = storageService.startGuest({ name: 'Visita', grade: '6', avatar: '/assets/avatar_mateus.jpg' });
    await storageService.saveQuizResult(visitante.id, quiz(900));
    await storageService.enviarFila();
    expect(storageService.getFilaPlanilha()).toEqual([]);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('Entrar e ranking', () => {
  it('entrar pelo código traz os pontos salvos na planilha', async () => {
    const { storageService } = await carregar();
    mockFetch(c =>
      c.corpo?.acao === 'entrar'
        ? resposta({
            ok: true,
            jogador: { id: 'remoto-9', playerCode: 'NSL-609-AB12', name: 'Ana', displayName: 'Ana', className: '609', team: 'purple' },
            resultados: { quiz: { pontos: 750, acertos: 8, estrelas: 2, concluido_em: '2026-10-23T11:00:00.000Z' } },
          })
        : resposta({ ok: true })
    );
    const p = await storageService.loginWithCode('nsl-609-ab12');
    expect(p).toMatchObject({ id: 'remoto-9', displayName: 'Ana', team: 'purple' });
    expect(storageService.getQuizResult('remoto-9')?.totalScore).toBe(750);
  });

  it('sem internet entra com o que está salvo neste computador', async () => {
    const { storageService } = await carregar();
    semInternet();
    const aluno = await storageService.registerPlayer({ name: 'Teste Local', age: 12, className: '609', team: 'blue' });
    storageService.setStoredCurrentPlayer(null);
    expect((await storageService.loginWithCode(aluno.playerCode))?.id).toBe(aluno.id);
  });

  it('ranking vem da planilha; sem conexão usa o local e avisa', async () => {
    const { storageService } = await carregar();
    mockFetch(() =>
      resposta({
        ok: true,
        jogadores: [
          { playerId: 'a', displayName: 'Ana', className: '609', team: 'blue', avatar: '', porAtividade: { quiz: 400, flashcards: 100 } },
          { playerId: 'b', displayName: 'Bia', className: '701', team: 'purple', avatar: '', porAtividade: { quiz: 900, flashcards: 450 } },
        ],
      })
    );
    const lista = await storageService.getLeaderboard();
    expect(storageService.rankingSource).toBe('planilha');
    expect(lista.map(e => [e.rank, e.displayName, e.totalScore, e.medal])).toEqual([
      [1, 'Bia', 1350, 'gold'],
      [2, 'Ana', 500, 'bronze'],
    ]);

    const { storageService: outro } = await carregar();
    semInternet();
    await outro.getLeaderboard();
    expect(outro.rankingSource).toBe('local');
  });
});

describe('Lista do professor', () => {
  it('converte jogadores e resultados (melhor por atividade)', () => {
    const { players, leaderboard } = converterListaProfessor({
      jogadores: [
        { id: 'j1', codigo: 'AB12', nome: 'Ana', turma: '609', time: 'purple' },
        { id: 'j2', playerCode: 'CD34', displayName: 'Bia', className: '701', team: 'blue' },
        { nome: 'sem id' },
      ],
      resultados: [
        { jogadorId: 'j1', atividade: 'quiz', pontos: 400 },
        { jogadorId: 'j1', atividade: 'quiz', pontos: 700 },
        { jogadorId: 'j1', atividade: 'flashcards', pontos: 300 },
        { jogadorId: 'j2', atividade: 'quiz', pontos: 200 },
      ],
    });
    expect(players.map(p => [p.id, p.playerCode, p.displayName, p.className, p.team])).toEqual([
      ['j1', 'AB12', 'Ana', '609', 'purple'],
      ['j2', 'CD34', 'Bia', '701', 'blue'],
    ]);
    expect(leaderboard.map(e => [e.rank, e.playerId, e.quizScore, e.flashcardScore, e.totalScore, e.medal])).toEqual([
      [1, 'j1', 700, 300, 1000, 'silver'],
      [2, 'j2', 200, 0, 200, 'bronze'],
    ]);
  });

  it('resposta vazia não quebra', () => {
    expect(converterListaProfessor({})).toEqual({ players: [], leaderboard: [] });
  });
});
