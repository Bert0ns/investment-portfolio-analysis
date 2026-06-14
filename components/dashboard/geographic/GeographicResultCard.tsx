import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, MapPin, Building } from 'lucide-react';
import { CountrySearchResult } from '@/lib/math';

interface GeographicResultCardProps {
  res: CountrySearchResult;
  translatedCountry: string;
}

export function GeographicResultCard({ res, translatedCountry }: GeographicResultCardProps) {
  return (
    <Card className="border-border">
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
            <span className="text-xl font-black text-primary">{res.totalWeight.toFixed(2)}%</span>
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
              <div key={comp.ticker + idx} className="flex justify-between text-sm items-center">
                <div className="flex-1 min-w-0 pr-4">
                  <span className="font-medium block truncate" title={comp.name}>
                    {comp.name}
                  </span>
                  {comp.ticker !== 'N/A' && (
                    <span className="text-xs text-muted-foreground font-mono">{comp.ticker}</span>
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
}
