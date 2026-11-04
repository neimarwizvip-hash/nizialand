// TESTE DO 8º ANO — Comparativos (igualdade, superioridade, inferioridade).
// 15 minutos por acesso, um acesso por dia, perguntas sorteadas a cada vez. Ao fim do tempo trava e manda o resultado.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';
import { getPlayerGrade } from '../../services/grade';
import { BotaoJogo, Cenario, Ficha, Painel, Titulo } from '../../components/kit';
import {
  ACERTOS_POR_FASE, alunoAutorizado, FASES, gerarPergunta, janela, pontosDaFase, respostaCerta,
  TESTE8_FIM, TESTE8_INICIO, type Pergunta,
} from '../../data/teste8';
import { acabou, enviarAcesso, gravarAcesso, lerAcesso, novoAcesso, tempoRestante, type AcessoTeste8 } from './registroTeste8';

const relogio = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
const dataHora = (iso: string) => new Date(iso).toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

type Retorno = { certo: boolean; texto: string; regra: string } | null;

const Teste8Screen: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlayer, logout } = useGame();
  const [agora, setAgora] = useState(() => Date.now());
  const [acesso, setAcesso] = useState<AcessoTeste8 | null>(() => (currentPlayer ? lerAcesso(currentPlayer.id) : null));
  const [pergunta, setPergunta] = useState<Pergunta | null>(null);
  const [retorno, setRetorno] = useState<Retorno>(null);
  const [montagem, setMontagem] = useState<number[]>([]);
  const [subiuFase, setSubiuFase] = useState<number | null>(null);
  const enviadoFim = useRef(false);
  const caixaRetorno = useRef<HTMLDivElement>(null);
  useEffect(() => { if (retorno) caixaRetorno.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [retorno]);

  const visitante = !currentPlayer || currentPlayer.kind === 'guest';
  const autorizado = !!currentPlayer && alunoAutorizado([currentPlayer.name, currentPlayer.displayName], getPlayerGrade(currentPlayer));
  const estadoJanela = janela(agora);
  const emAndamento = !!acesso && !acabou(acesso, agora);
  const terminado = !!acesso && acabou(acesso, agora);

  // relógio
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const salvar = useCallback((a: AcessoTeste8, enviar = false) => {
    if (!currentPlayer) return;
    gravarAcesso(currentPlayer.id, a);
    setAcesso(a);
    if (enviar) enviarAcesso(currentPlayer.id, a);
  }, [currentPlayer]);

  // tempo acabou: trava e registra (uma vez)
  useEffect(() => {
    if (!acesso || !currentPlayer || enviadoFim.current) return;
    if (acabou(acesso, agora)) {
      enviadoFim.current = true;
      const final = acesso.fim ? acesso : { ...acesso, fim: Math.min(agora, acesso.inicio + 15 * 60 * 1000) };
      salvar(final, true);
      setPergunta(null);
      audioService.playFanfare();
    }
  }, [acesso, agora, currentPlayer, salvar]);

  // primeira pergunta ao retomar
  useEffect(() => {
    if (emAndamento && !pergunta && acesso) setPergunta(gerarPergunta(acesso.fase));
  }, [emAndamento, pergunta, acesso]);

  const comecar = () => {
    audioService.playClick();
    const a = novoAcesso();
    enviadoFim.current = false;
    salvar(a, true); // a planilha já registra que o acesso começou
    setPergunta(gerarPergunta(1));
  };

  const responder = (resposta: string | boolean | string[]) => {
    if (!acesso || !pergunta || retorno || !emAndamento) return;
    const certo = respostaCerta(pergunta, resposta);
    const correta =
      pergunta.tipo === 'certoErrado' ? (pergunta.certo ? 'A frase está CERTA.' : `Errada. O certo é: ${pergunta.correcao}`)
      : pergunta.tipo === 'montar' ? pergunta.resposta.join(' ') + '.'
      : pergunta.frase.replace('___', pergunta.certa);
    let a: AcessoTeste8;
    let subiu: number | null = null;
    if (certo) {
      audioService.playCorrect();
      const sequencia = acesso.sequencia + 1;
      const ganho = pontosDaFase(acesso.fase) + (sequencia >= 3 ? 5 : 0);
      let fase = acesso.fase;
      let acertosNaFase = acesso.acertosNaFase + 1;
      if (acertosNaFase >= ACERTOS_POR_FASE && fase < 6) { fase += 1; acertosNaFase = 0; subiu = fase; }
      a = { ...acesso, pontos: acesso.pontos + ganho, acertos: acesso.acertos + 1, sequencia, fase, acertosNaFase };
    } else {
      audioService.playWrong();
      a = { ...acesso, erros: acesso.erros + 1, sequencia: 0 };
    }
    salvar(a, subiu !== null); // a cada fase nova, o resultado parcial já vai para a planilha
    setRetorno({ certo, texto: correta, regra: pergunta.regra });
    if (subiu) setSubiuFase(subiu);
  };

  const proxima = () => {
    if (!acesso) return;
    audioService.playClick();
    setRetorno(null);
    setMontagem([]);
    setSubiuFase(null);
    setPergunta(gerarPergunta(acesso.fase));
  };

  const faseAtual = FASES[Math.min(acesso?.fase ?? 1, 6) - 1];
  const restante = acesso ? tempoRestante(acesso, agora) : 15 * 60 * 1000;
  const pouco = restante < 60_000;

  // ---------- telas de aviso
  const aviso = (titulo: string, texto: React.ReactNode, extra?: React.ReactNode) => (
    <Moldura>
      <Painel tipo="papel" className="w-full max-w-xl mx-auto p-5 sm:p-7 flex flex-col gap-4 text-center">
        <Titulo nivel={1} className="text-2xl sm:text-3xl">{titulo}</Titulo>
        <div className="text-base sm:text-lg text-nisia-tinta leading-snug">{texto}</div>
        {extra}
        <BotaoJogo cor="papel" onClick={() => navigate('/mapa')} className="self-center">Voltar ao mapa</BotaoJogo>
      </Painel>
    </Moldura>
  );

  if (visitante) return aviso('Teste do 8º ano', 'Entre com o seu código de aluno para fazer o teste. Visitante não pontua.');
  if (!autorizado)
    return aviso('Teste do 8º ano', <>Este teste é da <b>turma 805</b>. O cadastro precisa ter <b>primeiro nome e sobrenome</b> como na chamada (você entrou como “{currentPlayer?.name}”). Faça um novo cadastro com nome e sobrenome: ele passa a ser o seu perfil oficial.</>,
      <BotaoJogo cor="laranja" onClick={() => { logout(); navigate('/'); }} className="self-center">Fazer novo cadastro</BotaoJogo>);
  if (estadoJanela === 'antes' && !acesso) return aviso('Teste do 8º ano', <>O teste abre <b>{dataHora(TESTE8_INICIO)}</b>. Volte nesse horário!</>);
  if (estadoJanela === 'encerrado' && !emAndamento) return aviso('Teste encerrado', <>O teste terminou {dataHora(TESTE8_FIM)}. Os seus pontos estão com o professor.</>);

  // ---------- acesso de hoje já feito
  if (terminado && acesso) {
    return aviso('Acesso de hoje concluído', (
      <div className="flex flex-col gap-3">
        <p>Tempo encerrado. O seu resultado foi registrado.</p>
        <div className="grid grid-cols-3 gap-2">
          <Numero rotulo="pontos" valor={acesso.pontos} />
          <Numero rotulo="acertos" valor={acesso.acertos} />
          <Numero rotulo="fase" valor={Math.min(acesso.fase, 6)} />
        </div>
        <p className="text-sm">Amanhã tem um acesso novo, com outras frases. Os pontos de cada dia somam até {dataHora(TESTE8_FIM)}.</p>
      </div>
    ));
  }

  // ---------- começo
  if (!acesso) {
    return (
      <Moldura>
        <Painel tipo="lousa" className="w-full max-w-2xl mx-auto p-5 sm:p-7 flex flex-col gap-4 text-white">
          <Titulo nivel={1} className="text-3xl sm:text-4xl !text-white">Teste: Comparatives</Titulo>
          <p className="text-base sm:text-lg leading-snug">Igualdade (<b>as tall as</b>), superioridade (<b>taller than</b>, <b>more expensive than</b>) e inferioridade (<b>less expensive than</b>, <b>not as tall as</b>).</p>
          <ul className="text-sm sm:text-base leading-snug list-disc pl-5 flex flex-col gap-1">
            <li><b>15 minutos</b> a partir do começo. Quando o tempo acaba, o teste trava e o resultado vai para o professor.</li>
            <li><b>Um acesso por dia</b>. Cada dia sorteia frases e opções novas. Os pontos dos dias somam.</li>
            <li>Toda pergunta traz <b>dados</b> (altura, preço, velocidade…): a resposta tem que estar certa na gramática <b>e</b> combinar com os dados.</li>
            <li>Acerte {ACERTOS_POR_FASE} para subir de fase. Fases mais altas valem mais pontos. 3 acertos seguidos: +5.</li>
            <li>Se fechar a página, o relógio continua: volte logo para não perder tempo.</li>
          </ul>
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            {FASES.map(f => <span key={f.numero} className="px-2 py-1 rounded-full bg-white/15">{f.numero}. {f.titulo}</span>)}
          </div>
          <BotaoJogo cor="sol" tamanho="lg" onClick={comecar} className="self-center mt-1">Começar (15:00)</BotaoJogo>
        </Painel>
      </Moldura>
    );
  }

  // ---------- jogando
  return (
    <Moldura>
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-3 short:gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2" role="status" aria-live="polite">
          <Ficha cor="papel">Fase {faseAtual.numero}: {faseAtual.titulo}</Ficha>
          <div className="flex items-center gap-2">
            <Ficha cor="papel">{acesso.pontos} pts</Ficha>
            <span className={`font-display text-xl sm:text-2xl px-3 py-1 rounded-xl border-2 ${pouco ? 'bg-red-600 border-red-800 text-white animate-pulse' : 'bg-nisia-papel border-nisia-papel-linha text-nisia-tinta'}`} aria-label={`Tempo restante ${relogio(restante)}`}>
              ⏱ {relogio(restante)}
            </span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-white/40 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-nisia-verde-500 transition-all" style={{ width: `${faseAtual.numero >= 6 ? 100 : (acesso.acertosNaFase / ACERTOS_POR_FASE) * 100}%` }} />
        </div>

        <Painel tipo="papel" className="p-4 sm:p-6 short:p-2.5 flex flex-col gap-4 short:gap-2">
          <p className="text-xs sm:text-sm uppercase tracking-wide text-nisia-azul-700 font-bold">{faseAtual.sub}</p>
          {pergunta && <CorpoPergunta pergunta={pergunta} travado={!!retorno} montagem={montagem} setMontagem={setMontagem} responder={responder} />}
          {retorno && (
            <div ref={caixaRetorno} className={`rounded-2xl border-2 p-3 sm:p-4 short:p-2 ${retorno.certo ? 'bg-nisia-verde-100 border-nisia-verde-500' : 'bg-red-50 border-nisia-erro'}`} role="alert">
              <p className={`font-display text-lg ${retorno.certo ? 'text-nisia-verde-700' : 'text-nisia-erro'}`}>{retorno.certo ? 'Correct!' : 'Not quite.'}</p>
              <p className="text-nisia-tinta font-semibold">{retorno.texto}</p>
              <p className="text-sm text-nisia-tinta/80">{retorno.regra}</p>
              {subiuFase && <p className="mt-1 font-display text-nisia-azul-700">⭐ Você subiu para a fase {subiuFase}: {FASES[subiuFase - 1].titulo}!</p>}
              <BotaoJogo cor={retorno.certo ? 'verde' : 'azul'} onClick={proxima} className="mt-3 w-full sm:w-auto">Próxima</BotaoJogo>
            </div>
          )}
        </Painel>
      </div>
    </Moldura>
  );
};

// ---------------------------------------------------------------- peças
const Moldura: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative min-h-[100dvh] text-nisia-tinta">
    <Cenario nome="sala" escurecer={0.35} />
    <main className="relative z-10 min-h-[100dvh] flex items-center px-3 sm:px-5 py-4 short:py-1.5">{children}</main>
  </div>
);

const Numero: React.FC<{ rotulo: string; valor: number }> = ({ rotulo, valor }) => (
  <div className="rounded-xl bg-nisia-papel border-2 border-nisia-papel-linha py-2">
    <div className="font-display text-2xl sm:text-3xl">{valor}</div>
    <div className="text-xs uppercase tracking-wide">{rotulo}</div>
  </div>
);

const botaoOpcao = 'w-full text-left rounded-2xl border-2 px-4 py-3 short:py-1.5 font-display text-base sm:text-lg short:text-base transition-colors disabled:cursor-default';

const CorpoPergunta: React.FC<{
  pergunta: Pergunta; travado: boolean; montagem: number[];
  setMontagem: (m: number[]) => void; responder: (r: string | boolean | string[]) => void;
}> = ({ pergunta: p, travado, montagem, setMontagem, responder }) => {
  const [escolhida, setEscolhida] = useState<string | boolean | null>(null);
  useEffect(() => setEscolhida(null), [p]);
  const marcar = (r: string | boolean) => { if (travado) return; setEscolhida(r); responder(r); };
  const cor = (op: string | boolean, certa: string | boolean) =>
    !travado ? 'bg-white border-nisia-papel-linha hover:border-nisia-azul-500'
    : op === certa ? 'bg-nisia-verde-100 border-nisia-verde-500 text-nisia-verde-700'
    : op === escolhida ? 'bg-red-50 border-nisia-erro text-nisia-erro' : 'bg-white border-nisia-papel-linha opacity-60';

  const cartoes = (
    <div className="grid grid-cols-2 gap-2 sm:gap-3" aria-label="Dados para comparar">
      {p.cartoes.map(c => (
        <div key={c.nome} className="rounded-2xl bg-nisia-azul-500 text-white text-center py-2 sm:py-3 short:py-1 px-2 border-2 border-nisia-azul-700">
          <div className="font-display text-base sm:text-xl short:text-sm leading-tight">{c.nome}</div>
          <div className="text-lg sm:text-2xl short:text-base font-bold leading-tight">{c.valor}</div>
        </div>
      ))}
    </div>
  );

  if (p.tipo === 'escolha') {
    return (
      <div className="flex flex-col gap-3 short:gap-1.5">
        {cartoes}
        <p className="font-display text-xl sm:text-2xl short:text-lg leading-snug">{p.frase.replace('___', '______')}</p>
        <p className="text-sm text-nisia-tinta/80">Use os dados. Adjetivo: <b>{p.dica}</b></p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {p.opcoes.map(op => (
            <button key={op} type="button" disabled={travado} onClick={() => marcar(op)} className={`${botaoOpcao} ${cor(op, p.certa)}`}>{op}</button>
          ))}
        </div>
      </div>
    );
  }

  if (p.tipo === 'certoErrado') {
    return (
      <div className="flex flex-col gap-3 short:gap-1.5">
        {cartoes}
        <p className="text-sm font-bold">Olhe os dados: a frase está certa ou errada? (gramática e informação)</p>
        <p className="font-display text-xl sm:text-2xl short:text-lg leading-snug">“{p.frase}”</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={travado} onClick={() => marcar(true)} className={`${botaoOpcao} text-center ${cor(true, p.certo)}`}>✔ Certa</button>
          <button type="button" disabled={travado} onClick={() => marcar(false)} className={`${botaoOpcao} text-center ${cor(false, p.certo)}`}>✘ Errada</button>
        </div>
      </div>
    );
  }

  // montar a frase
  const usadas = new Set(montagem);
  const frase = montagem.map(i => p.palavras[i]);
  return (
    <div className="flex flex-col gap-3 short:gap-1.5">
      {cartoes}
      <p className="text-sm font-bold">Monte uma frase verdadeira com <i>{p.dica}</i>. Sobra uma palavra intrusa.</p>
      <div className="min-h-[3.25rem] rounded-2xl border-2 border-dashed border-nisia-azul-500 bg-white p-2 flex flex-wrap gap-2" aria-label="Sua frase">
        {frase.length === 0 && <span className="text-nisia-tinta/50 self-center px-1">Toque nas palavras na ordem certa…</span>}
        {montagem.map((i, k) => (
          <button key={`${i}-${k}`} type="button" disabled={travado} onClick={() => setMontagem(montagem.filter((_, j) => j !== k))}
            className="px-3 py-1.5 rounded-xl bg-nisia-azul-500 text-white font-display text-base sm:text-lg">{p.palavras[i]}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {p.palavras.map((w, i) => (
          <button key={i} type="button" disabled={travado || usadas.has(i)} onClick={() => setMontagem([...montagem, i])}
            className={`px-3 py-1.5 rounded-xl border-2 font-display text-base sm:text-lg ${usadas.has(i) ? 'opacity-30 border-nisia-papel-linha' : 'bg-white border-nisia-papel-linha hover:border-nisia-azul-500'}`}>{w}</button>
        ))}
      </div>
      {!travado && (
        <div className="flex gap-2">
          <BotaoJogo cor="papel" onClick={() => setMontagem([])} disabled={montagem.length === 0}>Limpar</BotaoJogo>
          <BotaoJogo cor="laranja" onClick={() => responder(frase)} disabled={frase.length < p.resposta.length}>Conferir</BotaoJogo>
        </div>
      )}
      {travado && <p className="text-sm">Sua frase: “{frase.join(' ')}”</p>}
    </div>
  );
};

export default Teste8Screen;
