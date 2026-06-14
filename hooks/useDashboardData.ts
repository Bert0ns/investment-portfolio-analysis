import { useMemo, useCallback } from 'react';
import { EtfConfig } from '@/lib/types';
import {
  aggregateTopHoldings,
  calculateAverageTer,
  normalizeSector,
  normalizeCountry,
} from '@/lib/math';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function useDashboardData(etfs: EtfConfig[]) {
  const { t } = useTranslation();
  // Process all holdings once for efficiency
  const allHoldingsCache = useMemo(() => aggregateTopHoldings(etfs, 10000), [etfs]);

  // Aggregate country, sector, currency in a single pass to avoid looping over holdings 3 times
  const { geoData, sectorData, currencyData } = useMemo(() => {
    const geoMap = new Map<string, number>();
    const sectorMap = new Map<string, number>();
    const currencyMap = new Map<string, number>();

    etfs.forEach((etf) => {
      if (etf.globalWeight <= 0) return;
      etf.holdings.forEach((h) => {
        const holdingWeight = (h.weight * etf.globalWeight) / 100;
        if (holdingWeight <= 0) return;

        const country = normalizeCountry(String(h.country || 'Unknown'));
        const sector = normalizeSector(String(h.sector || 'Unknown'));
        const currency = String(h.currency || 'Unknown');

        geoMap.set(country, (geoMap.get(country) || 0) + holdingWeight);
        sectorMap.set(sector, (sectorMap.get(sector) || 0) + holdingWeight);
        currencyMap.set(currency, (currencyMap.get(currency) || 0) + holdingWeight);
      });
    });

    const formatData = (
      map: Map<string, number>,
      translator?: (key: string) => string,
      limit?: number
    ) => {
      const sorted = Array.from(map.entries())
        .map(([name, value]) => ({ name: translator ? translator(name) : name, value }))
        .sort((a, b) => b.value - a.value);

      if (limit && sorted.length > limit) {
        const top = sorted.slice(0, limit);
        const otherValue = sorted.slice(limit).reduce((acc, curr) => acc + curr.value, 0);
        top.push({ name: t.sectors.Other, value: otherValue });
        return top;
      }
      return sorted;
    };

    return {
      geoData: formatData(
        geoMap,
        (name) => t.countries[name as keyof typeof t.countries] || name,
        15 // top 15 countries
      ),
      sectorData: formatData(
        sectorMap,
        (name) => t.sectors[name as keyof typeof t.sectors] || name,
        11 // Show top 11 GICS sectors + Cash, anything beyond groups to Other
      ),
      currencyData: formatData(currencyMap, undefined, 6),
    };
  }, [etfs, t]);

  const etfAllocationData = useMemo(() => {
    return etfs
      .filter((e) => e.globalWeight > 0)
      .map((e) => ({
        name: e.name,
        value: e.globalWeight,
      }))
      .sort((a, b) => b.value - a.value);
  }, [etfs]);

  const topHoldings = useMemo(() => allHoldingsCache.slice(0, 10), [allHoldingsCache]);
  const avgTer = useMemo(() => calculateAverageTer(etfs), [etfs]);

  const aggregateEtfProperty = useCallback(
    (property: keyof EtfConfig) => {
      const map = new Map<string, number>();
      for (const etf of etfs) {
        if (etf.globalWeight > 0) {
          const val = String(etf[property] || t.dashboard.unknown);
          map.set(val, (map.get(val) || 0) + etf.globalWeight);
        }
      }
      return Array.from(map.entries())
        .map(([name, value]) => ({
          name: t.etfProperties[name as keyof typeof t.etfProperties] || name,
          value,
        }))
        .sort((a, b) => b.value - a.value);
    },
    [etfs, t]
  );

  const providerData = useMemo(() => aggregateEtfProperty('issuer'), [aggregateEtfProperty]);
  const replicationData = useMemo(
    () => aggregateEtfProperty('replicationMethod'),
    [aggregateEtfProperty]
  );
  const profitData = useMemo(() => aggregateEtfProperty('useOfProfit'), [aggregateEtfProperty]);
  const domicileData = useMemo(() => aggregateEtfProperty('domicile'), [aggregateEtfProperty]);

  const fundSizeData = useMemo(
    () =>
      etfs
        .filter((e) => e.globalWeight > 0)
        .map((e) => ({ name: e.name, value: e.fundSize || 0 }))
        .sort((a, b) => b.value - a.value),
    [etfs]
  );

  const fundAgeData = useMemo(
    () =>
      etfs
        .filter((e) => e.globalWeight > 0)
        .map((e) => ({ name: e.name, value: e.fundAge || 0 }))
        .sort((a, b) => b.value - a.value),
    [etfs]
  );

  const concentrationData = useMemo(() => {
    const top50 = allHoldingsCache.slice(0, 50);
    const result = [];
    let cumulative = 0;
    for (let i = 0; i < top50.length; i++) {
      cumulative += top50[i].value;
      result.push({
        name: `${t.dashboard.top} ${i + 1}`,
        value: cumulative,
      });
    }
    return result;
  }, [allHoldingsCache, t.dashboard.top]);

  const weightDistributionData = useMemo(() => {
    const bins = { '> 1%': 0, '0.5% - 1%': 0, '0.1% - 0.5%': 0, '< 0.1%': 0 };
    for (const h of allHoldingsCache) {
      if (h.value >= 1) bins['> 1%'] += h.value;
      else if (h.value >= 0.5) bins['0.5% - 1%'] += h.value;
      else if (h.value >= 0.1) bins['0.1% - 0.5%'] += h.value;
      else bins['< 0.1%'] += h.value;
    }
    return [
      { name: '> 1%', value: bins['> 1%'] },
      { name: '0.5% - 1%', value: bins['0.5% - 1%'] },
      { name: '0.1% - 0.5%', value: bins['0.1% - 0.5%'] },
      { name: '< 0.1%', value: bins['< 0.1%'] },
    ];
  }, [allHoldingsCache]);

  return {
    geoData,
    sectorData,
    currencyData,
    etfAllocationData,
    topHoldings,
    avgTer,
    providerData,
    replicationData,
    profitData,
    domicileData,
    fundSizeData,
    fundAgeData,
    concentrationData,
    weightDistributionData,
  };
}
