import type { SchoolGrade } from './level0Content';
import { atividadesComRodada, faixaDaSerie, itensDaRodada, type ItemRodada } from './rodadasFases';

// Minijogos dos Níveis 5 a 8: cada atividade tem um TIPO de jogo (o aluno brinca de jeitos diferentes) e três
// fases de dificuldade crescente. As perguntas continuam lá, mas dentro do jogo.
// CONTEÚDO PROVISÓRIO (escrito pelo Claude em 02/11/2026) — para revisão do professor.
// Faixas: "base" = 6º e 7º ano; "avancado" = 8º e 9º ano.

type Faixa = 'base' | 'avancado';
export type Par = [string, string];
export type AlvoSala = 'na-estante' | 'embaixo-mesa' | 'na-mesa' | 'perto-janela' | 'na-frente-quadro' | 'entre-porta-quadro' | 'atras-porta' | 'no-canto';
export interface Sequencia { titulo: string; passos: string[] }
export interface OrdemSala { instrucao: string; alvo: AlvoSala; objeto: string }

export type TipoJogo = 'pares' | 'memoria' | 'frase' | 'ordem' | 'chuva' | 'travessia' | 'corrida' | 'sala' | 'rodada';

export type DadosJogo =
  | { tipo: 'pares' | 'memoria'; fases: Par[][]; falarEsquerda?: boolean }
  | { tipo: 'frase'; fases: string[][] }
  | { tipo: 'ordem'; fases: Sequencia[][]; falar?: boolean }
  | { tipo: 'chuva' | 'travessia' | 'corrida'; fases: ItemRodada[][] }
  | { tipo: 'sala'; fases: OrdemSala[][] }
  | { tipo: 'rodada' };

export const COMO_JOGAR: Record<TipoJogo, { nome: string; instrucao: string }> = {
  pares: { nome: 'Ligue os pares', instrucao: 'Toque um cartão da esquerda e depois o par dele na direita.' },
  memoria: { nome: 'Jogo da memória', instrucao: 'Vire duas cartas por vez e encontre os pares inglês–português.' },
  frase: { nome: 'Monte a frase', instrucao: 'Toque as palavras na ordem certa para montar a frase.' },
  ordem: { nome: 'Coloque em ordem', instrucao: 'Toque os cartões na ordem em que as coisas acontecem.' },
  chuva: { nome: 'Chuva de palavras', instrucao: 'Leia o desafio e derrube a resposta certa antes que ela chegue ao chão.' },
  travessia: { nome: 'Travessia do corredor', instrucao: 'Pise só na pedra com a resposta certa para atravessar cada faixa.' },
  corrida: { nome: 'Corrida contra o Zé', instrucao: 'Cada resposta certa faz você avançar. Chegue antes do Zé!' },
  sala: { nome: 'Monte a sala', instrucao: 'Ouça a instrução em inglês e toque o lugar certo da sala.' },
  rodada: { nome: 'Desafio de perguntas', instrucao: 'Responda às perguntas da rodada.' },
};

// ---------------- Conteúdo próprio dos jogos ----------------
const PARES: Record<string, Record<Faixa, Par[][]>> = {
  'nivel5-sentimentos': {
    base: [
      [['happy', 'feliz'], ['sad', 'triste'], ['angry', 'com raiva']],
      [['tired', 'cansado'], ['scared', 'com medo'], ['calm', 'calmo'], ['bored', 'entediado']],
      [['worried', 'preocupado'], ['excited', 'animado'], ['proud', 'orgulhoso'], ['nervous', 'nervoso'], ['hungry', 'com fome']],
    ],
    avancado: [
      [['relieved', 'aliviado'], ['proud', 'orgulhoso'], ['worried', 'preocupado']],
      [['embarrassed', 'envergonhado'], ['disappointed', 'decepcionado'], ['confident', 'confiante'], ['jealous', 'com ciúme']],
      [['frustrated', 'frustrado'], ['grateful', 'grato'], ['lonely', 'solitário'], ['anxious', 'ansioso'], ['surprised', 'surpreso']],
    ],
  },
  'nivel5-se': {
    base: [
      [['If it rains,', 'I take an umbrella.'], ['If I am hungry,', 'I eat a snack.'], ['If I am lost,', 'I ask for help.']],
      [['If you study,', 'you will learn more.'], ['If we share,', 'everybody plays.'], ['If I am tired,', 'I go to bed early.'], ['If the bell rings,', 'we go to class.']],
      [['If you listen,', 'you will understand.'], ['If we hurry,', 'we will arrive on time.'], ['If she practices,', 'she will improve.'], ['If they help,', 'we will finish.'], ['If it is sunny,', 'we will play outside.']],
    ],
    avancado: [
      [['If we leave now,', 'we will catch the bus.'], ['If you apologize,', 'she will forgive you.'], ['If I have time,', 'I will help you.']],
      [['If we save water,', 'we will protect the planet.'], ['If you don’t sleep,', 'you will feel tired.'], ['If they plan,', 'they will finish early.'], ['If he studies,', 'he will pass the test.']],
      [['If we listen to others,', 'we will decide better.'], ['If you check the source,', 'you won’t share fake news.'], ['If she trains,', 'she will win the race.'], ['If I don’t hurry,', 'I will miss the bell.'], ['If the group agrees,', 'we will start today.']],
    ],
  },
  'nivel6-causa': {
    base: [
      [['He didn’t study.', 'He failed the test.'], ['It rained a lot.', 'The yard was wet.'], ['She shared her snack.', 'Her friend smiled.']],
      [['I woke up late.', 'I missed the bus.'], ['We cleaned the room.', 'The room was tidy.'], ['He ran fast.', 'He won the race.'], ['They didn’t listen.', 'They got lost.']],
      [['She practiced every day.', 'She played very well.'], ['I forgot my lunch.', 'I was hungry.'], ['The team worked together.', 'They finished early.'], ['He shouted in class.', 'The teacher talked to him.'], ['We saved money.', 'We bought a ball.']],
    ],
    avancado: [
      [['Nobody checked the map,', 'so the team got lost.'], ['She told the truth,', 'so the problem was solved.'], ['He forgot his keys,', 'so he couldn’t get in.']],
      [['They shared the tasks,', 'so the project was easier.'], ['I didn’t charge my phone,', 'so it died at school.'], ['The class was noisy,', 'so nobody heard the bell.'], ['We left early,', 'so we arrived on time.']],
      [['He posted a rumor,', 'so his friend felt hurt.'], ['She apologized,', 'so they became friends again.'], ['The group didn’t plan,', 'so they missed the deadline.'], ['I reviewed my notes,', 'so I felt confident.'], ['They recycled,', 'so the school was cleaner.']],
    ],
  },
  'nivel7-aula': {
    base: [
      [['English class', 'English book'], ['Art class', 'colored pencils'], ['P.E. class', 'sneakers']],
      [['Math class', 'calculator'], ['Science class', 'lab coat'], ['Music class', 'flute'], ['History class', 'map']],
      [['Geography', 'atlas'], ['Portuguese', 'dictionary'], ['Computer class', 'headphones'], ['Art', 'paintbrush'], ['P.E.', 'water bottle']],
    ],
    avancado: [
      [['Before class:', 'review your notes.'], ['During class:', 'take notes.'], ['After class:', 'do your homework.']],
      [['Lab class:', 'read the safety rules.'], ['Test day:', 'bring two pens.'], ['Group work:', 'share the tasks.'], ['Presentation:', 'practice out loud.']],
      [['Missed a class?', 'Ask for the notes.'], ['Didn’t understand?', 'Ask the teacher.'], ['Big project?', 'Make a schedule.'], ['Feeling tired?', 'Take a short break.'], ['New words?', 'Make flashcards.']],
    ],
  },
  'nivel7-agenda': {
    base: [
      [['Monday', 'segunda-feira'], ['Tuesday', 'terça-feira'], ['Wednesday', 'quarta-feira']],
      [['Thursday', 'quinta-feira'], ['Friday', 'sexta-feira'], ['Saturday', 'sábado'], ['Sunday', 'domingo']],
      [['in the morning', 'de manhã'], ['in the afternoon', 'à tarde'], ['at night', 'à noite'], ['at noon', 'ao meio-dia'], ['on the weekend', 'no fim de semana']],
    ],
    avancado: [
      [['on Monday', 'dias da semana'], ['in May', 'meses'], ['at 3 p.m.', 'horários']],
      [['on May 10th', 'datas'], ['in 2026', 'anos'], ['at night', 'parte do dia (exceção)'], ['in the morning', 'parte do dia']],
      [['always', '100% das vezes'], ['usually', 'quase sempre'], ['sometimes', 'às vezes'], ['rarely', 'raramente'], ['never', 'nunca']],
    ],
  },
};

const MEMORIA: Record<string, Record<Faixa, Par[][]>> = {
  'nivel7-material': {
    base: [
      [['pencil', 'lápis'], ['eraser', 'borracha'], ['ruler', 'régua']],
      [['notebook', 'caderno'], ['pencil case', 'estojo'], ['backpack', 'mochila'], ['scissors', 'tesoura']],
      [['glue', 'cola'], ['sharpener', 'apontador'], ['highlighter', 'marca-texto'], ['folder', 'pasta'], ['calculator', 'calculadora']],
    ],
    avancado: [
      [['stapler', 'grampeador'], ['protractor', 'transferidor'], ['compass', 'compasso']],
      [['locker', 'armário'], ['schedule', 'horário'], ['binder', 'fichário'], ['sticky notes', 'post-its']],
      [['textbook', 'livro didático'], ['worksheet', 'folha de exercícios'], ['deadline', 'prazo'], ['handout', 'apostila'], ['planner', 'agenda']],
    ],
  },
};

const ORDEM: Record<string, { falar?: boolean; fases: Record<Faixa, Sequencia[][]> }> = {
  'nivel6-linha': { fases: {
    base: [
      [{ titulo: 'A manhã da Ana', passos: ['Ana woke up.', 'She had breakfast.', 'She went to school.'] }],
      [{ titulo: 'O jogo no pátio', passos: ['The bell rang.', 'We went to the yard.', 'We played soccer.', 'We came back to class.'] }],
      [{ titulo: 'O trabalho em grupo', passos: ['The teacher explained the task.', 'We divided the work.', 'Each person did a part.', 'We put it together.', 'We presented it.'] }],
    ],
    avancado: [
      [{ titulo: 'O conflito', passos: ['The team argued.', 'They listened to each other.', 'They finished the project.'] }],
      [{ titulo: 'O boato', passos: ['Someone started a rumor.', 'It spread online.', 'A student felt hurt.', 'The class talked about it.'] }],
      [{ titulo: 'O projeto atrasado', passos: ['The group made no plan.', 'They missed the deadline.', 'They explained the problem.', 'They made a new schedule.', 'They delivered the project.'] }],
    ],
  } },
  'nivel7-rotina': { fases: {
    base: [
      [{ titulo: 'Minha manhã', passos: ['Wake up', 'Brush my teeth', 'Go to school'] }],
      [{ titulo: 'Depois da aula', passos: ['Have lunch', 'Do my homework', 'Play with friends', 'Take a shower'] }],
      [{ titulo: 'Meu dia inteiro', passos: ['Get up at 6 a.m.', 'Have breakfast', 'Study at school', 'Do my homework', 'Go to bed at 9 p.m.'] }],
    ],
    avancado: [
      [{ titulo: 'Rotina de estudo', passos: ['Plan the tasks', 'Study for 25 minutes', 'Take a short break'] }],
      [{ titulo: 'Noite organizada', passos: ['Finish my homework', 'Pack my bag', 'Check my schedule', 'Go to bed early'] }],
      [{ titulo: 'Semana de prova', passos: ['Write a study plan', 'Review one topic a day', 'Do practice exercises', 'Ask about my doubts', 'Sleep well before the test'] }],
    ],
  } },
  'nivel7-estudo': { fases: {
    base: [
      [{ titulo: 'Antes de estudar', passos: ['Find a quiet place', 'Open my notebook', 'Read the lesson'] }],
      [{ titulo: 'Estudando inglês', passos: ['Read the new words', 'Say them out loud', 'Write a sentence', 'Check my answers'] }],
      [{ titulo: 'Plano da semana', passos: ['Monday: review vocabulary', 'Tuesday: grammar exercises', 'Wednesday: reading', 'Thursday: listening', 'Friday: the test'] }],
    ],
    avancado: [
      [{ titulo: 'Técnica de estudo', passos: ['Set a goal', 'Study with focus', 'Test yourself'] }],
      [{ titulo: 'Revisão para a prova', passos: ['List the topics', 'Choose the hardest first', 'Make flashcards', 'Practice with old tests'] }],
      [{ titulo: 'Projeto longo', passos: ['Understand the task', 'Break it into small steps', 'Set a deadline for each step', 'Check your progress', 'Deliver on time'] }],
    ],
  } },
  'nivel7-cozinha': { falar: true, fases: {
    base: [
      [{ titulo: 'Sanduíche', passos: ['Wash your hands.', 'Take two slices of bread.', 'Put cheese on the bread.'] }],
      [{ titulo: 'Suco de laranja', passos: ['Wash the oranges.', 'Cut the oranges.', 'Squeeze the juice.', 'Pour it into a glass.'] }],
      [{ titulo: 'Bolo de caneca', passos: ['Wash your hands.', 'Put the flour in the mug.', 'Add the egg and the milk.', 'Mix everything.', 'Put it in the microwave.'] }],
    ],
    avancado: [
      [{ titulo: 'Salada de frutas', passos: ['Wash the fruit carefully.', 'Cut the fruit into small pieces.', 'Mix it in a big bowl.'] }],
      [{ titulo: 'Panquecas', passos: ['Mix the flour, eggs and milk.', 'Heat the pan.', 'Pour a little batter.', 'Flip the pancake.'] }],
      [{ titulo: 'Bolo da turma', passos: ['Preheat the oven.', 'Mix the ingredients.', 'Pour the batter into the pan.', 'Bake it for thirty minutes.', 'Let it cool before cutting.'] }],
    ],
  } },
  'nivel8-apresentacao': { fases: {
    base: [
      [{ titulo: 'Apresentação curta', passos: ['Good morning, everyone.', 'Our project is about recycling.', 'Thank you for listening!'] }],
      [{ titulo: 'Partes da apresentação', passos: ['Say hello', 'Present the topic', 'Show the results', 'Say thank you'] }],
      [{ titulo: 'Apresentação completa', passos: ['Greet the audience', 'Introduce the group', 'Explain the problem', 'Show the solution', 'Answer questions'] }],
    ],
    avancado: [
      [{ titulo: 'Abertura', passos: ['Good morning, everyone.', 'Today we will present our survey.', 'First, let me explain the question.'] }],
      [{ titulo: 'Resultados', passos: ['We asked 50 students.', 'Most of them prefer group work.', 'Plan B was cheaper than Plan A.', 'So we chose Plan B.'] }],
      [{ titulo: 'Fechamento', passos: ['To sum up, the project worked.', 'The hardest part was the data.', 'Next time, we will start earlier.', 'Thank you for listening.', 'Any questions?'] }],
    ],
  } },
};

const SALA: Record<Faixa, OrdemSala[][]> = {
  base: [
    [{ instrucao: 'Put the plant on the shelf.', alvo: 'na-estante', objeto: '🪴' }, { instrucao: 'Put the bag under the desk.', alvo: 'embaixo-mesa', objeto: '🎒' }],
    [{ instrucao: 'Put the chair next to the window.', alvo: 'perto-janela', objeto: '🪑' }, { instrucao: 'Put the book on the desk.', alvo: 'na-mesa', objeto: '📘' }, { instrucao: 'Put the bin in the corner.', alvo: 'no-canto', objeto: '🗑️' }],
    [{ instrucao: 'Put the clock on the shelf.', alvo: 'na-estante', objeto: '⏰' }, { instrucao: 'Put the ball behind the door.', alvo: 'atras-porta', objeto: '⚽' }, { instrucao: 'Put the rug in front of the board.', alvo: 'na-frente-quadro', objeto: '🟫' }, { instrucao: 'Put the globe next to the window.', alvo: 'perto-janela', objeto: '🌍' }],
  ],
  avancado: [
    [{ instrucao: 'Place the bookshelf between the door and the board.', alvo: 'entre-porta-quadro', objeto: '📚' }, { instrucao: 'Put the chairs in front of the board.', alvo: 'na-frente-quadro', objeto: '🪑' }],
    [{ instrucao: 'Hide the box behind the door.', alvo: 'atras-porta', objeto: '📦' }, { instrucao: 'Put the backpack under the teacher’s desk.', alvo: 'embaixo-mesa', objeto: '🎒' }, { instrucao: 'Place the lamp on the shelf.', alvo: 'na-estante', objeto: '💡' }],
    [{ instrucao: 'Put the plant in the corner, far from the door.', alvo: 'no-canto', objeto: '🪴' }, { instrucao: 'Leave the laptop on the teacher’s desk.', alvo: 'na-mesa', objeto: '💻' }, { instrucao: 'Put the easel next to the window, where there is more light.', alvo: 'perto-janela', objeto: '🎨' }, { instrucao: 'Place the poster between the door and the board.', alvo: 'entre-porta-quadro', objeto: '🖼️' }],
  ],
};

// ---------------- Tipo de jogo de cada atividade ----------------
const TIPO: Record<string, TipoJogo> = {
  'nivel5-dialogos': 'rodada', 'nivel5-caminhos': 'rodada', 'nivel5-sentimentos': 'pares', 'nivel5-conselho': 'frase',
  'nivel5-se': 'pares', 'nivel5-ritmo': 'chuva', 'nivel5-revisao': 'corrida',
  'nivel6-causa': 'pares', 'nivel6-final': 'rodada', 'nivel6-linha': 'ordem', 'nivel6-entrevista': 'rodada',
  'nivel6-tetris': 'frase', 'nivel6-malentendido': 'rodada', 'nivel6-revisao': 'corrida',
  'nivel7-material': 'memoria', 'nivel7-rotina': 'ordem', 'nivel7-aula': 'pares', 'nivel7-divisao': 'rodada',
  'nivel7-estudo': 'ordem', 'nivel7-agenda': 'pares', 'nivel7-cozinha': 'ordem', 'nivel7-revisao': 'corrida',
  'nivel8-semana': 'frase', 'nivel8-entrega': 'rodada', 'nivel8-simulado': 'chuva', 'nivel8-sala': 'sala',
  'nivel8-travessia': 'travessia', 'nivel8-distracoes': 'chuva', 'nivel8-apresentacao': 'ordem', 'nivel8-revisao': 'corrida',
};

export const tipoDoJogo = (atividadeId: string): TipoJogo => TIPO[atividadeId] ?? 'rodada';

// Perguntas do nível inteiro (para jogos que pedem mais itens: corrida, chuva, travessia, frases).
function poolDoNivel(atividadeId: string, serie: SchoolGrade): ItemRodada[] {
  const prefixo = atividadeId.split('-')[0] + '-';
  const proprias = itensDaRodada(atividadeId, serie);
  const outras = atividadesComRodada().filter(id => id.startsWith(prefixo) && id !== atividadeId).flatMap(id => itensDaRodada(id, serie));
  return [...proprias, ...outras];
}
const curtas = (it: ItemRodada) => it.options.every(o => o.split(' ').length <= 4);
const emTres = <T,>(lista: T[], porFase: number[]): T[][] => {
  const out: T[][] = []; let i = 0;
  for (const n of porFase) { out.push(lista.slice(i, i + n)); i += n; }
  return out.filter(f => f.length);
};
const frasesDe = (itens: ItemRodada[]) => [...new Set(itens.map(it => it.options[it.answer]).filter(f => f.split(' ').length >= 3 && f.split(' ').length <= 10))]
  .sort((a, b) => a.split(' ').length - b.split(' ').length);

/** Dados do jogo de uma atividade para a série do aluno. */
export function dadosDoJogo(atividadeId: string, serie: SchoolGrade): DadosJogo {
  const tipo = tipoDoJogo(atividadeId);
  const faixa = faixaDaSerie(serie);
  switch (tipo) {
    case 'pares': return PARES[atividadeId] ? { tipo, fases: PARES[atividadeId][faixa], falarEsquerda: atividadeId === 'nivel5-sentimentos' } : { tipo: 'rodada' };
    case 'memoria': return MEMORIA[atividadeId] ? { tipo, fases: MEMORIA[atividadeId][faixa] } : { tipo: 'rodada' };
    case 'ordem': return ORDEM[atividadeId] ? { tipo, fases: ORDEM[atividadeId].fases[faixa], falar: ORDEM[atividadeId].falar } : { tipo: 'rodada' };
    case 'sala': return { tipo, fases: SALA[faixa] };
    case 'frase': {
      const frases = frasesDe(poolDoNivel(atividadeId, serie)).slice(0, 7);
      return frases.length >= 3 ? { tipo, fases: emTres(frases, [2, 2, 3]) } : { tipo: 'rodada' };
    }
    case 'chuva': {
      const pool = poolDoNivel(atividadeId, serie).filter(curtas).slice(0, 9);
      return pool.length >= 3 ? { tipo, fases: emTres(pool, [3, 3, 3]) } : { tipo: 'rodada' };
    }
    case 'travessia': return { tipo, fases: emTres(poolDoNivel(atividadeId, serie).filter(curtas).slice(0, 9), [3, 3, 3]) };
    case 'corrida': return { tipo, fases: emTres(poolDoNivel(atividadeId, serie).slice(0, 15), [4, 5, 6]) };
    default: return { tipo: 'rodada' };
  }
}
