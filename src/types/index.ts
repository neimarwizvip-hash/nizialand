// Shared TypeScript types for NIZIALAND Educational Game

export type TeamId = 'blue' | 'purple';

export interface TeamInfo {
  id: TeamId;
  name: string;
  nameDisplay: string;
  color: string;
  gradient: string;
  glowColor: string;
  borderColor: string;
  shieldIcon: string;
  motto: string;
}

export interface PlayerProfile {
  id: string; // Internal UUID
  playerCode: string; // Short access code e.g. NZL-804-A7B
  name: string;
  displayName: string;
  age: number;
  className: string; // e.g. '804', '801', '802', '803'
  team: TeamId;
  avatar: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface QuizOption {
  letter?: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  activity: 1 | 2;
  activityTitle: string;
  instruction: string;
  sentence: string;
  spokenText: string;
  contextHint: string;
  hint: string;
  targetStudent1?: string;
  targetStudent2?: string;
  optionsSheet: QuizOption[];
  optionsQuad: QuizOption[];
  explanation: string;
}

export interface QuizQuestionAttempt {
  questionId: number;
  attemptsCount: number; // 1 or 2
  selectedOptionIndex: number;
  isCorrect: boolean;
  pointsEarned: number; // 100 on 1st try, 50 on 2nd try, 0 on fail
  answeredAt: string;
}

export interface QuizResult {
  completed: boolean;
  totalScore: number; // Max 1000
  correctCount: number; // Out of 10
  stars: number; // 1 to 3 stars
  startedAt: string;
  completedAt: string;
  attempts: Record<number, QuizQuestionAttempt>;
}

export interface FlashcardStudent {
  id: string;
  name: string;
  age: number;
  img: string;
}

export interface FlashcardChallenge {
  id: number;
  targetName: string;
  targetAge: number;
  compType: 'older' | 'younger' | 'same';
  compText: string;
  questionEn: string;
  questionPt: string;
  ruleExplanation: string;
  validateCard: (card: FlashcardStudent) => boolean;
}

export interface FlashcardRoundAttempt {
  round: number;
  challengeId: number;
  attemptsUsed: number; // 1 to 3
  chosenStudentId: string;
  isCorrect: boolean;
  pointsEarned: number; // 100 for 1st attempt, 50 for 2nd attempt, 0 after
}

export interface FlashcardResult {
  completed: boolean;
  totalScore: number; // Max 500
  roundsCompleted: number; // Max 5
  stars: number;
  startedAt: string;
  completedAt: string;
  roundAttempts: FlashcardRoundAttempt[];
}

export interface GameProgress {
  mission1Quiz: QuizResult | null;
  mission2Flashcards: FlashcardResult | null;
  totalScore: number;
  medal: 'none' | 'bronze' | 'silver' | 'gold';
  isFullyCompleted: boolean;
}

export interface LeaderboardPlayerEntry {
  rank: number;
  playerId: string;
  displayName: string;
  className: string;
  team: TeamId;
  avatar: string;
  quizScore: number;
  flashcardScore: number;
  totalScore: number;
  completedAt: string;
  medal: 'bronze' | 'silver' | 'gold';
}

export interface ClassRankingEntry {
  className: string;
  studentsCount: number;
  totalPoints: number;
  averageScore: number;
}

export interface TeamRankingComparison {
  blueTeam: {
    playersCount: number;
    totalPoints: number;
    averageScore: number;
  };
  purpleTeam: {
    playersCount: number;
    totalPoints: number;
    averageScore: number;
  };
  leadingTeam: TeamId | 'tie';
}

export interface TeacherAuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  teacherName: string;
}
