export type Choice = 'C' | 'T';

export type GameMode = 'human_vs_bot' | 'bot_vs_bot' | 'human_vs_human';

export type BotStrategy = 'always_cooperate' | 'always_defect' | 'tit_for_tat' | 'grim_trigger' | 'random';

export interface PayoffMatrix {
  CC: [number, number];
  CT: [number, number];
  TC: [number, number];
  TT: [number, number];
}

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  strategy?: BotStrategy;
  score: number;
  history: Choice[];
  choice?: Choice;
  confirmed: boolean;
  grimFired?: boolean;
}

export interface GameConfig {
  mode: GameMode;
  rounds: number;
  initialCoins: number;
  payoffMatrix: PayoffMatrix;
  seed: number;
  pCoop: number;
  player1: Omit<Player, 'score' | 'history' | 'confirmed'>;
  player2: Omit<Player, 'score' | 'history' | 'confirmed'>;
}

export interface Round {
  number: number;
  player1Choice: Choice;
  player2Choice: Choice;
  player1Payout: number;
  player2Payout: number;
  player1Total: number;
  player2Total: number;
}

export interface GameState {
  config: GameConfig;
  currentRound: number;
  rounds: Round[];
  player1: Player;
  player2: Player;
  gameEnded: boolean;
  isRevealed: boolean;
  autoPlay: boolean;
  autoPlaySpeed: number;
}

export interface GameMetrics {
  player1CoopRate: number;
  player2CoopRate: number;
  mutualCooperations: number;
  mutualDefections: number;
  player1Exploitations: number;
  player2Exploitations: number;
  firstDefectionRound?: number;
  longestCoopStreak: number;
}

export interface FeedbackData {
  metrics: GameMetrics;
  strategies: BotStrategy[];
  text: string;
}