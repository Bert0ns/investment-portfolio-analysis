'use client';

import React from 'react';
import { EtfConfig } from '@/lib/types';
import { useSavingsPlan } from '@/hooks/useSavingsPlan';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { SavingsPlanKPICards } from './SavingsPlanKPICards';
import { SavingsPlanChart } from './SavingsPlanChart';
import { NextMonthBuyingPlan } from './NextMonthBuyingPlan';
import { SavingsPlanSettings } from './SavingsPlanSettings';

export interface SavingsPlanCalculatorProps {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SavingsPlanKPICards finalInvested={finalInvested} finalTotalValue={finalTotalValue} t={t} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SavingsPlanChart chartData={chartData} years={years} t={t} />
          <NextMonthBuyingPlan
            etfs={etfs}
            totalWeight={totalWeight}
            monthlyContribution={monthlyContribution}
            t={t}
          />
        </div>

        <div className="lg:col-span-1">
          <SavingsPlanSettings
            initialInvestment={initialInvestment}
            setInitialInvestment={setInitialInvestment}
            monthlyContribution={monthlyContribution}
            setMonthlyContribution={setMonthlyContribution}
            years={years}
            setYears={setYears}
            expectedReturn={expectedReturn}
            setExpectedReturn={setExpectedReturn}
            setStopAccumulatingMonths={setStopAccumulatingMonths}
            clampedStopMonths={clampedStopMonths}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
