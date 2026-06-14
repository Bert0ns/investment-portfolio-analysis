import { renderHook } from '@testing-library/react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { EtfConfig } from '@/lib/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';

jest.mock('../lib/i18n/LanguageContext', () => ({
  useTranslation: jest.fn(),
}));

describe('useDashboardData', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: {
        dashboard: {
          unknown: 'Unknown',
          top: 'Top',
        },
        sectors: {
          'Information Technology': 'Information Technology',
          Unknown: 'Unknown',
        },
        countries: {
          'United States': 'United States',
          Unknown: 'Unknown',
        },
        etfProperties: {
          Physical: 'Physical',
          Synthetic: 'Synthetic',
          Optimized: 'Optimized',
          Accumulating: 'Accumulating',
          Distributing: 'Distributing',
          Ireland: 'Ireland',
          Luxembourg: 'Luxembourg',
          US: 'US',
        },
      },
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
});
