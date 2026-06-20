export interface Holding {
  ticker: string;
  name: string;
  weight: number; // Weight of the company within the single ETF (%)
  sector: string;
  country: string;
  currency: string;
}

export type Issuer = 'iShares' | 'Vanguard' | 'Amundi' | 'Lyxor';
export type ReplicationMethod = 'Physical' | 'Synthetic' | 'Optimized';
export type UseOfProfit = 'Accumulating' | 'Distributing';
export type Domicile = 'Ireland' | 'Luxembourg' | 'US' | 'Other';

export interface EtfConfig {
  id: string; // Unique ID for this ETF entry
  name: string; // Ticker or name of the ETF
  isin?: string; // ISIN code for the ETF
  issuer: Issuer;
  ter: number;
  globalWeight: number; // 0 to 100
  holdings: Holding[]; // The parsed CSV data

  // New ETF Metadata
  replicationMethod: ReplicationMethod;
  fundSize: number; // In millions (USD/EUR)
  fundAge: number; // In years
  useOfProfit: UseOfProfit;
  domicile: Domicile;
}

export interface ParseResult {
  holdings: Holding[];
  errors: string[];
}

// Strategy Pattern for CSV Parsing
export interface CsvParserStrategy {
  parse(file: File): Promise<ParseResult>;
}
