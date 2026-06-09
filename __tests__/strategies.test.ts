import {
  ISharesParser,
  VanguardParser,
  AmundiParser,
  LyxorParser,
  BaseParser,
} from '../lib/parsers/strategies';

describe('CSV Parsing Strategies', () => {
  let file: File;

  beforeEach(() => {
    // Mock File object
    file = new File([''], 'test.csv', { type: 'text/csv' });
  });

  describe('BaseParser Error Handling', () => {
    it('returns empty holdings and errors if Papa.parse fails or returns empty', async () => {
      // Create a mock parser that returns an empty CSV string
      const parser = new ISharesParser();
      file = new File([''], 'test.csv', { type: 'text/csv' });

      const result = await parser.parse(file);
      expect(result.holdings).toEqual([]);
    });
  });

  describe('ISharesParser', () => {
    it('parses correct columns', async () => {
      const csvContent = `"Ticker","Name","Weight (%)","Sector","Location","Exchange"\n"AAPL","Apple Inc.","5.50","Information Technology","United States","USD"\n`;
      file = new File([csvContent], 'ishares.csv', { type: 'text/csv' });

      const parser = new ISharesParser();
      const result = await parser.parse(file);

      expect(result.errors.length).toBe(0);
      expect(result.holdings.length).toBe(1);
      expect(result.holdings[0]).toEqual({
        ticker: 'AAPL',
        name: 'Apple Inc.',
        weight: 5.5,
        sector: 'Information Technology',
        country: 'United States',
        currency: 'USD',
      });
    });
  });

  describe('VanguardParser', () => {
    it('parses correct columns', async () => {
      const csvContent = `Ticker,Company,Fund Weight,Sector,Market,Market Currency\nAAPL,Apple Inc.,5.5%,Technology,USA,USD\n`;
      file = new File([csvContent], 'vanguard.csv', { type: 'text/csv' });

      const parser = new VanguardParser();
      const result = await parser.parse(file);

      expect(result.holdings.length).toBe(1);
      expect(result.holdings[0]).toEqual({
        ticker: 'AAPL',
        name: 'Apple Inc.',
        weight: 5.5,
        sector: 'Technology',
        country: 'USA',
        currency: 'USD',
      });
    });
  });

  describe('AmundiParser', () => {
    it('parses correct columns', async () => {
      const csvContent = `Ticker,Issuer Name,Peso,Sector,Country,Currency\nAAPL,Apple Inc.,5.5,IT,US,USD\n`;
      file = new File([csvContent], 'amundi.csv', { type: 'text/csv' });

      const parser = new AmundiParser();
      const result = await parser.parse(file);

      expect(result.holdings.length).toBe(1);
      expect(result.holdings[0]).toEqual({
        ticker: 'AAPL',
        name: 'Apple Inc.',
        weight: 5.5,
        sector: 'IT',
        country: 'US',
        currency: 'USD',
      });
    });
  });

  describe('LyxorParser', () => {
    it('parses correct columns', async () => {
      const csvContent = `Ticker,Security Name,Weight,Sector,Country,Currency\nAAPL,Apple Inc.,5.5,Tech,US,USD\n`;
      file = new File([csvContent], 'lyxor.csv', { type: 'text/csv' });

      const parser = new LyxorParser();
      const result = await parser.parse(file);

      expect(result.holdings.length).toBe(1);
      expect(result.holdings[0]).toEqual({
        ticker: 'AAPL',
        name: 'Apple Inc.',
        weight: 5.5,
        sector: 'Tech',
        country: 'US',
        currency: 'USD',
      });
    });
  });
});
