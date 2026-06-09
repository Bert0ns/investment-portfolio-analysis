import { Issuer, CsvParserStrategy } from '../types';
import { ISharesParser, VanguardParser, AmundiParser, LyxorParser } from './strategies';

export function getCsvParser(issuer: Issuer): CsvParserStrategy {
  switch (issuer) {
    case 'iShares':
      return new ISharesParser();
    case 'Vanguard':
      return new VanguardParser();
    case 'Amundi':
      return new AmundiParser();
    case 'Lyxor':
      return new LyxorParser();
    default:
      throw new Error(`Unsupported issuer: ${issuer}`);
  }
}
