import {
  PlayerProfile,
  QuizResult,
  FlashcardResult,
  LeaderboardPlayerEntry,
  ClassRankingEntry,
  TeamRankingComparison,
  TeacherAuditLog
} from '../types';
import { planilha, type Atividade, type ResultadoRemoto, type JogadorRanking } from './planilha';

// Fila do que ainda não chegou na planilha (sem internet, tempo esgotado...).
// Reenviada ao abrir o app, quando a conexão volta, quando a aba volta a ficar visível
// e, depois de uma falha, sozinha: a cada 30 s nas 3 primeiras tentativas, depois a cada 2 min.
const FILA_PLANILHA = 'nisialand_planilha_fila';
// id local -> id na planilha (quando o servidor devolve outro id no cadastro)
const IDS_PLANILHA = 'nisialand_planilha_ids';
const RANKING_CACHE_MS = 30000;
const REENVIO_RAPIDO_MS = 30000;
const REENVIO_LENTO_MS = 120000;
const TENTATIVAS_RAPIDAS = 3;

type ItemFila =
  | { tipo: 'cadastrar'; jogador: PlayerProfile }
  | {
      tipo: 'resultado';
      jogadorId: string;
      codigo: string;
      atividade: Atividade;
      pontos: number;
      acertos: number;
      estrelas: number;
      detalhes?: unknown;
    };

function lerJson<T>(chave: string, padrao: T): T {
  try {
    const dados = localStorage.getItem(chave);
    return dados ? (JSON.parse(dados) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravarJson(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // sem espaço / bloqueado: segue só em memória
  }
}

function medalha(total: number): 'bronze' | 'silver' | 'gold' {
  if (total >= 1300) return 'gold';
  if (total >= 900) return 'silver';
  return 'bronze';
}

function ordenarComRank(lista: LeaderboardPlayerEntry[]): LeaderboardPlayerEntry[] {
  return [...lista]
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.displayName.localeCompare(b.displayName);
    })
    .map((entry, index) => ({ ...entry, rank: index + 1, medal: medalha(entry.totalScore) }));
}

const STORAGE_KEYS = {
  CURRENT_PLAYER: 'nisialand_current_player',
  PLAYERS_LIST: 'nisialand_players_db',
  QUIZ_RESULTS: 'nisialand_quiz_results',
  FLASHCARD_RESULTS: 'nisialand_flashcard_results',
  AUDIT_LOGS: 'nisialand_audit_logs',
  COMPETITION_STATUS: 'nisialand_competition_status'
};

const LEGACY_STORAGE_KEYS = {
  CURRENT_PLAYER: 'nizialand_current_player',
  PLAYERS_LIST: 'nizialand_players_db',
  QUIZ_RESULTS: 'nizialand_quiz_results',
  FLASHCARD_RESULTS: 'nizialand_flashcard_results',
  AUDIT_LOGS: 'nizialand_audit_logs',
  COMPETITION_STATUS: 'nizialand_competition_status'
};

function getLocalItem(key: keyof typeof STORAGE_KEYS): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS[key]) || localStorage.getItem(LEGACY_STORAGE_KEYS[key]);
  } catch {
    return null;
  }
}

// Generate a memorable and secure player code (e.g. NSL-804-A7K9).
// Códigos antigos de 3 caracteres continuam valendo no login.
export function generatePlayerCode(className: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NSL-${className}-${randomPart}`;
}

// Resultados de visitante nunca vão para a planilha.
function isGuestId(playerId: string): boolean {
  return playerId.startsWith('guest_');
}

class StorageService {
  // De onde veio o último ranking: 'planilha' (todos os computadores) ou 'local' (só este).
  public rankingSource: 'planilha' | 'local' = 'local';
  private rankingCache: { em: number; lista: LeaderboardPlayerEntry[] } | null = null;
  private rankingPendente: Promise<LeaderboardPlayerEntry[] | null> | null = null;
  private enviando: Promise<void> | null = null;
  private sincronizando = false;
  private timerReenvio: ReturnType<typeof setTimeout> | null = null;
  private tentativasReenvio = 0;

  // --- PLANILHA: FILA DE ENVIO ---

  public getFilaPlanilha(): ItemFila[] {
    const fila = lerJson<ItemFila[]>(FILA_PLANILHA, []);
    return Array.isArray(fila) ? fila : [];
  }

  private ligarIds(idLocal: string, idRemoto: string) {
    if (!idRemoto || idRemoto === idLocal) return;
    const mapa = lerJson<Record<string, string>>(IDS_PLANILHA, {});
    mapa[idLocal] = idRemoto;
    gravarJson(IDS_PLANILHA, mapa);
  }

  private idRemoto(idLocal: string): string {
    return lerJson<Record<string, string>>(IDS_PLANILHA, {})[idLocal] || idLocal;
  }

  private codigoDe(playerId: string): string {
    const cur = this.getStoredCurrentPlayer();
    if (cur && cur.id === playerId) return cur.playerCode;
    return this.getAllPlayers().find(p => p.id === playerId)?.playerCode || '';
  }

  private enfileirar(item: ItemFila) {
    const fila = this.getFilaPlanilha();
    if (item.tipo === 'resultado') {
      // Um resultado por aluno e atividade: fica o de mais pontos.
      const i = fila.findIndex(
        f => f.tipo === 'resultado' && f.jogadorId === item.jogadorId && f.atividade === item.atividade
      );
      if (i >= 0) {
        const atual = fila[i] as Extract<ItemFila, { tipo: 'resultado' }>;
        if (atual.pontos >= item.pontos) {
          void this.enviarFila();
          return;
        }
        fila[i] = item;
      } else {
        fila.push(item);
      }
    } else {
      fila.push(item);
    }
    gravarJson(FILA_PLANILHA, fila);
    void this.enviarFila();
  }

  // Envia a fila em ordem. Para no primeiro problema de rede (tenta de novo depois);
  // erro definitivo do servidor (ex.: código repetido) tira o item da fila.
  public enviarFila(): Promise<void> {
    if (this.enviando) return this.enviando;
    this.enviando = (async () => {
      try {
        this.pararReenvio();
        for (let voltas = 0; voltas < 100; voltas++) {
          const item = this.getFilaPlanilha()[0];
          if (!item) break;
          const resposta =
            item.tipo === 'cadastrar'
              ? await planilha.cadastrar(item.jogador)
              : await planilha.salvarResultado({
                  jogadorId: this.idRemoto(item.jogadorId),
                  codigo: item.codigo,
                  atividade: item.atividade,
                  pontos: item.pontos,
                  acertos: item.acertos,
                  estrelas: item.estrelas,
                  detalhes: item.detalhes,
                });
          if (!resposta.ok && resposta.rede) break;
          if (resposta.ok && item.tipo === 'cadastrar') {
            const id = (resposta as { id?: unknown }).id;
            if (typeof id === 'string') this.ligarIds(item.jogador.id, id);
          }
          if (!resposta.ok) console.warn('Planilha recusou item da fila:', resposta.erro);
          const alvo = JSON.stringify(item);
          const restante = this.getFilaPlanilha();
          const i = restante.findIndex(f => JSON.stringify(f) === alvo);
          // Se o item foi trocado por um resultado melhor enquanto enviava, o novo fica na fila.
          if (i >= 0) restante.splice(i, 1);
          gravarJson(FILA_PLANILHA, restante);
          this.rankingCache = null;
        }
      } finally {
        this.enviando = null;
        if (this.getFilaPlanilha().length > 0) this.agendarReenvio();
        else this.tentativasReenvio = 0;
      }
    })();
    return this.enviando;
  }

  // Ainda há itens pendentes: tenta de novo sozinho (30 s nas 3 primeiras vezes, depois 2 min).
  private agendarReenvio() {
    this.pararReenvio();
    const espera = this.tentativasReenvio < TENTATIVAS_RAPIDAS ? REENVIO_RAPIDO_MS : REENVIO_LENTO_MS;
    this.tentativasReenvio++;
    this.timerReenvio = setTimeout(() => {
      this.timerReenvio = null;
      void this.enviarFila();
    }, espera);
  }

  private pararReenvio() {
    if (this.timerReenvio) clearTimeout(this.timerReenvio);
    this.timerReenvio = null;
  }

  // Chamado uma vez ao abrir o app.
  public iniciarSincronizacao() {
    if (this.sincronizando) return;
    this.sincronizando = true;
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => void this.enviarFila());
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void this.enviarFila();
      });
    }
    void this.enviarFila();
  }

  // --- PLAYER SESSION & REGISTRATION ---

  public getStoredCurrentPlayer(): PlayerProfile | null {
    try {
      const data = getLocalItem('CURRENT_PLAYER');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public setStoredCurrentPlayer(player: PlayerProfile | null) {
    if (player) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYER, JSON.stringify(player));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PLAYER);
    }
  }

  public async registerPlayer(data: {
    name: string;
    age: number;
    className: string;
    team: 'blue' | 'purple';
    avatar?: string;
    skinTone?: 'light' | 'medium' | 'dark' | 'warm';
  }): Promise<PlayerProfile> {
    const defaultAvatar = data.team === 'blue' ? '/assets/avatar_mateus.jpg' : '/assets/avatar_juliana.jpg';
    const playerCode = generatePlayerCode(data.className);
    const newPlayer: PlayerProfile = {
      id: 'player_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      playerCode,
      name: data.name.trim(),
      displayName: data.name.trim().split(' ')[0] + (data.name.trim().split(' ')[1] ? ` ${data.name.trim().split(' ')[1].charAt(0)}.` : ''),
      age: data.age,
      className: data.className,
      team: data.team,
      avatar: data.avatar || defaultAvatar,
      skinTone: data.skinTone || 'light',
      level: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    // Save locally
    const players = this.getAllPlayers();
    players.push(newPlayer);
    localStorage.setItem(STORAGE_KEYS.PLAYERS_LIST, JSON.stringify(players));
    this.setStoredCurrentPlayer(newPlayer);

    // Planilha: vai para a fila e é enviado em segundo plano (visitante nunca chega aqui).
    this.enfileirar({ tipo: 'cadastrar', jogador: newPlayer });

    this.logAudit('PLAYER_REGISTERED', `Player ${newPlayer.name} (${newPlayer.playerCode}) joined ${newPlayer.team.toUpperCase()} TEAM.`);

    return newPlayer;
  }

  // Visitante: joga sem código. Fica só como jogador atual — não entra na
  // lista de alunos, no ranking nem no Supabase.
  public startGuest(data: {
    name: string;
    grade: string;
    avatar: string;
    team?: 'blue' | 'purple';
  }): PlayerProfile {
    const name = data.name.trim();
    const guest: PlayerProfile = {
      id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      playerCode: '',
      name,
      displayName: name,
      age: 0,
      className: `${data.grade}º ano`,
      team: data.team || 'blue',
      avatar: data.avatar,
      skinTone: 'light',
      level: 0,
      kind: 'guest',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    this.setStoredCurrentPlayer(guest);
    return guest;
  }

  // Leva os resultados do visitante para o aluno recém-cadastrado e apaga os do visitante.
  public async convertGuest(guestId: string, newPlayerId: string): Promise<void> {
    const quiz = this.getQuizResult(guestId);
    const flashcards = this.getFlashcardResult(guestId);
    if (quiz) await this.saveQuizResult(newPlayerId, quiz);
    if (flashcards) await this.saveFlashcardResult(newPlayerId, flashcards);

    const quizAll = this.getAllQuizResults();
    delete quizAll[guestId];
    localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(quizAll));

    const fcAll = this.getAllFlashcardResults();
    delete fcAll[guestId];
    localStorage.setItem(STORAGE_KEYS.FLASHCARD_RESULTS, JSON.stringify(fcAll));

    this.logAudit('GUEST_CONVERTED', `Visitor ${guestId} registered as ${newPlayerId}; results kept.`);
  }

  public async loginWithCode(code: string): Promise<PlayerProfile | null> {
    const formattedCode = code.trim().toUpperCase();

    // Planilha primeiro (vale em qualquer computador); sem conexão, usa o que está salvo aqui.
    const remoto = await this.entrarPelaPlanilha(formattedCode);
    if (remoto) return remoto;

    // Local fallback (matches either NSL or legacy NZL prefix)
    const altCode = formattedCode.startsWith('NSL-')
      ? formattedCode.replace('NSL-', 'NZL-')
      : formattedCode.startsWith('NZL-')
        ? formattedCode.replace('NZL-', 'NSL-')
        : formattedCode;

    const players = this.getAllPlayers();
    const found = players.find(p => {
      const pCode = p.playerCode.toUpperCase();
      return pCode === formattedCode || pCode === altCode;
    });
    if (found) {
      found.lastLoginAt = new Date().toISOString();
      this.setStoredCurrentPlayer(found);
      this.savePlayersList(players);
      return found;
    }

    return null;
  }

  public getAllPlayers(): PlayerProfile[] {
    try {
      const data = getLocalItem('PLAYERS_LIST');
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private savePlayersList(players: PlayerProfile[]) {
    localStorage.setItem(STORAGE_KEYS.PLAYERS_LIST, JSON.stringify(players));
  }

  // --- MISSION 1: QUIZ PERSISTENCE ---

  public async saveQuizResult(playerId: string, result: QuizResult): Promise<void> {
    const allQuizResults = this.getAllQuizResults();
    allQuizResults[playerId] = result;
    localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(allQuizResults));

    this.enviarResultado(playerId, 'quiz', result.totalScore, result.correctCount, result.stars, result);

    this.logAudit('QUIZ_COMPLETED', `Player ${playerId} completed Quiz with ${result.totalScore} pts.`);
  }

  public getQuizResult(playerId: string): QuizResult | null {
    const all = this.getAllQuizResults();
    return all[playerId] || null;
  }

  public getAllQuizResults(): Record<string, QuizResult> {
    try {
      const data = getLocalItem('QUIZ_RESULTS');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  // --- MISSION 2: FLASHCARD PERSISTENCE ---

  public async saveFlashcardResult(playerId: string, result: FlashcardResult): Promise<void> {
    const allFcResults = this.getAllFlashcardResults();
    allFcResults[playerId] = result;
    localStorage.setItem(STORAGE_KEYS.FLASHCARD_RESULTS, JSON.stringify(allFcResults));

    this.enviarResultado(playerId, 'flashcards', result.totalScore, result.roundsCompleted, result.stars, result);

    this.logAudit('FLASHCARDS_COMPLETED', `Player ${playerId} completed Flashcards with ${result.totalScore} pts.`);
  }

  public getFlashcardResult(playerId: string): FlashcardResult | null {
    const all = this.getAllFlashcardResults();
    return all[playerId] || null;
  }

  public getAllFlashcardResults(): Record<string, FlashcardResult> {
    try {
      const data = getLocalItem('FLASHCARD_RESULTS');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  // --- LEADERBOARD & RANKING COMPUTATIONS ---

  // --- PLANILHA ---

  // Põe o resultado na fila da planilha (visitante nunca é enviado).
  public enviarResultado(
    playerId: string,
    atividade: Atividade,
    pontos: number,
    acertos: number,
    estrelas: number,
    detalhes?: unknown
  ) {
    if (isGuestId(playerId)) return;
    const codigo = this.codigoDe(playerId);
    if (!codigo) return;
    this.enfileirar({ tipo: 'resultado', jogadorId: playerId, codigo, atividade, pontos, acertos, estrelas, detalhes });
  }

  // Entra pelo código na planilha e junta com o que já está salvo neste computador.
  private async entrarPelaPlanilha(codigo: string): Promise<PlayerProfile | null> {
    const r = await planilha.entrar(codigo);
    if (!r.ok || !r.jogador) return null;
    const j = r.jogador;
    const remoteId = String(j.id ?? j.playerId ?? '');
    const agora = new Date().toISOString();
    const definidos: Partial<PlayerProfile> = {};
    (['playerCode', 'name', 'displayName', 'age', 'className', 'team', 'avatar', 'skinTone', 'level', 'createdAt'] as const).forEach(k => {
      const v = j[k];
      if (v !== undefined && v !== null && v !== '') (definidos as Record<string, unknown>)[k] = v;
    });
    if (definidos.team && definidos.team !== 'purple') definidos.team = 'blue';
    if (definidos.age !== undefined) definidos.age = Number(definidos.age) || 0;

    const players = this.getAllPlayers();
    const i = players.findIndex(p => (p.playerCode || '').toUpperCase() === codigo);
    let profile: PlayerProfile;
    if (i >= 0) {
      profile = { ...players[i], ...definidos, id: players[i].id, kind: players[i].kind, lastLoginAt: agora };
      players[i] = profile;
      this.ligarIds(profile.id, remoteId);
    } else {
      if (!remoteId) return null;
      const nome = String(definidos.name ?? definidos.displayName ?? 'Aluno');
      profile = {
        id: remoteId,
        playerCode: String(definidos.playerCode ?? codigo),
        name: nome,
        displayName: String(definidos.displayName ?? nome),
        age: definidos.age ?? 0,
        className: String(definidos.className ?? ''),
        team: definidos.team ?? 'blue',
        avatar: String(definidos.avatar ?? '/assets/avatar_mateus.jpg'),
        skinTone: definidos.skinTone ?? 'light',
        level: definidos.level ?? 0,
        createdAt: String(definidos.createdAt ?? agora),
        lastLoginAt: agora,
      };
      players.push(profile);
    }
    this.savePlayersList(players);
    this.setStoredCurrentPlayer(profile);
    this.mesclarResultados(profile.id, r.resultados);
    return profile;
  }

  // Fica o melhor de cada atividade: o da planilha vem para cá, o daqui (se for melhor) vai para lá.
  private mesclarResultados(playerId: string, resultados?: Partial<Record<Atividade, ResultadoRemoto | null>>) {
    const agora = new Date().toISOString();
    const quizRemoto = resultados?.quiz;
    const quizLocal = this.getQuizResult(playerId);
    if (quizRemoto && Number(quizRemoto.pontos) > (quizLocal?.totalScore ?? -1)) {
      const d = quizRemoto.detalhes as Partial<QuizResult> | undefined;
      const res: QuizResult =
        d && typeof d === 'object' && typeof d.totalScore === 'number'
          ? (d as QuizResult)
          : {
              completed: true,
              totalScore: Number(quizRemoto.pontos) || 0,
              correctCount: Number(quizRemoto.acertos) || 0,
              stars: Number(quizRemoto.estrelas) || 0,
              startedAt: quizRemoto.concluido_em || agora,
              completedAt: quizRemoto.concluido_em || agora,
              attempts: {},
            };
      const todos = this.getAllQuizResults();
      todos[playerId] = res;
      localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(todos));
    } else if (quizLocal && quizLocal.totalScore > (Number(quizRemoto?.pontos) || 0)) {
      this.enviarResultado(playerId, 'quiz', quizLocal.totalScore, quizLocal.correctCount, quizLocal.stars, quizLocal);
    }

    const fcRemoto = resultados?.flashcards;
    const fcLocal = this.getFlashcardResult(playerId);
    if (fcRemoto && Number(fcRemoto.pontos) > (fcLocal?.totalScore ?? -1)) {
      const d = fcRemoto.detalhes as Partial<FlashcardResult> | undefined;
      const res: FlashcardResult =
        d && typeof d === 'object' && typeof d.totalScore === 'number'
          ? (d as FlashcardResult)
          : {
              completed: true,
              totalScore: Number(fcRemoto.pontos) || 0,
              roundsCompleted: Number(fcRemoto.acertos) || 0,
              stars: Number(fcRemoto.estrelas) || 0,
              startedAt: fcRemoto.concluido_em || agora,
              completedAt: fcRemoto.concluido_em || agora,
              roundAttempts: [],
            };
      const todos = this.getAllFlashcardResults();
      todos[playerId] = res;
      localStorage.setItem(STORAGE_KEYS.FLASHCARD_RESULTS, JSON.stringify(todos));
    } else if (fcLocal && fcLocal.totalScore > (Number(fcRemoto?.pontos) || 0)) {
      this.enviarResultado(playerId, 'flashcards', fcLocal.totalScore, fcLocal.roundsCompleted, fcLocal.stars, fcLocal);
    }
  }

  // --- LEADERBOARD ---

  // Ranking da planilha (com cache curto); sem conexão, usa o deste computador.
  public async getLeaderboard(): Promise<LeaderboardPlayerEntry[]> {
    if (this.rankingCache && Date.now() - this.rankingCache.em < RANKING_CACHE_MS) {
      this.rankingSource = 'planilha';
      return this.comJogadorAtual(this.rankingCache.lista);
    }
    if (!this.rankingPendente) {
      this.rankingPendente = planilha
        .ranking()
        .then(r => (r.ok && Array.isArray(r.jogadores) ? r.jogadores.map(j => this.entradaDaPlanilha(j)) : null))
        .finally(() => {
          this.rankingPendente = null;
        });
    }
    const lista = await this.rankingPendente;
    if (lista) {
      this.rankingCache = { em: Date.now(), lista };
      this.rankingSource = 'planilha';
      return this.comJogadorAtual(lista);
    }
    this.rankingSource = 'local';
    return this.getLocalLeaderboard();
  }

  private entradaDaPlanilha(j: JogadorRanking): LeaderboardPlayerEntry {
    const quiz = Number(j.porAtividade?.quiz) || 0;
    const fc = Number(j.porAtividade?.flashcards) || 0;
    const total = quiz + fc || Number(j.totalScore) || 0;
    return {
      rank: 0,
      playerId: String(j.playerId ?? ''),
      displayName: String(j.displayName ?? ''),
      className: String(j.className ?? ''),
      team: j.team === 'purple' ? 'purple' : 'blue',
      avatar: String(j.avatar ?? ''),
      quizScore: quiz,
      flashcardScore: fc,
      totalScore: total,
      completedAt: j.completedAt ?? '',
      medal: medalha(total),
    };
  }

  // O aluno logado vê logo os próprios pontos, mesmo antes de a fila chegar à planilha.
  private comJogadorAtual(lista: LeaderboardPlayerEntry[]): LeaderboardPlayerEntry[] {
    const copia = lista.map(e => ({ ...e }));
    const cur = this.getStoredCurrentPlayer();
    if (cur && !isGuestId(cur.id) && cur.kind !== 'guest') {
      const quiz = this.getQuizResult(cur.id)?.totalScore ?? 0;
      const fc = this.getFlashcardResult(cur.id)?.totalScore ?? 0;
      const remoto = this.idRemoto(cur.id);
      const e = copia.find(x => x.playerId === remoto || x.playerId === cur.id);
      if (e) {
        e.quizScore = Math.max(e.quizScore, quiz);
        e.flashcardScore = Math.max(e.flashcardScore, fc);
        e.totalScore = Math.max(e.totalScore, e.quizScore + e.flashcardScore);
        e.medal = medalha(e.totalScore);
      } else if (quiz + fc > 0) {
        copia.push({
          rank: 0,
          playerId: cur.id,
          displayName: cur.displayName,
          className: cur.className,
          team: cur.team,
          avatar: cur.avatar,
          quizScore: quiz,
          flashcardScore: fc,
          totalScore: quiz + fc,
          completedAt: this.getFlashcardResult(cur.id)?.completedAt || this.getQuizResult(cur.id)?.completedAt || cur.createdAt,
          medal: medalha(quiz + fc),
        });
      }
    }
    return ordenarComRank(copia);
  }

  // Ranking só com o que está salvo neste computador (reserva sem internet).
  public async getLocalLeaderboard(): Promise<LeaderboardPlayerEntry[]> {
    // Collect registered players (visitors never enter the ranking)
    const players = this.getAllPlayers().filter(p => p.kind !== 'guest');
    const quizResults = this.getAllQuizResults();
    const fcResults = this.getAllFlashcardResults();

    const registeredEntries: LeaderboardPlayerEntry[] = players.map(p => {
      const qRes = quizResults[p.id];
      const fcRes = fcResults[p.id];
      const qScore = qRes ? qRes.totalScore : 0;
      const fcScore = fcRes ? fcRes.totalScore : 0;
      const total = qScore + fcScore;

      let medal: 'bronze' | 'silver' | 'gold' = 'bronze';
      if (total >= 1300) medal = 'gold';
      else if (total >= 900) medal = 'silver';

      return {
        rank: 0,
        playerId: p.id,
        displayName: p.displayName,
        className: p.className,
        team: p.team,
        avatar: p.avatar,
        quizScore: qScore,
        flashcardScore: fcScore,
        totalScore: total,
        completedAt: fcRes?.completedAt || qRes?.completedAt || p.createdAt,
        medal
      };
    });

    // Só alunos cadastrados de verdade entram no ranking (sem jogadores fictícios nem visitantes).
    return ordenarComRank(registeredEntries);
  }

  public async getClassRankings(): Promise<ClassRankingEntry[]> {
    const leaderboard = await this.getLeaderboard();
    // Só turmas que têm jogadores aparecem (nada de turmas fixas).
    const classMap: Record<string, { total: number; count: number }> = {};

    leaderboard.forEach(item => {
      if (!classMap[item.className]) {
        classMap[item.className] = { total: 0, count: 0 };
      }
      classMap[item.className].total += item.totalScore;
      classMap[item.className].count += 1;
    });

    const entries: ClassRankingEntry[] = Object.keys(classMap).map(cls => {
      const info = classMap[cls];
      const average = info.count > 0 ? Math.round(info.total / info.count) : 0;
      return {
        className: cls,
        studentsCount: info.count,
        totalPoints: info.total,
        averageScore: average
      };
    });

    // Sort by average score descending (fair comparison across different sizes)
    entries.sort((a, b) => b.averageScore - a.averageScore);
    return entries;
  }

  public async getTeamComparison(): Promise<TeamRankingComparison> {
    const leaderboard = await this.getLeaderboard();

    let blueTotal = 0;
    let blueCount = 0;
    let purpleTotal = 0;
    let purpleCount = 0;

    leaderboard.forEach(entry => {
      if (entry.team === 'blue') {
        blueTotal += entry.totalScore;
        blueCount++;
      } else if (entry.team === 'purple') {
        purpleTotal += entry.totalScore;
        purpleCount++;
      }
    });

    const blueAvg = blueCount > 0 ? Math.round(blueTotal / blueCount) : 0;
    const purpleAvg = purpleCount > 0 ? Math.round(purpleTotal / purpleCount) : 0;

    let leadingTeam: 'blue' | 'purple' | 'tie' = 'tie';
    if (blueAvg > purpleAvg) leadingTeam = 'blue';
    else if (purpleAvg > blueAvg) leadingTeam = 'purple';

    return {
      blueTeam: {
        playersCount: blueCount,
        totalPoints: blueTotal,
        averageScore: blueAvg
      },
      purpleTeam: {
        playersCount: purpleCount,
        totalPoints: purpleTotal,
        averageScore: purpleAvg
      },
      leadingTeam
    };
  }

  // --- TEACHER / ADMIN AUDIT & MANAGEMENT ---

  public logAudit(action: string, details: string, teacherName: string = 'Prof. Neimar Oliveira') {
    const logs = this.getAuditLogs();
    const newLog: TeacherAuditLog = {
      id: 'audit_' + Date.now(),
      timestamp: new Date().toISOString(),
      action,
      details,
      teacherName
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
  }

  public getAuditLogs(): TeacherAuditLog[] {
    try {
      const data = getLocalItem('AUDIT_LOGS');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public resetPlayerAttempts(playerId: string): void {
    const quizAll = this.getAllQuizResults();
    delete quizAll[playerId];
    localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(quizAll));

    const fcAll = this.getAllFlashcardResults();
    delete fcAll[playerId];
    localStorage.setItem(STORAGE_KEYS.FLASHCARD_RESULTS, JSON.stringify(fcAll));

    this.logAudit('RESET_ATTEMPTS', `Teacher reset missions for player ${playerId}`);
  }

  public resetPlayerProgress(playerId: string): void {
    this.resetPlayerAttempts(playerId);
  }

  public async updatePlayerName(playerId: string, newName: string): Promise<boolean> {
    const cleanName = newName.trim();
    if (!cleanName) return false;

    // Update local players
    const all = this.getAllPlayers();
    const updated = all.map(p => {
      if (p.id === playerId) {
        return { ...p, name: cleanName, displayName: cleanName };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PLAYERS_LIST, JSON.stringify(updated));

    // Update current player if active
    const cur = this.getStoredCurrentPlayer();
    if (cur && cur.id === playerId) {
      this.setStoredCurrentPlayer({ ...cur, name: cleanName, displayName: cleanName });
    }

    this.logAudit('RENAME_PLAYER', `Teacher renamed player ${playerId} to "${cleanName}"`);
    return true;
  }
}

export const storageService = new StorageService();
