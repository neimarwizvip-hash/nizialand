import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { BalaoFala, BotaoJogo, Cenario, Estrelas, Hud, Icone, Painel } from '../../components/kit';
import { audioService } from '../../services/audio';
import { narrar } from '../../services/narracao';
import { useGame } from '../../context/GameContext';
import {
  CONCLUSOES, DESFECHO, FALAS_ROSANA, LINHA, PERGUNTAS, PESSOAS, PISTAS, RECUSA, REGRAS_MURAL, RESPOSTAS,
  type Caso, type Suspeito,
} from '../../data/missaoMural';

// CAMADA 2.0 · Nível 3 — "O mistério do mural rasgado": investigar (pistas na sala), conversar em inglês com
// educação, montar a linha do tempo, concluir com provas e reconstruir o mural com a turma.

type Etapa = 'abertura' | 'pistas' | 'conversa' | 'linha' | 'conclusao' | 'mural' | 'fim';
const ETAPAS: Array<{ id: Etapa; nome: string }> = [
  { id: 'pistas', nome: 'Pistas' }, { id: 'conversa', nome: 'Conversa' }, { id: 'linha', nome: 'Linha do tempo' }, { id: 'conclusao', nome: 'Conclusão' }, { id: 'mural', nome: 'Mural' },
];
const embaralhar = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const chaveMelhor = (jogador?: string) => `nisialand_missao_mural_${jogador ?? 'anon'}`;

export const MisterioMural: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer } = useGame();
  const [caso, setCaso] = useState<Caso>(() => embaralhar<Caso>(['ze', 'mane', 'vento'])[0]);
  const [etapa, setEtapa] = useState<Etapa>('abertura');
  const [pontos, setPontos] = useState(0);
  const [achadas, setAchadas] = useState<string[]>([]);
  const [aberta, setAberta] = useState<string | null>(null);
  const [verPt, setVerPt] = useState(false);
  const [quem, setQuem] = useState<Suspeito | null>(null);
  const [conversas, setConversas] = useState<Record<Suspeito, Array<{ p: string; r: string; ok: boolean }>>>({ ze: [], mane: [], bia: [] });
  const [ordem, setOrdem] = useState<string[]>([]);
  const [errosLinha, setErrosLinha] = useState<number[] | null>(null);
  const [tentativasLinha, setTentativasLinha] = useState(0);
  const [errosConclusao, setErrosConclusao] = useState(0);
  const [desfecho, setDesfecho] = useState(false);
  const [regraEsq, setRegraEsq] = useState<number | null>(null);
  const [regrasFeitas, setRegrasFeitas] = useState<number[]>([]);
  const [errouRegra, setErrouRegra] = useState<number | null>(null);
  const parar = useRef<() => void>(() => undefined);
  const falar = (texto: string, personagem: 'ze' | 'mane' | 'colega' | 'rosana', idioma: 'pt-BR' | 'en-US' = 'en-US') => { parar.current(); parar.current = narrar([{ texto, idioma, personagem }]); };
  useEffect(() => () => parar.current(), []);

  const cartasLinha = useMemo(() => embaralhar(LINHA[caso]), [caso]);
  const metadesDir = useMemo(() => embaralhar(REGRAS_MURAL.map((_, i) => i)), [caso]); // eslint-disable-line react-hooks/exhaustive-deps
  const conclusoes = useMemo(() => embaralhar(CONCLUSOES), [caso]);

  const fala = etapa === 'abertura' ? FALAS_ROSANA.abertura : etapa === 'pistas' ? FALAS_ROSANA.pistas : etapa === 'conversa' ? FALAS_ROSANA.conversa
    : etapa === 'linha' ? FALAS_ROSANA.linha : etapa === 'conclusao' ? (errosConclusao && !desfecho ? FALAS_ROSANA.semProva : FALAS_ROSANA.conclusao) : etapa === 'mural' ? FALAS_ROSANA.mural : FALAS_ROSANA.fim;

  const ir = (e: Etapa) => { audioService.playClick(); setEtapa(e); };

  // ---------- Pistas ----------
  const abrirPista = (id: string) => {
    audioService.playFlip();
    setAberta(id); setVerPt(false);
    if (!achadas.includes(id)) { setAchadas(a => [...a, id]); setPontos(p => p + 10); }
  };
  const pista = PISTAS.find(p => p.id === aberta);

  // ---------- Conversa ----------
  const perguntar = (s: Suspeito, pid: string) => {
    const q = PERGUNTAS.find(p => p.id === pid)!;
    if (!q.educada) {
      audioService.playWrong(); setPontos(p => Math.max(0, p - 10));
      setConversas(c => ({ ...c, [s]: [...c[s], { p: q.en, r: RECUSA[s], ok: false }] }));
      falar(RECUSA[s], PESSOAS[s].voz);
      return;
    }
    const r = RESPOSTAS[caso][s][pid as 'onde' | 'viu'];
    const jaFeita = conversas[s].some(x => x.p === q.en && x.ok);
    if (!jaFeita) { setPontos(p => p + 20); audioService.playCorrect(); }
    setConversas(c => ({ ...c, [s]: jaFeita ? c[s] : [...c[s], { p: q.en, r, ok: true }] }));
    falar(r, PESSOAS[s].voz);
  };
  const conversaPronta = (Object.keys(PESSOAS) as Suspeito[]).every(s => conversas[s].some(x => x.ok && x.p === PERGUNTAS[1].en));

  // ---------- Linha do tempo ----------
  const tocarCarta = (t: string) => { setErrosLinha(null); setOrdem(o => (o.includes(t) ? o.filter(x => x !== t) : o.length < 4 ? [...o, t] : o)); audioService.playTick(); };
  const conferirLinha = () => {
    const certa = LINHA[caso];
    const erradas = ordem.map((t, i) => (t === certa[i] ? -1 : i)).filter(i => i >= 0);
    setTentativasLinha(n => n + 1);
    if (!erradas.length) { audioService.playCorrect(); setPontos(p => p + (tentativasLinha === 0 ? 100 : tentativasLinha === 1 ? 60 : 30)); confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } }); window.setTimeout(() => setEtapa('conclusao'), 900); }
    else { audioService.playWrong(); setErrosLinha(erradas); }
  };

  // ---------- Conclusão ----------
  const concluir = (c: Caso) => {
    if (desfecho) return;
    if (c !== caso) { audioService.playWrong(); setErrosConclusao(n => n + 1); setPontos(p => Math.max(0, p - 50)); falar(FALAS_ROSANA.semProva.pt, 'rosana', 'pt-BR'); return; }
    audioService.playFanfare(); setPontos(p => p + (errosConclusao ? 60 : 150)); setDesfecho(true);
    const d = DESFECHO[caso];
    falar(d.en, d.quem === 'rosana' ? 'rosana' : PESSOAS[d.quem].voz);
  };

  // ---------- Mural ----------
  const tocarDireita = (i: number) => {
    if (regraEsq === null || regrasFeitas.includes(i)) return;
    if (i === regraEsq) {
      audioService.playCorrect(); setPontos(p => p + 20);
      const feitas = [...regrasFeitas, i]; setRegrasFeitas(feitas); setRegraEsq(null);
      if (feitas.length === REGRAS_MURAL.length) {
        window.setTimeout(() => {
          setEtapa('fim'); audioService.playVictory(); confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        }, 900);
      }
    } else { audioService.playWrong(); setErrouRegra(i); window.setTimeout(() => setErrouRegra(null), 600); }
  };

  // Guarda a melhor pontuação do aluno nesta missão.
  useEffect(() => {
    if (etapa !== 'fim') return;
    try { const k = chaveMelhor(currentPlayer?.id); if (pontos > Number(localStorage.getItem(k) ?? -1)) localStorage.setItem(k, String(pontos)); } catch { /* segue */ }
  }, [etapa]); // eslint-disable-line react-hooks/exhaustive-deps

  const reiniciar = () => {
    setCaso(c => embaralhar<Caso>(['ze', 'mane', 'vento'].filter(x => x !== c) as Caso[])[0]);
    setEtapa('pistas'); setPontos(0); setAchadas([]); setAberta(null); setQuem(null); setConversas({ ze: [], mane: [], bia: [] });
    setOrdem([]); setErrosLinha(null); setTentativasLinha(0); setErrosConclusao(0); setDesfecho(false); setRegraEsq(null); setRegrasFeitas([]);
  };
  const maximo = PISTAS.length * 10 + 6 * 20 + 100 + 150 + REGRAS_MURAL.length * 20;
  const estrelas = pontos >= maximo * 0.85 ? 3 : pontos >= maximo * 0.6 ? 2 : 1;
  const passo = ETAPAS.findIndex(e => e.id === etapa);

  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col">
      <Cenario nome="sala" escurecer={0.3} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={3} />
        <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-3 short:py-1 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="kit-placa px-5 py-1 font-display text-lg short:text-base">Missão 2.0 · O mistério do mural</span>
            <div className="flex items-center gap-2 flex-wrap">
              <ol className="flex gap-1" aria-label="Etapas da missão">
                {ETAPAS.map((e, i) => <li key={e.id} className={`kit-ficha !text-[11px] ${i < passo || etapa === 'fim' ? 'kit-ficha--verde' : i === passo ? 'kit-ficha--sol' : ''}`} aria-current={i === passo ? 'step' : undefined}>{i + 1}. {e.nome}</li>)}
              </ol>
              <span className="kit-ficha kit-ficha--azul">{pontos} pts</span>
              <BotaoJogo cor="papel" tamanho="sm" onClick={() => { audioService.playClick(); navigate('/nivel3'); }}>Sair</BotaoJogo>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <img src="/assets/rosana.png" alt="Professora Rosana" className="h-24 short:h-14 w-auto object-contain drop-shadow hidden sm:block" />
            <BalaoFala key={etapa + (errosConclusao && !desfecho ? 'x' : '')} texto={fala.pt} traducao={fala.en} personagem="rosana" className="!max-w-2xl" />
          </div>

          {etapa === 'abertura' && (
            <Painel tipo="papel" liso className="p-5 short:p-3 flex flex-col items-center gap-3 text-center animate-rise-in">
              <p className="font-display text-3xl short:text-xl text-nisia-azul-700">Quem rasgou o mural “Class rules”?</p>
              <p className="max-w-xl text-sm sm:text-base">Você vai investigar a sala, conversar em inglês com os colegas, organizar os fatos e descobrir o que aconteceu. Atenção: <b>acusar sem prova tira pontos</b>. Cada vez que jogar, o caso pode ser outro.</p>
              <div className="flex gap-3">{(Object.keys(PESSOAS) as Suspeito[]).map(s => <figure key={s} className="flex flex-col items-center"><img src={PESSOAS[s].img} alt="" className="h-20 w-auto object-contain" /><figcaption className="text-xs font-display">{PESSOAS[s].nome}</figcaption></figure>)}</div>
              <BotaoJogo cor="laranja" onClick={() => ir('pistas')} autoFocus><Icone nome="lupa" className="w-5 h-5" cor="currentColor" /> Começar a investigação</BotaoJogo>
            </Painel>
          )}

          {etapa === 'pistas' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_17rem] gap-2">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border-[4px] border-nisia-madeira-escura">
                <img src="/assets/espacos/sala.webp" alt="Sala de aula com o mural rasgado" className="absolute inset-0 w-full h-full object-cover" />
                {/* O cartaz "Class rules" rasgado: metade arrancada e um pedaço caído no chão */}
                <div aria-hidden="true" className="absolute bg-nisia-cortica" style={{ left: '79.2%', top: '41%', width: '3.6%', height: '20%', transform: 'skewY(-14deg)', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 30% 82%, 0 64%, 35% 47%, 4% 30%, 28% 14%)' }} />
                <div aria-hidden="true" className="absolute bg-nisia-papel shadow-md" style={{ left: '76%', top: '86%', width: '6%', height: '7%', transform: 'rotate(-18deg)', clipPath: 'polygon(0 10%, 85% 0, 100% 45%, 78% 100%, 12% 88%, 22% 52%)' }} />
                {PISTAS.map(p => {
                  const vista = achadas.includes(p.id);
                  return (
                    <button key={p.id} type="button" onClick={() => abrirPista(p.id)} aria-label={`Pista: ${p.nome}${vista ? ' (já vista)' : ''}`}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 text-2xl sm:text-3xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${vista ? 'bg-nisia-verde-100 border-nisia-verde-500' : 'bg-nisia-sol-300 border-white animate-pulse'}`}
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}>{p.icone}</button>
                  );
                })}
                {pista && (
                  <div className="absolute inset-x-3 bottom-3 sm:inset-x-auto sm:right-3 sm:w-96 kit-papel rounded-xl p-3 shadow-xl animate-balao-in" role="dialog" aria-label={pista.nome}>
                    <p className="font-display text-nisia-azul-700">{pista.icone} {pista.nome}</p>
                    <p className="font-semibold mt-1">{pista.en}</p>
                    {verPt ? <p className="text-sm text-nisia-tinta-suave mt-1">{pista.pt}</p> : <button type="button" className="text-xs underline mt-1" onClick={() => setVerPt(true)}>Ver em português</button>}
                    <div className="flex justify-end mt-2"><BotaoJogo cor="papel" tamanho="sm" onClick={() => setAberta(null)}>Fechar</BotaoJogo></div>
                  </div>
                )}
              </div>
              <Painel tipo="mural" className="p-3 flex flex-col gap-2">
                <p className="font-display text-nisia-papel">Caderno de pistas · {achadas.length}/{PISTAS.length}</p>
                <ul className="flex flex-col gap-1 text-sm">
                  {PISTAS.filter(p => achadas.includes(p.id)).map(p => <li key={p.id} className="kit-papel rounded-lg px-2 py-1">{p.icone} {p.en}</li>)}
                </ul>
                <BotaoJogo cor="laranja" className="mt-auto" disabled={achadas.length < PISTAS.length} onClick={() => ir('conversa')}>Conversar com os colegas <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
              </Painel>
            </div>
          )}

          {etapa === 'conversa' && (
            <Painel tipo="mural" className="p-3 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(PESSOAS) as Suspeito[]).map(s => {
                  const ok = conversas[s].some(x => x.ok && x.p === PERGUNTAS[1].en);
                  return (
                    <button key={s} type="button" onClick={() => { audioService.playClick(); setQuem(s); }} aria-pressed={quem === s}
                      className={`kit-papel rounded-xl p-2 flex flex-col items-center border-4 ${quem === s ? 'border-nisia-sol-500' : 'border-transparent'}`}>
                      <img src={PESSOAS[s].img} alt="" className="h-20 short:h-12 w-auto object-contain" />
                      <span className="font-display text-sm">{PESSOAS[s].nome} {ok ? '✓' : ''}</span>
                    </button>
                  );
                })}
              </div>
              {quem && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-nisia-papel font-display text-sm">Pergunte a {PESSOAS[quem].nome}:</p>
                    {PERGUNTAS.map(q => <button key={q.id} type="button" onClick={() => perguntar(quem, q.id)} className="kit-papel kit-papel--liso rounded-xl px-3 py-2 text-left font-semibold hover:-translate-y-0.5 transition-transform">“{q.en}” <span className="block text-xs text-nisia-tinta-suave font-normal">{q.pt}</span></button>)}
                  </div>
                  <div className="kit-papel rounded-xl p-2 flex flex-col gap-1.5 max-h-64 overflow-y-auto" aria-live="polite">
                    {conversas[quem].length === 0 && <p className="text-sm text-nisia-tinta-suave">Escolha uma pergunta.</p>}
                    {conversas[quem].map((c, i) => (
                      <div key={i} className="text-sm">
                        <p className="font-semibold text-nisia-azul-700">Você: {c.p}</p>
                        <p className={c.ok ? '' : 'text-nisia-erro'}>{PESSOAS[quem].nome}: {c.r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <p className="text-xs text-nisia-papel">Para seguir, pergunte a cada um o que viu (“Could you tell me what you saw, please?”).</p>
                <BotaoJogo cor="laranja" disabled={!conversaPronta} onClick={() => ir('linha')}>Montar a linha do tempo <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
              </div>
            </Painel>
          )}

          {etapa === 'linha' && (
            <Painel tipo="mural" className="p-3 flex flex-col gap-3">
              <ol className="grid grid-cols-1 sm:grid-cols-4 gap-2" aria-label="Linha do tempo">
                {[0, 1, 2, 3].map(i => (
                  <li key={i} className={`kit-papel rounded-xl p-2 min-h-[5rem] flex flex-col border-4 ${errosLinha?.includes(i) ? 'border-nisia-erro' : 'border-transparent'}`}>
                    <span className="kit-ficha kit-ficha--azul self-start !text-[11px]">{i + 1}º</span>
                    {ordem[i] ? <button type="button" className="text-sm font-semibold text-left mt-1" onClick={() => tocarCarta(ordem[i])}>{ordem[i]}</button> : <span className="text-xs text-nisia-tinta-suave mt-1">Toque num fato abaixo</span>}
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-2">
                {cartasLinha.filter(t => !ordem.includes(t)).map(t => <button key={t} type="button" onClick={() => tocarCarta(t)} className="kit-papel kit-papel--liso rounded-xl px-3 py-2 text-sm font-semibold hover:-translate-y-0.5 transition-transform">{t}</button>)}
              </div>
              <div className="flex justify-end gap-2">
                {errosLinha && <p className="text-sm text-nisia-papel font-semibold mr-auto">Os fatos em vermelho estão fora de lugar. Use as pistas e as conversas.</p>}
                <BotaoJogo cor="papel" tamanho="sm" onClick={() => { setOrdem([]); setErrosLinha(null); }}>Limpar</BotaoJogo>
                <BotaoJogo cor="laranja" disabled={ordem.length < 4} onClick={conferirLinha}>Conferir</BotaoJogo>
              </div>
            </Painel>
          )}

          {etapa === 'conclusao' && (
            <Painel tipo="mural" className="p-3 flex flex-col gap-2">
              {conclusoes.map(c => (
                <button key={c.caso} type="button" disabled={desfecho} onClick={() => concluir(c.caso)}
                  className={`kit-papel kit-papel--liso rounded-xl px-4 py-3 text-left font-semibold ${desfecho && c.caso === caso ? '!bg-nisia-verde-100 border-4 border-nisia-verde-500' : 'hover:-translate-y-0.5 transition-transform'}`}>
                  {c.en}<span className="block text-xs font-normal text-nisia-tinta-suave">{c.pt}</span>
                </button>
              ))}
              {desfecho && (() => {
                const d = DESFECHO[caso];
                return (
                  <div className="flex items-end gap-2 animate-rise-in">
                    <img src={d.quem === 'rosana' ? '/assets/rosana.png' : PESSOAS[d.quem].img} alt="" className="h-20 w-auto object-contain" />
                    <p className="kit-balao !px-3 !py-2 font-semibold">{d.en}<span className="block text-xs font-normal text-nisia-tinta-suave">{d.pt}</span></p>
                    <BotaoJogo cor="laranja" className="ml-auto" onClick={() => ir('mural')}>Consertar o mural <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
                  </div>
                );
              })()}
            </Painel>
          )}

          {etapa === 'mural' && (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3">
              <Painel tipo="mural" className="p-3 flex flex-col gap-2">
                <p className="font-display text-nisia-papel text-sm">Toque o começo e depois o final de cada regra.</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-2">{REGRAS_MURAL.map(([a], i) => <button key={a} type="button" disabled={regrasFeitas.includes(i)} onClick={() => { audioService.playTick(); setRegraEsq(i); }} className={`kit-papel kit-papel--liso rounded-xl px-3 py-2 text-sm font-semibold border-4 ${regraEsq === i ? 'border-nisia-sol-500' : 'border-transparent'} ${regrasFeitas.includes(i) ? 'opacity-40' : ''}`}>{a}…</button>)}</div>
                  <div className="flex flex-col gap-2">{metadesDir.map(i => <button key={i} type="button" disabled={regrasFeitas.includes(i)} onClick={() => tocarDireita(i)} className={`kit-papel kit-papel--liso rounded-xl px-3 py-2 text-sm font-semibold border-4 ${errouRegra === i ? 'border-nisia-erro' : 'border-transparent'} ${regrasFeitas.includes(i) ? 'opacity-40' : ''}`}>…{REGRAS_MURAL[i][1]}</button>)}</div>
                </div>
              </Painel>
              <div className="rounded-xl bg-nisia-cortica border-[6px] border-nisia-madeira-escura p-4 flex items-center justify-center">
                <div className="bg-nisia-papel w-full max-w-sm rounded-md shadow-xl -rotate-1">
                  <p className="bg-nisia-azul-500 text-white font-display text-2xl text-center py-2 rounded-t-md">CLASS RULES</p>
                  <ol className="p-3 flex flex-col gap-1.5 min-h-[12rem]">
                    {regrasFeitas.map((i, k) => <li key={i} className="font-semibold animate-rise-in">{k + 1}. {REGRAS_MURAL[i][0]} {REGRAS_MURAL[i][1]}</li>)}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {etapa === 'fim' && (
            <Painel tipo="papel" liso className="p-5 short:p-3 flex flex-col items-center gap-2 text-center animate-rise-in" role="status">
              <p className="font-display text-3xl short:text-xl text-nisia-azul-700">Mistério resolvido!</p>
              <Estrelas n={estrelas} />
              <p className="font-display text-xl">{pontos} pontos</p>
              <p className="text-sm max-w-lg">Na próxima vez, o caso pode ser outro: as pistas e as conversas mudam.</p>
              <div className="flex gap-3 flex-wrap justify-center mt-1">
                <BotaoJogo cor="papel" onClick={reiniciar}>Investigar outro caso</BotaoJogo>
                <BotaoJogo cor="laranja" onClick={() => { audioService.playClick(); navigate('/nivel3'); }}>Voltar às salas <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>
              </div>
            </Painel>
          )}
        </main>
      </div>
    </div>
  );
};
export default MisterioMural;
