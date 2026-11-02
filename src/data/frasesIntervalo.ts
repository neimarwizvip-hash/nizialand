// Frases em inglês dos jogos de intervalo (faladas com a voz gravada das frases de escuta).
export const LUGARES = [
  { en: 'LIBRARY', frase: 'Go to the library!', emoji: '📚' },
  { en: 'GYM', frase: 'Go to the gym!', emoji: '🏀' },
  { en: 'LAB', frase: 'Go to the lab!', emoji: '🔬' },
  { en: 'OFFICE', frase: 'Go to the office!', emoji: '🗂️' },
  { en: 'CLASSROOM', frase: 'Go to the classroom!', emoji: '✏️' },
  { en: 'BATHROOM', frase: 'Go to the bathroom!', emoji: '🚻' },
];

export type Etapa = 'ida' | 'beber' | 'volta';
export const ETAPAS: Record<Etapa, string> = {
  ida: 'Go down the ramp to the water fountain!',
  beber: 'Drink some water!',
  volta: 'Go back to the classroom!',
};

// ---------- Labirinto 3D (primeira pessoa): o colega dá a direção em inglês quando o aluno pede ajuda ----------
export type Relativa = 'frente' | 'esquerda' | 'direita' | 'tras';
export const DIRECOES: Record<Relativa, string> = { frente: 'Go straight.', esquerda: 'Turn left.', direita: 'Turn right.', tras: 'Turn around.' };
export const CHEGADA: Record<Relativa, string> = { frente: "It's in front of you.", esquerda: "It's on your left.", direita: "It's on your right.", tras: "It's behind you." };
export const portaErrada = (lugar: number) => `That's the ${LUGARES[lugar].en.toLowerCase()}.`;

// ---------- Fuga no corredor (estilo Pac-Man): quem persegue o aluno e o que ele recolhe ----------
export type Perseguidor = 'vania' | 'leia' | 'marcio';
export const PERSEGUIDORES: Record<Perseguidor, { nome: string; img: string; grito: string; pegou: string; cor: string }> = {
  vania: { nome: 'Coordenadora Vânia', img: '/assets/coordenadora_vania.png', grito: 'Back to class, please!', pegou: 'Got you! Back to class!', cor: '#E85D9A' },
  leia: { nome: 'Orientadora Edileia', img: '/assets/orientadora_leia.png', grito: 'Where are you going?', pegou: 'Got you! Let\'s talk in my office.', cor: '#8A5CF6' },
  marcio: { nome: 'Diretor Márcio', img: '/assets/diretor_marcio_hd.png', grito: 'Stop running in the hallway!', pegou: 'Got you! Principal\'s office, now!', cor: '#1F5FD0' },
};
export interface Coleta { ordem: string; tema: string; certas: string[]; erradas: string[] }
export const COLETAS_FUGA: Coleta[] = [
  { ordem: 'Collect the school objects!', tema: 'objetos da escola', certas: ['PENCIL', 'RULER', 'ERASER', 'NOTEBOOK', 'BACKPACK'], erradas: ['PIZZA', 'HAPPY', 'RUN'] },
  { ordem: 'Collect the feelings!', tema: 'sentimentos', certas: ['HAPPY', 'SAD', 'ANGRY', 'CALM', 'NERVOUS'], erradas: ['TABLE', 'WRITE', 'GREEN'] },
  { ordem: 'Collect the actions!', tema: 'ações (verbos)', certas: ['READ', 'WRITE', 'LISTEN', 'SPEAK', 'STUDY'], erradas: ['DESK', 'BLUE', 'TIRED'] },
];

// ---------- Tetris das palavras: guarde as peças do tema, jogue fora as outras ----------
export const TEMAS_TETRIS: Coleta[] = [
  { ordem: 'Keep the school places!', tema: 'lugares da escola', certas: ['LIBRARY', 'GYM', 'LAB', 'CLASSROOM', 'OFFICE', 'CAFETERIA', 'HALLWAY', 'BATHROOM'], erradas: ['APPLE', 'JUMP', 'YELLOW', 'HAPPY', 'PENCIL'] },
  { ordem: 'Keep the rules!', tema: 'regras da sala', certas: ['RAISE YOUR HAND', 'BE ON TIME', 'LISTEN', 'BE POLITE', 'TAKE TURNS', 'BE QUIET'], erradas: ['SHOUT', 'RUN INSIDE', 'BE LATE', 'PUSH'] },
  { ordem: 'Keep the past tense!', tema: 'verbos no passado', certas: ['WENT', 'SAW', 'PLAYED', 'STUDIED', 'ATE', 'WROTE', 'MADE'], erradas: ['GO', 'SEE', 'PLAY', 'EAT', 'WRITE'] },
];

/** Tudo o que os intervalos falam com voz gravada (o script das vozes lê esta lista). */
export const FALAS_INTERVALO: Array<{ personagem: 'mane' | 'professora' | Perseguidor; texto: string }> = [
  ...Object.values(DIRECOES).map(texto => ({ personagem: 'mane' as const, texto })),
  ...Object.values(CHEGADA).map(texto => ({ personagem: 'mane' as const, texto })),
  ...LUGARES.map((_, i) => ({ personagem: 'professora' as const, texto: portaErrada(i) })),
  ...(Object.keys(PERSEGUIDORES) as Perseguidor[]).flatMap(p => [{ personagem: p, texto: PERSEGUIDORES[p].grito }, { personagem: p, texto: PERSEGUIDORES[p].pegou }]),
  ...COLETAS_FUGA.map(c => ({ personagem: 'professora' as const, texto: c.ordem })),
  ...TEMAS_TETRIS.map(c => ({ personagem: 'professora' as const, texto: c.ordem })),
];
