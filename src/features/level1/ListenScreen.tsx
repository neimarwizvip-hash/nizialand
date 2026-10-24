import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Backpack, Book, Calculator, Clock, Eraser, Pencil, Ruler, Scissors, Volume2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { speechService } from '../../services/speech';
import { audioService } from '../../services/audio';
import { ZeCartinha } from '../../components/ze/ZeCartinha';
import { LEVEL1_LISTEN } from '../../content/level1';
import { LEVEL1_CONTENT, ListenIcon, ListenOption } from '../../data/level1Content';
import { ZE_INTERFERENCE, pickZeItems, shuffled } from './level1Rules';
import { useActivityRun } from './useActivityRun';
import { ActivityShell, useZePop } from './ActivityShell';

const ICONS: Record<ListenIcon, LucideIcon> = {
  book: Book, pencil: Pencil, ruler: Ruler, backpack: Backpack,
  scissors: Scissors, eraser: Eraser, calculator: Calculator, clock: Clock,
};

// Falas provisórias do Zé (trocar pelo texto do Oliveira).
const ZE_SWAP = 'Opa! Troquei tudo de lugar. Hehehe!';
const ZE_SWAP_DELAY_MS = 3000;

const ListenScreen: React.FC = () => {
  const { currentPlayer } = useGame();
  const grade = getPlayerGrade(currentPlayer);
  const items = LEVEL1_CONTENT[grade ?? '8'].listen;
  const run = useActivityRun(LEVEL1_LISTEN, grade, items.length);
  const zeItems = useMemo(() => pickZeItems(items.length, ZE_INTERFERENCE.listen), [items.length]);
  const { zeMessage, showZe } = useZePop();

  const item = items[run.index];
  const [options, setOptions] = useState<ListenOption[]>(item.options);
  const [wrongPicks, setWrongPicks] = useState<ListenOption[]>([]);
  const lockedRef = useRef(run.locked);
  lockedRef.current = run.locked;

  const play = () => {
    if (audioService.isSoundOn()) speechService.speakEnglish(item.audio);
  };

  // Novo item: ouve a frase e, se for item do Zé, ele troca as opções de lugar.
  useEffect(() => {
    setOptions(item.options);
    setWrongPicks([]);
    play();
    if (!zeItems.includes(run.index)) return;
    const t = setTimeout(() => {
      // O Zé não mexe se o item já terminou.
      if (lockedRef.current) return;
      setOptions(prev => shuffled(prev));
      audioService.playFlip();
      showZe(ZE_SWAP);
    }, ZE_SWAP_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.index]);

  const pick = (opt: ListenOption) => {
    if (run.locked || wrongPicks.includes(opt)) return;
    const correct = opt === item.options[item.answer];
    if (!correct) setWrongPicks(w => [...w, opt]);
    run.answer(correct);
  };

  const iconMode = item.options.some(o => o.icon) || grade === '6';
  const answerOpt = item.options[item.answer];

  return (
    <ActivityShell
      activity={LEVEL1_LISTEN}
      index={run.index}
      total={items.length}
      secondsLeft={run.secondsLeft}
      score={run.score}
      feedback={run.feedback}
      locked={run.locked}
      finished={run.finished}
      correctCount={run.outcomes.filter(o => o.correct).length}
      revealText={answerOpt.text}
      onNext={run.next}
      overlay={<ZeCartinha visible={!!zeMessage && !run.finished} message={zeMessage ?? ''} />}
    >
      <div className="flex flex-col items-center gap-3 short:gap-1.5">
        <p className="font-bold text-slate-700 text-sm sm:text-base text-center">Ouça e escolha a resposta certa.</p>
        <button
          type="button"
          onClick={play}
          className="flex items-center gap-2 px-5 py-2.5 short:py-1 rounded-full bg-blue-600 border-2 border-blue-800 text-white font-heading font-black uppercase text-sm shadow-[0_4px_0_0_#1e3a8a] active:translate-y-1"
        >
          <Volume2 className="w-5 h-5" /> Listen again
        </button>
        <div className={`grid gap-2 sm:gap-3 w-full ${iconMode ? 'grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {options.map(opt => {
            const Icon = opt.icon ? ICONS[opt.icon] : null;
            const isWrong = wrongPicks.includes(opt);
            const showRight = run.locked && opt === answerOpt;
            return (
              <button
                key={opt.text}
                type="button"
                onClick={() => pick(opt)}
                disabled={run.locked || isWrong}
                aria-label={opt.text}
                className={`rounded-2xl border-2 font-heading font-black transition-colors ${
                  iconMode ? 'aspect-square sm:aspect-auto sm:h-32 short:aspect-auto short:h-20 flex items-center justify-center' : 'px-4 py-3 short:py-1.5 text-left text-sm sm:text-base'
                } ${
                  showRight ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                    : isWrong ? 'bg-red-50 border-red-300 text-red-400 opacity-60'
                    : 'bg-white border-slate-300 hover:border-blue-500 text-slate-800'
                }`}
              >
                {iconMode ? (Icon ? <Icon className="w-10 h-10 sm:w-14 sm:h-14" /> : <span className="text-3xl sm:text-5xl">{opt.text}</span>) : opt.text}
              </button>
            );
          })}
        </div>
      </div>
    </ActivityShell>
  );
};

export default ListenScreen;
