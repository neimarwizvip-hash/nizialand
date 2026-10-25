import React, { useEffect, useState } from 'react';
import { ArrowRight, FastForward } from 'lucide-react';
import { PROVISIONAL_STORIES, type ProvisionalStoryId } from '../../data/provisionalStories';

const seenKey = (story: ProvisionalStoryId) => `nisialand_story_seen_${story}`;
const wasSeen = (story: ProvisionalStoryId) => {
  try { return sessionStorage.getItem(seenKey(story)) === '1'; } catch { return false; }
};
const markSeen = (story: ProvisionalStoryId) => {
  try { sessionStorage.setItem(seenKey(story), '1'); } catch { /* leitura continua sem armazenamento */ }
};

interface Props { story: ProvisionalStoryId; bypass?: boolean; children: React.ReactNode }

/** HQ textual provisória para as passagens sem vídeo, mostrada uma vez por sessão. */
export const ProvisionalStoryGate: React.FC<Props> = ({ story, bypass = false, children }) => {
  const [step, setStep] = useState(() => bypass || wasSeen(story) ? -1 : 0);
  const script = PROVISIONAL_STORIES[story];
  const finish = () => { markSeen(story); setStep(-1); };
  useEffect(() => { if (bypass) markSeen(story); }, [bypass, story]);
  if (bypass || step < 0) return <>{children}</>;
  const panel = script.panels[step];
  return (
    <main role="dialog" aria-modal="true" aria-label={`HQ provisória: ${script.title}`} className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950 text-white p-3 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl rounded-3xl border-4 border-amber-400 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex flex-wrap justify-between items-center gap-2 p-4 sm:p-5 bg-blue-950">
          <div><p className="text-xs font-black tracking-widest text-amber-300">HISTÓRIA PROVISÓRIA · NÍVEL {story === 'nivel3' ? 3 : 4}</p><h1 className="font-bungee text-xl sm:text-3xl">{script.title}</h1></div>
          <button type="button" onClick={finish} className="rounded-xl border border-white/40 px-3 py-2 font-black text-sm inline-flex items-center gap-2"><FastForward size={18} /> Pular história</button>
        </div>
        <div className="relative min-h-64 sm:min-h-96 flex items-end" style={{ backgroundImage: `linear-gradient(transparent, rgba(15,23,42,.92)), url(${panel.background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="p-5 sm:p-8 max-w-2xl"><p className="text-xs font-black uppercase tracking-widest text-amber-300">Quadro {step + 1} de {script.panels.length} · {panel.scene}</p><p className="mt-3 font-heading font-black text-lg sm:text-2xl">{panel.speaker}: {panel.text}</p></div>
        </div>
        <div className="p-4 sm:p-5 flex justify-between items-center gap-3"><span className="text-xs text-slate-300">Roteiro para revisão pedagógica</span><button type="button" autoFocus onClick={() => step + 1 < script.panels.length ? setStep(s => s + 1) : finish()} className="rounded-xl bg-amber-400 text-slate-950 px-4 py-2 font-black inline-flex items-center gap-2">{step + 1 < script.panels.length ? 'Próximo quadro' : 'Começar missão'} <ArrowRight size={18} /></button></div>
      </div>
    </main>
  );
};
