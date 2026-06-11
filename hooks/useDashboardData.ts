import { useMemo, useCallback } from 'react';
import { EtfConfig } from '../lib/types';
import { aggregateBy, aggregateTopHoldings, calculateAverageTer } from '../lib/math';

export function useDashboardData(etfs: EtfConfig[]) {
  const geoData = useMemo(() => aggregateBy(etfs, 'country'), [etfs]);
  const sectorData = useMemo(() => aggregateBy(etfs, 'sector').slice(0, 10), [etfs]);
  const currencyData = useMemo(() => aggregateBy(etfs, 'currency').slice(0, 5), [etfs]);

  const etfAllocationData = useMemo(() => {
    return etfs
      .filter((e) => e.globalWeight > 0)
      .map((e) => ({
        name: e.name,
        value: e.globalWeight,
      }))
      .sort((a, b) => b.value - a.value);
  }, [etfs]);

  const topHoldings = useMemo(() => aggregateTopHoldings(etfs, 10), [etfs]);
  const avgTer = useMemo(() => calculateAverageTer(etfs), [etfs]);

  const aggregateEtfProperty = useCallback(
    (property: keyof EtfConfig) => {
      const map = new Map<string, number>();
      for (const etf of etfs) {
        if (etf.globalWeight > 0) {
          const val = String(etf[property] || 'Unknown');
          map.set(val, (map.get(val) || 0) + etf.globalWeight);
        }
      }
      return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    },
    [etfs]
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
    const allHoldings = aggregateTopHoldings(etfs, 50);
    const result = [];
    let cumulative = 0;
    for (let i = 0; i < allHoldings.length; i++) {
      cumulative += allHoldings[i].value;
      result.push({
        name: `Top ${i + 1}`,
        value: cumulative,
      });
    }
    return result;
  }, [etfs]);

  const weightDistributionData = useMemo(() => {
    const allHoldings = aggregateTopHoldings(etfs, 10000);
    const bins = { '> 1%': 0, '0.5% - 1%': 0, '0.1% - 0.5%': 0, '< 0.1%': 0 };
    for (const h of allHoldings) {
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
  }, [etfs]);

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
