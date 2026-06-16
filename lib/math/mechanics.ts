import { EtfConfig } from '@/lib/types';

export interface MechanicsAxisData {
  key: 'cost' | 'diversification' | 'size' | 'age' | 'weight';
  scores: Record<string, number>;
}

export function calculateMechanicsData(etfs: EtfConfig[]): {
  topEtfs: EtfConfig[];
  axesData: MechanicsAxisData[];
} {
  // Only take the top 5 ETFs by global weight to avoid clutter
  const topEtfs = [...etfs].sort((a, b) => b.globalWeight - a.globalWeight).slice(0, 5);

  if (topEtfs.length === 0) {
    return { topEtfs: [], axesData: [] };
  }

  // Calculate maximums for relative scaling
  const maxTer = Math.max(0.5, ...topEtfs.map((e) => e.ter));
  const maxHoldings = Math.max(500, ...topEtfs.map((e) => e.holdings.length));
  const maxAge = Math.max(10, ...topEtfs.map((e) => e.fundAge));
  const maxSize = Math.max(5000, ...topEtfs.map((e) => e.fundSize));
  const maxWeight = Math.max(20, ...topEtfs.map((e) => e.globalWeight));

  const axesKeys: MechanicsAxisData['key'][] = ['cost', 'diversification', 'size', 'age', 'weight'];

  const axesData: MechanicsAxisData[] = axesKeys.map((key) => {
    const scores: Record<string, number> = {};

    topEtfs.forEach((etf) => {
      let score = 0;
      switch (key) {
        case 'cost':
          score = Math.max(0, 100 - (etf.ter / maxTer) * 100);
          break;
        case 'diversification':
          score = (etf.holdings.length / maxHoldings) * 100;
          break;
        case 'size':
          score = (etf.fundSize / maxSize) * 100;
          break;
        case 'age':
          score = (etf.fundAge / maxAge) * 100;
          break;
        case 'weight':
          score = (etf.globalWeight / maxWeight) * 100;
          break;
      }
      scores[etf.name] = Math.round(score);
    });

    return { key, scores };
  });

  return { topEtfs, axesData };
}
