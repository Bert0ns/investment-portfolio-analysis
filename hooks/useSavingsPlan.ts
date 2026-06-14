import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { calculateSavingsPlanProjection, SavingsPlanResult } from '@/lib/math';

export function useSavingsPlan() {
  const [initialInvestment, setInitialInvestment] = useLocalStorage('savings_initial', 0);
  const [monthlyContribution, setMonthlyContribution] = useLocalStorage('savings_monthly', 833);
  const [years, setYears] = useLocalStorage('savings_years', 10);
  const [expectedReturn, setExpectedReturn] = useLocalStorage('savings_return', 6);
  const [stopAccumulatingMonths, setStopAccumulatingMonths] = useLocalStorage('savings_stop', 6);

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
