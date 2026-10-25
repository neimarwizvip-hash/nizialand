/** Roteiros de transição provisórios. Substituir pelo texto aprovado pelo professor. */
export type ProvisionalStoryId = 'nivel3' | 'nivel4';

export interface StoryPanel {
  scene: string;
  speaker: string;
  text: string;
  background: string;
}

export const PROVISIONAL_STORIES: Record<ProvisionalStoryId, { title: string; panels: StoryPanel[] }> = {
  nivel3: {
    title: 'Uma turma, muitas vozes',
    panels: [
      { scene: 'Chegada à sala', speaker: 'Narrador', text: 'Depois do pátio, a turma chega à nova sala. Cada colega precisa de espaço para aprender.', background: '/assets/nisialand_hallway_bg.jpg' },
      { scene: 'Primeira conversa', speaker: 'Colega', text: 'May I sit here? Posso sentar aqui?', background: '/assets/nisialand_hallway_bg.jpg' },
      { scene: 'O desafio', speaker: 'Narrador', text: 'Ao ouvir, organizar e respeitar os outros, a turma abre as portas das salas.', background: '/assets/nisialand_hallway_bg.jpg' },
    ],
  },
  nivel4: {
    title: 'Uma tarefa para todos',
    panels: [
      { scene: 'Novo desafio', speaker: 'Narrador', text: 'A turma recebe uma tarefa que ninguém resolve sozinho: seguir as pistas pela escola.', background: '/assets/nisialand_school_facade_clean.jpg' },
      { scene: 'Dividindo papéis', speaker: 'Colega', text: 'Who will find the clues? Quem vai procurar as pistas?', background: '/assets/nisialand_hallway_bg.jpg' },
      { scene: 'A equipe começa', speaker: 'Narrador', text: 'Cada pessoa assume um papel. Juntos, os colegas percorrem a escola e montam a resposta.', background: '/assets/nisialand_school_facade_clean.jpg' },
    ],
  },
};
