import React, { useEffect, useState } from 'react';
import { baixarNivel, carregarPacotes, nivelGuardado, type Progresso } from '../../services/pacotes';
import { ULTIMO_NIVEL_PACOTE } from '../../config/pacotesNiveis';

// Envolve as telas de um nível: na primeira vez, guarda o pacote do nível no aparelho (com um aviso discreto de
// progresso, sem travar o jogo) e, quando termina, adianta o próximo nível em segundo plano.
export const PacoteNivel: React.FC<{ nivel: number; children: React.ReactNode }> = ({ nivel, children }) => {
  const [prog, setProg] = useState<Progresso | null>(null);
  const [fim, setFim] = useState(false);
  useEffect(() => {
    let vivo = true;
    let esconder = 0;
    (async () => {
      const pac = await carregarPacotes();
      if (!pac || !vivo) return;
      const jaTinha = nivelGuardado(nivel, pac.versao);
      const ok = await baixarNivel(nivel, p => { if (vivo && !jaTinha) setProg(p); });
      if (!vivo) return;
      if (ok && !jaTinha) { setFim(true); esconder = window.setTimeout(() => vivo && setProg(null), 2500); }
      // Adianta o próximo nível quando o aparelho estiver livre.
      if (ok && nivel < ULTIMO_NIVEL_PACOTE) {
        const adiantar = () => { void baixarNivel(nivel + 1); };
        const w = window as Window & { requestIdleCallback?: (f: () => void) => void };
        if (w.requestIdleCallback) w.requestIdleCallback(adiantar); else window.setTimeout(adiantar, 4000);
      }
    })();
    return () => { vivo = false; window.clearTimeout(esconder); };
  }, [nivel]);

  const pct = prog ? Math.round((prog.feitos / Math.max(1, prog.total)) * 100) : 0;
  return (
    <>
      {children}
      {prog && (
        <div className="fixed right-2 bottom-2 z-[60] pointer-events-none" role="status" aria-live="polite">
          <div className="rounded-xl bg-nisia-tinta/90 text-white px-3 py-2 shadow-lg w-56">
            <p className="text-xs font-semibold">{fim ? `✓ Nível ${nivel} guardado no aparelho` : `Guardando o Nível ${nivel} no aparelho… ${pct}%`}</p>
            <div className="mt-1 h-1.5 rounded-full bg-white/20 overflow-hidden"><div className="h-full bg-nisia-sol-400 transition-all" style={{ width: `${fim ? 100 : pct}%` }} /></div>
          </div>
        </div>
      )}
    </>
  );
};
