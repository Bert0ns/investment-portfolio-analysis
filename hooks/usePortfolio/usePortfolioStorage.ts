import { useState, useEffect, useCallback } from 'react';
import { EtfConfig } from '@/lib/types';
import { getCsvParser } from '@/lib/parsers';
import { toast } from 'sonner';
import { getItem, setItem, removeItem } from '@/lib/indexeddb';
import { generateId } from '@/lib/utils';
import { importPortfolioFromFile } from '@/lib/utils/portfolio-sharing';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { DEFAULT_ETFS, STORAGE_KEY } from './constants';

function isValidEtfConfig(data: unknown): data is EtfConfig {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.name === 'string' &&
    typeof d.globalWeight === 'number' &&
    d.globalWeight >= 0 &&
    d.globalWeight <= 100 &&
    Array.isArray(d.holdings)
  );
}

export function usePortfolioStorage(
  etfs: EtfConfig[],
  setEtfs: React.Dispatch<React.SetStateAction<EtfConfig[]>>
) {
  const { t } = useTranslation();
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
              id: generateId(),
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
          toast.error(t.components.common.notifications.loadDefaultsFailed, {
            description: `${def.name} ${t.components.common.notifications.loadDefaultsFailedDesc}`,
          });
        }
      }
      setEtfs(loadedEtfs);

      // Clear all UI state explicitly (components are unmounted during loading, so events won't work)
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'dashboard_active_tab',
          'visuals_active',
          'visuals_globe_rotating',
          'visuals_network_limit',
          'visuals_network_physics',
          'visuals_network_overlap',
          'visuals_moneyflow_limit',
          'voronoi_max_nodes',
          'deepdive_active_tab',
          'deepdive_query',
          'geographic_query',
          'savings_initial',
          'savings_monthly',
          'savings_years',
          'savings_return',
          'savings_stop',
          'camera_exposure_globe',
          'camera_cityscape',
          'camera_network_graph',
          'camera_moneyflow_v2',
        ];
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      }

      toast.success(t.components.common.notifications.defaultsLoaded, {
        description: t.components.common.notifications.defaultsLoadedDesc,
      });
    } finally {
      setIsLoaded(true);
      setIsLoadingDefaults(false);
    }
  }, [t, setEtfs]);

  // Load from indexedDB or fallback to local storage or defaults on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Check for shared file from Web Share Target API first
      try {
        const sharedFile = await getItem<{ file: File; timestamp: number }>(
          'shared_portfolio_file'
        );
        if (sharedFile && sharedFile.file) {
          // Prevent loading an old stale file (older than 5 minutes)
          if (Date.now() - sharedFile.timestamp < 300000) {
            try {
              const sharedEtfs = await importPortfolioFromFile(sharedFile.file);
              if (sharedEtfs && sharedEtfs.length > 0) {
                setEtfs(sharedEtfs);
                setIsLoaded(true);
                await removeItem('shared_portfolio_file');
                toast.success(t.components.common.notifications.defaultsLoaded, {
                  description: `Imported shared file: ${sharedFile.file.name}`,
                });
                return;
              }
            } catch (err) {
              console.error('Failed to parse shared file:', err);
            }
          }
          await removeItem('shared_portfolio_file');
        }
      } catch (e) {
        console.error('Failed to read shared_portfolio_file', e);
      }

      try {
        let parsed = await getItem<unknown[]>(STORAGE_KEY);

        // Migrate from localStorage if indexedDB is empty
        if (!parsed) {
          const ls = localStorage.getItem(STORAGE_KEY);
          if (ls) {
            try {
              parsed = JSON.parse(ls);
              localStorage.removeItem(STORAGE_KEY);
            } catch {
              // Ignore
            }
          }
        }

        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          // Auto-migrate legacy data that is missing the new fields
          const migrated = parsed.map((etf: unknown) => {
            const typedEtf = etf as Partial<EtfConfig>;
            const defaultMatch = DEFAULT_ETFS.find((d) => d.name === typedEtf.name);
            return {
              ...typedEtf,
              id: typedEtf.id ?? generateId(),
              isin: typedEtf.isin ?? defaultMatch?.isin ?? '',
              replicationMethod:
                typedEtf.replicationMethod ?? defaultMatch?.replicationMethod ?? 'Physical',
              fundSize: typedEtf.fundSize ?? defaultMatch?.fundSize ?? 0,
              fundAge: typedEtf.fundAge ?? defaultMatch?.fundAge ?? 0,
              useOfProfit: typedEtf.useOfProfit ?? defaultMatch?.useOfProfit ?? 'Accumulating',
              domicile: typedEtf.domicile ?? defaultMatch?.domicile ?? 'Ireland',
            } as EtfConfig;
          });

          const validEtfs = migrated.filter(isValidEtfConfig);
          if (validEtfs.length > 0) {
            setEtfs(validEtfs);
            setIsLoaded(true);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load portfolio from storage', e);
        toast.error(t.components.common.notifications.storageError, {
          description: t.components.common.notifications.storageErrorDesc,
        });
      }

      // If we reach here, local storage is empty or invalid. Load defaults!
      await loadDefaults();
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to indexedDB whenever etfs change
  useEffect(() => {
    if (isLoaded && !isLoadingDefaults) {
      setItem(STORAGE_KEY, etfs).catch((e) => console.error('Failed to save to IndexedDB', e));
    }
  }, [etfs, isLoaded, isLoadingDefaults]);

  return {
    isLoaded,
    isLoadingDefaults,
    loadDefaults,
  };
}
