import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EtfConfig } from '@/lib/types';
import { formatCurrency } from './utils';

export function NextMonthBuyingPlan({
  etfs,
  totalWeight,
  monthlyContribution,
  t,
}: {
  etfs: EtfConfig[];
  totalWeight: number;
  monthlyContribution: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  const activeEtfs = etfs.filter((e) => e.globalWeight > 0);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>{t.savingsPlan.nextMonthBuyingPlan}</CardTitle>
      </CardHeader>
      <CardContent>
        {totalWeight === 0 ? (
          <div className="py-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            {t.savingsPlan.allocateWeightMsg}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t.savingsPlan.maintainTargetMsg}{' '}
              <strong>{formatCurrency(monthlyContribution)}</strong> {t.savingsPlan.contribution}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeEtfs.map((etf) => {
                const amountToBuy = monthlyContribution * (etf.globalWeight / totalWeight);
                return (
                  <div
                    key={etf.id}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-sm text-foreground leading-tight mb-1">
                        {etf.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium bg-muted inline-block px-1.5 py-0.5 rounded">
                        {((etf.globalWeight / totalWeight) * 100).toFixed(1)}%{' '}
                        {t.savingsPlan.weight}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-primary ml-4 shrink-0">
                      {formatCurrency(amountToBuy)}
                    </span>
                  </div>
                );
              })}
            </div>
            {totalWeight !== 100 && (
              <div className="mt-4 text-xs text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 p-4 rounded-lg border border-amber-200 dark:border-amber-500/20 flex items-start gap-2">
                <div className="shrink-0 mt-0.5">⚠️</div>
                <p>
                  {t.savingsPlan.warningPortfolioWeight} <strong>{totalWeight.toFixed(1)}%</strong>{' '}
                  {t.savingsPlan.warningPortfolioNormalized} {formatCurrency(monthlyContribution)}.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
