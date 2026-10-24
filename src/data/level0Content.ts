// Conteúdo do Nível 0 por série (6º ao 9º).
// 8º ano: quiz de comparativos + flashcards de idades (conteúdo original).
// 6º, 7º e 9º: quiz sorteado do banco de questões + flashcards com fatos em inglês.
import { FlashcardChallenge, FlashcardStudent, QuizQuestion } from '../types';
import { FLASHCARD_CHALLENGES, FLASHCARD_STUDENTS } from './flashcardData';
import { getRandomizedQuizSession } from './quizQuestions';
import { buildRound, topicsForGrade } from './questionBank';

export type SchoolGrade = '6' | '7' | '8' | '9';
export const SCHOOL_GRADES: SchoolGrade[] = ['6', '7', '8', '9'];

export const GRADE_LABELS: Record<SchoolGrade, string> = {
  '6': '6º ano',
  '7': '7º ano',
  '8': '8º ano',
  '9': '9º ano'
};

export const GRADE_QUIZ_THEME: Record<SchoolGrade, string> = {
  '6': 'Verb to be, números e vocabulário',
  '7': 'Simple past e rotina',
  '8': 'Comparativos (older, younger, as old as)',
  '9': 'Present perfect e conectivos'
};

export const GRADE_FLASHCARD_THEME: Record<SchoolGrade, string> = {
  '6': 'Verb to be, idades e vocabulário',
  '7': 'Simple past e rotina',
  '8': 'Idades e comparativos',
  '9': 'Present perfect e conectivos'
};

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
export const QUIZ_SESSION_SIZE = 5;

export function getQuizSession(grade: SchoolGrade): QuizQuestion[] {
  if (grade === '8') return getRandomizedQuizSession(QUIZ_SESSION_SIZE);
  const round = buildRound(topicsForGrade(grade).map((t) => t.id), QUIZ_SESSION_SIZE);
  return round.map((q, index) => {
    const options = q.shuffled.map((text, i) => ({
      letter: LETTERS[i],
      text,
      isCorrect: i === q.correctIndex
    }));
    return {
      id: index + 1,
      activity: 1,
      activityTitle: GRADE_QUIZ_THEME[grade],
      instruction: 'Escolha a alternativa correta.',
      sentence: q.prompt,
      spokenText: q.prompt,
      contextHint: q.promptPt ?? '',
      hint: q.explanation,
      optionsSheet: options,
      optionsQuad: options,
      explanation: q.explanation
    };
  });
}

export interface FlashcardSet {
  students: FlashcardStudent[];
  challenges: FlashcardChallenge[];
  memorizeTitle: string;
}

// O que aparece na carta: o fato da série ou a idade (8º ano).
export function cardFact(student: FlashcardStudent): string {
  return student.info ?? `${student.age} years old`;
}

function withInfo(facts: Record<string, string>): FlashcardStudent[] {
  return FLASHCARD_STUDENTS.map((s) => ({ ...s, info: facts[s.id] }));
}

function byIds(ids: string[]) {
  return (card: FlashcardStudent) => ids.includes(card.id);
}

const GRADE6_FACTS: Record<string, string> = {
  juliana: 'I am 12. My favorite color is red.',
  mateus: 'I am 14. I am tall.',
  carlos: 'I am 13. I have a dog.',
  gabriel: 'I am 11. I am from Bahia.',
  rafael: 'I am 12. I have a cat.',
  beatriz: 'I am 14. My favorite color is blue.',
  larissa: 'I am 13. I am from Rio.',
  sofia: 'I am 12. I have a dog.'
};

const GRADE6_CHALLENGES: FlashcardChallenge[] = [
  { id: 601, targetName: 'Mateus', questionEn: 'Who is 14 years old?', questionPt: 'Quem tem 14 anos?', ruleExplanation: 'Mateus and Beatriz say "I am 14".', validateCard: byIds(['mateus', 'beatriz']) },
  { id: 602, targetName: 'Carlos', questionEn: 'Who has a dog?', questionPt: 'Quem tem um cachorro?', ruleExplanation: 'Carlos and Sofia say "I have a dog".', validateCard: byIds(['carlos', 'sofia']) },
  { id: 603, targetName: 'Gabriel', questionEn: 'Who is from Bahia?', questionPt: 'Quem é da Bahia?', ruleExplanation: 'Gabriel says "I am from Bahia".', validateCard: byIds(['gabriel']) },
  { id: 604, targetName: 'Juliana', questionEn: 'Whose favorite color is red?', questionPt: 'Quem tem o vermelho como cor favorita?', ruleExplanation: 'Juliana says "My favorite color is red".', validateCard: byIds(['juliana']) },
  { id: 605, targetName: 'Rafael', questionEn: 'Who has a cat?', questionPt: 'Quem tem um gato?', ruleExplanation: 'Rafael says "I have a cat".', validateCard: byIds(['rafael']) }
];

const GRADE7_FACTS: Record<string, string> = {
  juliana: 'Yesterday I played soccer.',
  mateus: 'I get up at 6 every day.',
  carlos: 'Last night I watched a movie.',
  gabriel: 'I go to school by bus.',
  rafael: 'Yesterday I played video games.',
  beatriz: 'Last weekend I visited my grandma.',
  larissa: 'I have lunch at 12 every day.',
  sofia: 'Last night I watched TV.'
};

const GRADE7_CHALLENGES: FlashcardChallenge[] = [
  { id: 701, targetName: 'Juliana', questionEn: 'Who played soccer yesterday?', questionPt: 'Quem jogou futebol ontem?', ruleExplanation: 'Juliana: "Yesterday I played soccer." (played = simple past of play)', validateCard: byIds(['juliana']) },
  { id: 702, targetName: 'Carlos', questionEn: 'Who watched something last night?', questionPt: 'Quem assistiu a alguma coisa ontem à noite?', ruleExplanation: 'Carlos watched a movie and Sofia watched TV last night.', validateCard: byIds(['carlos', 'sofia']) },
  { id: 703, targetName: 'Beatriz', questionEn: 'Who visited their grandma last weekend?', questionPt: 'Quem visitou a avó no fim de semana passado?', ruleExplanation: 'Beatriz: "Last weekend I visited my grandma."', validateCard: byIds(['beatriz']) },
  { id: 704, targetName: 'Mateus', questionEn: 'Who gets up at 6 every day?', questionPt: 'Quem acorda às 6 todos os dias?', ruleExplanation: 'Mateus: "I get up at 6 every day." (routine = simple present)', validateCard: byIds(['mateus']) },
  { id: 705, targetName: 'Gabriel', questionEn: 'Who goes to school by bus?', questionPt: 'Quem vai para a escola de ônibus?', ruleExplanation: 'Gabriel: "I go to school by bus."', validateCard: byIds(['gabriel']) }
];

const GRADE9_FACTS: Record<string, string> = {
  juliana: 'I have been to London.',
  mateus: 'I have never eaten sushi.',
  carlos: 'I have lived here since 2015.',
  gabriel: 'I studied hard, so I passed the test.',
  rafael: "I like math, but I don't like science.",
  beatriz: 'I have already finished my homework.',
  larissa: 'I stayed home because it was raining.',
  sofia: 'I have been to Paris.'
};

const GRADE9_CHALLENGES: FlashcardChallenge[] = [
  { id: 901, targetName: 'Juliana', questionEn: 'Who has been to a European city?', questionPt: 'Quem já esteve em uma cidade europeia?', ruleExplanation: 'Juliana has been to London and Sofia has been to Paris.', validateCard: byIds(['juliana', 'sofia']) },
  { id: 902, targetName: 'Beatriz', questionEn: 'Who has already finished the homework?', questionPt: 'Quem já terminou a lição de casa?', ruleExplanation: 'Beatriz: "I have already finished my homework."', validateCard: byIds(['beatriz']) },
  { id: 903, targetName: 'Carlos', questionEn: 'Who has lived here since 2015?', questionPt: 'Quem mora aqui desde 2015?', ruleExplanation: 'Carlos: "I have lived here since 2015." (since + starting point)', validateCard: byIds(['carlos']) },
  { id: 904, targetName: 'Gabriel', questionEn: 'Who passed the test as a result of studying hard?', questionPt: 'Quem passou na prova por ter estudado muito?', ruleExplanation: 'Gabriel: "I studied hard, so I passed the test." (so = result)', validateCard: byIds(['gabriel']) },
  { id: 905, targetName: 'Larissa', questionEn: 'Who stayed home because of the rain?', questionPt: 'Quem ficou em casa por causa da chuva?', ruleExplanation: 'Larissa: "I stayed home because it was raining." (because = reason)', validateCard: byIds(['larissa']) }
];

export function getFlashcardSet(grade: SchoolGrade): FlashcardSet {
  switch (grade) {
    case '6':
      return { students: withInfo(GRADE6_FACTS), challenges: GRADE6_CHALLENGES, memorizeTitle: 'MEMORIZE OS 8 ESTUDANTES E O QUE ELES DIZEM!' };
    case '7':
      return { students: withInfo(GRADE7_FACTS), challenges: GRADE7_CHALLENGES, memorizeTitle: 'MEMORIZE O QUE CADA ESTUDANTE FEZ OU FAZ!' };
    case '9':
      return { students: withInfo(GRADE9_FACTS), challenges: GRADE9_CHALLENGES, memorizeTitle: 'MEMORIZE AS EXPERIÊNCIAS DOS 8 ESTUDANTES!' };
    default:
      return { students: FLASHCARD_STUDENTS, challenges: FLASHCARD_CHALLENGES, memorizeTitle: 'MEMORIZE OS 8 ESTUDANTES E SUAS IDADES!' };
  }
}
