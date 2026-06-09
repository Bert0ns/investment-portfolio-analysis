'use client';

import React, { useState, useMemo } from 'react';
import { EtfConfig } from '../lib/types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
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

interface SavingsPlanCalculatorProps {
  etfs: EtfConfig[];
  totalWeight: number;
}

export function SavingsPlanCalculator({ etfs, totalWeight }: SavingsPlanCalculatorProps) {
  const [initialInvestment, setInitialInvestment] = useState(5000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState(20);
  const [expectedReturn, setExpectedReturn] = useState(6);
  const [stopAccumulatingMonths, setStopAccumulatingMonths] = useState(240);

  const activeEtfs = etfs.filter((e) => e.globalWeight > 0);
  const clampedStopMonths = Math.min(stopAccumulatingMonths, years * 12);

  const { chartData, finalTotalValue, finalInvested } = useMemo(() => {
    const data = [];
    const monthlyRate = expectedReturn / 100 / 12;
    const totalMonths = years * 12;

    let currentTotal = initialInvestment;
    let currentInvested = initialInvestment;

    data.push({
      year: 0,
      invested: currentInvested,
      value: Math.round(currentTotal),
    });

    for (let m = 1; m <= totalMonths; m++) {
      const currentContribution = m <= clampedStopMonths ? monthlyContribution : 0;
      currentTotal = currentTotal * (1 + monthlyRate) + currentContribution;
      currentInvested += currentContribution;

      if (m % 12 === 0 || m === totalMonths) {
        const yearPoint = data.find((d) => d.year === m / 12);
        if (!yearPoint) {
          data.push({
            year: m / 12,
            invested: currentInvested,
            value: Math.round(currentTotal),
          });
        }
      }
    }

    return {
      chartData: data,
      finalTotalValue: currentTotal,
      finalInvested: currentInvested,
    };
  }, [initialInvestment, monthlyContribution, years, expectedReturn, clampedStopMonths]);

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
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Invested</h4>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(finalInvested)}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20 hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <TrendingUp className="mb-2 text-emerald-600" size={28} />
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Total Interest Earned
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
            <h4 className="text-sm font-medium opacity-90 mb-1">Projected Future Value</h4>
            <p className="text-3xl font-bold">{formatCurrency(finalTotalValue)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Chart & Buying Plan */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Growth Projection over {years} Years</CardTitle>
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
                      tickFormatter={(val) => `Year ${val}`}
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
                      formatter={(value: any) => formatCurrency(Number(value) || 0)}
                      labelFormatter={(label) => `Year ${label}`}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Total Value"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="invested"
                      name="Invested Capital"
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
              <CardTitle>Next Month's Buying Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {totalWeight === 0 ? (
                <div className="py-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  Allocate some weight to your ETFs to see the dynamic buying plan.
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    To maintain your precise target allocations, here is exactly how to distribute
                    your next <strong>{formatCurrency(monthlyContribution)}</strong> contribution:
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
                              {((etf.globalWeight / totalWeight) * 100).toFixed(1)}% Weight
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
                        Your total portfolio weight is currently{' '}
                        <strong>{totalWeight.toFixed(1)}%</strong> instead of 100%. The monetary
                        amounts shown above have been mathematically normalized to proportionally
                        match your {formatCurrency(monthlyContribution)} contribution.
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
                Plan Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">Initial Investment</label>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">
                      $
                    </span>
                    <Input
                      type="number"
                      value={initialInvestment}
                      onChange={(e) => setInitialInvestment(Number(e.target.value) || 0)}
                      className="h-8 pl-6 pr-2 text-right font-bold text-primary bg-primary/10 border-primary/20 focus-visible:ring-primary/30"
                    />
                  </div>
                </div>
                <Slider
                  value={[initialInvestment]}
                  max={100000}
                  step={1000}
                  onValueChange={(val) => setInitialInvestment(Array.isArray(val) ? val[0] : val)}
                  className="py-1"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">
                    Monthly Contribution
                  </label>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">
                      $
                    </span>
                    <Input
                      type="number"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(Number(e.target.value) || 0)}
                      className="h-8 pl-6 pr-2 text-right font-bold text-primary bg-primary/10 border-primary/20 focus-visible:ring-primary/30"
                    />
                  </div>
                </div>
                <Slider
                  value={[monthlyContribution]}
                  max={5000}
                  step={50}
                  onValueChange={(val) => setMonthlyContribution(Array.isArray(val) ? val[0] : val)}
                  className="py-1"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">Duration</label>
                  <div className="relative w-24">
                    <Input
                      type="number"
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value) || 0)}
                      className="h-8 pr-10 text-right font-bold text-primary bg-primary/10 border-primary/20 focus-visible:ring-primary/30"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold pointer-events-none">
                      Yrs
                    </span>
                  </div>
                </div>
                <Slider
                  value={[years]}
                  max={40}
                  step={1}
                  onValueChange={(val) => setYears(Array.isArray(val) ? val[0] : val)}
                  className="py-1"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">
                    Expected Return (Yearly)
                  </label>
                  <div className="relative w-20">
                    <Input
                      type="number"
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(Number(e.target.value) || 0)}
                      className="h-8 pr-6 text-right font-bold text-emerald-600 bg-emerald-500/10 border-emerald-500/20 focus-visible:ring-emerald-500/30"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-bold pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
                <Slider
                  value={[expectedReturn]}
                  max={15}
                  step={0.5}
                  onValueChange={(val) => setExpectedReturn(Array.isArray(val) ? val[0] : val)}
                  className="py-1 [&_[role=slider]]:border-emerald-500 [&_.bg-primary]:bg-emerald-500"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Historically, the S&P 500 averages ~7-10% annually.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-dashed">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">
                    Stop Contributing After
                  </label>
                  <div className="relative w-24">
                    <Input
                      type="number"
                      value={clampedStopMonths}
                      onChange={(e) => setStopAccumulatingMonths(Number(e.target.value) || 0)}
                      className="h-8 pr-9 text-right font-bold text-blue-600 bg-blue-500/10 border-blue-500/20 focus-visible:ring-blue-500/30"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 text-xs font-bold pointer-events-none">
                      Mo
                    </span>
                  </div>
                </div>
                <Slider
                  value={[clampedStopMonths]}
                  max={years * 12}
                  step={1}
                  onValueChange={(val) =>
                    setStopAccumulatingMonths(Array.isArray(val) ? val[0] : val)
                  }
                  className="py-1 [&_[role=slider]]:border-blue-500 [&_.bg-primary]:bg-blue-500"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Freeze investments after {Math.floor(clampedStopMonths / 12)} years and{' '}
                  {clampedStopMonths % 12} months, while interest continues to compound.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
