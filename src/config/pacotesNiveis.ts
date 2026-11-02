// Carregamento por fase (decisão do professor, 02/11/2026): cada nível é um pacote baixado quando o aluno entra
// e guardado no aparelho. Aqui ficam as telas de entrada de cada nível e os arquivos que o código não cita
// por extenso (fundos, personagens, texturas 3D). O resto (telas, sons e imagens citadas) é descoberto no build.

/** Telas de entrada de cada nível (caminho do módulo → níveis que usam). */
export const ENTRADAS_NIVEL: Record<string, number[]> = {
  'src/features/quiz/QuizScreen.tsx': [0],
  'src/features/quiz/QuizResultsScreen.tsx': [0],
  'src/features/flashcards/FlashcardScreen.tsx': [0],
  'src/features/level0/Level0Screen.tsx': [0],
  'src/features/level0/ArcadeLevel0Screen.tsx': [0],
  'src/features/orientation/OrientationScreen.tsx': [0],
  'src/features/level1/ListenScreen.tsx': [1],
  'src/features/level1/OrderScreen.tsx': [1],
  'src/features/level1/DialogueScreen.tsx': [1],
  'src/features/level1/ExploreScreen.tsx': [1],
  'src/features/level2/PatioScreen.tsx': [2],
  'src/features/level2/Level2WorldScreen.tsx': [2],
  'src/features/level3/ClassroomScreen.tsx': [3],
  'src/features/missoes20/MisterioMural.tsx': [3],
  'src/features/level4/TeamMissionScreen.tsx': [4],
  'src/features/level5/ChoicesMissionScreen.tsx': [5],
  'src/features/levels/Nivel6Screen.tsx': [6],
  'src/features/levels/Nivel7Screen.tsx': [7],
  'src/features/levels/Nivel8Screen.tsx': [8],
  'src/features/intervalo/IntervaloScreen.tsx': [2, 3, 4, 5, 6],
};

const TEX = (nomes: string[]) => nomes.map(n => `/assets/3d/tex/${n}.webp`);
const TEXTURAS = TEX(['piso_c', 'piso_c5', 'piso_n', 'piso_n5', 'piso_r', 'parede_c', 'parede_c5', 'parede_n5', 'parede_r', 'grama_c', 'grama_c5', 'grama_n5', 'grama_r', 'ceu', 'ceu5', 'ambiente', 'copa', 'copa5']);
const fundo = (nome: string) => [`/assets/espacos/${nome}.webp`, `/assets/espacos/${nome}_1280.webp`];

/** Arquivos de cada nível que o código monta em tempo de execução (fundos, anfitriões, texturas). */
export const EXTRAS_NIVEL: Record<number, string[]> = {
  0: ['/assets/nisialand_hallway_bg.jpg', '/assets/nisialand_auditorium_bg.jpg', '/assets/diretor_marcio_hd.png', '/assets/orientadora_leia.png', '/assets/ze_cartinha.png'],
  1: ['/assets/nisialand_auditorium_bg.jpg', '/assets/orientadora_leia.png', '/assets/diretor_marcio_hd.png', '/assets/ze_cartinha.png'],
  2: ['/assets/nisialand_school_facade_clean.jpg', '/assets/coordenadora_vania.png', '/assets/diretor_marcio_hd.png', '/assets/ze_cartinha.png', ...TEXTURAS],
  3: ['/assets/nisialand_hallway_bg.jpg', ...fundo('sala'), '/assets/rosana.png', '/assets/mane_zoeira.png', '/assets/ze_cartinha.png', ...TEXTURAS],
  4: [...fundo('quadra'), '/assets/mane_zoeira.png', '/assets/ze_cartinha.png', ...TEXTURAS],
  5: ['/assets/nisialand_auditorium_bg.jpg', '/assets/orientadora_leia.png', '/assets/mane_zoeira.png', '/assets/ze_cartinha.png'],
  6: [...fundo('biblioteca'), '/assets/diretor_marcio_hd.png', '/assets/coordenadora_vania.png', '/assets/orientadora_leia.png', '/assets/mane_zoeira.png'],
  7: ['/assets/nisialand_school_facade_clean.jpg', '/assets/coordenadora_vania.png'],
  8: ['/assets/nisialand_school_facade_clean.jpg', '/assets/rosana.png'],
};
export const ULTIMO_NIVEL_PACOTE = 8;
