import React from 'react';
import { ConcentrationChart } from '../charts/ConcentrationChart';
import { DistributionChart } from '../charts/DistributionChart';
import { PieChartCard } from '../charts/PieChartCard';
import { useTranslation } from '../../lib/i18n/LanguageContext';

type ChartData = { name: string; value: number }[];

interface RiskAnalysisTabProps {
  concentrationData: ChartData;
  weightDistributionData: ChartData;
  replicationData: ChartData;
  profitData: ChartData;
}

export function RiskAnalysisTab({
  concentrationData,
  weightDistributionData,
  replicationData,
  profitData,
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

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.riskAnalysisTab.replicationMethodTitle}
          info={t.riskAnalysisTab.replicationMethodInfo}
          data={replicationData}
          colorOffset={8}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.riskAnalysisTab.useOfProfitTitle}
          info={t.riskAnalysisTab.useOfProfitInfo}
          data={profitData}
          colorOffset={3}
        />
      </div>
    </>
  );
}
