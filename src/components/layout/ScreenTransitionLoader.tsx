import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { NisialandLogo } from '../ui/NisialandLogo';

interface ScreenTransitionLoaderProps {
  children: React.ReactNode;
}

// Nome do lugar de destino mostrado na cortina.
const DESTINOS: Array<[RegExp, string]> = [
  [/^\/$/, 'Escola Municipal Nísia Vilela Fernandes'],
  [/^\/register/, 'Secretaria'],
  [/^\/orientation/, 'Reunião no auditório'],
  [/^\/mapa/, 'Mapa da escola'],
  [/^\/missions/, 'Nível 0 · A primeira aventura'],
  [/^\/quiz\/results/, 'Resultado do quiz'],
  [/^\/quiz/, 'Nível 0 · Quiz'],
  [/^\/flashcards/, 'Nível 0 · Flashcards'],
  [/^\/results/, 'Missão 0 completa'],
  [/^\/nivel1/, 'Nível 1 · As regras da escola'],
  [/^\/nivel2/, 'Nível 2 · O pátio'],
  [/^\/nivel3/, 'Nível 3 · Salas de aula'],
  [/^\/nivel4/, 'Nível 4 · Trabalho em equipe'],
  [/^\/nivel5/, 'Nível 5 · Minhas escolhas'],
  [/^\/nivel6/, 'Nível 6 · Consequências'],
  [/^\/nivel7/, 'Nível 7 · Aprender a se organizar'],
  [/^\/nivel8/, 'Nível 8 · Organizado na prática'],
  [/^\/leaderboard/, 'Quadro de honra'],
  [/^\/level0/, 'Treino livre'],
  [/^\/historia/, 'A história'],
  [/^\/admin/, 'Painel do professor'],
];
const destino = (path: string) => DESTINOS.find(([re]) => re.test(path))?.[1] ?? 'NISIALAND';

const movimentoReduzido = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.hasAttribute('data-calmo');
  } catch { return false; }
};

// Cortina da troca de tela (pano azul NISIALAND com o logo e o nome do lugar).
const Cortina: React.FC<{ fase: 'fechada' | 'abrindo'; rotulo: string; calma: boolean }> = ({ fase, rotulo, calma }) => (
  <div
    role="status"
    aria-live="polite"
    className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-3 bg-nisia-azul-900 pointer-events-none ${
      fase === 'abrindo' ? (calma ? 'cortina-esmaece' : 'cortina-abre') : ''
    }`}
  >
    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,rgba(255,210,63,0.4)_1px,transparent_1.6px)] [background-size:16px_16px]" aria-hidden="true" />
    <div className="absolute inset-y-0 right-0 w-3 bg-nisia-sol-400 shadow-[0_0_24px_rgba(255,210,63,0.6)]" aria-hidden="true" />
    <NisialandLogo size="md" className="relative drop-shadow-[0_4px_0_rgba(0,0,0,0.35)]" />
    <p className="relative font-display text-xl sm:text-2xl short:text-base text-nisia-sol-400 text-center px-6 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">{rotulo}</p>
    <span className="sr-only">Carregando</span>
  </div>
);

// Fallback do <Suspense> para telas carregadas sob demanda: a mesma cortina, parada.
export const ScreenLoadingFallback: React.FC = () => {
  const location = useLocation();
  return <Cortina fase="fechada" rotulo={destino(location.pathname)} calma />;
};

const FECHADA_MS = 280; // tempo com a cortina cobrindo (a nova tela monta por trás)
const ABRINDO_MS = 460; // duração da abertura (igual à animação em index.css)

// Troca de tela: a cortina cobre na hora da troca e se abre da esquerda para a direita revelando a nova tela.
export const ScreenTransitionLoader: React.FC<ScreenTransitionLoaderProps> = ({ children }) => {
  const location = useLocation();
  const [fase, setFase] = useState<'fechada' | 'abrindo' | null>('fechada');
  const [rotulo, setRotulo] = useState(() => destino(location.pathname));
  const [calma, setCalma] = useState(movimentoReduzido);
  const prevPathRef = useRef<string>(location.pathname);
  const timers = useRef<number[]>([]);

  const abrir = (espera: number) => {
    timers.current.forEach(t => window.clearTimeout(t));
    const c = movimentoReduzido();
    setCalma(c);
    timers.current = [
      window.setTimeout(() => setFase('abrindo'), c ? 60 : espera),
      window.setTimeout(() => setFase(null), (c ? 60 : espera) + (c ? 200 : ABRINDO_MS)),
    ];
  };

  // Primeira carga do site
  useEffect(() => {
    abrir(220);
    return () => timers.current.forEach(t => window.clearTimeout(t));
  }, []);

  // Troca de rota
  useEffect(() => {
    if (location.pathname === prevPathRef.current) return;
    prevPathRef.current = location.pathname;
    setRotulo(destino(location.pathname));
    setFase('fechada');
    window.scrollTo({ top: 0 });
    abrir(FECHADA_MS);
  }, [location.pathname]);

  return (
    <>
      {children}
      {fase && <Cortina fase={fase} rotulo={rotulo} calma={calma} />}
    </>
  );
};
