import React, { useState } from 'react';
import type { DadosJogo } from '../../data/jogosFases';
import type { ItemRodada } from '../../data/rodadasFases';
import { RodadaAtividade, type ResultadoRodada } from '../levels/RodadaAtividade';
import { ResumoJogo, type FimDeJogo } from './comum';
import { ParesJogo } from './ParesJogo';
import { MemoriaJogo } from './MemoriaJogo';
import { FraseJogo } from './FraseJogo';
import { OrdemJogo } from './OrdemJogo';
import { ChuvaJogo } from './ChuvaJogo';
import { TravessiaJogo } from './TravessiaJogo';
import { CorridaJogo } from './CorridaJogo';
import { SalaJogo } from './SalaJogo';

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

  if (dados.tipo === 'rodada') {
    return <RodadaAtividade nivel={nivel} nome={nome} itens={itens} cronometro={cronometro} onConcluir={onConcluir} onVoltar={onVoltar} />;
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
