import React from 'react';
import { PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HoldingSearchResult } from '@/lib/math';
import { Dictionary } from '@/lib/i18n';

interface CompanyResultCardProps {
  result: HoldingSearchResult;
  t: Dictionary;
}

export function CompanyResultCard({ result, t }: CompanyResultCardProps) {
  return (
    <Card className="flex flex-col hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold leading-tight">{result.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              {result.ticker !== 'N/A'
                ? result.ticker
                : t.pages.analyzer.dashboard.tabs.deepDiveTab.unknownTicker}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {t.pages.analyzer.dashboard.tabs.deepDiveTab.totalExposure}
            </p>
            <p className="text-2xl font-black text-primary">{result.totalWeight.toFixed(2)}%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5" />
            {t.pages.analyzer.dashboard.tabs.deepDiveTab.exposureBreakdown}
          </p>
          {result.breakdown.map((b) => (
            <div
              key={b.etfId}
              className="bg-muted/30 p-3 rounded-lg flex justify-between items-center border border-border/30"
            >
              <div className="min-w-0 flex-1 pr-4">
                <p className="font-medium text-sm truncate">{b.etfName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.pages.analyzer.dashboard.tabs.deepDiveTab.fundInternalWeight}:{' '}
                  {b.internalWeight.toFixed(2)}%
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">+{b.contribution.toFixed(2)}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
