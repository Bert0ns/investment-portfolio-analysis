import React from 'react';
import { PieChartCard } from '@/components/charts/PieChartCard';
import { EtfBarChartCard } from '@/components/charts/EtfBarChartCard';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { EtfConfig } from '@/lib/types';
import { TerRadarChart } from '@/components/dashboard/TerRadarChart';
import { VoronoiTreemap } from '@/components/dashboard/VoronoiTreemap';

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
          title={t.pages.analyzer.dashboard.tabs.fundDetailsTab.providerAllocationTitle}
          info={t.pages.analyzer.dashboard.tabs.fundDetailsTab.providerAllocationInfo}
          data={providerData}
          colorOffset={2}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.pages.analyzer.dashboard.tabs.fundDetailsTab.fundDomicileTitle}
          info={t.pages.analyzer.dashboard.tabs.fundDetailsTab.fundDomicileInfo}
          data={domicileData}
          colorOffset={1}
        />
      </div>

      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <EtfBarChartCard
          title={t.pages.analyzer.dashboard.tabs.fundDetailsTab.fundSizeTitle}
          info={t.pages.analyzer.dashboard.tabs.fundDetailsTab.fundSizeInfo}
          data={fundSizeData}
          unit={t.pages.analyzer.dashboard.tabs.fundDetailsTab.millionsUnit}
          colorOffset={5}
        />
      </div>

      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <EtfBarChartCard
          title={t.pages.analyzer.dashboard.tabs.fundDetailsTab.fundAgeTitle}
          info={t.pages.analyzer.dashboard.tabs.fundDetailsTab.fundAgeInfo}
          data={fundAgeData}
          unit={t.pages.analyzer.dashboard.tabs.fundDetailsTab.yearsUnit}
          colorOffset={7}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.pages.analyzer.dashboard.tabs.riskAnalysisTab.replicationMethodTitle}
          info={t.pages.analyzer.dashboard.tabs.riskAnalysisTab.replicationMethodInfo}
          data={replicationData}
          colorOffset={8}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.pages.analyzer.dashboard.tabs.riskAnalysisTab.useOfProfitTitle}
          info={t.pages.analyzer.dashboard.tabs.riskAnalysisTab.useOfProfitInfo}
          data={profitData}
          colorOffset={3}
        />
      </div>

      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <TerRadarChart etfs={etfs} />
      </div>

      <div className="lg:col-span-2 mt-4">
        <VoronoiTreemap etfs={etfs} />
      </div>
    </>
  );
}
