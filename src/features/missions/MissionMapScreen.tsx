import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getMissionMapState, LANCAMENTO, MISSION_MAP } from '../../data/missionMap';
import { storageService } from '../../services/storage';
import { audioService } from '../../services/audio';
import { getPlayerGrade } from '../../services/grade';
import { alunoAutorizado, janela } from '../../data/teste8';
import { PlayerAvatar } from '../../components/ui/PlayerAvatar';
import { BotaoJogo, Cenario, Ficha, Fita, Hud, Icone, ICONE_NIVEL, Medalha, NOME_MEDALHA, Painel, Titulo } from '../../components/kit';

// Mapa das missões: tabuleiro de papel com a trilha da escola e os 11 níveis como paradas.
// O avatar do aluno fica parado no nível atual; o caminho já percorrido fica verde.
// Cada nível completo ganha medalha de ouro (90 %+), prata (70 %+) ou bronze, pelo aproveitamento das atividades.

const LARGURA = 1000;
const ALTURA = 560;
// Posições das 11 paradas (em unidades do viewBox), do portão (Nível 0) à festa (Nível 10).
const PARADAS: Array<[number, number]> = [
  [90, 470], [230, 435], [365, 480], [480, 400], [390, 300], [530, 245], [670, 315], [810, 255], [730, 150], [570, 105], [420, 60],
];

// Curva suave passando por todos os pontos (Catmull-Rom → Bézier), um trecho por parada.
function trechos(p: Array<[number, number]>): string[] {
  const out: string[] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    out.push(`C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0]} ${p2[1]}`);
  }
  return out;
}

export const MissionMapScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, activityResults, quizResult, flashcardResult } = useGame();
  // Lançamento coletivo dos Níveis 9 e 10: quantos alunos já concluíram o nível anterior.
  const [concluiram, setConcluiram] = useState<Record<number, number | null>>({});
  useEffect(() => {
    let vivo = true;
    const anteriores = [...new Set(Object.values(LANCAMENTO).map(r => r.apos))];
    Promise.all(anteriores.map(async n => [n, (await storageService.contarAlunosQueConcluiram(n, MISSION_MAP[n]?.activityCount ?? 8)).total] as const))
      .then(pares => { if (vivo) setConcluiram(Object.fromEntries(pares)); })
      .catch(() => undefined);
    return () => { vivo = false; };
  }, []);
  const levels = getMissionMapState(activityResults, quizResult, flashcardResult, concluiram);
  const atual = levels.find(l => l.state === 'available') ?? levels[levels.length - 1];
  const [selecionado, setSelecionado] = useState<number>(atual.number);
  const nivelSel = levels[selecionado] ?? atual;

  const partes = useMemo(() => trechos(PARADAS), []);
  const caminhoTodo = `M ${PARADAS[0][0]} ${PARADAS[0][1]} ${partes.join(' ')}`;
  const caminhoFeito = atual.number > 0 ? `M ${PARADAS[0][0]} ${PARADAS[0][1]} ${partes.slice(0, atual.number).join(' ')}` : '';
  const caminhoFuturo = atual.number < PARADAS.length - 1 ? `M ${PARADAS[atual.number][0]} ${PARADAS[atual.number][1]} ${partes.slice(atual.number).join(' ')}` : '';

  const escolher = (n: number) => { audioService.playClick(); setSelecionado(n); };
  const ir = () => { if (!nivelSel.available) return; audioService.playClick(); navigate(nivelSel.path); };

  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col">
      <Cenario nome="fachada" escurecer={0.3} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud mostrarMapa={false} />

        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 py-4 short:py-1 grid grid-cols-1 wide:grid-cols-[1fr_19rem] short:grid-cols-[1fr_13rem] gap-4 short:gap-2 items-start">
          {/* Tabuleiro */}
          <section aria-label="Mapa das missões" className="flex flex-col gap-2 short:gap-1">
            <div className="flex flex-wrap items-end justify-between gap-2 px-1">
              <Titulo nivel={1} className="text-4xl sm:text-5xl short:text-2xl leading-none">Mapa da escola</Titulo>
              <Ficha cor="papel"><Icone nome="mapa" className="w-4 h-4" /> Nível {atual.number} de 10 · {levels.filter(l => l.completed).length} completos</Ficha>
            </div>
            <Painel tipo="papel" liso className="p-2 sm:p-3 short:p-1.5 short:self-center">
              <div className="relative w-full short:w-auto short:h-[calc(100dvh-6.9rem)] short:mx-auto" style={{ aspectRatio: `${LARGURA} / ${ALTURA}` }}>
                <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
                  {/* quadriculado fraco do papel de mapa */}
                  <defs>
                    <pattern id="mapa-grade" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#E7D3A6" strokeWidth="1" />
                    </pattern>
                    <filter id="mapa-sombra" x="-10%" y="-10%" width="120%" height="130%">
                      <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#8A5A2B" floodOpacity="0.35" />
                    </filter>
                    <radialGradient id="mapa-vinheta" cx="50%" cy="50%" r="75%">
                      <stop offset="60%" stopColor="#E7D3A6" stopOpacity="0" />
                      <stop offset="100%" stopColor="#C98A4B" stopOpacity="0.35" />
                    </radialGradient>
                  </defs>
                  <rect width={LARGURA} height={ALTURA} fill="url(#mapa-grade)" rx="10" />
                  {/* papel envelhecido nas bordas */}
                  <rect width={LARGURA} height={ALTURA} rx="10" fill="url(#mapa-vinheta)" />
                  {/* gramado e áreas da escola */}
                  <ellipse cx="200" cy="470" rx="190" ry="70" fill="#CDEBC6" opacity="0.9" />
                  <ellipse cx="620" cy="300" rx="260" ry="120" fill="#DDF5D9" opacity="0.75" />
                  <ellipse cx="520" cy="95" rx="220" ry="60" fill="#FFEFB8" opacity="0.9" />
                  {/* marcos desenhados: portão, prédio das salas, quadra, bandeirinhas, árvores */}
                  <g stroke="#8A5A2B" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
                    {/* portão */}
                    <g transform="translate(20 380)">
                      <rect x="0" y="0" width="14" height="48" fill="#1F5FD0" />
                      <rect x="66" y="0" width="14" height="48" fill="#1F5FD0" />
                      <path d="M14 10h52M14 22h52M14 34h52" />
                      <path d="M24 10v38M34 10v38M44 10v38M54 10v38" strokeWidth="2" />
                    </g>
                    {/* prédio das salas */}
                    <g transform="translate(570 360)">
                      <rect x="0" y="22" width="150" height="56" fill="#FFF6DF" />
                      <path d="M-6 22L75 -2l81 24z" fill="#F2811D" />
                      <rect x="14" y="36" width="20" height="18" fill="#A9CDFF" /><rect x="48" y="36" width="20" height="18" fill="#A9CDFF" /><rect x="82" y="36" width="20" height="18" fill="#A9CDFF" /><rect x="116" y="36" width="20" height="18" fill="#A9CDFF" />
                      <rect x="62" y="56" width="26" height="22" fill="#1F5FD0" />
                    </g>
                    {/* quadra */}
                    <g transform="translate(590 190)">
                      <rect x="0" y="0" width="110" height="60" rx="4" fill="#6CC877" />
                      <path d="M55 0v60" /><circle cx="55" cy="30" r="12" fill="none" />
                      <rect x="0" y="18" width="18" height="24" fill="none" /><rect x="92" y="18" width="18" height="24" fill="none" />
                    </g>
                    {/* bandeirinhas da festa */}
                    <g transform="translate(200 60)">
                      <path d="M0 0q60 30 120 0" fill="none" />
                      <path d="M12 6l8 16 8-16z" fill="#E5484D" /><path d="M36 12l8 16 8-16z" fill="#FFD23F" /><path d="M60 14l8 16 8-16z" fill="#1F5FD0" /><path d="M84 12l8 16 8-16z" fill="#7B3FE4" /><path d="M104 6l8 16 8-16z" fill="#3FA34D" />
                    </g>
                    {/* árvores */}
                    {[[150, 395], [300, 505], [430, 505], [860, 420], [920, 300], [880, 150], [250, 150], [160, 230]].map(([x, y], i) => (
                      <g key={i} transform={`translate(${x} ${y})`}>
                        <path d="M0 0v18" strokeWidth="3" />
                        <circle cx="0" cy="-8" r="16" fill="#3FA34D" />
                        <circle cx="-9" cy="-2" r="11" fill="#3FA34D" />
                        <circle cx="9" cy="-2" r="11" fill="#3FA34D" />
                        <circle cx="-4" cy="-14" r="7" fill="#6CC877" stroke="none" />
                      </g>
                    ))}
                  </g>
                  <text x="110" y="530" fontFamily="Lilita One, sans-serif" fontSize="18" fill="#8A5A2B">Portão</text>
                  <text x="580" y="462" fontFamily="Lilita One, sans-serif" fontSize="18" fill="#8A5A2B">Pátio e salas</text>
                  <text x="600" y="182" fontFamily="Lilita One, sans-serif" fontSize="18" fill="#8A5A2B">Quadra</text>
                  <text x="225" y="52" fontFamily="Lilita One, sans-serif" fontSize="18" fill="#8A5A2B">Festa</text>
                  {/* rosa dos ventos */}
                  <g transform="translate(945 480)" stroke="#8A5A2B" strokeWidth="2">
                    <circle r="26" fill="#FFF6DF" />
                    <path d="M0 -22L6 0 0 22 -6 0z" fill="#E5484D" />
                    <path d="M-22 0L0 -6 22 0 0 6z" fill="#FFF6DF" />
                    <text y="-30" textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize="14" fill="#8A5A2B" stroke="none">N</text>
                  </g>
                  {/* estrada: feita (verde), atual→futuro (tracejada, ainda por abrir) */}
                  <path d={caminhoTodo} fill="none" stroke="#8A5A2B" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" filter="url(#mapa-sombra)" />
                  <path d={caminhoTodo} fill="none" stroke="#C98A4B" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={caminhoTodo} fill="none" stroke="#FFF6DF" strokeWidth="4" strokeDasharray="16 16" strokeLinecap="round" />
                  {caminhoFuturo && <path d={caminhoFuturo} fill="none" stroke="#FFF6DF" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />}
                  {caminhoFeito && <path d={caminhoFeito} fill="none" stroke="#3FA34D" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />}
                  {/* bandeirinha no fim */}
                  <g transform={`translate(${PARADAS[10][0] + 44}, ${PARADAS[10][1] - 44})`}>
                    <path d="M0 0v60" stroke="#8A5A2B" strokeWidth="4" strokeLinecap="round" />
                    <path d="M2 2h40l-10 12 10 12H2z" fill="#F2811D" stroke="#B85A0A" strokeWidth="2" />
                  </g>
                </svg>

                {/* Paradas (botões HTML por cima do desenho) */}
                {levels.map(level => {
                  const [x, y] = PARADAS[level.number];
                  const sel = level.number === selecionado;
                  const corFundo = level.state === 'completed' ? 'bg-nisia-verde-500 border-nisia-verde-700 text-white'
                    : level.state === 'available' ? 'bg-nisia-sol-400 border-nisia-sol-700 text-nisia-tinta'
                      : 'bg-nisia-papel-escuro border-nisia-papel-linha text-nisia-tinta-suave';
                  return (
                    <button
                      key={level.number}
                      type="button"
                      onClick={() => escolher(level.number)}
                      aria-label={`Nível ${level.number}: ${level.title} (${level.state === 'completed' ? 'completo' : level.state === 'available' ? 'disponível' : 'bloqueado'})`}
                      aria-pressed={sel}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-[7.2%] aspect-square rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-nisia-azul-400 group"
                      style={{ left: `${(x / LARGURA) * 100}%`, top: `${(y / ALTURA) * 100}%` }}
                    >
                      {level.state === 'available' && <span className="absolute inset-0 rounded-full bg-nisia-sol-400 animate-anel-pulsa" aria-hidden="true" />}
                      <span className={`relative flex items-center justify-center w-full h-full rounded-full border-[3px] shadow-[0_4px_0_0_rgba(26,42,74,0.25)] transition-transform group-hover:-translate-y-0.5 ${corFundo} ${sel ? 'ring-4 ring-nisia-azul-500' : ''}`}>
                        {level.state === 'locked'
                          ? <Icone nome="cadeado" className="w-[55%] h-[55%]" cor="#F3E4BE" />
                          : <Icone nome={ICONE_NIVEL[level.number]} className="w-[60%] h-[60%]" cor={level.state === 'completed' ? '#DDF5D9' : '#FFF6DF'} />}
                      </span>
                      <span className={`absolute left-1/2 -translate-x-1/2 top-full mt-0.5 font-display text-[clamp(10px,1.3vw,15px)] leading-none px-1.5 py-0.5 rounded-md ${level.state === 'locked' ? 'text-nisia-tinta-suave' : 'bg-nisia-papel text-nisia-tinta border border-nisia-papel-linha'}`}>
                        {level.number}
                      </span>
                      {level.medal && (
                        <span className="absolute -top-2 -right-2 w-[52%] h-[65%] drop-shadow-[0_2px_0_rgba(26,42,74,0.4)]" title={NOME_MEDALHA[level.medal]}>
                          <Medalha tipo={level.medal} className="w-full h-full" />
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Avatar parado no nível atual */}
                {currentPlayer && (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
                    style={{ left: `${(PARADAS[atual.number][0] / LARGURA) * 100}%`, top: `${(PARADAS[atual.number][1] / ALTURA) * 100 - 4}%` }}
                  >
                    <div className="relative flex flex-col items-center">
                      <span className="kit-ficha kit-ficha--azul text-[10px] px-2 py-0.5 mb-1 whitespace-nowrap">Você está aqui</span>
                      <PlayerAvatar avatarId={currentPlayer.avatar} skinTone={currentPlayer.skinTone} size="md" className="border-[3px] border-white shadow-[0_6px_10px_rgba(12,42,102,0.45)] animate-float" />
                    </div>
                  </div>
                )}
              </div>
            </Painel>
          </section>

          {/* Ficha do nível escolhido */}
          <aside className="flex flex-col gap-3 short:gap-1.5">
            {currentPlayer && currentPlayer.kind !== 'guest' && janela() !== 'encerrado' && alunoAutorizado([currentPlayer.name, currentPlayer.displayName], getPlayerGrade(currentPlayer)) && (
              <Painel tipo="lousa" className="p-3 short:p-2 text-white flex flex-col gap-2">
                <p className="font-display text-lg short:text-sm leading-tight">Teste do 8º ano: Comparatives</p>
                <p className="text-sm short:text-xs leading-snug">{janela() === 'antes' ? 'Abre hoje às 17h. 15 minutos por dia, pontos para o professor.' : '15 minutos por dia. Frases novas a cada acesso.'}</p>
                <BotaoJogo cor="sol" onClick={() => { audioService.playClick(); navigate('/teste8'); }} className="w-full short:min-h-[36px] short:text-sm">Fazer o teste</BotaoJogo>
              </Painel>
            )}
            <Painel tipo="papel" fita className="p-4 pt-5 short:p-2.5 short:pt-3">
              <div className="flex items-center justify-between gap-2">
                <Ficha cor={nivelSel.state === 'completed' ? 'verde' : nivelSel.state === 'available' ? 'sol' : 'papel'}>Nível {nivelSel.number}</Ficha>
                {nivelSel.medal
                  ? <span className="inline-flex items-center gap-1.5"><Medalha tipo={nivelSel.medal} className="w-9 h-11 short:w-7 short:h-9" /><span className="font-display text-sm text-nisia-tinta-suave short:hidden">{Math.round(nivelSel.fraction * 100)}%</span></span>
                  : <Icone nome={ICONE_NIVEL[nivelSel.number]} className="w-9 h-9 text-nisia-tinta" />}
              </div>
              <h2 className="mt-2 font-display text-2xl short:text-lg leading-tight text-nisia-azul-700">{nivelSel.title}</h2>
              <p className="font-body font-semibold text-nisia-laranja-700 short:text-sm">{nivelSel.theme}</p>
              {nivelSel.lugar && <p className="mt-1 inline-flex items-center gap-1.5 text-sm short:text-xs font-semibold text-nisia-azul-700"><Icone nome="mapa" className="w-4 h-4" cor="#1F5FD0" /> {nivelSel.lugar}</p>}
              <p className="mt-2 short:mt-1 text-sm short:text-xs text-nisia-tinta leading-snug">{nivelSel.description}</p>
              <p className="mt-2 short:mt-1 text-sm font-semibold text-nisia-tinta-suave">{nivelSel.activityCount} atividades</p>
              <div className="mt-3 short:mt-2">
                {LANCAMENTO[nivelSel.number] && nivelSel.state === 'locked' ? (
                  <ContadorLancamento nivel={nivelSel.number} concluiram={concluiram[LANCAMENTO[nivelSel.number].apos] ?? null} aguardando={!!nivelSel.aguardando} />
                ) : nivelSel.state === 'locked' ? (
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-nisia-tinta-suave"><Icone nome="cadeado" className="w-5 h-5" cor="#F3E4BE" /> Termine o Nível {nivelSel.number - 1} para abrir.</p>
                ) : (
                  <BotaoJogo cor={nivelSel.state === 'completed' ? 'papel' : 'laranja'} onClick={ir} className="w-full short:min-h-[38px] short:text-sm">
                    {nivelSel.state === 'completed' ? 'Revisitar' : nivelSel.number === atual.number ? 'Continuar missão' : 'Abrir'}
                    <Icone nome="seta" className="w-5 h-5" />
                  </BotaoJogo>
                )}
              </div>
            </Painel>
            <Painel tipo="placa" className="px-4 py-2.5 text-center short:hidden">
              <p className="font-display text-lg short:text-sm">{levels.filter(l => l.completed).length} de {levels.length} níveis completos</p>
              {levels.some(l => l.medal) && (
                <p className="mt-1 inline-flex items-center justify-center gap-3 text-sm font-semibold" aria-label="Medalhas conquistadas">
                  {(['ouro', 'prata', 'bronze'] as const).map(t => (
                    <span key={t} className="inline-flex items-center gap-1"><Medalha tipo={t} className="w-5 h-6" comFita={false} /> {levels.filter(l => l.medal === t).length}</span>
                  ))}
                </p>
              )}
            </Painel>
          </aside>
        </main>
      </div>
    </div>
  );
};

// Contador do lançamento coletivo (Níveis 9 e 10).
const ContadorLancamento: React.FC<{ nivel: number; concluiram: number | null; aguardando: boolean }> = ({ nivel, concluiram, aguardando }) => {
  const { apos, minimo } = LANCAMENTO[nivel];
  const meta = minimo + 1; // "mais de 100"
  const ja = concluiram ?? 0;
  const faltam = Math.max(0, meta - ja);
  return (
    <div className="flex flex-col gap-1.5" role="status" aria-live="polite">
      <p className="text-sm short:text-xs font-semibold text-nisia-tinta leading-snug">
        <Icone nome="cadeado" className="inline w-4 h-4 -mt-0.5 mr-1" cor="#F3E4BE" />
        Lançamento coletivo: abre quando mais de {minimo} alunos concluírem o Nível {apos}.
      </p>
      <Fita frac={Math.min(1, ja / meta)} rotulo={`Alunos que concluíram o Nível ${apos}`} />
      <p className="font-display text-base short:text-sm text-nisia-azul-700">
        {concluiram === null ? 'Contando os alunos…' : faltam > 0 ? `${ja} de ${meta} alunos · faltam ${faltam}` : 'Meta alcançada! O nível chega em breve.'}
      </p>
      {aguardando && faltam > 0 && <p className="text-xs text-nisia-tinta-suave">Você já fez a sua parte. Chame os colegas para chegar lá!</p>}
    </div>
  );
};

export default MissionMapScreen;
