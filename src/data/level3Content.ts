import type { SchoolGrade } from './level0Content';

export type Level3Skill = 'listening' | 'reading' | 'writing' | 'speaking' | 'language-awareness';

export interface Level3Question {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  skill: Level3Skill;
  vocabulary: string[];
  languageFocus: string;
}

export interface Level3GradeContent {
  curriculum: { theme: string; objects: string[]; progression: string };
  arrange: Level3Question[];
  board: Level3Question[];
  who: Level3Question[];
  memory: Level3Question[];
  maze: Level3Question[];
  review: Level3Question[];
}

const q = (
  prompt: string,
  options: string[],
  explanation: string,
  skill: Level3Skill,
  vocabulary: string[],
  languageFocus: string,
): Level3Question => ({ prompt, options, answer: 0, explanation, skill, vocabulary, languageFocus });

export const LEVEL3_CONTENT: Record<SchoolGrade, Level3GradeContent> = {
  '6': {
    curriculum: {
      theme: 'Sala de aula e convivência básica',
      objects: ['objetos escolares', 'comandos de sala', 'cores e posições simples'],
      progression: 'Frases nominais, verbo to be e imperativos afirmativos e negativos.',
    },
    arrange: [q('Listen and place the book: “Put the book on the desk.”', ['on the desk', 'under the school', 'inside the teacher'], 'On the desk indica a posição do livro.', 'listening', ['book', 'desk'], 'Imperative + preposition of place')],
    board: [q('Complete: “This ___ my classroom.”', ['is', 'are', 'am'], 'Com “this” usamos is.', 'language-awareness', ['classroom'], 'Verb to be: this is')],
    who: [q('Choose the polite classroom request.', ['May I go out, please?', 'Give me now!', 'I go bathroom.'], 'May I...? é uma forma educada de pedir permissão.', 'speaking', ['go out', 'please'], 'May I...? + base verb')],
    memory: [q('Which object do you write with?', ['a pencil', 'a door', 'a window'], 'Pencil é o objeto usado para escrever.', 'reading', ['pencil', 'write'], 'School-object vocabulary')],
    maze: [q('Choose a classroom word.', ['notebook', 'rainbow', 'market'], 'Notebook pertence ao vocabulário escolar.', 'reading', ['notebook'], 'Classroom vocabulary')],
    review: [q('Complete: “Please ___ quiet.”', ['be', 'is', 'are'], 'Depois de please, o comando usa o verbo na forma base.', 'language-awareness', ['quiet', 'please'], 'Imperative: please + base verb')],
  },
  '7': {
    curriculum: {
      theme: 'Rotina escolar e interação em sala',
      objects: ['rotina', 'ações escolares', 'perguntas e respostas'],
      progression: 'Simple present, do/does e present continuous em situações escolares.',
    },
    arrange: [q('Where does Ana keep her backpack?', ['She keeps it next to the chair.', 'She keep it in the sky.', 'She keeping it under teacher.'], 'Com she usamos keeps no simple present.', 'reading', ['backpack', 'chair'], 'Simple present: she + verb-s; preposition next to')],
    board: [q('Complete: “What ___ you do after class?”', ['do', 'does', 'are'], 'Com you usamos do em perguntas no simple present.', 'language-awareness', ['after class'], 'Wh-question + do')],
    who: [q('Choose the respectful answer.', ['Could you repeat, please?', 'Repeat now!', 'You repeat.'], 'Could you...? torna o pedido mais educado.', 'speaking', ['repeat', 'please'], 'Could you...? + base verb')],
    memory: [q('Which object is used to erase?', ['an eraser', 'a ruler', 'a backpack'], 'Eraser é borracha.', 'reading', ['eraser'], 'School-object vocabulary')],
    maze: [q('Choose a classroom action.', ['Open your book.', 'Fly the desk.', 'Eat the board.'], 'Open your book é um comando de sala.', 'listening', ['open', 'book'], 'Imperative and classroom commands')],
    review: [q('Choose the correct sentence.', ['The book is under the desk.', 'The book under is desk.', 'Under book desk.'], 'Under indica a relação espacial entre o livro e a mesa.', 'language-awareness', ['book', 'desk', 'under'], 'Prepositions of place')],
  },
  '8': {
    curriculum: {
      theme: 'Descrição, comparação e colaboração',
      objects: ['descrição de ambientes', 'comparativos', 'pedidos de esclarecimento'],
      progression: 'Preposições e comparativos em descrições; não introduz conteúdo elementar sem função.',
    },
    arrange: [q('Complete: “The new classroom is ___ than the old one.”', ['larger', 'large', 'the largest'], 'Larger than compara dois ambientes.', 'language-awareness', ['new', 'old', 'classroom'], 'Comparative adjective + than')],
    board: [q('Choose the best description of two rooms.', ['Room A is quieter than Room B.', 'Room A is quiet than Room B.', 'Room A quieter Room B.'], 'Adjetivos curtos usam -er + than no comparativo.', 'writing', ['room', 'quiet'], 'Comparatives')],
    who: [q('Which sentence shows respectful collaboration?', ['I don’t understand. Could you explain?', 'Explain it!', 'I understand nothing, teacher!'], 'A frase expressa dúvida e pede explicação com educação.', 'speaking', ['understand', 'explain'], 'Could you...? and classroom interaction')],
    memory: [q('Choose the object used to measure.', ['a ruler', 'a notebook', 'a marker'], 'Ruler é régua.', 'reading', ['ruler', 'measure'], 'School-object vocabulary')],
    maze: [q('Choose the correct comparison.', ['The library is quieter than the corridor.', 'The library is more quiet than corridor.', 'The library quieter the corridor.'], 'Quieter than compara dois lugares.', 'language-awareness', ['library', 'corridor', 'quiet'], 'Comparative adjective + than')],
    review: [q('Choose the correct request for clarification.', ['May I ask a question, please?', 'May I asks question?', 'May asking I?'], 'May I...? pede permissão para falar.', 'speaking', ['ask', 'question'], 'May I...? + base verb')],
  },
  '9': {
    curriculum: {
      theme: 'Participação responsável e leitura crítica',
      objects: ['regras e avisos', 'modal verbs', 'justificativas e interação formal'],
      progression: 'Modalidade, conectores e interpretação de linguagem escolar formal.',
    },
    arrange: [q('Complete the school notice: “Students ___ keep the classroom organized.”', ['should', 'should to', 'are should'], 'Should expressa conselho ou responsabilidade.', 'language-awareness', ['students', 'organized'], 'Should + base verb')],
    board: [q('Choose the correct sentence for a school notice.', ['There are several desks in the classroom.', 'There is several desks.', 'There are a desk.'], 'Several desks é plural e exige there are.', 'reading', ['desks', 'classroom'], 'There is/are in an authentic school notice')],
    who: [q('Choose the best response after interrupting someone.', ['I’m sorry, I interrupted. Please continue.', 'Continue, now!', 'You continue me.'], 'A resposta reconhece a interrupção e usa um pedido respeitoso.', 'speaking', ['sorry', 'interrupted', 'continue'], 'Past simple + polite imperative')],
    memory: [q('Which object helps you present an idea?', ['a projector', 'an eraser', 'a pencil case'], 'Projector é usado para apresentar ideias.', 'reading', ['projector', 'present'], 'School-project vocabulary')],
    maze: [q('Choose the correct formal request.', ['Would you mind explaining the rule?', 'Explain the rule!', 'You explain rule.'], 'Would you mind...? formula um pedido formal.', 'speaking', ['explain', 'rule'], 'Would you mind + -ing')],
    review: [q('Choose the sentence that gives a reason.', ['We should listen because everyone deserves respect.', 'We listen everyone respect.', 'Because respect everyone should.'], 'Because introduz a justificativa da ação.', 'writing', ['listen', 'respect'], 'Should + because clause')],
  },
};
