// Jogos de intervalo ("interfase"): um respiro de ação no meio das atividades do nível, ainda com inglês.
// Aparecem como convite surpresa quando o aluno conclui a atividade `apos` do nível e volta ao quadro.
// Plano de camadas (decisão do professor, 02/11/2026): interfases nos Níveis 2 a 6.

export type JogoIntervalo = 'notas' | 'pula' | 'labirinto' | 'bebedouro' | 'fuga' | 'tetris';

export interface Intervalo {
  id: string;
  nivel: number;
  apos: number; // aparece depois de concluir esta quantidade de atividades do nível
  jogo: JogoIntervalo;
  dificuldade: 1 | 2 | 3;
  titulo: string;
  chamada: string; // frase do convite
  prefixo: string; // prefixo dos ids das atividades do nível (para contar as concluídas)
  quadro: string; // rota do quadro do nível (onde o convite aparece)
}

export const INTERVALOS: Intervalo[] = [
  { id: 'notas-n2', nivel: 2, apos: 3, jogo: 'notas', dificuldade: 1, titulo: 'Tiro nas notas', chamada: 'Hora do intervalo! As notas estão caindo do quadro. Apague as que você não quer e some 100 pontos.', prefixo: 'n2_', quadro: '/nivel2/patio' },
  { id: 'pula-n2', nivel: 2, apos: 5, jogo: 'pula', dificuldade: 1, titulo: 'Pula distração', chamada: 'Intervalo! Corra até a sala sem cair nas distrações do Zé. Pule na cabeça delas!', prefixo: 'n2_', quadro: '/nivel2/patio' },
  { id: 'notas-n3', nivel: 3, apos: 3, jogo: 'notas', dificuldade: 2, titulo: 'Tiro nas notas 2', chamada: 'Intervalo! Agora as notas são números quebrados e caem mais rápido. Consegue fechar 100?', prefixo: 'nivel3-', quadro: '/nivel3' },
  { id: 'pula-n3', nivel: 3, apos: 5, jogo: 'pula', dificuldade: 2, titulo: 'Pula distração 2', chamada: 'Intervalo! Agora tem aviãozinho de papel: quando aparecer DUCK!, abaixe!', prefixo: 'nivel3-', quadro: '/nivel3' },
  { id: 'labirinto-n4', nivel: 4, apos: 3, jogo: 'labirinto', dificuldade: 1, titulo: 'Labirinto da escola (3D)', chamada: 'Intervalo! Os corredores viraram um labirinto, e você está lá dentro. Ouça para onde ir em inglês e ache a sala certa!', prefixo: 'nivel4-', quadro: '/nivel4' },
  { id: 'tetris-n4', nivel: 4, apos: 5, jogo: 'tetris', dificuldade: 1, titulo: 'Tetris das palavras', chamada: 'Intervalo! Peças com palavras estão caindo. Guarde as do tema e jogue as outras no lixo!', prefixo: 'nivel4-', quadro: '/nivel4' },
  { id: 'bebedouro-n5', nivel: 5, apos: 4, jogo: 'bebedouro', dificuldade: 1, titulo: 'Missão bebedouro', chamada: 'Intervalo! A professora deixou ir beber água. Desça a rampa, beba e volte antes do sinal. Cuidado com o Zé!', prefixo: 'nivel5-', quadro: '/nivel5' },
  { id: 'fuga-n6', nivel: 6, apos: 3, jogo: 'fuga', dificuldade: 2, titulo: 'Fuga no corredor', chamada: 'Intervalo! Você saiu da sala sem permissão… e a coordenação viu! Fuja, pegue as palavras certas e não seja pego.', prefixo: 'nivel6-', quadro: '/nivel6' },
  { id: 'tetris-n6', nivel: 6, apos: 5, jogo: 'tetris', dificuldade: 2, titulo: 'Tetris das palavras 2', chamada: 'Intervalo! O Tetris voltou mais rápido. Guarde as palavras do tema!', prefixo: 'nivel6-', quadro: '/nivel6' },
];

export const intervaloPorId = (id: string) => INTERVALOS.find(i => i.id === id);
