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
  Crown
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

type TabMode = 'players' | 'classes' | 'teams';

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

  useEffect(() => {
    const loadData = async () => {
      const players = await storageService.getLeaderboard();
      const classes = await storageService.getClassRankings();
      const teams = await storageService.getTeamComparison();
      setPlayersList(players);
      setClassList(classes);
      setTeamComparison(teams);
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

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      <GameHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-5 md:py-6 flex flex-col">
        
        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-bold text-xs uppercase tracking-widest mb-2 shadow-sm">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Escola Municipal Nísia Vilela Fernandes</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-bungee tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
            LEADERBOARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-semibold">
            Official English Adventure Standings & Team Clash
          </p>
        </div>

        {/* 3 Main Tabs: Players, Classes, Teams */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 bg-slate-900 border-2 border-slate-700 rounded-2xl mb-6 shadow-xl">
          <button
            type="button"
            onClick={() => handleTabChange('players')}
            className={`py-3 px-2 sm:px-4 rounded-xl font-bungee text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'players'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase">
                <Filter className="w-4 h-4 text-amber-400" />
                <span>Filters:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Class Filter */}
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="all">All Classes</option>
                  <option value="804">Turma 804</option>
                  <option value="801">Turma 801</option>
                  <option value="802">Turma 802</option>
                  <option value="803">Turma 803</option>
                </select>

                {/* Team Filter */}
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="all">All Teams</option>
                  <option value="blue">Blue Team</option>
                  <option value="purple">Purple Team</option>
                </select>
              </div>
            </div>

            {/* Players Table / List */}
            <div className="bg-slate-900/90 border-2 border-slate-700 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-md overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] sm:text-xs font-extrabold uppercase text-slate-400">
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
                      <span className="font-bungee text-slate-400">#{p.rank}</span>
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
                            : 'hover:bg-slate-800/50'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-2 sm:px-3 text-center">
                          {rankBadge}
                        </td>

                        {/* Player info */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.avatar}
                              alt={p.displayName}
                              onError={(e) => { e.currentTarget.src = isBlue ? '/assets/avatar_mateus.jpg' : '/assets/avatar_juliana.jpg'; }}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-600 flex-shrink-0"
                            />
                            <div>
                              <div className="font-extrabold text-white flex items-center gap-1.5">
                                <span>{p.displayName}</span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 capitalize">
                                {p.medal} Star
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Class */}
                        <td className="py-3 px-2 text-center font-semibold text-slate-300">
                          {p.className}
                        </td>

                        {/* Team */}
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                            isBlue 
                              ? 'bg-blue-950/60 border-blue-500/60 text-blue-300' 
                              : 'bg-purple-950/60 border-purple-500/60 text-purple-300'
                          }`}>
                            <Shield className="w-3.5 h-3.5 fill-current" />
                            <span className="hidden sm:inline">{isBlue ? 'Blue' : 'Purple'}</span>
                          </span>
                        </td>

                        {/* Quiz */}
                        <td className="py-3 px-2 text-center text-slate-400 font-mono hidden md:table-cell">
                          {p.quizScore}
                        </td>

                        {/* Cards */}
                        <td className="py-3 px-2 text-center text-slate-400 font-mono hidden md:table-cell">
                          {p.flashcardScore}
                        </td>

                        {/* Total Score */}
                        <td className="py-3 px-3 text-right">
                          <span className="font-bungee text-base sm:text-lg text-amber-400">
                            {p.totalScore}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-semibold">pts</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredPlayers.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  No participants found matching the current filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: CLASS RANKING --- */}
        {activeTab === 'classes' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-300">
              💡 <strong>Fair Competition Note:</strong> Classes are ranked primarily by <strong>Average Score</strong> per student to ensure fair competition between classes of different sizes, alongside total accumulated points.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classList.map((c, idx) => (
                <div 
                  key={c.className}
                  className="p-5 rounded-3xl bg-slate-900/90 border-2 border-slate-700 shadow-xl flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center font-bungee text-lg">
                        #{idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bungee text-xl text-white">Turma {c.className}</h3>
                        <p className="text-xs text-slate-400">{c.studentsCount} participating students</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs uppercase font-extrabold text-slate-400 block">Class Average</span>
                      <span className="text-2xl font-bungee text-amber-400">{c.averageScore} pts</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Total Points: <strong className="text-white font-mono">{c.totalPoints.toLocaleString()}</strong></span>
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
            <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-purple-950 border-2 border-slate-700 text-center shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase mb-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>FACTION CLASH STANDINGS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bungee text-white">
                {teamComparison.leadingTeam === 'blue' && 'BLUE TEAM IS CURRENTLY LEADING! 🔵'}
                {teamComparison.leadingTeam === 'purple' && 'PURPLE TEAM IS CURRENTLY LEADING! 🟣'}
                {teamComparison.leadingTeam === 'tie' && 'IT IS CURRENTLY A TIE! ⚔️'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Classified by Average Score per player for equal opportunity between teams.
              </p>
            </div>

            {/* Duel Cards: Blue Team vs Purple Team */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              
              {/* BLUE TEAM CARD */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-blue-950/70 to-slate-900 border-3 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.25)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                        <Shield className="w-7 h-7 fill-white" />
                      </div>
                      <div>
                        <h3 className="font-bungee text-2xl text-blue-300">BLUE TEAM</h3>
                        <p className="text-xs font-semibold text-blue-400">Smart & United</p>
                      </div>
                    </div>
                    {teamComparison.leadingTeam === 'blue' && (
                      <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase shadow">
                        AHEAD!
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 my-6">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-900/30 border border-blue-800">
                      <span className="text-xs font-bold text-slate-300 uppercase">Team Average (Primary)</span>
                      <span className="text-2xl font-bungee text-blue-300">{teamComparison.blueTeam.averageScore} pts</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-900/20 border border-blue-800/60">
                      <span className="text-xs font-bold text-slate-300 uppercase">Total Points</span>
                      <span className="text-xl font-bungee text-white">{teamComparison.blueTeam.totalPoints.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-900/20 border border-blue-800/60">
                      <span className="text-xs font-bold text-slate-300 uppercase">Active Players</span>
                      <span className="text-lg font-bold text-blue-300">{teamComparison.blueTeam.playersCount} students</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-blue-400 font-semibold text-center">
                  Contributes to school pride!
                </div>
              </div>

              {/* PURPLE TEAM CARD */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-950/70 to-slate-900 border-3 border-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.25)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                        <Shield className="w-7 h-7 fill-white" />
                      </div>
                      <div>
                        <h3 className="font-bungee text-2xl text-purple-300">PURPLE TEAM</h3>
                        <p className="text-xs font-semibold text-purple-400">Brave & Bright</p>
                      </div>
                    </div>
                    {teamComparison.leadingTeam === 'purple' && (
                      <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase shadow">
                        AHEAD!
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 my-6">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-purple-900/30 border border-purple-800">
                      <span className="text-xs font-bold text-slate-300 uppercase">Team Average (Primary)</span>
                      <span className="text-2xl font-bungee text-purple-300">{teamComparison.purpleTeam.averageScore} pts</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-purple-900/20 border border-purple-800/60">
                      <span className="text-xs font-bold text-slate-300 uppercase">Total Points</span>
                      <span className="text-xl font-bungee text-white">{teamComparison.purpleTeam.totalPoints.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-purple-900/20 border border-purple-800/60">
                      <span className="text-xs font-bold text-slate-300 uppercase">Active Players</span>
                      <span className="text-lg font-bold text-purple-300">{teamComparison.purpleTeam.playersCount} students</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-purple-400 font-semibold text-center">
                  Contributes to school pride!
                </div>
              </div>

            </div>

            {/* Visual Balance Bar */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-700">
              <div className="flex items-center justify-between text-xs font-bungee mb-2">
                <span className="text-blue-400">BLUE TEAM ({teamComparison.blueTeam.averageScore} AVG)</span>
                <span className="text-purple-400">PURPLE TEAM ({teamComparison.purpleTeam.averageScore} AVG)</span>
              </div>

              {/* Progress gauge */}
              <div className="w-full h-5 bg-slate-950 rounded-full overflow-hidden flex border-2 border-slate-700">
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
            className="px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bungee text-sm border-2 border-slate-600 hover:border-slate-400 inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO MISSIONS</span>
          </button>
        </div>

      </main>
    </div>
  );
};
