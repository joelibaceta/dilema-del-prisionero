import { Round } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GameHistoryProps {
  rounds: Round[];
}

export default function GameHistory({ rounds }: GameHistoryProps) {
  if (rounds.length === 0) {
    return null;
  }

  const formatChoice = (choice: string) => {
    return choice === 'C' ? '🤝' : '⚡';
  };

  const formatPayout = (payout: number) => {
    return payout > 0 ? `+${payout}` : payout.toString();
  };

  const getPayoutColor = (payout: number) => {
    if (payout > 3) return 'text-green-600 font-semibold';
    if (payout === 0) return 'text-red-600';
    return 'text-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Juego</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">#</TableHead>
                <TableHead className="text-center">A</TableHead>
                <TableHead className="text-center">B</TableHead>
                <TableHead className="text-center">Pago A</TableHead>
                <TableHead className="text-center">Pago B</TableHead>
                <TableHead className="text-center">Acum. A</TableHead>
                <TableHead className="text-center">Acum. B</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rounds.map((round) => (
                <TableRow key={round.number}>
                  <TableCell className="text-center font-medium">
                    {round.number}
                  </TableCell>
                  <TableCell className="text-center text-2xl">
                    {formatChoice(round.player1Choice)}
                  </TableCell>
                  <TableCell className="text-center text-2xl">
                    {formatChoice(round.player2Choice)}
                  </TableCell>
                  <TableCell className={`text-center ${getPayoutColor(round.player1Payout)}`}>
                    {formatPayout(round.player1Payout)}
                  </TableCell>
                  <TableCell className={`text-center ${getPayoutColor(round.player2Payout)}`}>
                    {formatPayout(round.player2Payout)}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {round.player1Total}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {round.player2Total}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}