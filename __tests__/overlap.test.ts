import {
  calculatePairwiseOverlap,
  generateOverlapMatrix,
  calculateUniqueness,
} from '@/lib/math/overlap';
import { EtfConfig } from '@/lib/types';

describe('Overlap Math Engine', () => {
  const etf1: EtfConfig = {
    id: 'etf1',
    name: 'S&P 500',
    isin: 'US0001',
    issuer: 'Vanguard',
    ter: 0.07,
    replicationMethod: 'Physical',
    useOfProfit: 'Accumulating',
    fundSize: 1000,
    fundAge: 10,
    domicile: 'US',
    holdings: [
      {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        weight: 6,
        sector: 'IT',
        currency: 'USD',
        country: 'US',
      },
      {
        ticker: 'MSFT',
        name: 'Microsoft Corp.',
        weight: 5,
        sector: 'IT',
        currency: 'USD',
        country: 'US',
      },
      {
        ticker: 'AMZN',
        name: 'Amazon.com Inc.',
        weight: 3,
        sector: 'Consumer',
        currency: 'USD',
        country: 'US',
      },
    ],
    globalWeight: 50,
  };

  const etf2: EtfConfig = {
    id: 'etf2',
    name: 'Nasdaq 100',
    isin: 'US0002',
    issuer: 'Amundi',
    ter: 0.2,
    replicationMethod: 'Physical',
    useOfProfit: 'Accumulating',
    fundSize: 500,
    fundAge: 15,
    domicile: 'US',
    holdings: [
      {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        weight: 10,
        sector: 'IT',
        currency: 'USD',
        country: 'US',
      },
      {
        ticker: 'MSFT',
        name: 'Microsoft Corp.',
        weight: 8,
        sector: 'IT',
        currency: 'USD',
        country: 'US',
      },
      {
        ticker: 'TSLA',
        name: 'Tesla Inc.',
        weight: 4,
        sector: 'Consumer',
        currency: 'USD',
        country: 'US',
      },
    ],
    globalWeight: 50,
  };

  const etf3: EtfConfig = {
    id: 'etf3',
    name: 'Emerging Markets',
    isin: 'IE0003',
    issuer: 'iShares',
    ter: 0.18,
    replicationMethod: 'Physical',
    useOfProfit: 'Accumulating',
    fundSize: 200,
    fundAge: 8,
    domicile: 'Ireland',
    holdings: [
      { ticker: 'TSM', name: 'TSMC', weight: 6, sector: 'IT', currency: 'USD', country: 'Taiwan' },
      {
        ticker: 'TEN',
        name: 'Tencent',
        weight: 4,
        sector: 'Comm',
        currency: 'USD',
        country: 'China',
      },
      // Ticker 'N/A' case tests getHoldingKey fallback to name
      {
        ticker: 'N/A',
        name: 'Samsung',
        weight: 3,
        sector: 'IT',
        currency: 'USD',
        country: 'South Korea',
      },
    ],
    globalWeight: 0,
  };

  describe('calculatePairwiseOverlap', () => {
    it('calculates exact overlap between two ETFs', () => {
      // AAPL overlap = Math.min(6, 10) = 6
      // MSFT overlap = Math.min(5, 8) = 5
      // Total = 11
      const overlap = calculatePairwiseOverlap(etf1, etf2);
      expect(overlap).toBe(11);
    });

    it('returns 100% when compared with itself', () => {
      expect(calculatePairwiseOverlap(etf1, etf1)).toBe(100);
    });

    it('returns 0 when there are no shared holdings', () => {
      expect(calculatePairwiseOverlap(etf1, etf3)).toBe(0);
    });

    it('sums weights of duplicate tickers within the same ETF', () => {
      const etfDup = {
        ...etf1,
        id: 'dup',
        holdings: [
          {
            ticker: 'AAPL',
            name: 'Apple Inc.',
            weight: 4,
            sector: 'IT',
            currency: 'USD',
            country: 'US',
          },
          {
            ticker: 'AAPL',
            name: 'Apple Inc.',
            weight: 2,
            sector: 'IT',
            currency: 'USD',
            country: 'US',
          },
          {
            ticker: 'MSFT',
            name: 'Microsoft Corp.',
            weight: 5,
            sector: 'IT',
            currency: 'USD',
            country: 'US',
          },
        ],
      };
      // Apple is effectively 6. Math.min(6, 10) = 6.
      expect(calculatePairwiseOverlap(etfDup, etf2)).toBe(11);
    });
  });

  describe('generateOverlapMatrix', () => {
    it('builds an NxN array mapping pairs to their overlap percentages', () => {
      const matrix = generateOverlapMatrix([etf1, etf2, etf3]);

      // Combinations:
      // etf1-etf1 (100%), etf1-etf2 (11%), etf1-etf3 (0%)
      // etf2-etf1 (11%), etf2-etf2 (100%), etf2-etf3 (0%)
      // etf3-etf1 (0%), etf3-etf2 (0%), etf3-etf3 (100%)

      expect(matrix).toHaveLength(9); // 3 * 3

      const findOverlap = (id1: string, id2: string) =>
        matrix.find((m) => m.etfId1 === id1 && m.etfId2 === id2)?.overlapPercent;

      expect(findOverlap('etf1', 'etf2')).toBe(11);
      expect(findOverlap('etf2', 'etf1')).toBe(11);
      expect(findOverlap('etf1', 'etf1')).toBe(100);
      expect(findOverlap('etf1', 'etf3')).toBe(0);
      expect(findOverlap('etf3', 'etf3')).toBe(100);
    });

    it('returns empty array for no ETFs', () => {
      expect(generateOverlapMatrix([])).toEqual([]);
    });

    it('returns single self-overlap for 1 ETF', () => {
      const matrix = generateOverlapMatrix([etf1]);
      expect(matrix).toHaveLength(1);
      expect(matrix[0].overlapPercent).toBe(100);
      expect(matrix[0].etfId1).toBe('etf1');
      expect(matrix[0].etfId2).toBe('etf1');
    });
  });

  describe('calculateUniqueness', () => {
    it('calculates the correct uniqueness score based on the union of all other ETFs', () => {
      const uniqueness = calculateUniqueness([etf1, etf2, etf3]);

      const getScore = (id: string) => uniqueness.find((u) => u.etfId === id)?.uniquenessPercent;

      // etf1 (14 total):
      // AAPL (6) vs union(AAPL:10) -> overlap = 6
      // MSFT (5) vs union(MSFT:8) -> overlap = 5
      // AMZN (3) vs union(AMZN:0) -> overlap = 0
      // Overlap with union = 11. Uniqueness = 100 - 11 = 89
      expect(getScore('etf1')).toBe(89);

      // etf2 (22 total):
      // AAPL (10) vs union(AAPL:6) -> overlap = 6
      // MSFT (8) vs union(MSFT:5) -> overlap = 5
      // TSLA (4) vs union(TSLA:0) -> overlap = 0
      // Overlap with union = 11. Uniqueness = 100 - 11 = 89
      expect(getScore('etf2')).toBe(89);

      // etf3 (13 total):
      // No overlap with anything. Overlap with union = 0. Uniqueness = 100 - 0 = 100
      expect(getScore('etf3')).toBe(100);
    });

    it('returns 100% for all ETFs if there are 1 or fewer ETFs', () => {
      const res0 = calculateUniqueness([]);
      expect(res0).toEqual([]);

      const res1 = calculateUniqueness([etf1]);
      expect(res1).toHaveLength(1);
      expect(res1[0].uniquenessPercent).toBe(100);
    });

    it('sorts results by uniqueness score descending', () => {
      const uniqueness = calculateUniqueness([etf1, etf2, etf3]);
      expect(uniqueness[0].etfId).toBe('etf3'); // 100
      expect(uniqueness[1].etfId).toBe('etf1'); // 89
      expect(uniqueness[2].etfId).toBe('etf2'); // 89
    });

    it('uses the ticker fallback to name if ticker is N/A', () => {
      const etfNA1 = {
        ...etf3,
        id: 'na1',
        holdings: [
          {
            ticker: 'N/A',
            name: 'Samsung',
            weight: 3,
            sector: 'IT',
            currency: 'USD',
            country: 'South Korea',
          },
        ],
      };

      const etfNA2 = {
        ...etf3,
        id: 'na2',
        holdings: [
          {
            ticker: 'N/A',
            name: 'Samsung',
            weight: 2,
            sector: 'IT',
            currency: 'USD',
            country: 'South Korea',
          },
        ],
      };

      const overlap = calculatePairwiseOverlap(etfNA1, etfNA2);
      expect(overlap).toBe(2); // Since it falls back to name "Samsung", they match!

      const matrix = generateOverlapMatrix([etfNA1, etfNA2]);
      expect(matrix.find((m) => m.etfId1 === 'na1' && m.etfId2 === 'na2')?.overlapPercent).toBe(2);
    });
  });
});
