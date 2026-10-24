import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Shield, 
  Medal, 
  Star, 
  Filter, 
  ArrowLeft, 
  Sparkles, 
  Flame, 
  Award, 
  Crown,
  Flag,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { storageService } from '../../services/storage';
import { 
  LeaderboardPlayerEntry, 
  ClassRankingEntry, 
  TeamRankingComparison, 
  TeamId 
} from '../../types';
import { audioService } from '../../services/audio';
import { GameHeader } from '../../components/layout/GameHeader';
import { PlayerAvatar } from '../../components/ui/PlayerAvatar';
import { nameModerationService } from '../../services/nameModeration';

type TabMode = 'players' | 'classes' | 'teams';

const EMPTY_RANKING_MESSAGE = 'Ainda não há resultados. Jogue o Nível 0 para aparecer aqui!';

// Ranking vazio: aparece enquanto nenhum aluno cadastrado tem resultado salvo.
const EmptyRanking: React.FC<{ onPlay: () => void }> = ({ onPlay }) => (
  <div className="py-10 px-4 flex flex-col items-center text-center gap-3" data-testid="empty-ranking">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-white shadow-[0_0_18px_rgba(234,179,8,0.45)] flex items-center justify-center">
      <Trophy className="w-8 h-8 text-slate-950" />
    </div>
    <p className="font-heading font-black text-base sm:text-lg text-slate-800 max-w-sm">
      {EMPTY_RANKING_MESSAGE}
    </p>
    <button
      type="button"
      onClick={onPlay}
      className="mt-1 px-5 py-2.5 rounded-xl bg-gradient-to-b from-green-400 via-emerald-500 to-green-600 text-white font-bungee text-sm tracking-wider shadow-[0_4px_0_#065f46] active:translate-y-1 active:shadow-[0_1px_0_#065f46] border-2 border-emerald-300 transition-all"
    >
      JOGAR O NÍVEL 0 ▶
    </button>
  </div>
);

export const LeaderboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer } = useGame();

  const [activeTab, setActiveTab] = useState<TabMode>('players');
  const [playersList, setPlayersList] = useState<LeaderboardPlayerEntry[]>([]);
  const [classList, setClassList] = useState<ClassRankingEntry[]>([]);
  const [teamComparison, setTeamComparison] = useState<TeamRankingComparison | null>(null);
  
  // Filters for player ranking
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  // Name reporting modal state
  const [reportingPlayer, setReportingPlayer] = useState<{ id: string; name: string } | null>(null);
  const [reportReason, setReportReason] = useState<string>('Nome inadequado para ambiente escolar');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);
  const [rankingLocal, setRankingLocal] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      const players = await storageService.getLeaderboard();
      const classes = await storageService.getClassRankings();
      const teams = await storageService.getTeamComparison();
      setPlayersList(players);
      setClassList(classes);
      setTeamComparison(teams);
      setRankingLocal(storageService.rankingSource === 'local');
    };
    loadData();
  }, []);

  const handleTabChange = (tab: TabMode) => {
    audioService.playClick();
    setActiveTab(tab);
  };

  // Filtered players
  const filteredPlayers = playersList.filter((p) => {
    if (selectedClass !== 'all' && p.className !== selectedClass) return false;
    if (selectedTeam !== 'all' && p.team !== selectedTeam) return false;
    return true;
  });

  // Só as turmas que têm jogadores no ranking.
  const classOptions = [...new Set(playersList.map(p => p.className))].sort();

  return (
    <div className="min-h-screen game-sky text-slate-900 flex flex-col justify-between">
      <GameHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-5 md:py-6 flex flex-col">
        
        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-700 font-bold text-xs uppercase tracking-widest mb-2 shadow-sm">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Escola Municipal Nísia Vilela Fernandes</span>
          </div>

          <h1 className="text-3xl md:text-5xl game-title">
            LEADERBOARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-semibold">
            Official English Adventure Standings & Team Clash
          </p>
          {rankingLocal && (
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">
              Sem conexão: mostrando só os pontos salvos neste computador.
            </p>
          )}
        </div>

        {/* 3 Main Tabs: Players, Classes, Teams */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 game-panel !rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => handleTabChange('players')}
            className={`py-3 px-2 sm:px-4 rounded-xl font-bungee text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'players'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-sky-50'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>PLAYERS</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('classes')}
            className={`py-3 px-2 sm:px-4 rounded-xl font-bungee text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'classes'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-sky-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>CLASSES</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('teams')}
            className={`py-3 px-2 sm:px-4 rounded-xl font-bungee text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'teams'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-sky-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>BLUE × PURPLE</span>
          </button>
        </div>

        {/* --- TAB 1: PLAYER RANKING --- */}
        {activeTab === 'players' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-sky-50 border-2 border-sky-200 shadow-[0_3px_0_0_#bae6fd] rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 uppercase">
                <Filter className="w-4 h-4 text-amber-600" />
                <span>Filters:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Class Filter */}
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-white/95 border border-sky-200 text-slate-900 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="all">All Classes</option>
                  {classOptions.map(cls => (
                    <option key={cls} value={cls}>Turma {cls}</option>
                  ))}
                </select>

                {/* Team Filter */}
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="bg-white/95 border border-sky-200 text-slate-900 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="all">All Teams</option>
                  <option value="blue">Blue Team</option>
                  <option value="purple">Purple Team</option>
                </select>
              </div>
            </div>

            {/* Players Table / List */}
            <div className="game-panel p-3 sm:p-5 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-sky-200 text-[11px] sm:text-xs font-extrabold uppercase text-slate-500">
                    <th className="py-3 px-2 sm:px-3 text-center w-12">#</th>
                    <th className="py-3 px-3">Player</th>
                    <th className="py-3 px-2 text-center">Class</th>
                    <th className="py-3 px-2 text-center">Team</th>
                    <th className="py-3 px-2 text-center hidden md:table-cell">Quiz</th>
                    <th className="py-3 px-2 text-center hidden md:table-cell">Cards</th>
                    <th className="py-3 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                  {filteredPlayers.map((p) => {
                    const isCurrent = currentPlayer?.id === p.playerId;
                    const isBlue = p.team === 'blue';

                    let rankBadge = (
                      <span className="font-bungee text-slate-500">#{p.rank}</span>
                    );
                    if (p.rank === 1) {
                      rankBadge = (
                        <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-slate-950 flex items-center justify-center font-bungee text-sm font-black shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                          1
                        </div>
                      );
                    } else if (p.rank === 2) {
                      rankBadge = (
                        <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 flex items-center justify-center font-bungee text-sm font-black shadow">
                          2
                        </div>
                      );
                    } else if (p.rank === 3) {
                      rankBadge = (
                        <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-bungee text-sm font-black shadow">
                          3
                        </div>
                      );
                    }

                    return (
                      <tr 
                        key={p.playerId}
                        className={`transition-colors ${
                          isCurrent 
                            ? 'bg-amber-500/10 font-bold border-l-4 border-amber-400' 
                            : 'hover:bg-sky-50/50'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-2 sm:px-3 text-center">
                          {rankBadge}
                        </td>

                        {/* Player info */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <PlayerAvatar
                              avatarId={p.avatar}
                              size="sm"
                              className="border border-sky-300 flex-shrink-0"
                            />
                            <div>
                              <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                <span>{p.displayName}</span>
                                {isCurrent ? (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                                    YOU
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setReportingPlayer({ id: p.playerId, name: p.displayName });
                                      setReportSuccess(false);
                                    }}
                                    className="text-slate-600 hover:text-red-600 p-1 rounded transition-colors"
                                    title="Denunciar nome inadequado"
                                    aria-label="Denunciar nome"
                                  >
                                    <Flag className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 capitalize">
                                {p.medal} Star
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Class */}
                        <td className="py-3 px-2 text-center font-semibold text-slate-600">
                          {p.className}
                        </td>

                        {/* Team */}
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                            isBlue 
                              ? 'bg-blue-100/80 border-blue-500/60 text-blue-700' 
                              : 'bg-purple-100/80 border-purple-500/60 text-purple-700'
                          }`}>
                            <Shield className="w-3.5 h-3.5 fill-current" />
                            <span className="hidden sm:inline">{isBlue ? 'Blue' : 'Purple'}</span>
                          </span>
                        </td>

                        {/* Quiz */}
                        <td className="py-3 px-2 text-center text-slate-500 font-mono hidden md:table-cell">
                          {p.quizScore}
                        </td>

                        {/* Cards */}
                        <td className="py-3 px-2 text-center text-slate-500 font-mono hidden md:table-cell">
                          {p.flashcardScore}
                        </td>

                        {/* Total Score */}
                        <td className="py-3 px-3 text-right">
                          <span className="font-bungee text-base sm:text-lg text-amber-600">
                            {p.totalScore}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-semibold">pts</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {playersList.length === 0 ? (
                <EmptyRanking onPlay={() => { audioService.playClick(); navigate('/missions'); }} />
              ) : filteredPlayers.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  No participants found matching the current filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: CLASS RANKING --- */}
        {activeTab === 'classes' && (
          <div className="space-y-4">
            <div className="p-4 bg-white/80 border border-sky-200 rounded-2xl text-xs sm:text-sm text-slate-600">
              💡 <strong>Fair Competition Note:</strong> Classes are ranked primarily by <strong>Average Score</strong> per student to ensure fair competition between classes of different sizes, alongside total accumulated points.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classList.map((c, idx) => (
                <div 
                  key={c.className}
                  className="p-5 game-panel flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-700 flex items-center justify-center font-bungee text-lg">
                        #{idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bungee text-xl text-slate-900">Turma {c.className}</h3>
                        <p className="text-xs text-slate-500">{c.studentsCount} participating students</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs uppercase font-extrabold text-slate-500 block">Class Average</span>
                      <span className="text-2xl font-bungee text-amber-600">{c.averageScore} pts</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sky-200 flex items-center justify-between text-xs text-slate-500">
                    <span>Total Points: <strong className="text-slate-900 font-mono">{c.totalPoints.toLocaleString()}</strong></span>
                    <span>Nísia Vilela Fernandes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: TEAM CLASH (BLUE TEAM VS PURPLE TEAM) --- */}
        {activeTab === 'teams' && teamComparison && (
          <div className="space-y-6">
            
            {/* Winner Announcement Banner */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-100 via-white to-purple-100 border-[3px] border-sky-200 text-center shadow-[0_6px_0_0_#7dd3fc]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 font-bold text-xs uppercase mb-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>FACTION CLASH STANDINGS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bungee text-slate-900">
                {teamComparison.leadingTeam === 'blue' && 'BLUE TEAM IS CURRENTLY LEADING! 🔵'}
                {teamComparison.leadingTeam === 'purple' && 'PURPLE TEAM IS CURRENTLY LEADING! 🟣'}
                {teamComparison.leadingTeam === 'tie' && 'IT IS CURRENTLY A TIE! ⚔️'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Classified by Average Score per player for equal opportunity between teams.
              </p>
            </div>

            {/* Duel Cards: Blue Team vs Purple Team */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              
              {/* BLUE TEAM CARD */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-blue-100 to-sky-50 border-[3px] border-blue-500 shadow-[0_6px_0_0_#1d4ed8] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                        <Shield className="w-7 h-7 fill-white" />
                      </div>
                      <div>
                        <h3 className="font-bungee text-2xl text-blue-700">BLUE TEAM</h3>
                        <p className="text-xs font-semibold text-blue-600">Smart & United</p>
                      </div>
                    </div>
                    {teamComparison.leadingTeam === 'blue' && (
                      <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase shadow">
                        AHEAD!
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 my-6">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-100/80 border border-blue-300">
                      <span className="text-xs font-bold text-slate-600 uppercase">Team Average (Primary)</span>
                      <span className="text-2xl font-bungee text-blue-700">{teamComparison.blueTeam.averageScore} pts</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-100/80 border border-blue-300">
                      <span className="text-xs font-bold text-slate-600 uppercase">Total Points</span>
                      <span className="text-xl font-bungee text-slate-900">{teamComparison.blueTeam.totalPoints.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-100/80 border border-blue-300">
                      <span className="text-xs font-bold text-slate-600 uppercase">Active Players</span>
                      <span className="text-lg font-bold text-blue-700">{teamComparison.blueTeam.playersCount} students</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-blue-600 font-semibold text-center">
                  Contributes to school pride!
                </div>
              </div>

              {/* PURPLE TEAM CARD */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-100 to-sky-50 border-[3px] border-purple-500 shadow-[0_6px_0_0_#7e22ce] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                        <Shield className="w-7 h-7 fill-white" />
                      </div>
                      <div>
                        <h3 className="font-bungee text-2xl text-purple-700">PURPLE TEAM</h3>
                        <p className="text-xs font-semibold text-purple-600">Brave & Bright</p>
                      </div>
                    </div>
                    {teamComparison.leadingTeam === 'purple' && (
                      <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase shadow">
                        AHEAD!
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 my-6">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-purple-100/80 border border-purple-300">
                      <span className="text-xs font-bold text-slate-600 uppercase">Team Average (Primary)</span>
                      <span className="text-2xl font-bungee text-purple-700">{teamComparison.purpleTeam.averageScore} pts</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-purple-100/80 border border-purple-300">
                      <span className="text-xs font-bold text-slate-600 uppercase">Total Points</span>
                      <span className="text-xl font-bungee text-slate-900">{teamComparison.purpleTeam.totalPoints.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-purple-100/80 border border-purple-300">
                      <span className="text-xs font-bold text-slate-600 uppercase">Active Players</span>
                      <span className="text-lg font-bold text-purple-700">{teamComparison.purpleTeam.playersCount} students</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-purple-600 font-semibold text-center">
                  Contributes to school pride!
                </div>
              </div>

            </div>

            {/* Visual Balance Bar */}
            <div className="p-5 game-panel">
              <div className="flex items-center justify-between text-xs font-bungee mb-2">
                <span className="text-blue-600">BLUE TEAM ({teamComparison.blueTeam.averageScore} AVG)</span>
                <span className="text-purple-600">PURPLE TEAM ({teamComparison.purpleTeam.averageScore} AVG)</span>
              </div>

              {/* Progress gauge */}
              <div className="w-full h-5 bg-white/95 rounded-full overflow-hidden flex border-2 border-sky-200">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                  style={{
                    width: `${
                      teamComparison.blueTeam.averageScore + teamComparison.purpleTeam.averageScore > 0
                        ? (teamComparison.blueTeam.averageScore / (teamComparison.blueTeam.averageScore + teamComparison.purpleTeam.averageScore)) * 100
                        : 50
                    }%`
                  }}
                />
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
                  style={{
                    width: `${
                      teamComparison.blueTeam.averageScore + teamComparison.purpleTeam.averageScore > 0
                        ? (teamComparison.purpleTeam.averageScore / (teamComparison.blueTeam.averageScore + teamComparison.purpleTeam.averageScore)) * 100
                        : 50
                    }%`
                  }}
                />
              </div>
            </div>

          </div>
        )}

        {/* Back / Action Button */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              navigate('/missions');
            }}
            className="px-8 py-3.5 rounded-2xl bg-white hover:bg-sky-50 text-blue-800 border-2 border-sky-300 shadow-[0_4px_0_0_#7dd3fc] active:translate-y-1 active:shadow-[0_1px_0_0_#7dd3fc] font-bungee text-sm inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO MISSIONS</span>
          </button>
        </div>

        {/* REPORT NAME MODAL */}
        {reportingPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-md animate-fadeIn">
            <div className="game-panel-gold max-w-md w-full p-6 text-slate-900 max-h-[90dvh] overflow-y-auto">
              {!reportSuccess ? (
                <div>
                  <div className="flex items-center gap-3 pb-3 border-b border-sky-200 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-600 border border-red-500/40 flex items-center justify-center">
                      <Flag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-base text-slate-900">
                        Denunciar Nome de Jogador
                      </h3>
                      <p className="text-xs text-slate-500">
                        Ajude a manter o Nisialand seguro e respeitoso
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-4">
                    Você deseja reportar o nome <strong className="text-amber-700">"{reportingPlayer.name}"</strong> para moderação da equipe pedagógica?
                  </p>

                  <div className="mb-5">
                    <label className="block text-[11px] font-heading font-bold text-slate-500 uppercase mb-1.5">
                      Motivo:
                    </label>
                    <select
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                      className="w-full bg-white/95 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-amber-400"
                    >
                      <option value="Nome ofensivo ou desrespeitoso">Nome ofensivo ou desrespeitoso</option>
                      <option value="Palavrão ou termo impróprio">Palavrão ou termo impróprio</option>
                      <option value="Trocadilho malicioso">Trocadilho malicioso</option>
                      <option value="Outro motivo">Outro motivo</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setReportingPlayer(null)}
                      className="flex-1 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-600 text-xs font-heading font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        nameModerationService.reportName(reportingPlayer.id, reportingPlayer.name, reportReason);
                        setReportSuccess(true);
                        setTimeout(() => {
                          setReportingPlayer(null);
                          setReportSuccess(false);
                        }, 2000);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-heading font-black uppercase shadow"
                    >
                      Enviar Denúncia
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/40 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-black text-base text-emerald-700 mb-1">
                    Denúncia Enviada!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Obrigado por colaborar com um ambiente escolar seguro e positivo!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
