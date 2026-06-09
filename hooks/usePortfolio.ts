import { useState, useEffect, useCallback } from 'react';
import { EtfConfig } from '../lib/types';

const STORAGE_KEY = 'etf_portfolio_data';

export function usePortfolio() {
  const [etfs, setEtfs] = useState<EtfConfig[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEtfs(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load portfolio from local storage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever etfs change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(etfs));
    }
  }, [etfs, isLoaded]);

  const addEtf = useCallback((etf: EtfConfig) => {
    setEtfs((prev) => [...prev, etf]);
  }, []);

  const removeEtf = useCallback((id: string) => {
    setEtfs((prev) => prev.filter((etf) => etf.id !== id));
  }, []);

  const updateEtfWeight = useCallback((id: string, weight: number) => {
    setEtfs((prev) => prev.map((etf) => (etf.id === id ? { ...etf, globalWeight: weight } : etf)));
  }, []);

  const totalWeight = etfs.reduce((sum, etf) => sum + etf.globalWeight, 0);

  return {
    etfs,
    isLoaded,
    totalWeight,
    addEtf,
    removeEtf,
    updateEtfWeight,
  };
}
