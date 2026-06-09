import { aggregateBy, calculateAverageTer, aggregateTopHoldings } from '../lib/math';
import { EtfConfig } from '../lib/types';

describe('Math Utilities', () => {
  const mockEtfs: EtfConfig[] = [
    {
      id: '1',
      name: 'Test ETF 1',
      issuer: 'iShares',
      ter: 0.1,
      globalWeight: 50,
      replicationMethod: 'Physical',
      useOfProfit: 'Accumulating',
      domicile: 'Ireland',
      fundAge: 5,
      fundSize: 1000,
      holdings: [
        { name: 'Apple', ticker: 'AAPL', weight: 10, sector: 'IT', country: 'US', currency: 'USD' },
        {
          name: 'Microsoft',
          ticker: 'MSFT',
          weight: 5,
          sector: 'Technology',
          country: 'US',
          currency: 'USD',
        },
      ],
    },
    {
      id: '2',
      name: 'Test ETF 2',
      issuer: 'Vanguard',
      ter: 0.2,
      globalWeight: 50,
      replicationMethod: 'Physical',
      useOfProfit: 'Distributing',
      domicile: 'US',
      fundAge: 10,
      fundSize: 2000,
      holdings: [
        {
          name: 'Apple',
          ticker: 'AAPL',
          weight: 4,
          sector: 'Information Technology',
          country: 'US',
          currency: 'USD',
        },
        {
          name: 'Nestle',
          ticker: 'NESN',
          weight: 6,
          sector: 'Consumer Staples',
          country: 'CH',
          currency: 'CHF',
        },
      ],
    },
  ];

  describe('aggregateBy (Sector Normalization)', () => {
    it('normalizes various IT sector names into "Information Technology"', () => {
      const results = aggregateBy(mockEtfs, 'sector');
      const itSector = results.find((r) => r.name === 'Information Technology');

      // ETF 1: AAPL (10% of 50% = 5) + MSFT (5% of 50% = 2.5) = 7.5
      // ETF 2: AAPL (4% of 50% = 2) = 2
      // Total IT = 9.5
      expect(itSector?.value).toBeCloseTo(9.5);
    });

    it('aggregates by country correctly', () => {
      const results = aggregateBy(mockEtfs, 'country');
      const usCountry = results.find((r) => r.name === 'US');

      // ETF 1: US (15% of 50% = 7.5)
      // ETF 2: US (4% of 50% = 2)
      // Total US = 9.5
      expect(usCountry?.value).toBeCloseTo(9.5);
    });
  });

  describe('aggregateTopHoldings', () => {
    it('merges overlapping holdings from different ETFs', () => {
      const topHoldings = aggregateTopHoldings(mockEtfs, 10);
      const apple = topHoldings.find((h) => h.name === 'AAPL');

      // ETF 1: 5%, ETF 2: 2% -> Total 7%
      expect(apple?.value).toBeCloseTo(7);
    });
  });

  describe('calculateAverageTer', () => {
    it('calculates the weighted average TER correctly', () => {
      const avgTer = calculateAverageTer(mockEtfs);
      // (50 * 0.1 + 50 * 0.2) / 100 = 0.15
      expect(avgTer).toBeCloseTo(0.15);
    });

    it('returns 0 if total weight is 0', () => {
      const zeroWeightEtfs = mockEtfs.map((e) => ({ ...e, globalWeight: 0 }));
      expect(calculateAverageTer(zeroWeightEtfs)).toBe(0);
    });
  });
});
