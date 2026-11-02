import type { SchoolGrade } from './level0Content';

// Rodadas das atividades dos Níveis 5, 6 e 7: cada atividade vira uma sequência curta de perguntas.
// CONTEÚDO PROVISÓRIO (escrito pelo Claude em 01/11/2026) — para revisão do professor.
// Duas faixas: "base" (6º e 7º ano) e "avancado" (8º e 9º ano).
// Em cada item a alternativa certa é escrita primeiro (answer: 0); a tela embaralha na hora de jogar.
// `ouvir`: frase em inglês que a tela fala (itens de escuta e instruções da cozinha).

export interface ItemRodada {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  skill?: string;
  languageFocus?: string;
  ouvir?: string;
}

type Faixa = 'base' | 'avancado';
type Banco = Record<string, Record<Faixa, ItemRodada[]>>;

const q = (prompt: string, options: string[], explanation: string, skill: string, languageFocus: string, ouvir?: string): ItemRodada =>
  ({ prompt, options, answer: 0, explanation, skill, languageFocus, ...(ouvir ? { ouvir } : {}) });
// Escuta: o texto entre aspas no enunciado é o que a tela fala.
const ouvirAspas = (prompt: string) => /“([^”]+)”/.exec(prompt)?.[1];
const escuta = (prompt: string, options: string[], explanation: string, languageFocus: string) =>
  q(prompt, options, explanation, 'listening', languageFocus, ouvirAspas(prompt));
const instrucao = (texto: string, pergunta: string, options: string[], explanation: string) =>
  q(`Instruction: “${texto}” ${pergunta}`, options, explanation, 'listening', 'Imperative instructions', texto);

export const faixaDaSerie = (g: SchoolGrade): Faixa => (g === '6' || g === '7' ? 'base' : 'avancado');

// ---------------- Nível 5 · Minhas escolhas (somam-se à pergunta de cada série que já existia) ----------------
const NIVEL5: Banco = {
  'nivel5-dialogos': {
    base: [
      q('A new student does not know where the library is. What can you say?', ['I can show you the way.', 'Library is no.', 'You find it alone!'], 'I can + verbo oferece ajuda de forma simples.', 'speaking', 'I can + base verb'),
      q('Your friend drops her books. What do you say?', ['Let me help you.', 'Help you me let.', 'Your books, bad!'], 'Let me help you é um jeito educado de oferecer ajuda.', 'speaking', 'Let me + base verb'),
    ],
    avancado: [
      q('Your group wants to copy answers from the internet. What do you say?', ['I think we should write our own answers.', 'Copy everything, nobody cares.', 'I think we should to copy.'], 'I think we should... propõe uma escolha honesta (should + verbo, sem to).', 'speaking', 'I think + should'),
      q('A classmate interrupts everyone. What is a respectful response?', ['Could you let her finish, please?', 'Shut up now!', 'Could you letting her finish?'], 'Could you + verbo base faz um pedido educado.', 'speaking', 'Could you + base verb'),
    ],
  },
  'nivel5-caminhos': {
    base: [
      q('You find a wallet in the classroom. What is the right next step?', ['Give it to the teacher.', 'Keep the money.', 'Throw it away.'], 'Entregar ao professor é a escolha honesta.', 'reading', 'Imperative'),
      q('The bell rings and the floor is dirty. What is a helpful choice?', ['Help clean the floor.', 'Run out and leave the mess.', 'Make more mess.'], 'Ajudar a limpar é colaborar com a turma.', 'reading', 'Imperative'),
    ],
    avancado: [
      q('You see a classmate being teased online. What is the responsible path?', ['Support the classmate and tell a teacher.', 'Share the post with friends.', 'Add a funny comment.'], 'Apoiar o colega e avisar um adulto interrompe o problema.', 'reading', 'Imperative and coordinated actions'),
      q('Your project is due tomorrow and it is not finished. Which choice is wiser?', ['Tell the teacher honestly and ask for advice.', 'Copy a project from the internet.', 'Invent an excuse.'], 'Ser honesto e pedir orientação é a escolha responsável.', 'reading', 'Decision vocabulary'),
    ],
  },
  'nivel5-sentimentos': {
    base: [
      escuta('Listen: “I am scared because the room is dark.” How does the student feel?', ['Scared.', 'Happy.', 'Hungry.'], 'Scared significa com medo.', 'Verb to be + feeling'),
      escuta('Listen: “I am angry because someone broke my pen.” How does the student feel?', ['Angry.', 'Calm.', 'Sleepy.'], 'Angry significa bravo, com raiva.', 'Verb to be + feeling'),
    ],
    avancado: [
      escuta('Listen: “I felt embarrassed when I forgot my lines in the play.” Which feeling appears?', ['Embarrassed.', 'Excited.', 'Bored.'], 'Embarrassed significa envergonhado.', 'Past simple feeling context'),
      escuta('Listen: “I was proud because I finished the project on my own.” How did the student feel?', ['Proud.', 'Jealous.', 'Lonely.'], 'Proud significa orgulhoso.', 'Past simple + because'),
    ],
  },
  'nivel5-conselho': {
    base: [
      q('Your friend is always tired at school. Choose advice.', ['You should go to bed earlier.', 'You should sleep in class.', 'You should to sleep.'], 'Should + verbo base dá um conselho.', 'speaking', 'Should + base verb'),
      q('A classmate forgets homework every day. Choose advice.', ['You should write it in your agenda.', 'You should forget it.', 'You should writes it.'], 'Depois de should, o verbo fica na forma base (write).', 'speaking', 'Should + base verb'),
    ],
    avancado: [
      q('A friend uses the phone all night. Choose balanced advice.', ['You shouldn’t use your phone so late.', 'You should never sleep.', 'You shouldn’t to use it.'], 'Shouldn’t aconselha a não fazer algo.', 'speaking', 'Should not + base verb'),
      q('A teammate is nervous about the presentation. Choose supportive advice.', ['You should practice with us first.', 'You should not prepare.', 'You should practicing.'], 'Should + verbo base com uma ação de apoio.', 'speaking', 'Should + base verb'),
    ],
  },
  'nivel5-se': {
    base: [
      q('If it rains, what do we need?', ['An umbrella.', 'Sunglasses only.', 'A swimming pool.'], 'If + presente descreve uma situação possível.', 'reading', 'If + present'),
      q('If you study, what will happen?', ['I will learn more.', 'I learn will more.', 'I learned more tomorrow.'], 'Will + verbo mostra o resultado provável.', 'reading', 'First conditional'),
    ],
    avancado: [
      q('Complete: “If I ___ time, I will help you.”', ['have', 'will have', 'had'], 'Na parte do if, usa-se o presente; o will fica no resultado.', 'writing', 'First conditional: if + present'),
      q('If we don’t save water, what will happen?', ['We will have problems in the future.', 'We have problems yesterday.', 'We will to have problems.'], 'Will + verbo base, sem to.', 'reading', 'First conditional'),
    ],
  },
  'nivel5-ritmo': {
    base: [
      q('Complete: “You ___ say thank you.”', ['should', 'should to', 'shoulds'], 'Should não recebe to nem -s.', 'speaking', 'Should + base verb'),
      q('Complete: “I think it is a good ___.”', ['idea', 'think', 'goodly'], 'A good idea: artigo + adjetivo + substantivo.', 'speaking', 'Article + adjective + noun'),
    ],
    avancado: [
      q('Complete: “We ___ to finish before the bell.”', ['need', 'needs', 'needing'], 'Com we, o verbo fica sem -s.', 'speaking', 'Simple present'),
      q('Complete: “This plan is ___ than the first one.”', ['easier', 'more easy', 'easiest'], 'Easy vira easier no comparativo.', 'speaking', 'Comparatives'),
    ],
  },
  'nivel5-revisao': {
    base: [
      q('Choose the polite request.', ['Can I borrow your eraser, please?', 'Give me your eraser!', 'I borrow eraser you.'], 'Can I... please? é um pedido educado.', 'writing', 'Can I...?'),
      q('Which sentence gives a reason?', ['I am happy because it is Friday.', 'I am happy because.', 'Because I am Friday.'], 'Because introduz o motivo.', 'writing', 'Because clause'),
    ],
    avancado: [
      q('Choose the correct advice.', ['You should apologize to her.', 'You should to apologize to her.', 'You apologize should her.'], 'Should + verbo base, na ordem sujeito + should + verbo.', 'writing', 'Should + base verb'),
      q('Choose the correct first conditional.', ['If we leave now, we will arrive on time.', 'If we will leave now, we arrive on time.', 'If we left now, we will arrive.'], 'If + presente, will + verbo.', 'writing', 'First conditional'),
    ],
  },
};

// ---------------- Nível 6 · Consequências ----------------
const NIVEL6: Banco = {
  'nivel6-causa': {
    base: [
      q('Tom did not study. What happened?', ['He failed the test.', 'He got a perfect score.', 'He won a prize for studying.'], 'A causa (não estudou) leva ao resultado.', 'reading', 'Cause and effect'),
      q('Why is the floor wet?', ['Because it rained in the yard.', 'Because the floor is sad.', 'Because wet.'], 'Because explica a causa.', 'reading', 'Because clause'),
      q('Mia shared her snack. What was the result?', ['Her friend smiled.', 'Her friend got angry with her.', 'The snack disappeared.'], 'Uma ação gentil tem uma consequência positiva.', 'reading', 'Cause and effect'),
    ],
    avancado: [
      q('Complete: “The team didn’t check the map, so they ___ lost.”', ['got', 'get', 'will got'], 'So introduz a consequência; got é o passado de get.', 'writing', 'So + past simple'),
      q('Why did the project fail?', ['Because nobody shared the tasks.', 'Because tasks sharing nobody.', 'Because the project fail.'], 'Because + frase completa no passado explica a causa.', 'reading', 'Because + past simple'),
      q('Which sentence shows a consequence?', ['He forgot his keys, so he couldn’t open the door.', 'He forgot his keys because the door.', 'So he forgot, keys door.'], 'So mostra o que aconteceu por causa da ação.', 'reading', 'So for consequence'),
    ],
  },
  'nivel6-final': {
    base: [
      q('Leo broke a window by accident. Choose a responsible ending.', ['He told the teacher the truth.', 'He ran away and hid.', 'He blamed his friend.'], 'Contar a verdade é assumir a consequência.', 'reading', 'Past simple'),
      q('Ana forgot her friend’s birthday. Choose a kind ending.', ['She said sorry and made a card.', 'She pretended nothing happened.', 'She laughed at her friend.'], 'Pedir desculpas conserta a situação.', 'reading', 'Past simple'),
      q('The class made a mess in the lab. Choose the best ending.', ['Everybody helped clean it up.', 'They left it for the teacher.', 'They made more mess.'], 'Todos assumem o que fizeram juntos.', 'reading', 'Past simple'),
    ],
    avancado: [
      q('Sam posted a photo of a friend without asking. Choose a responsible ending.', ['He deleted it and apologized.', 'He posted more photos.', 'He said it was not his fault.'], 'Apagar e pedir desculpas repara o erro.', 'reading', 'Past simple'),
      q('The group missed the deadline. Choose the most mature ending.', ['They explained the problem and made a new plan.', 'They blamed the teacher.', 'They gave up on the project.'], 'Explicar e replanejar é a resposta madura.', 'reading', 'Past simple'),
      q('Julia heard a rumor about a classmate. Choose an ethical ending.', ['She didn’t spread it and talked to her classmate.', 'She told everyone at lunch.', 'She added more details to the rumor.'], 'Não espalhar boatos protege o colega.', 'reading', 'Past simple negative'),
    ],
  },
  'nivel6-linha': {
    base: [
      q('Story: “First, Ana woke up. Then she had breakfast. After that, she went to school.” What did Ana do first?', ['She woke up.', 'She went to school.', 'She had breakfast.'], 'First mostra o primeiro acontecimento.', 'reading', 'Sequence words'),
      q('In the same story, what did Ana do after breakfast?', ['She went to school.', 'She woke up.', 'She went to bed.'], 'After that indica o que veio depois.', 'reading', 'Sequence words'),
      q('Which word shows the last event?', ['Finally', 'First', 'Before'], 'Finally indica o último acontecimento.', 'reading', 'Sequence words'),
    ],
    avancado: [
      q('Story: “The team argued, then they listened to each other, and finally they finished the project.” What happened before they finished?', ['They listened to each other.', 'They argued again.', 'They started a new project.'], 'Then e finally organizam a linha do tempo.', 'reading', 'Sequence words'),
      q('Choose the correct order for a presentation.', ['Plan, practice, present.', 'Present, plan, practice.', 'Practice, present, plan.'], 'Primeiro se planeja, depois se pratica e por fim se apresenta.', 'reading', 'Sequencing'),
      q('Complete: “___ the test, I reviewed my notes.”', ['Before', 'After', 'Finally'], 'Before indica algo feito antes da prova.', 'writing', 'Time connectors: before / after'),
    ],
  },
  'nivel6-entrevista': {
    base: [
      q('Choose a good interview question.', ['What do you like to do after school?', 'What you like do after school?', 'You like what?'], 'A pergunta usa do + sujeito + verbo.', 'speaking', 'Wh- questions with do'),
      q('Your classmate asks: “How are you?” Choose a polite answer.', ['I’m fine, thanks. And you?', 'Fine you.', 'Why do you ask?'], 'Responder e devolver a pergunta é educado.', 'speaking', 'Greetings'),
      q('Choose a respectful way to end the interview.', ['Thank you for your time!', 'OK, go away.', 'Finish, bye now!'], 'Agradecer encerra a entrevista com respeito.', 'speaking', 'Polite expressions'),
    ],
    avancado: [
      q('Choose a good follow-up question.', ['Why did you choose that project?', 'Why you chose that project?', 'Why did you chose that project?'], 'No passado, did + verbo base (choose).', 'speaking', 'Past simple questions'),
      q('Your interviewee disagrees with you. What do you say?', ['That’s interesting. Can you explain why?', 'You are completely wrong.', 'Stop talking, please.'], 'Pedir explicação mostra respeito pela opinião do outro.', 'speaking', 'Polite follow-up'),
      q('Choose the correct question about the past.', ['What did you learn from the mistake?', 'What you learned from the mistake?', 'What did you learned from the mistake?'], 'Did + sujeito + verbo base.', 'speaking', 'Past simple questions'),
    ],
  },
  'nivel6-tetris': {
    base: [
      q('Which sentence is in the right order?', ['I clean my desk every day.', 'Every I clean day my desk.', 'Desk my clean I every day.'], 'Sujeito + verbo + complemento + tempo.', 'writing', 'Word order'),
      q('Which sentence is in the right order?', ['She helped her friend yesterday.', 'Helped she yesterday her friend.', 'Her friend she yesterday helped.'], 'Sujeito + verbo + objeto + tempo.', 'writing', 'Word order'),
      q('Fit the missing word: “We ___ late because of the rain.”', ['were', 'was', 'are be'], 'Com we, o passado de be é were.', 'writing', 'Past of be'),
    ],
    avancado: [
      q('Which sentence is in the right order?', ['If we work together, we will finish faster.', 'If together we work, faster finish we will.', 'We will if together work finish faster.'], 'If + presente, will + verbo.', 'writing', 'First conditional word order'),
      q('Which sentence is in the right order?', ['He didn’t study, so he was nervous.', 'So nervous he didn’t was study.', 'He was so didn’t nervous study.'], 'Causa, so, consequência.', 'writing', 'Word order with so'),
      q('Fit the missing word: “They lost the game ___ they didn’t train.”', ['because', 'so', 'but'], 'Because introduz o motivo da derrota.', 'writing', 'Connectors'),
    ],
  },
  'nivel6-malentendido': {
    base: [
      q('Your friend thinks you are angry with him. What do you say?', ['I’m not angry. I’m just tired.', 'Yes, go away.', 'Angry you not me.'], 'Explicar com calma desfaz o mal-entendido.', 'speaking', 'Verb to be negative'),
      q('You didn’t understand the teacher. What do you say?', ['Sorry, can you repeat, please?', 'What? Whatever.', 'Repeat you now!'], 'Can you repeat, please? pede ajuda com educação.', 'speaking', 'Can you...?'),
      q('Someone took your seat by mistake. Choose a clear answer.', ['Excuse me, I think this is my seat.', 'Get out of my seat!', 'Seat my is.'], 'Excuse me + I think deixa a fala clara e gentil.', 'speaking', 'Polite expressions'),
    ],
    avancado: [
      q('Your message was misunderstood in the group chat. Choose a clear reply.', ['Sorry, I didn’t mean that. Let me explain.', 'You never understand anything.', 'Whatever, forget it.'], 'Assumir e explicar resolve o mal-entendido.', 'speaking', 'Past simple negative'),
      q('A classmate thinks you took her idea. Choose a clear response.', ['I see why you think that. Let’s talk about it.', 'It was my idea, stop it!', 'I don’t care.'], 'Reconhecer o ponto de vista abre o diálogo.', 'speaking', 'Let’s + base verb'),
      q('Choose the best way to check understanding.', ['So, do you mean we should start tomorrow?', 'You mean nothing.', 'Do you means tomorrow?'], 'Do you mean...? confirma o que a pessoa quis dizer.', 'speaking', 'Do you mean...?'),
    ],
  },
  'nivel6-revisao': {
    base: [
      q('Choose the sentence with a reason.', ['I was late because I missed the bus.', 'I late because bus.', 'Because I was late bus.'], 'Because + frase completa dá o motivo.', 'writing', 'Because clause'),
      q('Complete: “Yesterday I ___ my friend.”', ['helped', 'help', 'helping'], 'Yesterday pede o passado: helped.', 'writing', 'Past simple'),
      q('Choose the consequence: “If you shout, ...”', ['people will not listen.', 'people listen yesterday.', 'people will listens.'], 'Will + verbo base mostra a consequência.', 'writing', 'First conditional'),
    ],
    avancado: [
      q('Choose the correct sentence.', ['If they practice, they will win.', 'If they will practice, they win.', 'If they practiced, they will win.'], 'If + presente, will + verbo.', 'writing', 'First conditional'),
      q('Complete: “It rained, ___ the game was cancelled.”', ['so', 'because', 'but'], 'So introduz a consequência da chuva.', 'writing', 'Connectors'),
      q('Choose the correct past question.', ['Did you finish the task?', 'Did you finished the task?', 'Do you finished the task?'], 'Did + sujeito + verbo base.', 'writing', 'Past simple questions'),
    ],
  },
};

// ---------------- Nível 7 · Aprender a se organizar ----------------
const NIVEL7: Banco = {
  'nivel7-material': {
    base: [
      q('Which item do you use to write?', ['A pencil.', 'A ruler.', 'A backpack.'], 'Pencil é lápis.', 'reading', 'School objects'),
      q('Where do you keep your pens?', ['In my pencil case.', 'In my lunch box.', 'In the trash can.'], 'Pencil case é o estojo.', 'reading', 'School objects'),
      q('Complete: “I have ___ eraser.”', ['an', 'a', 'two an'], 'Antes de som de vogal, usa-se an.', 'writing', 'Articles a / an'),
    ],
    avancado: [
      q('You need to measure a line. What do you need?', ['A ruler.', 'A glue stick.', 'A sharpener.'], 'Ruler é a régua.', 'reading', 'School objects'),
      q('Choose the organized option.', ['I put my notebooks in order by subject.', 'I throw everything in my bag.', 'I never check my bag.'], 'Separar por matéria é se organizar.', 'reading', 'Simple present'),
      q('Complete: “There ___ three books in my bag.”', ['are', 'is', 'be'], 'There are para plural.', 'writing', 'There is / there are'),
    ],
  },
  'nivel7-rotina': {
    base: [
      q('What time do you get up?', ['I get up at seven o’clock.', 'I get up in seven.', 'I gets up at seven.'], 'Horas usam at; com I, o verbo fica sem -s.', 'speaking', 'Telling the time'),
      q('Choose the right order for the morning.', ['Wake up, brush teeth, go to school.', 'Go to school, wake up, brush teeth.', 'Brush teeth, go to school, wake up.'], 'A rotina segue uma ordem lógica.', 'reading', 'Routine verbs'),
      q('Complete: “She ___ her homework after lunch.”', ['does', 'do', 'doing'], 'Com she, do vira does.', 'writing', 'Simple present 3rd person'),
    ],
    avancado: [
      q('Complete: “I always ___ my bag the night before.”', ['pack', 'packs', 'packing'], 'Com I, o verbo fica na forma base.', 'writing', 'Adverbs of frequency'),
      q('Which sentence shows frequency correctly?', ['I usually study for an hour.', 'I study an hour usually yesterday.', 'Usually I studies.'], 'Usually vem antes do verbo principal.', 'writing', 'Adverbs of frequency'),
      q('Choose the best routine for study.', ['I study, take a break, then review.', 'I play all night and study at 6 a.m.', 'I never take breaks or sleep.'], 'Estudar com pausas e revisão funciona melhor.', 'reading', 'Sequencing'),
    ],
  },
  'nivel7-aula': {
    base: [
      q('You have English class today. What do you take?', ['My English book and notebook.', 'My swimsuit.', 'A pillow.'], 'Livro e caderno de inglês são o material da aula.', 'reading', 'School objects'),
      q('The teacher is talking. What should you do?', ['Listen and take notes.', 'Talk to your friend.', 'Play on your phone.'], 'Ouvir e anotar ajuda a aprender.', 'reading', 'Classroom language'),
      q('Complete: “Can I ___ to the bathroom, please?”', ['go', 'going', 'goes'], 'Can I + verbo base.', 'speaking', 'Can I...?'),
    ],
    avancado: [
      q('Before a lab class, what should you do?', ['Read the instructions first.', 'Touch everything.', 'Skip the safety rules.'], 'Ler as instruções primeiro garante a segurança.', 'reading', 'Imperative'),
      q('You missed the last class. What is the best action?', ['Ask a classmate for the notes.', 'Ignore the content.', 'Copy the test answers.'], 'Pedir as anotações recupera o conteúdo.', 'reading', 'Decision vocabulary'),
      q('Complete: “I’m going to ___ my homework before class.”', ['finish', 'finishing', 'finished'], 'Going to + verbo base.', 'writing', 'Going to'),
    ],
  },
  'nivel7-divisao': {
    base: [
      q('Your group has a poster to make. How do you divide the work?', ['One draws, one writes, one colors.', 'One person does everything.', 'Nobody does anything.'], 'Cada um com uma tarefa é uma divisão justa.', 'reading', 'Simple present'),
      q('Choose a fair sentence.', ['You can write and I can draw.', 'I do nothing, you do all.', 'You write draw color.'], 'Can + verbo divide as tarefas com clareza.', 'speaking', 'Can for tasks'),
      q('A friend has no task. What do you say?', ['Do you want to help with the title?', 'You are useless.', 'Sit and wait.'], 'Convidar inclui o colega.', 'speaking', 'Do you want to...?'),
    ],
    avancado: [
      q('Choose the best way to give someone a task.', ['Could you be responsible for the research?', 'You do research, now!', 'Research you be responsible could.'], 'Could you...? delega com educação.', 'speaking', 'Could you...?'),
      q('Someone has too much work. What is fair?', ['Let’s share some of your tasks.', 'That’s your problem.', 'Give it all to the teacher.'], 'Dividir a carga é trabalhar em equipe.', 'speaking', 'Let’s + base verb'),
      q('Complete: “Lucas is going to ___ the slides.”', ['make', 'makes', 'making'], 'Going to + verbo base.', 'writing', 'Going to'),
    ],
  },
  'nivel7-estudo': {
    base: [
      q('The test is on Friday. When should you start studying?', ['On Monday, a little every day.', 'On Friday morning.', 'After the test.'], 'Estudar um pouco por dia funciona melhor.', 'reading', 'Days of the week'),
      q('Choose a good study habit.', ['Study in a quiet place.', 'Study with the TV loud.', 'Study only when the test starts.'], 'Um lugar tranquilo ajuda a concentrar.', 'reading', 'Imperative'),
      q('Complete: “I ___ my notes every day.”', ['review', 'reviews', 'reviewing'], 'Com I, o verbo fica na forma base.', 'writing', 'Simple present'),
    ],
    avancado: [
      q('Choose the best study plan.', ['I’m going to review one topic a day and do exercises.', 'I’m going to read everything the night before.', 'I’m going to skip the hard topics.'], 'Revisar aos poucos e praticar é um bom plano.', 'reading', 'Going to'),
      q('You don’t understand a topic. What is the best plan?', ['Ask the teacher and practice more.', 'Skip it forever.', 'Hope it is not on the test.'], 'Pedir ajuda e praticar resolve a dúvida.', 'reading', 'Imperative'),
      q('Complete: “We are going to ___ together on Saturday.”', ['study', 'studies', 'studying'], 'Going to + verbo base.', 'writing', 'Going to'),
    ],
  },
  'nivel7-agenda': {
    base: [
      q('Your agenda says: “Monday – Math test.” What do you do on Sunday?', ['Study math.', 'Forget about it.', 'Study art only.'], 'A agenda lembra de estudar antes da prova.', 'reading', 'Days of the week'),
      q('Which day comes after Tuesday?', ['Wednesday.', 'Monday.', 'Friday.'], 'Tuesday, Wednesday, Thursday...', 'reading', 'Days of the week'),
      q('Complete: “My English class is ___ Thursday.”', ['on', 'in', 'at'], 'Dias da semana usam on.', 'writing', 'Prepositions of time'),
    ],
    avancado: [
      q('You have soccer at 4 p.m. and homework. Which plan is smart?', ['Do homework at 2 p.m., then go to soccer.', 'Skip homework every day.', 'Do homework at midnight.'], 'Fazer a lição antes do treino organiza o dia.', 'reading', 'Telling the time'),
      q('Complete: “The project is due ___ May 10th.”', ['on', 'in', 'at'], 'Datas usam on.', 'writing', 'Prepositions of time'),
      q('Complete: “The meeting starts ___ 3 o’clock.”', ['at', 'on', 'in'], 'Horários usam at.', 'writing', 'Prepositions of time'),
    ],
  },
  'nivel7-cozinha': {
    base: [
      instrucao('Wash your hands.', 'What do you do first?', ['Wash my hands.', 'Eat the cake.', 'Turn on the TV.'], 'Wash your hands: lave as mãos.'),
      instrucao('Put the eggs in the bowl.', 'Where do the eggs go?', ['In the bowl.', 'On the floor.', 'In the sink.'], 'Bowl é a tigela.'),
      instrucao('Mix the flour and the milk.', 'What do you mix?', ['Flour and milk.', 'Eggs and juice.', 'Rice and beans.'], 'Mix: misture a farinha e o leite.'),
    ],
    avancado: [
      instrucao('Preheat the oven before you add the cake.', 'What comes first?', ['Preheat the oven.', 'Add the cake.', 'Eat the cake.'], 'Before mostra que o forno é aquecido antes.'),
      instrucao('Cut the bananas carefully and put them on the plate.', 'What do you do with the bananas?', ['Cut them and put them on the plate.', 'Throw them away.', 'Put them in the oven.'], 'Duas ações em sequência: cortar e colocar no prato.'),
      instrucao('Don’t open the oven for twenty minutes.', 'What should you NOT do?', ['Open the oven.', 'Wait twenty minutes.', 'Watch the clock.'], 'Don’t + verbo é uma proibição.'),
    ],
  },
  'nivel7-revisao': {
    base: [
      q('Complete: “I ___ to school at 7 a.m.”', ['go', 'goes', 'going'], 'Com I, o verbo fica na forma base.', 'writing', 'Simple present'),
      q('Choose the organized student.', ['She checks her bag every night.', 'She loses her books every day.', 'She never writes homework down.'], 'Conferir a mochila toda noite é organização.', 'reading', 'Simple present 3rd person'),
      q('Complete: “He ___ plays video games on school nights.”', ['never', 'nevers', 'not never'], 'Never vem antes do verbo e não muda.', 'writing', 'Adverbs of frequency'),
    ],
    avancado: [
      q('Complete: “Next week, I’m going to ___ a study group.”', ['start', 'started', 'starts'], 'Going to + verbo base para planos.', 'writing', 'Going to'),
      q('Choose the correct sentence.', ['We usually meet on Tuesdays at 5 p.m.', 'We meet usually in Tuesdays on 5 p.m.', 'Usually we meets at Tuesdays.'], 'Usually antes do verbo; on para dias; at para horas.', 'writing', 'Frequency and prepositions'),
      q('Which plan is best for a big project?', ['Divide it into small tasks with dates.', 'Do it all on the last day.', 'Wait for someone else to do it.'], 'Tarefas pequenas com prazo tornam o projeto possível.', 'reading', 'Planning vocabulary'),
    ],
  },
};

const BANCO: Banco = { ...NIVEL5, ...NIVEL6, ...NIVEL7 };

/**
 * Perguntas da rodada de uma atividade.
 * `primeiras`: itens que já existiam para a série (Nível 5) e abrem a rodada.
 */
export function itensDaRodada(atividadeId: string, serie: SchoolGrade, primeiras: ItemRodada[] = []): ItemRodada[] {
  const extra = BANCO[atividadeId]?.[faixaDaSerie(serie)] ?? [];
  const lista = [...primeiras, ...extra].map(it => (it.ouvir || it.skill !== 'listening' ? it : { ...it, ouvir: ouvirAspas(it.prompt) }));
  return lista.slice(0, 4);
}

export const atividadesComRodada = () => Object.keys(BANCO);
