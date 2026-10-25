import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock3, MapPin, Volume2 } from 'lucide-react';
import type { Activity, ActivityResult } from '../../core/types';
import type { SchoolGrade } from '../../data/level0Content';
import { shuffleOptions, shuffled } from '../level2/level2Rules';
import { speechService } from '../../services/speech';
import { buildLevel4RunResult } from './level4Rules';
import { level4QuestionPool } from './level4QuestionPool';

const CLUE_PLACES = ['Biblioteca', 'Pátio', 'Secretaria'] as const;
const CLUE_HINTS = ['The clue is next to the library.', 'Look for the next clue in the schoolyard.', 'Find the final clue by the office.'] as const;

interface Props {
  activity: Activity;
  grade: SchoolGrade;
  onExit: () => void;
  onSave: (result: ActivityResult) => void;
}

export const Level4Activities: React.FC<Props> = ({ activity, grade, onExit, onSave }) => {
  const startedAt = useRef(new Date().toISOString());
  const pool = useMemo(() => level4QuestionPool(activity.id, grade).map(q => ({ ...q, ...shuffleOptions(q.options, q.answer) })), [activity.id, grade]);
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<boolean[]>([]);
  const [choice, setChoice] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [clues, setClues] = useState(0);
  const [wrongClue, setWrongClue] = useState(false);
  const [words, setWords] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(20);
  const question = pool[index];
  const isClues = activity.id === 'nivel4-pistas';
  const isMessage = activity.id === 'nivel4-mensagem';
  const isRelay = activity.id === 'nivel4-revezamento';
  const rightWords = useMemo(() => pool[0]?.options[pool[0].answer].split(/\s+/) ?? [], [pool]);
  const shuffledWords = useMemo(() => shuffled(rightWords.map((word, i) => ({ word, id: i }))), [rightWords]);
  const hasFeedback = choice !== null;

  const submit = (correct: boolean, selected: number) => {
    if (hasFeedback || finished) return;
    const next = [...outcomes, correct];
    setOutcomes(next);
    setChoice(selected);
    if (index + 1 >= pool.length) {
      onSave(buildLevel4RunResult(activity, grade, next, startedAt.current));
      setFinished(true);
    }
  };

  useEffect(() => {
    if (!isRelay || hasFeedback || finished || !question) return;
    const timer = window.setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [isRelay, hasFeedback, finished, question, index]);
  useEffect(() => {
    if (isRelay && seconds === 0 && !hasFeedback && !finished) submit(false, -1);
    // submit reads the current round; the countdown itself is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const nextQuestion = () => { setIndex(i => i + 1); setChoice(null); setWords([]); setSeconds(20); };
  const selectWord = (id: number) => { if (!hasFeedback) setWords(prev => [...prev, id]); };
  const checkMessage = () => {
    const selected = words.map(id => shuffledWords.find(w => w.id === id)?.word);
    submit(selected.join(' ') === rightWords.join(' '), selected.join(' ') === rightWords.join(' ') ? question.answer : -1);
  };

  if (!question) return <div className="game-panel p-6">Conteúdo indisponível. <button onClick={onExit}>Voltar</button></div>;
  return (
    <main className="min-h-screen game-sky p-3 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <button type="button" onClick={onExit} className="mb-3 px-4 py-2 rounded-xl bg-white border-2 border-sky-300 font-black inline-flex items-center gap-2"><ArrowLeft size={18} /> Equipe</button>
        <div className="game-panel p-5 sm:p-8">
          <p className="text-xs font-black tracking-widest text-orange-700">NÍVEL 4 · {activity.name.toUpperCase()}</p>
          <h1 className="font-bungee text-2xl sm:text-4xl text-blue-900 mt-2">{activity.name}</h1>
          <div className="mt-3 flex items-center justify-between gap-2 font-bold text-slate-600">
            <span>{isClues ? (clues < CLUE_PLACES.length ? `Pista ${clues + 1} de ${CLUE_PLACES.length}` : 'Etapa 4 de 4') : `Etapa ${index + 1} de ${pool.length}`}</span>
            {isRelay && <span role="timer" className="inline-flex items-center gap-1 text-orange-700"><Clock3 size={17} /> {seconds}s</span>}
          </div>

          {isClues && clues < CLUE_PLACES.length ? (
            <section aria-label="Mapa de pistas" className="mt-6">
              <p className="font-heading font-black text-blue-900 mb-1">{CLUE_HINTS[clues]}</p>
              <p className="text-sm text-slate-600 mb-3">Leia a pista em inglês e escolha o local.</p>
              <div className="grid grid-cols-3 gap-2 rounded-3xl border-4 border-sky-200 bg-sky-50 p-4 min-h-44 items-center">
                {CLUE_PLACES.map(place => <button type="button" key={place} onClick={() => { if (place === CLUE_PLACES[clues]) { setOutcomes(prev => [...prev, !wrongClue]); setClues(c => c + 1); setWrongClue(false); } else setWrongClue(true); }} className="rounded-2xl bg-white border-2 border-blue-300 p-3 font-black text-blue-900 hover:bg-amber-100 focus-visible:outline-4 focus-visible:outline-orange-500"><MapPin className="mx-auto mb-1" />{place}</button>)}
              </div>
              <p className="mt-2 text-sm text-slate-600">Pistas encontradas: {clues}/{CLUE_PLACES.length}</p>
              {wrongClue && <p role="status" className="mt-2 text-sm font-black text-amber-800">Esse não é o local. Releia a pista e tente novamente.</p>}
            </section>
          ) : (
            <section className="mt-6">
              <p className="font-heading font-black text-lg text-blue-900">{question.prompt}</p>
              {activity.id === 'nivel4-direcoes' && <><div aria-label="Percurso pela escola" className="flex items-center gap-2 mt-3 rounded-xl bg-sky-100 border border-sky-300 p-3 text-xs sm:text-sm font-black text-blue-900"><span>Pátio</span><ArrowRight size={16} /><span>Corredor</span><ArrowRight size={16} /><span>Biblioteca</span></div><button type="button" onClick={() => speechService.speakEnglish(question.prompt)} className="mt-3 rounded-xl bg-sky-100 border-2 border-sky-300 px-3 py-2 font-black inline-flex items-center gap-2"><Volume2 size={18} /> Ouvir direção</button></>}
              {isRelay && <div className="mt-3" aria-label={`Equipe avançou ${index} de ${pool.length} etapas`}><div className="h-3 rounded-full bg-slate-200 overflow-hidden"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${index / pool.length * 100}%` }} /></div><p className="text-xs text-slate-600 mt-1">A equipe avança a cada pergunta.</p></div>}
              {isMessage ? (
                <>
                  <p className="mt-4 font-bold text-slate-600">Toque nas palavras para montar a mensagem.</p>
                  <div aria-label="Mensagem montada" className="min-h-16 mt-2 p-3 rounded-xl bg-white border-2 border-blue-300 font-black">{words.map(id => shuffledWords.find(w => w.id === id)?.word).join(' ') || 'Sua frase aparecerá aqui'}</div>
                  <div className="flex flex-wrap gap-2 mt-3">{shuffledWords.filter(w => !words.includes(w.id)).map(w => <button type="button" key={w.id} onClick={() => selectWord(w.id)} className="px-3 py-2 rounded-xl border-2 border-amber-500 bg-amber-100 font-black">{w.word}</button>)}</div>
                  <div className="flex gap-2 mt-4"><button type="button" disabled={hasFeedback || words.length !== rightWords.length} onClick={checkMessage} className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-black disabled:opacity-50">Conferir</button><button type="button" disabled={hasFeedback} onClick={() => setWords([])} className="px-4 py-2 rounded-xl bg-white border-2 border-slate-300 font-black">Recomeçar frase</button></div>
                </>
              ) : (
                <div className="grid gap-3 mt-5">{question.options.map((option, i) => <button type="button" key={`${i}-${option}`} disabled={hasFeedback} onClick={() => submit(i === question.answer, i)} className={`text-left p-4 rounded-2xl border-2 font-heading font-black ${hasFeedback && i === question.answer ? 'bg-emerald-100 border-emerald-500' : hasFeedback && i === choice ? 'bg-red-100 border-red-500' : 'bg-white border-slate-300 hover:border-orange-500'} disabled:cursor-default`}>{option}</button>)}</div>
              )}
              {hasFeedback && <div role="status" className="mt-5 rounded-2xl bg-orange-50 border-2 border-orange-200 p-4"><p className="font-black">{choice === question.answer ? 'Resposta correta! +100 pontos.' : 'Confira a resposta correta acima.'}</p><p className="text-sm text-slate-600 mt-1">{question.explanation}</p>{finished ? <button type="button" onClick={onExit} className="mt-3 px-5 py-2 rounded-xl bg-amber-400 border-2 border-amber-700 font-black">Voltar à equipe · {outcomes.filter(Boolean).length * 100} pontos</button> : <button type="button" onClick={nextQuestion} className="mt-3 px-5 py-2 rounded-xl bg-amber-400 border-2 border-amber-700 font-black inline-flex items-center gap-2">Próxima etapa <ArrowRight size={18} /></button>}</div>}
            </section>
          )}
        </div>
      </div>
    </main>
  );
};
