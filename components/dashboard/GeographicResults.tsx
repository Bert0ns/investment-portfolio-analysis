import React from 'react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, PieChart, MapPin, Building } from 'lucide-react';
import { GeographicExposure } from '@/lib/math';

interface GeographicResultsProps {
  query: string;
  setQuery: (q: string) => void;
  results: GeographicExposure[];
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
          placeholder="Search country (e.g. Japan, United States)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {query.length > 0 && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-60 mt-12">
            <MapPin className="w-12 h-12 mb-4" />
            <p>No exposure found in &quot;{query}&quot;</p>
          </div>
        )}

        {query.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-60 mt-12">
            <Search className="w-12 h-12 mb-4" />
            <p>Type a country or click the map</p>
          </div>
        )}

        {results.map((res) => {
          const translatedCountry =
            t.countries[res.countryName as keyof typeof t.countries] || res.countryName;

          return (
            <Card key={res.countryName} className="border-border">
              <CardHeader className="pb-2 border-b border-border/40 bg-muted/20">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {translatedCountry}
                  </CardTitle>
                  <div className="text-right">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-0.5">
                      Total Exposure
                    </span>
                    <span className="text-xl font-black text-primary">
                      {res.totalWeight.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                {/* Supplying ETFs */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5" /> Exposure Source (ETFs)
                  </h4>
                  <div className="space-y-2">
                    {res.etfBreakdown.map((b) => (
                      <div
                        key={b.etfId}
                        className="flex justify-between text-sm bg-muted/40 p-2 rounded-md border border-border/30"
                      >
                        <span className="truncate pr-4 font-medium">{b.etfName}</span>
                        <span className="font-semibold shrink-0">{b.contribution.toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Companies */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> Top Companies in {translatedCountry}
                  </h4>
                  <div className="space-y-2">
                    {res.companies.slice(0, 10).map((comp, idx) => (
                      <div
                        key={comp.ticker + idx}
                        className="flex justify-between text-sm items-center"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <span className="font-medium block truncate" title={comp.name}>
                            {comp.name}
                          </span>
                          {comp.ticker !== 'N/A' && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {comp.ticker}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-primary shrink-0">
                          {comp.totalWeight.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                    {res.companies.length > 10 && (
                      <div className="text-xs text-center text-muted-foreground pt-2">
                        + {res.companies.length - 10} more companies
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
