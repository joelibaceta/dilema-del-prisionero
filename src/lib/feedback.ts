import { GameMetrics, Round, BotStrategy, FeedbackData, GameState } from './types';

export function calculateMetrics(rounds: Round[]): GameMetrics {
  if (rounds.length === 0) {
    return {
      player1CoopRate: 0,
      player2CoopRate: 0,
      mutualCooperations: 0,
      mutualDefections: 0,
      player1Exploitations: 0,
      player2Exploitations: 0,
      longestCoopStreak: 0,
    };
  }

  const player1Coops = rounds.filter(r => r.player1Choice === 'C').length;
  const player2Coops = rounds.filter(r => r.player2Choice === 'C').length;
  const mutualCooperations = rounds.filter(r => r.player1Choice === 'C' && r.player2Choice === 'C').length;
  const mutualDefections = rounds.filter(r => r.player1Choice === 'T' && r.player2Choice === 'T').length;
  const player1Exploitations = rounds.filter(r => r.player1Choice === 'T' && r.player2Choice === 'C').length;
  const player2Exploitations = rounds.filter(r => r.player1Choice === 'C' && r.player2Choice === 'T').length;

  const firstDefectionRound = rounds.find(r => r.player1Choice === 'T' || r.player2Choice === 'T')?.number;

  let longestCoopStreak = 0;
  let currentStreak = 0;
  for (const round of rounds) {
    if (round.player1Choice === 'C' && round.player2Choice === 'C') {
      currentStreak++;
      longestCoopStreak = Math.max(longestCoopStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    player1CoopRate: (player1Coops / rounds.length) * 100,
    player2CoopRate: (player2Coops / rounds.length) * 100,
    mutualCooperations,
    mutualDefections,
    player1Exploitations,
    player2Exploitations,
    firstDefectionRound,
    longestCoopStreak,
  };
}

export function generateFeedback(gameState: GameState): FeedbackData {
  const metrics = calculateMetrics(gameState.rounds);
  const strategies: BotStrategy[] = [];
  
  if (gameState.player1.strategy) strategies.push(gameState.player1.strategy);
  if (gameState.player2.strategy) strategies.push(gameState.player2.strategy);

  const text = generateFeedbackText(metrics, strategies, gameState);

  return { metrics, strategies, text };
}

function generateFeedbackText(
  metrics: GameMetrics,
  strategies: BotStrategy[],
  gameState: GameState
): string {
  const parts: string[] = [];

  // Identificar estrategias presentes
  const strategyDescriptions = strategies.map(s => {
    switch (s) {
      case 'tit_for_tat': return 'Tit for Tat (reciprocidad inmediata)';
      case 'grim_trigger': return 'Gatillo Severo (tolerancia cero)';
      case 'always_defect': return 'Siempre Traicionar (maximización agresiva)';
      case 'always_cooperate': return 'Siempre Cooperar (confianza total)';
      case 'random': return 'Aleatorio (comportamiento impredecible)';
      default: return 'Estrategia desconocida';
    }
  });

  if (strategyDescriptions.length > 0) {
    parts.push(`Estrategias en juego: ${strategyDescriptions.join(' vs ')}.`);
  }

  // Analizar patrones observados
  const totalRounds = gameState.rounds.length;
  const coopRate = (metrics.player1CoopRate + metrics.player2CoopRate) / 2;
  
  if (metrics.mutualCooperations === totalRounds) {
    parts.push('Se observó cooperación perfecta durante toda la partida, maximizando el beneficio mutuo.');
  } else if (metrics.mutualDefections > totalRounds * 0.7) {
    parts.push('Predominó la escalada de traiciones mutuas, reduciendo significativamente los beneficios para ambos.');
  } else if (metrics.longestCoopStreak >= 3) {
    parts.push(`Se estableció cooperación sostenida (${metrics.longestCoopStreak} rondas consecutivas), demostrando la construcción de confianza.`);
  } else if (coopRate < 30) {
    parts.push('La falta de cooperación llevó a resultados subóptimos para ambos participantes.');
  }

  // Explicaciones causales específicas por estrategia
  if (strategies.includes('always_defect')) {
    parts.push('La estrategia agresiva maximizó ganancias a corto plazo pero degradó la confianza y cooperación futura.');
  }

  if (strategies.includes('tit_for_tat')) {
    if (metrics.mutualCooperations > 0) {
      parts.push('Tit for Tat logró estabilizar la cooperación al responder proporcionalmente, castigando traiciones pero permitiendo reconciliación.');
    } else {
      parts.push('Tit for Tat no pudo establecer cooperación debido al comportamiento del oponente.');
    }
  }

  if (strategies.includes('grim_trigger') && metrics.firstDefectionRound) {
    parts.push(`El Gatillo Severo cortó permanentemente la cooperación tras la primera traición en la ronda ${metrics.firstDefectionRound}.`);
  }

  if (strategies.includes('always_cooperate') && (metrics.player1Exploitations > 0 || metrics.player2Exploitations > 0)) {
    parts.push('La estrategia de cooperación total fue explotada, demostrando la vulnerabilidad de la confianza ciega.');
  }

  // Contrafactual
  if (totalRounds < 20 && metrics.mutualDefections > metrics.mutualCooperations) {
    parts.push('Con más rondas, las estrategias cooperativas podrían haber tenido oportunidad de establecer reciprocidad.');
  }

  // Lección práctica
  if (metrics.longestCoopStreak > 0) {
    parts.push('En equipos reales, construir confianza gradual y responder proporcionalmente a las acciones del otro fomenta la colaboración duradera.');
  } else {
    parts.push('En contextos colaborativos, la falta de confianza mutua puede llevar a resultados donde todos pierden, incluso cuando la cooperación beneficiaría a todos.');
  }

  return parts.join(' ');
}