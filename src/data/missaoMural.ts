// CAMADA 2.0 — Missão viva do Nível 3: "O mistério do mural rasgado" (PROVISÓRIO: textos para revisão do professor).
// O cartaz "Class rules" amanheceu rasgado. A Professora Rosana pede ajuda para descobrir o que aconteceu
// — não para castigar, mas para consertar. O aluno investiga a sala, conversa em inglês com educação,
// monta a linha do tempo, conclui com provas e, no fim, a turma reconstrói o mural.
// Três versões do caso (sorteadas): quem joga de novo encontra outra história.

export type Suspeito = 'ze' | 'mane' | 'bia';
export type Caso = 'ze' | 'mane' | 'vento';

export const PESSOAS: Record<Suspeito, { nome: string; img: string; voz: 'ze' | 'mane' | 'colega' }> = {
  ze: { nome: 'Zé Cartinha', img: '/assets/ze_cartinha.png', voz: 'ze' },
  mane: { nome: 'Mané Zoeira', img: '/assets/mane_zoeira.png', voz: 'mane' },
  bia: { nome: 'Bia', img: '/assets/student_girl_curly.png', voz: 'colega' },
};

/** Pistas espalhadas na sala (posição em % da cena 16:9). `chave` diz em quais casos a pista aponta a verdade. */
export interface Pista { id: string; icone: string; nome: string; x: number; y: number; en: string; pt: string; chave: Caso[] }
export const PISTAS: Pista[] = [
  { id: 'carta', icone: '🃏', nome: 'Carta no chão', x: 84, y: 80, en: 'A card: "BAFO CHAMPION — Zé". It is under the mural.', pt: 'Uma carta do Zé, embaixo do mural.', chave: ['ze'] },
  { id: 'fita', icone: '🧻', nome: 'Rolo de fita', x: 38, y: 53, en: 'A roll of tape with a label: "M.Z.". It is almost empty.', pt: 'Um rolo de fita com "M.Z.", quase vazio.', chave: ['mane'] },
  { id: 'bilhete', icone: '📝', nome: 'Bilhete na carteira', x: 56, y: 82, en: 'A note: "I\'m sorry. I tried to fix it."', pt: 'Um bilhete: "Desculpa. Eu tentei consertar."', chave: ['mane'] },
  { id: 'janela', icone: '🪟', nome: 'Janela', x: 14, y: 40, en: 'The window was open all night. There is water on the floor.', pt: 'A janela ficou aberta a noite toda. Tem água no chão.', chave: ['vento'] },
  { id: 'horario', icone: '🧹', nome: 'Aviso na porta', x: 76, y: 47, en: 'Cleaning team: "Classroom cleaned at 6:45 a.m. Mural OK."', pt: 'Equipe de limpeza: "Sala limpa às 6h45. Mural inteiro."', chave: ['ze', 'mane'] },
  { id: 'agenda', icone: '📒', nome: 'Agenda da professora', x: 50, y: 38, en: 'Ms. Rosana\'s note: "Weather: strong wind tonight. Close the windows!"', pt: 'Anotação da professora: "Vento forte à noite. Fechar as janelas!"', chave: ['vento'] },
];

/** Perguntas que o aluno pode fazer (em inglês). As educadas abrem a conversa; a acusação fecha. */
export interface Pergunta { id: string; en: string; pt: string; educada: boolean }
export const PERGUNTAS: Pergunta[] = [
  { id: 'onde', en: 'Excuse me, where were you before class?', pt: 'Com licença, onde você estava antes da aula?', educada: true },
  { id: 'viu', en: 'Could you tell me what you saw, please?', pt: 'Você pode me contar o que viu, por favor?', educada: true },
  { id: 'acusa', en: 'You tore the mural, didn\'t you?!', pt: 'Foi você que rasgou o mural, né?!', educada: false },
];

export const RECUSA: Record<Suspeito, string> = {
  ze: 'Hey! That\'s not nice. I won\'t talk to you like that.',
  mane: 'Whoa, calm down! Ask me nicely, please.',
  bia: 'That\'s rude. I don\'t want to talk now.',
};

/** Respostas de cada pessoa em cada caso (onde / viu). */
export const RESPOSTAS: Record<Caso, Record<Suspeito, { onde: string; viu: string }>> = {
  ze: {
    ze: { onde: 'I was in the classroom early. I was playing cards.', viu: 'Well... my card hit the mural. Then I heard a "rrrip". I\'m sorry!' },
    mane: { onde: 'I was at the gate with my mom.', viu: 'I saw Zé with his cards near the mural.' },
    bia: { onde: 'I was in the library.', viu: 'When I arrived, Zé was looking at the mural. He looked worried.' },
  },
  mane: {
    ze: { onde: 'I was in the cafeteria, eating a sandwich.', viu: 'I didn\'t see anything. I promise!' },
    mane: { onde: 'I came early to help Ms. Rosana.', viu: 'One corner was loose. I used tape... and it tore. I was scared to tell.' },
    bia: { onde: 'I was in the hallway.', viu: 'Mané was holding a roll of tape. He looked sad.' },
  },
  vento: {
    ze: { onde: 'I was on the bus. I arrived late.', viu: 'The window was open. The floor was wet.' },
    mane: { onde: 'I was at the gate with my mom.', viu: 'Papers were on the floor, under the window.' },
    bia: { onde: 'I arrived first, with the cleaning team.', viu: 'It was very windy last night. The mural was on the floor.' },
  },
};

/** Linha do tempo de cada caso (ordem certa). */
export const LINHA: Record<Caso, string[]> = {
  ze: ['Ms. Rosana checked the mural at 5 p.m.', 'The classroom was cleaned at 6:45 a.m.', 'Zé played cards near the mural.', 'A card hit the mural and it tore.'],
  mane: ['Ms. Rosana checked the mural at 5 p.m.', 'The classroom was cleaned at 6:45 a.m.', 'Mané saw a loose corner.', 'He used tape and the mural tore.'],
  vento: ['Ms. Rosana checked the mural at 5 p.m.', 'Someone forgot to close the window.', 'A strong wind blew at night.', 'The mural fell and tore.'],
};

export const CONCLUSOES: Array<{ caso: Caso; en: string; pt: string }> = [
  { caso: 'ze', en: 'Zé\'s card hit the mural by accident.', pt: 'A carta do Zé bateu no mural sem querer.' },
  { caso: 'mane', en: 'Mané tried to fix it with tape and it tore.', pt: 'O Mané tentou consertar com fita e rasgou.' },
  { caso: 'vento', en: 'The wind blew it down. The window was open.', pt: 'O vento derrubou. A janela estava aberta.' },
];

/** O que acontece depois (convivência: reparar, não castigar). */
export const DESFECHO: Record<Caso, { quem: Suspeito | 'rosana'; en: string; pt: string }> = {
  ze: { quem: 'ze', en: 'I\'m sorry. Can I help you fix it?', pt: 'Desculpa. Posso ajudar a consertar?' },
  mane: { quem: 'mane', en: 'Thank you for listening. Next time I will ask for help.', pt: 'Obrigado por ouvir. Da próxima vez eu peço ajuda.' },
  vento: { quem: 'rosana', en: 'Nobody is guilty. Let\'s close the windows and fix it together.', pt: 'Ninguém tem culpa. Vamos fechar as janelas e consertar juntos.' },
};

/** Regras do mural, em duas metades (a turma reconstrói o cartaz). */
export const REGRAS_MURAL: Array<[string, string]> = [
  ['Raise your hand', 'before you speak.'],
  ['Listen carefully', 'when others talk.'],
  ['Take care of', 'our classroom.'],
  ['Ask for help', 'when you need it.'],
];

/** Falas da Professora Rosana (narração da missão). */
export const FALAS_ROSANA = {
  abertura: { pt: 'Bom dia! O nosso mural de regras amanheceu rasgado. Não quero culpados: quero entender o que aconteceu para consertar. Você me ajuda a investigar?', en: 'Let\'s find out what happened!' },
  pistas: { pt: 'Olhe a sala com atenção. Toque nos objetos que parecem pistas.', en: 'Look for clues.' },
  conversa: { pt: 'Agora converse com os colegas. Pergunte em inglês e com educação.', en: 'Ask politely.' },
  linha: { pt: 'Coloque os fatos na ordem em que aconteceram.', en: 'Put the events in order.' },
  conclusao: { pt: 'E então, detetive? O que aconteceu com o mural?', en: 'What happened?' },
  semProva: { pt: 'Cuidado: acusar sem prova machuca. Olhe as pistas de novo.', en: 'We need evidence.' },
  mural: { pt: 'Vamos reconstruir o mural juntos! Junte as metades de cada regra.', en: 'Let\'s fix the mural together!' },
  fim: { pt: 'Mistério resolvido! Investigar com calma e falar com educação também é convivência.', en: 'Mystery solved! Great job, detective!' },
};

/** Tudo o que a missão fala com voz gravada (o script das vozes lê esta lista). */
export function falasDaMissaoMural(): Array<{ personagem: 'ze' | 'mane' | 'colega' | 'rosana'; idioma: 'pt-BR' | 'en-US'; texto: string }> {
  const out: Array<{ personagem: 'ze' | 'mane' | 'colega' | 'rosana'; idioma: 'pt-BR' | 'en-US'; texto: string }> = [];
  for (const f of Object.values(FALAS_ROSANA)) { out.push({ personagem: 'rosana', idioma: 'pt-BR', texto: f.pt }); out.push({ personagem: 'rosana', idioma: 'en-US', texto: f.en }); }
  for (const p of Object.keys(PESSOAS) as Suspeito[]) {
    const voz = PESSOAS[p].voz;
    out.push({ personagem: voz, idioma: 'en-US', texto: RECUSA[p] });
    for (const c of Object.keys(RESPOSTAS) as Caso[]) { out.push({ personagem: voz, idioma: 'en-US', texto: RESPOSTAS[c][p].onde }); out.push({ personagem: voz, idioma: 'en-US', texto: RESPOSTAS[c][p].viu }); }
  }
  for (const c of Object.keys(DESFECHO) as Caso[]) { const d = DESFECHO[c]; out.push({ personagem: d.quem === 'rosana' ? 'rosana' : PESSOAS[d.quem].voz, idioma: 'en-US', texto: d.en }); }
  return out;
}
