import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Activity, ActivityResult } from '../../core/types';
import type { SchoolGrade } from '../../data/level0Content';
import { shuffleOptions, shuffled } from '../level2/level2Rules';
import { speechService } from '../../services/speech';
import { buildLevel4RunResult } from './level4Rules';
import { level4QuestionPool } from './level4QuestionPool';
import { BotaoJogo, Cronometro, Ficha, Fita, Icone, Moedas, Painel } from '../../components/kit';
import type { NomeIcone } from '../../components/kit';

const CLUE_PLACES = ['Biblioteca', 'Pátio', 'Secretaria'] as const;
const ICONE_LUGAR: Record<typeof CLUE_PLACES[number], NomeIcone> = { Biblioteca: 'livro', 'Pátio': 'casa', Secretaria: 'professor' };
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

  const letras = 'ABCD';
  const acertos = outcomes.filter(Boolean).length;
  if (!question) return (
    <Painel tipo="papel" className="m-6 p-6 text-center">
      <p className="font-display text-nisia-tinta">Conteúdo indisponível.</p>
      <BotaoJogo cor="papel" tamanho="sm" onClick={onExit} className="mt-3">Voltar</BotaoJogo>
    </Painel>
  );
  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 md:py-5 short:py-1 flex flex-col justify-center">
      <Painel tipo="mural" as="section" aria-label={activity.name} className="p-3 sm:p-5 short:p-2 flex flex-col gap-3 short:gap-1.5">
        {/* Cabeçalho da atividade */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Ficha cor="sol">{isClues ? (clues < CLUE_PLACES.length ? `Pista ${clues + 1} de ${CLUE_PLACES.length}` : 'Etapa 4 de 4') : `Etapa ${index + 1} de ${pool.length}`}</Ficha>
            <h1 className="font-display text-base sm:text-lg short:text-sm text-nisia-papel drop-shadow-[0_2px_0_rgba(90,50,10,0.8)] truncate">{activity.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            {isRelay && <Cronometro segundos={seconds} total={20} alerta={5} tamanho={48} className="short:!w-10 short:!h-10" />}
            <Moedas valor={acertos * 100} compacto />
            <BotaoJogo cor="papel" tamanho="sm" onClick={onExit}><Icone nome="seta" className="w-4 h-4 rotate-180" /> Equipe</BotaoJogo>
          </div>
        </div>

        {isClues && clues < CLUE_PLACES.length ? (
          <section aria-label="Mapa de pistas" className="flex flex-col gap-2 short:gap-1">
            <Painel tipo="papel" liso className="px-4 py-3 short:py-1.5 text-center">
              <p className="font-display text-2xl sm:text-3xl short:text-lg leading-tight text-nisia-azul-700">{CLUE_HINTS[clues]}</p>
              <p className="text-sm short:text-xs text-nisia-tinta-suave font-semibold mt-1">Leia a pista em inglês e escolha o local.</p>
            </Painel>
            <div className="grid grid-cols-3 gap-3 short:gap-1.5">
              {CLUE_PLACES.map((place, k) => (
                <button
                  type="button"
                  key={place}
                  onClick={() => { if (place === CLUE_PLACES[clues]) { setOutcomes(prev => [...prev, !wrongClue]); setClues(c => c + 1); setWrongClue(false); } else setWrongClue(true); }}
                  className={`kit-papel kit-papel--liso rounded-2xl border-2 border-nisia-papel-linha p-3 short:p-1.5 flex flex-col items-center gap-1 font-display text-lg short:text-sm text-nisia-azul-700 hover:-translate-y-1 transition-transform focus-visible:outline-4 focus-visible:outline-nisia-laranja-500 ${['-rotate-1', 'rotate-1', '-rotate-[0.5deg]'][k]}`}
                >
                  <Icone nome={ICONE_LUGAR[place]} className="w-12 h-12 short:w-7 short:h-7 text-nisia-tinta" />
                  {place}
                </button>
              ))}
            </div>
            <p className="text-sm short:text-xs font-semibold text-nisia-papel drop-shadow-[0_1px_0_rgba(90,50,10,0.8)]">Pistas encontradas: {clues}/{CLUE_PLACES.length}</p>
            {wrongClue && <p role="status" className="kit-balao kit-balao--esq !py-1.5 text-sm font-semibold text-nisia-laranja-700 self-start">Esse não é o local. Releia a pista e tente novamente.</p>}
          </section>
        ) : (
          <section className="flex flex-col gap-3 short:gap-1.5">
            <Painel tipo="papel" liso className="px-4 py-3 short:py-1.5 text-center">
              <p className="font-display text-2xl sm:text-3xl short:text-lg leading-tight text-nisia-azul-700">{question.prompt}</p>
              {activity.id === 'nivel4-direcoes' && (
                <div className="mt-2 short:mt-1 flex flex-wrap items-center justify-center gap-2">
                  <span aria-label="Percurso pela escola" className="inline-flex items-center gap-1.5 kit-ficha kit-ficha--azul normal-case tracking-normal">
                    Pátio <Icone nome="seta" className="w-3.5 h-3.5" /> Corredor <Icone nome="seta" className="w-3.5 h-3.5" /> Biblioteca
                  </span>
                  <BotaoJogo cor="azul" tamanho="sm" onClick={() => speechService.speakEnglish(question.prompt)}><Icone nome="som" className="w-4 h-4" /> Ouvir direção</BotaoJogo>
                </div>
              )}
              {isRelay && (
                <div className="mt-2 short:mt-1 max-w-sm mx-auto" aria-label={`Equipe avançou ${index} de ${pool.length} etapas`}>
                  <Fita frac={index / pool.length} rotulo="Avanço da equipe" />
                  <p className="text-xs text-nisia-tinta-suave mt-1 short:hidden">A equipe avança a cada pergunta.</p>
                </div>
              )}
            </Painel>

            {isMessage ? (
              <div className="flex flex-col gap-2 short:gap-1">
                <p className="text-sm font-semibold text-nisia-papel drop-shadow-[0_1px_0_rgba(90,50,10,0.8)]">Toque nas palavras para montar a mensagem.</p>
                <div aria-label="Mensagem montada" className="kit-papel kit-papel--liso min-h-14 short:min-h-10 px-3 py-2 rounded-xl border-2 border-dashed border-nisia-azul-400 font-display text-lg short:text-sm text-nisia-tinta">
                  {words.map(id => shuffledWords.find(w => w.id === id)?.word).join(' ') || <span className="text-nisia-tinta-suave font-body font-semibold text-sm">Sua frase aparecerá aqui</span>}
                </div>
                <div className="flex flex-wrap gap-2 short:gap-1">
                  {shuffledWords.filter(w => !words.includes(w.id)).map(w => (
                    <button type="button" key={w.id} onClick={() => selectWord(w.id)} className="kit-ficha kit-ficha--sol !text-base short:!text-sm !px-3 !py-1.5 normal-case tracking-normal hover:-translate-y-0.5 transition-transform">{w.word}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <BotaoJogo cor="verde" tamanho="sm" disabled={hasFeedback || words.length !== rightWords.length} onClick={checkMessage} className="disabled:opacity-50">Conferir</BotaoJogo>
                  <BotaoJogo cor="papel" tamanho="sm" disabled={hasFeedback} onClick={() => setWords([])}>Recomeçar frase</BotaoJogo>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 short:gap-1.5">
                {question.options.map((option, i) => {
                  let estado = 'bg-nisia-papel border-nisia-papel-linha hover:-translate-y-0.5';
                  let bolinha = 'bg-nisia-sol-400 border-nisia-sol-700 text-nisia-tinta';
                  if (hasFeedback && i === question.answer) { estado = 'bg-nisia-verde-100 border-nisia-verde-500 ring-4 ring-nisia-verde-400/50'; bolinha = 'bg-nisia-verde-500 border-nisia-verde-700 text-white'; }
                  else if (hasFeedback && i === choice) { estado = 'bg-red-50 border-nisia-erro'; bolinha = 'bg-nisia-erro border-red-800 text-white'; }
                  else if (hasFeedback) estado = 'bg-nisia-papel border-nisia-papel-linha opacity-50';
                  return (
                    <button type="button" key={`${i}-${option}`} disabled={hasFeedback} onClick={() => submit(i === question.answer, i)}
                      className={`relative text-left flex items-center gap-3 px-3.5 py-3 short:py-1.5 rounded-xl border-2 shadow-[0_4px_0_0_#E7D3A6] transition-all text-nisia-tinta disabled:cursor-default ${estado}`}>
                      <span aria-hidden="true" className={`w-9 h-9 short:w-7 short:h-7 rounded-full border-2 flex items-center justify-center font-display text-lg short:text-base shrink-0 ${bolinha}`}>{letras[i] ?? i + 1}</span>
                      <span className="text-base sm:text-lg short:text-sm font-semibold flex-1 leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {hasFeedback && (
              <Painel tipo="papel" liso role="status" className="px-4 py-3 short:py-1.5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-rise-in">
                <div>
                  <p className={`inline-flex items-center gap-2 font-display text-lg short:text-base ${choice === question.answer ? 'text-nisia-verde-700' : 'text-nisia-erro'}`}>
                    <Icone nome={choice === question.answer ? 'check' : 'x'} className="w-6 h-6" /> {choice === question.answer ? 'Resposta correta! +100 pontos.' : 'Confira a resposta correta acima.'}
                  </p>
                  <p className="text-sm short:text-xs text-nisia-tinta mt-1 max-w-xl leading-snug">{question.explanation}</p>
                </div>
                {finished
                  ? <BotaoJogo cor="laranja" onClick={onExit} className="shrink-0">Voltar à equipe · {acertos * 100} pontos</BotaoJogo>
                  : <BotaoJogo cor="laranja" onClick={nextQuestion} className="shrink-0">Próxima etapa <Icone nome="seta" className="w-5 h-5" /></BotaoJogo>}
              </Painel>
            )}
          </section>
        )}
      </Painel>
    </main>
  );
};
