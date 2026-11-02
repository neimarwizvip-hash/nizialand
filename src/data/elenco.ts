// Elenco de vozes (aprovado pelo professor em 02/11/2026): a mesma voz para cada personagem até o fim do jogo.
// Vozes do Phonon, geradas no computador (scripts/vozes): `pt` usa o modelo phonon-40m-pt e `en` o phonon-31m-en.
// Trocar uma voz aqui e rodar `npm run vozes` regrava só as falas daquele personagem.

export type Personagem = 'narrador' | 'marcio' | 'leia' | 'vania' | 'rosana' | 'mane' | 'ze' | 'colega' | 'colegaM' | 'professora';

export const ELENCO: Record<Personagem, { pt: string; en: string; quem: string }> = {
  narrador: { pt: 'Marcelo', en: 'Preston', quem: 'Narrador' },
  marcio: { pt: 'Otávio', en: 'Miles', quem: 'Diretor Márcio' },
  leia: { pt: 'Clarice', en: 'Delia', quem: 'Orientadora Edileia' },
  vania: { pt: 'Débora', en: 'Hadley', quem: 'Coordenadora Vânia' },
  rosana: { pt: 'Flávia', en: 'Harper', quem: 'Professora Rosana' },
  mane: { pt: 'Kauã', en: 'Micah', quem: 'Mané Zoeira' },
  ze: { pt: 'Igor', en: 'Easton', quem: 'Zé Cartinha' },
  colega: { pt: 'Rafaela', en: 'Zoey', quem: 'Colega (menina)' },
  colegaM: { pt: 'Davi', en: 'Trevor', quem: 'Colega (menino)' },
  professora: { pt: 'Flávia', en: 'Juniper', quem: 'Voz das frases de escuta' },
};
