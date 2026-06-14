'use client';

import React from 'react';
import { EtfConfig } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSavingsPlan } from '@/hooks/useSavingsPlan';
import { SettingsSlider } from '@/components/SettingsSlider';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface SavingsPlanCalculatorProps {
  etfs: EtfConfig[];
  totalWeight: number;
}

export function SavingsPlanCalculator({ etfs, totalWeight }: SavingsPlanCalculatorProps) {
  const { t } = useTranslation();
  const {
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
    projection: { chartData, finalTotalValue, finalInvested },
  } = useSavingsPlan();

  const activeEtfs = etfs.filter((e) => e.globalWeight > 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Summary (Top) */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Chart & Buying Plan */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>
                {t.savingsPlan.growthProjection} {years} {t.savingsPlan.years}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 350, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border)"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="year"
                      tickFormatter={(val) => `${t.savingsPlan.year} ${val}`}
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      tickFormatter={(val) =>
                        `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`
                      }
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip
                      formatter={(
                        value: string | number | readonly (string | number)[] | undefined
                      ) => formatCurrency(Number(value) || 0)}
                      labelFormatter={(label) => `${t.savingsPlan.year} ${label}`}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name={t.savingsPlan.totalValue}
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="invested"
                      name={t.savingsPlan.investedCapital}
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorInvested)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

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
                    <strong>{formatCurrency(monthlyContribution)}</strong>{' '}
                    {t.savingsPlan.contribution}
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
                        {t.savingsPlan.warningPortfolioWeight}{' '}
                        <strong>{totalWeight.toFixed(1)}%</strong>{' '}
                        {t.savingsPlan.warningPortfolioNormalized}{' '}
                        {formatCurrency(monthlyContribution)}.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Calculator Settings */}
        <div className="lg:col-span-1">
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
        </div>
      </div>
    </div>
  );
}
