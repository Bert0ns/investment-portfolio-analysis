import { useState, useEffect, useCallback } from 'react';
import { EtfConfig, Issuer } from '../lib/types';
import { getCsvParser } from '../lib/parsers';

const STORAGE_KEY = 'etf_portfolio_data';

const DEFAULT_ETFS = [
  {
    name: 'Vanguard North America',
    issuer: 'Vanguard' as Issuer,
    ter: 0.08,
    path: '/static/example_csv/vanguard-north-america.csv',
    weight: 40,
  },
  {
    name: 'Amundi Stoxx Europe 600',
    issuer: 'Amundi' as Issuer,
    ter: 0.07,
    path: '/static/example_csv/amundi-stoxx-europe-600.csv',
    weight: 30,
  },
  {
    name: 'Amundi Prime Japan',
    issuer: 'Amundi' as Issuer,
    ter: 0.05,
    path: '/static/example_csv/amundi-prime-japan.csv',
    weight: 10,
  },
  {
    name: 'iShares MSCI EM',
    issuer: 'iShares' as Issuer,
    ter: 0.18,
    path: '/static/example_csv/ishares-msci-em.csv',
    weight: 15,
  },
  {
    name: 'iShares MSCI Pacific ex-Japan',
    issuer: 'iShares' as Issuer,
    ter: 0.2,
    path: '/static/example_csv/ishares-msci-pacific.csv',
    weight: 5,
  },
];

export function usePortfolio() {
  const [etfs, setEtfs] = useState<EtfConfig[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);

  const loadDefaults = useCallback(async () => {
    setIsLoadingDefaults(true);
    try {
      const loadedEtfs: EtfConfig[] = [];
      for (const def of DEFAULT_ETFS) {
        try {
          const response = await fetch(def.path);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const blob = await response.blob();
          const file = new File([blob], def.path.split('/').pop() || 'file.csv', {
            type: 'text/csv',
          });

          const parser = getCsvParser(def.issuer);
          const result = await parser.parse(file);

          if (result.holdings.length > 0) {
            loadedEtfs.push({
              id: Math.random().toString(36).substring(7),
              name: def.name,
              issuer: def.issuer,
              ter: def.ter,
              globalWeight: def.weight,
              holdings: result.holdings,
            });
          }
        } catch (err) {
          console.error(`Failed to load default ETF: ${def.name}`, err);
        }
      }
      setEtfs(loadedEtfs);
    } finally {
      setIsLoaded(true);
      setIsLoadingDefaults(false);
    }
  }, []);

  // Load from local storage or defaults on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.length > 0) {
            setEtfs(parsed);
            setIsLoaded(true);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load portfolio from local storage', e);
      }

      // If we reach here, local storage is empty or invalid. Load defaults!
      await loadDefaults();
    };

    loadInitialData();
  }, [loadDefaults]);

  // Save to local storage whenever etfs change
  useEffect(() => {
    if (isLoaded && !isLoadingDefaults) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(etfs));
    }
  }, [etfs, isLoaded, isLoadingDefaults]);

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
    isLoadingDefaults,
    totalWeight,
    addEtf,
    removeEtf,
    updateEtfWeight,
    loadDefaults,
  };
}
