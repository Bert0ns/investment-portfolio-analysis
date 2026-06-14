import { useState, useMemo } from 'react';
import { calculateSavingsPlanProjection, SavingsPlanResult } from '@/lib/math';

export function useSavingsPlan() {
  const [initialInvestment, setInitialInvestment] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(833);
  const [years, setYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(6);
  const [stopAccumulatingMonths, setStopAccumulatingMonths] = useState(6);

  const clampedStopMonths = Math.min(stopAccumulatingMonths, years * 12);

  const projection: SavingsPlanResult = useMemo(() => {
    return calculateSavingsPlanProjection(
      initialInvestment,
      monthlyContribution,
      years,
      expectedReturn,
      clampedStopMonths
    );
  }, [initialInvestment, monthlyContribution, years, expectedReturn, clampedStopMonths]);

  return {
    initialInvestment,
    setInitialInvestment,
    monthlyContribution,
    setMonthlyContribution,
    years,
    setYears,
    expectedReturn,
    setExpectedReturn,
    stopAccumulatingMonths,
    setStopAccumulatingMonths,
    clampedStopMonths,
    projection,
  };
}
