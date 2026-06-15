import { useTranslation } from '@/lib/i18n/LanguageContext';
import { Search } from 'lucide-react';
import { CountrySearchResult } from '@/lib/math';
import { GeographicResultCard } from './GeographicResultCard';
import { GeographicEmptyState } from './GeographicEmptyState';

interface GeographicResultsProps {
  query: string;
  setQuery: (q: string) => void;
  results: CountrySearchResult[];
}

export function GeographicResults({ query, setQuery, results }: GeographicResultsProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full p-6 flex flex-col min-h-[500px]">
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder={t.deepDiveTab.searchCountryPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        <GeographicEmptyState query={query} hasResults={results.length > 0} />

        {results.map((res) => {
          const translatedCountry =
            t.countries[res.countryName as keyof typeof t.countries] || res.countryName;

          return (
            <GeographicResultCard
              key={res.countryName}
              res={res}
              translatedCountry={translatedCountry}
            />
          );
        })}
      </div>
    </div>
  );
}
