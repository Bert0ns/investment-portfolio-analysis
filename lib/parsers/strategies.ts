import Papa from 'papaparse';
import { CsvParserStrategy, Holding, ParseResult } from '../types';

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

// Safely parse European numbers (1.234,56 or 12,34%)
const parseNumber = (val: unknown): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // Remove spaces, '%', then convert thousands separators ('.') to nothing, and decimal (',') to '.'
    // Wait, if it's US format (1,234.56), this will break.
    // Let's do a smart replace:
    let cleaned = val.replace(/\s/g, '').replace('%', '');

    // If it has both . and , it's tricky.
    // Let's assume European if the last separator is a comma: "1.234,56"
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // US format "1,234.56" or just "1234.56"
      cleaned = cleaned.replace(/,/g, '');
    }

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export class ISharesParser implements CsvParserStrategy {
  async parse(file: File): Promise<ParseResult> {
    try {
      const data = await parseCustomCsv(file, ["Ticker dell'emittente", 'Ticker', 'Simbolo']);

      const holdings: Holding[] = data
        .map((row: Record<string, unknown>) => ({
          ticker: String(row["Ticker dell'emittente"] || row['Ticker'] || row['Simbolo'] || 'N/A'),
          name: String(row['Nome'] || row['Name'] || 'Unknown'),
          weight: parseNumber(row['Ponderazione (%)'] || row['Weight (%)'] || row['Peso (%)'] || 0),
          sector: String(row['Settore'] || row['Sector'] || 'Other'),
          country: String(row['Area Geografica'] || row['Location'] || row['Paese'] || 'Unknown'),
          currency: String(row['Valuta di mercato'] || row['Currency'] || row['Valuta'] || 'USD'),
        }))
        .filter((h) => h.weight > 0 && h.ticker !== 'N/A' && h.name !== 'Unknown');

      return { holdings, errors: [] };
    } catch (e: unknown) {
      return { holdings: [], errors: [e instanceof Error ? e.message : String(e)] };
    }
  }
}

export class VanguardParser implements CsvParserStrategy {
  async parse(file: File): Promise<ParseResult> {
    try {
      const data = await parseCustomCsv(file, ['Ticker', 'Symbol']);

      const holdings: Holding[] = data
        .map((row: Record<string, unknown>) => {
          // Extract currency from "427.402.704,26 USD" if present
          const marketValueStr = String(row['Valore di mercato'] || row['Market Value'] || '');
          const currencyMatch = marketValueStr.match(/[A-Z]{3}$/);
          const currency = currencyMatch ? currencyMatch[0] : 'USD';

          return {
            ticker: String(row['Ticker'] || row['Symbol'] || 'N/A'),
            name: String(
              row['Nome delle partecipazioni'] || row['Nome'] || row['Company'] || 'Unknown'
            ),
            weight: parseNumber(row['% del valore di mercato'] || row['Fund Weight'] || 0),
            sector: String(row['Settore'] || row['Sector'] || 'Other'),
            country: String(row['Regione'] || row['Market'] || 'Unknown'),
            currency,
          };
        })
        .filter((h) => h.weight > 0 && h.ticker !== 'N/A' && h.name !== 'Unknown');

      return { holdings, errors: [] };
    } catch (e: unknown) {
      return { holdings: [], errors: [e instanceof Error ? e.message : String(e)] };
    }
  }
}

export class AmundiParser implements CsvParserStrategy {
  async parse(file: File): Promise<ParseResult> {
    try {
      // "Asset class" is unique to the header row in Amundi CSVs, unlike "Codice ISIN" which is also in metadata
      const data = await parseCustomCsv(file, ['Asset class', 'Issuer Name']);

      const holdings: Holding[] = data
        .map((row: Record<string, unknown>) => ({
          ticker: String(row['Codice ISIN'] || row['ISIN'] || row['Ticker'] || 'N/A'),
          name: String(row['Nome'] || row['Issuer Name'] || 'Unknown'),
          weight: parseNumber(row['Peso'] || row['Portfolio Weight'] || 0),
          sector: String(row['Settore'] || row['Sector'] || 'Other'),
          country: String(row['Paese'] || row['Country'] || 'Unknown'),
          currency: String(row['Valuta'] || row['Currency'] || 'USD'),
        }))
        .filter((h) => h.weight > 0 && h.ticker !== 'N/A' && h.name !== 'Unknown');

      return { holdings, errors: [] };
    } catch (e: unknown) {
      return { holdings: [], errors: [e instanceof Error ? e.message : String(e)] };
    }
  }
}

export class LyxorParser implements CsvParserStrategy {
  async parse(file: File): Promise<ParseResult> {
    try {
      const data = await parseCustomCsv(file, ['ISIN', 'Symbol', 'Ticker']);
      const holdings: Holding[] = data
        .map((row: Record<string, unknown>) => ({
          ticker: String(row['Symbol'] || row['Ticker'] || row['ISIN'] || 'N/A'),
          name: String(row['Security Name'] || row['Nome'] || 'Unknown'),
          weight: parseNumber(row['Weight'] || row['Peso'] || 0),
          sector: String(row['Sector'] || row['Settore'] || 'Other'),
          country: String(row['Country'] || row['Paese'] || 'Unknown'),
          currency: String(row['Currency'] || row['Valuta'] || 'USD'),
        }))
        .filter((h) => h.weight > 0 && h.ticker !== 'N/A' && h.name !== 'Unknown');

      return { holdings, errors: [] };
    } catch (e: unknown) {
      return { holdings: [], errors: [e instanceof Error ? e.message : String(e)] };
    }
  }
}
