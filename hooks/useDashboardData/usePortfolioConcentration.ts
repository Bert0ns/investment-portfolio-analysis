import { useMemo } from 'react';
import { EtfConfig } from '@/lib/types';
import { aggregateTopHoldings } from '@/lib/math';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function usePortfolioConcentration(etfs: EtfConfig[]) {
  const { t } = useTranslation();

  // Process all holdings once for efficiency
  const allHoldingsCache = useMemo(() => aggregateTopHoldings(etfs, 10000), [etfs]);

  const topHoldings = useMemo(() => allHoldingsCache.slice(0, 10), [allHoldingsCache]);

  const concentrationData = useMemo(() => {
    const top50 = allHoldingsCache.slice(0, 50);
    const result = [];
    let cumulative = 0;
    for (let i = 0; i < top50.length; i++) {
      cumulative += top50[i].value;
      result.push({
        name: `${t.pages.analyzer.dashboard.main.top} ${i + 1}`,
        value: cumulative,
      });
    }
    return result;
  }, [allHoldingsCache, t.pages.analyzer.dashboard.main.top]);

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
    topHoldings,
    concentrationData,
    weightDistributionData,
  };
}
