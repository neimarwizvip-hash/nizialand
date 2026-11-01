import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { storageService } from '../../services/storage';
import { LeaderboardPlayerEntry, ClassRankingEntry, TeamRankingComparison } from '../../types';
import { audioService } from '../../services/audio';
import { PlayerAvatar } from '../../components/ui/PlayerAvatar';
import { nameModerationService } from '../../services/nameModeration';
import { Anfitriao, BotaoJogo, Cenario, Ficha, Hud, Icone, Medalha, Painel, Titulo } from '../../components/kit';
import { falaDaTela } from '../../data/falasAnfitrioes';

// Quadro de honra da escola: jogadores, turmas e a disputa Equipe Azul × Equipe Roxa.
// O Diretor Márcio apresenta o quadro. Dados e regras iguais aos anteriores (média por jogador como critério).

type TabMode = 'players' | 'classes' | 'teams';

const EMPTY_RANKING_MESSAGE = 'Ainda não há resultados. Jogue o Nível 0 para aparecer aqui!';

// Ranking vazio: aparece enquanto nenhum aluno cadastrado tem resultado salvo.
const EmptyRanking: React.FC<{ onPlay: () => void }> = ({ onPlay }) => (
  <div className="py-8 short:py-3 px-4 flex flex-col items-center text-center gap-3 short:gap-1.5" data-testid="empty-ranking">
    <Icone nome="trofeu" className="w-14 h-14 short:w-9 short:h-9 text-nisia-tinta" />
    <p className="font-display text-lg short:text-sm text-nisia-tinta max-w-sm">{EMPTY_RANKING_MESSAGE}</p>
    <BotaoJogo cor="verde" onClick={onPlay} className="short:min-h-[36px] short:text-sm">
      Jogar o Nível 0 <Icone nome="jogar" className="w-5 h-5" cor="#DDF5D9" />
    </BotaoJogo>
  </div>
);

const MEDALHA_POR_POSICAO = { 1: 'ouro', 2: 'prata', 3: 'bronze' } as const;
const MEDALHA_DO_JOGADOR = { gold: 'ouro', silver: 'prata', bronze: 'bronze' } as const;

export const LeaderboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer } = useGame();

  const [activeTab, setActiveTab] = useState<TabMode>('players');
  const [playersList, setPlayersList] = useState<LeaderboardPlayerEntry[]>([]);
  const [classList, setClassList] = useState<ClassRankingEntry[]>([]);
  const [teamComparison, setTeamComparison] = useState<TeamRankingComparison | null>(null);
  const [carregado, setCarregado] = useState(false);

  // Filtros do ranking de jogadores
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  // Denúncia de nome
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
      setCarregado(true);
    };
    loadData();
  }, []);

  const handleTabChange = (tab: TabMode) => {
    audioService.playClick();
    setActiveTab(tab);
  };

  const filteredPlayers = playersList.filter((p) => {
    if (selectedClass !== 'all' && p.className !== selectedClass) return false;
    if (selectedTeam !== 'all' && p.team !== selectedTeam) return false;
    return true;
  });

  // Só as turmas que têm jogadores no ranking.
  const classOptions = [...new Set(playersList.map(p => p.className))].sort();

  const vazio = carregado && playersList.length === 0;
  const fala = useMemo(() => falaDaTela(vazio ? 'rankingVazio' : 'ranking'), [vazio]);

  const ABAS: { id: TabMode; rotulo: string; icone: 'coroa' | 'pessoas' | 'escudo' }[] = [
    { id: 'players', rotulo: 'Jogadores', icone: 'coroa' },
    { id: 'classes', rotulo: 'Turmas', icone: 'pessoas' },
    { id: 'teams', rotulo: 'Azul × Roxa', icone: 'escudo' },
  ];

  const seletor = 'rounded-xl border-2 border-nisia-papel-linha bg-white px-2.5 py-1.5 short:py-1 text-xs font-semibold text-nisia-tinta outline-none focus:border-nisia-azul-500 cursor-pointer';

  const CartaoEquipe: React.FC<{ equipe: 'blue' | 'purple' }> = ({ equipe }) => {
    if (!teamComparison) return null;
    const azul = equipe === 'blue';
    const dados = azul ? teamComparison.blueTeam : teamComparison.purpleTeam;
    const lidera = teamComparison.leadingTeam === equipe;
    return (
      <Painel tipo="placa" as="article" className={`p-4 short:p-2.5 flex flex-col gap-3 short:gap-1.5 ${azul ? '!bg-nisia-azul-700 !border-nisia-azul-900' : '!bg-nisia-roxo-700 !border-nisia-roxo-500'} text-white`} aria-label={azul ? 'Equipe Azul' : 'Equipe Roxa'}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icone nome="escudo" className="w-9 h-9 short:w-7 short:h-7" cor={azul ? '#A9CDFF' : '#EDE3FF'} />
            <div className="leading-tight">
              <h3 className="font-display text-2xl short:text-lg">{azul ? 'Equipe Azul' : 'Equipe Roxa'}</h3>
              <p className="text-xs font-semibold opacity-80 short:hidden">{azul ? 'Blue Team · Smart & United' : 'Purple Team · Brave & Bright'}</p>
            </div>
          </div>
          {lidera && <Ficha cor="sol"><Icone nome="coroa" className="w-4 h-4" cor="#FFD23F" /> Na frente</Ficha>}
        </div>
        <dl className="grid grid-cols-3 gap-2 short:gap-1 text-center">
          <div className="rounded-xl bg-white/15 border border-white/30 px-2 py-2 short:py-1">
            <dt className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Média</dt>
            <dd className="font-display text-2xl short:text-lg tabular-nums">{dados.averageScore.toLocaleString('pt-BR')}</dd>
          </div>
          <div className="rounded-xl bg-white/15 border border-white/30 px-2 py-2 short:py-1">
            <dt className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Total</dt>
            <dd className="font-display text-xl short:text-base tabular-nums">{dados.totalPoints.toLocaleString('pt-BR')}</dd>
          </div>
          <div className="rounded-xl bg-white/15 border border-white/30 px-2 py-2 short:py-1">
            <dt className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Jogadores</dt>
            <dd className="font-display text-xl short:text-base tabular-nums">{dados.playersCount}</dd>
          </div>
        </dl>
      </Painel>
    );
  };

  const somaMedias = teamComparison ? teamComparison.blueTeam.averageScore + teamComparison.purpleTeam.averageScore : 0;
  const fracAzul = teamComparison && somaMedias > 0 ? teamComparison.blueTeam.averageScore / somaMedias : 0.5;

  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col overflow-x-hidden">
      <Cenario nome="escola" escurecer={0.35} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud mostrarPlacar={false} />

        <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-5 py-3 md:py-5 short:py-1 grid grid-cols-1 lg:grid-cols-[14rem_1fr] gap-3 short:gap-2 items-start">
          {/* Diretor Márcio apresenta o quadro */}
          <aside className="hidden lg:flex short:hidden flex-col items-start self-end">
            <Anfitriao nome="marcio" fala={fala.pt} traducao={fala.en} altura="h-72" />
          </aside>

          <section aria-label="Ranking" className="flex flex-col gap-2 short:gap-1 min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-2 px-1 short:hidden">
              <Titulo nivel={1} className="text-4xl sm:text-5xl leading-none">Quadro de honra</Titulo>
              <div className="flex items-center gap-2">
                {rankingLocal && <Ficha cor="erro" className="short:hidden">Sem conexão: só os pontos deste computador</Ficha>}
                <Ficha cor="papel" className="short:hidden">Escola Municipal Nísia Vilela Fernandes</Ficha>
              </div>
            </div>

            <Painel tipo="mural" className="p-3 sm:p-4 short:p-2 flex flex-col gap-3 short:gap-1.5">
              {/* Abas */}
              <div role="tablist" aria-label="Tipo de ranking" className="flex flex-wrap gap-1.5 short:gap-1">
                {ABAS.map(a => {
                  const ativa = activeTab === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      role="tab"
                      aria-selected={ativa}
                      onClick={() => handleTabChange(a.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 short:px-2 short:py-1 rounded-full border-2 font-display text-sm short:text-xs uppercase tracking-wide transition-all ${
                        ativa ? 'bg-nisia-sol-400 border-nisia-sol-700 text-nisia-tinta shadow-[0_3px_0_0_#B36E00]' : 'bg-nisia-papel border-nisia-papel-linha text-nisia-tinta-suave hover:bg-nisia-sol-100'
                      }`}
                    >
                      <Icone nome={a.icone} className="w-4 h-4" cor={ativa ? '#1A2A4A' : '#FFD23F'} />
                      {a.rotulo}
                    </button>
                  );
                })}
              </div>

              {/* --- JOGADORES --- */}
              {activeTab === 'players' && (
                <Painel tipo="papel" liso className="p-2 sm:p-3 short:p-1.5 flex flex-col gap-2 short:gap-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <span className="inline-flex items-center gap-1.5 font-display text-xs uppercase tracking-wider text-nisia-azul-700"><Icone nome="lupa" className="w-4 h-4" /> Filtrar</span>
                    <div className="flex items-center gap-2">
                      <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className={seletor} aria-label="Turma">
                        <option value="all">Todas as turmas</option>
                        {classOptions.map(cls => <option key={cls} value={cls}>Turma {cls}</option>)}
                      </select>
                      <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className={seletor} aria-label="Equipe">
                        <option value="all">As duas equipes</option>
                        <option value="blue">Equipe Azul</option>
                        <option value="purple">Equipe Roxa</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto short:max-h-[calc(100dvh-11rem)] short:overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[11px] short:text-[10px] font-display uppercase tracking-wider text-nisia-tinta-suave border-b-2 border-nisia-papel-linha">
                          <th className="py-2 short:py-1 px-2 text-center w-14">Pos.</th>
                          <th className="py-2 short:py-1 px-2">Jogador</th>
                          <th className="py-2 short:py-1 px-2 text-center">Turma</th>
                          <th className="py-2 short:py-1 px-2 text-center">Equipe</th>
                          <th className="py-2 short:py-1 px-2 text-center hidden md:table-cell">Quiz</th>
                          <th className="py-2 short:py-1 px-2 text-center hidden md:table-cell">Cartas</th>
                          <th className="py-2 short:py-1 px-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-nisia-papel-linha text-sm short:text-xs">
                        {filteredPlayers.map((p) => {
                          const isCurrent = currentPlayer?.id === p.playerId;
                          const isBlue = p.team === 'blue';
                          const podio = MEDALHA_POR_POSICAO[p.rank as 1 | 2 | 3];
                          return (
                            <tr key={p.playerId} className={`transition-colors ${isCurrent ? 'bg-nisia-sol-100' : 'hover:bg-nisia-papel'}`}>
                              <td className="py-1.5 short:py-1 px-2 text-center">
                                {podio ? <Medalha tipo={podio} className="w-8 h-10 short:w-6 short:h-8 mx-auto" /> : <span className="font-display text-nisia-tinta-suave">#{p.rank}</span>}
                              </td>
                              <td className="py-1.5 short:py-1 px-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <PlayerAvatar avatarId={p.avatar} size="sm" className="border-2 border-nisia-papel-linha shrink-0 short:!w-7 short:!h-7" />
                                  <div className="min-w-0 leading-tight">
                                    <div className="font-display text-nisia-tinta flex items-center gap-1.5 min-w-0">
                                      <span className="truncate">{p.displayName}</span>
                                      {isCurrent ? (
                                        <Ficha cor="sol" className="!py-0 !px-1.5 text-[10px]">Você</Ficha>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => { setReportingPlayer({ id: p.playerId, name: p.displayName }); setReportSuccess(false); }}
                                          className="opacity-50 hover:opacity-100 p-0.5 rounded transition-opacity shrink-0"
                                          title="Denunciar nome inadequado"
                                          aria-label="Denunciar nome"
                                        >
                                          <Icone nome="bandeira" className="w-3.5 h-3.5 text-nisia-tinta" />
                                        </button>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-nisia-tinta-suave font-semibold inline-flex items-center gap-1 short:hidden">
                                      <Medalha tipo={MEDALHA_DO_JOGADOR[p.medal]} className="w-3 h-4" comFita={false} /> {p.medal === 'gold' ? 'Ouro' : p.medal === 'silver' ? 'Prata' : 'Bronze'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-1.5 short:py-1 px-2 text-center font-semibold text-nisia-tinta-suave">{p.className}</td>
                              <td className="py-1.5 short:py-1 px-2 text-center">
                                <Ficha cor={isBlue ? 'azul' : 'roxo'} className="!py-0.5">
                                  <Icone nome="escudo" className="w-3.5 h-3.5" cor={isBlue ? '#A9CDFF' : '#EDE3FF'} />
                                  <span className="hidden sm:inline">{isBlue ? 'Azul' : 'Roxa'}</span>
                                </Ficha>
                              </td>
                              <td className="py-1.5 short:py-1 px-2 text-center tabular-nums text-nisia-tinta-suave hidden md:table-cell">{p.quizScore}</td>
                              <td className="py-1.5 short:py-1 px-2 text-center tabular-nums text-nisia-tinta-suave hidden md:table-cell">{p.flashcardScore}</td>
                              <td className="py-1.5 short:py-1 px-2 text-right">
                                <span className="font-display text-lg short:text-sm text-nisia-laranja-700 tabular-nums">{p.totalScore.toLocaleString('pt-BR')}</span>
                                <span className="text-[10px] text-nisia-tinta-suave font-semibold ml-1">pts</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {!carregado && (
                      <p className="py-8 short:py-3 text-center font-display text-nisia-tinta-suave inline-flex w-full items-center justify-center gap-2" role="status">
                        <Icone nome="relogio" className="w-6 h-6 animate-pulse" /> Buscando o quadro de honra…
                      </p>
                    )}
                    {vazio ? (
                      <EmptyRanking onPlay={() => { audioService.playClick(); navigate('/missions'); }} />
                    ) : carregado && filteredPlayers.length === 0 && (
                      <p className="py-8 text-center text-sm font-semibold text-nisia-tinta-suave">Nenhum jogador com esses filtros.</p>
                    )}
                  </div>
                </Painel>
              )}

              {/* --- TURMAS --- */}
              {activeTab === 'classes' && (
                <div className="flex flex-col gap-2 short:gap-1">
                  <p className="px-1 text-xs text-nisia-papel font-semibold short:hidden">
                    As turmas são ordenadas pela <strong>média por aluno</strong>, para a disputa ser justa entre turmas de tamanhos diferentes; o total acumulado aparece ao lado.
                  </p>
                  {classList.length === 0 && carregado && (
                    <Painel tipo="papel" liso className="p-6 text-center font-display text-nisia-tinta-suave">Nenhuma turma pontuou ainda.</Painel>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 short:grid-cols-3 gap-3 short:gap-2 short:max-h-[calc(100dvh-8rem)] short:overflow-y-auto">
                    {classList.map((c, idx) => {
                      const podio = MEDALHA_POR_POSICAO[(idx + 1) as 1 | 2 | 3];
                      return (
                        <Painel key={c.className} tipo="papel" as="article" className={`p-3 short:p-2 flex flex-col gap-2 short:gap-1 ${idx % 2 ? 'rotate-[0.4deg]' : 'rotate-[-0.4deg]'}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {podio ? <Medalha tipo={podio} className="w-9 h-11 short:w-7 short:h-9" /> : <span className="kit-ficha kit-ficha--papel font-display">#{idx + 1}</span>}
                              <div className="leading-tight">
                                <h3 className="font-display text-xl short:text-base text-nisia-azul-700">Turma {c.className}</h3>
                                <p className="text-xs text-nisia-tinta-suave font-semibold">{c.studentsCount} {c.studentsCount === 1 ? 'aluno' : 'alunos'} no ranking</p>
                              </div>
                            </div>
                            <div className="text-right leading-tight">
                              <span className="block text-[10px] uppercase tracking-wider font-semibold text-nisia-tinta-suave">Média</span>
                              <span className="font-display text-2xl short:text-lg text-nisia-laranja-700 tabular-nums">{c.averageScore.toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                          <p className="pt-1.5 border-t-2 border-dashed border-nisia-papel-linha text-xs text-nisia-tinta-suave font-semibold">Total: <strong className="text-nisia-tinta tabular-nums">{c.totalPoints.toLocaleString('pt-BR')}</strong> pts</p>
                        </Painel>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- AZUL × ROXA --- */}
              {activeTab === 'teams' && teamComparison && (
                <div className="flex flex-col gap-3 short:gap-1.5">
                  <Painel tipo="papel" liso className="px-4 py-2.5 short:py-1.5 text-center">
                    <p className="font-display text-xl short:text-base text-nisia-azul-700">
                      {teamComparison.leadingTeam === 'blue' && 'A Equipe Azul está na frente!'}
                      {teamComparison.leadingTeam === 'purple' && 'A Equipe Roxa está na frente!'}
                      {teamComparison.leadingTeam === 'tie' && 'Empate entre as equipes!'}
                    </p>
                    <p className="text-xs text-nisia-tinta-suave font-semibold short:hidden">Critério oficial: média de pontos por jogador, para as duas equipes terem a mesma chance.</p>
                  </Painel>
                  <div className="grid grid-cols-1 md:grid-cols-2 short:grid-cols-2 gap-3 short:gap-2">
                    <CartaoEquipe equipe="blue" />
                    <CartaoEquipe equipe="purple" />
                  </div>
                  <Painel tipo="papel" liso className="px-4 py-3 short:py-2">
                    <div className="flex items-center justify-between font-display text-sm short:text-xs mb-1.5">
                      <span className="text-nisia-azul-500 inline-flex items-center gap-1"><Icone nome="escudo" className="w-4 h-4" cor="#1F5FD0" /> Azul · {teamComparison.blueTeam.averageScore.toLocaleString('pt-BR')}</span>
                      <span className="text-nisia-roxo-500 inline-flex items-center gap-1">Roxa · {teamComparison.purpleTeam.averageScore.toLocaleString('pt-BR')} <Icone nome="escudo" className="w-4 h-4" cor="#7B3FE4" /></span>
                    </div>
                    <div className="relative w-full h-5 short:h-4 rounded-full overflow-hidden border-2 border-nisia-tinta bg-nisia-roxo-500" role="img" aria-label={`Azul ${Math.round(fracAzul * 100)}%, Roxa ${Math.round((1 - fracAzul) * 100)}%`}>
                      <div className="absolute inset-y-0 left-0 bg-nisia-azul-500 transition-all duration-500" style={{ width: `${fracAzul * 100}%` }} />
                      <span className="absolute inset-y-0 -translate-x-1/2 w-1 bg-nisia-papel" style={{ left: `${fracAzul * 100}%` }} aria-hidden="true" />
                    </div>
                  </Painel>
                </div>
              )}
            </Painel>

            <div className="flex justify-center short:hidden">
              <BotaoJogo cor="papel" onClick={() => { audioService.playClick(); navigate(currentPlayer ? '/mapa' : '/'); }}>
                <Icone nome="seta" className="w-5 h-5 rotate-180" /> {currentPlayer ? 'Voltar ao mapa' : 'Voltar ao início'}
              </BotaoJogo>
            </div>
          </section>
        </main>

        {/* Denúncia de nome */}
        {reportingPlayer && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-nisia-tinta/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Denunciar nome de jogador">
            <Painel tipo="papel" fita className="max-w-md w-full p-5 pt-7 short:p-4 short:pt-5 max-h-[90dvh] overflow-y-auto animate-balao-in">
              {!reportSuccess ? (
                <div className="flex flex-col gap-3 short:gap-2">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-dashed border-nisia-papel-linha">
                    <Icone nome="bandeira" className="w-9 h-9 text-nisia-tinta shrink-0" />
                    <div className="leading-tight">
                      <h3 className="font-display text-lg text-nisia-azul-700">Denunciar nome de jogador</h3>
                      <p className="text-xs text-nisia-tinta-suave font-semibold">Ajude a manter o Nisialand seguro e respeitoso</p>
                    </div>
                  </div>
                  <p className="text-sm text-nisia-tinta">Reportar o nome <strong className="text-nisia-laranja-700">“{reportingPlayer.name}”</strong> para a equipe pedagógica?</p>
                  <label className="block">
                    <span className="block font-display text-xs uppercase tracking-wider text-nisia-azul-700 mb-1">Motivo</span>
                    <select value={reportReason} onChange={e => setReportReason(e.target.value)} className={`${seletor} w-full`}>
                      <option value="Nome ofensivo ou desrespeitoso">Nome ofensivo ou desrespeitoso</option>
                      <option value="Palavrão ou termo impróprio">Palavrão ou termo impróprio</option>
                      <option value="Trocadilho malicioso">Trocadilho malicioso</option>
                      <option value="Outro motivo">Outro motivo</option>
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <BotaoJogo cor="papel" tamanho="sm" onClick={() => setReportingPlayer(null)} className="flex-1">Cancelar</BotaoJogo>
                    <BotaoJogo
                      cor="laranja"
                      tamanho="sm"
                      className="flex-1"
                      onClick={() => {
                        nameModerationService.reportName(reportingPlayer.id, reportingPlayer.name, reportReason);
                        setReportSuccess(true);
                        setTimeout(() => { setReportingPlayer(null); setReportSuccess(false); }, 2000);
                      }}
                    >
                      Enviar denúncia
                    </BotaoJogo>
                  </div>
                </div>
              ) : (
                <div className="py-3 text-center flex flex-col items-center gap-2">
                  <Icone nome="check" className="w-12 h-12 text-nisia-verde-700" cor="#DDF5D9" />
                  <h4 className="font-display text-lg text-nisia-verde-700">Denúncia enviada!</h4>
                  <p className="text-xs text-nisia-tinta-suave font-semibold">Obrigado por colaborar com um ambiente escolar seguro e positivo.</p>
                </div>
              )}
            </Painel>
          </div>
        )}
      </div>
    </div>
  );
};
