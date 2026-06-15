import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SettingsSlider } from '@/components/SettingsSlider';
import { Wallet } from 'lucide-react';

export function SavingsPlanSettings({
  initialInvestment,
  setInitialInvestment,
  monthlyContribution,
  setMonthlyContribution,
  years,
  setYears,
  expectedReturn,
  setExpectedReturn,
  setStopAccumulatingMonths,
  clampedStopMonths,
  t,
}: {
  initialInvestment: number;
  setInitialInvestment: (v: number) => void;
  monthlyContribution: number;
  setMonthlyContribution: (v: number) => void;
  years: number;
  setYears: (v: number) => void;
  expectedReturn: number;
  setExpectedReturn: (v: number) => void;
  setStopAccumulatingMonths: (v: number) => void;
  clampedStopMonths: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  return (
    <Card className="sticky top-6 shadow-md border-border/60">
      <CardHeader className="bg-muted/30 border-b pb-4 mb-4">
        <CardTitle className="flex items-center gap-2">
          <Wallet size={18} className="text-primary" />
          {t.savingsPlan.planSettings}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <SettingsSlider
          label={t.savingsPlan.initialInvestment}
          value={initialInvestment}
          onChange={setInitialInvestment}
          max={100000}
          step={1000}
          prefix={
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">
              $
            </span>
          }
        />

        <SettingsSlider
          label={t.savingsPlan.monthlyContribution}
          value={monthlyContribution}
          onChange={setMonthlyContribution}
          max={5000}
          step={50}
          prefix={
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">
              $
            </span>
          }
        />

        <SettingsSlider
          label={t.savingsPlan.duration}
          value={years}
          onChange={setYears}
          max={40}
          step={1}
          inputWidth="w-24"
          inputClassName="h-8 pr-10 text-right font-bold text-primary bg-primary/10 border-primary/20 focus-visible:ring-primary/30"
          suffix={
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold pointer-events-none">
              {t.savingsPlan.yearsShort}
            </span>
          }
        />

        <SettingsSlider
          label={t.savingsPlan.expectedReturn}
          value={expectedReturn}
          onChange={setExpectedReturn}
          max={15}
          step={0.5}
          inputWidth="w-20"
          inputClassName="h-8 pr-6 text-right font-bold text-emerald-600 bg-emerald-500/10 border-emerald-500/20 focus-visible:ring-emerald-500/30"
          sliderClassName="py-1 [&_[role=slider]]:border-emerald-500 [&_.bg-primary]:bg-emerald-500"
          suffix={
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-bold pointer-events-none">
              %
            </span>
          }
          description={t.savingsPlan.historicalAverage}
        />

        <SettingsSlider
          label={t.savingsPlan.stopContributingAfter}
          value={clampedStopMonths}
          onChange={setStopAccumulatingMonths}
          max={years * 12}
          step={1}
          wrapperClassName="space-y-3 pt-4 border-t border-dashed"
          inputWidth="w-24"
          inputClassName="h-8 pr-9 text-right font-bold text-blue-600 bg-blue-500/10 border-blue-500/20 focus-visible:ring-blue-500/30"
          sliderClassName="py-1 [&_[role=slider]]:border-blue-500 [&_.bg-primary]:bg-blue-500"
          suffix={
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 text-xs font-bold pointer-events-none">
              {t.savingsPlan.monthsShort}
            </span>
          }
          description={`${t.savingsPlan.freezeInvestments} ${Math.floor(clampedStopMonths / 12)} ${t.savingsPlan.years.toLowerCase()} ${t.savingsPlan.duration ? 'e' : 'and'} ${clampedStopMonths % 12} ${t.savingsPlan.months}`}
        />
      </CardContent>
    </Card>
  );
}
