import React from 'react';
import { PieChartCard } from '@/components/charts/PieChartCard';
import { EtfBarChartCard } from '@/components/charts/EtfBarChartCard';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { EtfConfig } from '@/lib/types';
import { TerRadarChart } from '@/components/dashboard/TerRadarChart';

type ChartData = { name: string; value: number }[];

interface FundDetailsTabProps {
  providerData: ChartData;
  domicileData: ChartData;
  fundSizeData: ChartData;
  fundAgeData: ChartData;
  replicationData: ChartData;
  profitData: ChartData;
  etfs: EtfConfig[];
}

export function FundDetailsTab({
  providerData,
  domicileData,
  fundSizeData,
  fundAgeData,
  replicationData,
  profitData,
  etfs,
}: FundDetailsTabProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.fundDetailsTab.providerAllocationTitle}
          info={t.fundDetailsTab.providerAllocationInfo}
          data={providerData}
          colorOffset={2}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.fundDetailsTab.fundDomicileTitle}
          info={t.fundDetailsTab.fundDomicileInfo}
          data={domicileData}
          colorOffset={1}
        />
      </div>

      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <EtfBarChartCard
          title={t.fundDetailsTab.fundSizeTitle}
          info={t.fundDetailsTab.fundSizeInfo}
          data={fundSizeData}
          unit={t.fundDetailsTab.millionsUnit}
          colorOffset={5}
        />
      </div>

      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <EtfBarChartCard
          title={t.fundDetailsTab.fundAgeTitle}
          info={t.fundDetailsTab.fundAgeInfo}
          data={fundAgeData}
          unit={t.fundDetailsTab.yearsUnit}
          colorOffset={7}
        />
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

      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <TerRadarChart etfs={etfs} />
      </div>
    </>
  );
}
