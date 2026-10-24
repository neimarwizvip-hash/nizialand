// Nível 2: Missão 2 no pátio da escola (2D), 6 atividades em sequência; o Zé atrapalha cada vez mais.
// Fonte única do nível: atividades, missão e itens por série. Regras e telas em src/features/level2.
// As atividades abrem por cima do pátio (/nivel2/patio?atividade=<id>), não têm rota própria.

import type { Activity, Level, Mission } from '../core/types';
import type { SchoolGrade } from './level0Content';

const patio = (id: string) => `/nivel2/patio?atividade=${id}`;

export const LEVEL2_DITADO: Activity = {
  id: 'n2_ditado',
  mechanic: 'dictation',
  name: 'Ditado do Márcio',
  phrase: 'Ouça e escreva a palavra!',
  path: patio('n2_ditado'),
  color: 'blue',
  hint: 'O Zé tenta te distrair.',
};

export const LEVEL2_CACA: Activity = {
  id: 'n2_caca',
  mechanic: 'wordsearch',
  name: 'Caça-palavras no pátio',
  phrase: 'Encontre 6 palavras em 90 segundos!',
  path: patio('n2_caca'),
  color: 'orange',
  hint: 'O Zé esconde letras.',
};

export const LEVEL2_MURAL: Activity = {
  id: 'n2_mural',
  mechanic: 'truefalse',
  name: 'O mural da Vânia',
  phrase: 'Leia o aviso: verdadeiro ou falso?',
  path: patio('n2_mural'),
  color: 'green',
  hint: 'O Zé cobre o aviso.',
};

export const LEVEL2_BILHETE: Activity = {
  id: 'n2_bilhete',
  mechanic: 'gapfill',
  name: 'Complete o bilhete',
  phrase: 'Escolha a palavra que falta!',
  path: patio('n2_bilhete'),
  color: 'pink',
  hint: 'O Zé rabisca o bilhete.',
};

export const LEVEL2_RELOGIO: Activity = {
  id: 'n2_relogio',
  mechanic: 'timed',
  name: 'Corrida contra o relógio',
  phrase: 'Acerte o máximo em 60 segundos!',
  path: patio('n2_relogio'),
  color: 'purple',
  hint: 'O Zé interrompe a corrida.',
};

export const LEVEL2_DUELO: Activity = {
  id: 'n2_duelo',
  mechanic: 'duel',
  name: 'Duelo de bafo com o Zé',
  phrase: 'Acerte e vire as cartas do Zé!',
  path: patio('n2_duelo'),
  color: 'yellow',
  hint: 'Errou? O Zé vira a sua carta.',
};

// Sequencial: cada estação do pátio só abre depois da anterior.
export const LEVEL2_MISSION: Mission = {
  id: 'nivel2-missao2',
  number: 2,
  title: 'Missão 2',
  activities: [LEVEL2_DITADO, LEVEL2_CACA, LEVEL2_MURAL, LEVEL2_BILHETE, LEVEL2_RELOGIO, LEVEL2_DUELO],
  sequential: true,
};

export const LEVEL2: Level = {
  id: 'nivel2',
  number: 2,
  title: 'Missão no pátio',
  story: 'nivel2',
  mode: '2D',
  mission: LEVEL2_MISSION,
};

export interface DictationItem { word: string; hint: string }
export interface TrueFalseItem { statement: string; answer: boolean; explanation: string }
export interface GapFillItem { sentence: string; options: string[]; answer: number }
export interface TimedItem { question: string; options: string[]; answer: number }
export interface DuelItem { question: string; options: string[]; answer: number }

export interface Level2GradeContent {
  dictation: DictationItem[];
  // 6 palavras de até 8 letras: cabem na grade 8x8 do caça-palavras.
  wordsearch: string[];
  truefalse: TrueFalseItem[];
  gapfill: GapFillItem[];
  timed: TimedItem[];
  duel: DuelItem[];
}

const common: Record<SchoolGrade, Level2GradeContent> = {
  '6': {
    dictation: [{ word: 'please', hint: 'Por favor' }, { word: 'teacher', hint: 'Professor(a)' }, { word: 'excuse', hint: 'Com licença' }],
    wordsearch: ['SCHOOL', 'HELP', 'PLEASE', 'TEACHER', 'SORRY', 'RULES'],
    truefalse: [{ statement: '“Please” makes a request polite.', answer: true, explanation: 'Please deixa o pedido educado.' }, { statement: '“Don’t run” means run faster.', answer: false, explanation: 'Don’t run significa não corra.' }, { statement: 'A principal works at school.', answer: true, explanation: 'Principal é diretor(a).' }],
    gapfill: [{ sentence: '___ I go to the bathroom, please?', options: ['Can', 'Are', 'Do'], answer: 0 }, { sentence: '___ me, where is the office?', options: ['Excuse', 'Run', 'Open'], answer: 0 }, { sentence: 'Please ___ down.', options: ['sit', 'sits', 'sitting'], answer: 0 }],
    timed: [{ question: 'Choose the polite request.', options: ['Can I come in, please?', 'Come in now!', 'I come school.'], answer: 0 }, { question: 'Who helps students with school rules?', options: ['The coordinator', 'The pencil', 'The desk'], answer: 0 }, { question: 'Complete: ___ you help me?', options: ['Can', 'Is', 'Am'], answer: 0 }, { question: '“Excuse me” means...', options: ['Com licença', 'Até amanhã', 'Obrigado'], answer: 0 }],
    duel: [{ question: 'Choose the correct sentence.', options: ['May I ask a question?', 'May I asking question?', 'May I asks?'], answer: 0 }, { question: 'Complete: Please ___ quiet.', options: ['be', 'is', 'are'], answer: 0 }, { question: 'Who is the school leader?', options: ['The principal', 'The student desk', 'The notebook'], answer: 0 }],
  },
  '7': {
    dictation: [{ word: 'permission', hint: 'Permissão' }, { word: 'principal', hint: 'Diretor(a)' }, { word: 'quiet', hint: 'Silencioso(a)' }],
    wordsearch: ['OFFICE', 'RESPECT', 'QUIET', 'MAY', 'NOTICE', 'POLITE'],
    truefalse: [{ statement: 'May I...? asks for permission.', answer: true, explanation: 'May I...? pede permissão.' }, { statement: 'The coordinator takes care of school organization.', answer: true, explanation: 'Coordinator é coordenador(a).' }, { statement: '“Please be quiet” is rude.', answer: false, explanation: 'Please torna o pedido educado.' }],
    gapfill: [{ sentence: '___ I leave early, please?', options: ['May', 'Does', 'Am'], answer: 0 }, { sentence: '___ me, I need some help.', options: ['Excuse', 'Excuses', 'Excusing'], answer: 0 }, { sentence: 'Students ___ respect the rules.', options: ['must', 'are', 'does'], answer: 0 }],
    timed: [{ question: 'Choose the best request.', options: ['May I speak to the principal?', 'I speak principal now!', 'Principal speaking me.'], answer: 0 }, { question: 'Who coordinates the school?', options: ['The coordinator', 'The backpack', 'The hallway'], answer: 0 }, { question: 'Complete: Students must ___ respectful.', options: ['be', 'is', 'being'], answer: 0 }, { question: 'An announcement gives...', options: ['important information', 'a snack', 'a game only'], answer: 0 }],
    duel: [{ question: 'Choose the polite question.', options: ['Could you help me, please?', 'You help me!', 'Helped you me?'], answer: 0 }, { question: 'Complete: We should ___ the teacher.', options: ['respect', 'respects', 'respecting'], answer: 0 }, { question: '“May I come in?” asks for...', options: ['permission', 'a direction', 'a color'], answer: 0 }],
  },
  '8': {
    dictation: [{ word: 'authority', hint: 'Autoridade' }, { word: 'permission', hint: 'Permissão' }, { word: 'responsible', hint: 'Responsável' }],
    wordsearch: ['RESPECT', 'POLITE', 'NOTICE', 'STAFF', 'EXCUSE', 'RULES'],
    truefalse: [{ statement: '“Could you help me?” is a polite request.', answer: true, explanation: 'Could you...? é uma forma educada.' }, { statement: 'Authority means a school object.', answer: false, explanation: 'Authority significa autoridade.' }, { statement: 'Following instructions can show respect.', answer: true, explanation: 'Seguir instruções demonstra respeito.' }],
    gapfill: [{ sentence: 'Could you ___ the notice, please?', options: ['explain', 'explains', 'explaining'], answer: 0 }, { sentence: 'Students should ___ the school staff.', options: ['respect', 'respects', 'respected'], answer: 0 }, { sentence: 'May I ___ a suggestion?', options: ['make', 'makes', 'making'], answer: 0 }],
    timed: [{ question: 'Choose the most respectful request.', options: ['Could you explain the rule, please?', 'Explain it!', 'You explain rule.'], answer: 0 }, { question: 'Who can give official school instructions?', options: ['School staff', 'A chair', 'A window'], answer: 0 }, { question: 'Complete: We ___ follow the safety notice.', options: ['should', 'is', 'does'], answer: 0 }, { question: '“I’m sorry” can be used to...', options: ['apologize', 'command', 'spell'], answer: 0 }],
    duel: [{ question: 'Choose the correct form.', options: ['May I speak with the coordinator?', 'May I speaks coordinator?', 'May speaking I?'], answer: 0 }, { question: 'Complete: Please ___ your voice down.', options: ['keep', 'keeps', 'keeping'], answer: 0 }, { question: 'Respectful students...', options: ['listen to instructions', 'ignore everyone', 'break every rule'], answer: 0 }],
  },
  '9': {
    dictation: [{ word: 'responsibility', hint: 'Responsabilidade' }, { word: 'coordinator', hint: 'Coordenador(a)' }, { word: 'permission', hint: 'Permissão' }],
    wordsearch: ['DUTY', 'FORMAL', 'REQUEST', 'APOLOGY', 'EXPECTED', 'POLICY'],
    truefalse: [{ statement: '“Would you mind helping?” is polite.', answer: true, explanation: 'Would you mind...? é um pedido polido.' }, { statement: 'Responsibility means avoiding every duty.', answer: false, explanation: 'Responsibility é responsabilidade.' }, { statement: 'A school authority should be treated respectfully.', answer: true, explanation: 'A proposta do nível é praticar respeito.' }],
    gapfill: [{ sentence: 'Would you mind ___ the notice?', options: ['reading', 'read', 'reads'], answer: 0 }, { sentence: 'Students are expected to ___ responsibly.', options: ['act', 'acts', 'acting'], answer: 0 }, { sentence: 'I would like to ___ permission.', options: ['request', 'requests', 'requesting'], answer: 0 }],
    timed: [{ question: 'Choose the most formal request.', options: ['Would you mind explaining the rule?', 'Tell me the rule!', 'You explain now.'], answer: 0 }, { question: 'A coordinator is responsible for...', options: ['organizing school activities', 'erasing the sky', 'selling shoes'], answer: 0 }, { question: 'Complete: We are ___ to follow the notice.', options: ['expected', 'expect', 'expecting'], answer: 0 }, { question: '“I apologize” means...', options: ['I am sorry', 'I am ready', 'I am late only'], answer: 0 }],
    duel: [{ question: 'Choose the formal request.', options: ['Could I speak with the principal, please?', 'I speak principal!', 'Principal, answer me!'], answer: 0 }, { question: 'Complete: We should ___ responsibility.', options: ['take', 'takes', 'taking'], answer: 0 }, { question: 'Respecting authority means...', options: ['listening and responding politely', 'never asking questions', 'ignoring notices'], answer: 0 }],
  },
};

export const LEVEL2_CONTENT = common;

// Falas do Zé no pátio: atrapalha cada vez mais da atividade 1 à 6, sempre no tom de piada.
export const LEVEL2_ZE_LINES: Record<string, string[]> = {
  n2_ditado: ['Psiu! Ditado? Eu escrevo "dog" com três G!', 'Que tal escrever "batata"? Fica melhor.', 'Não ouvi nada, e você?'],
  n2_caca: ['Escondi uma palavra no meu boné!', 'Procura aqui ó... brincadeira!', 'Achei a palavra "ZÉ"! Vale ponto?', 'Tic-tac, tic-tac!'],
  n2_mural: ['Opa, encostei no mural sem querer!', 'Esse aviso é meu, deixa eu ler primeiro!', 'Colei uma figurinha bem aqui!'],
  n2_bilhete: ['Fiz um desenho artístico no bilhete!', 'Rabisquei, mas ficou lindo, né?', 'Ops, a caneta escorregou!'],
  n2_relogio: ['Corre, corre! Ou não...', 'Para tudo! Olha um passarinho!', 'Eu atrasei o relógio... juro que não!'],
  n2_duelo: ['Minhas cartas são invencíveis!', 'Bafo! Bafo! Bafo!', 'Hoje eu ganho, pode anotar!', 'Essa carta é minha da sorte!'],
};
