import { EtfConfig } from './types';

export interface AggregationResult {
  name: string;
  value: number;
}

export function aggregateBy(
  etfs: EtfConfig[],
  key: 'sector' | 'country' | 'currency'
): AggregationResult[] {
  const map = new Map<string, number>();

  for (const etf of etfs) {
    // global weight is 0-100, we use it to scale
    const globalMultiplier = etf.globalWeight / 100;

    for (const holding of etf.holdings) {
      // holding.weight is also typically 0-100
      const actualWeight = holding.weight * globalMultiplier;
      const groupingKey = holding[key] || 'Unknown';

      map.set(groupingKey, (map.get(groupingKey) || 0) + actualWeight);
    }
  }

  // Convert map to array and sort by value descending
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function aggregateTopHoldings(etfs: EtfConfig[], limit: number = 10): AggregationResult[] {
  const map = new Map<string, number>();

  for (const etf of etfs) {
    const globalMultiplier = etf.globalWeight / 100;

    for (const holding of etf.holdings) {
      const actualWeight = holding.weight * globalMultiplier;
      // We use ticker if available, else name
      const groupingKey = holding.ticker !== 'N/A' ? holding.ticker : holding.name;

      map.set(groupingKey, (map.get(groupingKey) || 0) + actualWeight);
    }
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function calculateAverageTer(etfs: EtfConfig[]): number {
  let totalWeight = 0;
  let weightedTer = 0;

  for (const etf of etfs) {
    totalWeight += etf.globalWeight;
    weightedTer += etf.ter * etf.globalWeight;
  }

  if (totalWeight === 0) return 0;
  return weightedTer / totalWeight;
}
