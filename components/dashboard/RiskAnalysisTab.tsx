import React from 'react';
import { ConcentrationChart } from '@/components/charts/ConcentrationChart';
import { DistributionChart } from '@/components/charts/DistributionChart';
import { useTranslation } from '@/lib/i18n/LanguageContext';

type ChartData = { name: string; value: number }[];

interface RiskAnalysisTabProps {
  concentrationData: ChartData;
  weightDistributionData: ChartData;
}

export function RiskAnalysisTab({
  concentrationData,
  weightDistributionData,
}: RiskAnalysisTabProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <ConcentrationChart data={concentrationData} />
      </div>

      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <DistributionChart data={weightDistributionData} />
      </div>
    </>
  );
}
