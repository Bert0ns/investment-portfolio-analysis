import { EtfConfig } from './types';

export interface AggregationResult {
  name: string;
  value: number;
}

const SECTOR_MAPPINGS: { matchers: RegExp[]; result: string }[] = [
  { matchers: [/^it$/, /tech/, /tecnologia/, /informatica/], result: 'Information Technology' },
  { matchers: [/finanziari/, /financial/, /finance/], result: 'Financials' },
  { matchers: [/industr/, /industrali/], result: 'Industrials' },
  { matchers: [/health/, /sanità/, /sanita/, /cura/, /salute/], result: 'Healthcare' },
  {
    matchers: [/discrezionali/, /discretionary/, /cyclical/, /consumer services/],
    result: 'Consumer Discretionary',
  },
  {
    matchers: [/staples/, /beni di consumo/, /defensive/, /consumer goods/],
    result: 'Consumer Staples',
  },
  { matchers: [/material/, /materie prime/], result: 'Materials' },
  { matchers: [/energ/], result: 'Energy' },
  { matchers: [/utilit/, /pubblica utilit\u00e0/], result: 'Utilities' },
  { matchers: [/communication/, /telecom/, /comunicazion/], result: 'Communication Services' },
  { matchers: [/real estate/, /immobiliare/, /property/], result: 'Real Estate' },
];

function normalizeSector(sector: string): string {
  if (!sector || sector === 'Unknown' || sector === 'N/A') return 'Unknown';

  const s = sector.trim().toLowerCase();

  for (const mapping of SECTOR_MAPPINGS) {
    if (mapping.matchers.some((matcher) => matcher.test(s))) {
      return mapping.result;
    }
  }

  // Return the original sector with title case as fallback
  return sector.charAt(0).toUpperCase() + sector.slice(1);
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
      let groupingKey = holding[key] || 'Unknown';

      if (key === 'sector') {
        groupingKey = normalizeSector(groupingKey);
      }

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

export interface SavingsPlanProjectionPoint {
  year: number;
  invested: number;
  value: number;
}

export interface SavingsPlanResult {
  chartData: SavingsPlanProjectionPoint[];
  finalTotalValue: number;
  finalInvested: number;
}

export function calculateSavingsPlanProjection(
  initialInvestment: number,
  monthlyContribution: number,
  years: number,
  expectedReturn: number,
  stopAccumulatingMonths: number
): SavingsPlanResult {
  const data: SavingsPlanProjectionPoint[] = [];
  const monthlyRate = expectedReturn / 100 / 12;
  const totalMonths = years * 12;
  const clampedStopMonths = Math.min(stopAccumulatingMonths, totalMonths);

  let currentTotal = initialInvestment;
  let currentInvested = initialInvestment;

  data.push({
    year: 0,
    invested: currentInvested,
    value: Math.round(currentTotal),
  });

  for (let m = 1; m <= totalMonths; m++) {
    const currentContribution = m <= clampedStopMonths ? monthlyContribution : 0;
    currentTotal = currentTotal * (1 + monthlyRate) + currentContribution;
    currentInvested += currentContribution;

    if (m % 12 === 0 || m === totalMonths) {
      const yearPoint = data.find((d) => d.year === m / 12);
      if (!yearPoint) {
        data.push({
          year: m / 12,
          invested: currentInvested,
          value: Math.round(currentTotal),
        });
      }
    }
  }

  return {
    chartData: data,
    finalTotalValue: currentTotal,
    finalInvested: currentInvested,
  };
}

export interface HoldingSearchResult {
  ticker: string;
  name: string;
  totalWeight: number; // Global weight percentage across the entire portfolio
  breakdown: {
    etfId: string;
    etfName: string;
    contribution: number; // Contribution to the global portfolio
    internalWeight: number; // Weight inside the specific ETF
  }[];
}

export function searchHoldings(etfs: EtfConfig[], query: string): HoldingSearchResult[] {
  if (!query || query.trim() === '') return [];

  const lowerQuery = query.toLowerCase().trim();
  // Map of normalized key (either Ticker or Name) to the result object
  const resultsMap = new Map<string, HoldingSearchResult>();

  for (const etf of etfs) {
    if (etf.globalWeight <= 0) continue;
    const globalMultiplier = etf.globalWeight / 100;

    for (const holding of etf.holdings) {
      const matchName = holding.name.toLowerCase().includes(lowerQuery);
      const matchTicker =
        holding.ticker !== 'N/A' && holding.ticker.toLowerCase().includes(lowerQuery);

      if (!matchName && !matchTicker) continue;

      const key = holding.ticker !== 'N/A' ? holding.ticker : holding.name;

      let result = resultsMap.get(key);
      if (!result) {
        result = { ticker: holding.ticker, name: holding.name, totalWeight: 0, breakdown: [] };
        resultsMap.set(key, result);
      }

      const contribution = holding.weight * globalMultiplier;
      result.totalWeight += contribution;

      let breakdown = result.breakdown.find((b) => b.etfId === etf.id);
      if (!breakdown) {
        breakdown = { etfId: etf.id, etfName: etf.name, contribution: 0, internalWeight: 0 };
        result.breakdown.push(breakdown);
      }

      breakdown.contribution += contribution;
      breakdown.internalWeight += holding.weight;
    }
  }

  // Convert to array and sort by highest total weight
  return Array.from(resultsMap.values()).sort((a, b) => b.totalWeight - a.totalWeight);
}

export interface NetworkNode {
  id: string;
  name: string;
  group: 'etf' | 'holding';
  val: number; // For node sizing
  color?: string;
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number; // For link thickness
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export function generateNetworkData(etfs: EtfConfig[], limit: number = 100): NetworkGraphData {
  const nodes: NetworkNode[] = [];
  const links: NetworkLink[] = [];

  // 1. Add all active ETFs as central nodes
  const activeEtfs = etfs.filter((e) => e.globalWeight > 0);
  activeEtfs.forEach((etf) => {
    nodes.push({
      id: etf.id,
      name: etf.name,
      group: 'etf',
      val: etf.globalWeight,
      // Different colors for different issuers/ETFs if we want, or handle in the chart
    });
  });

  // 2. Calculate top N holdings across the portfolio to avoid 10,000 nodes
  const topHoldings = aggregateTopHoldings(activeEtfs, limit);
  const topHoldingKeys = new Set(topHoldings.map((h) => h.name));

  // 3. For each top holding, add a node
  topHoldings.forEach((h) => {
    nodes.push({
      id: h.name, // The unique key used in aggregateTopHoldings is either ticker or name
      name: h.name,
      group: 'holding',
      val: h.value,
    });
  });

  // 4. Create links connecting ETFs to these top holdings
  for (const etf of activeEtfs) {
    for (const holding of etf.holdings) {
      const key = holding.ticker !== 'N/A' ? holding.ticker : holding.name;
      if (topHoldingKeys.has(key)) {
        links.push({
          source: etf.id,
          target: key,
          value: holding.weight, // Inner weight to represent link strength
        });
      }
    }
  }

  return { nodes, links };
}
