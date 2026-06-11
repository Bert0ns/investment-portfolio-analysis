import React from 'react';
import { PieChartCard } from '../charts/PieChartCard';
import { EtfBarChartCard } from '../charts/EtfBarChartCard';
import { useTranslation } from '../../lib/i18n/LanguageContext';

type ChartData = { name: string; value: number }[];

interface FundDetailsTabProps {
  providerData: ChartData;
  domicileData: ChartData;
  fundSizeData: ChartData;
  fundAgeData: ChartData;
}

export function FundDetailsTab({
  providerData,
  domicileData,
  fundSizeData,
  fundAgeData,
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
    </>
  );
}
