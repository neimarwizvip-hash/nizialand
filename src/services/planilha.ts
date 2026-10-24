// Cliente da planilha (Google Apps Script). Nunca lança erro: devolve sempre
// { ok: true, ... } ou { ok: false, erro, rede? }. "rede: true" quer dizer que vale
// tentar de novo depois (sem internet, tempo esgotado, resposta estranha).
import { backendConfig } from '../config/backend';
import type { PlayerProfile } from '../types';

// Nível 0 usa 'quiz'/'flashcards'; níveis novos mandam o id da atividade (ex.: 'nivel1-ouvir').
export type Atividade = 'quiz' | 'flashcards' | (string & {});

export interface PlanilhaFalha {
  ok: false;
  erro: string;
  rede?: boolean;
}

export type PlanilhaResposta<T> = ({ ok: true } & T) | PlanilhaFalha;

export interface ResultadoRemoto {
  pontos: number;
  acertos?: number;
  estrelas?: number;
  concluido_em?: string;
  detalhes?: unknown;
}

export interface JogadorRanking {
  playerId: string;
  displayName: string;
  className: string;
  team: string;
  avatar: string;
  porAtividade?: { quiz?: number; flashcards?: number } & Record<string, number | undefined>;
  totalScore?: number;
  completedAt?: string | null;
}

export interface ResultadoParaEnviar {
  jogadorId: string;
  codigo: string;
  atividade: Atividade;
  pontos: number;
  acertos: number;
  estrelas: number;
  detalhes?: unknown;
}

const falhaDeRede = (erro: string): PlanilhaFalha => ({ ok: false, erro, rede: true });

async function chamar<T>(init: { metodo: 'GET'; query: string } | { metodo: 'POST'; corpo: object }): Promise<PlanilhaResposta<T>> {
  const base = backendConfig.planilhaUrl;
  if (!base) return falhaDeRede('sem_planilha');
  if (typeof fetch !== 'function') return falhaDeRede('sem_fetch');

  const controle = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controle ? setTimeout(() => controle.abort(), backendConfig.timeoutMs) : null;
  try {
    const resposta =
      init.metodo === 'GET'
        ? await fetch(`${base}?${init.query}`, { method: 'GET', redirect: 'follow', signal: controle?.signal })
        : await fetch(base, {
            method: 'POST',
            redirect: 'follow',
            // text/plain evita a checagem extra (preflight) que o Apps Script não responde
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(init.corpo),
            signal: controle?.signal,
          });
    if (!resposta.ok) return falhaDeRede(`http_${resposta.status}`);
    let dados: unknown;
    try {
      dados = JSON.parse(await resposta.text());
    } catch {
      return falhaDeRede('resposta_invalida');
    }
    if (!dados || typeof dados !== 'object') return falhaDeRede('resposta_invalida');
    const obj = dados as Record<string, unknown>;
    if (obj.ok === true) return obj as { ok: true } & T;
    return { ok: false, erro: typeof obj.erro === 'string' ? obj.erro : 'erro_desconhecido' };
  } catch (e) {
    const abortado = (e as { name?: string })?.name === 'AbortError';
    return falhaDeRede(abortado ? 'tempo_esgotado' : 'sem_conexao');
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const planilha = {
  ping: () => chamar<Record<string, unknown>>({ metodo: 'GET', query: 'acao=ping' }),

  ranking: () =>
    chamar<{ atualizado_em?: string; jogadores: JogadorRanking[] }>({ metodo: 'GET', query: 'acao=ranking' }),

  cadastrar: (jogador: PlayerProfile) => chamar<{ id?: string }>({ metodo: 'POST', corpo: { acao: 'cadastrar', jogador } }),

  entrar: (codigo: string) =>
    chamar<{
      jogador: Partial<PlayerProfile> & { playerId?: string };
      resultados?: Partial<Record<Atividade, ResultadoRemoto | null>>;
    }>({ metodo: 'POST', corpo: { acao: 'entrar', codigo } }),

  salvarResultado: (r: ResultadoParaEnviar) =>
    chamar<Record<string, unknown>>({ metodo: 'POST', corpo: { acao: 'salvarResultado', ...r } }),

  profEntrar: (senha: string) => chamar<{ token: string }>({ metodo: 'POST', corpo: { acao: 'profEntrar', senha } }),

  profListar: (token: string) =>
    chamar<{ jogadores?: unknown[]; resultados?: unknown[]; [k: string]: unknown }>({
      metodo: 'POST',
      corpo: { acao: 'profListar', token },
    }),

  profApagarJogador: (token: string, jogadorId: string) =>
    chamar<Record<string, unknown>>({ metodo: 'POST', corpo: { acao: 'profApagarJogador', token, jogadorId } }),

  profZerarResultados: (token: string, jogadorId: string) =>
    chamar<Record<string, unknown>>({ metodo: 'POST', corpo: { acao: 'profZerarResultados', token, jogadorId } }),
};
