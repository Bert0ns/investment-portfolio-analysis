import { EtfConfig } from '@/lib/types';
import { useHoldingsAggregation } from './useHoldingsAggregation';
import { usePortfolioConcentration } from './usePortfolioConcentration';
import { useEtfProperties } from './useEtfProperties';

export function useDashboardData(etfs: EtfConfig[]) {
  const holdingsAggregation = useHoldingsAggregation(etfs);
  const portfolioConcentration = usePortfolioConcentration(etfs);
  const etfProperties = useEtfProperties(etfs);

  return {
    ...holdingsAggregation,
    ...portfolioConcentration,
    ...etfProperties,
  };
}
