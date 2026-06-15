import { EtfConfig } from '@/lib/types';

export interface OverlapMatrixResult {
  etfId1: string;
  etfName1: string;
  etfId2: string;
  etfName2: string;
  overlapPercent: number; // 0 to 100
}

export interface UniquenessResult {
  etfId: string;
  etfName: string;
  uniquenessPercent: number; // 0 to 100
}

function getHoldingKey(holding: { ticker: string; name: string }): string {
  return holding.ticker !== 'N/A' ? holding.ticker : holding.name;
}

// Builds a fast lookup map of holding key -> weight for a single ETF
function buildWeightMap(etf: EtfConfig): Map<string, number> {
  const map = new Map<string, number>();
  for (const holding of etf.holdings) {
    const key = getHoldingKey(holding);
    // Sum weights in case of duplicate tickers in the same ETF (rare, but possible)
    map.set(key, (map.get(key) || 0) + holding.weight);
  }
  return map;
}

export function calculatePairwiseOverlap(etf1: EtfConfig, etf2: EtfConfig): number {
  if (etf1.id === etf2.id) return 100;

  const map1 = buildWeightMap(etf1);
  const map2 = buildWeightMap(etf2);

  let overlap = 0;
  for (const [key, weight1] of map1.entries()) {
    const weight2 = map2.get(key);
    if (weight2 !== undefined) {
      overlap += Math.min(weight1, weight2);
    }
  }

  return overlap;
}

export function generateOverlapMatrix(etfs: EtfConfig[]): OverlapMatrixResult[] {
  const results: OverlapMatrixResult[] = [];

  // Precompute weight maps to avoid redundant map building in nested loops
  const etfMaps = etfs.map((etf) => ({
    etf,
    map: buildWeightMap(etf),
  }));

  for (let i = 0; i < etfMaps.length; i++) {
    for (let j = i + 1; j < etfMaps.length; j++) {
      const { etf: etf1, map: map1 } = etfMaps[i];
      const { etf: etf2, map: map2 } = etfMaps[j];

      let overlap = 0;
      for (const [key, weight1] of map1.entries()) {
        const weight2 = map2.get(key);
        if (weight2 !== undefined) {
          overlap += Math.min(weight1, weight2);
        }
      }

      results.push({
        etfId1: etf1.id,
        etfName1: etf1.name,
        etfId2: etf2.id,
        etfName2: etf2.name,
        overlapPercent: overlap,
      });

      results.push({
        etfId1: etf2.id,
        etfName1: etf2.name,
        etfId2: etf1.id,
        etfName2: etf1.name,
        overlapPercent: overlap,
      });
    }

    // Self-overlap
    results.push({
      etfId1: etfMaps[i].etf.id,
      etfName1: etfMaps[i].etf.name,
      etfId2: etfMaps[i].etf.id,
      etfName2: etfMaps[i].etf.name,
      overlapPercent: 100,
    });
  }

  return results;
}

export function calculateUniqueness(etfs: EtfConfig[]): UniquenessResult[] {
  if (etfs.length <= 1) {
    return etfs.map((etf) => ({
      etfId: etf.id,
      etfName: etf.name,
      uniquenessPercent: 100,
    }));
  }

  const results: UniquenessResult[] = [];
  const etfMaps = etfs.map((etf) => buildWeightMap(etf));

  for (let i = 0; i < etfs.length; i++) {
    const targetEtf = etfs[i];
    const targetMap = etfMaps[i];

    // Build the "Union" of all other ETFs
    const unionMap = new Map<string, number>();
    for (let j = 0; j < etfs.length; j++) {
      if (i === j) continue;
      const otherMap = etfMaps[j];
      for (const [key, weight] of otherMap.entries()) {
        const existing = unionMap.get(key) || 0;
        unionMap.set(key, Math.max(existing, weight));
      }
    }

    // Calculate overlap with the union
    let overlapWithUnion = 0;
    for (const [key, weight] of targetMap.entries()) {
      const unionWeight = unionMap.get(key);
      if (unionWeight !== undefined) {
        overlapWithUnion += Math.min(weight, unionWeight);
      }
    }

    // Uniqueness is what's left
    const uniquenessPercent = Math.max(0, 100 - overlapWithUnion);

    results.push({
      etfId: targetEtf.id,
      etfName: targetEtf.name,
      uniquenessPercent,
    });
  }

  return results.sort((a, b) => b.uniquenessPercent - a.uniquenessPercent);
}
