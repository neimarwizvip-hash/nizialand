import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import type { SchoolGrade } from '../../data/level0Content';
import {
  LEVEL2_BILHETE, LEVEL2_CACA, LEVEL2_CONTENT, LEVEL2_DITADO, LEVEL2_DUELO, LEVEL2_MURAL, LEVEL2_RELOGIO, LEVEL2_ZE_LINES,
} from '../../data/level2Content';
import { ZeCartinha } from '../../components/ze/ZeCartinha';
import { audioService } from '../../services/audio';
import { speechService } from '../../services/speech';
import { useZeInterrupt, useZePop } from '../level1/ActivityShell';
import { Level2Shell } from './Level2Shell';
import { useLevel2Run } from './useLevel2Run';
import type { Level2Outcome } from './useLevel2Run';
import {
  RACE_SECONDS, WORDSEARCH_SECONDS, buildWordGrid, cellsBetween, duelStart, duelStep, matchSelection, shuffleOptions,
} from './level2Rules';
import type { Cell } from './level2Rules';

export interface Level2ActivityProps {
  grade: SchoolGrade;
  onExit: () => void;
  onReplay?: () => void;
}

interface Question { question: string; options: string[]; answer: number }

const zeLine = (activityId: string, n: number) => {
  const lines = LEVEL2_ZE_LINES[activityId] ?? [];
  return lines.length ? lines[n % lines.length] : '';
};

/** Embaralha as opções uma vez (no conteúdo a certa é sempre a 0). */
function useShuffledPool(items: Question[]): Question[] {
  return useMemo(() => items.map(it => ({ question: it.question, ...shuffleOptions(it.options, it.answer) })), [items]);
}

/** Truque do Zé por item: entra depois de `delay` ms, dura `ms` ms e some. */
function useZeTrick(active: boolean, itemKey: number, delay: number, ms: number, onStart: () => void) {
  const [on, setOn] = useState(false);
  const start = useRef(onStart);
  start.current = onStart;
  useEffect(() => {
    setOn(false);
    if (!active) return;
    const t1 = setTimeout(() => { setOn(true); start.current(); }, delay);
    const t2 = setTimeout(() => setOn(false), delay + ms);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active, itemKey, delay, ms]);
  return on && active;
}

const OptionGrid: React.FC<{
  options: string[];
  answer: number;
  locked: boolean;
  disabled?: boolean;
  itemKey: number;
  onPick: (correct: boolean) => void;
}> = ({ options, answer, locked, disabled, itemKey, onPick }) => {
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
            disabled={locked || disabled}
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

const QuestionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="font-heading font-black text-lg sm:text-2xl short:text-base text-slate-800 leading-snug">{children}</p>
);

// ---------- 1. Ditado ----------
export const DitadoActivity: React.FC<Level2ActivityProps> = ({ grade, onExit }) => {
  const items = LEVEL2_CONTENT[grade].dictation;
  const run = useLevel2Run({ activity: LEVEL2_DITADO, grade, total: items.length });
  const item = items[Math.min(run.index, items.length - 1)];
  const [typed, setTyped] = useState('');
  const { zeMessage, showZe } = useZePop();

  const speak = useCallback(() => {
    if (audioService.isSoundOn()) speechService.speakEnglish(item.word);
  }, [item.word]);

  useEffect(() => {
    setTyped('');
    if (run.finished) return;
    const t = setTimeout(speak, 300);
    return () => clearTimeout(t);
  }, [run.index, run.finished, speak]);

  // Atrapalhação leve: uma fala só, no segundo item.
  useEffect(() => {
    if (run.index !== 1 || run.finished) return;
    const t = setTimeout(() => showZe(zeLine(LEVEL2_DITADO.id, 0)), 2500);
    return () => clearTimeout(t);
  }, [run.index, run.finished, showZe]);

  const submit = () => {
    if (!typed.trim() || run.locked) return;
    run.answer(typed.trim().toLowerCase() === item.word.toLowerCase());
  };

  return (
    <Level2Shell
      activity={LEVEL2_DITADO}
      progressLabel={`${run.index + 1} / ${items.length}`}
      clock={run.clock}
      score={run.score}
      feedback={run.feedback}
      finished={run.finished}
      correctCount={run.correctCount}
      totalItems={items.length}
      revealText={item.word}
      afterText={run.feedback ? `"${item.word}" = ${item.hint}` : undefined}
      onExit={onExit}
      overlay={<ZeCartinha visible={!!zeMessage && !run.finished} message={zeMessage ?? ''} />}
    >
      <QuestionCard>Ouça e escreva a palavra em inglês.</QuestionCard>
      <form className="mt-3 short:mt-1.5 flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); submit(); }}>
        <button
          type="button"
          onClick={speak}
          className="px-4 py-3 short:py-1.5 rounded-2xl bg-blue-600 border-2 border-blue-800 text-white font-heading font-black text-sm flex items-center gap-2"
        >
          <Volume2 className="w-4 h-4" /> Ouvir
        </button>
        <input
          aria-label="Palavra ouvida"
          value={typed}
          disabled={run.locked}
          onChange={e => setTyped(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="flex-1 min-w-[10rem] px-4 py-3 short:py-1.5 rounded-2xl border-2 border-slate-300 font-heading font-black text-lg short:text-base focus:border-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={run.locked || !typed.trim()}
          className="px-6 py-3 short:py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 border-2 border-amber-600 font-heading font-black uppercase text-sm disabled:opacity-50"
        >
          Confirmar
        </button>
      </form>
    </Level2Shell>
  );
};

// ---------- 2. Caça-palavras ----------
const cellKey = ([r, c]: Cell) => `${r}-${c}`;

export const CacaActivity: React.FC<Level2ActivityProps> = ({ grade, onExit }) => {
  const words = LEVEL2_CONTENT[grade].wordsearch;
  const { grid, placements } = useMemo(() => buildWordGrid(words), [words]);
  const run = useLevel2Run({ activity: LEVEL2_CACA, grade, total: words.length, itemSeconds: null, runSeconds: WORDSEARCH_SECONDS, instant: true });
  const [found, setFound] = useState<string[]>([]);
  const [start, setStart] = useState<Cell | null>(null);
  const [flash, setFlash] = useState<Cell[]>([]);
  const { zeMessage, showZe } = useZePop();

  // Zé passa de vez em quando para distrair.
  useEffect(() => {
    if (run.finished) return;
    let n = 0;
    const t = setInterval(() => showZe(zeLine(LEVEL2_CACA.id, n++)), 20000);
    return () => clearInterval(t);
  }, [run.finished, showZe]);

  const foundCells = useMemo(
    () => new Set(placements.filter(p => found.includes(p.word)).flatMap(p => p.cells.map(cellKey))),
    [placements, found],
  );

  const pick = (cell: Cell) => {
    if (run.finished) return;
    if (!start) { setStart(cell); return; }
    const end = cell;
    setStart(null);
    const word = matchSelection(placements, start, end);
    if (word && !found.includes(word)) {
      setFound(f => [...f, word]);
      run.answer(true);
      return;
    }
    // Seleção errada: só pisca e toca o som de erro (não conta ponto nem item).
    audioService.playWrong();
    setFlash(cellsBetween(start, end) ?? [start, end]);
    setTimeout(() => setFlash([]), 600);
  };

  const flashSet = new Set(flash.map(cellKey));

  return (
    <Level2Shell
      activity={LEVEL2_CACA}
      progressLabel={`${found.length} / ${words.length} palavras`}
      clock={run.clock}
      score={run.score}
      feedback={run.feedback}
      finished={run.finished}
      correctCount={run.correctCount}
      totalItems={words.length}
      onExit={onExit}
      overlay={<ZeCartinha visible={!!zeMessage && !run.finished} message={zeMessage ?? ''} />}
    >
      <p className="text-xs sm:text-sm font-bold text-slate-600">Toque na primeira e na última letra de cada palavra.</p>
      <div className="mt-2 short:mt-1 flex flex-col short:flex-row sm:flex-row gap-3 items-center sm:items-start">
        <div role="grid" aria-label="Caça-palavras" className="grid grid-cols-8 gap-0.5 select-none">
          {grid.map((row, r) => row.map((letter, c) => {
            const k = `${r}-${c}`;
            const isStart = start && start[0] === r && start[1] === c;
            return (
              <button
                key={k}
                type="button"
                data-cell={k}
                aria-label={`Letra ${letter}, linha ${r + 1}, coluna ${c + 1}`}
                onClick={() => pick([r, c])}
                className={`w-8 h-8 sm:w-10 sm:h-10 short:w-6 short:h-6 rounded-md border font-heading font-black text-sm sm:text-base short:text-xs ${
                  flashSet.has(k) ? 'bg-red-200 border-red-500'
                    : isStart ? 'bg-blue-300 border-blue-600'
                      : foundCells.has(k) ? 'bg-emerald-300 border-emerald-600'
                        : 'bg-white border-slate-300'
                }`}
              >
                {letter}
              </button>
            );
          }))}
        </div>
        <ul className="flex flex-wrap sm:flex-col short:flex-col gap-1.5 short:gap-0.5">
          {words.map(w => (
            <li
              key={w}
              className={`px-3 py-1 short:py-0 rounded-full border font-heading font-black text-sm short:text-xs ${
                found.includes(w.toUpperCase()) ? 'bg-emerald-100 border-emerald-500 text-emerald-700 line-through' : 'bg-white border-slate-300'
              }`}
            >
              {w.toUpperCase()}
            </li>
          ))}
        </ul>
      </div>
    </Level2Shell>
  );
};

// ---------- 3. Mural (verdadeiro ou falso) ----------
export const MuralActivity: React.FC<Level2ActivityProps> = ({ grade, onExit }) => {
  const items = LEVEL2_CONTENT[grade].truefalse;
  const run = useLevel2Run({ activity: LEVEL2_MURAL, grade, total: items.length });
  const item = items[Math.min(run.index, items.length - 1)];
  const { zeMessage, showZe } = useZePop();
  // Zé encosta no mural e cobre o aviso por 2 s.
  const covered = useZeTrick(!run.locked && !run.finished, run.index, 3500, 2000, () => showZe(zeLine(LEVEL2_MURAL.id, run.index), 2000));

  return (
    <Level2Shell
      activity={LEVEL2_MURAL}
      progressLabel={`${run.index + 1} / ${items.length}`}
      clock={run.clock}
      score={run.score}
      feedback={run.feedback}
      finished={run.finished}
      correctCount={run.correctCount}
      totalItems={items.length}
      revealText={item.answer ? 'True' : 'False'}
      afterText={run.feedback ? item.explanation : undefined}
      onExit={onExit}
      overlay={<ZeCartinha visible={!!zeMessage && !run.finished} message={zeMessage ?? ''} />}
    >
      <div className="relative rounded-2xl bg-amber-50 border-4 border-amber-700/60 p-4 short:p-2 shadow-inner">
        <p className="text-[10px] font-heading font-black tracking-widest text-amber-700 uppercase">Mural da escola</p>
        <QuestionCard>{item.statement}</QuestionCard>
        {covered && (
          <div data-testid="ze-cobre" className="absolute inset-0 rounded-xl bg-amber-300/95 flex items-center justify-center font-heading font-black text-amber-900 text-lg rotate-[-2deg]">
            🧢 Zé está na frente do mural!
          </div>
        )}
      </div>
      <OptionGrid options={['True', 'False']} answer={item.answer ? 0 : 1} locked={run.locked} disabled={run.finished} itemKey={run.index} onPick={run.answer} />
    </Level2Shell>
  );
};

// ---------- 4. Bilhete (lacuna) ----------
export const BilheteActivity: React.FC<Level2ActivityProps> = ({ grade, onExit }) => {
  const raw = LEVEL2_CONTENT[grade].gapfill;
  const pool = useShuffledPool(useMemo(() => raw.map(g => ({ question: g.sentence, options: g.options, answer: g.answer })), [raw]));
  const run = useLevel2Run({ activity: LEVEL2_BILHETE, grade, total: pool.length });
  const item = pool[Math.min(run.index, pool.length - 1)];
  const { zeMessage, showZe } = useZePop();
  // Zé rabisca o bilhete por 2,5 s.
  const scribbled = useZeTrick(!run.locked && !run.finished, run.index, 3000, 2500, () => showZe(zeLine(LEVEL2_BILHETE.id, run.index), 2500));

  return (
    <Level2Shell
      activity={LEVEL2_BILHETE}
      progressLabel={`${run.index + 1} / ${pool.length}`}
      clock={run.clock}
      score={run.score}
      feedback={run.feedback}
      finished={run.finished}
      correctCount={run.correctCount}
      totalItems={pool.length}
      revealText={item.options[item.answer]}
      onExit={onExit}
      overlay={<ZeCartinha visible={!!zeMessage && !run.finished} message={zeMessage ?? ''} />}
    >
      <div className="relative rounded-2xl bg-yellow-50 border-2 border-yellow-400 p-4 short:p-2 rotate-[-0.5deg]">
        <p className="text-[10px] font-heading font-black tracking-widest text-yellow-700 uppercase">Bilhete</p>
        <QuestionCard>{item.question}</QuestionCard>
        {scribbled && (
          <svg data-testid="ze-rabisco" viewBox="0 0 200 60" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
            <path d="M5 30 C 30 5, 50 55, 75 25 S 120 50, 140 20 S 180 45, 195 15" stroke="#7c3aed" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M10 45 C 40 20, 70 60, 100 30 S 160 55, 190 35" stroke="#db2777" strokeWidth="5" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <OptionGrid options={item.options} answer={item.answer} locked={run.locked} disabled={run.finished} itemKey={run.index} onPick={run.answer} />
    </Level2Shell>
  );
};

// ---------- 5. Corrida contra o relógio ----------
export const CorridaActivity: React.FC<Level2ActivityProps> = ({ grade, onExit, onReplay }) => {
  const c = LEVEL2_CONTENT[grade];
  const pool = useShuffledPool(useMemo(
    () => [...c.timed, ...c.gapfill.map(g => ({ question: g.sentence, options: g.options, answer: g.answer }))],
    [c],
  ));
  const run = useLevel2Run({ activity: LEVEL2_RELOGIO, grade, total: Infinity, itemSeconds: null, runSeconds: RACE_SECONDS });
  const item = pool[run.index % pool.length];
  // A cada 3 itens o Zé interrompe (e cresce até cobrir as respostas).
  const ze = useZeInterrupt(run.index % 3 === 2 && !run.finished, run.locked, run.index);

  return (
    <Level2Shell
      activity={LEVEL2_RELOGIO}
      progressLabel={`Item ${run.index + 1}`}
      clock={run.clock}
      score={run.score}
      feedback={run.feedback}
      finished={run.finished}
      correctCount={run.correctCount}
      totalItems={run.outcomes.length}
      revealText={item.options[item.answer]}
      onExit={onExit}
      onReplay={onReplay}
      overlay={<ZeCartinha {...ze.zeProps} visible={ze.zeProps.visible && !run.finished} />}
    >
      <QuestionCard>{item.question}</QuestionCard>
      <OptionGrid options={item.options} answer={item.answer} locked={run.locked} disabled={run.finished || ze.blocking} itemKey={run.index} onPick={run.answer} />
    </Level2Shell>
  );
};

// ---------- 6. Duelo de bafo ----------
const CardRow: React.FC<{ label: string; left: number; total: number; tone: string }> = ({ label, left, total, tone }) => (
  <div className="flex items-center gap-2">
    <span className="font-heading font-black text-xs uppercase w-12">{label}</span>
    {Array.from({ length: total }, (_, i) => (
      <span
        key={i}
        aria-label={i < left ? 'carta de pé' : 'carta virada'}
        className={`w-8 h-11 short:w-6 short:h-8 rounded-md border-2 transition-transform duration-300 ${i < left ? tone : 'bg-slate-200 border-slate-400 rotate-180 opacity-50'}`}
      />
    ))}
  </div>
);

export const DueloActivity: React.FC<Level2ActivityProps> = ({ grade, onExit, onReplay }) => {
  const c = LEVEL2_CONTENT[grade];
  const pool = useShuffledPool(useMemo(() => [...c.duel, ...c.timed], [c]));
  const endWhen = useCallback((list: Level2Outcome[]) => list.reduce((s, o) => duelStep(s, o.correct), duelStart()).winner !== null, []);
  const run = useLevel2Run({ activity: LEVEL2_DUELO, grade, total: Infinity, endWhen });
  const item = pool[run.index % pool.length];
  const duel = run.outcomes.reduce((s, o) => duelStep(s, o.correct), duelStart());
  const total = duelStart().zeCards;
  const ze = useZeInterrupt(!run.finished, run.locked, run.index);
  const { zeMessage, showZe } = useZePop();
  const lastCount = useRef(0);

  // Cada resposta vira uma carta; quando o aluno erra, o Zé provoca.
  useEffect(() => {
    if (run.outcomes.length === lastCount.current) return;
    lastCount.current = run.outcomes.length;
    audioService.playFlip();
    const last = run.outcomes[run.outcomes.length - 1];
    if (last && !last.correct && !run.finished) showZe(zeLine(LEVEL2_DUELO.id, run.outcomes.length), 1400);
  }, [run.outcomes, run.finished, showZe]);

  return (
    <Level2Shell
      activity={LEVEL2_DUELO}
      progressLabel={`Rodada ${run.index + 1}`}
      clock={run.clock}
      score={run.score}
      feedback={run.feedback}
      finished={run.finished}
      correctCount={run.correctCount}
      totalItems={run.outcomes.length}
      revealText={item.options[item.answer]}
      finishedNote={duel.winner === 'player' ? 'Você venceu o Zé no bafo! 🏆' : 'O Zé ganhou dessa vez... revanche?'}
      onExit={onExit}
      onReplay={onReplay}
      overlay={zeMessage && !run.finished
        ? <ZeCartinha visible message={zeMessage} />
        : <ZeCartinha {...ze.zeProps} visible={ze.zeProps.visible && !run.finished} />}
    >
      <div className="flex flex-wrap gap-x-6 gap-y-1 mb-2 short:mb-1">
        <CardRow label="Zé" left={duel.zeCards} total={total} tone="bg-amber-400 border-amber-700" />
        <CardRow label="Você" left={duel.myCards} total={total} tone="bg-blue-500 border-blue-800" />
      </div>
      <QuestionCard>{item.question}</QuestionCard>
      <OptionGrid options={item.options} answer={item.answer} locked={run.locked} disabled={run.finished || ze.blocking} itemKey={run.index} onPick={run.answer} />
    </Level2Shell>
  );
};

export const LEVEL2_ACTIVITY_VIEWS: Record<string, React.FC<Level2ActivityProps>> = {
  [LEVEL2_DITADO.id]: DitadoActivity,
  [LEVEL2_CACA.id]: CacaActivity,
  [LEVEL2_MURAL.id]: MuralActivity,
  [LEVEL2_BILHETE.id]: BilheteActivity,
  [LEVEL2_RELOGIO.id]: CorridaActivity,
  [LEVEL2_DUELO.id]: DueloActivity,
};
