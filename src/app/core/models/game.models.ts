export interface GameCell {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  readonly state: CellState;
  readonly timestamp?: number;
  readonly reactionTime?: number;
}

export enum CellState {
  IDLE = 'idle',
  ACTIVE = 'active',
  SUCCESS = 'success',
  FAILED = 'failed',
  DISABLED = 'disabled'
}

export enum GameState {
  IDLE = 'idle',
  PLAYING = 'playing',
  PAUSED = 'paused',
  FINISHED = 'finished'
}

export enum GameResult {
  PLAYER_WIN = 'player_win',
  COMPUTER_WIN = 'computer_win',
  DRAW = 'draw'
}

export interface GameConfig {
  readonly gridSize: number;
  readonly reactionTimeMs: number;
  readonly roundIntervalMs: number;
  readonly maxScore: number;
  readonly difficulty: GameDifficulty;
}

export enum GameDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

export interface GameStats {
  readonly playerScore: number;
  readonly computerScore: number;
  readonly totalRounds: number;
  readonly averageReactionTime: number;
  readonly bestReactionTime: number;
  readonly missedRounds: number;
  readonly accuracy: number;
}

export interface GameRound {
  readonly roundNumber: number;
  readonly activeCell: GameCell;
  readonly startTime: number;
  readonly endTime?: number;
  readonly reactionTime?: number;
  readonly result: 'success' | 'failed' | 'timeout';
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  gridSize: 10,
  reactionTimeMs: 800,
  roundIntervalMs: 2500,
  maxScore: 10,
  difficulty: GameDifficulty.MEDIUM
};

export const DIFFICULTY_CONFIGS: Record<GameDifficulty, Partial<GameConfig>> = {
  [GameDifficulty.EASY]: {
    reactionTimeMs: 1200,
    roundIntervalMs: 3000
  },
  [GameDifficulty.MEDIUM]: {
    reactionTimeMs: 800,
    roundIntervalMs: 2500
  },
  [GameDifficulty.HARD]: {
    reactionTimeMs: 600,
    roundIntervalMs: 2000
  },
  [GameDifficulty.EXPERT]: {
    reactionTimeMs: 400,
    roundIntervalMs: 1500
  }
};