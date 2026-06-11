import React from 'react';
import { PieChartCard } from '../charts/PieChartCard';
import { EtfBarChartCard } from '../charts/EtfBarChartCard';

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
  return (
    <>
      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title="Provider Allocation"
          info="A breakdown of the financial institutions that manage your ETFs (e.g., Vanguard, iShares)."
          data={providerData}
          colorOffset={2}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title="Fund Domicile"
          info="The legal jurisdiction where your ETFs are registered (important for taxation)."
          data={domicileData}
          colorOffset={1}
        />
      </div>

      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <EtfBarChartCard
          title="Fund Size"
          info="Total Assets Under Management (AUM) for each ETF in your portfolio (in millions)."
          data={fundSizeData}
          unit="$M"
          colorOffset={5}
        />
      </div>

      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <EtfBarChartCard
          title="Fund Age"
          info="The number of years since each ETF was launched."
          data={fundAgeData}
          unit="Years"
          colorOffset={7}
        />
      </div>
    </>
  );
}
