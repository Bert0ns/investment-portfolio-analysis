import Papa from 'papaparse';
import { CsvParserStrategy, Holding, ParseResult } from '@/lib/types';
import { normalizeSector, normalizeCountry } from '@/lib/math/normalization';

// Helper to read file as text
function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

// Helper to find header row and parse with PapaParse
async function parseCustomCsv(
  file: File,
  headerKeywords: string[]
): Promise<Record<string, unknown>[]> {
  const text = await readFile(file);
  const lines = text.split('\n');

  let headerIndex = -1;
  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    // search first 50 lines
    const line = lines[i].toLowerCase();
    if (headerKeywords.some((keyword) => line.includes(keyword.toLowerCase()))) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error(`Could not find a header row matching any of: ${headerKeywords.join(', ')}`);
  }

  // Detect delimiter based on the header line
  const headerLine = lines[headerIndex];
  const delimiter = headerLine.includes(';') ? ';' : ',';

  const csvText = lines.slice(headerIndex).join('\n');

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      delimiter,
      dynamicTyping: false,
      complete: (results) => resolve(results.data as Record<string, unknown>[]),
      error: (error: Error) => reject(error),
    });
  });
}

// Safely parse numbers (handles both 1.234,56 and 1,234.56 formats)
const parseNumber = (val: unknown): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    let cleaned = val.replace(/\s/g, '').replace('%', '');

    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      // European format: 1.234,56 -> 1234.56
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: 1,234.56 -> 1234.56
      cleaned = cleaned.replace(/,/g, '');
    }

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

interface ParserConfig {
  headerKeywords: string[];
  fields: {
    ticker: string[];
    name: string[];
    weight: string[];
    sector: string[];
    country: string[];
    currency?: string[];
  };
  customCurrencyExtractor?: (row: Record<string, unknown>) => string;
}

const PARSER_CONFIGS: Record<string, ParserConfig> = {
  iShares: {
    headerKeywords: ["Ticker dell'emittente", 'Ticker', 'Simbolo'],
    fields: {
      ticker: ["Ticker dell'emittente", 'Ticker', 'Simbolo'],
      name: ['Nome', 'Name'],
      weight: ['Ponderazione (%)', 'Weight (%)', 'Peso (%)'],
      sector: ['Settore', 'Sector'],
      country: ['Area Geografica', 'Location', 'Paese'],
      currency: ['Valuta di mercato', 'Currency', 'Valuta', 'Exchange'],
    },
  },
  Vanguard: {
    headerKeywords: ['Ticker', 'Symbol'],
    fields: {
      ticker: ['Ticker', 'Symbol'],
      name: ['Nome delle partecipazioni', 'Nome', 'Company'],
      weight: ['% del valore di mercato', 'Fund Weight'],
      sector: ['Settore', 'Sector'],
      country: ['Regione', 'Market'],
    },
    customCurrencyExtractor: (row) => {
      const marketValueStr = String(row['Valore di mercato'] || row['Market Value'] || '');
      const currencyMatch = marketValueStr.match(/[A-Z]{3}$/);
      return currencyMatch ? currencyMatch[0] : 'USD';
    },
  },
  Amundi: {
    headerKeywords: ['Asset class', 'Issuer Name'],
    fields: {
      ticker: ['Codice ISIN', 'ISIN', 'Ticker'],
      name: ['Nome', 'Issuer Name'],
      weight: ['Peso', 'Portfolio Weight'],
      sector: ['Settore', 'Sector'],
      country: ['Paese', 'Country'],
      currency: ['Valuta', 'Currency'],
    },
  },
  Lyxor: {
    headerKeywords: ['ISIN', 'Symbol', 'Ticker'],
    fields: {
      ticker: ['Symbol', 'Ticker', 'ISIN'],
      name: ['Security Name', 'Nome'],
      weight: ['Weight', 'Peso'],
      sector: ['Sector', 'Settore'],
      country: ['Country', 'Paese'],
      currency: ['Currency', 'Valuta'],
    },
  },
  Xtrackers: {
    headerKeywords: ['ISIN', 'Type of Security', 'Industry Classification'],
    fields: {
      ticker: ['ISIN'],
      name: ['Name'],
      weight: ['Weighting', 'Peso'],
      sector: ['Industry Classification', 'Settore'],
      country: ['Country', 'Paese'],
      currency: ['Currency', 'Valuta'],
    },
  },
};

class GenericCsvParser implements CsvParserStrategy {
  constructor(private config: ParserConfig) {}

  async parse(file: File): Promise<ParseResult> {
    try {
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 10MB limit`
        );
      }

      const data = await parseCustomCsv(file, this.config.headerKeywords);

      const errors: string[] = [];
      if (data.length > 0) {
        const firstRow = data[0];
        const missingFields: string[] = [];

        Object.entries(this.config.fields).forEach(([fieldName, keys]) => {
          if (!keys) return;
          const found = keys.some((key) => firstRow[key] !== undefined);
          if (!found) missingFields.push(fieldName);
        });

        if (missingFields.length > 0) {
          errors.push(`Missing columns for: ${missingFields.join(', ')}`);
        }
      }

      const holdings: Holding[] = data
        .map((row: Record<string, unknown>) => {
          const getField = (keys?: string[]) => {
            if (!keys) return undefined;
            for (const key of keys) {
              if (row[key] !== undefined && row[key] !== '') {
                return row[key];
              }
            }
            return undefined;
          };

          let currency = 'USD';
          if (this.config.customCurrencyExtractor) {
            currency = this.config.customCurrencyExtractor(row);
          } else {
            currency = String(getField(this.config.fields.currency) || 'USD');
          }

          return {
            ticker: String(getField(this.config.fields.ticker) || 'N/A'),
            name: String(getField(this.config.fields.name) || 'Unknown'),
            weight: parseNumber(getField(this.config.fields.weight) || 0),
            sector: normalizeSector(String(getField(this.config.fields.sector) || 'Other')),
            country: normalizeCountry(String(getField(this.config.fields.country) || 'Unknown')),
            currency,
          };
        })
        .filter((h) => h.weight > 0 && h.ticker !== 'N/A' && h.name !== 'Unknown');

      return { holdings, errors };
    } catch (e: unknown) {
      return { holdings: [], errors: [e instanceof Error ? e.message : String(e)] };
    }
  }
}

export class ISharesParser extends GenericCsvParser {
  constructor() {
    super(PARSER_CONFIGS.iShares);
  }
}

export class VanguardParser extends GenericCsvParser {
  constructor() {
    super(PARSER_CONFIGS.Vanguard);
  }
}

export class AmundiParser extends GenericCsvParser {
  constructor() {
    super(PARSER_CONFIGS.Amundi);
  }
}

export class LyxorParser extends GenericCsvParser {
  constructor() {
    super(PARSER_CONFIGS.Lyxor);
  }
}

export class XtrackersParser extends GenericCsvParser {
  constructor() {
    super(PARSER_CONFIGS.Xtrackers);
  }
}
