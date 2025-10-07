import { useState } from 'react';
import { GameState, GameConfig, GameMode, BotStrategy, Player } from '@/lib/types';
import { DEFAULT_PAYOFF_MATRIX } from '@/lib/game-logic';
import ConfigPanel from './ConfigPanel';
import GameBoard from './GameBoard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowCounterClockwise } from '@phosphor-icons/react';

export default function PrisonersDilemmaGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const handleStartGame = (config: GameConfig) => {
    const player1: Player = {
      ...config.player1,
      score: config.initialCoins,
      history: [],
      confirmed: false,
      grimFired: false,
    };

    const player2: Player = {
      ...config.player2,
      score: config.initialCoins,
      history: [],
      confirmed: false,
      grimFired: false,
    };

    const newGameState: GameState = {
      config,
      currentRound: 1,
      rounds: [],
      player1,
      player2,
      gameEnded: false,
      isRevealed: false,
      autoPlay: false,
      autoPlaySpeed: 1000,
    };

    setGameState(newGameState);
  };

  const handleResetGame = () => {
    setGameState(null);
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                🛡️ Dilema del Prisionero Iterado
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Explora estrategias de cooperación y competencia en esta simulación educativa
              </p>
            </CardHeader>
          </Card>
          
          <ConfigPanel onStartGame={handleStartGame} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              🛡️ Dilema del Prisionero
            </h1>
            <div className="text-lg font-semibold">
              Ronda {gameState.currentRound} de {gameState.config.rounds}
            </div>
          </div>
          
          <Button 
            onClick={handleResetGame}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowCounterClockwise size={16} />
            Reiniciar
          </Button>
        </div>

        <GameBoard gameState={gameState} setGameState={setGameState} />
      </div>
    </div>
  );
}