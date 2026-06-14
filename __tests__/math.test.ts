import {
  aggregateBy,
  calculateAverageTer,
  aggregateTopHoldings,
  searchHoldings,
  generateNetworkData,
} from '../lib/math';
import { EtfConfig } from '@/lib/types';

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

  describe('aggregateBy', () => {
    describe('Sector Normalization & Edge Cases', () => {
      it('normalizes various IT sector names into "Information Technology"', () => {
        const results = aggregateBy(mockEtfs, 'sector');
        const itSector = results.find((r) => r.name === 'Information Technology');

        // ETF 1: AAPL (10% of 50% = 5) + MSFT (5% of 50% = 2.5) = 7.5
        // ETF 2: AAPL (4% of 50% = 2) = 2
        // Total IT = 9.5
        expect(itSector?.value).toBeCloseTo(9.5);
      });

      it('normalizes various other sectors correctly', () => {
        const customEtfs: EtfConfig[] = [
          {
            ...mockEtfs[0],
            globalWeight: 100,
            holdings: [
              {
                name: 'A',
                ticker: 'A',
                weight: 10,
                sector: 'finanziari',
                country: 'US',
                currency: 'USD',
              },
              {
                name: 'B',
                ticker: 'B',
                weight: 10,
                sector: 'salute',
                country: 'US',
                currency: 'USD',
              },
              {
                name: 'C',
                ticker: 'C',
                weight: 10,
                sector: ' beni di consumo ',
                country: 'US',
                currency: 'USD',
              },
              {
                name: 'D',
                ticker: 'D',
                weight: 10,
                sector: 'pubblica utilità',
                country: 'US',
                currency: 'USD',
              },
              {
                name: 'E',
                ticker: 'E',
                weight: 10,
                sector: 'immobiliare',
                country: 'US',
                currency: 'USD',
              },
            ],
          },
        ];
        const results = aggregateBy(customEtfs, 'sector');

        expect(results.find((r) => r.name === 'Financials')?.value).toBe(10);
        expect(results.find((r) => r.name === 'Healthcare')?.value).toBe(10);
        expect(results.find((r) => r.name === 'Consumer Staples')?.value).toBe(10);
        expect(results.find((r) => r.name === 'Utilities')?.value).toBe(10);
        expect(results.find((r) => r.name === 'Real Estate')?.value).toBe(10);
      });

      it('handles empty, Unknown, and N/A sectors', () => {
        const customEtfs: EtfConfig[] = [
          {
            ...mockEtfs[0],
            globalWeight: 100,
            holdings: [
              { name: 'A', ticker: 'A', weight: 10, sector: '', country: 'US', currency: 'USD' },
              {
                name: 'B',
                ticker: 'B',
                weight: 10,
                sector: 'Unknown',
                country: 'US',
                currency: 'USD',
              },
              { name: 'C', ticker: 'C', weight: 10, sector: 'N/A', country: 'US', currency: 'USD' },
            ],
          },
        ];
        const results = aggregateBy(customEtfs, 'sector');
        expect(results.find((r) => r.name === 'Unknown')?.value).toBe(30);
      });

      it('capitalizes fallback sectors', () => {
        const customEtfs: EtfConfig[] = [
          {
            ...mockEtfs[0],
            globalWeight: 100,
            holdings: [
              {
                name: 'A',
                ticker: 'A',
                weight: 10,
                sector: 'random sector',
                country: 'US',
                currency: 'USD',
              },
            ],
          },
        ];
        const results = aggregateBy(customEtfs, 'sector');
        expect(results.find((r) => r.name === 'Random sector')?.value).toBe(10);
      });
    });

    describe('General Aggregation Edge Cases', () => {
      it('aggregates by country correctly', () => {
        const results = aggregateBy(mockEtfs, 'country');
        const usCountry = results.find((r) => r.name === 'US');

        // ETF 1: US (15% of 50% = 7.5)
        // ETF 2: US (4% of 50% = 2)
        // Total US = 9.5
        expect(usCountry?.value).toBeCloseTo(9.5);
      });

      it('handles empty ETF arrays', () => {
        const results = aggregateBy([], 'sector');
        expect(results).toEqual([]);
      });

      it('handles ETFs with empty holdings', () => {
        const emptyHoldingsEtfs: EtfConfig[] = [
          { ...mockEtfs[0], holdings: [] },
          { ...mockEtfs[1], holdings: [] },
        ];
        const results = aggregateBy(emptyHoldingsEtfs, 'sector');
        expect(results).toEqual([]);
      });

      it('handles missing property gracefully (fallback to Unknown)', () => {
        const customEtfs: EtfConfig[] = [
          {
            ...mockEtfs[0],
            globalWeight: 100,
            holdings: [
              // @ts-expect-error - explicitly testing missing properties
              { name: 'A', ticker: 'A', weight: 10 },
            ],
          },
        ];
        const results = aggregateBy(customEtfs, 'country');
        expect(results.find((r) => r.name === 'Unknown')?.value).toBe(10);
      });

      it('handles global weight 0', () => {
        const zeroWeightEtfs = mockEtfs.map((e) => ({ ...e, globalWeight: 0 }));
        const results = aggregateBy(zeroWeightEtfs, 'sector');
        // all values should be 0
        expect(results.every((r) => r.value === 0)).toBe(true);
      });
    });
  });

  describe('aggregateTopHoldings', () => {
    it('merges overlapping holdings from different ETFs', () => {
      const topHoldings = aggregateTopHoldings(mockEtfs, 10);
      const apple = topHoldings.find((h) => h.name === 'AAPL');

      // ETF 1: 5%, ETF 2: 2% -> Total 7%
      expect(apple?.value).toBeCloseTo(7);
    });

    it('falls back to holding name if ticker is N/A', () => {
      const customEtfs: EtfConfig[] = [
        {
          ...mockEtfs[0],
          globalWeight: 100,
          holdings: [
            {
              name: 'No Ticker Corp',
              ticker: 'N/A',
              weight: 10,
              sector: 'IT',
              country: 'US',
              currency: 'USD',
            },
          ],
        },
      ];
      const topHoldings = aggregateTopHoldings(customEtfs, 10);
      expect(topHoldings.find((h) => h.name === 'No Ticker Corp')?.value).toBe(10);
    });

    it('returns empty array when ETFs array is empty', () => {
      const topHoldings = aggregateTopHoldings([], 10);
      expect(topHoldings).toEqual([]);
    });

    it('respects the limit', () => {
      const customEtfs: EtfConfig[] = [
        {
          ...mockEtfs[0],
          globalWeight: 100,
          holdings: [
            { name: 'A', ticker: 'A', weight: 50, sector: 'IT', country: 'US', currency: 'USD' },
            { name: 'B', ticker: 'B', weight: 30, sector: 'IT', country: 'US', currency: 'USD' },
            { name: 'C', ticker: 'C', weight: 20, sector: 'IT', country: 'US', currency: 'USD' },
          ],
        },
      ];

      const topHoldings = aggregateTopHoldings(customEtfs, 2);
      expect(topHoldings.length).toBe(2);
      expect(topHoldings[0].name).toBe('A');
      expect(topHoldings[1].name).toBe('B');
    });

    it('handles limit 0 by returning empty array', () => {
      const topHoldings = aggregateTopHoldings(mockEtfs, 0);
      expect(topHoldings).toEqual([]);
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

    it('returns 0 if the ETF array is empty', () => {
      expect(calculateAverageTer([])).toBe(0);
    });

    it('handles negative weights safely (if possible)', () => {
      const negativeWeightEtfs: EtfConfig[] = [
        { ...mockEtfs[0], globalWeight: 50, ter: 0.1 },
        { ...mockEtfs[1], globalWeight: -20, ter: 0.2 },
      ];
      // Total weight: 30
      // Weighted TER: 50 * 0.1 + (-20) * 0.2 = 5 - 4 = 1
      // Average: 1 / 30 = 0.0333...
      const avgTer = calculateAverageTer(negativeWeightEtfs);
      expect(avgTer).toBeCloseTo(1 / 30);
    });

    it('handles zero TER', () => {
      const zeroTerEtfs: EtfConfig[] = [
        { ...mockEtfs[0], globalWeight: 50, ter: 0 },
        { ...mockEtfs[1], globalWeight: 50, ter: 0 },
      ];
      expect(calculateAverageTer(zeroTerEtfs)).toBe(0);
    });
  });

  describe('searchHoldings', () => {
    it('returns empty array if query is empty or whitespace', () => {
      expect(searchHoldings(mockEtfs, '')).toEqual([]);
      expect(searchHoldings(mockEtfs, '   ')).toEqual([]);
    });

    it('returns empty array if no matching holding is found', () => {
      expect(searchHoldings(mockEtfs, 'NonExistent')).toEqual([]);
    });

    it('finds holding by ticker (case insensitive) and aggregates across ETFs', () => {
      // AAPL is in ETF 1 (10%) and ETF 2 (4%). Both ETFs have 50% global weight.
      const results = searchHoldings(mockEtfs, 'aapl');
      expect(results.length).toBe(1);
      expect(results[0].ticker).toBe('AAPL');
      expect(results[0].name).toBe('Apple');
      expect(results[0].totalWeight).toBeCloseTo(7); // (10 * 0.5) + (4 * 0.5) = 7
      expect(results[0].breakdown.length).toBe(2);
      expect(results[0].breakdown[0].etfId).toBe('1');
      expect(results[0].breakdown[0].contribution).toBeCloseTo(5);
    });

    it('finds holding by name and ignores ETFs with 0 global weight', () => {
      const customEtfs: EtfConfig[] = [
        ...mockEtfs,
        {
          ...mockEtfs[0],
          id: '3',
          globalWeight: 0,
          holdings: [
            {
              name: 'Apple',
              ticker: 'AAPL',
              weight: 50,
              sector: 'IT',
              country: 'US',
              currency: 'USD',
            },
          ],
        },
      ];
      // Search for "apple"
      const results = searchHoldings(customEtfs, 'Apple');
      expect(results.length).toBe(1);
      // The 3rd ETF should be ignored, so the result should still be exactly 7
      expect(results[0].totalWeight).toBeCloseTo(7);
      expect(results[0].breakdown.length).toBe(2);
    });

    it('handles holding with N/A ticker by falling back to name', () => {
      const customEtfs: EtfConfig[] = [
        {
          ...mockEtfs[0],
          globalWeight: 100,
          holdings: [
            {
              name: 'Unknown Corp',
              ticker: 'N/A',
              weight: 10,
              sector: 'IT',
              country: 'US',
              currency: 'USD',
            },
          ],
        },
      ];
      const results = searchHoldings(customEtfs, 'unknown');
      expect(results.length).toBe(1);
      expect(results[0].ticker).toBe('N/A');
      expect(results[0].name).toBe('Unknown Corp');
    });
  });

  describe('generateNetworkData', () => {
    it('generates nodes for ETFs and top holdings, and creates links', () => {
      const limit = 2;
      const data = generateNetworkData(mockEtfs, limit);

      // ETFs + up to 2 top holdings. mockEtfs has 2 ETFs.
      // Top 2 holdings: AAPL (7%), NESN (3% - 6*0.5), MSFT (2.5% - 5*0.5) => Top 2 are AAPL and NESN.
      expect(data.nodes.filter((n) => n.group === 'etf').length).toBe(2);
      expect(data.nodes.filter((n) => n.group === 'holding').length).toBe(2); // AAPL and NESN

      // Check links: ETF1 -> AAPL, ETF2 -> AAPL, ETF2 -> NESN. (ETF1 -> MSFT is omitted because MSFT is not top 2)
      expect(data.links.length).toBe(3);

      const etf1Links = data.links.filter((l) => l.source === '1');
      expect(etf1Links.length).toBe(1);
      expect(etf1Links[0].target).toBe('AAPL'); // Uses key which is ticker 'AAPL'

      const etf2Links = data.links.filter((l) => l.source === '2');
      expect(etf2Links.length).toBe(2);
      expect(etf2Links.some((l) => l.target === 'AAPL')).toBe(true);
      expect(etf2Links.some((l) => l.target === 'NESN')).toBe(true);
    });

    it('ignores ETFs with global weight 0', () => {
      const zeroWeightEtfs = mockEtfs.map((e) => ({ ...e, globalWeight: 0 }));
      const data = generateNetworkData(zeroWeightEtfs, 10);
      expect(data.nodes.length).toBe(0);
      expect(data.links.length).toBe(0);
    });
  });
});
