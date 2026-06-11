import React from 'react';
import { ConcentrationChart } from '../charts/ConcentrationChart';
import { DistributionChart } from '../charts/DistributionChart';
import { PieChartCard } from '../charts/PieChartCard';

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
          title="Replication Method"
          info="How the ETFs track their indices: Physical (buying actual stocks) vs Synthetic (using derivatives)."
          data={replicationData}
          colorOffset={8}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title="Use of Profit"
          info="Accumulating (reinvests dividends automatically) vs Distributing (pays dividends out to you)."
          data={profitData}
          colorOffset={3}
        />
      </div>
    </>
  );
}
