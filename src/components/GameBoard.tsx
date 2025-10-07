import { useState, useEffect } from 'react';
import { GameState, Choice, Round } from '@/lib/types';
import { SeededRandom, executeStrategy, calculatePayoff, bothPlayersConfirmed, resetPlayerChoices } from '@/lib/game-logic';
import { generateFeedback } from '@/lib/feedback';
import PlayerPanel from './PlayerPanel';
import GameHistory from './GameHistory';
import FeedbackPanel from './FeedbackPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipForward } from '@phosphor-icons/react';

interface GameBoardProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function GameBoard({ gameState, setGameState }: GameBoardProps) {
  const [rng] = useState(new SeededRandom(gameState.config.seed));
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState.autoPlay && !gameState.gameEnded && gameState.config.mode === 'bot_vs_bot') {
      const interval = setInterval(() => {
        playBotVsBotRound();
      }, gameState.autoPlaySpeed);
      setAutoPlayInterval(interval);
      return () => clearInterval(interval);
    } else if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
  }, [gameState.autoPlay, gameState.autoPlaySpeed, gameState.gameEnded]);

  const makeChoice = (playerId: string, choice: Choice) => {
    setGameState(prev => ({
      ...prev,
      [playerId === 'player1' ? 'player1' : 'player2']: {
        ...prev[playerId === 'player1' ? 'player1' : 'player2'],
        choice,
        confirmed: true,
      },
    }));
  };

  const playBotVsBotRound = () => {
    setGameState(prev => {
      if (prev.gameEnded || prev.currentRound > prev.config.rounds) return prev;

      const player1Result = executeStrategy(
        prev.player1.strategy!,
        prev.player1.history,
        prev.player2.history,
        prev.player1.grimFired || false,
        rng,
        prev.config.pCoop
      );

      const player2Result = executeStrategy(
        prev.player2.strategy!,
        prev.player2.history,
        prev.player1.history,
        prev.player2.grimFired || false,
        rng,
        prev.config.pCoop
      );

      const [p1Payout, p2Payout] = calculatePayoff(
        player1Result.choice,
        player2Result.choice,
        prev.config.payoffMatrix
      );

      const newRound: Round = {
        number: prev.currentRound,
        player1Choice: player1Result.choice,
        player2Choice: player2Result.choice,
        player1Payout: p1Payout,
        player2Payout: p2Payout,
        player1Total: prev.player1.score + p1Payout,
        player2Total: prev.player2.score + p2Payout,
      };

      const gameEnded = prev.currentRound >= prev.config.rounds;

      return {
        ...prev,
        currentRound: gameEnded ? prev.currentRound : prev.currentRound + 1,
        rounds: [...prev.rounds, newRound],
        player1: {
          ...prev.player1,
          score: prev.player1.score + p1Payout,
          history: [...prev.player1.history, player1Result.choice],
          grimFired: player1Result.grimFired,
          choice: undefined,
          confirmed: false,
        },
        player2: {
          ...prev.player2,
          score: prev.player2.score + p2Payout,
          history: [...prev.player2.history, player2Result.choice],
          grimFired: player2Result.grimFired,
          choice: undefined,
          confirmed: false,
        },
        gameEnded,
        isRevealed: false,
        autoPlay: gameEnded ? false : prev.autoPlay,
      };
    });
  };

  const revealChoices = () => {
    if (!bothPlayersConfirmed(gameState.player1, gameState.player2)) return;

    const [p1Payout, p2Payout] = calculatePayoff(
      gameState.player1.choice!,
      gameState.player2.choice!,
      gameState.config.payoffMatrix
    );

    const newRound: Round = {
      number: gameState.currentRound,
      player1Choice: gameState.player1.choice!,
      player2Choice: gameState.player2.choice!,
      player1Payout: p1Payout,
      player2Payout: p2Payout,
      player1Total: gameState.player1.score + p1Payout,
      player2Total: gameState.player2.score + p2Payout,
    };

    const gameEnded = gameState.currentRound >= gameState.config.rounds;

    setGameState(prev => ({
      ...prev,
      rounds: [...prev.rounds, newRound],
      player1: {
        ...prev.player1,
        score: prev.player1.score + p1Payout,
        history: [...prev.player1.history, prev.player1.choice!],
      },
      player2: {
        ...prev.player2,
        score: prev.player2.score + p2Payout,
        history: [...prev.player2.history, prev.player2.choice!],
      },
      gameEnded,
      isRevealed: true,
    }));
  };

  const nextRound = () => {
    if (gameState.gameEnded) return;

    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      player1: resetPlayerChoices(prev.player1),
      player2: resetPlayerChoices(prev.player2),
      isRevealed: false,
    }));
  };

  const processBotChoice = (botPlayer: 'player1' | 'player2') => {
    const player = gameState[botPlayer];
    const opponent = botPlayer === 'player1' ? gameState.player2 : gameState.player1;
    
    if (player.isBot && player.strategy && !player.confirmed) {
      const result = executeStrategy(
        player.strategy,
        player.history,
        opponent.history,
        player.grimFired || false,
        rng,
        gameState.config.pCoop
      );

      setGameState(prev => ({
        ...prev,
        [botPlayer]: {
          ...prev[botPlayer],
          choice: result.choice,
          confirmed: true,
          grimFired: result.grimFired,
        },
      }));
    }
  };

  useEffect(() => {
    if (gameState.config.mode === 'human_vs_bot') {
      if (gameState.player1.isBot) {
        processBotChoice('player1');
      }
      if (gameState.player2.isBot) {
        processBotChoice('player2');
      }
    }
  }, [gameState.currentRound, gameState.player1.confirmed, gameState.player2.confirmed]);

  const toggleAutoPlay = () => {
    setGameState(prev => ({
      ...prev,
      autoPlay: !prev.autoPlay,
    }));
  };

  const handleSpeedChange = (value: number[]) => {
    setGameState(prev => ({
      ...prev,
      autoPlaySpeed: 2000 - value[0], // Inverso para que mayor valor = más rápido
    }));
  };

  const isWaitingForReveal = bothPlayersConfirmed(gameState.player1, gameState.player2) && !gameState.isRevealed;
  const canProceedToNext = gameState.isRevealed && !gameState.gameEnded;

  if (gameState.gameEnded) {
    const feedback = generateFeedback(gameState);
    return <FeedbackPanel feedback={feedback} gameState={gameState} />;
  }

  return (
    <div className="space-y-6">
      {/* Puntuaciones */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Puntaje {gameState.player1.name}</CardTitle>
            <div className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
              🪙 {gameState.player1.score}
            </div>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Puntaje {gameState.player2.name}</CardTitle>
            <div className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
              🪙 {gameState.player2.score}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Paneles de jugadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlayerPanel
          player={gameState.player1}
          onChoice={(choice) => makeChoice('player1', choice)}
          disabled={gameState.isRevealed || gameState.player1.confirmed}
          gameMode={gameState.config.mode}
        />
        
        <PlayerPanel
          player={gameState.player2}
          onChoice={(choice) => makeChoice('player2', choice)}
          disabled={gameState.isRevealed || gameState.player2.confirmed}
          gameMode={gameState.config.mode}
        />
      </div>

      {/* Controles del juego */}
      <Card>
        <CardHeader>
          <CardTitle>Controles del Juego</CardTitle>
        </CardHeader>
        <CardContent>
          {gameState.config.mode === 'bot_vs_bot' ? (
            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <Button
                  onClick={toggleAutoPlay}
                  variant={gameState.autoPlay ? "destructive" : "default"}
                  className="flex items-center gap-2"
                >
                  {gameState.autoPlay ? <Pause size={16} /> : <Play size={16} />}
                  {gameState.autoPlay ? 'Pausar' : 'Auto-jugar'}
                </Button>
                
                <Button
                  onClick={playBotVsBotRound}
                  disabled={gameState.autoPlay}
                  className="flex items-center gap-2"
                >
                  <SkipForward size={16} />
                  Siguiente Ronda
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Velocidad Auto-play</label>
                <Slider
                  value={[2000 - gameState.autoPlaySpeed]}
                  onValueChange={handleSpeedChange}
                  max={1800}
                  min={200}
                  step={200}
                  disabled={gameState.autoPlay}
                />
                <div className="text-xs text-muted-foreground text-center">
                  {gameState.autoPlaySpeed}ms por ronda
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              {isWaitingForReveal && (
                <Button onClick={revealChoices} size="lg" className="bg-accent text-accent-foreground">
                  Revelar Jugadas
                </Button>
              )}
              
              {canProceedToNext && (
                <Button onClick={nextRound} size="lg">
                  Siguiente Ronda
                </Button>
              )}

              {gameState.isRevealed && (
                <div className="text-lg font-semibold p-4 bg-secondary rounded-lg">
                  Resultado: {gameState.player1.choice === 'C' ? '🤝' : '⚡'} vs {gameState.player2.choice === 'C' ? '🤝' : '⚡'}
                  {gameState.player1.choice === 'C' && gameState.player2.choice === 'C' && ' - Cooperación mutua'}
                  {gameState.player1.choice === 'T' && gameState.player2.choice === 'T' && ' - Traición mutua'}
                  {gameState.player1.choice !== gameState.player2.choice && ' - Explotación'}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial */}
      <GameHistory rounds={gameState.rounds} />
    </div>
  );
}