import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  ShieldCheck, 
  Users, 
  Download, 
  RotateCcw, 
  BarChart3, 
  CheckCircle2, 
  FileText, 
  ArrowLeft,
  Search,
  KeyRound,
  Shield,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { 
  PlayerProfile, 
  LeaderboardPlayerEntry, 
  TeacherAuditLog, 
  ClassRankingEntry, 
  TeamRankingComparison 
} from '../../types';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { audioService } from '../../services/audio';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data State
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayerEntry[]>([]);
  const [auditLogs, setAuditLogs] = useState<TeacherAuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'roster' | 'analytics' | 'audit'>('roster');

  // Load Data
  const refreshData = async () => {
    const allPlayers = storageService.getAllPlayers();
    const board = await storageService.getLeaderboard();
    const logs = storageService.getAuditLogs();
    setPlayers(allPlayers);
    setLeaderboard(board);
    setAuditLogs(logs);
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  // Handle Passcode Submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default teacher passcode: prof804
    if (passcode.trim().toLowerCase() === 'prof804') {
      setIsAuthenticated(true);
      setLoginError(null);
      audioService.playChime();
    } else {
      setLoginError('Senha incorreta. (Dica de desenvolvimento: prof804)');
      audioService.playWrong();
    }
  };

  // Reset Student Progress
  const handleResetPlayer = async (playerId: string, playerName: string) => {
    const confirmReset = window.confirm(
      `Tem certeza que deseja redefinir o progresso e as tentativas de ${playerName}? Esta ação permitirá que o estudante refaça as missões.`
    );
    if (!confirmReset) return;

    audioService.playClick();
    await storageService.resetPlayerProgress(playerId);
    await refreshData();
    alert(`Progresso de ${playerName} redefinido com sucesso!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    audioService.playClick();
    if (leaderboard.length === 0) {
      alert('Nenhum dado disponível para exportar.');
      return;
    }

    const headers = ['Posicao', 'Codigo_Aluno', 'Nome', 'Turma', 'Equipe', 'Quiz_Pontos', 'Flashcards_Pontos', 'Total_Pontos', 'Medalha', 'Data_Conclusao'];
    const rows = leaderboard.map(p => {
      const playerProfile = players.find(x => x.id === p.playerId);
      const code = playerProfile ? playerProfile.playerCode : 'N/A';
      return [
        p.rank,
        `"${code}"`,
        `"${p.displayName}"`,
        `"${p.className}"`,
        `"${p.team.toUpperCase()} TEAM"`,
        p.quizScore,
        p.flashcardScore,
        p.totalScore,
        `"${p.medal.toUpperCase()}"`,
        `"${p.completedAt}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NIZIALAND_Resultados_Escola_Nisia_Vilela_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Roster
  const filteredLeaderboard = leaderboard.filter(p => {
    const matchesSearch = p.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || p.className === filterClass;
    return matchesSearch && matchesClass;
  });

  // Calculate Question Error Analytics
  const allQuizResults = storageService.getAllQuizResults();
  const questionStats = QUIZ_QUESTIONS.map(q => {
    let answered = 0;
    let errors = 0;
    Object.values(allQuizResults).forEach(res => {
      const att = res.attempts?.[q.id];
      if (att) {
        answered++;
        if (!att.isCorrect || att.attemptsCount > 1) {
          errors++;
        }
      }
    });
    const errorRate = answered > 0 ? Math.round((errors / answered) * 100) : 0;
    return {
      ...q,
      answered,
      errors,
      errorRate
    };
  });

  // --- VIEW 1: AUTHENTICATION LOCK SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/20 border-2 border-blue-400 text-blue-400 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bungee text-center text-white">
            PAINEL DO PROFESSOR
          </h1>
          <p className="text-xs text-center text-slate-400 mt-1 mb-6">
            Escola Municipal Nísia Vilela Fernandes • Gestão Pedagógica
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-950/60 border border-red-500 rounded-xl text-xs text-red-200">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-blue-400" />
                Senha de Acesso Docente
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Digite a senha..."
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none text-white font-mono font-bold"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Padrão institucional: <code className="text-blue-400 font-bold">prof804</code>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bungee text-sm shadow-lg border border-blue-400 cursor-pointer transition-all"
            >
              ACESSAR PAINEL
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Jogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: AUTHENTICATED TEACHER DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      
      {/* Top Admin Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              NV
            </div>
            <div>
              <h2 className="font-bungee text-sm sm:text-base text-white">
                PAINEL PEDAGÓGICO • NIZIALAND
              </h2>
              <p className="text-[11px] text-slate-400">
                Prof. Neimar Oliveira • E. M. Nísia Vilela Fernandes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sair / Jogo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Metric Cards Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400">Total de Alunos</span>
            <div className="text-2xl font-bungee text-white mt-1">{leaderboard.length}</div>
            <span className="text-[10px] text-slate-500">Turmas 801 - 804</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400">Blue Team</span>
            <div className="text-2xl font-bungee text-blue-400 mt-1">
              {leaderboard.filter(p => p.team === 'blue').length}
            </div>
            <span className="text-[10px] text-slate-500">participantes</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400">Purple Team</span>
            <div className="text-2xl font-bungee text-purple-400 mt-1">
              {leaderboard.filter(p => p.team === 'purple').length}
            </div>
            <span className="text-[10px] text-slate-500">participantes</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400">Média Geral</span>
            <div className="text-2xl font-bungee text-amber-400 mt-1">
              {leaderboard.length > 0 
                ? Math.round(leaderboard.reduce((acc, curr) => acc + curr.totalScore, 0) / leaderboard.length)
                : 0}
            </div>
            <span className="text-[10px] text-slate-500">pontos por estudante</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'roster'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lista de Alunos & Códigos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Diagnóstico por Questão</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Auditoria & Logs</span>
          </button>
        </div>

        {/* --- TAB 1: STUDENT ROSTER --- */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar aluno..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="all">Todas as Turmas</option>
                  <option value="804">Turma 804</option>
                  <option value="801">Turma 801</option>
                  <option value="802">Turma 802</option>
                  <option value="803">Turma 803</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase text-[11px]">
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3 px-3">Estudante</th>
                    <th className="py-3 px-2">Turma</th>
                    <th className="py-3 px-2">Equipe</th>
                    <th className="py-3 px-2 text-center">Quiz</th>
                    <th className="py-3 px-2 text-center">Flashcards</th>
                    <th className="py-3 px-2 text-right">Total</th>
                    <th className="py-3 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLeaderboard.map((p) => {
                    const profile = players.find(x => x.id === p.playerId);
                    const code = profile?.playerCode || 'NZL-804-...';

                    return (
                      <tr key={p.playerId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-amber-300">
                          {code}
                        </td>
                        <td className="py-3 px-3 font-bold text-white">
                          {p.displayName}
                        </td>
                        <td className="py-3 px-2 text-slate-300 font-medium">
                          {p.className}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.team === 'blue' ? 'bg-blue-900/60 text-blue-300' : 'bg-purple-900/60 text-purple-300'
                          }`}>
                            {p.team}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-slate-300">
                          {p.quizScore}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-slate-300">
                          {p.flashcardScore}
                        </td>
                        <td className="py-3 px-2 text-right font-bungee text-amber-400">
                          {p.totalScore}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleResetPlayer(p.playerId, p.displayName)}
                            title="Redefinir tentativas deste aluno para nova chance pedagógica"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600/30 text-amber-400 border border-slate-700 hover:border-amber-500 transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredLeaderboard.length === 0 && (
                <div className="py-10 text-center text-slate-500 text-xs">
                  Nenhum estudante encontrado com os filtros selecionados.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: QUESTION ERROR DIAGNOSTICS --- */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              📊 <strong>Diagnóstico de Aprendizagem de Inglês:</strong> Identifique em quais tópicos gramaticais (adjetivos de igualdade <em>as...as</em> ou superioridade <em>-er than</em>) a turma apresentou maior índice de erro na primeira tentativa.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questionStats.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-blue-400 uppercase">
                      Questão {q.id} • {q.activityTitle}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      q.errorRate > 40 ? 'bg-red-900/60 text-red-300' : 'bg-emerald-900/60 text-emerald-300'
                    }`}>
                      {q.errorRate}% Erro / 2ª Tentativa
                    </span>
                  </div>

                  <p className="font-bungee text-sm text-white mb-2">
                    "{q.sentence}"
                  </p>

                  <div className="text-xs text-slate-400 mb-2">
                    <strong>Tópico:</strong> {q.contextHint}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-slate-300 border border-slate-800">
                    <strong className="text-amber-400">Explicação:</strong> {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: AUDIT LOGS --- */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4">
              <h3 className="font-bungee text-sm text-white mb-3">Trilha de Auditoria Institucional</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="pt-2 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">
                        {log.action}
                      </span>
                      <p className="text-slate-300 mt-0.5">{log.details}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
