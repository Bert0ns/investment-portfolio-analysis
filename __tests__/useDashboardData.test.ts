import { renderHook } from '@testing-library/react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { EtfConfig } from '@/lib/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { dictionaries } from '@/lib/i18n';

jest.mock('../lib/i18n/LanguageContext', () => ({
  useTranslation: jest.fn(),
}));

describe('useDashboardData', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: dictionaries.en,
    });
  });

  it('calculates weightDistributionData correctly for all bins', () => {
    const etfs: EtfConfig[] = [
      {
        id: '1',
        name: 'Test ETF',
        issuer: 'Vanguard',
        isin: 'IE0012345678',
        ter: 0.1,
        globalWeight: 100, // 100% of portfolio
        replicationMethod: 'Physical',
        useOfProfit: 'Accumulating',
        domicile: 'Ireland',
        fundAge: 5,
        fundSize: 1000,
        holdings: [
          // h.value = weight * globalWeight / 100
          {
            name: 'Apple',
            ticker: 'AAPL',
            weight: 1.5,
            sector: 'IT',
            country: 'US',
            currency: 'USD',
          }, // > 1%
          {
            name: 'Microsoft',
            ticker: 'MSFT',
            weight: 0.75,
            sector: 'IT',
            country: 'US',
            currency: 'USD',
          }, // 0.5% - 1%
          {
            name: 'Google',
            ticker: 'GOOGL',
            weight: 0.25,
            sector: 'IT',
            country: 'US',
            currency: 'USD',
          }, // 0.1% - 0.5%
          {
            name: 'Tesla',
            ticker: 'TSLA',
            weight: 0.05,
            sector: 'IT',
            country: 'US',
            currency: 'USD',
          }, // < 0.1%
        ],
      },
    ];

    const { result } = renderHook(() => useDashboardData(etfs));

    const dist = result.current.weightDistributionData;
    expect(dist).toEqual([
      { name: '> 1%', value: 1.5 },
      { name: '0.5% - 1%', value: 0.75 },
      { name: '0.1% - 0.5%', value: 0.25 },
      { name: '< 0.1%', value: 0.05 },
    ]);
  });

  it('groups tail countries and sectors into "Other" when exceeding limits', () => {
    const etfs: EtfConfig[] = [
      {
        id: 'limit-test',
        name: 'Limit Test',
        issuer: 'Vanguard',
        isin: 'IE00LIMIT',
        ter: 0.1,
        globalWeight: 100,
        replicationMethod: 'Physical',
        useOfProfit: 'Accumulating',
        domicile: 'Ireland',
        fundAge: 5,
        fundSize: 1000,
        holdings: Array.from({ length: 20 }).map((_, i) => ({
          name: `Company ${i}`,
          ticker: `TICK${i}`,
          weight: 100 / 20,
          sector: `Sector ${i}`,
          country: `Country ${i}`,
          currency: 'USD',
        })),
      },
    ];

    const { result } = renderHook(() => useDashboardData(etfs));

    // sector limit is 11, so 11 items + 1 "Other" = 12 items
    expect(result.current.sectorData.length).toBe(12);
    expect(result.current.sectorData[11].name).toBe(dictionaries.en.data.sectors.Other);
    expect(result.current.sectorData[11].value).toBeCloseTo((100 / 20) * (20 - 11));

    // country limit is 15, so 15 items + 1 "Other" = 16 items
    expect(result.current.geoData.length).toBe(16);
    expect(result.current.geoData[15].name).toBe(dictionaries.en.data.sectors.Other); // the word 'Other' is fetched from data.sectors
  });
});
