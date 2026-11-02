import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Cenario, Hud } from '../../components/kit';
import { useGame } from '../../context/GameContext';
import { intervaloPorId } from './intervalos';
import { TiroNasNotas } from './TiroNasNotas';
import { PulaDistracao } from './PulaDistracao';
import { Labirinto3D } from './Labirinto3D';
import { FugaCorredor } from './FugaCorredor';
import { TetrisPalavras } from './TetrisPalavras';
import { MissaoBebedouro } from './MissaoBebedouro';

// Tela do jogo de intervalo. Guarda a melhor nota do aluno em cada intervalo (não conta para concluir o nível).
const chaveMelhor = (id: string, jogador?: string) => `nisialand_intervalo_melhor_${id}_${jogador ?? 'anon'}`;

export const IntervaloScreen: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentPlayer } = useGame();
  const intervalo = intervaloPorId(id);
  const voltar = (location.state as { voltar?: string } | null)?.voltar ?? (intervalo ? `/nivel${intervalo.nivel}` : '/mapa');
  if (!intervalo) return null;
  const sair = () => navigate(voltar);
  const registrar = (nota: number) => {
    try {
      const k = chaveMelhor(intervalo.id, currentPlayer?.id);
      if (nota > Number(localStorage.getItem(k) ?? -1)) localStorage.setItem(k, String(nota));
    } catch { /* segue */ }
  };
  return (
    <div className="relative min-h-screen text-nisia-tinta flex flex-col">
      <Cenario nome="corredor" escurecer={0.35} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Hud nivel={intervalo.nivel} />
        <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-3 short:py-1 flex flex-col">
          <div className="my-auto">
            {intervalo.jogo === 'notas' && <TiroNasNotas dificuldade={intervalo.dificuldade} onFim={r => registrar(r.nota)} onSair={sair} />}
            {intervalo.jogo === 'labirinto' && <Labirinto3D avatar={currentPlayer?.avatar} onFim={r => registrar(r.pontos)} onSair={sair} />}
            {intervalo.jogo === 'bebedouro' && <MissaoBebedouro avatar={currentPlayer?.avatar} onFim={r => registrar(r.pontos)} onSair={sair} />}
            {intervalo.jogo === 'fuga' && <FugaCorredor avatar={currentPlayer?.avatar} onFim={r => registrar(r.pontos)} onSair={sair} />}
            {intervalo.jogo === 'tetris' && <TetrisPalavras dificuldade={intervalo.dificuldade} onFim={r => registrar(r.pontos)} onSair={sair} />}
            {intervalo.jogo === 'pula' && <PulaDistracao dificuldade={intervalo.dificuldade} avatar={currentPlayer?.avatar} onFim={r => registrar(r.pontos)} onSair={sair} />}
          </div>
        </main>
      </div>
    </div>
  );
};
export default IntervaloScreen;
