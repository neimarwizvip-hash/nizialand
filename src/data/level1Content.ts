// Conteúdo do Nível 1 (Missão 1 na escola) por série: 6º-9º.
// 6º verb to be, objetos escolares, números · 7º simple present/continuous, rotina, comida
// 8º comparativos/superlativos, simple past, futuro · 9º present perfect, modais, 1st conditional.

import type { SchoolGrade } from './level0Content';

// Ícones (lucide) usados como "figura" nas opções do 6º ano.
export type ListenIcon = 'book' | 'pencil' | 'ruler' | 'backpack' | 'scissors' | 'eraser' | 'calculator' | 'clock';

export interface ListenOption {
  text: string;
  // 6º: mostra só a figura (ou o número grande, se não houver ícone).
  icon?: ListenIcon;
}

export interface ListenItem {
  // Frase falada em inglês (speechService.speakEnglish).
  audio: string;
  options: ListenOption[]; // 4
  answer: number;
}

export interface OrderItem {
  // Frase correta; as peças são as palavras separadas por espaço.
  sentence: string;
  // Tradução curta em português, como pista.
  pt: string;
}

export type Speaker = 'Márcio' | 'Vânia' | 'Leia';

export interface DialogueTurn {
  speaker: Speaker;
  line: string;
  options: string[]; // 3
  answer: number;
}

export interface ExploreSpot {
  id: string;
  // Nome do lugar (português) no marcador.
  place: string;
  // Posição em % da imagem do corredor.
  x: number;
  y: number;
  question: string;
  options: string[]; // 3
  answer: number;
}

export interface Level1GradeContent {
  listen: ListenItem[];
  order: OrderItem[];
  dialogue: DialogueTurn[];
  explore: ExploreSpot[];
}

export const SPEAKER_IMAGES: Record<Speaker, string> = {
  'Márcio': '/assets/diretor_marcio.png',
  'Vânia': '/assets/coordenadora_vania.png',
  'Leia': '/assets/orientadora_leia.png',
};

// Cartas escondidas do Zé na exploração (posições em %); tocar custa 5 s.
export const EXPLORE_TRAPS: { x: number; y: number }[] = [
  { x: 30, y: 78 },
  { x: 62, y: 30 },
  { x: 88, y: 70 },
];

// Lugares fixos do corredor; cada série muda só as perguntas.
const SPOTS = [
  { id: 'sala', place: 'Sala de aula', x: 14, y: 45 },
  { id: 'biblioteca', place: 'Biblioteca', x: 40, y: 38 },
  { id: 'cantina', place: 'Cantina', x: 76, y: 46 },
  { id: 'quadra', place: 'Quadra', x: 52, y: 68 },
  { id: 'secretaria', place: 'Secretaria', x: 22, y: 20 },
  { id: 'diretoria', place: 'Diretoria', x: 84, y: 22 },
];

const spots = (qs: [string, string[], number][]): ExploreSpot[] =>
  SPOTS.map((s, i) => ({ ...s, question: qs[i][0], options: qs[i][1], answer: qs[i][2] }));

export const LEVEL1_CONTENT: Record<SchoolGrade, Level1GradeContent> = {
  '6': {
    listen: [
      { audio: 'This is a book.', options: [{ text: 'book', icon: 'book' }, { text: 'pencil', icon: 'pencil' }, { text: 'ruler', icon: 'ruler' }, { text: 'backpack', icon: 'backpack' }], answer: 0 },
      { audio: 'It is a pencil.', options: [{ text: 'scissors', icon: 'scissors' }, { text: 'pencil', icon: 'pencil' }, { text: 'eraser', icon: 'eraser' }, { text: 'book', icon: 'book' }], answer: 1 },
      { audio: 'My backpack is blue.', options: [{ text: 'clock', icon: 'clock' }, { text: 'ruler', icon: 'ruler' }, { text: 'backpack', icon: 'backpack' }, { text: 'calculator', icon: 'calculator' }], answer: 2 },
      { audio: 'Twelve.', options: [{ text: '20' }, { text: '2' }, { text: '11' }, { text: '12' }], answer: 3 },
      { audio: 'The scissors are on the desk.', options: [{ text: 'scissors', icon: 'scissors' }, { text: 'eraser', icon: 'eraser' }, { text: 'pencil', icon: 'pencil' }, { text: 'clock', icon: 'clock' }], answer: 0 },
      { audio: 'Fifteen.', options: [{ text: '50' }, { text: '15' }, { text: '5' }, { text: '13' }], answer: 1 },
    ],
    order: [
      { sentence: 'I am a student', pt: 'Eu sou um(a) aluno(a)' },
      { sentence: 'She is my teacher', pt: 'Ela é minha professora' },
      { sentence: 'This is my pencil', pt: 'Este é o meu lápis' },
      { sentence: 'We are in class six', pt: 'Nós estamos na turma seis' },
      { sentence: 'The books are on the table', pt: 'Os livros estão na mesa' },
    ],
    dialogue: [
      { speaker: 'Márcio', line: 'Good morning! What is your name?', options: ['My name is Ana.', 'I am fine, thanks.', 'It is a book.'], answer: 0 },
      { speaker: 'Márcio', line: 'How old are you?', options: ['I am in the classroom.', 'I am eleven years old.', 'Yes, I am.'], answer: 1 },
      { speaker: 'Leia', line: 'Is this your backpack?', options: ['Yes, it is.', 'Yes, I do.', 'It is twelve.'], answer: 0 },
      { speaker: 'Vânia', line: 'How many pencils are on the desk?', options: ['It is blue.', 'They are students.', 'There are three pencils.'], answer: 2 },
      { speaker: 'Leia', line: 'Are you ready for class?', options: ['No, they are not.', 'Yes, I am!', 'She is ready.'], answer: 1 },
    ],
    explore: spots([
      ['What is this? (📕)', ['It is a book.', 'It is a desk.', 'They are books.'], 0],
      ['Complete: The library ___ quiet.', ['are', 'is', 'am'], 1],
      ['How do you say 14 in English?', ['forty', 'four', 'fourteen'], 2],
      ['Complete: We ___ friends.', ['are', 'is', 'am'], 0],
      ['What do you use to cut paper?', ['a ruler', 'scissors', 'an eraser'], 1],
      ['Complete: Mr. Márcio ___ the principal.', ['am', 'are', 'is'], 2],
    ]),
  },
  '7': {
    listen: [
      { audio: 'I wake up at six o\'clock.', options: [{ text: 'I wake up at six.' }, { text: 'I go to bed at six.' }, { text: 'I have lunch at seven.' }, { text: 'I wake up at seven.' }], answer: 0 },
      { audio: 'She is eating an apple now.', options: [{ text: 'She eats bread every day.' }, { text: 'She is eating an apple.' }, { text: 'She is drinking milk.' }, { text: 'He is eating an apple.' }], answer: 1 },
      { audio: 'We have rice and beans for lunch.', options: [{ text: 'We have pizza for dinner.' }, { text: 'They have rice for breakfast.' }, { text: 'We have rice and beans for lunch.' }, { text: 'We are cooking beans.' }], answer: 2 },
      { audio: 'He brushes his teeth every morning.', options: [{ text: 'He is brushing his hair.' }, { text: 'He washes his face at night.' }, { text: 'She brushes her teeth.' }, { text: 'He brushes his teeth every morning.' }], answer: 3 },
      { audio: 'They are playing soccer right now.', options: [{ text: 'They are playing soccer now.' }, { text: 'They play soccer on Sundays.' }, { text: 'We are watching soccer.' }, { text: 'They are playing volleyball.' }], answer: 0 },
    ],
    order: [
      { sentence: 'I go to school by bus', pt: 'Eu vou para a escola de ônibus' },
      { sentence: 'She is drinking orange juice', pt: 'Ela está bebendo suco de laranja' },
      { sentence: 'We eat lunch at noon', pt: 'Nós almoçamos ao meio-dia' },
      { sentence: 'He does not like fish', pt: 'Ele não gosta de peixe' },
      { sentence: 'They are studying English now', pt: 'Eles estão estudando inglês agora' },
    ],
    dialogue: [
      { speaker: 'Vânia', line: 'What time do you get up?', options: ['I get up at six thirty.', 'I am getting a book.', 'Yes, I do.'], answer: 0 },
      { speaker: 'Leia', line: 'What are you doing now?', options: ['I do my homework every day.', 'I am reading a message.', 'I read yesterday.'], answer: 1 },
      { speaker: 'Márcio', line: 'Do you like fruit?', options: ['Yes, I am.', 'Yes, it is.', 'Yes, I do. I love bananas!'], answer: 2 },
      { speaker: 'Vânia', line: 'What do you usually eat for breakfast?', options: ['I usually eat bread and drink milk.', 'I am eating pizza now.', 'At seven o\'clock.'], answer: 0 },
      { speaker: 'Leia', line: 'Is Ana playing in the court?', options: ['No, she doesn\'t.', 'No, she is studying in the library.', 'Yes, she plays.'], answer: 1 },
    ],
    explore: spots([
      ['Complete: I ___ my homework every afternoon.', ['do', 'does', 'am doing'], 0],
      ['Complete: Look! Leia ___ a book.', ['reads', 'is reading', 'read'], 1],
      ['Which one is a fruit?', ['rice', 'cheese', 'banana'], 2],
      ['Complete: They ___ volleyball now.', ['are playing', 'plays', 'is playing'], 0],
      ['Complete: She ___ to school at 7 a.m.', ['go', 'goes', 'going'], 1],
      ['Complete: Mr. Márcio ___ coffee every morning.', ['drink', 'drinking', 'drinks'], 2],
    ]),
  },
  '8': {
    listen: [
      { audio: 'The library is bigger than the classroom.', options: [{ text: 'The library is bigger than the classroom.' }, { text: 'The classroom is bigger than the library.' }, { text: 'The library is the smallest room.' }, { text: 'The library is as big as the court.' }], answer: 0 },
      { audio: 'Yesterday we visited the museum.', options: [{ text: 'Tomorrow we will visit the museum.' }, { text: 'Yesterday we visited the museum.' }, { text: 'We visit the museum every week.' }, { text: 'Yesterday they visited the zoo.' }], answer: 1 },
      { audio: 'Leia is the tallest girl in the class.', options: [{ text: 'Leia is taller than Ana.' }, { text: 'Leia is the shortest girl.' }, { text: 'Leia is the tallest girl in the class.' }, { text: 'Leia was tall last year.' }], answer: 2 },
      { audio: 'I will study for the test tomorrow.', options: [{ text: 'I studied for the test yesterday.' }, { text: 'I am studying for the test now.' }, { text: 'She will study tomorrow.' }, { text: 'I will study for the test tomorrow.' }], answer: 3 },
      { audio: 'Mr. Márcio went to the meeting last night.', options: [{ text: 'Mr. Márcio went to the meeting last night.' }, { text: 'Mr. Márcio is going to the meeting tonight.' }, { text: 'Mrs. Vânia went to the meeting.' }, { text: 'Mr. Márcio goes to meetings every night.' }], answer: 0 },
    ],
    order: [
      { sentence: 'My bag is heavier than yours', pt: 'Minha mochila é mais pesada que a sua' },
      { sentence: 'We played soccer last weekend', pt: 'Nós jogamos futebol no fim de semana passado' },
      { sentence: 'She is going to travel next month', pt: 'Ela vai viajar no mês que vem' },
      { sentence: 'This is the best day of the year', pt: 'Este é o melhor dia do ano' },
      { sentence: 'Did you finish your homework', pt: 'Você terminou sua lição de casa?' },
    ],
    dialogue: [
      { speaker: 'Márcio', line: 'What did you do last weekend?', options: ['I visited my grandmother.', 'I will visit my grandmother.', 'I visit my grandmother.'], answer: 0 },
      { speaker: 'Vânia', line: 'Which is more difficult: Math or English?', options: ['Math is difficulter.', 'I think Math is more difficult.', 'English is the most easy.'], answer: 1 },
      { speaker: 'Leia', line: 'What are you going to do after school?', options: ['I went home.', 'I go home yesterday.', 'I am going to play volleyball.'], answer: 2 },
      { speaker: 'Márcio', line: 'Did you see the new computer lab?', options: ['Yes, I did. It is the best room!', 'Yes, I saw it tomorrow.', 'No, I don\'t.'], answer: 0 },
      { speaker: 'Vânia', line: 'Will it rain during the field trip?', options: ['It rained yesterday.', 'I don\'t think it will rain.', 'It is raining yesterday.'], answer: 1 },
    ],
    explore: spots([
      ['Complete: The classroom is ___ than the hallway.', ['smaller', 'smallest', 'more small'], 0],
      ['Complete: Yesterday I ___ a great book.', ['read', 'will read', 'reading'], 0],
      ['Complete: This is the ___ snack in the cafeteria!', ['better', 'best', 'good'], 1],
      ['Complete: Next week we ___ a game.', ['played', 'have played', 'will play'], 2],
      ['Past of "go":', ['goed', 'went', 'gone'], 1],
      ['Complete: Mr. Márcio is ___ than me.', ['busier', 'busyer', 'more busy'], 0],
    ]),
  },
  '9': {
    listen: [
      { audio: 'I have already finished my project.', options: [{ text: 'I have already finished my project.' }, { text: 'I will finish my project tomorrow.' }, { text: 'I haven\'t started my project.' }, { text: 'I finished the test.' }], answer: 0 },
      { audio: 'You should talk to Mrs. Vânia.', options: [{ text: 'You must not talk to Mrs. Vânia.' }, { text: 'You should talk to Mrs. Vânia.' }, { text: 'Mrs. Vânia should talk to you.' }, { text: 'You talked to Mrs. Vânia.' }], answer: 1 },
      { audio: 'If it rains, we will stay inside.', options: [{ text: 'If it is sunny, we will go out.' }, { text: 'It rained, so we stayed inside.' }, { text: 'If it rains, we will stay inside.' }, { text: 'We always stay inside.' }], answer: 2 },
      { audio: 'Have you ever been to the city library?', options: [{ text: 'Did you go to the library yesterday?' }, { text: 'Are you going to the library?' }, { text: 'Do you like the library?' }, { text: 'Have you ever been to the city library?' }], answer: 3 },
      { audio: 'Students must wear the school uniform.', options: [{ text: 'Students must wear the school uniform.' }, { text: 'Students can\'t wear the uniform.' }, { text: 'Students might wear the uniform.' }, { text: 'Teachers must wear the uniform.' }], answer: 0 },
    ],
    order: [
      { sentence: 'I have never seen this movie', pt: 'Eu nunca vi este filme' },
      { sentence: 'You must turn off your phone', pt: 'Você deve desligar seu celular' },
      { sentence: 'If you study you will pass', pt: 'Se você estudar, vai passar' },
      { sentence: 'She has lived here since 2020', pt: 'Ela mora aqui desde 2020' },
      { sentence: 'We might go to the fair', pt: 'Nós talvez vamos à feira' },
    ],
    dialogue: [
      { speaker: 'Leia', line: 'Have you done the English homework yet?', options: ['Yes, I have just finished it.', 'Yes, I do it tomorrow.', 'No, I didn\'t do it tomorrow.'], answer: 0 },
      { speaker: 'Márcio', line: 'Can I use my phone in class?', options: ['Yes, you must use it always.', 'No, you can\'t. You should keep it in your bag.', 'Yes, you shouldn\'t.'], answer: 1 },
      { speaker: 'Vânia', line: 'What will you do if you miss the bus?', options: ['If I miss the bus, I walked.', 'I missed the bus yesterday.', 'If I miss the bus, I will call my mom.'], answer: 2 },
      { speaker: 'Leia', line: 'How long have you studied at Nísia?', options: ['I have studied here for four years.', 'I study here since four years.', 'I am studying here four years ago.'], answer: 0 },
      { speaker: 'Márcio', line: 'Should we help the new student?', options: ['No, we mustn\'t to help.', 'Yes, we should show her the school.', 'Yes, we will helped.'], answer: 1 },
    ],
    explore: spots([
      ['Complete: I ___ my notebook. Can you help me?', ['have lost', 'will lose', 'lose'], 0],
      ['Complete: You ___ be quiet in the library.', ['must', 'mustn\'t', 'don\'t have'], 0],
      ['Complete: If you ___ hungry, you will eat a snack.', ['will be', 'are', 'were'], 1],
      ['Complete: She has played volleyball ___ 2022.', ['for', 'ago', 'since'], 2],
      ['Complete: ___ you ever visited another school?', ['Did', 'Have', 'Has'], 1],
      ['Complete: If Mr. Márcio calls, I ___ answer.', ['will', 'would', 'did'], 0],
    ]),
  },
};
