import { useMemo } from 'react';
import { EtfConfig } from '@/lib/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { aggregateBy, AggregationResult } from '@/lib/math';

export function useHoldingsAggregation(etfs: EtfConfig[]) {
  const { t } = useTranslation();

  return useMemo(() => {
    const formatData = (
      data: AggregationResult[],
      translator?: (key: string) => string,
      limit?: number
    ) => {
      const mapped = translator
        ? data.map((item) => ({ name: translator(item.name), value: item.value }))
        : data;

      if (limit && mapped.length > limit) {
        const top = mapped.slice(0, limit);
        const otherValue = mapped.slice(limit).reduce((acc, curr) => acc + curr.value, 0);
        top.push({ name: t.data.sectors.Other, value: otherValue });
        return top;
      }
      return mapped;
    };

    const rawGeo = aggregateBy(etfs, 'country');
    const rawSector = aggregateBy(etfs, 'sector');
    const rawCurrency = aggregateBy(etfs, 'currency');

    return {
      fullGeoData: formatData(
        rawGeo,
        (name) => t.data.countries[name as keyof typeof t.data.countries] || name
      ),
      geoData: formatData(
        rawGeo,
        (name) => t.data.countries[name as keyof typeof t.data.countries] || name,
        15 // top 15 countries for pie charts
      ),
      sectorData: formatData(
        rawSector,
        (name) => t.data.sectors[name as keyof typeof t.data.sectors] || name,
        11 // Show top 11 GICS sectors + Cash, anything beyond groups to Other
      ),
      currencyData: formatData(rawCurrency, undefined, 6),
    };
  }, [etfs, t]);
}
