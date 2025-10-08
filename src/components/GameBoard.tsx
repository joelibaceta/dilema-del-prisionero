import { useState, useEffect, useCallback } from 'react';
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
  const [revealTimeout, setRevealTimeout] = useState<NodeJS.Timeout | null>(null);
  const [nextRoundTimeout, setNextRoundTimeout] = useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [scoreAnimations, setScoreAnimations] = useState<{player1: boolean, player2: boolean}>({
    player1: false,
    player2: false
  });

  const playBotVsBotRound = useCallback(() => {
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
  }, [rng]);

  const processBotChoice = useCallback((botPlayer: 'player1' | 'player2') => {
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
  }, [gameState, rng]);

  // Auto-reveal after both players confirm their choices
  useEffect(() => {
    if (bothPlayersConfirmed(gameState.player1, gameState.player2) && !gameState.isRevealed && gameState.config.mode !== 'bot_vs_bot') {
      const timeout = setTimeout(() => {
        revealChoices();
      }, 2000); // 2 second delay
      
      setRevealTimeout(timeout);
      
      return () => {
        clearTimeout(timeout);
        setRevealTimeout(null);
      };
    }
  }, [gameState.player1.confirmed, gameState.player2.confirmed, gameState.isRevealed, gameState.config.mode]);

  useEffect(() => {
    if (gameState.autoPlay && !gameState.gameEnded && gameState.config.mode === 'bot_vs_bot') {
      const interval = setInterval(playBotVsBotRound, gameState.autoPlaySpeed);
      setAutoPlayInterval(interval);
      return () => {
        clearInterval(interval);
        setAutoPlayInterval(null);
      };
    } else {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        setAutoPlayInterval(null);
      }
    }
  }, [gameState.autoPlay, gameState.autoPlaySpeed, gameState.gameEnded, gameState.config.mode, playBotVsBotRound]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
      if (revealTimeout) {
        clearTimeout(revealTimeout);
      }
      if (nextRoundTimeout) {
        clearTimeout(nextRoundTimeout);
      }
    };
  }, [autoPlayInterval, revealTimeout, nextRoundTimeout]);

  useEffect(() => {
    if (gameState.config.mode === 'human_vs_bot') {
      if (gameState.player1.isBot) {
        processBotChoice('player1');
      }
      if (gameState.player2.isBot) {
        processBotChoice('player2');
      }
    }
  }, [gameState.currentRound, gameState.player1.confirmed, gameState.player2.confirmed, gameState.config.mode, processBotChoice]);

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

    // Activar animaciones de puntuación
    setScoreAnimations({ player1: true, player2: true });
    setTimeout(() => setScoreAnimations({ player1: false, player2: false }), 600);

    // Solo iniciar cuenta regresiva si no es el final del juego y no es modo bot vs bot
    if (!gameEnded && gameState.config.mode !== 'bot_vs_bot') {
      startNextRoundCountdown();
    }
  };

  const startNextRoundCountdown = () => {
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(() => {
            setCountdown(null);
            nextRound();
          }, 1000); // Pausa de 1 segundo después del 1
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const nextRound = () => {
    if (gameState.gameEnded) return;

    // Clear any pending timeouts
    if (revealTimeout) {
      clearTimeout(revealTimeout);
      setRevealTimeout(null);
    }
    if (nextRoundTimeout) {
      clearTimeout(nextRoundTimeout);
      setNextRoundTimeout(null);
    }

    setCountdown(null);

    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      player1: resetPlayerChoices(prev.player1),
      player2: resetPlayerChoices(prev.player2),
      isRevealed: false,
    }));
  };

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

  if (gameState.gameEnded) {
    const feedback = generateFeedback(gameState);
    return <FeedbackPanel feedback={feedback} gameState={gameState} />;
  }

  return (
    <div className="space-y-6">
      {/* Puntuaciones */}
      <div className="grid grid-cols-2 gap-6">
        <Card className={scoreAnimations.player1 ? 'score-glow' : ''}>
          <CardHeader className="text-center">
            <CardTitle>Puntaje {gameState.player1.name}</CardTitle>
            <div className={`text-3xl font-bold text-primary flex items-center justify-center gap-2 ${scoreAnimations.player1 ? 'coin-animation' : ''}`}>
              🪙 {gameState.player1.score}
            </div>
          </CardHeader>
        </Card>
        
        <Card className={scoreAnimations.player2 ? 'score-glow' : ''}>
          <CardHeader className="text-center">
            <CardTitle>Puntaje {gameState.player2.name}</CardTitle>
            <div className={`text-3xl font-bold text-primary flex items-center justify-center gap-2 ${scoreAnimations.player2 ? 'coin-animation' : ''}`}>
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
              {bothPlayersConfirmed(gameState.player1, gameState.player2) && !gameState.isRevealed && (
                <div className="text-lg font-semibold p-4 bg-secondary rounded-lg">
                  Revelando jugadas en unos segundos...
                </div>
              )}

              {gameState.isRevealed && (
                <div className="space-y-4">
                  <div className="text-lg font-semibold p-4 bg-secondary rounded-lg">
                    Resultado: {gameState.player1.choice === 'C' ? '🤝' : '⚡'} vs {gameState.player2.choice === 'C' ? '🤝' : '⚡'}
                    {gameState.player1.choice === 'C' && gameState.player2.choice === 'C' && ' - Cooperación mutua'}
                    {gameState.player1.choice === 'T' && gameState.player2.choice === 'T' && ' - Traición mutua'}
                    {gameState.player1.choice !== gameState.player2.choice && ' - Explotación'}
                  </div>
                  
                  {countdown !== null && (
                    <div className="text-center">
                      <div className="text-4xl font-bold countdown-animation mb-2">
                        {countdown}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Siguiente ronda en...
                      </div>
                    </div>
                  )}
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