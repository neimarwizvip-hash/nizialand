import { TeamInfo, LeaderboardPlayerEntry } from '../types';

export const TEAMS_CONFIG: Record<'blue' | 'purple', TeamInfo> = {
  blue: {
    id: 'blue',
    name: 'Blue Team',
    nameDisplay: 'BLUE TEAM',
    color: '#2563eb',
    gradient: 'from-blue-600 to-cyan-500',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    borderColor: '#3b82f6',
    shieldIcon: '🛡️',
    motto: 'Knowledge is our power!'
  },
  purple: {
    id: 'purple',
    name: 'Purple Team',
    nameDisplay: 'PURPLE TEAM',
    color: '#7c3aed',
    gradient: 'from-purple-600 to-pink-500',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    borderColor: '#a855f7',
    shieldIcon: '🔮',
    motto: 'Together we achieve more!'
  }
};

// Turmas da escola: 601–609, 701–709, 801–809, 901–909 (a série vem do 1º dígito, ver services/grade.ts).
export const AVAILABLE_CLASSES = ['6', '7', '8', '9'].flatMap(serie =>
  Array.from({ length: 9 }, (_, i) => `${serie}0${i + 1}`)
);

export const AVAILABLE_AVATARS = [
  { id: 'mateus', name: 'Mateus', img: '/assets/avatar_mateus.jpg', team: 'blue' },
  { id: 'juliana', name: 'Juliana', img: '/assets/avatar_juliana.jpg', team: 'purple' },
  { id: 'carlos', name: 'Carlos', img: '/assets/avatar_carlos.jpg', team: 'blue' },
  { id: 'beatriz', name: 'Beatriz', img: '/assets/avatar_beatriz.jpg', team: 'purple' },
  { id: 'gabriel', name: 'Gabriel', img: '/assets/avatar_gabriel.jpg', team: 'blue' },
  { id: 'larissa', name: 'Larissa', img: '/assets/avatar_larissa.jpg', team: 'purple' },
  { id: 'rafael', name: 'Rafael', img: '/assets/avatar_rafael.jpg', team: 'blue' },
  { id: 'sofia', name: 'Sofia', img: '/assets/avatar_sofia.jpg', team: 'purple' }
];

export const INITIAL_LEADERBOARD: LeaderboardPlayerEntry[] = [
  {
    rank: 1,
    playerId: 'p-1',
    displayName: 'Mateus S.',
    className: '804',
    team: 'blue',
    avatar: '/assets/avatar_mateus.jpg',
    quizScore: 950,
    flashcardScore: 500,
    totalScore: 1450,
    completedAt: '2026-10-21T14:30:00Z',
    medal: 'gold'
  },
  {
    rank: 2,
    playerId: 'p-2',
    displayName: 'Juliana R.',
    className: '804',
    team: 'purple',
    avatar: '/assets/avatar_juliana.jpg',
    quizScore: 900,
    flashcardScore: 500,
    totalScore: 1400,
    completedAt: '2026-10-21T14:45:00Z',
    medal: 'gold'
  },
  {
    rank: 3,
    playerId: 'p-3',
    displayName: 'Beatriz L.',
    className: '804',
    team: 'purple',
    avatar: '/assets/avatar_beatriz.jpg',
    quizScore: 850,
    flashcardScore: 450,
    totalScore: 1300,
    completedAt: '2026-10-21T15:00:00Z',
    medal: 'silver'
  },
  {
    rank: 4,
    playerId: 'p-4',
    displayName: 'Carlos M.',
    className: '804',
    team: 'blue',
    avatar: '/assets/avatar_carlos.jpg',
    quizScore: 800,
    flashcardScore: 450,
    totalScore: 1250,
    completedAt: '2026-10-21T15:10:00Z',
    medal: 'silver'
  },
  {
    rank: 5,
    playerId: 'p-5',
    displayName: 'Larissa K.',
    className: '803',
    team: 'purple',
    avatar: '/assets/avatar_larissa.jpg',
    quizScore: 750,
    flashcardScore: 400,
    totalScore: 1150,
    completedAt: '2026-10-21T15:15:00Z',
    medal: 'bronze'
  },
  {
    rank: 6,
    playerId: 'p-6',
    displayName: 'Gabriel F.',
    className: '801',
    team: 'blue',
    avatar: '/assets/avatar_gabriel.jpg',
    quizScore: 700,
    flashcardScore: 350,
    totalScore: 1050,
    completedAt: '2026-10-21T15:20:00Z',
    medal: 'bronze'
  }
];

export const TEACHER_CREDENTIALS = {
  teacherName: 'Prof. Neimar Oliveira',
  schoolName: 'Escola Municipal Nísia Vilela Fernandes'
};
