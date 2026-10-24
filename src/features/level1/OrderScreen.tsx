import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { audioService } from '../../services/audio';
import { ZeCartinha } from '../../components/ze/ZeCartinha';
import { LEVEL1_ORDER } from '../../content/level1';
import { LEVEL1_CONTENT } from '../../data/level1Content';
import { ZE_INTERFERENCE, pickZeItems, shuffled } from './level1Rules';
import { useActivityRun } from './useActivityRun';
import { ActivityShell, useZePop } from './ActivityShell';

interface Tile { id: number; word: string }

// Falas provisórias do Zé (trocar pelo texto do Oliveira).
const ZE_SHUFFLE = 'Baguncei as palavras! Hehehe!';
const ZE_SHUFFLE_DELAY_MS = 4000;

const tilesOf = (sentence: string): Tile[] => sentence.split(' ').map((word, id) => ({ id, word }));

const OrderScreen: React.FC = () => {
  const { currentPlayer } = useGame();
  const grade = getPlayerGrade(currentPlayer);
  const items = LEVEL1_CONTENT[grade ?? '8'].order;
  const run = useActivityRun(LEVEL1_ORDER, grade, items.length);
  const zeItems = useMemo(() => pickZeItems(items.length, ZE_INTERFERENCE.order), [items.length]);
  const { zeMessage, showZe } = useZePop();

  const item = items[run.index];
  const [bank, setBank] = useState<Tile[]>([]);
  const [placed, setPlaced] = useState<Tile[]>([]);
  const lockedRef = useRef(run.locked);
  lockedRef.current = run.locked;

  const reset = () => {
    setBank(shuffled(tilesOf(item.sentence)));
    setPlaced([]);
  };

  // Novo item: peças embaralhadas; nos itens do Zé, ele embaralha de novo as que sobraram.
  useEffect(() => {
    reset();
    if (!zeItems.includes(run.index)) return;
    const t = setTimeout(() => {
      if (lockedRef.current) return;
      setBank(prev => (prev.length > 1 ? shuffled(prev) : prev));
      audioService.playFlip();
      showZe(ZE_SHUFFLE);
    }, ZE_SHUFFLE_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.index]);

  const place = (tile: Tile) => {
    if (run.locked) return;
    audioService.playClick();
    setBank(b => b.filter(t => t.id !== tile.id));
    setPlaced(p => [...p, tile]);
  };

  const unplace = (tile: Tile) => {
    if (run.locked) return;
    audioService.playClick();
    setPlaced(p => p.filter(t => t.id !== tile.id));
    setBank(b => [...b, tile]);
  };

  const check = () => {
    const correct = placed.map(t => t.word).join(' ') === item.sentence;
    run.answer(correct);
    // Errou a 1ª: devolve as peças para tentar de novo.
    if (!correct) reset();
  };

  const done = bank.length === 0 && placed.length > 0;

  return (
    <ActivityShell
      activity={LEVEL1_ORDER}
      index={run.index}
      total={items.length}
      secondsLeft={run.secondsLeft}
      score={run.score}
      feedback={run.feedback}
      locked={run.locked}
      finished={run.finished}
      correctCount={run.outcomes.filter(o => o.correct).length}
      revealText={item.sentence}
      onNext={run.next}
      overlay={<ZeCartinha visible={!!zeMessage && !run.finished} message={zeMessage ?? ''} />}
    >
      <div className="flex flex-col gap-3 short:gap-1.5">
        <p className="font-bold text-slate-700 text-sm sm:text-base text-center">
          Monte a frase: <span className="text-orange-700">“{item.pt}”</span>
        </p>

        <div
          aria-label="Frase montada"
          className="min-h-[3.25rem] rounded-2xl border-2 border-dashed border-orange-400 bg-orange-50/70 p-2 flex flex-wrap gap-2 items-center justify-center"
        >
          {placed.length === 0 && <span className="text-xs font-bold text-slate-400">Toque nas palavras abaixo</span>}
          {placed.map(tile => (
            <button
              key={tile.id}
              type="button"
              onClick={() => unplace(tile)}
              disabled={run.locked}
              className="px-3 py-1.5 rounded-xl bg-orange-500 border-2 border-orange-700 text-white font-heading font-black text-sm sm:text-base"
            >
              {tile.word}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 justify-center min-h-[2.75rem]">
          {bank.map(tile => (
            <button
              key={tile.id}
              type="button"
              onClick={() => place(tile)}
              disabled={run.locked}
              className="px-3 py-1.5 rounded-xl bg-white border-2 border-slate-300 hover:border-orange-500 text-slate-800 font-heading font-black text-sm sm:text-base"
            >
              {tile.word}
            </button>
          ))}
        </div>

        {!run.locked && (
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 rounded-full bg-white border-2 border-slate-300 font-heading font-black uppercase text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" /> Limpar
            </button>
            <button
              type="button"
              onClick={check}
              disabled={!done}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 border-2 border-amber-600 shadow-[0_4px_0_0_#b45309] font-heading font-black uppercase text-sm flex items-center gap-1 disabled:opacity-50 active:translate-y-1"
            >
              <Check className="w-4 h-4" /> Check
            </button>
          </div>
        )}
      </div>
    </ActivityShell>
  );
};

export default OrderScreen;
