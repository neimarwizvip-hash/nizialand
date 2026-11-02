import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getMissionMapState } from '../../data/missionMap';
import { intervaloPorId } from '../intervalo/intervalos';
import { FLASHCARDS_DE_TESTE, QUIZ_DE_TESTE, nivelDaRota, proximoPasso } from '../../services/avancar';

// AVANÇAR (modo de teste do professor, só no `npm run dev`): cada clique conclui a próxima atividade do nível
// e, no fim do nível, abre o próximo. Liga a vistoria antes (resultados só na memória; nada vai para a planilha).
// Atalho: Alt + → .
const ESCONDER = /^\/($|register|vistoria|admin|leaderboard|orientation)/;

export const BotaoAvancar: React.FC = () => {
  const { vistoria, setVistoriaMode, activityResults, quizResult, flashcardResult, saveActivityResult, saveQuizResult, saveFlashcardResult } = useGame();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [msg, setMsg] = useState<string | null>(null);
  const relogio = useRef(0);
  const mostrar = (texto: string) => { setMsg(texto); window.clearTimeout(relogio.current); relogio.current = window.setTimeout(() => setMsg(null), 3200); };

  const avancar = () => {
    if (!vistoria) { setVistoriaMode(true); mostrar('Modo de teste ligado: tudo liberado e nada é salvo. Clique de novo para avançar.'); return; }
    const intervalo = pathname.match(/^\/intervalo\/([^/]+)/);
    if (intervalo) { const i = intervaloPorId(intervalo[1]); navigate(i?.quadro ?? '/mapa'); mostrar('Intervalo pulado.'); return; }
    let nivel = nivelDaRota(pathname);
    if (nivel === null) {
      // No mapa (ou outra tela): vai para o primeiro nível ainda não concluído.
      const estado = getMissionMapState(activityResults, quizResult, flashcardResult);
      const alvo = estado.find(l => !l.completed && l.number <= 8) ?? estado[8];
      navigate(alvo.path); mostrar(`Indo para o Nível ${alvo.number}.`); return;
    }
    const agora = new Date().toISOString();
    const passo = proximoPasso(nivel, activityResults, quizResult, flashcardResult, agora);
    if (passo.tipo === 'quiz') { void saveQuizResult(QUIZ_DE_TESTE(agora)); mostrar('Nível 0: quiz concluído (1 de 2).'); return; }
    if (passo.tipo === 'flashcards') { void saveFlashcardResult(FLASHCARDS_DE_TESTE(agora)); mostrar('Nível 0 concluído. Próximo clique abre o Nível 1.'); return; }
    if (passo.tipo === 'atividade') {
      saveActivityResult(passo.resultado);
      mostrar(`Nível ${passo.nivel}: “${passo.nome}” concluída (${passo.feitas} de ${passo.total}).${passo.ultima ? ' Próximo clique abre o próximo nível.' : ''}`);
      // Volta ao quadro do nível para ver o fluxo real (convites de intervalo, progresso).
      if (search) navigate(pathname);
      return;
    }
    if (passo.tipo === 'proximo-nivel') { navigate(passo.caminho); mostrar(`Nível ${passo.nivel} aberto.`); return; }
    nivel = passo.nivel;
    mostrar(`Nível ${nivel} concluído. O Nível 9 só é lançado quando mais de 100 alunos concluírem o Nível 8.`);
  };

  const ref = useRef(avancar); ref.current = avancar;
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); ref.current(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  if (ESCONDER.test(pathname)) return null;
  return (
    <div className="fixed left-2 bottom-2 z-[2147483000] flex items-end gap-2 pointer-events-none">
      <button type="button" onClick={avancar} title="Avançar (modo de teste) — Alt + →"
        className="pointer-events-auto rounded-full bg-nisia-erro text-white font-display text-sm px-4 py-2 shadow-lg border-2 border-white hover:brightness-110 active:scale-95">
        ⏭ Avançar (teste)
      </button>
      {msg && <p role="status" className="pointer-events-none max-w-[min(80vw,420px)] rounded-xl bg-nisia-tinta/90 text-white text-xs sm:text-sm font-semibold px-3 py-2 shadow-lg">{msg}</p>}
    </div>
  );
};
export default BotaoAvancar;
