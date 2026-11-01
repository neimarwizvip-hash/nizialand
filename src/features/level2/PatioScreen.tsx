import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { audioService } from '../../services/audio';
import { LEVEL2 } from '../../data/level2Content';
import { getMissionProgress } from '../../engines/progression/progress';
import { resolveRequestedActivity } from './level2Rules';
import { LEVEL2_ACTIVITY_VIEWS } from './Level2Activities';
import { PlayerAvatar } from '../../components/ui/PlayerAvatar';
import { Anfitriao, BotaoJogo, Cenario, Ficha, Hud, Icone, Painel, Titulo } from '../../components/kit';
import type { NomeIcone } from '../../components/kit';
import { fala as falaDoRoteiro } from '../../data/falasAnfitrioes';

// Pátio do Nível 2: as 6 estações são placas de madeira espalhadas pelo pátio; o avatar do aluno
// fica parado na próxima estação liberada. ?atividade=<id> abre direto (só se já estiver liberada).

const LARGURA = 1000;
const ALTURA = 480;
// Posição de cada estação no pátio (unidades do desenho), em caminho de ida e volta.
const POSICOES: Array<[number, number]> = [[150, 330], [370, 255], [580, 335], [780, 255], [660, 110], [340, 110]];
const ICONE_ESTACAO: Record<string, NomeIcone> = { n2_ditado: 'orelha', n2_caca: 'lupa', n2_mural: 'livro', n2_bilhete: 'balao', n2_relogio: 'relogio', n2_duelo: 'carta' };

export const PatioScreen: React.FC = () => {
  const { currentPlayer, activityResults, vistoria } = useGame();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const grade = getPlayerGrade(currentPlayer) ?? '8';
  const unlocked = true; // a rota já exige o Nível 1 completo (RequireLevel2)
  const requested = params.get('atividade');
  // Na vistoria (só em dev) qualquer atividade abre direto, fora da ordem.
  const selected = vistoria
    ? LEVEL2.mission.activities.find(a => a.id === requested) ?? null
    : resolveRequestedActivity(LEVEL2, activityResults, requested, unlocked);
  const stations = useMemo(() => getMissionProgress(LEVEL2, activityResults, unlocked).activities, [activityResults]);
  const [runKey, setRunKey] = useState(0);
  const proxima = stations.findIndex(s => s.state === 'available');
  const feitas = stations.filter(s => s.state === 'completed').length;
  const momento = feitas === stations.length ? 'concluido' : feitas > 0 ? 'meio' : 'apresenta';
  const falaVania = useMemo(() => falaDoRoteiro(2, momento, { nome: currentPlayer?.displayName, proxima: proxima >= 0 ? stations[proxima].activity.name : undefined }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [momento, proxima]);

  // Atividade inválida ou ainda bloqueada na URL: volta para o mapa.
  useEffect(() => {
    if (requested && !selected) setParams({}, { replace: true });
  }, [requested, selected, setParams]);

  // Trilha do mapa no pátio, trilha de desafio dentro da atividade (depois da RouteMusic).
  const playing = selected?.id ?? null;
  useEffect(() => {
    const t = setTimeout(() => audioService.playTrack(playing ? 'desafio' : 'mapa'), 0);
    return () => clearTimeout(t);
  }, [playing]);

  if (selected) {
    const View = LEVEL2_ACTIVITY_VIEWS[selected.id];
    return (
      <View
        key={`${selected.id}-${runKey}`}
        grade={grade}
        onExit={() => navigate('/nivel2/patio')}
        onReplay={() => setRunKey(k => k + 1)}
      />
    );
  }

  const abrir = (id: string) => { audioService.playClick(); setParams({ atividade: id }); };

  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col">
      <Cenario nome="patio" escurecer={0.25} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={2} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 py-4 short:py-1 grid grid-cols-1 wide:grid-cols-[13rem_1fr] short:grid-cols-[8rem_1fr] gap-4 short:gap-2 items-end">
          <div className="hidden wide:flex short:flex items-end">
            <Anfitriao
              nome="vania"
              lado="esq"
              altura="h-[20rem] short:h-32"
              fala={falaVania.pt}
              traducao={falaVania.en}
            />
          </div>

          <div className="flex flex-col gap-3 short:gap-1.5 pb-4 short:pb-1">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <Titulo nivel={1} className="text-4xl sm:text-5xl short:text-2xl leading-none">Pátio da escola</Titulo>
                <p className="mt-2 short:mt-1 inline-block kit-placa px-7 py-1.5 short:px-6 short:py-0.5 font-display text-lg sm:text-xl short:text-sm -rotate-1">Respeito à autoridade · {grade}º ano</p>
              </div>
              <div className="flex items-center gap-2">
                <Ficha cor="papel">{feitas} / {stations.length} estações</Ficha>
                <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); navigate('/nivel2'); }}><Icone nome="mapa" className="w-5 h-5" cor="#1F5FD0" /> Missão</BotaoJogo>
              </div>
            </div>

            {/* O pátio: gramado, calçada e as seis placas */}
            <div className="relative w-full short:w-auto short:h-[calc(100dvh-8.2rem)] short:mx-auto rounded-2xl overflow-hidden border-[6px] border-nisia-madeira shadow-[inset_0_0_0_2px_#8A5A2B,0_14px_30px_-12px_rgba(0,0,0,0.6)]" style={{ aspectRatio: `${LARGURA} / ${ALTURA}` }}>
              <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} className="absolute inset-0 w-full h-full" aria-hidden="true" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="patio-grama" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6CC877" /><stop offset="1" stopColor="#3FA34D" /></linearGradient>
                  <pattern id="patio-piso" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#E0C9A2" /><path d="M0 20h40M20 0v40" stroke="#C9A97A" strokeWidth="2" /></pattern>
                </defs>
                <rect width={LARGURA} height={ALTURA} fill="url(#patio-grama)" />
                {/* calçada que liga as estações */}
                <path d="M 60 360 C 200 240, 300 240, 360 290 S 520 380, 580 370 S 760 260, 800 290 S 760 120, 660 150 S 420 60, 330 150" fill="none" stroke="#8A5A2B" strokeWidth="58" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                <path d="M 60 360 C 200 240, 300 240, 360 290 S 520 380, 580 370 S 760 260, 800 290 S 760 120, 660 150 S 420 60, 330 150" fill="none" stroke="url(#patio-piso)" strokeWidth="50" strokeLinecap="round" strokeLinejoin="round" />
                {/* canteiros e árvores */}
                {[[80, 120], [230, 420], [480, 440], [900, 420], [940, 120], [500, 60]].map(([x, y], i) => (
                  <g key={i} transform={`translate(${x} ${y})`} stroke="#22703A" strokeWidth="2">
                    <ellipse cx="0" cy="16" rx="22" ry="7" fill="rgba(0,0,0,0.18)" stroke="none" />
                    <path d="M0 0v18" strokeWidth="4" stroke="#8A5A2B" />
                    <circle cx="0" cy="-10" r="20" fill="#2E8B45" /><circle cx="-12" cy="-2" r="13" fill="#3FA34D" /><circle cx="12" cy="-2" r="13" fill="#3FA34D" /><circle cx="-4" cy="-18" r="9" fill="#6CC877" stroke="none" />
                  </g>
                ))}
                {/* bancos */}
                {[[880, 300], [120, 220]].map(([x, y], i) => (
                  <g key={i} transform={`translate(${x} ${y})`} fill="#C98A4B" stroke="#8A5A2B" strokeWidth="2">
                    <rect x="-26" y="0" width="52" height="8" rx="2" /><rect x="-26" y="-12" width="52" height="8" rx="2" /><path d="M-20 8v10M20 8v10" />
                  </g>
                ))}
              </svg>

              {stations.map(({ activity: a, state }, i) => {
                const [x, y] = POSICOES[i];
                const open = state !== 'locked';
                const done = state === 'completed';
                return (
                  <button
                    key={a.id}
                    type="button"
                    disabled={!open}
                    onClick={() => abrir(a.id)}
                    aria-label={`${a.name}: ${done ? 'concluída' : open ? 'disponível' : 'bloqueada'}`}
                    className={`!absolute -translate-x-1/2 -translate-y-1/2 w-[20%] min-w-0 kit-placa px-2 py-1.5 short:py-0.5 short:px-1 text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-nisia-azul-400 transition-transform ${!open ? 'opacity-70 grayscale-[0.5]' : 'hover:-translate-y-[calc(50%+3px)]'} ${i % 2 ? 'rotate-1' : '-rotate-1'}`}
                    style={{ left: `${(x / LARGURA) * 100}%`, top: `${(y / ALTURA) * 100}%` }}
                  >
                    <span className="flex flex-col items-center justify-center min-w-0">
                      <Icone nome={done ? 'check' : open ? ICONE_ESTACAO[a.id] ?? 'escola' : 'cadeado'} className="w-7 h-7 short:w-4 short:h-4 shrink-0" cor={done ? '#3FA34D' : '#FFD23F'} />
                      <span className="block w-full font-display text-[clamp(10px,1.3vw,16px)] leading-tight break-words">{a.name}</span>
                    </span>
                    <span className="block text-[clamp(8px,0.95vw,12px)] font-semibold opacity-90 short:hidden">{done ? 'Concluída' : open ? 'Toque para jogar' : 'Fechada'}</span>
                    {i === proxima && <span className="absolute -inset-1 rounded-2xl ring-4 ring-nisia-sol-400 animate-anel-pulsa pointer-events-none" aria-hidden="true" />}
                  </button>
                );
              })}

              {currentPlayer && proxima >= 0 && (
                <div className="absolute -translate-x-1/2 -translate-y-full pointer-events-none" style={{ left: `${(POSICOES[proxima][0] / LARGURA) * 100}%`, top: `${(POSICOES[proxima][1] / ALTURA) * 100 - 15}%` }}>
                  <PlayerAvatar avatarId={currentPlayer.avatar} skinTone={currentPlayer.skinTone} size="md" className="border-[3px] border-white shadow-[0_6px_10px_rgba(12,42,102,0.45)] animate-float" />
                </div>
              )}
            </div>

            {feitas === stations.length && (
              <Painel tipo="papel" liso className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-xl text-nisia-verde-700">Nível 2 completo! Todas as estações feitas.</p>
                <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); navigate('/mapa'); }}><Icone nome="mapa" className="w-5 h-5" /> Ver o mapa</BotaoJogo>
              </Painel>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
export default PatioScreen;
