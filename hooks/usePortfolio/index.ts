import { useMemo } from 'react';
import { usePortfolioState } from './usePortfolioState';
import { usePortfolioStorage } from './usePortfolioStorage';

export function usePortfolio() {
  const { etfs, setEtfs, addEtf, removeEtf, updateEtfWeight } = usePortfolioState();
  const { isLoaded, isLoadingDefaults, loadDefaults } = usePortfolioStorage(etfs, setEtfs);

  const totalWeight = useMemo(() => etfs.reduce((sum, etf) => sum + etf.globalWeight, 0), [etfs]);

  return {
    etfs,
    setEtfs,
    isLoaded,
    isLoadingDefaults,
    totalWeight,
    addEtf,
    removeEtf,
    updateEtfWeight,
    loadDefaults,
  };
}
