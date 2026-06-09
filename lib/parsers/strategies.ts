import Papa from 'papaparse';
import { CsvParserStrategy, Holding, ParseResult } from '../types';

// Helper function to wrap PapaParse in a Promise
function parseWithPapa(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}

// Helper to safely parse weights/numbers
const parseNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val.replace(/,/g, '').replace('%', ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export class ISharesParser implements CsvParserStrategy {
  async parse(file: File): Promise<ParseResult> {
    try {
      const data = await parseWithPapa(file);
      const holdings: Holding[] = data
        .map((row: any) => ({
          ticker: row['Ticker'] || row['Simbolo'] || 'N/A',
          name: row['Name'] || row['Nome'] || 'Unknown',
          weight: parseNumber(row['Weight (%)'] || row['Peso (%)'] || 0),
          sector: row['Sector'] || row['Settore'] || 'Other',
          country: row['Location'] || row['Paese'] || 'Unknown',
          currency: row['Currency'] || row['Valuta'] || 'USD',
        }))
        .filter((h) => h.weight > 0 && h.ticker !== 'N/A');

      return { holdings, errors: [] };
    } catch (e: any) {
      return { holdings: [], errors: [e.message] };
    }
  }
}

export class VanguardParser implements CsvParserStrategy {
  async parse(file: File): Promise<ParseResult> {
    try {
      const data = await parseWithPapa(file);
      const holdings: Holding[] = data
        .map((row: any) => ({
          ticker: row['Symbol'] || 'N/A',
          name: row['Company'] || 'Unknown',
          weight: parseNumber(row['Fund Weight'] || 0),
          sector: row['Sector'] || 'Other',
          country: row['Market'] || 'Unknown',
          currency: row['Currency'] || 'USD',
        }))
        .filter((h) => h.weight > 0 && h.ticker !== 'N/A');

      return { holdings, errors: [] };
    } catch (e: any) {
      return { holdings: [], errors: [e.message] };
    }
  }
}

export class AmundiParser implements CsvParserStrategy {
  async parse(file: File): Promise<ParseResult> {
    try {
      const data = await parseWithPapa(file);
      const holdings: Holding[] = data
        .map((row: any) => ({
          ticker: row['Ticker'] || 'N/A',
          name: row['Issuer Name'] || 'Unknown',
          weight: parseNumber(row['Portfolio Weight'] || 0),
          sector: row['Sector'] || 'Other',
          country: row['Country'] || 'Unknown',
          currency: row['Currency'] || 'USD',
        }))
        .filter((h) => h.weight > 0 && h.ticker !== 'N/A');

      return { holdings, errors: [] };
    } catch (e: any) {
      return { holdings: [], errors: [e.message] };
    }
  }
}

export class LyxorParser implements CsvParserStrategy {
  async parse(file: File): Promise<ParseResult> {
    try {
      const data = await parseWithPapa(file);
      const holdings: Holding[] = data
        .map((row: any) => ({
          ticker: row['Symbol'] || 'N/A',
          name: row['Security Name'] || 'Unknown',
          weight: parseNumber(row['Weight'] || 0),
          sector: row['Sector'] || 'Other',
          country: row['Country'] || 'Unknown',
          currency: row['Currency'] || 'USD',
        }))
        .filter((h) => h.weight > 0 && h.ticker !== 'N/A');

      return { holdings, errors: [] };
    } catch (e: any) {
      return { holdings: [], errors: [e.message] };
    }
  }
}
