import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Volume2 } from 'lucide-react';
import type { Activity } from '../../core/types';
import type { SchoolGrade } from '../../data/level0Content';
import {
  LEVEL3_ARRUME, LEVEL3_LABIRINTO, LEVEL3_LOUSA, LEVEL3_MEMORIA, LEVEL3_QUEM, LEVEL3_REVISAO,
} from '../../content/level3';
import { LEVEL3_CONTENT, LEVEL3_SPOTS, LEVEL3_ZE_LINES } from '../../data/level3Content';
import type { Level3Place, Level3Question, Level3Spot } from '../../data/level3Content';
import { ZeCartinha } from '../../components/ze/ZeCartinha';
import { MANE_IMG, MANE_ROOM_START, MANE_ROOM_TIP } from '../../data/level3Mane';
import { audioService } from '../../services/audio';
import { speechService } from '../../services/speech';
import { useZePop } from '../level1/ActivityShell';
import { Level2Shell } from '../level2/Level2Shell';
import { useLevel2Run } from '../level2/useLevel2Run';
import {
  LEVEL3_BUILDER, LEVEL3_MAZE_BUILDER, LEVEL3_MAZE_SECONDS, LEVEL3_MAZE_WORDS, LEVEL3_MEMORY_SECONDS, MAZE_COLS, MAZE_ROWS,
  ZE_ROOM_SIZES, buildReviewItems, isMazeWall, level3MaxScore, mazeStart, moveInMaze, placeMazeItems, shuffleOptions, shuffled,
} from './level3Rules';
import type { Level3Mc, MazeCell, MazeItem } from './level3Rules';

export interface Level3ActivityProps {
  grade: SchoolGrade;
  onExit: () => void;
  onReplay?: () => void;
}

// Ordem das salas: decide o tamanho do Zé e a fala de entrada.
export const LEVEL3_ROOM_ORDER = [LEVEL3_ARRUME.id, LEVEL3_LOUSA.id, LEVEL3_QUEM.id, LEVEL3_MEMORIA.id, LEVEL3_LABIRINTO.id, LEVEL3_REVISAO.id];
const roomIndex = (id: string) => Math.max(0, LEVEL3_ROOM_ORDER.indexOf(id));
const BG = '/assets/nisialand_hallway_bg.jpg';

const speakEn = (text: string) => { if (audioService.isSoundOn()) speechService.speakEnglish(text); };
const toMc = (q: Level3Question): Level3Mc => ({ question: q.prompt, ...shuffleOptions(q.options, q.answer) });

/** Zé entra falando ao abrir a sala e fica do tamanho daquela sala. */
function useRoomZe(activity: Activity) {
  const i = roomIndex(activity.id);
  const { zeMessage, showZe } = useZePop();
  useEffect(() => {
    const t = setTimeout(() => showZe(LEVEL3_ZE_LINES[i] ?? '', 3500), 600);
    return () => clearTimeout(t);
  }, [i, showZe]);
  return { zeMessage, showZe, size: ZE_ROOM_SIZES[i], i };
}

/** Mané Zoeira no canto esquerdo (o Zé fica no direito): ânimo na entrada e uma dica leve no 1º erro. */
const ManeCorner: React.FC<{ i: number; finished: boolean; wrong: boolean }> = ({ i, finished, wrong }) => {
  const [msg, setMsg] = useState<string | null>(null);
  const tipped = useRef(false);
  useEffect(() => {
    const show = setTimeout(() => setMsg(m => (tipped.current ? m : MANE_ROOM_START[i] ?? null)), 1000);
    const hide = setTimeout(() => setMsg(m => (m === MANE_ROOM_START[i] ? null : m)), 5000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [i]);
  useEffect(() => {
    if (!wrong || tipped.current) return;
    tipped.current = true;
    setMsg(MANE_ROOM_TIP[i] ?? null);
    const t = setTimeout(() => setMsg(null), 4500);
    return () => clearTimeout(t);
  }, [wrong, i]);
  if (finished) return null;
  return (
    <div data-testid="mane-corner" className="fixed left-2 bottom-4 z-40 pointer-events-none flex items-end gap-1">
      <img src={MANE_IMG} alt="Mané Zoeira" className="w-12 sm:w-20 short:w-9 h-auto drop-shadow" />
      {msg && (
        <p className="mb-6 short:mb-3 max-w-[160px] sm:max-w-[220px] short:max-w-[150px] px-2 py-1 rounded-2xl bg-white border-2 border-emerald-500 text-[11px] sm:text-xs short:text-[10px] font-black text-emerald-800 shadow">{msg}</p>
      )}
    </div>
  );
};

const ZeOverlay: React.FC<{ ze: ReturnType<typeof useRoomZe>; finished: boolean; outcomes?: { correct: boolean }[] }> = ({ ze, finished, outcomes = [] }) => (
  <>
    <ZeCartinha visible={!!ze.zeMessage && !finished} message={ze.zeMessage ?? ''} imageClassName={ze.size} />
    <ManeCorner i={ze.i} finished={finished} wrong={outcomes.some(o => !o.correct)} />
  </>
);

const QuestionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="font-heading font-black text-lg sm:text-2xl short:text-base text-slate-800 leading-snug">{children}</p>
);

const OptionGrid: React.FC<{ options: string[]; answer: number; locked: boolean; itemKey: number; onPick: (correct: boolean) => void }> = ({ options, answer, locked, itemKey, onPick }) => {
  const [chosen, setChosen] = useState<number | null>(null);
  useEffect(() => setChosen(null), [itemKey]);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 short:grid-cols-2 gap-2 short:gap-1.5 mt-3 short:mt-1.5">
      {options.map((opt, i) => {
        const state = locked && i === answer ? 'right' : locked && i === chosen ? 'wrong' : 'idle';
        return (
          <button
            key={opt + i}
            type="button"
            disabled={locked}
            onClick={() => { setChosen(i); onPick(i === answer); }}
            className={`px-4 py-3 short:py-1.5 rounded-2xl border-2 font-heading font-black text-sm sm:text-base text-left transition-colors ${
              state === 'right' ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                : state === 'wrong' ? 'bg-red-100 border-red-500 text-red-700'
                  : 'bg-white border-slate-300 hover:border-blue-500 disabled:opacity-60'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
};

const ListenButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-4 py-3 short:py-1.5 rounded-2xl bg-blue-600 border-2 border-blue-800 text-white font-heading font-black text-sm flex items-center gap-2"
  >
    <Volume2 className="w-4 h-4" /> Ouvir
  </button>
);

// ---------- Sala 1: Arrume a sala ----------
type ArrangeItem = { kind: 'place'; place: Level3Place } | { kind: 'mc'; mc: Level3Mc };

export const ArrumeActivity: React.FC<Level3ActivityProps> = ({ grade, onExit, onReplay }) => {
  const items = useMemo<ArrangeItem[]>(() => {
    const c = LEVEL3_CONTENT[grade].arrange;
    return [...shuffled(c.place).map(place => ({ kind: 'place' as const, place })), ...c.check.map(q => ({ kind: 'mc' as const, mc: toMc(q) }))];
  }, [grade]);
  const run = useLevel2Run({ activity: LEVEL3_ARRUME, grade, total: items.length, buildResult: LEVEL3_BUILDER });
  const item = items[Math.min(run.index, items.length - 1)];
  const ze = useRoomZe(LEVEL3_ARRUME);
  const [dropped, setDropped] = useState<Level3Spot | null>(null);

  useEffect(() => {
    setDropped(null);
    if (run.finished || item.kind !== 'place') return;
    const t = setTimeout(() => speakEn(item.place.instruction), 400);
    return () => clearTimeout(t);
  }, [run.index, run.finished, item]);

  const drop = (spot: Level3Spot) => {
    if (run.locked || item.kind !== 'place') return;
    setDropped(spot);
    run.answer(spot === item.place.spot);
  };

  const rightSpot = item.kind === 'place' ? LEVEL3_SPOTS.find(s => s.id === item.place.spot)?.label : undefined;
  const showText = item.kind === 'place' && (run.locked || !audioService.isSoundOn());

  return (
    <Level2Shell
      activity={LEVEL3_ARRUME}
      progressLabel={`${run.index + 1} / ${items.length}`}
      clock={run.clock}
      score={run.score}
      feedback={run.feedback}
      finished={run.finished}
      correctCount={run.correctCount}
      totalItems={items.length}
      revealText={item.kind === 'place' ? rightSpot : item.mc.options[item.mc.answer]}
      afterText={item.kind === 'place' && run.feedback ? `"${item.place.instruction}"` : undefined}
      onExit={onExit}
      onReplay={onReplay}
      exitLabel="Voltar às salas"
      background={BG}
      maxScore={level3MaxScore(items.length)}
      overlay={<ZeOverlay ze={ze} finished={run.finished} outcomes={run.outcomes} />}
    >
      {item.kind === 'place' ? (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <ListenButton onClick={() => speakEn(item.place.instruction)} />
            <QuestionCard>{showText ? item.place.instruction : 'Ouça a ordem e coloque o objeto no lugar.'}</QuestionCard>
          </div>
          <div className="mt-3 short:mt-1.5 flex items-center gap-3 short:gap-2">
            <span
              draggable={!run.locked}
              onDragStart={e => e.dataTransfer.setData('text/plain', item.place.object)}
              aria-label={item.place.object}
              className="text-5xl short:text-3xl cursor-grab select-none bg-amber-50 border-2 border-amber-300 rounded-2xl px-3 py-1"
            >
              {item.place.emoji}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-600">Arraste ou toque no lugar certo.</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 short:grid-cols-6 gap-2 short:gap-1 mt-3 short:mt-1.5">
            {LEVEL3_SPOTS.map(s => {
              const state = run.locked && s.id === item.place.spot ? 'right' : run.locked && s.id === dropped ? 'wrong' : 'idle';
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={run.locked}
                  onClick={() => drop(s.id)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); drop(s.id); }}
                  className={`min-h-[64px] short:min-h-[44px] rounded-2xl border-2 border-dashed font-heading font-black text-xs sm:text-sm p-2 short:p-1 ${
                    state === 'right' ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                      : state === 'wrong' ? 'bg-red-100 border-red-500 text-red-700'
                        : 'bg-white/80 border-slate-400 hover:border-blue-500'
                  }`}
                >
                  {state !== 'idle' && s.id === (state === 'right' ? item.place.spot : dropped) ? `${item.place.emoji} ` : ''}{s.label}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <QuestionCard>{item.mc.question}</QuestionCard>
          <OptionGrid options={item.mc.options} answer={item.mc.answer} locked={run.locked} itemKey={run.index} onPick={run.answer} />
        </>
      )}
    </Level2Shell>
  );
};

// ---------- Salas de múltipla escolha (Quadro e Revisão) ----------
const McRoom: React.FC<Level3ActivityProps & { activity: Activity; items: Level3Mc[]; trickAt?: number }> = ({ activity, items, trickAt, grade, onExit, onReplay }) => {
  const run = useLevel2Run({ activity, grade, total: items.length, buildResult: LEVEL3_BUILDER });
  const item = items[Math.min(run.index, items.length - 1)];
  const ze = useRoomZe(activity);
  const { showZe } = ze;

  useEffect(() => {
    if (run.finished || !item.speak) return;
    const t = setTimeout(() => speakEn(item.speak!), 400);
    return () => clearTimeout(t);
  }, [run.index, run.finished, item]);

  // Truque do Zé: no item marcado ele "sopra" uma resposta errada.
  useEffect(() => {
    if (trickAt === undefined || run.index !== trickAt || run.finished) return;
    const wrong = item.options.find((_, i) => i !== item.answer) ?? '';
    const t = setTimeout(() => showZe(`Psiu! É "${wrong}"... confia!`), 2500);
    return () => clearTimeout(t);
  }, [trickAt, run.index, run.finished, item, showZe]);

  return (
    <Level2Shell
      activity={activity}
      progressLabel={`${run.index + 1} / ${items.length}`}
      clock={run.clock}
      score={run.score}
      feedback={run.feedback}
      finished={run.finished}
      correctCount={run.correctCount}
      totalItems={items.length}
      revealText={item.options[item.answer]}
      onExit={onExit}
      onReplay={onReplay}
      exitLabel="Voltar às salas"
      background={BG}
      maxScore={level3MaxScore(items.length)}
      overlay={<ZeOverlay ze={ze} finished={run.finished} outcomes={run.outcomes} />}
    >
      <div className="flex items-center gap-3 flex-wrap">
        {item.speak && <ListenButton onClick={() => speakEn(item.speak!)} />}
        <QuestionCard>{item.question}</QuestionCard>
      </div>
      <OptionGrid options={item.options} answer={item.answer} locked={run.locked} itemKey={run.index} onPick={run.answer} />
    </Level2Shell>
  );
};

export const LousaActivity: React.FC<Level3ActivityProps> = props => {
  const items = useMemo(() => LEVEL3_CONTENT[props.grade].board.map(toMc), [props.grade]);
  return <McRoom {...props} activity={LEVEL3_LOUSA} items={items} trickAt={1} />;
};

export const RevisaoActivity: React.FC<Level3ActivityProps> = props => {
  const items = useMemo(() => buildReviewItems(props.grade), [props.grade]);
  return <McRoom {...props} activity={LEVEL3_REVISAO} items={items} trickAt={4} />;
};

// ---------- Sala 3: Quem disse? ----------
export const QuemActivity: React.FC<Level3ActivityProps> = ({ grade, onExit, onReplay }) => {
  const items = useMemo(() => shuffled(LEVEL3_CONTENT[grade].who), [grade]);
  const run = useLevel2Run({ activity: LEVEL3_QUEM, grade, total: items.length, buildResult: LEVEL3_BUILDER });
  const item = items[Math.min(run.index, items.length - 1)];
  const ze = useRoomZe(LEVEL3_QUEM);
  const [chosen, setChosen] = useState<boolean | null>(null);

  useEffect(() => {
    setChosen(null);
    if (run.finished) return;
    const t = setTimeout(() => speakEn(item.text), 400);
    return () => clearTimeout(t);
  }, [run.index, run.finished, item]);

  const pick = (polite: boolean) => { if (run.locked) return; setChosen(polite); run.answer(polite === item.polite); };
  const btn = (polite: boolean) => {
    const state = run.locked && polite === item.polite ? 'right' : run.locked && polite === chosen ? 'wrong' : 'idle';
    return `flex-1 px-4 py-4 short:py-2 rounded-2xl border-2 font-heading font-black text-base sm:text-lg ${
      state === 'right' ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
        : state === 'wrong' ? 'bg-red-100 border-red-500 text-red-700'
          : 'bg-white border-slate-300 hover:border-blue-500 disabled:opacity-60'
    }`;
  };

  return (
    <Level2Shell
      activity={LEVEL3_QUEM}
      progressLabel={`${run.index + 1} / ${items.length}`}
      clock={run.clock}
      score={run.score}
      feedback={run.feedback}
      finished={run.finished}
      correctCount={run.correctCount}
      totalItems={items.length}
      revealText={item.polite ? 'Educada' : 'Mal-educada'}
      afterText={run.feedback ? item.explanation : undefined}
      onExit={onExit}
      onReplay={onReplay}
      exitLabel="Voltar às salas"
      background={BG}
      maxScore={level3MaxScore(items.length)}
      overlay={<ZeOverlay ze={ze} finished={run.finished} outcomes={run.outcomes} />}
    >
      <p className="text-xs font-black tracking-widest text-emerald-700 uppercase">Essa fala é educada?</p>
      <div className="flex items-center gap-3 flex-wrap mt-1">
        <ListenButton onClick={() => speakEn(item.text)} />
        <QuestionCard>“{item.text}”</QuestionCard>
      </div>
      <div className="flex gap-2 mt-3 short:mt-1.5">
        <button type="button" disabled={run.locked} onClick={() => pick(true)} className={btn(true)}>😊 Educada</button>
        <button type="button" disabled={run.locked} onClick={() => pick(false)} className={btn(false)}>😠 Mal-educada</button>
      </div>
    </Level2Shell>
  );
};

// ---------- Sala 4: Memória ----------
interface MemoryCard { id: number; pair: number; text: string; lang: 'en' | 'pt' }

export const MemoriaActivity: React.FC<Level3ActivityProps> = ({ grade, onExit, onReplay }) => {
  const pairs = LEVEL3_CONTENT[grade].memory;
  const cards = useMemo<MemoryCard[]>(() => shuffled(pairs.flatMap((p, i) => [
    { id: i * 2, pair: i, text: p.en, lang: 'en' as const },
    { id: i * 2 + 1, pair: i, text: p.pt, lang: 'pt' as const },
  ])), [pairs]);
  // Só os pares certos entram no andamento; errar um par só desvira as cartas.
  const run = useLevel2Run({ activity: LEVEL3_MEMORIA, grade, total: pairs.length, itemSeconds: null, runSeconds: LEVEL3_MEMORY_SECONDS, instant: true, buildResult: LEVEL3_BUILDER });
  const ze = useRoomZe(LEVEL3_MEMORIA);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map(id => cards.find(c => c.id === id)!);
    if (a.pair === b.pair) {
      setMatched(m => [...m, a.pair]);
      setOpen([]);
      speakEn(a.lang === 'en' ? a.text : b.text);
      run.answer(true);
      return;
    }
    audioService.playWrong();
    const t = setTimeout(() => setOpen([]), 800);
    return () => clearTimeout(t);
  }, [open, cards, run.answer]);

  const flip = (c: MemoryCard) => {
    if (run.finished || open.length >= 2 || open.includes(c.id) || matched.includes(c.pair)) return;
    audioService.playFlip();
    setOpen(o => [...o, c.id]);
  };

  return (
    <Level2Shell
      activity={LEVEL3_MEMORIA}
      progressLabel={`${matched.length} / ${pairs.length} pares`}
      clock={run.clock}
      score={run.score}
      feedback={run.feedback}
      finished={run.finished}
      correctCount={run.correctCount}
      totalItems={pairs.length}
      onExit={onExit}
      onReplay={onReplay}
      exitLabel="Voltar às salas"
      background={BG}
      maxScore={level3MaxScore(pairs.length)}
      overlay={<ZeOverlay ze={ze} finished={run.finished} outcomes={run.outcomes} />}
    >
      <QuestionCard>Ache os pares: inglês e português.</QuestionCard>
      <div className="grid grid-cols-5 gap-2 short:gap-1.5 mt-3 short:mt-1.5">
        {cards.map(c => {
          const up = open.includes(c.id) || matched.includes(c.pair);
          return (
            <button
              key={c.id}
              type="button"
              aria-label={up ? c.text : 'Carta virada'}
              onClick={() => flip(c)}
              className={`h-20 sm:h-24 short:h-14 rounded-2xl border-2 font-heading font-black text-xs sm:text-sm p-1 leading-tight ${
                matched.includes(c.pair) ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                  : up ? (c.lang === 'en' ? 'bg-blue-50 border-blue-500 text-blue-800' : 'bg-amber-50 border-amber-500 text-amber-800')
                    : 'bg-violet-600 border-violet-800 text-white'
              }`}
            >
              {up ? c.text : '?'}
            </button>
          );
        })}
      </div>
    </Level2Shell>
  );
};

// ---------- Sala 5: Labirinto ----------
type Dir = 'up' | 'down' | 'left' | 'right';
const KEY_DIR: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };

export const LabirintoActivity: React.FC<Level3ActivityProps> = ({ grade, onExit, onReplay }) => {
  const maze = LEVEL3_CONTENT[grade].maze;
  const run = useLevel2Run({
    activity: LEVEL3_LABIRINTO, grade, total: Infinity, itemSeconds: null, runSeconds: LEVEL3_MAZE_SECONDS, instant: true,
    endWhen: endMaze, buildResult: LEVEL3_MAZE_BUILDER,
  });
  const ze = useRoomZe(LEVEL3_LABIRINTO);
  const { showZe } = ze;
  const [pos, setPos] = useState<MazeCell>(mazeStart);
  const [items, setItems] = useState<MazeItem[]>(() => placeMazeItems(maze.words, maze.decoys, 2));
  const [last, setLast] = useState<string | null>(null);

  const move = useCallback((dir: Dir) => {
    if (run.locked || run.finished) return;
    setPos(p => moveInMaze(p, dir));
  }, [run.locked, run.finished]);

  // Pisou numa casa com item: palavra certa soma, palavra errada ou carta do Zé contam como erro.
  useEffect(() => {
    const hit = items.find(it => it.cell[0] === pos[0] && it.cell[1] === pos[1]);
    if (!hit) return;
    setItems(list => list.filter(it => it.id !== hit.id));
    setLast(hit.label);
    if (hit.kind === 'word') speakEn(hit.label);
    if (hit.kind === 'ze') showZe('Hahaha! Pegou minha carta!');
    run.answer(hit.kind === 'word');
  }, [pos, items, run.answer, showZe]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_DIR[e.key];
      if (!dir) return;
      e.preventDefault();
      move(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  const pad = (dir: Dir, icon: React.ReactNode) => (
    <button type="button" aria-label={`Mover ${dir}`} onClick={() => move(dir)} className="w-12 h-12 short:w-10 short:h-10 rounded-xl bg-orange-500 border-2 border-orange-700 text-white flex items-center justify-center active:translate-y-0.5">
      {icon}
    </button>
  );

  return (
    <Level2Shell
      activity={LEVEL3_LABIRINTO}
      progressLabel={`${run.correctCount} / ${LEVEL3_MAZE_WORDS} palavras`}
      clock={run.clock}
      score={run.score}
      feedback={run.feedback}
      finished={run.finished}
      correctCount={Math.min(run.correctCount, LEVEL3_MAZE_WORDS)}
      totalItems={LEVEL3_MAZE_WORDS}
      revealText={run.feedback === 'wrong' && last ? `não pegue "${last}"` : undefined}
      onExit={onExit}
      onReplay={onReplay}
      exitLabel="Voltar às salas"
      background={BG}
      maxScore={level3MaxScore(LEVEL3_MAZE_WORDS)}
      overlay={<ZeOverlay ze={ze} finished={run.finished} outcomes={run.outcomes} />}
    >
      <QuestionCard>{maze.goal} <span className="text-sm text-slate-500">({maze.goalPt})</span></QuestionCard>
      <div className="flex gap-3 short:gap-2 items-center mt-2 short:mt-1 flex-wrap justify-center">
        <div className="grid gap-1 short:gap-0.5" style={{ gridTemplateColumns: `repeat(${MAZE_COLS}, minmax(0, 1fr))` }} role="grid" aria-label="Labirinto">
          {Array.from({ length: MAZE_ROWS * MAZE_COLS }, (_, k) => {
            const cell: MazeCell = [Math.floor(k / MAZE_COLS), k % MAZE_COLS];
            const here = pos[0] === cell[0] && pos[1] === cell[1];
            const it = items.find(x => x.cell[0] === cell[0] && x.cell[1] === cell[1]);
            return (
              <div
                key={k}
                className={`w-14 h-12 sm:w-20 sm:h-14 short:w-14 short:h-9 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-heading font-black text-center leading-tight ${
                  isMazeWall(cell) ? 'bg-slate-700' : here ? 'bg-orange-200 border-2 border-orange-500' : 'bg-white/90 border border-slate-300'
                }`}
              >
                {here ? '🧒' : it ? it.label : ''}
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-1 w-max">
          <span />{pad('up', <ArrowUp className="w-5 h-5" />)}<span />
          {pad('left', <ArrowLeft className="w-5 h-5" />)}{pad('down', <ArrowDown className="w-5 h-5" />)}{pad('right', <ArrowRight className="w-5 h-5" />)}
        </div>
      </div>
    </Level2Shell>
  );
};

// Fora do componente: referência estável para o andamento.
function endMaze(outcomes: { correct: boolean }[]) { return outcomes.filter(o => o.correct).length >= LEVEL3_MAZE_WORDS; }

export const LEVEL3_ACTIVITY_VIEWS: Record<string, React.FC<Level3ActivityProps>> = {
  [LEVEL3_ARRUME.id]: ArrumeActivity,
  [LEVEL3_LOUSA.id]: LousaActivity,
  [LEVEL3_QUEM.id]: QuemActivity,
  [LEVEL3_MEMORIA.id]: MemoriaActivity,
  [LEVEL3_LABIRINTO.id]: LabirintoActivity,
  [LEVEL3_REVISAO.id]: RevisaoActivity,
};
