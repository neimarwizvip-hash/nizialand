import {
  PlayerProfile,
  QuizResult,
  FlashcardResult,
  LeaderboardPlayerEntry,
  ClassRankingEntry,
  TeamRankingComparison,
  TeacherAuditLog
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

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

// Generate a memorable and secure player code (e.g. NSL-804-A79)
export function generatePlayerCode(className: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 3; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NSL-${className}-${randomPart}`;
}

// Resultados de visitante nunca vão para o Supabase.
function isGuestId(playerId: string): boolean {
  return playerId.startsWith('guest_');
}

class StorageService {
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

    // Save to Supabase if available
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('players').insert([{
          id: newPlayer.id,
          player_code: newPlayer.playerCode,
          name: newPlayer.name,
          display_name: newPlayer.displayName,
          age: newPlayer.age,
          class_name: newPlayer.className,
          team: newPlayer.team,
          avatar: newPlayer.avatar,
          created_at: newPlayer.createdAt,
          last_login_at: newPlayer.lastLoginAt
        }]);
      } catch (err) {
        console.warn('Supabase player insert error (using local):', err);
      }
    }

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

    // Try Supabase first
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('player_code', formattedCode)
          .single();

        if (data && !error) {
          const profile: PlayerProfile = {
            id: data.id,
            playerCode: data.player_code,
            name: data.name,
            displayName: data.display_name,
            age: data.age,
            className: data.class_name,
            team: data.team,
            avatar: data.avatar,
            createdAt: data.created_at,
            lastLoginAt: new Date().toISOString()
          };
          this.setStoredCurrentPlayer(profile);
          return profile;
        }
      } catch (err) {
        console.warn('Supabase login check error:', err);
      }
    }

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

    if (isSupabaseConfigured && supabase && !isGuestId(playerId)) {
      try {
        await supabase.from('quiz_results').upsert([{
          player_id: playerId,
          completed: result.completed,
          total_score: result.totalScore,
          correct_count: result.correctCount,
          stars: result.stars,
          started_at: result.startedAt,
          completed_at: result.completedAt,
          attempts: result.attempts
        }]);
      } catch (err) {
        console.warn('Supabase saveQuizResult error:', err);
      }
    }

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

    if (isSupabaseConfigured && supabase && !isGuestId(playerId)) {
      try {
        await supabase.from('flashcard_results').upsert([{
          player_id: playerId,
          completed: result.completed,
          total_score: result.totalScore,
          rounds_completed: result.roundsCompleted,
          stars: result.stars,
          started_at: result.startedAt,
          completed_at: result.completedAt,
          round_attempts: result.roundAttempts
        }]);
      } catch (err) {
        console.warn('Supabase saveFlashcardResult error:', err);
      }
    }

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

  public async getLeaderboard(): Promise<LeaderboardPlayerEntry[]> {
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
    const combined = [...registeredEntries];

    // Deterministic sorting: Total Score DESC -> Completed At ASC -> Name ASC
    combined.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.displayName.localeCompare(b.displayName);
    });

    // Assign rank numbers
    return combined.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }

  public async getClassRankings(): Promise<ClassRankingEntry[]> {
    const leaderboard = await this.getLeaderboard();
    const classMap: Record<string, { total: number; count: number }> = {
      '801': { total: 0, count: 0 },
      '802': { total: 0, count: 0 },
      '803': { total: 0, count: 0 },
      '804': { total: 0, count: 0 }
    };

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

    // Try Supabase update if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('players')
          .update({ name: cleanName, display_name: cleanName })
          .eq('id', playerId);
      } catch (err) {
        console.warn('Supabase name update error:', err);
      }
    }

    this.logAudit('RENAME_PLAYER', `Teacher renamed player ${playerId} to "${cleanName}"`);
    return true;
  }
}

export const storageService = new StorageService();
