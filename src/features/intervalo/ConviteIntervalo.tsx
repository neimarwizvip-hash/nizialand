import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { BotaoJogo, Icone, Painel, ANFITRIOES } from '../../components/kit';
import { audioService } from '../../services/audio';
import { narrar, trechosDaFala } from '../../services/narracao';
import { INTERVALOS, type Intervalo } from './intervalos';

// Convite surpresa para o jogo de intervalo: aparece no quadro do nível logo depois que o aluno conclui
// a atividade combinada. Uma vez por aluno; depois fica disponível pela vistoria e pelo próprio quadro.

const chaveVisto = (id: string, jogador: string) => `nisialand_intervalo_${id}_${jogador}`;
export const intervaloJaVisto = (id: string, jogador?: string) => {
  try { return !!jogador && localStorage.getItem(chaveVisto(id, jogador)) === '1'; } catch { return true; }
};
const marcarVisto = (id: string, jogador: string) => { try { localStorage.setItem(chaveVisto(id, jogador), '1'); } catch { /* segue */ } };

export const ConviteIntervalo: React.FC = () => {
  const { currentPlayer, activityResults, vistoria } = useGame();
  const location = useLocation();
  const navigate = useNavigate();
  const [fechado, setFechado] = useState<string | null>(null);
  const jogador = currentPlayer?.id;

  const pendente: Intervalo | undefined = useMemo(() => {
    if (!jogador || vistoria) return undefined;
    if (new URLSearchParams(location.search).has('atividade')) return undefined;
    return INTERVALOS.find(i => {
      if (!location.pathname.startsWith(`/nivel${i.nivel}`) || location.pathname.includes('mundo3d')) return false;
      if (intervaloJaVisto(i.id, jogador) || fechado === i.id) return false;
      const feitas = Object.values(activityResults).filter(r => r.completed && r.activityId.startsWith(i.prefixo)).length;
      return feitas >= i.apos;
    });
  }, [jogador, vistoria, location.pathname, location.search, activityResults, fechado]);

  useEffect(() => {
    if (!pendente || !audioService.isSoundOn()) return undefined;
    return narrar(trechosDaFala('mane', pendente.chamada));
  }, [pendente]);

  if (!pendente || !jogador) return null;
  const decidir = (jogar: boolean) => {
    audioService.playClick();
    marcarVisto(pendente.id, jogador);
    setFechado(pendente.id);
    if (jogar) navigate(`/intervalo/${pendente.id}`, { state: { voltar: location.pathname + location.search } });
  };
  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-nisia-azul-900/70 p-4" role="dialog" aria-modal="true" aria-label={`Intervalo: ${pendente.titulo}`}>
      <Painel tipo="papel" fita className="max-w-lg w-full p-5 pt-6 short:p-3 flex items-center gap-4 animate-balao-in">
        <img src={ANFITRIOES.mane.src} alt="Mané Zoeira" className="h-40 short:h-24 w-auto shrink-0 hidden xs:block sm:block" />
        <div className="flex flex-col gap-2 min-w-0">
          <span className="kit-ficha kit-ficha--sol self-start">Intervalo surpresa!</span>
          <p className="font-display text-2xl short:text-lg text-nisia-azul-700 leading-tight">{pendente.titulo}</p>
          <p className="text-sm sm:text-base short:text-xs leading-snug">{pendente.chamada}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <BotaoJogo cor="laranja" onClick={() => decidir(true)} autoFocus><Icone nome="controle" className="w-5 h-5" cor="currentColor" /> Jogar agora</BotaoJogo>
            <BotaoJogo cor="papel" tamanho="sm" onClick={() => decidir(false)}>Depois</BotaoJogo>
          </div>
        </div>
      </Painel>
    </div>
  );
};
