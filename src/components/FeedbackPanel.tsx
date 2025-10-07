import { FeedbackData, GameState } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import GameHistory from './GameHistory';

interface FeedbackPanelProps {
  feedback: FeedbackData;
  gameState: GameState;
}

export default function FeedbackPanel({ feedback, gameState }: FeedbackPanelProps) {
  const { metrics } = feedback;
  
  const winner = gameState.player1.score > gameState.player2.score 
    ? gameState.player1.name 
    : gameState.player2.score > gameState.player1.score 
    ? gameState.player2.name 
    : 'Empate';

  return (
    <div className="space-y-6">
      {/* Resultado Final */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🏆 Resultado Final</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <div className="text-lg font-semibold">{gameState.player1.name}</div>
              <div className="text-3xl font-bold text-primary">🪙 {gameState.player1.score}</div>
              {winner === gameState.player1.name && <Badge className="mt-2">Ganador</Badge>}
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{gameState.player2.name}</div>
              <div className="text-3xl font-bold text-primary">🪙 {gameState.player2.score}</div>
              {winner === gameState.player2.name && <Badge className="mt-2">Ganador</Badge>}
            </div>
          </div>
          
          {winner === 'Empate' && (
            <div className="text-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                🤝 Empate
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métricas */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Estadísticas de la Partida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-green-600">{metrics.mutualCooperations}</div>
              <div className="text-sm text-muted-foreground">Cooperaciones Mutuas</div>
            </div>
            
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-red-600">{metrics.mutualDefections}</div>
              <div className="text-sm text-muted-foreground">Traiciones Mutuas</div>
            </div>
            
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{metrics.player1Exploitations + metrics.player2Exploitations}</div>
              <div className="text-sm text-muted-foreground">Explotaciones Totales</div>
            </div>
            
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.longestCoopStreak}</div>
              <div className="text-sm text-muted-foreground">Racha Cooperativa Máxima</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-medium">{gameState.player1.name}</div>
              <div className="text-sm text-muted-foreground">
                Cooperación: {metrics.player1CoopRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Explotaciones realizadas: {metrics.player1Exploitations}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium">{gameState.player2.name}</div>
              <div className="text-sm text-muted-foreground">
                Cooperación: {metrics.player2CoopRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Explotaciones realizadas: {metrics.player2Exploitations}
              </div>
            </div>
          </div>

          {metrics.firstDefectionRound && (
            <div className="mt-4 text-center">
              <Badge variant="destructive">
                Primera traición en ronda {metrics.firstDefectionRound}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análisis y Reflexión */}
      <Card>
        <CardHeader>
          <CardTitle>🤔 Análisis y Reflexión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed">
              {feedback.text}
            </p>
          </div>
          
          {feedback.strategies.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <div className="font-medium mb-2">Estrategias utilizadas:</div>
                <div className="flex flex-wrap gap-2">
                  {feedback.strategies.map((strategy, index) => (
                    <Badge key={index} variant="outline">
                      {strategy.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Historial detallado */}
      <GameHistory rounds={gameState.rounds} />
    </div>
  );
}