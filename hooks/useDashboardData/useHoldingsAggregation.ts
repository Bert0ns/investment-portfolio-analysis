import { useMemo } from 'react';
import { EtfConfig } from '@/lib/types';
import { normalizeSector, normalizeCountry } from '@/lib/math';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function useHoldingsAggregation(etfs: EtfConfig[]) {
  const { t } = useTranslation();

  return useMemo(() => {
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
        top.push({ name: t.data.sectors.Other, value: otherValue });
        return top;
      }
      return sorted;
    };

    return {
      fullGeoData: formatData(
        geoMap,
        (name) => t.data.countries[name as keyof typeof t.data.countries] || name
      ),
      geoData: formatData(
        geoMap,
        (name) => t.data.countries[name as keyof typeof t.data.countries] || name,
        15 // top 15 countries for pie charts
      ),
      sectorData: formatData(
        sectorMap,
        (name) => t.data.sectors[name as keyof typeof t.data.sectors] || name,
        11 // Show top 11 GICS sectors + Cash, anything beyond groups to Other
      ),
      currencyData: formatData(currencyMap, undefined, 6),
    };
  }, [etfs, t]);
}
