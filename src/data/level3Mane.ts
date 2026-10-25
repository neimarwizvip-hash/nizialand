// PROVISÓRIO – roteiro final do Oliveira.
// Falas do Mané Zoeira no Nível 3: colega brincalhão, do lado do aluno (o vilão é só o Zé).
// Nunca entrega a resposta. Trocar estes textos pelo roteiro final sem mexer nos componentes.

export interface ManeLine { pt: string; en: string }

/** Corredor: uma fala por porta (mesma ordem de LEVEL3_ROOM_ORDER). */
export const MANE_CORRIDOR_LINES: ManeLine[] = [
  { pt: 'Ô, a sala tá uma bagunça! Bora arrumar antes do Zé chegar?', en: "Let's go!" },
  { pt: 'A lousa tá cheia de mistério... você decifra, eu bato palma!', en: 'You can do it!' },
  { pt: 'Quem é quem nessa sala? Até eu me confundo, hehe!', en: 'Who is who?' },
  { pt: 'Memória de elefante, hein? Vamos ver!', en: 'Remember!' },
  { pt: 'Labirinto! Se perder, eu finjo que não vi.', en: 'This way!' },
  { pt: 'Última sala! Revisão é moleza pra quem chegou até aqui.', en: 'Almost there!' },
];

/** Dentro da sala: um balão de ânimo na entrada. */
export const MANE_ROOM_START: string[] = [
  'Calma, um objeto de cada vez!',
  'Lê com atenção, a lousa não morde!',
  'Olha bem as pistas, detetive!',
  'Concentra que dá!',
  'Pega só as palavras certas, foge das cartas do Zé!',
  'Tudo que você já treinou cai aqui. Bora!',
];

/** Dentro da sala: uma dica leve depois do primeiro erro (nunca a resposta). */
export const MANE_ROOM_TIP: string[] = [
  'Dica: escuta de novo a ordem e procura a palavra do lugar.',
  'Dica: lê a frase inteira antes de escolher.',
  'Dica: olha cada pista com calma antes de escolher.',
  'Dica: tenta lembrar onde cada carta estava.',
  'Dica: palavra errada não vale ponto, olha bem antes de pegar.',
  'Dica: sem pressa, lê todas as opções.',
];

/** Cabeçalho do modo simples. */
export const MANE_SIMPLE_LINE: ManeLine = { pt: 'Escolhe uma sala que eu vou junto!', en: "Let's go!" };

export const MANE_IMG = '/assets/mane_zoeira.png';
