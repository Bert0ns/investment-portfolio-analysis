import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import { formatCurrency } from './utils';

export function SavingsPlanKPICards({
  finalInvested,
  finalTotalValue,
  t,
}: {
  finalInvested: number;
  finalTotalValue: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="bg-muted/10 border-border/50 hover:shadow-md transition-shadow">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <Wallet className="mb-2 text-blue-500" size={28} />
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            {t.savingsPlan.totalInvested}
          </h4>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(finalInvested)}</p>
        </CardContent>
      </Card>
      <Card className="bg-emerald-500/5 border-emerald-500/20 hover:shadow-md transition-shadow">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <TrendingUp className="mb-2 text-emerald-600" size={28} />
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            {t.savingsPlan.totalInterestEarned}
          </h4>
          <p className="text-3xl font-bold text-emerald-600">
            {formatCurrency(finalTotalValue - finalInvested)}
          </p>
        </CardContent>
      </Card>
      <Card className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <PiggyBank size={80} />
        </div>
        <CardContent className="pt-6 flex flex-col items-center text-center relative z-10">
          <PiggyBank className="mb-2 text-primary-foreground opacity-90" size={28} />
          <h4 className="text-sm font-medium opacity-90 mb-1">
            {t.savingsPlan.projectedFutureValue}
          </h4>
          <p className="text-3xl font-bold">{formatCurrency(finalTotalValue)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
