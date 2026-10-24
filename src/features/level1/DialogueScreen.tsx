import React, { useEffect, useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { speechService } from '../../services/speech';
import { audioService } from '../../services/audio';
import { ZeCartinha } from '../../components/ze/ZeCartinha';
import { LEVEL1_DIALOGUE } from '../../content/level1';
import { LEVEL1_CONTENT, SPEAKER_IMAGES } from '../../data/level1Content';
import { ZE_INTERFERENCE, pickZeItems } from './level1Rules';
import { useActivityRun } from './useActivityRun';
import { ActivityShell, useZeInterrupt } from './ActivityShell';

const DialogueScreen: React.FC = () => {
  const { currentPlayer } = useGame();
  const grade = getPlayerGrade(currentPlayer);
  const turns = LEVEL1_CONTENT[grade ?? '8'].dialogue;
  const run = useActivityRun(LEVEL1_DIALOGUE, grade, turns.length);
  const zeTurns = useMemo(() => pickZeItems(turns.length, ZE_INTERFERENCE.dialogue), [turns.length]);
  const ze = useZeInterrupt(zeTurns.includes(run.index) && !run.finished, run.locked, run.index);

  const turn = turns[run.index];
  const [wrongPicks, setWrongPicks] = useState<number[]>([]);

  const play = () => {
    if (audioService.isSoundOn()) speechService.speakEnglish(turn.line);
  };

  useEffect(() => {
    setWrongPicks([]);
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.index]);

  const pick = (i: number) => {
    if (run.locked || ze.blocking || wrongPicks.includes(i)) return;
    const correct = i === turn.answer;
    if (!correct) setWrongPicks(w => [...w, i]);
    run.answer(correct);
  };

  return (
    <ActivityShell
      activity={LEVEL1_DIALOGUE}
      index={run.index}
      total={turns.length}
      secondsLeft={run.secondsLeft}
      score={run.score}
      feedback={run.feedback}
      locked={run.locked}
      finished={run.finished}
      correctCount={run.outcomes.filter(o => o.correct).length}
      revealText={turn.options[turn.answer]}
      onNext={run.next}
      overlay={<ZeCartinha {...ze.zeProps} visible={ze.zeProps.visible && !run.finished} />}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-center sm:items-start">
        <div className="flex sm:flex-col items-center gap-2 shrink-0">
          <img
            src={SPEAKER_IMAGES[turn.speaker]}
            alt={turn.speaker}
            className="w-16 h-16 sm:w-28 sm:h-28 short:w-14 short:h-14 object-contain rounded-2xl bg-emerald-50 border-2 border-emerald-500"
          />
          <span className="font-heading font-black text-sm text-emerald-800">{turn.speaker}</span>
        </div>

        <div className="flex-1 w-full flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <p className="flex-1 rounded-2xl rounded-tl-none bg-white border-2 border-emerald-500 px-4 py-2 short:py-1 font-heading font-black text-sm sm:text-lg short:text-sm text-slate-800">
              “{turn.line}”
            </p>
            <button
              type="button"
              onClick={play}
              aria-label="Ouvir de novo"
              className="p-2.5 rounded-full bg-emerald-600 border-2 border-emerald-800 text-white shadow-[0_3px_0_0_#065f46] active:translate-y-1"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <p className="font-bold text-slate-600 text-xs sm:text-sm">Escolha a melhor resposta:</p>
          <div className="grid gap-2 short:gap-1">
            {turn.options.map((opt, i) => {
              const isWrong = wrongPicks.includes(i);
              const showRight = run.locked && i === turn.answer;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => pick(i)}
                  disabled={run.locked || isWrong || ze.blocking}
                  className={`rounded-2xl border-2 px-4 py-2.5 short:py-1 text-left font-heading font-black text-sm sm:text-base transition-colors disabled:cursor-not-allowed ${
                    showRight ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                      : isWrong ? 'bg-red-50 border-red-300 text-red-400 opacity-60'
                      : 'bg-white border-slate-300 hover:border-emerald-500 text-slate-800'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ActivityShell>
  );
};

export default DialogueScreen;
