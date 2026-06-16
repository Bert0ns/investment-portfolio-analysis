import React, { useMemo } from 'react';
import { Search, Building } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDebounce } from '@/hooks/useDebounce';
import { searchHoldings } from '@/lib/math';
import { EtfConfig } from '@/lib/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CompanyResultCard } from './CompanyResultCard';

interface CompanySearchProps {
  etfs: EtfConfig[];
}

export function CompanySearch({ etfs }: CompanySearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useLocalStorage('deepdive_query', '');
  const debouncedQuery = useDebounce(query, 300);

  const results = useMemo(() => {
    return searchHoldings(etfs, debouncedQuery);
  }, [etfs, debouncedQuery]);

  return (
    <>
      <Card className="border-border shadow-md">
        <CardHeader className="bg-muted/20 border-b border-border pb-6">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            {t.pages.analyzer.dashboard.tabs.deepDiveTab.title}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {t.pages.analyzer.dashboard.tabs.deepDiveTab.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder={t.pages.analyzer.dashboard.tabs.deepDiveTab.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-background border-2 border-border rounded-xl text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>
        </CardContent>
      </Card>

      {query.length > 0 && results.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Building className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg">
              {t.pages.analyzer.dashboard.tabs.deepDiveTab.noHoldingsFound} &quot;{query}&quot;
            </p>
            <p className="text-sm mt-2">
              {t.pages.analyzer.dashboard.tabs.deepDiveTab.tryDifferent}
            </p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.slice(0, 50).map((result) => (
            <CompanyResultCard key={result.ticker + result.name} result={result} t={t} />
          ))}
        </div>
      )}
    </>
  );
}
