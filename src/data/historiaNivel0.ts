// História de abertura do Nível 0 (rota /historia): quadrinhos e perguntas (PROVISÓRIO).
// Fica fora da tela para o script das vozes gravar as falas (scripts/vozes/exportar-falas.ts).
import type { NomeVoz } from '../services/narracao';

export interface ComicPanel {
  voz: NomeVoz; // voz gravada de quem fala
  id: number;
  speaker: string;
  speakerRole: string;
  speakerBadgeColor: string;
  avatarImg: string;
  bgImg: string;
  speechEn: string;
  speechPt: string;
  reaction: string;
  instruction: string;
}

export const COMIC_PANELS: ComicPanel[] = [
  {
    id: 1,
    speaker: "Estudante",
    speakerRole: "Aluno Explorador",
    speakerBadgeColor: "from-nisia-azul-500 to-nisia-azul-500",
    avatarImg: "/assets/student_boy_hoodie.png",
    voz: 'colegaM',
    bgImg: "/assets/nisialand_school_facade_clean.jpg",
    speechEn: "Look at this school! It looks like a normal day at Nísia Vilela, but something feels magical here...",
    speechPt: "Olhe esta escola! Parece um dia comum na Nísia Vilela, mas tem algo mágico acontecendo por aqui...",
    reaction: "📱 O estudante está filmando o pátio com seu celular!",
    instruction: "Observe o início do dia escolar na fachada da escola."
  },
  {
    id: 2,
    speaker: "Estudante",
    speakerRole: "Aluna Exploradora",
    speakerBadgeColor: "from-pink-600 to-nisia-erro",
    avatarImg: "/assets/student_girl_ponytail.png",
    voz: 'colega',
    bgImg: "/assets/nisialand_school_facade_clean.jpg",
    speechEn: "Good morning! Hurry up, the bell is ringing! Today we have English class!",
    speechPt: "Bom dia! Corre, o sinal está tocando! Hoje tem aula de inglês!",
    reaction: "🔔 A colega chega correndo e chama o amigo para entrar.",
    instruction: "Ouça como se diz 'bom dia' e 'aula de inglês'."
  },
  {
    id: 3,
    speaker: "Estudante",
    speakerRole: "Aluna Exploradora",
    speakerBadgeColor: "from-nisia-roxo-500 to-nisia-roxo-500",
    avatarImg: "/assets/student_girl_curly.png",
    voz: 'colega',
    bgImg: "/assets/nisialand_hallway_bg.jpg",
    speechEn: "Hi, friends! Wait for me! Please, put your phone in your bag before the principal sees it!",
    speechPt: "Oi, amigos! Me esperem! Por favor, guarde o celular na mochila antes que o diretor veja!",
    reaction: "🎒 Outra colega alcança o grupo no corredor e dá um conselho.",
    instruction: "Repare nas palavras 'please', 'phone' e 'bag'."
  },
  {
    id: 4,
    speaker: "Diretor Márcio",
    speakerRole: "Principal / Direção",
    speakerBadgeColor: "from-nisia-sol-500 to-nisia-sol-700",
    avatarImg: "/assets/diretor_marcio.png",
    voz: 'marcio',
    bgImg: "/assets/nisialand_hallway_bg.jpg",
    speechEn: "Attention, students! In this school, we learn and play together. No cell phones in the hallway! Let's go to class!",
    speechPt: "Atenção, estudantes! Nesta escola, aprendemos e nos divertimos juntos. Nada de celular no corredor! Vamos para a sala!",
    reaction: "📢 O Diretor Márcio avisa a regra da escola com firmeza e carinho!",
    instruction: "Ouça com atenção a regra escolar em inglês."
  },
  {
    id: 5,
    speaker: "A Turma",
    speakerRole: "Todos Juntos",
    speakerBadgeColor: "from-nisia-verde-500 to-nisia-verde-500",
    avatarImg: "/assets/nisialand_inclusive_students.png",
    voz: 'colega',
    bgImg: "/assets/nisialand_hallway_bg.jpg",
    speechEn: "Yes, Mr. Márcio! We are all different, and we learn together!",
    speechPt: "Sim, Diretor Márcio! Somos todos diferentes, e aprendemos juntos!",
    reaction: "🤝 A turma inteira responde junta ao diretor.",
    instruction: "'Together' quer dizer 'juntos'. Guarde essa palavra!"
  },
  {
    id: 6,
    speaker: "Estudante",
    speakerRole: "Aluno Explorador",
    speakerBadgeColor: "from-nisia-azul-500 to-nisia-azul-500",
    avatarImg: "/assets/student_boy_tshirt.png",
    voz: 'colegaM',
    bgImg: "/assets/nisialand_hallway_bg.jpg",
    speechEn: "Oops! Mr. Márcio caught me! I need to put this phone away and get to class right now! Run!",
    speechPt: "Ops! O Diretor Márcio me viu! Preciso guardar esse celular e ir voando para a sala! Correee!",
    reaction: "🏃💨 O estudante guarda o celular e dispara pelo corredor em direção à aula!",
    instruction: "Prepare-se para o mini-desafio no corredor da escola!"
  }
];

export interface Level0Question {
  id: number;
  promptEn: string;
  promptPt: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
}

export const LEVEL0_QUESTIONS: Level0Question[] = [
  {
    id: 1,
    promptEn: "What did Principal Márcio say about cell phones in the hallway?",
    promptPt: "O que o Diretor Márcio falou sobre celulares no corredor?",
    options: [
      { text: "No cell phones in the hallway!", isCorrect: true },
      { text: "Take more selfies now!", isCorrect: false },
      { text: "Play music out loud!", isCorrect: false },
      { text: "Leave your phone on the floor", isCorrect: false }
    ],
    explanation: "Principal Márcio clearly said: 'No cell phones in the hallway! Let's go to class!'"
  },
  {
    id: 2,
    promptEn: "How do we say 'prestar atenção' or 'vamos para a aula' in English?",
    promptPt: "Como se diz 'atenção' e 'vamos para a sala'?",
    options: [
      { text: "Attention! Let's go to class!", isCorrect: true },
      { text: "Good night! Let's sleep!", isCorrect: false },
      { text: "Run outside the school!", isCorrect: false },
      { text: "Never listen to teachers", isCorrect: false }
    ],
    explanation: "'Attention' significa atenção, e 'Let's go to class' é o convite para irmos à aula!"
  },
  {
    id: 3,
    promptEn: "Complete the school rule: In Nisialand, we learn and play ______!",
    promptPt: "Complete o lema da escola: No Nisialand, aprendemos e brincamos ______!",
    options: [
      { text: "together (juntos)", isCorrect: true },
      { text: "alone (sozinhos)", isCorrect: false },
      { text: "angrily (com raiva)", isCorrect: false },
      { text: "in silence forever", isCorrect: false }
    ],
    explanation: "'Together' significa 'juntos'! O trabalho em equipe e o respeito mútuo são fundamentais no Nisialand."
  }
];
