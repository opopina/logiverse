// Tipos para el sistema de juego de LogiVerse

export interface GameWorld {
  id: string;
  name: string;
  description: string;
  theme: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  unlockRequirement?: {
    worldId?: string;
    minLevel?: number;
    minScore?: number;
  };
  levels: GameLevel[];
  totalLevels: number;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

export interface GameLevel {
  id: string;
  worldId: string;
  levelNumber: number;
  title: string;
  description: string;
  type: 'logic-puzzle' | 'truth-table' | 'syllogism' | 'pattern' | 'debate' | 'challenge';
  difficulty: 1 | 2 | 3 | 4 | 5;
  maxScore: number;
  timeLimit?: number; // en segundos
  content: LevelContent;
  hints: Hint[];
  unlockRequirement?: {
    previousLevel?: string;
    minScore?: number;
  };
}

export interface LevelContent {
  problem: string;
  context?: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'drag-drop' | 'text-input';
  options?: string[];
  correctAnswer: string | string[] | number;
  explanation: string;
  loggieTips?: string[];
}

export interface Hint {
  id: string;
  text: string;
  cost: number; // puntos que cuesta usar la pista
  order: number;
  loggieEmotion?: 'thinking' | 'friendly' | 'encouraging';
}

export interface GameSession {
  id: string;
  userId: string;
  worldId: string;
  levelId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  maxScore: number;
  attempts: number;
  hintsUsed: string[];
  timeSpent: number;
  completed: boolean;
  perfect: boolean; // completado sin pistas y con puntuación máxima
}

export interface UserProgress {
  userId: string;
  currentWorld: string;
  currentLevel: number;
  totalScore: number;
  logicPoints: number;
  worldsUnlocked: string[];
  levelsCompleted: {
    worldId: string;
    levelId: string;
    score: number;
    attempts: number;
    completedAt: Date;
    perfect: boolean;
  }[];
  achievements: Achievement[];
  streak: number; // días consecutivos jugando
  lastPlayed: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'score' | 'streak' | 'perfect' | 'speed' | 'world' | 'special';
  requirement: {
    condition: string;
    value: number;
  };
  reward: {
    logicPoints: number;
    badge?: string;
    loggieAccessory?: string;
  };
  unlockedAt?: Date;
}

export interface LoggieResponse {
  text: string;
  emotion: 'happy' | 'thinking' | 'surprised' | 'celebrating' | 'friendly' | 'challenging';
  context: 'hint' | 'correct' | 'incorrect' | 'level-start' | 'level-complete' | 'motivation';
  accessory?: 'none' | 'glasses' | 'scarf';
}

// Estados del juego
export interface GameState {
  currentSession: GameSession | null;
  selectedWorld: GameWorld | null;
  selectedLevel: GameLevel | null;
  isPlaying: boolean;
  isLoading: boolean;
  showHints: boolean;
  userAnswer: string | string[] | number | null;
  feedback: {
    isCorrect: boolean;
    message: string;
    loggieResponse: LoggieResponse;
  } | null;
  timeRemaining?: number;
  score: number;
  hintsUsed: number;
}

// Respuestas de la API
export interface GameResponse {
  success: boolean;
  data?: Record<string, unknown>;
  message: string;
  loggieResponse?: LoggieResponse;
}

export interface LevelCompletionResponse extends GameResponse {
  data: {
    session: GameSession;
    newAchievements: Achievement[];
    nextLevel?: GameLevel;
    progressUpdate: UserProgress;
  };
}
