import { Issuer, CsvParserStrategy } from '@/lib/types';
import {
  ISharesParser,
  VanguardParser,
  AmundiParser,
  LyxorParser,
  XtrackersParser,
} from '@/lib/parsers/strategies';

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
    case 'Xtrackers':
      return new XtrackersParser();
    default:
      throw new Error(`Unsupported issuer: ${issuer}`);
  }
}
