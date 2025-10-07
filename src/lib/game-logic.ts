import { BotStrategy, Choice, Player, PayoffMatrix } from './types';

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x80000000;
  }
}

export function executeStrategy(
  strategy: BotStrategy,
  myHistory: Choice[],
  oppHistory: Choice[],
  grimFired: boolean,
  rng: SeededRandom,
  pCoop: number
): { choice: Choice; grimFired: boolean } {
  switch (strategy) {
    case 'always_cooperate':
      return { choice: 'C', grimFired };

    case 'always_defect':
      return { choice: 'T', grimFired };

    case 'tit_for_tat':
      if (oppHistory.length === 0) {
        return { choice: 'C', grimFired };
      }
      return { choice: oppHistory[oppHistory.length - 1], grimFired };

    case 'grim_trigger':
      if (oppHistory.includes('T')) {
        return { choice: 'T', grimFired: true };
      }
      return { choice: 'C', grimFired };

    case 'random':
      const choice = rng.next() < pCoop ? 'C' : 'T';
      return { choice, grimFired };

    default:
      return { choice: 'C', grimFired };
  }
}

export function calculatePayoff(
  choice1: Choice,
  choice2: Choice,
  payoffMatrix: PayoffMatrix
): [number, number] {
  const key = (choice1 + choice2) as keyof PayoffMatrix;
  return payoffMatrix[key];
}

export function bothPlayersConfirmed(player1: Player, player2: Player): boolean {
  return player1.confirmed && player2.confirmed;
}

export function resetPlayerChoices(player: Player): Player {
  return {
    ...player,
    choice: undefined,
    confirmed: false,
  };
}

export const DEFAULT_PAYOFF_MATRIX: PayoffMatrix = {
  CC: [3, 3],
  CT: [0, 5],
  TC: [5, 0],
  TT: [1, 1],
};

export const STRATEGY_NAMES: Record<BotStrategy, string> = {
  always_cooperate: 'Siempre Cooperar',
  always_defect: 'Siempre Traicionar',
  tit_for_tat: 'Tit for Tat',
  grim_trigger: 'Gatillo Severo',
  random: 'Aleatorio',
};

export const STRATEGY_DESCRIPTIONS: Record<BotStrategy, string> = {
  always_cooperate: 'Coopera en todas las rondas',
  always_defect: 'Traiciona en todas las rondas',
  tit_for_tat: 'Coopera primero, luego imita la última jugada del oponente',
  grim_trigger: 'Coopera hasta ver una traición, luego siempre traiciona',
  random: 'Elige al azar según probabilidad configurada',
};