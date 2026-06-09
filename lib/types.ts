export interface Holding {
  ticker: string;
  name: string;
  weight: number; // Weight of the company within the single ETF (%)
  sector: string;
  country: string;
  currency: string;
}

export type Issuer = 'iShares' | 'Vanguard' | 'Amundi' | 'Lyxor';

export interface EtfConfig {
  id: string; // Unique ID for this ETF entry
  name: string; // Ticker or name of the ETF
  issuer: Issuer;
  ter: number;
  globalWeight: number; // 0 to 100
  holdings: Holding[]; // The parsed CSV data
}

export interface ParseResult {
  holdings: Holding[];
  errors: string[];
}

// Strategy Pattern for CSV Parsing
export interface CsvParserStrategy {
  parse(file: File): Promise<ParseResult>;
}
