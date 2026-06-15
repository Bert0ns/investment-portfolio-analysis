import { EtfConfig } from '@/lib/types';
import { normalizeCountry } from './normalization';

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

function initSearchQuery(query: string): string | null {
  if (!query || query.trim() === '') return null;
  return query.toLowerCase().trim();
}

function updateHoldingBreakdown(
  companiesList: HoldingSearchResult[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  holding: any,
  etf: EtfConfig,
  contribution: number
) {
  const compKey = holding.ticker !== 'N/A' ? holding.ticker : holding.name;
  let comp = companiesList.find((c) =>
    c.ticker !== 'N/A' ? c.ticker === compKey : c.name === compKey
  );
  if (!comp) {
    comp = { ticker: holding.ticker, name: holding.name, totalWeight: 0, breakdown: [] };
    companiesList.push(comp);
  }
  comp.totalWeight += contribution;

  let compEtfBreak = comp.breakdown.find((b) => b.etfId === etf.id);
  if (!compEtfBreak) {
    compEtfBreak = { etfId: etf.id, etfName: etf.name, contribution: 0, internalWeight: 0 };
    comp.breakdown.push(compEtfBreak);
  }
  compEtfBreak.contribution += contribution;
  compEtfBreak.internalWeight += holding.weight;
  return comp;
}

function iterateHoldings(
  etfs: EtfConfig[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (etf: EtfConfig, holding: any, globalMultiplier: number) => void
) {
  for (const etf of etfs) {
    if (etf.globalWeight <= 0) continue;
    const globalMultiplier = etf.globalWeight / 100;
    for (const holding of etf.holdings) {
      callback(etf, holding, globalMultiplier);
    }
  }
}

export function searchHoldings(etfs: EtfConfig[], query: string): HoldingSearchResult[] {
  const lowerQuery = initSearchQuery(query);
  if (!lowerQuery) return [];
  const resultsMap = new Map<string, HoldingSearchResult>();

  iterateHoldings(etfs, (etf, holding, globalMultiplier) => {
    const matchName = holding.name.toLowerCase().includes(lowerQuery);
    const matchTicker =
      holding.ticker !== 'N/A' && holding.ticker.toLowerCase().includes(lowerQuery);

    if (!matchName && !matchTicker) return;

    const key = holding.ticker !== 'N/A' ? holding.ticker : holding.name;
    const contribution = holding.weight * globalMultiplier;

    let result = resultsMap.get(key);
    const companiesList = result ? [result] : [];
    result = updateHoldingBreakdown(companiesList, holding, etf, contribution);
    if (!resultsMap.has(key)) {
      resultsMap.set(key, result);
    }
  });

  return Array.from(resultsMap.values()).sort((a, b) => b.totalWeight - a.totalWeight);
}

export interface CountrySearchResult {
  countryName: string;
  totalWeight: number;
  etfBreakdown: {
    etfId: string;
    etfName: string;
    contribution: number;
  }[];
  companies: HoldingSearchResult[];
}

export function searchByCountry(etfs: EtfConfig[], query: string): CountrySearchResult[] {
  const lowerQuery = initSearchQuery(query);
  if (!lowerQuery) return [];
  const resultsMap = new Map<string, CountrySearchResult>();

  iterateHoldings(etfs, (etf, holding, globalMultiplier) => {
    const canonCountry = normalizeCountry(String(holding.country || 'Unknown'));
    if (canonCountry === 'Unknown' || !canonCountry.toLowerCase().includes(lowerQuery)) return;

    let result = resultsMap.get(canonCountry);
    if (!result) {
      result = { countryName: canonCountry, totalWeight: 0, etfBreakdown: [], companies: [] };
      resultsMap.set(canonCountry, result);
    }

    const contribution = holding.weight * globalMultiplier;
    result.totalWeight += contribution;

    // Update ETF breakdown
    let etfBreak = result.etfBreakdown.find((b) => b.etfId === etf.id);
    if (!etfBreak) {
      etfBreak = { etfId: etf.id, etfName: etf.name, contribution: 0 };
      result.etfBreakdown.push(etfBreak);
    }
    etfBreak.contribution += contribution;

    // Update Companies breakdown
    updateHoldingBreakdown(result.companies, holding, etf, contribution);
  });

  return Array.from(resultsMap.values())
    .map((res) => {
      res.etfBreakdown.sort((a, b) => b.contribution - a.contribution);
      res.companies.sort((a, b) => b.totalWeight - a.totalWeight);
      return res;
    })
    .sort((a, b) => b.totalWeight - a.totalWeight);
}
