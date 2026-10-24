import React, { useState } from 'react';
import { CheckCircle2, MapPin, Search } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { getPlayerGrade } from '../../services/grade';
import { audioService } from '../../services/audio';
import { ZeCartinha } from '../../components/ze/ZeCartinha';
import { LEVEL1_EXPLORE } from '../../content/level1';
import { EXPLORE_TRAPS, ExploreSpot, LEVEL1_CONTENT } from '../../data/level1Content';
import { TRAP_PENALTY_SECONDS } from './level1Rules';
import { useActivityRun } from './useActivityRun';
import { ActivityShell, useZePop } from './ActivityShell';

// Fala provisória do Zé (trocar pelo texto do Oliveira).
const ZE_TRAP = `Hahaha! Caiu na minha armadilha! Menos ${TRAP_PENALTY_SECONDS} segundos!`;

// Cada lugar encontrado é um item: o cronômetro de 20 s conta a busca e a resposta.
const ExploreScreen: React.FC = () => {
  const { currentPlayer } = useGame();
  const grade = getPlayerGrade(currentPlayer);
  const spots = LEVEL1_CONTENT[grade ?? '8'].explore;
  const run = useActivityRun(LEVEL1_EXPLORE, grade, spots.length);
  const { zeMessage, showZe } = useZePop();

  const [active, setActive] = useState<ExploreSpot | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [usedTraps, setUsedTraps] = useState<number[]>([]);
  const [wrongPicks, setWrongPicks] = useState<number[]>([]);

  const open = (spot: ExploreSpot) => {
    if (run.locked || active || found.includes(spot.id)) return;
    audioService.playClick();
    setActive(spot);
    setWrongPicks([]);
  };

  const trap = (i: number) => {
    if (run.locked || active || usedTraps.includes(i)) return;
    setUsedTraps(t => [...t, i]);
    audioService.playWrong();
    run.penalty(TRAP_PENALTY_SECONDS);
    showZe(ZE_TRAP);
  };

  const pick = (i: number) => {
    if (!active || run.locked || wrongPicks.includes(i)) return;
    const correct = i === active.answer;
    if (!correct) setWrongPicks(w => [...w, i]);
    run.answer(correct);
  };

  // Ao seguir, o lugar aberto (ou, se o tempo acabou sem abrir, o próximo que faltava) fica marcado.
  const next = () => {
    const done = active ?? spots.find(s => !found.includes(s.id));
    if (done) setFound(f => [...f, done.id]);
    setActive(null);
    run.next();
  };

  return (
    <ActivityShell
      activity={LEVEL1_EXPLORE}
      index={run.index}
      total={spots.length}
      secondsLeft={run.secondsLeft}
      score={run.score}
      feedback={run.feedback}
      locked={run.locked}
      finished={run.finished}
      correctCount={run.outcomes.filter(o => o.correct).length}
      revealText={active ? active.options[active.answer] : undefined}
      onNext={next}
      overlay={<ZeCartinha visible={!!zeMessage && !run.finished} message={zeMessage ?? ''} />}
    >
      <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-start">
        <div className="relative h-[44vh] sm:h-auto sm:w-3/5 short:w-auto short:h-[54vh] aspect-[16/10] rounded-2xl overflow-hidden border-2 border-pink-500 shrink-0">
          <img src="/assets/nisialand_hallway_bg.jpg" alt="Corredor da escola" className="absolute inset-0 w-full h-full object-cover" />
          {EXPLORE_TRAPS.map((t, i) => (
            <button
              key={`trap-${i}`}
              type="button"
              onClick={() => trap(i)}
              disabled={usedTraps.includes(i)}
              aria-label="Algo escondido"
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 ${
                usedTraps.includes(i) ? 'bg-red-200/80 border-red-400 text-red-600 text-xs font-black' : 'bg-white/70 border-pink-300 text-pink-600'
              }`}
            >
              {usedTraps.includes(i) ? `-${TRAP_PENALTY_SECONDS}s` : <Search className="w-4 h-4" />}
            </button>
          ))}
          {spots.map(spot => {
            const isFound = found.includes(spot.id);
            const isActive = active?.id === spot.id;
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => open(spot)}
                disabled={isFound}
                aria-label={spot.place}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 shadow ${
                  isFound ? 'bg-emerald-500 border-emerald-700 text-white'
                    : isActive ? 'bg-pink-600 border-pink-800 text-white ring-4 ring-pink-300'
                    : 'bg-white/70 border-pink-300 text-pink-600'
                }`}
              >
                {isFound ? <CheckCircle2 className="w-5 h-5" /> : isActive ? <MapPin className="w-5 h-5" /> : <Search className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        <div className="flex-1 w-full flex flex-col gap-2">
          {active ? (
            <>
              <p className="font-heading font-black text-pink-700 text-sm">{active.place}</p>
              <p className="font-heading font-black text-slate-800 text-sm sm:text-base">{active.question}</p>
              <div className="grid gap-2">
                {active.options.map((opt, i) => {
                  const isWrong = wrongPicks.includes(i);
                  const showRight = run.locked && i === active.answer;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => pick(i)}
                      disabled={run.locked || isWrong}
                      className={`rounded-2xl border-2 px-3 py-2 short:py-1 text-left font-heading font-black text-sm transition-colors ${
                        showRight ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                          : isWrong ? 'bg-red-50 border-red-300 text-red-400 opacity-60'
                          : 'bg-white border-slate-300 hover:border-pink-500 text-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="font-bold text-slate-700 text-sm sm:text-base">
              Explore o corredor: toque nas lupas para achar os lugares da escola. Cuidado com as armadilhas do Zé!
              <span className="block mt-1 text-pink-700 font-heading font-black">{found.length} / {spots.length} lugares encontrados</span>
            </p>
          )}
        </div>
      </div>
    </ActivityShell>
  );
};

export default ExploreScreen;
