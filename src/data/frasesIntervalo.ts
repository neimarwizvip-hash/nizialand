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
