import React, { useState, useMemo } from 'react';
import { Search, Building, PieChart } from 'lucide-react';
import { EtfConfig } from '../../lib/types';
import { searchHoldings } from '../../lib/math';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useDebounce } from '../../hooks/useDebounce';

interface DeepDiveTabProps {
  etfs: EtfConfig[];
}

export function DeepDiveTab({ etfs }: DeepDiveTabProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const results = useMemo(() => {
    return searchHoldings(etfs, debouncedQuery);
  }, [etfs, debouncedQuery]);

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-md">
        <CardHeader className="bg-muted/20 border-b border-border pb-6">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            Holdings Deep Dive
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Search for specific assets (e.g., "NVIDIA", "Apple", "TSLA") across all your parsed ETFs
            to discover your true aggregate exposure.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search by company name or ticker..."
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
            <p className="text-lg">No holdings found matching "{query}"</p>
            <p className="text-sm mt-2">Try a different company name or ticker symbol.</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.slice(0, 50).map((result) => (
            <Card
              key={result.ticker + result.name}
              className="flex flex-col hover:border-primary/40 transition-colors"
            >
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold leading-tight">{result.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                      {result.ticker !== 'N/A' ? result.ticker : 'Unknown Ticker'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Total Exposure
                    </p>
                    <p className="text-2xl font-black text-primary">
                      {result.totalWeight.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5" />
                    Exposure Breakdown
                  </p>
                  {result.breakdown.map((b) => (
                    <div
                      key={b.etfId}
                      className="bg-muted/30 p-3 rounded-lg flex justify-between items-center border border-border/30"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="font-medium text-sm truncate">{b.etfName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Fund internal weight: {b.internalWeight.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground">
                          +{b.contribution.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
