import type { SchoolGrade } from './level0Content';

// Conteúdo PROVISÓRIO do Nível 3 (6º–9º). Nas questões a resposta certa vem sempre primeiro (answer 0);
// as telas embaralham as opções antes de mostrar.

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

// Sala 1: lugares da sala onde o aluno solta o objeto.
export type Level3Spot = 'on-desk' | 'under-desk' | 'on-chair' | 'under-chair' | 'in-box' | 'next-door';
export const LEVEL3_SPOTS: { id: Level3Spot; label: string }[] = [
  { id: 'on-desk', label: 'on the desk' },
  { id: 'under-desk', label: 'under the desk' },
  { id: 'on-chair', label: 'on the chair' },
  { id: 'under-chair', label: 'under the chair' },
  { id: 'in-box', label: 'in the box' },
  { id: 'next-door', label: 'next to the door' },
];

export interface Level3Place { instruction: string; emoji: string; object: string; spot: Level3Spot }
export interface Level3Who { text: string; polite: boolean; explanation: string }
export interface Level3Pair { en: string; pt: string }
export interface Level3Maze { goal: string; goalPt: string; words: string[]; decoys: string[] }

export interface Level3GradeContent {
  curriculum: { theme: string; objects: string[]; progression: string };
  arrange: { place: Level3Place[]; check: Level3Question[] };
  board: Level3Question[];
  who: Level3Who[];
  memory: Level3Pair[];
  maze: Level3Maze;
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

const p = (instruction: string, emoji: string, object: string, spot: Level3Spot): Level3Place => ({ instruction, emoji, object, spot });
const w = (text: string, polite: boolean, explanation: string): Level3Who => ({ text, polite, explanation });

export const LEVEL3_CONTENT: Record<SchoolGrade, Level3GradeContent> = {
  '6': {
    curriculum: {
      theme: 'Sala de aula e convivência básica',
      objects: ['objetos escolares', 'comandos de sala', 'cores e posições simples'],
      progression: 'Frases nominais, verbo to be e imperativos afirmativos e negativos.',
    },
    arrange: {
      place: [
        p('Put the book on the desk.', '📘', 'book', 'on-desk'),
        p('Put the backpack under the chair.', '🎒', 'backpack', 'under-chair'),
        p('Put the pencil in the box.', '✏️', 'pencil', 'in-box'),
        p('Put the ball next to the door.', '⚽', 'ball', 'next-door'),
        p('Put the notebook on the chair.', '📓', 'notebook', 'on-chair'),
      ],
      check: [
        q('Complete: “There ___ a book on the desk.”', ['is', 'are', 'am'], 'Um livro só (a book): there is.', 'language-awareness', ['book', 'desk'], 'There is + singular'),
        q('Complete: “There ___ two pencils in the box.”', ['are', 'is', 'be'], 'Dois lápis (plural): there are.', 'language-awareness', ['pencils', 'box'], 'There are + plural'),
      ],
    },
    board: [
      q('Complete: “This ___ my classroom.”', ['is', 'are', 'am'], 'Com “this” usamos is.', 'language-awareness', ['classroom'], 'Verb to be: this is'),
      q('Complete: “I ___ a student.”', ['am', 'is', 'are'], 'Com I usamos am.', 'language-awareness', ['student'], 'Verb to be: I am'),
      q('Choose the classroom command.', ['Open your book.', 'Book your open.', 'Your open book.'], 'Imperativo: verbo + complemento.', 'reading', ['open', 'book'], 'Imperative'),
      q('Complete: “Don’t ___ in the classroom.”', ['run', 'runs', 'running'], 'Don’t + verbo na forma base.', 'language-awareness', ['run'], 'Negative imperative'),
      q('Where is the ball? (A bola está embaixo da mesa.)', ['The ball is under the desk.', 'The ball is on the desk.', 'The ball is in the box.'], 'Under = embaixo de.', 'reading', ['ball', 'under'], 'Prepositions of place'),
    ],
    who: [
      w('May I go out, please?', true, 'May I...? + please pede permissão com educação.'),
      w('Give me your pencil now!', false, 'Ordem sem please soa grosseira.'),
      w('Thank you, teacher!', true, 'Agradecer é sempre educado.'),
      w('Be quiet, you!', false, 'Mandar o colega calar a boca é falta de respeito.'),
      w('Excuse me, can I sit here?', true, 'Excuse me + pergunta é um pedido educado.'),
      w('Move! This is my chair!', false, 'Gritar ordem para o colega é mal-educado.'),
    ],
    memory: [
      { en: 'pencil', pt: 'lápis' },
      { en: 'desk', pt: 'carteira' },
      { en: 'board', pt: 'quadro' },
      { en: 'chair', pt: 'cadeira' },
      { en: 'eraser', pt: 'borracha' },
    ],
    maze: { goal: 'Collect school objects', goalPt: 'Pegue os objetos escolares', words: ['book', 'ruler', 'pen', 'notebook', 'scissors'], decoys: ['banana', 'car', 'dog'] },
    review: [
      q('Complete: “Please ___ quiet.”', ['be', 'is', 'are'], 'Depois de please, o comando usa o verbo na forma base.', 'language-awareness', ['quiet', 'please'], 'Imperative: please + base verb'),
      q('How do you say “Bom dia” in English?', ['Good morning', 'Good night', 'Goodbye'], 'Good morning = bom dia.', 'reading', ['good morning'], 'Greetings'),
    ],
  },
  '7': {
    curriculum: {
      theme: 'Rotina escolar e interação em sala',
      objects: ['rotina', 'ações escolares', 'perguntas e respostas'],
      progression: 'Simple present, do/does e present continuous em situações escolares.',
    },
    arrange: {
      place: [
        p('Ana keeps her backpack next to the door.', '🎒', 'backpack', 'next-door'),
        p('Leo puts his ruler in the box.', '📏', 'ruler', 'in-box'),
        p('The teacher puts the dictionary on the desk.', '📕', 'dictionary', 'on-desk'),
        p('Put your shoes under the desk, please.', '👟', 'shoes', 'under-desk'),
        p('She leaves her jacket on the chair.', '🧥', 'jacket', 'on-chair'),
      ],
      check: [
        q('Complete: “There ___ some markers on the desk.”', ['are', 'is', 'am'], 'Markers (plural): there are.', 'language-awareness', ['markers'], 'There are + plural'),
        q('Complete: “___ there a clock in your classroom?”', ['Is', 'Are', 'Do'], 'Pergunta com singular: Is there...?', 'language-awareness', ['clock'], 'Is there...?'),
      ],
    },
    board: [
      q('Complete: “What ___ you do after class?”', ['do', 'does', 'are'], 'Com you usamos do em perguntas no simple present.', 'language-awareness', ['after class'], 'Wh-question + do'),
      q('Complete: “She ___ to school by bus.”', ['goes', 'go', 'going'], 'He/she/it: verbo com -s/-es.', 'language-awareness', ['bus'], 'Simple present 3rd person'),
      q('Complete: “They ___ studying English now.”', ['are', 'is', 'am'], 'They + are + verbo-ing.', 'language-awareness', ['study'], 'Present continuous'),
      q('Complete: “___ he like Math?”', ['Does', 'Do', 'Is'], 'Pergunta com he: Does.', 'language-awareness', ['Math'], 'Does + subject + verb'),
      q('Choose the correct sentence.', ['The book is under the desk.', 'The book under is desk.', 'Under book desk.'], 'Under indica a posição do livro em relação à mesa.', 'language-awareness', ['book', 'desk', 'under'], 'Prepositions of place'),
    ],
    who: [
      w('Could you repeat, please?', true, 'Could you...? + please é um pedido educado.'),
      w('Repeat it now!', false, 'Ordem seca para o professor é falta de respeito.'),
      w('Sorry, I’m late.', true, 'Pedir desculpas pelo atraso é educado.'),
      w('That’s a stupid idea.', false, 'Desrespeita a ideia do colega.'),
      w('Can you help me, please?', true, 'Pedido de ajuda com please.'),
      w('I’m talking. Shut up!', false, 'Mandar calar a boca é grosseiro.'),
    ],
    memory: [
      { en: 'homework', pt: 'lição de casa' },
      { en: 'break', pt: 'recreio' },
      { en: 'lunch', pt: 'almoço' },
      { en: 'schedule', pt: 'horário' },
      { en: 'library', pt: 'biblioteca' },
    ],
    maze: { goal: 'Collect classroom actions', goalPt: 'Pegue as ações de sala de aula', words: ['read', 'write', 'listen', 'study', 'answer'], decoys: ['swim', 'cook', 'drive'] },
    review: [
      q('Choose the correct sentence.', ['The book is under the desk.', 'The book under is desk.', 'Under book desk.'], 'Under indica a relação espacial entre o livro e a mesa.', 'language-awareness', ['book', 'desk', 'under'], 'Prepositions of place'),
      q('How do you ask someone’s name?', ['What’s your name?', 'How old your name?', 'Where is name?'], 'What’s your name? = qual é o seu nome?', 'speaking', ['name'], 'Personal questions'),
    ],
  },
  '8': {
    curriculum: {
      theme: 'Descrição, comparação e colaboração',
      objects: ['descrição de ambientes', 'comparativos', 'pedidos de esclarecimento'],
      progression: 'Preposições e comparativos em descrições; não introduz conteúdo elementar sem função.',
    },
    arrange: {
      place: [
        p('The globe goes on the teacher’s desk.', '🌍', 'globe', 'on-desk'),
        p('The trash can stays next to the door.', '🗑️', 'trash can', 'next-door'),
        p('The laptop is safer in the box.', '💻', 'laptop', 'in-box'),
        p('Leave the umbrella under the chair.', '☂️', 'umbrella', 'under-chair'),
        p('The calculator should be on the chair.', '🧮', 'calculator', 'on-chair'),
      ],
      check: [
        q('Complete: “The new classroom is ___ than the old one.”', ['larger', 'large', 'the largest'], 'Larger than compara dois ambientes.', 'language-awareness', ['new', 'old', 'classroom'], 'Comparative adjective + than'),
        q('Complete: “The lab is ___ modern than the library.”', ['more', 'most', 'much'], 'Adjetivo longo: more + adjetivo + than.', 'language-awareness', ['lab', 'modern'], 'More + adjective + than'),
      ],
    },
    board: [
      q('Choose the best description of two rooms.', ['Room A is quieter than Room B.', 'Room A is quiet than Room B.', 'Room A quieter Room B.'], 'Adjetivos curtos usam -er + than no comparativo.', 'writing', ['room', 'quiet'], 'Comparatives'),
      q('Choose the correct comparison.', ['The library is quieter than the corridor.', 'The library is more quiet than corridor.', 'The library quieter the corridor.'], 'Quieter than compara dois lugares.', 'language-awareness', ['library', 'corridor', 'quiet'], 'Comparative adjective + than'),
      q('Complete: “The board is ___ the window and the door.”', ['between', 'under', 'into'], 'Between = entre duas coisas.', 'language-awareness', ['between'], 'Prepositions of place'),
      q('Complete: “This is the ___ room in the school.”', ['biggest', 'bigger', 'big'], 'Superlativo: the + adjetivo-est.', 'language-awareness', ['big'], 'Superlative'),
      q('Choose the polite way to check understanding.', ['Sorry, what does “quieter” mean?', 'What? Speak!', 'I no understand you.'], 'Pedir o significado com educação.', 'speaking', ['mean'], 'Asking for clarification'),
    ],
    who: [
      w('I don’t understand. Could you explain?', true, 'Mostra a dúvida e pede explicação com educação.'),
      w('Explain it again. Fast!', false, 'Ordem apressada e sem please.'),
      w('Can we work together on this?', true, 'Convida o colega a colaborar.'),
      w('Your group is the worst.', false, 'Ofende os colegas.'),
      w('Excuse me, could you speak more slowly?', true, 'Pedido de esclarecimento educado.'),
      w('Whatever. I don’t care.', false, 'Mostra desprezo pela conversa.'),
    ],
    memory: [
      { en: 'bigger', pt: 'maior' },
      { en: 'quieter', pt: 'mais silencioso' },
      { en: 'between', pt: 'entre' },
      { en: 'behind', pt: 'atrás de' },
      { en: 'in front of', pt: 'na frente de' },
    ],
    maze: { goal: 'Collect comparatives', goalPt: 'Pegue os comparativos', words: ['taller', 'faster', 'smaller', 'older', 'easier'], decoys: ['tall', 'fastest', 'gooder'] },
    review: [
      q('Choose the correct request for clarification.', ['Sorry, could you explain that again?', 'Explain again now!', 'You explain me again.'], 'Could you explain...? pede esclarecimento com educação.', 'speaking', ['explain', 'again'], 'Could you...? + base verb'),
      q('Complete: “She ___ in the library yesterday.”', ['was', 'is', 'were'], 'Passado de is com she: was.', 'language-awareness', ['library', 'yesterday'], 'Past of to be'),
    ],
  },
  '9': {
    curriculum: {
      theme: 'Participação responsável e leitura crítica',
      objects: ['regras e avisos', 'modal verbs', 'justificativas e interação formal'],
      progression: 'Modalidade, conectores e interpretação de linguagem escolar formal.',
    },
    arrange: {
      place: [
        p('Phones must stay in the box during the test.', '📱', 'phone', 'in-box'),
        p('Bags should be kept under the desk.', '👜', 'bag', 'under-desk'),
        p('The fire extinguisher must stay next to the door.', '🧯', 'fire extinguisher', 'next-door'),
        p('The test papers should be placed on the desk.', '📄', 'test papers', 'on-desk'),
        p('Coats may be left on the chair.', '🧥', 'coat', 'on-chair'),
      ],
      check: [
        q('Complete the school notice: “Students ___ keep the classroom organized.”', ['should', 'should to', 'are should'], 'Should expressa conselho ou responsabilidade.', 'language-awareness', ['students', 'organized'], 'Should + base verb'),
        q('Choose the correct sentence for a school notice.', ['There are several desks in the classroom.', 'There is several desks.', 'There are a desk.'], 'Several desks é plural e exige there are.', 'reading', ['desks', 'classroom'], 'There is/are in an authentic school notice'),
      ],
    },
    board: [
      q('Complete: “You ___ use your phone during the test.” (proibido)', ['mustn’t', 'must', 'should'], 'Mustn’t expressa proibição.', 'language-awareness', ['phone', 'test'], 'Must not: prohibition'),
      q('Complete: “You ___ bring a dictionary. It’s optional.”', ['don’t have to', 'mustn’t', 'must'], 'Don’t have to = não é obrigatório.', 'language-awareness', ['dictionary'], 'Don’t have to: no obligation'),
      q('Choose the best connector: “I studied, ___ I passed the test.”', ['so', 'but', 'although'], 'So introduz a consequência.', 'language-awareness', ['studied', 'passed'], 'Connectors: so'),
      q('Choose the correct formal request.', ['Would you mind explaining the rule?', 'Explain the rule!', 'You explain rule.'], 'Would you mind...? formula um pedido formal.', 'speaking', ['explain', 'rule'], 'Would you mind + -ing'),
      q('What does the notice mean? “Silence, please. Exam in progress.”', ['Be quiet: there is a test now.', 'You can talk loudly.', 'The exam is cancelled.'], 'In progress = acontecendo agora.', 'reading', ['silence', 'exam'], 'Reading school notices'),
    ],
    who: [
      w('I’m sorry, I interrupted. Please continue.', true, 'Reconhece a interrupção e devolve a palavra.'),
      w('Stop talking, I want to speak now!', false, 'Interrompe e manda o colega parar.'),
      w('I respectfully disagree, because the text says otherwise.', true, 'Discorda com respeito e justifica.'),
      w('You’re wrong and that’s it.', false, 'Encerra a conversa sem argumento.'),
      w('Would you mind lending me your notes?', true, 'Pedido formal e educado.'),
      w('Give me your notes, I need them.', false, 'Exige em vez de pedir.'),
    ],
    memory: [
      { en: 'must', pt: 'deve (obrigação)' },
      { en: 'should', pt: 'deveria (conselho)' },
      { en: 'although', pt: 'embora' },
      { en: 'however', pt: 'porém' },
      { en: 'notice', pt: 'aviso' },
    ],
    maze: { goal: 'Collect modal verbs', goalPt: 'Pegue os verbos modais', words: ['must', 'should', 'can', 'might', 'could'], decoys: ['musted', 'shoulds', 'canning'] },
    review: [
      q('Choose the sentence that gives a reason.', ['We should listen because everyone deserves respect.', 'We listen everyone respect.', 'Because respect everyone should.'], 'Because introduz a justificativa da ação.', 'writing', ['listen', 'respect'], 'Should + because clause'),
      q('Complete: “If it rains, we ___ stay inside.”', ['will', 'would', 'did'], 'First conditional: if + present, will + verbo.', 'language-awareness', ['rain', 'inside'], 'First conditional'),
    ],
  },
};

// Falas do Zé (atrapalhado, mas bem-intencionado) em cada sala, na ordem das atividades.
export const LEVEL3_ZE_LINES = [
  'Eu baguncei a sala toda! Me ajuda a arrumar?',
  'Escrevi umas respostas no quadro... acho que errei algumas!',
  'Eu falo tudo sem pensar! Quem foi educado?',
  'Misturei as cartas! Ache os pares!',
  'Escondi minhas cartas no labirinto! Não pegue!',
  'Última sala! Mostra tudo o que você aprendeu!',
];
