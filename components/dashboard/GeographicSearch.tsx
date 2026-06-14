import React, { useMemo } from 'react';
import { EtfConfig } from '@/lib/types';
import { searchByCountry, getCountryIsoCode } from '@/lib/math';
import { Card, CardContent } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GeographicMap } from './GeographicMap';
import { GeographicResults } from './GeographicResults';

interface GeographicSearchProps {
  etfs: EtfConfig[];
}

export function GeographicSearch({ etfs }: GeographicSearchProps) {
  const [query, setQuery] = useLocalStorage('geographic_query', '');
  const debouncedQuery = useDebounce(query, 300);

  const results = useMemo(() => {
    return searchByCountry(etfs, debouncedQuery);
  }, [etfs, debouncedQuery]);

  const mapData = useMemo(() => {
    // We want to show all countries that have exposure, even if not searching
    const allExposures = searchByCountry(etfs, '');
    return allExposures
      .map((exp) => ({
        country: getCountryIsoCode(exp.countryName),
        value: exp.totalWeight,
      }))
      .filter((d) => d.country !== ''); // Remove unknown or unmapped
  }, [etfs]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border shadow-md overflow-hidden bg-gradient-to-b from-card to-muted/10">
        <CardContent className="p-0 flex flex-col">
          <GeographicMap mapData={mapData} onCountryClick={setQuery} />
          <GeographicResults query={query} setQuery={setQuery} results={results} />
        </CardContent>
      </Card>
    </div>
  );
}
