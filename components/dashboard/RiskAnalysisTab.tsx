import React from 'react';
import { ConcentrationChart } from '@/components/charts/ConcentrationChart';
import { DistributionChart } from '@/components/charts/DistributionChart';
import { DiversificationCharts } from '@/components/dashboard/DiversificationCharts';
import { EtfConfig } from '@/lib/types';

type ChartData = { name: string; value: number }[];

interface RiskAnalysisTabProps {
  concentrationData: ChartData;
  weightDistributionData: ChartData;
  etfs: EtfConfig[];
}

export function RiskAnalysisTab({
  concentrationData,
  weightDistributionData,
  etfs,
}: RiskAnalysisTabProps) {
  return (
    <>
      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <ConcentrationChart data={concentrationData} />
      </div>

      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <DistributionChart data={weightDistributionData} />
      </div>

      <DiversificationCharts etfs={etfs} />
    </>
  );
}
