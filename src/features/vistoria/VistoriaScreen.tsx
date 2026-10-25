import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { LEVEL1 } from '../../content/level1';
import { LEVEL2 } from '../../data/level2Content';
import { LEVEL3 } from '../../content/level3';
import { LEVEL4 } from '../../content/level4';
import { LEVEL5 } from '../../content/level5';
import { LEVEL6 } from '../../content/level6';
import { LEVEL7 } from '../../content/level7';
import type { Level } from '../../core/types';

interface Item { label: string; to: string; story?: string }

// Chaves de "história já vista" (sessionStorage): limpar faz a HQ tocar de novo.
const STORY_NIVEL0 = 'nisialand_story_seen_nivel0';
const STORY_NIVEL2 = 'nisialand_story_seen_nivel2';
const STORY_HQ = 'nisialand_story_seen_hq_reuniao';

// Níveis 3 a 7: tela da missão + cada atividade direto (todas liberadas na vistoria).
const phase = (level: Level, missionPath: string) => ({
  title: `Nível ${level.number} · ${level.title}`,
  items: [
    { label: 'Tela da missão', to: missionPath },
    ...level.mission.activities.map(a => ({ label: a.name, to: a.path })),
  ],
});

export const VISTORIA_LEVELS: { title: string; items: Item[] }[] = [
  {
    title: 'Nível 0',
    items: [
      { label: 'História (HQ do Diretor)', to: '/historia' },
      { label: 'Arcade (série e tópicos)', to: '/level0' },
      { label: 'Orientação (Edileia)', to: '/orientation' },
      { label: 'Tela da missão', to: '/missions', story: STORY_NIVEL0 },
      { label: 'Quiz', to: '/quiz' },
      { label: 'Flashcards', to: '/flashcards' },
    ],
  },
  {
    title: 'Nível 1',
    items: [
      { label: 'HQ + tela da missão', to: '/nivel1', story: STORY_HQ },
      ...LEVEL1.mission.activities.map(a => ({ label: a.name, to: a.path })),
    ],
  },
  {
    title: 'Nível 2',
    items: [
      { label: 'História + tela da missão', to: '/nivel2', story: STORY_NIVEL2 },
      { label: 'Pátio', to: '/nivel2/patio' },
      { label: 'Protótipo 3D (opcional)', to: '/nivel2/mundo3d' },
      ...LEVEL2.mission.activities.map(a => ({ label: a.name, to: `/nivel2/patio?atividade=${a.id}` })),
    ],
  },
  phase(LEVEL3, '/nivel3'),
  phase(LEVEL4, '/nivel4'),
  phase(LEVEL5, '/nivel5'),
  phase(LEVEL6, '/nivel6'),
  phase(LEVEL7, '/nivel7'),
  {
    title: 'Mapa',
    items: [{ label: 'Mapa das missões (0 a 10)', to: '/mapa' }],
  },
];

// Só existe no `npm run dev` (a rota não entra no build). Abre tudo liberado e nada é salvo.
export const VistoriaScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setVistoriaMode } = useGame();

  useEffect(() => setVistoriaMode(true), []); // eslint-disable-line react-hooks/exhaustive-deps

  const open = (item: Item) => {
    if (item.story) {
      try { sessionStorage.removeItem(item.story); } catch { /* segue */ }
    }
    navigate(item.to);
  };

  const exit = () => {
    setVistoriaMode(false);
    navigate('/');
  };

  return (
    <div className="min-h-[100dvh] bg-slate-900 text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black">Vistoria do professor</h1>
          <button type="button" onClick={exit} className="rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-2 font-bold">
            Sair da vistoria
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {VISTORIA_LEVELS.map(level => (
            <section key={level.title} className="rounded-2xl bg-slate-800 p-4">
              <h2 className="text-xl font-black mb-3 text-amber-300">{level.title}</h2>
              <div className="flex flex-col gap-2">
                {level.items.map(item => (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => open(item)}
                    className="text-left rounded-lg bg-slate-700 hover:bg-amber-500 hover:text-slate-950 px-3 py-2 font-semibold"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VistoriaScreen;

// Selo fixo enquanto a vistoria estiver ligada.
export const VistoriaBadge: React.FC = () => {
  const { vistoria } = useGame();
  if (!vistoria) return null;
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[9999] rounded-full bg-red-600 text-white text-xs font-black px-3 py-1 shadow-lg pointer-events-none">
      VISTORIA – pontos não contam
    </div>
  );
};
