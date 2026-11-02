import React, { useState } from 'react';
import type { DadosJogo } from '../../data/jogosFases';
import type { ItemRodada } from '../../data/rodadasFases';
import { RodadaAtividade, type ResultadoRodada } from '../levels/RodadaAtividade';
import { IntroJogo, ResumoJogo, type FimDeJogo } from './comum';
import { COMO_JOGAR } from '../../data/jogosFases';
import { Icone, type NomeIcone } from '../../components/kit';
import { ParesJogo } from './ParesJogo';
import { MemoriaJogo } from './MemoriaJogo';
import { FraseJogo } from './FraseJogo';
import { OrdemJogo } from './OrdemJogo';
import { ChuvaJogo } from './ChuvaJogo';
import { TravessiaJogo } from './TravessiaJogo';
import { CorridaJogo } from './CorridaJogo';
import { SalaJogo } from './SalaJogo';

const ICONE_TIPO: Partial<Record<DadosJogo['tipo'], NomeIcone>> = {
  pares: 'corrente', memoria: 'carta', frase: 'tijolo', ordem: 'calendario', chuva: 'estrela', travessia: 'bussola', corrida: 'trofeu', sala: 'cadeira',
};
// Uma amostra do conteúdo na tela "como jogar" (mostra o que vem sem entregar a resposta).
function exemploDe(d: DadosJogo): React.ReactNode {
  const chip = (t: string, i: number) => <span key={i} className="px-3 py-1 rounded-lg bg-white border-2 border-nisia-azul-400 font-display text-nisia-azul-700">{t}</span>;
  if (d.tipo === 'pares' || d.tipo === 'memoria') return <div className="flex flex-wrap justify-center gap-2 items-center">{chip(d.fases[0][0][0], 0)}<span className="font-display">↔</span>{chip('?', 1)}</div>;
  if (d.tipo === 'frase') return <div className="flex flex-wrap justify-center gap-1.5">{d.fases[0][0].split(' ').slice(0, 4).reverse().map(chip)}</div>;
  if (d.tipo === 'ordem') return <div className="flex flex-wrap justify-center gap-2 items-center">{chip('1', 0)}<span>→</span>{chip('2', 1)}<span>→</span>{chip('3', 2)}</div>;
  return null;
}

// Abre o minijogo de uma atividade (ou a rodada de perguntas, quando o tipo é "rodada") e mostra o resumo no fim.
interface Props {
  nivel: number;
  nome: string;
  dados: DadosJogo;
  itens: ItemRodada[]; // usados pela rodada de perguntas
  cronometro?: number;
  onConcluir: (r: ResultadoRodada) => void;
  onVoltar: () => void;
}

export const JogoAtividade: React.FC<Props> = ({ nivel, nome, dados, itens, cronometro, onConcluir, onVoltar }) => {
  const [tentativa, setTentativa] = useState(0);
  const [fim, setFim] = useState<FimDeJogo | null>(null);
  const [iniciado, setIniciado] = useState(false);

  if (dados.tipo === 'rodada') {
    return <RodadaAtividade nivel={nivel} nome={nome} itens={itens} cronometro={cronometro} onConcluir={onConcluir} onVoltar={onVoltar} />;
  }
  if (!iniciado) {
    const como = COMO_JOGAR[dados.tipo];
    return <IntroJogo nivel={nivel} nome={nome} tipo={como.nome} instrucao={como.instrucao} icone={<Icone nome={ICONE_TIPO[dados.tipo] ?? 'controle'} className="w-11 h-11 short:w-7 short:h-7" cor="#FFD23F" />}
      exemplo={exemploDe(dados)} onComecar={() => setIniciado(true)} onVoltar={onVoltar} />;
  }
  if (fim) {
    return <ResumoJogo nivel={nivel} nome={nome} acertos={fim.acertos} total={fim.total} onDeNovo={() => { setFim(null); setTentativa(t => t + 1); }} onVoltar={onVoltar} />;
  }
  const terminar = (r: FimDeJogo) => {
    setFim(r);
    onConcluir({ acertos: r.acertos, total: r.total, respostas: [] });
  };
  const comum = { nivel, nome, onFim: terminar, onVoltar };
  switch (dados.tipo) {
    case 'pares': return <ParesJogo key={tentativa} {...comum} fases={dados.fases} falarEsquerda={dados.falarEsquerda} />;
    case 'memoria': return <MemoriaJogo key={tentativa} {...comum} fases={dados.fases} />;
    case 'frase': return <FraseJogo key={tentativa} {...comum} fases={dados.fases} />;
    case 'ordem': return <OrdemJogo key={tentativa} {...comum} fases={dados.fases} falar={dados.falar} />;
    case 'chuva': return <ChuvaJogo key={tentativa} {...comum} fases={dados.fases} />;
    case 'travessia': return <TravessiaJogo key={tentativa} {...comum} fases={dados.fases} />;
    case 'corrida': return <CorridaJogo key={tentativa} {...comum} fases={dados.fases} />;
    case 'sala': return <SalaJogo key={tentativa} {...comum} fases={dados.fases} />;
    default: return null;
  }
};
