// Banco de questões do Level 0 (Arcade).
// Para acrescentar uma questão: copie uma linha q(...) dentro do tópico certo.
// A PRIMEIRA alternativa é sempre a correta; o jogo embaralha as alternativas na hora.
// Professores também podem cadastrar questões pelo Painel do Professor (aba "Banco de Questões").

export type GradeId = '6' | '7' | '8' | '9' | 'EM';

export interface GradeInfo {
  id: GradeId;
  label: string;
  short: string;
  emoji: string;
  gradient: string;
  tagline: string;
}

export interface TopicInfo {
  id: string;
  grade: GradeId;
  title: string;
  titlePt: string;
  emoji: string;
}

export interface BankQuestion {
  id: string;
  grade: GradeId;
  topic: string;
  prompt: string;
  promptPt?: string;
  options: string[]; // options[0] é a correta
  explanation: string;
  custom?: boolean;
}

export const GRADES: GradeInfo[] = [
  { id: '6', label: '6º ano', short: '6º', emoji: '🌱', gradient: 'from-emerald-400 to-teal-600', tagline: 'Rookie' },
  { id: '7', label: '7º ano', short: '7º', emoji: '⚡', gradient: 'from-sky-400 to-blue-600', tagline: 'Explorer' },
  { id: '8', label: '8º ano', short: '8º', emoji: '🔥', gradient: 'from-orange-400 to-rose-600', tagline: 'Challenger' },
  { id: '9', label: '9º ano', short: '9º', emoji: '🚀', gradient: 'from-violet-400 to-purple-700', tagline: 'Master' },
  { id: 'EM', label: 'Ensino Médio', short: 'EM', emoji: '👑', gradient: 'from-amber-300 to-yellow-600', tagline: 'Legend' },
];

export const TOPICS: TopicInfo[] = [
  { id: '6-to-be', grade: '6', title: 'Verb To Be', titlePt: 'Verbo to be', emoji: '🙋' },
  { id: '6-school', grade: '6', title: 'School Stuff', titlePt: 'Escola e sala de aula', emoji: '🎒' },
  { id: '6-family', grade: '6', title: 'Family & Possessives', titlePt: 'Família e possessivos', emoji: '👨‍👩‍👧' },
  { id: '6-numbers', grade: '6', title: 'Numbers & Time', titlePt: 'Números, datas e horas', emoji: '🔢' },

  { id: '7-present', grade: '7', title: 'Simple Present', titlePt: 'Presente simples e rotina', emoji: '⏰' },
  { id: '7-continuous', grade: '7', title: 'Present Continuous', titlePt: 'Presente contínuo', emoji: '🏃' },
  { id: '7-food', grade: '7', title: 'Food & Quantities', titlePt: 'Comida e quantidades', emoji: '🍕' },
  { id: '7-cognates', grade: '7', title: 'False Friends', titlePt: 'Cognatos e falsos cognatos', emoji: '🕵️' },

  { id: '8-comparatives', grade: '8', title: 'Comparatives', titlePt: 'Comparativos (older than, as old as)', emoji: '⚖️' },
  { id: '8-superlatives', grade: '8', title: 'Superlatives', titlePt: 'Superlativos (the tallest)', emoji: '🏆' },
  { id: '8-past', grade: '8', title: 'Simple Past', titlePt: 'Passado simples', emoji: '⏪' },
  { id: '8-future', grade: '8', title: 'Will & Going To', titlePt: 'Futuro', emoji: '🔮' },

  { id: '9-perfect', grade: '9', title: 'Present Perfect', titlePt: 'Present perfect', emoji: '✅' },
  { id: '9-modals', grade: '9', title: 'Modal Verbs', titlePt: 'Verbos modais', emoji: '🧭' },
  { id: '9-conditional', grade: '9', title: 'First Conditional', titlePt: 'Condicional (if + will)', emoji: '🔀' },
  { id: '9-digital', grade: '9', title: 'Digital Life', titlePt: 'Vocabulário digital e leitura', emoji: '📱' },

  { id: 'EM-passive', grade: 'EM', title: 'Passive Voice', titlePt: 'Voz passiva', emoji: '🔁' },
  { id: 'EM-conditionals', grade: 'EM', title: '2nd & 3rd Conditionals', titlePt: 'Condicionais 2 e 3', emoji: '🌀' },
  { id: 'EM-reported', grade: 'EM', title: 'Reported Speech', titlePt: 'Discurso indireto', emoji: '💬' },
  { id: 'EM-enem', grade: 'EM', title: 'ENEM Reading', titlePt: 'Leitura estilo ENEM', emoji: '📰' },
];

let counter = 0;
const q = (topic: string, prompt: string, options: string[], explanation: string, promptPt?: string): BankQuestion => {
  const grade = topic.split('-')[0] as GradeId;
  counter += 1;
  return { id: `${topic}-${counter}`, grade, topic, prompt, promptPt, options, explanation };
};

export const BUILT_IN_QUESTIONS: BankQuestion[] = [
  // ───────────── 6º ANO ─────────────
  q('6-to-be', 'I ___ a student at Nísia Vilela.', ['am', 'is', 'are', 'be'], 'Com "I" usamos sempre "am": I am a student.'),
  q('6-to-be', 'She ___ my best friend.', ['is', 'am', 'are', 'be'], 'He, she e it usam "is".'),
  q('6-to-be', 'We ___ in the 6th grade.', ['are', 'is', 'am', 'be'], 'We, you e they usam "are".'),
  q('6-to-be', 'Choose the negative: "They are tired."', ["They aren't tired.", "They isn't tired.", "They don't tired.", "They not are tired."], 'Para negar o verbo to be, basta acrescentar "not": are not = aren\'t.'),
  q('6-to-be', '"___ you 11 years old?" "Yes, I am."', ['Are', 'Is', 'Am', 'Do'], 'Na pergunta, o verbo to be vem antes do sujeito: Are you...?'),
  q('6-to-be', 'Which sentence is correct?', ['Mateus is 14 years old.', 'Mateus has 14 years old.', 'Mateus have 14 years.', 'Mateus are 14 years old.'], 'Em inglês, idade se diz com o verbo to be: "is 14 years old", nunca "has".', 'Qual frase está correta?'),
  q('6-to-be', 'The books ___ on the desk.', ['are', 'is', 'am', 'be'], '"The books" é plural, então usamos "are".'),

  q('6-school', 'What do you use to erase a mistake?', ['an eraser', 'a ruler', 'a backpack', 'a notebook'], 'Eraser = borracha. Ruler = régua.', 'O que você usa para apagar um erro?'),
  q('6-school', '"Régua" in English is...', ['ruler', 'rubber band', 'glue', 'scissors'], 'Ruler = régua. Glue = cola. Scissors = tesoura.'),
  q('6-school', 'Where do students eat lunch at school?', ['in the cafeteria', 'in the library', 'in the gym', 'in the classroom board'], 'Cafeteria (ou canteen) é onde se come. Library = biblioteca.', 'Onde os alunos almoçam na escola?'),
  q('6-school', 'The teacher writes on the ___.', ['board', 'floor', 'window', 'door'], 'Board = quadro. O professor escreve no quadro.'),
  q('6-school', 'Which subject studies numbers?', ['Math', 'History', 'Art', 'Geography'], 'Math (Mathematics) = Matemática.', 'Qual matéria estuda números?'),
  q('6-school', 'Choose the classroom command: "Abram os livros."', ['Open your books.', 'Close your books.', 'Read your door.', 'Sit your books.'], 'Open = abrir. Close = fechar.'),

  q('6-family', "My mother's mother is my...", ['grandmother', 'aunt', 'sister', 'cousin'], 'A mãe da sua mãe é sua avó: grandmother.', 'A mãe da minha mãe é minha...'),
  q('6-family', "My father's brother is my...", ['uncle', 'nephew', 'grandfather', 'son'], 'O irmão do seu pai é seu tio: uncle.'),
  q('6-family', 'This is Ana. ___ brother is Leo.', ['Her', 'His', 'Their', 'Its'], 'Ana é menina, então "o irmão dela" = her brother.'),
  q('6-family', 'This is Pedro. ___ sister is Bia.', ['His', 'Her', 'My', 'Its'], 'Pedro é menino, então "a irmã dele" = his sister.'),
  q('6-family', "Choose the correct form: o cachorro do Lucas.", ["Lucas's dog", "dog's Lucas", "Lucas dog's", "the dog Lucas"], "Usamos 's para posse: Lucas's dog."),
  q('6-family', 'Your uncle\'s children are your...', ['cousins', 'nephews', 'parents', 'grandparents'], 'Os filhos do seu tio são seus primos: cousins.'),

  q('6-numbers', 'How do you write 15?', ['fifteen', 'fifty', 'five', 'fiveteen'], '15 = fifteen. 50 = fifty.', 'Como se escreve 15?'),
  q('6-numbers', 'It is 7:30. It is...', ['half past seven', 'seven fifteen', 'half past eight', 'a quarter to seven'], '7:30 = seven thirty ou half past seven.'),
  q('6-numbers', 'Which month comes after March?', ['April', 'May', 'February', 'June'], 'January, February, March, April...', 'Qual mês vem depois de março?'),
  q('6-numbers', 'What is 20 + 20?', ['forty', 'fourteen', 'twenty-four', 'fourty'], '40 = forty (sem a letra "u").'),
  q('6-numbers', 'My birthday is ___ May 10th.', ['on', 'in', 'at', 'to'], 'Com datas específicas usamos "on": on May 10th.'),
  q('6-numbers', 'Which day comes before Friday?', ['Thursday', 'Saturday', 'Tuesday', 'Sunday'], 'Monday, Tuesday, Wednesday, Thursday, Friday...', 'Qual dia vem antes de sexta-feira?'),

  // ───────────── 7º ANO ─────────────
  q('7-present', 'She ___ to school by bus every day.', ['goes', 'go', 'going', 'is go'], 'Com he/she/it acrescentamos -s ou -es: she goes.'),
  q('7-present', 'I ___ like spicy food.', ["don't", "doesn't", "isn't", "not"], 'Com "I" a negação é "don\'t".'),
  q('7-present', '___ he play video games after school?', ['Does', 'Do', 'Is', 'Are'], 'Pergunta com he/she/it começa com "Does".'),
  q('7-present', 'My brother ___ his homework at night.', ['does', 'do', 'dos', 'doing'], 'Do + es = does (he/she/it).'),
  q('7-present', 'Which word shows frequency?', ['always', 'yesterday', 'tomorrow', 'now'], 'Always, usually, sometimes e never indicam frequência.', 'Qual palavra indica frequência?'),
  q('7-present', 'They ___ soccer on Saturdays.', ['play', 'plays', 'playing', 'is play'], 'Com they não há -s: they play.'),

  q('7-continuous', 'Look! It ___.', ['is raining', 'rains', 'rain', 'raining'], 'Ação acontecendo agora: is + verbo com -ing.'),
  q('7-continuous', 'We ___ English right now.', ['are studying', 'study', 'is studying', 'studying'], 'Right now pede o presente contínuo: we are studying.'),
  q('7-continuous', 'What ___ you doing?', ['are', 'is', 'do', 'does'], 'What are you doing? = O que você está fazendo?'),
  q('7-continuous', 'Choose the correct -ing form of "swim".', ['swimming', 'swiming', 'swimeing', 'swimmming'], 'Verbo curto terminado em consoante-vogal-consoante dobra a última letra: swimming.'),
  q('7-continuous', 'He ___ watching TV. He is sleeping.', ["isn't", "doesn't", "aren't", "don't"], 'Negativa do presente contínuo: is not (isn\'t) + -ing.'),
  q('7-continuous', 'Choose the correct -ing form of "dance".', ['dancing', 'danceing', 'dansing', 'dancinng'], 'Verbo terminado em "e" perde o "e": dance → dancing.'),

  q('7-food', 'How ___ water do you drink a day?', ['much', 'many', 'lot', 'few'], 'Água é incontável, então usamos "how much".'),
  q('7-food', 'How ___ apples are there?', ['many', 'much', 'lot', 'little'], 'Apples é contável (plural), então "how many".'),
  q('7-food', 'There ___ some milk in the fridge.', ['is', 'are', 'am', 'be'], 'Milk é incontável e fica no singular: there is.'),
  q('7-food', 'I would like ___ orange, please.', ['an', 'a', 'some', 'many'], 'Antes de som de vogal usamos "an": an orange.'),
  q('7-food', '"Feijão" in English is...', ['beans', 'rice', 'bread', 'butter'], 'Beans = feijão. Rice = arroz.'),
  q('7-food', 'Are there ___ eggs? No, there aren\'t ___.', ['any / any', 'some / some', 'much / much', 'a / a'], 'Em perguntas e negativas usamos "any".'),

  q('7-cognates', '"Pretend" means...', ['fingir', 'pretender', 'prender', 'pretérito'], 'Falso cognato! Pretend = fingir. Pretender = intend.'),
  q('7-cognates', '"Library" means...', ['biblioteca', 'livraria', 'liberdade', 'livro'], 'Library = biblioteca. Livraria = bookstore.'),
  q('7-cognates', '"Parents" means...', ['pais (pai e mãe)', 'parentes', 'parceiros', 'parques'], 'Parents = pai e mãe. Parentes = relatives.'),
  q('7-cognates', 'Which word is a TRUE cognate?', ['hospital', 'push', 'college', 'exquisite'], 'Hospital tem o mesmo sentido nas duas línguas. Push = empurrar!', 'Qual palavra é um cognato verdadeiro?'),
  q('7-cognates', '"Actually" means...', ['na verdade', 'atualmente', 'ativamente', 'aceitável'], 'Actually = na verdade. Atualmente = nowadays.'),
  q('7-cognates', '"Push" on a door means...', ['empurre', 'puxe', 'pule', 'pare'], 'Push = empurrar. Pull = puxar.'),

  // ───────────── 8º ANO ─────────────
  q('8-comparatives', 'Mateus is 14. Carlos is 13. Mateus is ___ Carlos.', ['older than', 'younger than', 'as old as', 'old than'], '14 é mais que 13, então Mateus é mais velho: older than.'),
  q('8-comparatives', 'Gabriel is 11. Juliana is 12. Gabriel is ___ Juliana.', ['younger than', 'older than', 'as young as', 'youngest'], '11 é menos que 12: younger than.'),
  q('8-comparatives', 'Juliana is 12. Rafael is 12. Juliana is ___ Rafael.', ['as old as', 'older than', 'younger than', 'more old than'], 'Mesma idade = igualdade: as old as.'),
  q('8-comparatives', 'An elephant is ___ a dog.', ['bigger than', 'more big than', 'biger than', 'big than'], 'Adjetivo curto terminado em consoante-vogal-consoante dobra a letra: big → bigger.'),
  q('8-comparatives', 'This book is ___ than that one.', ['more interesting', 'interestinger', 'most interesting', 'as interesting'], 'Adjetivos longos usam "more": more interesting.'),
  q('8-comparatives', 'My grades are ___ than last year.', ['better', 'gooder', 'more good', 'best'], 'Good é irregular: good → better → the best.'),
  q('8-comparatives', 'Today is ___ than yesterday.', ['hotter', 'more hot', 'hoter', 'hottest'], 'Hot → hotter (dobra o t).'),

  q('8-superlatives', 'Mount Everest is ___ mountain in the world.', ['the highest', 'the higher', 'the most high', 'higher than'], 'Superlativo de adjetivo curto: the + -est.'),
  q('8-superlatives', 'She is ___ student in the class.', ['the most intelligent', 'the intelligentest', 'more intelligent', 'the more intelligent'], 'Adjetivos longos: the most + adjetivo.'),
  q('8-superlatives', 'This is ___ day of my life!', ['the best', 'the better', 'the goodest', 'the most good'], 'Good → better → the best.'),
  q('8-superlatives', 'Mateus and Beatriz are 14. They are ___ students in the group.', ['the oldest', 'the older', 'the most old', 'older'], 'Ninguém tem mais de 14 na tabela, então são os mais velhos: the oldest.'),
  q('8-superlatives', 'Choose the superlative of "happy".', ['the happiest', 'the happyest', 'the most happy', 'the happier'], 'Adjetivo terminado em -y troca o y por i: happiest.'),
  q('8-superlatives', 'That was ___ test of the year.', ['the worst', 'the baddest', 'the most bad', 'the worse'], 'Bad é irregular: bad → worse → the worst.'),

  q('8-past', 'Yesterday I ___ my grandmother.', ['visited', 'visit', 'visits', 'visiting'], 'Verbo regular no passado: + -ed.'),
  q('8-past', 'We ___ to the beach last Sunday.', ['went', 'goed', 'go', 'gone'], 'Go é irregular: go → went.'),
  q('8-past', '___ you watch the game last night?', ['Did', 'Do', 'Were', 'Does'], 'Pergunta no passado simples começa com "Did".'),
  q('8-past', 'She didn\'t ___ her homework.', ['do', 'did', 'does', 'done'], 'Depois de "didn\'t" o verbo volta à forma básica.'),
  q('8-past', 'What is the past of "buy"?', ['bought', 'buyed', 'brought', 'buied'], 'Buy → bought. Cuidado: brought é o passado de bring.', 'Qual é o passado de "buy"?'),
  q('8-past', 'I ___ at home last night. I was sick.', ['was', 'were', 'am', 'did'], 'Passado do to be: I/he/she/it was; we/you/they were.'),

  q('8-future', 'Look at those clouds! It ___ rain.', ['is going to', 'will to', 'goes', 'going'], 'Previsão com evidência (as nuvens): be going to.'),
  q('8-future', 'I think Brazil ___ win the World Cup.', ['will', 'is going', 'wills', 'are going'], 'Opinião ou previsão sem evidência: will.'),
  q('8-future', 'The phone is ringing. I ___ answer it!', ["'ll", "'m going", "going to", "am"], 'Decisão tomada na hora: will (\'ll).'),
  q('8-future', 'We ___ travel next July. We bought the tickets.', ['are going to', 'will to', 'going', 'goes to'], 'Plano já decidido: be going to.'),
  q('8-future', 'Choose the negative of "She will come."', ["She won't come.", "She willn't come.", "She don't will come.", "She will no come."], 'Will not = won\'t.'),
  q('8-future', '___ you help me tomorrow?', ['Will', 'Do', 'Are', 'Did'], 'Pergunta com will: Will + sujeito + verbo.'),

  // ───────────── 9º ANO ─────────────
  q('9-perfect', 'I ___ never ___ to Disney.', ['have / been', 'has / been', 'have / went', 'did / go'], 'Present perfect: have/has + particípio (been).'),
  q('9-perfect', 'She ___ already finished her project.', ['has', 'have', 'is', 'did'], 'He/she/it usa "has".'),
  q('9-perfect', 'Have you ___ this movie?', ['seen', 'saw', 'see', 'seeing'], 'Particípio de see é seen.'),
  q('9-perfect', 'We have lived here ___ 2015.', ['since', 'for', 'ago', 'during'], 'Since + ponto no tempo; for + período (for 10 years).'),
  q('9-perfect', 'They have studied English ___ three years.', ['for', 'since', 'ago', 'in'], 'For + duração: for three years.'),
  q('9-perfect', 'Has he eaten lunch ___?', ['yet', 'already', 'ever since', 'ago'], 'Em perguntas e negativas usamos "yet" no final.'),

  q('9-modals', 'You ___ wear a seatbelt. It\'s the law.', ['must', 'might', 'could', 'may'], 'Obrigação forte: must.'),
  q('9-modals', 'You ___ eat so much sugar. It\'s bad for you.', ["shouldn't", "mustn't to", "can", "would"], 'Conselho: should / shouldn\'t.'),
  q('9-modals', '___ I go to the bathroom, please?', ['May', 'Must', 'Should', 'Will'], 'Pedido educado de permissão: May I...?'),
  q('9-modals', 'She ___ speak three languages. She is amazing!', ['can', 'must', 'should', 'may'], 'Habilidade: can.'),
  q('9-modals', 'You ___ use your phone during the test. It is forbidden.', ["mustn't", "don't have to", "should", "might"], 'Proibição: mustn\'t.'),
  q('9-modals', 'Tomorrow is Saturday. I ___ wake up early.', ["don't have to", "mustn't", "can't", "shouldn't to"], 'Ausência de obrigação: don\'t have to.'),

  q('9-conditional', 'If it rains, we ___ at home.', ['will stay', 'stayed', 'would stayed', 'stays'], 'First conditional: If + presente, will + verbo.'),
  q('9-conditional', 'If you study, you ___ the test.', ['will pass', 'passed', 'passing', 'would passed'], 'Resultado provável no futuro: will pass.'),
  q('9-conditional', 'If she ___ late, she will miss the bus.', ['is', 'will be', 'was', 'be'], 'Depois de "if" usamos o presente, não "will".'),
  q('9-conditional', 'I will call you if I ___ time.', ['have', 'will have', 'had', 'has'], 'A parte com "if" fica no presente: if I have.'),
  q('9-conditional', 'If you heat ice, it ___.', ['melts', 'will melted', 'melted', 'melting'], 'Fato científico (zero conditional): presente + presente.'),
  q('9-conditional', 'Choose the correct sentence.', ['If we hurry, we will catch the train.', 'If we will hurry, we catch the train.', 'If we hurried, we will catch the train.', 'If we hurry, we caught the train.'], 'If + presente, will + verbo.', 'Escolha a frase correta.'),

  q('9-digital', '"Baixar um arquivo" in English is...', ['download a file', 'upload a file', 'delete a file', 'share a file'], 'Download = baixar. Upload = enviar.'),
  q('9-digital', 'A person who posts mean comments online is a...', ['cyberbully', 'follower', 'influencer', 'developer'], 'Cyberbullying é crime. Denuncie e procure ajuda!', 'Quem posta comentários maldosos na internet é um...'),
  q('9-digital', 'Which one is the SAFEST password?', ['M3u#Gat0!2026', '123456', 'password', 'myname'], 'Senhas fortes misturam letras, números e símbolos.', 'Qual é a senha mais segura?'),
  q('9-digital', '"Fake news" is information that is...', ['false', 'very new', 'funny', 'official'], 'Fake = falso. Sempre confira a fonte antes de compartilhar.'),
  q('9-digital', '"Screen time" means...', ['tempo de tela', 'hora do lanche', 'tela quebrada', 'tempo de prova'], 'Screen time é o tempo que passamos diante de celulares e computadores.'),
  q('9-digital', 'Read: "Think before you post. The internet never forgets." The main idea is...', ['Be careful with what you share online.', 'Post everything quickly.', 'The internet is always forgotten.', 'Never use the internet.'], 'O texto aconselha pensar antes de postar, porque o conteúdo fica para sempre.'),

  // ───────────── ENSINO MÉDIO ─────────────
  q('EM-passive', 'The Mona Lisa ___ by Leonardo da Vinci.', ['was painted', 'painted', 'is painting', 'has paint'], 'Voz passiva no passado: was/were + particípio.'),
  q('EM-passive', 'English ___ all over the world.', ['is spoken', 'speaks', 'is speaking', 'spoke'], 'Voz passiva no presente: is + particípio.'),
  q('EM-passive', 'Passive of "They built the school in 1990."', ['The school was built in 1990.', 'The school built in 1990.', 'The school is build in 1990.', 'The school has built in 1990.'], 'O objeto vira sujeito e o verbo vai para was + built.'),
  q('EM-passive', 'The results ___ tomorrow.', ['will be announced', 'will announce', 'are announce', 'will announced'], 'Passiva no futuro: will be + particípio.'),
  q('EM-passive', 'My phone ___. I can\'t find it anywhere!', ['has been stolen', 'has stolen', 'stole', 'is stealing'], 'Present perfect passivo: has been + particípio.'),
  q('EM-passive', 'Choose the sentence in the passive voice.', ['The homework was corrected by the teacher.', 'The teacher corrected the homework.', 'The teacher is correcting the homework.', 'The teacher corrects homework.'], 'Na passiva o foco está em quem sofre a ação, com "by" para o agente.', 'Escolha a frase na voz passiva.'),

  q('EM-conditionals', 'If I ___ rich, I would travel the world.', ['were', 'am', 'will be', 'have been'], 'Second conditional (hipótese): If + past, would + verbo. Com to be, usa-se "were".'),
  q('EM-conditionals', 'If she had studied, she ___ the exam.', ['would have passed', 'would pass', 'will pass', 'passed'], 'Third conditional: If + past perfect, would have + particípio.'),
  q('EM-conditionals', 'What would you do if you ___ a million reais?', ['won', 'win', 'will win', 'had won'], 'Hipótese no presente: past simple depois de if.'),
  q('EM-conditionals', 'If we ___ earlier, we wouldn\'t have missed the bus.', ['had left', 'left', 'would leave', 'leave'], 'Third conditional: had + particípio.'),
  q('EM-conditionals', '"If I were you, I would apologize." This sentence gives...', ['advice', 'an order', 'a past fact', 'a promise'], '"If I were you" é a forma clássica de dar conselho.'),
  q('EM-conditionals', 'Which sentence talks about an imaginary PAST situation?', ['If I had known, I would have helped.', 'If I know, I will help.', 'If I knew, I would help.', 'If I know, I help.'], 'Third conditional fala de algo que não aconteceu no passado.', 'Qual frase fala de uma situação imaginária no passado?'),

  q('EM-reported', '"I am tired," she said. → She said that she ___ tired.', ['was', 'is', 'were', 'has'], 'No discurso indireto o tempo recua: am → was.'),
  q('EM-reported', '"I will call you," he said. → He said he ___ call me.', ['would', 'will', 'can', 'shall'], 'Will → would.'),
  q('EM-reported', '"We live in Caxias." → They said they ___ in Caxias.', ['lived', 'live', 'living', 'have live'], 'Present simple → past simple.'),
  q('EM-reported', '"Where do you study?" → She asked me where I ___.', ['studied', 'did study', 'do study', 'study did'], 'Pergunta indireta não inverte e o tempo recua.'),
  q('EM-reported', '"Don\'t run!" → The teacher told us ___.', ['not to run', 'to not running', "don't run", 'no run'], 'Ordem negativa: told + pessoa + not to + verbo.'),
  q('EM-reported', '"I can swim." → He said he ___ swim.', ['could', 'can', 'would can', 'is able'], 'Can → could.'),

  q('EM-enem', 'Read: "Fast fashion produces cheap clothes quickly, but it creates tons of waste." The text criticizes...', ['the environmental impact of fast fashion', 'the high price of clothes', 'slow factories', 'second-hand stores'], 'O "but" introduz a crítica: muito lixo (waste).'),
  q('EM-enem', 'In "Despite the rain, the concert continued," "despite" expresses...', ['contrast', 'cause', 'time', 'addition'], 'Despite = apesar de, uma ideia de contraste.'),
  q('EM-enem', 'Sign: "Keep off the grass." It means...', ['Não pise na grama.', 'Mantenha a grama verde.', 'Corte a grama.', 'Sente na grama.'], 'Keep off = manter-se afastado.'),
  q('EM-enem', 'In "She works hard; however, she earns little," "however" could be replaced by...', ['nevertheless', 'therefore', 'because', 'moreover'], 'However e nevertheless indicam contraste.'),
  q('EM-enem', 'Read: "Less than half of the students had internet access at home." This means...', ['most students did not have internet at home', 'all students had internet', 'half had two connections', 'students preferred the library'], 'Less than half = menos da metade, então a maioria não tinha acesso.'),
  q('EM-enem', 'A tweet says: "Can\'t believe I aced the test! 🎉" The person feels...', ['happy and surprised', 'angry', 'bored', 'worried'], 'To ace a test = gabaritar, ir muito bem na prova.'),
];

// ─── Questões cadastradas pelo professor (ficam salvas neste navegador) ───
const CUSTOM_KEY = 'nisialand_custom_questions_v1';

export function getCustomQuestions(): BankQuestion[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    const list = raw ? (JSON.parse(raw) as BankQuestion[]) : [];
    return Array.isArray(list) ? list.filter(isValidQuestion).map((x) => ({ ...x, custom: true })) : [];
  } catch {
    return [];
  }
}

export function saveCustomQuestions(list: BankQuestion[]): void {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
  } catch {
    // armazenamento indisponível (modo privado); ignora
  }
}

export function isValidQuestion(x: unknown): x is BankQuestion {
  const v = x as BankQuestion;
  return (
    !!v &&
    typeof v.id === 'string' &&
    GRADES.some((g) => g.id === v.grade) &&
    TOPICS.some((t) => t.id === v.topic) &&
    typeof v.prompt === 'string' &&
    v.prompt.trim().length > 0 &&
    Array.isArray(v.options) &&
    v.options.length >= 2 &&
    v.options.every((o) => typeof o === 'string' && o.trim().length > 0)
  );
}

export function getAllQuestions(): BankQuestion[] {
  return [...BUILT_IN_QUESTIONS, ...getCustomQuestions()];
}

export function topicsForGrade(grade: GradeId): TopicInfo[] {
  return TOPICS.filter((t) => t.grade === grade);
}

export function countByTopic(topicId: string): number {
  return getAllQuestions().filter((x) => x.topic === topicId).length;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface RoundQuestion extends BankQuestion {
  shuffled: string[];
  correctIndex: number;
}

// Sorteia até `count` questões dos tópicos escolhidos, alternando entre eles,
// e embaralha as alternativas de cada uma.
export function buildRound(topicIds: string[], count = 10): RoundQuestion[] {
  const all = getAllQuestions();
  const pools = topicIds.map((t) => shuffle(all.filter((x) => x.topic === t)));
  const picked: BankQuestion[] = [];
  let i = 0;
  while (picked.length < count && pools.some((p) => p.length > 0)) {
    const pool = pools[i % pools.length];
    const next = pool.shift();
    if (next) picked.push(next);
    i += 1;
  }
  return picked.map((item) => {
    const shuffled = shuffle(item.options);
    return { ...item, shuffled, correctIndex: shuffled.indexOf(item.options[0]) };
  });
}

// ─── Recordes por série + tópicos ───
const BEST_KEY = 'nisialand_arcade_best_v1';

export function getBestScore(key: string): number {
  try {
    const all = JSON.parse(localStorage.getItem(BEST_KEY) || '{}') as Record<string, number>;
    return all[key] || 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(key: string, score: number): boolean {
  try {
    const all = JSON.parse(localStorage.getItem(BEST_KEY) || '{}') as Record<string, number>;
    if (score > (all[key] || 0)) {
      all[key] = score;
      localStorage.setItem(BEST_KEY, JSON.stringify(all));
      return true;
    }
  } catch {
    // ignora
  }
  return false;
}
