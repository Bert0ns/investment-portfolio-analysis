'use client';

import React, { useState } from 'react';
import { EtfConfig } from '../lib/types';
import { useDashboardData } from '../hooks/useDashboardData';
import { Card, CardContent } from './ui/card';

// Extracted Chart Components
import { TopHoldingsChart } from './charts/TopHoldingsChart';
import { PieChartCard } from './charts/PieChartCard';
import { ConcentrationChart } from './charts/ConcentrationChart';
import { DistributionChart } from './charts/DistributionChart';
import { EtfBarChartCard } from './charts/EtfBarChartCard';
import { SavingsPlanCalculator } from './SavingsPlanCalculator';
import dynamic from 'next/dynamic';

const ExposureGlobe = dynamic(
  () => import('./charts/ExposureGlobe').then((mod) => mod.ExposureGlobe),
  {
    ssr: false,
    loading: () => <div className="h-[450px] bg-card animate-pulse border border-white/10" />,
  }
);

interface DashboardProps {
  etfs: EtfConfig[];
  totalWeight: number;
}

export default function Dashboard({ etfs, totalWeight }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'Overview' | '3D Visuals' | 'Fund Details' | 'Risk Analysis' | 'Savings Plan'
  >('Overview');

  const {
    geoData,
    sectorData,
    currencyData,
    etfAllocationData,
    topHoldings,
    avgTer,
    providerData,
    replicationData,
    profitData,
    domicileData,
    fundSizeData,
    fundAgeData,
    concentrationData,
    weightDistributionData,
  } = useDashboardData(etfs);

  if (etfs.length === 0 || totalWeight === 0) {
    return (
      <Card className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-100 h-full border-dashed">
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium text-foreground mb-2">No Data to Display</h3>
          <p>Add ETFs and allocate weight to see your portfolio analysis.</p>
        </CardContent>
      </Card>
    );
  }

  const tabs: Array<'Overview' | '3D Visuals' | 'Fund Details' | 'Risk Analysis' | 'Savings Plan'> =
    ['Overview', '3D Visuals', 'Fund Details', 'Risk Analysis', 'Savings Plan'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-0 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Weighted Avg TER</h3>
            <p className="text-3xl font-bold text-foreground">{avgTer.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-0 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Total Assets Analyzed
            </h3>
            <p className="text-3xl font-bold text-foreground">
              {etfs.reduce((sum, etf) => sum + etf.holdings.length, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-0 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Active ETFs</h3>
            <p className="text-3xl font-bold text-foreground">
              {etfs.filter((e) => e.globalWeight > 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigator */}
      <div className="flex gap-1 overflow-x-auto whitespace-nowrap bg-muted/50 p-1.5 rounded-xl w-full max-w-full lg:max-w-fit shadow-sm scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm scale-100'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80 scale-95 hover:scale-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 fade-in duration-500">
        {activeTab === 'Overview' && (
          <>
            <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
              <TopHoldingsChart data={topHoldings} />
            </div>

            <div className="transition-transform hover:scale-[1.02] duration-300">
              <PieChartCard
                title="ETF Allocation"
                info="A macro-level breakdown of the weights you assigned to each individual ETF in your portfolio."
                data={etfAllocationData}
                colorOffset={6}
              />
            </div>

            <div className="transition-transform hover:scale-[1.02] duration-300">
              <PieChartCard
                title="Sector Exposure"
                info="The industry breakdown (e.g., Technology, Healthcare) of the underlying companies in your portfolio."
                data={sectorData}
              />
            </div>

            <div className="transition-transform hover:scale-[1.02] duration-300">
              <PieChartCard
                title="Geographic Exposure"
                info="A breakdown of the physical country locations of the underlying companies in your portfolio."
                data={geoData.slice(0, 10)}
              />
            </div>

            <div className="transition-transform hover:scale-[1.02] duration-300">
              <PieChartCard
                title="Currency Exposure"
                info="Your risk exposure to different foreign exchange currencies based on the trading currency of your underlying assets."
                data={currencyData}
                colorOffset={4}
              />
            </div>
          </>
        )}

        {activeTab === 'Fund Details' && (
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
        )}

        {activeTab === 'Risk Analysis' && (
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
        )}

        {activeTab === 'Savings Plan' && (
          <div className="lg:col-span-2 transition-transform duration-300 animate-in fade-in">
            <SavingsPlanCalculator etfs={etfs} totalWeight={totalWeight} />
          </div>
        )}

        {activeTab === '3D Visuals' && (
          <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300 animate-in fade-in">
            <ExposureGlobe data={geoData} />
          </div>
        )}
      </div>
    </div>
  );
}
