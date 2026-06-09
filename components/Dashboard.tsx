'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { EtfConfig } from '../lib/types';
import { aggregateBy, aggregateTopHoldings, calculateAverageTer } from '../lib/math';
import { Card, CardContent } from './ui/card';

// Extracted Chart Components
import { TopHoldingsChart } from './charts/TopHoldingsChart';
import { PieChartCard } from './charts/PieChartCard';
import { ConcentrationChart } from './charts/ConcentrationChart';
import { DistributionChart } from './charts/DistributionChart';
import { EtfBarChartCard } from './charts/EtfBarChartCard';

interface DashboardProps {
  etfs: EtfConfig[];
  totalWeight: number;
}

export default function Dashboard({ etfs, totalWeight }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Fund Details' | 'Risk Analysis'>(
    'Overview'
  );

  const geoData = useMemo(() => aggregateBy(etfs, 'country').slice(0, 10), [etfs]);
  const sectorData = useMemo(() => aggregateBy(etfs, 'sector').slice(0, 10), [etfs]);
  const currencyData = useMemo(() => aggregateBy(etfs, 'currency').slice(0, 5), [etfs]);
  const etfAllocationData = useMemo(() => {
    return etfs
      .filter((e) => e.globalWeight > 0)
      .map((e) => ({
        name: e.name,
        value: e.globalWeight,
      }))
      .sort((a, b) => b.value - a.value);
  }, [etfs]);
  const topHoldings = useMemo(() => aggregateTopHoldings(etfs, 10), [etfs]);
  const avgTer = useMemo(() => calculateAverageTer(etfs), [etfs]);

  const aggregateEtfProperty = useCallback(
    (property: keyof EtfConfig) => {
      const map = new Map<string, number>();
      for (const etf of etfs) {
        if (etf.globalWeight > 0) {
          const val = String(etf[property] || 'Unknown');
          map.set(val, (map.get(val) || 0) + etf.globalWeight);
        }
      }
      return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    },
    [etfs]
  );

  const providerData = useMemo(() => aggregateEtfProperty('issuer'), [aggregateEtfProperty]);
  const replicationData = useMemo(
    () => aggregateEtfProperty('replicationMethod'),
    [aggregateEtfProperty]
  );
  const profitData = useMemo(() => aggregateEtfProperty('useOfProfit'), [aggregateEtfProperty]);
  const domicileData = useMemo(() => aggregateEtfProperty('domicile'), [aggregateEtfProperty]);

  const fundSizeData = useMemo(
    () =>
      etfs
        .filter((e) => e.globalWeight > 0)
        .map((e) => ({ name: e.name, value: e.fundSize || 0 }))
        .sort((a, b) => b.value - a.value),
    [etfs]
  );
  const fundAgeData = useMemo(
    () =>
      etfs
        .filter((e) => e.globalWeight > 0)
        .map((e) => ({ name: e.name, value: e.fundAge || 0 }))
        .sort((a, b) => b.value - a.value),
    [etfs]
  );

  const concentrationData = useMemo(() => {
    const allHoldings = aggregateTopHoldings(etfs, 50);
    const result = [];
    let cumulative = 0;
    for (let i = 0; i < allHoldings.length; i++) {
      cumulative += allHoldings[i].value;
      result.push({
        name: `Top ${i + 1}`,
        value: cumulative,
      });
    }
    return result;
  }, [etfs]);

  const weightDistributionData = useMemo(() => {
    const allHoldings = aggregateTopHoldings(etfs, 10000);
    const bins = { '> 1%': 0, '0.5% - 1%': 0, '0.1% - 0.5%': 0, '< 0.1%': 0 };
    for (const h of allHoldings) {
      if (h.value >= 1) bins['> 1%'] += h.value;
      else if (h.value >= 0.5) bins['0.5% - 1%'] += h.value;
      else if (h.value >= 0.1) bins['0.1% - 0.5%'] += h.value;
      else bins['< 0.1%'] += h.value;
    }
    return [
      { name: '> 1%', value: bins['> 1%'] },
      { name: '0.5% - 1%', value: bins['0.5% - 1%'] },
      { name: '0.1% - 0.5%', value: bins['0.1% - 0.5%'] },
      { name: '< 0.1%', value: bins['< 0.1%'] },
    ];
  }, [etfs]);

  if (etfs.length === 0 || totalWeight === 0) {
    return (
      <Card className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[400px] h-full border-dashed">
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium text-foreground mb-2">No Data to Display</h3>
          <p>Add ETFs and allocate weight to see your portfolio analysis.</p>
        </CardContent>
      </Card>
    );
  }

  const tabs: Array<'Overview' | 'Fund Details' | 'Risk Analysis'> = [
    'Overview',
    'Fund Details',
    'Risk Analysis',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Weighted Avg TER</h3>
            <p className="text-3xl font-bold text-foreground">{avgTer.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Total Assets Analyzed
            </h3>
            <p className="text-3xl font-bold text-foreground">
              {etfs.reduce((sum, etf) => sum + etf.holdings.length, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Active ETFs</h3>
            <p className="text-3xl font-bold text-foreground">
              {etfs.filter((e) => e.globalWeight > 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigator */}
      <div className="flex space-x-1 bg-muted/50 p-1.5 rounded-xl w-full max-w-fit shadow-sm">
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
                data={geoData}
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
      </div>
    </div>
  );
}
