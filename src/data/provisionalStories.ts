/** Roteiros de transição provisórios. Substituir pelo texto aprovado pelo professor. */
import type { NomeVoz } from '../services/narracao';

export type ProvisionalStoryId = 'nivel3' | 'nivel4';

export interface StoryPanel {
  scene: string;
  speaker: string; // "Narrador" vira recordatório; os demais falam em balão
  voz: NomeVoz;
  text: string; // fala em português (dita em pt-BR)
  en?: string; // frase em inglês do quadro (dita em en-US depois do português)
  image?: string; // personagem oficial que fala no quadro
  background: string;
}

export const PROVISIONAL_STORIES: Record<ProvisionalStoryId, { title: string; panels: StoryPanel[] }> = {
  nivel3: {
    title: 'Uma turma, muitas vozes',
    panels: [
      { scene: 'Chegada à sala', speaker: 'Narrador', voz: 'narrador', text: 'Depois do pátio, a turma chega à nova sala. Cada colega precisa de espaço para aprender.', background: '/assets/nisialand_hallway_bg.jpg' },
      { scene: 'Primeira conversa', speaker: 'Colega', voz: 'colega', text: 'Posso sentar aqui?', en: 'May I sit here?', image: '/assets/student_girl_curly.png', background: '/assets/nisialand_hallway_bg.jpg' },
      { scene: 'O desafio', speaker: 'Narrador', voz: 'narrador', text: 'Ao ouvir, organizar e respeitar os outros, a turma abre as portas das salas.', background: '/assets/nisialand_hallway_bg.jpg' },
    ],
  },
  nivel4: {
    title: 'Uma tarefa para todos',
    panels: [
      { scene: 'Novo desafio', speaker: 'Narrador', voz: 'narrador', text: 'A turma recebe uma tarefa que ninguém resolve sozinho: seguir as pistas pela escola.', background: '/assets/nisialand_school_facade_clean.jpg' },
      { scene: 'Dividindo papéis', speaker: 'Colega', voz: 'colegaM', text: 'Quem vai procurar as pistas?', en: 'Who will find the clues?', image: '/assets/student_boy_tshirt.png', background: '/assets/nisialand_hallway_bg.jpg' },
      { scene: 'A equipe começa', speaker: 'Narrador', voz: 'narrador', text: 'Cada pessoa assume um papel. Juntos, os colegas percorrem a escola e montam a resposta.', background: '/assets/nisialand_school_facade_clean.jpg' },
    ],
  },
};
