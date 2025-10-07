import { Player, Choice, GameMode } from '@/lib/types';
import { STRATEGY_NAMES } from '@/lib/game-logic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Handshake, Lightning } from '@phosphor-icons/react';

interface PlayerPanelProps {
  player: Player;
  onChoice: (choice: Choice) => void;
  disabled: boolean;
  gameMode: GameMode;
}

export default function PlayerPanel({ player, onChoice, disabled, gameMode }: PlayerPanelProps) {
  const isBot = player.isBot;
  const hasChoice = player.choice !== undefined;
  const isConfirmed = player.confirmed;

  const getStatusMessage = () => {
    if (isBot && isConfirmed) {
      return 'Confirmado ✓';
    } else if (isBot) {
      return 'Esperando decisión del bot...';
    } else if (isConfirmed) {
      return 'Confirmado ✓';
    } else {
      return 'Pendiente...';
    }
  };

  const getStatusColor = () => {
    if (isConfirmed) return 'text-green-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className={`${isConfirmed ? 'border-green-500' : ''}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {player.name}
          {isBot && (
            <Badge variant="secondary">
              {STRATEGY_NAMES[player.strategy!]}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isBot && !disabled && !isConfirmed && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => onChoice('C')}
                className="btn-cooperate h-16 text-lg font-semibold"
                disabled={disabled}
              >
                <Handshake size={24} className="mr-2" />
                Cooperar (C)
              </Button>
              
              <Button
                onClick={() => onChoice('T')}
                className="btn-defect h-16 text-lg font-semibold"
                disabled={disabled}
              >
                <Lightning size={24} className="mr-2" />
                Traicionar (T)
              </Button>
            </div>
          </div>
        )}

        {!isBot && hasChoice && isConfirmed && (
          <div className="text-center p-6 bg-secondary rounded-lg">
            <div className="text-2xl mb-2">
              {player.choice === 'C' ? '🤝' : '⚡'}
            </div>
            <div className="font-medium">
              {player.choice === 'C' ? 'Cooperar' : 'Traicionar'}
            </div>
          </div>
        )}

        {isBot && (
          <div className="text-center p-6 bg-muted rounded-lg">
            <div className="text-lg font-medium mb-2">Bot</div>
            <div className="text-sm text-muted-foreground">
              Estrategia: {STRATEGY_NAMES[player.strategy!]}
            </div>
            {isConfirmed && hasChoice && (
              <div className="mt-4">
                <div className="text-2xl mb-2">
                  {player.choice === 'C' ? '🤝' : '⚡'}
                </div>
                <div className="font-medium">
                  {player.choice === 'C' ? 'Cooperar' : 'Traicionar'}
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`text-center ${getStatusColor()}`}>
          {getStatusMessage()}
        </div>

        {/* Historial reciente */}
        {player.history.length > 0 && (
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">Historial reciente:</div>
            <div className="flex flex-wrap gap-1 justify-center">
              {player.history.slice(-10).map((choice, index) => (
                <Badge
                  key={index}
                  variant={choice === 'C' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {choice === 'C' ? '🤝' : '⚡'}
                </Badge>
              ))}
              {player.history.length > 10 && (
                <Badge variant="outline" className="text-xs">
                  +{player.history.length - 10}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}