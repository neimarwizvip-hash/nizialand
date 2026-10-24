import { useCallback, useEffect, useRef, useState } from 'react';
import type { Activity } from '../../core/types';
import type { SchoolGrade } from '../../data/level0Content';
import { useGame } from '../../context/GameContext';
import { audioService } from '../../services/audio';
import { LEVEL2_FEEDBACK_MS, LEVEL2_ITEM_SECONDS, LEVEL2_POINT_FIRST, buildLevel2Result } from './level2Rules';

export type Level2Feedback = null | 'correct' | 'wrong' | 'timeout';
export interface Level2Outcome { points: number; correct: boolean }

export interface Level2RunOptions {
  activity: Activity;
  grade: SchoolGrade | null;
  // Quantos itens a atividade tem (Infinity na corrida, que recicla itens até o tempo acabar).
  total: number;
  // Cronômetro por item (null = sem cronômetro por item).
  itemSeconds?: number | null;
  // Cronômetro da atividade inteira (corrida 60 s, caça-palavras 90 s).
  runSeconds?: number | null;
  // Acerto sem pausa de feedback (caça-palavras: o aluno continua procurando).
  instant?: boolean;
  // Encerra antes do total (duelo: alguém ficou sem cartas).
  endWhen?: (outcomes: Level2Outcome[]) => boolean;
}

// Andamento comum do Nível 2: uma tentativa por item, 20 s, errou = mostra a certa por 1,5 s e avança sozinho.
export function useLevel2Run({ activity, grade, total, itemSeconds = LEVEL2_ITEM_SECONDS, runSeconds = null, instant = false, endWhen }: Level2RunOptions) {
  const { saveActivityResult } = useGame();
  const startedAt = useRef(new Date().toISOString());
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(itemSeconds ?? 0);
  const [runLeft, setRunLeft] = useState(runSeconds ?? 0);
  const [feedback, setFeedback] = useState<Level2Feedback>(null);
  const [outcomes, setOutcomes] = useState<Level2Outcome[]>([]);
  const [finished, setFinished] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>();
  const saved = useRef(false);
  const outcomesRef = useRef<Level2Outcome[]>([]);

  const locked = feedback !== null;

  const finish = useCallback((padTo?: number) => {
    clearTimeout(advanceTimer.current);
    let list = outcomesRef.current;
    // Itens que ficaram sem resposta quando o tempo da atividade acabou contam como errados.
    if (padTo !== undefined && Number.isFinite(padTo)) {
      while (list.length < padTo) list = [...list, { points: 0, correct: false }];
    }
    outcomesRef.current = list;
    setOutcomes(list);
    setFinished(true);
    if (!saved.current) {
      saved.current = true;
      saveActivityResult(buildLevel2Result(activity, grade, list, startedAt.current));
    }
  }, [activity, grade, saveActivityResult]);

  const record = useCallback((correct: boolean, fb: Exclude<Level2Feedback, null>) => {
    if (finished) return;
    const list = [...outcomesRef.current, { points: correct ? LEVEL2_POINT_FIRST : 0, correct }];
    outcomesRef.current = list;
    setOutcomes(list);
    if (correct) audioService.playCorrect(); else audioService.playWrong();
    const done = list.length >= total || (endWhen?.(list) ?? false);
    if (instant && correct) {
      if (done) finish();
      else setIndex(i => i + 1);
      return;
    }
    setFeedback(fb);
    advanceTimer.current = setTimeout(() => {
      if (done) { finish(); return; }
      setIndex(i => i + 1);
      setSecondsLeft(itemSeconds ?? 0);
      setFeedback(null);
    }, LEVEL2_FEEDBACK_MS);
  }, [finished, total, endWhen, instant, finish, itemSeconds]);

  /** Responde o item atual (uma tentativa só). */
  const answer = useCallback((correct: boolean) => {
    if (locked || finished) return;
    record(correct, correct ? 'correct' : 'wrong');
  }, [locked, finished, record]);

  // Cronômetro do item: pausa durante o feedback; no 0 conta como errado, 0 ponto.
  useEffect(() => {
    if (itemSeconds === null || locked || finished) return;
    if (secondsLeft <= 0) { record(false, 'timeout'); return; }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [itemSeconds, secondsLeft, locked, finished, record]);

  // Cronômetro da atividade: no 0 encerra na hora.
  useEffect(() => {
    if (runSeconds === null || finished) return;
    if (runLeft <= 0) { finish(total); return; }
    const t = setTimeout(() => setRunLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [runSeconds, runLeft, finished, finish, total]);

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  const score = outcomes.reduce((t, o) => t + o.points, 0);
  const correctCount = outcomes.filter(o => o.correct).length;
  // O relógio do cabeçalho: o da atividade quando existe, senão o do item.
  const clock = runSeconds !== null ? runLeft : secondsLeft;

  return { index, secondsLeft, runLeft, clock, feedback, locked, finished, outcomes, score, correctCount, answer, finish };
}
