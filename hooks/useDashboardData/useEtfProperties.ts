import { useMemo, useCallback } from 'react';
import { EtfConfig } from '@/lib/types';
import { calculateAverageTer } from '@/lib/math';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function useEtfProperties(etfs: EtfConfig[]) {
  const { t } = useTranslation();

  const etfAllocationData = useMemo(() => {
    return etfs
      .filter((e) => e.globalWeight > 0)
      .map((e) => ({
        name: e.name,
        value: e.globalWeight,
      }))
      .sort((a, b) => b.value - a.value);
  }, [etfs]);

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

  return {
    etfAllocationData,
    avgTer,
    providerData,
    replicationData,
    profitData,
    domicileData,
    fundSizeData,
    fundAgeData,
  };
}
