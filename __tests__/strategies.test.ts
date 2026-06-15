import {
  ISharesParser,
  VanguardParser,
  AmundiParser,
  LyxorParser,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expectAppleHolding = (result: any, expectedSector: string, expectedCountry: string) => {
    expect(result.holdings.length).toBe(1);
    expect(result.holdings[0]).toEqual({
      ticker: 'AAPL',
      name: 'Apple Inc.',
      weight: 5.5,
      sector: expectedSector,
      country: expectedCountry,
      currency: 'USD',
    });
  };

  describe('ISharesParser', () => {
    it('parses correct columns', async () => {
      const csvContent = `"Ticker","Name","Weight (%)","Sector","Location","Exchange"\n"AAPL","Apple Inc.","5.50","Information Technology","United States","USD"\n`;
      file = new File([csvContent], 'ishares.csv', { type: 'text/csv' });

      const parser = new ISharesParser();
      const result = await parser.parse(file);

      expect(result.errors.length).toBe(0);
      expectAppleHolding(result, 'Information Technology', 'United States');
    });
  });

  describe('VanguardParser', () => {
    it('parses correct columns', async () => {
      const csvContent = `Ticker,Company,Fund Weight,Sector,Market,Market Currency\nAAPL,Apple Inc.,5.5%,Technology,USA,USD\n`;
      file = new File([csvContent], 'vanguard.csv', { type: 'text/csv' });

      const parser = new VanguardParser();
      const result = await parser.parse(file);

      expectAppleHolding(result, 'Technology', 'USA');
    });
  });

  describe('AmundiParser', () => {
    it('parses correct columns', async () => {
      const csvContent = `Ticker,Issuer Name,Peso,Sector,Country,Currency\nAAPL,Apple Inc.,5.5,IT,US,USD\n`;
      file = new File([csvContent], 'amundi.csv', { type: 'text/csv' });

      const parser = new AmundiParser();
      const result = await parser.parse(file);

      expectAppleHolding(result, 'IT', 'US');
    });
  });

  describe('LyxorParser', () => {
    it('parses correct columns', async () => {
      const csvContent = `Ticker,Security Name,Weight,Sector,Country,Currency\nAAPL,Apple Inc.,5.5,Tech,US,USD\n`;
      file = new File([csvContent], 'lyxor.csv', { type: 'text/csv' });

      const parser = new LyxorParser();
      const result = await parser.parse(file);

      expectAppleHolding(result, 'Tech', 'US');
    });
  });

  describe('Edge Cases and Number Parsing', () => {
    const runParsingNumberTest = async (csvContent: string) => {
      file = new File([csvContent], 'ishares.csv', { type: 'text/csv' });
      const parser = new ISharesParser();
      const result = await parser.parse(file);
      expect(result.holdings[0].weight).toBe(1234.56);
    };

    it('handles European number formatting (e.g., 1.234,56)', async () => {
      const csvContent = `Ticker,Name,Weight (%),Sector,Location,Exchange\nAAPL,Apple Inc.,"1.234,56",IT,US,USD\n`;
      await runParsingNumberTest(csvContent);
    });

    it('handles US number formatting with commas (e.g., 1,234.56)', async () => {
      const csvContent = `Ticker,Name,Weight (%),Sector,Location,Exchange\nAAPL,Apple Inc.,"1,234.56",IT,US,USD\n`;
      await runParsingNumberTest(csvContent);
    });

    it('handles whitespace and percentage signs in numbers', async () => {
      const csvContent = `Ticker,Name,Weight (%),Sector,Location,Exchange\nAAPL,Apple Inc.,"  5.50 % ",IT,US,USD\n`;
      file = new File([csvContent], 'ishares.csv', { type: 'text/csv' });
      const parser = new ISharesParser();
      const result = await parser.parse(file);
      expect(result.holdings[0].weight).toBe(5.5);
    });

    it('returns error if header row is not found', async () => {
      const csvContent = `Random,Data,Here\n1,2,3\n4,5,6\n`;
      file = new File([csvContent], 'ishares.csv', { type: 'text/csv' });
      const parser = new ISharesParser();
      const result = await parser.parse(file);
      expect(result.holdings).toEqual([]);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toMatch(/Could not find a header row matching/);
    });

    it('detects semicolon delimited CSVs', async () => {
      // Lyxor is a good candidate for semicolon test
      const csvContent = `ISIN;Symbol;Security Name;Weight;Sector;Country;Currency\nUS0001;AAPL;Apple Inc.;5.5;Tech;US;USD\n`;
      file = new File([csvContent], 'lyxor.csv', { type: 'text/csv' });
      const parser = new LyxorParser();
      const result = await parser.parse(file);
      expect(result.holdings.length).toBe(1);
      expect(result.holdings[0].ticker).toBe('AAPL');
      expect(result.holdings[0].weight).toBe(5.5);
    });

    it('reports missing columns', async () => {
      // Missing 'Weight (%)'
      const csvContent = `Ticker,Name,Sector,Location,Exchange\nAAPL,Apple Inc.,IT,US,USD\n`;
      file = new File([csvContent], 'ishares.csv', { type: 'text/csv' });
      const parser = new ISharesParser();
      const result = await parser.parse(file);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toMatch(/Missing columns for: weight/);
      expect(result.holdings.length).toBe(0); // weight will be 0, so it's filtered out
    });

    it('custom currency extractor in Vanguard parses currency from Market Value', async () => {
      // Vanguard parser uses customCurrencyExtractor that looks for 3 uppercase letters at the end of Market Value
      const csvContent = `Ticker,Company,Fund Weight,Sector,Market,Market Value\nAAPL,Apple Inc.,5.5%,Technology,USA,123456 GBP\n`;
      file = new File([csvContent], 'vanguard.csv', { type: 'text/csv' });
      const parser = new VanguardParser();
      const result = await parser.parse(file);
      expect(result.holdings[0].currency).toBe('GBP');
    });

    it('filters out holdings with 0 weight, N/A ticker, or Unknown name', async () => {
      const csvContent = `Ticker,Name,Weight (%),Sector,Location,Exchange
N/A,Apple Inc.,5.50,IT,US,USD
MSFT,Unknown,5.50,IT,US,USD
GOOG,Google,0,IT,US,USD
AMZN,Amazon,1.0,IT,US,USD\n`;
      file = new File([csvContent], 'ishares.csv', { type: 'text/csv' });
      const parser = new ISharesParser();
      const result = await parser.parse(file);

      // Only AMZN should remain
      expect(result.holdings.length).toBe(1);
      expect(result.holdings[0].ticker).toBe('AMZN');
    });
  });
});
