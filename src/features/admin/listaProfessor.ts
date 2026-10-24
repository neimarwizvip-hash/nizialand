import type { LeaderboardPlayerEntry, PlayerProfile, TeamId } from '../../types';

// Converte a resposta de profListar (planilha) para o formato que o painel já usa.
// Os nomes dos campos são lidos com folga (id/playerId, codigo/playerCode, turma/className...).

type Linha = Record<string, unknown>;

const texto = (v: unknown) => (v === undefined || v === null ? '' : String(v));
const numero = (v: unknown) => Number(v) || 0;
const primeiro = (o: Linha, ...chaves: string[]) => {
  for (const k of chaves) {
    const v = o[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
};

const medalha = (total: number): LeaderboardPlayerEntry['medal'] =>
  total >= 1300 ? 'gold' : total >= 900 ? 'silver' : 'bronze';

export interface ListaProfessor {
  players: PlayerProfile[];
  leaderboard: LeaderboardPlayerEntry[];
}

export function converterListaProfessor(resposta: { jogadores?: unknown[]; resultados?: unknown[] }): ListaProfessor {
  const jogadores = (Array.isArray(resposta.jogadores) ? resposta.jogadores : []) as Linha[];
  const resultados = (Array.isArray(resposta.resultados) ? resposta.resultados : []) as Linha[];

  // Melhor pontuação de cada jogador por atividade, vinda da lista de resultados.
  const melhores = new Map<string, { quiz: number; flashcards: number; em: string }>();
  resultados.forEach(r => {
    const id = texto(primeiro(r, 'jogadorId', 'playerId', 'jogador_id', 'id'));
    if (!id) return;
    const atividade = texto(primeiro(r, 'atividade', 'activity'));
    const pontos = numero(primeiro(r, 'pontos', 'score', 'totalScore'));
    const m = melhores.get(id) ?? { quiz: 0, flashcards: 0, em: '' };
    if (atividade === 'quiz') m.quiz = Math.max(m.quiz, pontos);
    if (atividade === 'flashcards') m.flashcards = Math.max(m.flashcards, pontos);
    const em = texto(primeiro(r, 'concluido_em', 'completedAt', 'atualizado_em'));
    if (em > m.em) m.em = em;
    melhores.set(id, m);
  });

  const players: PlayerProfile[] = [];
  const leaderboard: LeaderboardPlayerEntry[] = [];
  jogadores.forEach(j => {
    const id = texto(primeiro(j, 'id', 'playerId', 'jogadorId'));
    if (!id) return;
    const nome = texto(primeiro(j, 'displayName', 'name', 'nome')) || 'Aluno';
    const team: TeamId = texto(primeiro(j, 'team', 'time')) === 'purple' ? 'purple' : 'blue';
    const criado = texto(primeiro(j, 'createdAt', 'criado_em'));
    const profile: PlayerProfile = {
      id,
      playerCode: texto(primeiro(j, 'playerCode', 'codigo', 'code')),
      name: texto(primeiro(j, 'name', 'nome')) || nome,
      displayName: nome,
      age: numero(primeiro(j, 'age', 'idade')),
      className: texto(primeiro(j, 'className', 'turma')),
      team,
      avatar: texto(primeiro(j, 'avatar')) || '/assets/avatar_mateus.jpg',
      skinTone: (texto(primeiro(j, 'skinTone')) || 'light') as PlayerProfile['skinTone'],
      level: numero(primeiro(j, 'level', 'nivel')),
      createdAt: criado,
      lastLoginAt: texto(primeiro(j, 'lastLoginAt', 'ultimo_acesso')),
    };
    players.push(profile);

    const porAtividade = (j.porAtividade ?? {}) as Linha;
    const m = melhores.get(id);
    const quiz = Math.max(m?.quiz ?? 0, numero(porAtividade.quiz), numero(j.quizScore));
    const flashcards = Math.max(m?.flashcards ?? 0, numero(porAtividade.flashcards), numero(j.flashcardScore));
    const total = quiz + flashcards || numero(j.totalScore);
    leaderboard.push({
      rank: 0,
      playerId: id,
      displayName: nome,
      className: profile.className,
      team,
      avatar: profile.avatar,
      quizScore: quiz,
      flashcardScore: flashcards,
      totalScore: total,
      completedAt: m?.em || texto(j.completedAt) || criado,
      medal: medalha(total),
    });
  });

  leaderboard.sort((a, b) => b.totalScore - a.totalScore);
  leaderboard.forEach((e, i) => (e.rank = i + 1));
  return { players, leaderboard };
}
