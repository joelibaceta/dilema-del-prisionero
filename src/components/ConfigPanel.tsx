import { useState } from 'react';
import { GameConfig, GameMode, BotStrategy, PayoffMatrix } from '@/lib/types';
import { DEFAULT_PAYOFF_MATRIX, STRATEGY_NAMES, STRATEGY_DESCRIPTIONS } from '@/lib/game-logic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CaretDown } from '@phosphor-icons/react';

interface ConfigPanelProps {
  onStartGame: (config: GameConfig) => void;
}

export default function ConfigPanel({ onStartGame }: ConfigPanelProps) {
  const [mode, setMode] = useState<GameMode>('human_vs_bot');
  const [rounds, setRounds] = useState(10);
  const [initialCoins, setInitialCoins] = useState(1000);
  const [seed, setSeed] = useState(12345);
  const [pCoop, setPCoop] = useState(0.5);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [player1Name, setPlayer1Name] = useState('Jugador A');
  const [player2Name, setPlayer2Name] = useState('Jugador B');
  const [player1Strategy, setPlayer1Strategy] = useState<BotStrategy>('random');
  const [player2Strategy, setPlayer2Strategy] = useState<BotStrategy>('random');
  
  const [payoffMatrix, setPayoffMatrix] = useState<PayoffMatrix>(DEFAULT_PAYOFF_MATRIX);

  const handleStart = () => {
    const config: GameConfig = {
      mode,
      rounds,
      initialCoins,
      seed,
      pCoop,
      payoffMatrix,
      player1: {
        id: 'player1',
        name: player1Name,
        isBot: mode === 'bot_vs_bot' || (mode === 'human_vs_bot' && false),
        strategy: mode === 'bot_vs_bot' ? player1Strategy : (mode === 'human_vs_bot' ? undefined : undefined),
      },
      player2: {
        id: 'player2',
        name: player2Name,
        isBot: mode !== 'human_vs_human',
        strategy: mode === 'bot_vs_bot' ? player2Strategy : (mode === 'human_vs_bot' ? player2Strategy : undefined),
      },
    };

    onStartGame(config);
  };

  const updatePayoff = (key: keyof PayoffMatrix, index: 0 | 1, value: string) => {
    const numValue = parseInt(value) || 0;
    setPayoffMatrix(prev => ({
      ...prev,
      [key]: index === 0 
        ? [numValue, prev[key][1]] 
        : [prev[key][0], numValue]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de la Partida</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={mode} onValueChange={(value) => setMode(value as GameMode)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="human_vs_bot">Humano vs Bot</TabsTrigger>
            <TabsTrigger value="bot_vs_bot">Bot vs Bot</TabsTrigger>
            <TabsTrigger value="human_vs_human">Humano vs Humano</TabsTrigger>
          </TabsList>

          <TabsContent value="human_vs_bot" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="player1-name">Nombre del Jugador</Label>
                <Input
                  id="player1-name"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bot-strategy">Estrategia del Bot</Label>
                <Select value={player2Strategy} onValueChange={(value) => setPlayer2Strategy(value as BotStrategy)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STRATEGY_NAMES).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <div className="font-medium">{name}</div>
                          <div className="text-sm text-muted-foreground">
                            {STRATEGY_DESCRIPTIONS[key as BotStrategy]}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bot_vs_bot" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bot1-strategy">Estrategia Bot A</Label>
                <Select value={player1Strategy} onValueChange={(value) => setPlayer1Strategy(value as BotStrategy)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STRATEGY_NAMES).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bot2-strategy">Estrategia Bot B</Label>
                <Select value={player2Strategy} onValueChange={(value) => setPlayer2Strategy(value as BotStrategy)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STRATEGY_NAMES).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="human_vs_human" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="player1-name-hh">Nombre Jugador A</Label>
                <Input
                  id="player1-name-hh"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="player2-name-hh">Nombre Jugador B</Label>
                <Input
                  id="player2-name-hh"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Configuración Avanzada
              <CaretDown className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rounds">Número de Rondas</Label>
                <Input
                  id="rounds"
                  type="number"
                  min="1"
                  max="100"
                  value={rounds}
                  onChange={(e) => setRounds(parseInt(e.target.value) || 10)}
                />
              </div>
              <div>
                <Label htmlFor="initial-coins">Monedas Iniciales</Label>
                <Input
                  id="initial-coins"
                  type="number"
                  min="0"
                  value={initialCoins}
                  onChange={(e) => setInitialCoins(parseInt(e.target.value) || 1000)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seed">Semilla RNG</Label>
                <Input
                  id="seed"
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value) || 12345)}
                />
              </div>
              <div>
                <Label>Probabilidad de Cooperar (Random)</Label>
                <div className="px-2">
                  <Slider
                    value={[pCoop]}
                    onValueChange={(value) => setPCoop(value[0])}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1 text-center">
                    {Math.round(pCoop * 100)}%
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>Matriz de Pagos</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Cooperar vs Cooperar (C,C)</div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={payoffMatrix.CC[0]}
                      onChange={(e) => updatePayoff('CC', 0, e.target.value)}
                      placeholder="Jugador A"
                    />
                    <Input
                      type="number"
                      value={payoffMatrix.CC[1]}
                      onChange={(e) => updatePayoff('CC', 1, e.target.value)}
                      placeholder="Jugador B"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Cooperar vs Traicionar (C,T)</div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={payoffMatrix.CT[0]}
                      onChange={(e) => updatePayoff('CT', 0, e.target.value)}
                      placeholder="Jugador A"
                    />
                    <Input
                      type="number"
                      value={payoffMatrix.CT[1]}
                      onChange={(e) => updatePayoff('CT', 1, e.target.value)}
                      placeholder="Jugador B"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Traicionar vs Cooperar (T,C)</div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={payoffMatrix.TC[0]}
                      onChange={(e) => updatePayoff('TC', 0, e.target.value)}
                      placeholder="Jugador A"
                    />
                    <Input
                      type="number"
                      value={payoffMatrix.TC[1]}
                      onChange={(e) => updatePayoff('TC', 1, e.target.value)}
                      placeholder="Jugador B"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Traicionar vs Traicionar (T,T)</div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={payoffMatrix.TT[0]}
                      onChange={(e) => updatePayoff('TT', 0, e.target.value)}
                      placeholder="Jugador A"
                    />
                    <Input
                      type="number"
                      value={payoffMatrix.TT[1]}
                      onChange={(e) => updatePayoff('TT', 1, e.target.value)}
                      placeholder="Jugador B"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button onClick={handleStart} className="w-full" size="lg">
          Iniciar Partida
        </Button>
      </CardContent>
    </Card>
  );
}