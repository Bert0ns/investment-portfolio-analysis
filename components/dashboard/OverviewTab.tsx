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
          title={t.overviewTab.etfAllocationTitle}
          info={t.overviewTab.etfAllocationInfo}
          data={etfAllocationData}
          colorOffset={6}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.overviewTab.sectorExposureTitle}
          info={t.overviewTab.sectorExposureInfo}
          data={sectorData}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.overviewTab.geoExposureTitle}
          info={t.overviewTab.geoExposureInfo}
          data={geoData.slice(0, 10)}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title={t.overviewTab.currencyExposureTitle}
          info={t.overviewTab.currencyExposureInfo}
          data={currencyData}
          colorOffset={4}
        />
      </div>
    </>
  );
}
