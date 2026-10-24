import { useCallback, useEffect, useRef, useState } from 'react';
import type { Activity } from '../../core/types';
import type { SchoolGrade } from '../../data/level0Content';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';
import { ITEM_SECONDS, ItemOutcome, buildResult, itemPoints } from './level1Rules';

export type Feedback = null | 'correct' | 'wrong' | 'reveal' | 'timeout';

// Andamento comum das atividades do Nível 1: item atual, 20 s por item, 2 tentativas, pontos e salvar.
export function useActivityRun(activity: Activity, grade: SchoolGrade | null, total: number) {
  const { saveActivityResult } = useGame();
  const startedAt = useRef(new Date().toISOString());
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ITEM_SECONDS);
  const [attempt, setAttempt] = useState(1);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [outcomes, setOutcomes] = useState<ItemOutcome[]>([]);
  const [finished, setFinished] = useState(false);

  const locked = feedback === 'correct' || feedback === 'reveal' || feedback === 'timeout';

  const record = useCallback((o: ItemOutcome, fb: Feedback) => {
    setOutcomes(prev => [...prev, o]);
    setFeedback(fb);
  }, []);

  // Cronômetro do item; para quando o item já foi resolvido.
  useEffect(() => {
    if (locked || finished) return;
    if (secondsLeft <= 0) {
      audioService.playWrong();
      record({ points: itemPoints(attempt, true), correct: false }, 'timeout');
      return;
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, locked, finished, attempt, record]);

  /** Responde o item atual. Errar 2 vezes revela a resposta e vale 0. */
  const answer = useCallback((correct: boolean) => {
    if (locked || finished) return;
    if (correct) {
      audioService.playCorrect();
      record({ points: itemPoints(attempt), correct: true }, 'correct');
    } else if (attempt >= 2) {
      audioService.playWrong();
      record({ points: 0, correct: false }, 'reveal');
    } else {
      audioService.playWrong();
      setAttempt(a => a + 1);
      setFeedback('wrong');
    }
  }, [locked, finished, attempt, record]);

  const penalty = useCallback((s: number) => setSecondsLeft(v => Math.max(0, v - s)), []);

  const next = useCallback(() => {
    if (index + 1 >= total) {
      saveActivityResult(buildResult(activity, grade, outcomes, startedAt.current));
      audioService.playFanfare();
      setFinished(true);
      return;
    }
    setIndex(i => i + 1);
    setSecondsLeft(ITEM_SECONDS);
    setAttempt(1);
    setFeedback(null);
  }, [index, total, activity, grade, outcomes, saveActivityResult]);

  const score = outcomes.reduce((t, o) => t + o.points, 0);

  return { index, secondsLeft, attempt, feedback, locked, finished, outcomes, score, answer, penalty, next };
}
