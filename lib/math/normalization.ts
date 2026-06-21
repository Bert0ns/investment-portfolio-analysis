const SECTOR_MAPPINGS: { matchers: RegExp[]; result: string }[] = [
  { matchers: [/^it$/, /tech/, /tecnologia/, /informatica/], result: 'Information Technology' },
  { matchers: [/finanziari/, /financial/, /finance/], result: 'Financials' },
  { matchers: [/industr/, /industrali/], result: 'Industrials' },
  { matchers: [/health/, /sanità/, /sanita/, /cura/, /salute/], result: 'Healthcare' },
  {
    matchers: [/discrezionali/, /discretionary/, /cyclical/, /consumer services/, /voluttuari/],
    result: 'Consumer Discretionary',
  },
  {
    matchers: [
      /staples/,
      /beni di consumo/,
      /defensive/,
      /consumer goods/,
      /prima necessit/,
      /largo consumo/,
    ],
    result: 'Consumer Staples',
  },
  { matchers: [/material/, /materie prime/], result: 'Materials' },
  { matchers: [/energ/], result: 'Energy' },
  { matchers: [/utilit/, /pubblica utilit\u00e0/], result: 'Utilities' },
  { matchers: [/communication/, /telecom/, /comunicazion/], result: 'Communication Services' },
  { matchers: [/real estate/, /immobili/, /property/], result: 'Real Estate' },
  { matchers: [/cash/, /liquid/, /contant/, /derivat/], result: 'Cash' },
];

const sectorCache = new Map<string, string>();

export function normalizeSector(sector: string): string {
  if (!sector || sector === 'Unknown' || sector === 'N/A') return 'Unknown';

  const s = sector.trim().toLowerCase();
  if (sectorCache.has(s)) return sectorCache.get(s)!;

  for (const mapping of SECTOR_MAPPINGS) {
    if (mapping.matchers.some((matcher) => matcher.test(s))) {
      sectorCache.set(s, mapping.result);
      return mapping.result;
    }
  }

  // Return the original sector with title case as fallback
  const fallback = sector.charAt(0).toUpperCase() + sector.slice(1);
  sectorCache.set(s, fallback);
  return fallback;
}

const COUNTRY_MAPPINGS: { matchers: RegExp[]; result: string }[] = [
  {
    matchers: [/stati uniti/, /stati uniti d'america/, /united states/i, /^us$/, /^usa$/],
    result: 'United States',
  },
  { matchers: [/giappone/, /japan/i], result: 'Japan' },
  {
    matchers: [/regno unito/, /united kingdom/i, /uk/i, /gran bretagna/],
    result: 'United Kingdom',
  },
  { matchers: [/francia/, /france/i], result: 'France' },
  { matchers: [/germania/, /germany/i], result: 'Germany' },
  { matchers: [/svizzera/, /switzerland/i], result: 'Switzerland' },
  { matchers: [/canada/i], result: 'Canada' },
  { matchers: [/australia/i], result: 'Australia' },
  { matchers: [/paesi bassi/, /netherlands/i, /holland/], result: 'Netherlands' },
  { matchers: [/svezia/, /sweden/i], result: 'Sweden' },
  { matchers: [/danimarca/, /denmark/i], result: 'Denmark' },
  { matchers: [/spagna/, /spain/i], result: 'Spain' },
  { matchers: [/italia/, /italy/i], result: 'Italy' },
  { matchers: [/hong kong/i], result: 'Hong Kong' },
  { matchers: [/cina/, /china/i], result: 'China' },
  { matchers: [/taiwan/i], result: 'Taiwan' },
  { matchers: [/corea del sud/, /south korea/i], result: 'South Korea' },
  { matchers: [/india/i], result: 'India' },
  { matchers: [/brasile/, /brazil/i], result: 'Brazil' },
  { matchers: [/messico/, /mexico/i], result: 'Mexico' },
  { matchers: [/sudafrica/, /south africa/i], result: 'South Africa' },
  { matchers: [/irlanda/, /ireland/i], result: 'Ireland' },
];

const ISO_TO_COUNTRY: Record<string, string> = {
  us: 'United States',
  jp: 'Japan',
  gb: 'United Kingdom',
  uk: 'United Kingdom',
  fr: 'France',
  de: 'Germany',
  ch: 'Switzerland',
  ca: 'Canada',
  au: 'Australia',
  nl: 'Netherlands',
  se: 'Sweden',
  dk: 'Denmark',
  es: 'Spain',
  it: 'Italy',
  hk: 'Hong Kong',
  cn: 'China',
  tw: 'Taiwan',
  kr: 'South Korea',
  in: 'India',
  br: 'Brazil',
  mx: 'Mexico',
  za: 'South Africa',
  ie: 'Ireland',
};

const countryCache = new Map<string, string>();

export function normalizeCountry(country: string): string {
  if (!country || country === 'Unknown' || country === 'N/A' || country === '-') return 'Unknown';

  const c = country.trim().toLowerCase();
  if (countryCache.has(c)) return countryCache.get(c)!;

  if (c.length === 2 && ISO_TO_COUNTRY[c]) {
    countryCache.set(c, ISO_TO_COUNTRY[c]);
    return ISO_TO_COUNTRY[c];
  }

  for (const mapping of COUNTRY_MAPPINGS) {
    if (mapping.matchers.some((matcher) => matcher.test(c))) {
      countryCache.set(c, mapping.result);
      return mapping.result;
    }
  }

  // Fallback: Title Case
  const fallback = country.charAt(0).toUpperCase() + country.slice(1);
  countryCache.set(c, fallback);
  return fallback;
}

const ISO_MAP: Record<string, string> = {
  'United States': 'us',
  Japan: 'jp',
  'United Kingdom': 'gb',
  France: 'fr',
  Germany: 'de',
  Switzerland: 'ch',
  Canada: 'ca',
  Australia: 'au',
  Netherlands: 'nl',
  Sweden: 'se',
  Denmark: 'dk',
  Spain: 'es',
  Italy: 'it',
  'Hong Kong': 'hk',
  China: 'cn',
  Taiwan: 'tw',
  'South Korea': 'kr',
  India: 'in',
  Brazil: 'br',
  Mexico: 'mx',
  'South Africa': 'za',
  Ireland: 'ie',
};

export function getCountryIsoCode(country: string): string {
  return ISO_MAP[country] || '';
}
