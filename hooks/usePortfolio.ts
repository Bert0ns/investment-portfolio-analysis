import { useState, useEffect, useCallback } from 'react';
import { EtfConfig, Issuer, ReplicationMethod, UseOfProfit, Domicile } from '../lib/types';
import { getCsvParser } from '../lib/parsers';
import { toast } from 'sonner';
import { getItem, setItem, removeItem } from '../lib/indexeddb';

const STORAGE_KEY = 'etf_portfolio_data';

const DEFAULT_ETFS = [
  {
    name: 'Vanguard North America',
    issuer: 'Vanguard' as Issuer,
    isin: 'IE00BK5BQW10',
    ter: 0.08,
    path: '/static/example_csv/vanguard-north-america.csv',
    weight: 25,
    replicationMethod: 'Physical' as ReplicationMethod,
    fundSize: 2613,
    fundAge: 7,
    useOfProfit: 'Accumulating' as UseOfProfit,
    domicile: 'Ireland' as Domicile,
  },
  {
    name: 'Amundi Stoxx Europe 600',
    issuer: 'Amundi' as Issuer,
    isin: 'LU0908500753',
    ter: 0.07,
    path: '/static/example_csv/amundi-stoxx-europe-600.csv',
    weight: 30,
    replicationMethod: 'Physical' as ReplicationMethod,
    fundSize: 19220,
    fundAge: 13,
    useOfProfit: 'Accumulating' as UseOfProfit,
    domicile: 'Luxembourg' as Domicile,
  },
  {
    name: 'Amundi Prime Japan',
    issuer: 'Amundi' as Issuer,
    isin: 'LU2089238385',
    ter: 0.05,
    path: '/static/example_csv/amundi-prime-japan.csv',
    weight: 5,
    replicationMethod: 'Physical' as ReplicationMethod,
    fundSize: 570,
    fundAge: 6,
    useOfProfit: 'Accumulating' as UseOfProfit,
    domicile: 'Luxembourg' as Domicile,
  },
  {
    name: 'iShares MSCI EM',
    issuer: 'iShares' as Issuer,
    isin: 'IE00BKM4GZ66',
    ter: 0.18,
    path: '/static/example_csv/ishares-msci-em.csv',
    weight: 20,
    replicationMethod: 'Physical' as ReplicationMethod,
    fundSize: 36407,
    fundAge: 12,
    useOfProfit: 'Accumulating' as UseOfProfit,
    domicile: 'Ireland' as Domicile,
  },
  {
    name: 'iShares MSCI Pacific ex-Japan',
    issuer: 'iShares' as Issuer,
    isin: 'IE00B52MJY50',
    ter: 0.2,
    path: '/static/example_csv/ishares-msci-pacific.csv',
    weight: 20,
    replicationMethod: 'Physical' as ReplicationMethod,
    fundSize: 3131,
    fundAge: 16,
    useOfProfit: 'Accumulating' as UseOfProfit,
    domicile: 'Ireland' as Domicile,
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
              isin: def.isin,
              issuer: def.issuer,
              ter: def.ter,
              globalWeight: def.weight,
              holdings: result.holdings,
              replicationMethod: def.replicationMethod,
              fundSize: def.fundSize,
              fundAge: def.fundAge,
              useOfProfit: def.useOfProfit,
              domicile: def.domicile,
            });
          }
        } catch (err) {
          console.error(`Failed to load default ETF: ${def.name}`, err);
          toast.error('Failed to load default ETF', {
            description: `${def.name} could not be loaded.`,
          });
        }
      }
      setEtfs(loadedEtfs);
      toast.success('Defaults Loaded', {
        description: 'The default sample portfolio has been loaded.',
      });
    } finally {
      setIsLoaded(true);
      setIsLoadingDefaults(false);
    }
  }, []);

  // Load from indexedDB or fallback to local storage or defaults on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        let parsed = await getItem<EtfConfig[]>(STORAGE_KEY);

        // Migrate from localStorage if indexedDB is empty
        if (!parsed) {
          const ls = localStorage.getItem(STORAGE_KEY);
          if (ls) {
            try {
              parsed = JSON.parse(ls);
              localStorage.removeItem(STORAGE_KEY);
            } catch (e) {}
          }
        }

        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          // Auto-migrate legacy data that is missing the new fields
          parsed = parsed.map((etf: unknown) => {
            const typedEtf = etf as Partial<EtfConfig>;
            const defaultMatch = DEFAULT_ETFS.find((d) => d.name === typedEtf.name);
            return {
              ...typedEtf,
              id: typedEtf.id || crypto.randomUUID(),
              isin: typedEtf.isin || defaultMatch?.isin || '',
              replicationMethod:
                typedEtf.replicationMethod || defaultMatch?.replicationMethod || 'Physical',
              fundSize: typedEtf.fundSize || defaultMatch?.fundSize || 0,
              fundAge: typedEtf.fundAge || defaultMatch?.fundAge || 0,
              useOfProfit: typedEtf.useOfProfit || defaultMatch?.useOfProfit || 'Accumulating',
              domicile: typedEtf.domicile || defaultMatch?.domicile || 'Ireland',
            } as EtfConfig;
          });

          setEtfs(parsed as EtfConfig[]);
          setIsLoaded(true);
          return;
        }
      } catch (e) {
        console.error('Failed to load portfolio from storage', e);
        toast.error('Storage Error', {
          description: 'Failed to restore portfolio from local storage.',
        });
      }

      // If we reach here, local storage is empty or invalid. Load defaults!
      await loadDefaults();
    };

    loadInitialData();
  }, [loadDefaults]);

  // Save to indexedDB whenever etfs change
  useEffect(() => {
    if (isLoaded && !isLoadingDefaults) {
      setItem(STORAGE_KEY, etfs).catch((e) => console.error('Failed to save to IndexedDB', e));
    }
  }, [etfs, isLoaded, isLoadingDefaults]);

  const addEtf = useCallback((etf: EtfConfig) => {
    setEtfs((prev) => [...prev, etf]);
  }, []);

  const removeEtf = useCallback((id: string) => {
    setEtfs((prev) => prev.filter((etf) => etf.id !== id));
  }, []);

  const updateEtfWeight = useCallback((id: string, weight: number) => {
    setEtfs((prev) => {
      const etf = prev.find((e) => e.id === id);
      if (!etf || etf.globalWeight === weight) return prev;
      return prev.map((e) => (e.id === id ? { ...e, globalWeight: weight } : e));
    });
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
