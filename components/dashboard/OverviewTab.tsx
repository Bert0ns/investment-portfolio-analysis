import React from 'react';
import { TopHoldingsChart } from '@/components/charts/TopHoldingsChart';
import { PieChartCard } from '@/components/charts/PieChartCard';
import { useTranslation } from '@/lib/i18n/LanguageContext';

type ChartData = { name: string; value: number }[];

interface OverviewTabProps {
  topHoldings: ChartData;
  etfAllocationData: ChartData;
  sectorData: ChartData;
  geoData: ChartData;
  currencyData: ChartData;
}

export function OverviewTab({
  topHoldings,
  etfAllocationData,
  sectorData,
  geoData,
  currencyData,
}: OverviewTabProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <TopHoldingsChart data={topHoldings} />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.pages.analyzer.dashboard.tabs.overviewTab.etfAllocationTitle}
          info={t.pages.analyzer.dashboard.tabs.overviewTab.etfAllocationInfo}
          data={etfAllocationData}
          colorOffset={6}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.pages.analyzer.dashboard.tabs.overviewTab.sectorExposureTitle}
          info={t.pages.analyzer.dashboard.tabs.overviewTab.sectorExposureInfo}
          data={sectorData}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.pages.analyzer.dashboard.tabs.overviewTab.geoExposureTitle}
          info={t.pages.analyzer.dashboard.tabs.overviewTab.geoExposureInfo}
          data={geoData}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.pages.analyzer.dashboard.tabs.overviewTab.currencyExposureTitle}
          info={t.pages.analyzer.dashboard.tabs.overviewTab.currencyExposureInfo}
          data={currencyData}
          colorOffset={4}
        />
      </div>
    </>
  );
}
