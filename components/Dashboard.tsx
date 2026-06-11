'use client';

import React, { useState } from 'react';
import { EtfConfig } from '../lib/types';
import { useDashboardData } from '../hooks/useDashboardData';
import { Card, CardContent } from './ui/card';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

// Extracted Tab Components
import { OverviewTab } from './dashboard/OverviewTab';
import { FundDetailsTab } from './dashboard/FundDetailsTab';
import { RiskAnalysisTab } from './dashboard/RiskAnalysisTab';
import { DeepDiveTab } from './dashboard/DeepDiveTab';

// Other features
import { SavingsPlanCalculator } from './SavingsPlanCalculator';
import dynamic from 'next/dynamic';

const ExposureGlobe = dynamic(
  () => import('./charts/ExposureGlobe').then((mod) => mod.ExposureGlobe),
  {
    ssr: false,
    loading: () => <div className="h-112.5 bg-card animate-pulse border border-border" />,
  }
);

const NetworkGraph = dynamic(
  () => import('./charts/NetworkGraph').then((mod) => mod.NetworkGraph),
  {
    ssr: false,
    loading: () => <div className="h-112.5 bg-card animate-pulse border border-border" />,
  }
);

interface DashboardProps {
  etfs: EtfConfig[];
  totalWeight: number;
}

export default function Dashboard({ etfs, totalWeight }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Deep Dive' | '3D Visuals' | 'Fund Details' | 'Risk Analysis' | 'Savings Plan'
  >('Overview');

  const [active3DVisual, setActive3DVisual] = useState<'Globe' | 'Network'>('Network');

  const [networkLimit, setNetworkLimit] = useState<number[]>([100]);
  const [networkLivePhysics, setNetworkLivePhysics] = useState(false);

  const maxHoldings = React.useMemo(() => {
    const activeEtfs = etfs.filter((e) => e.globalWeight > 0);
    const unique = new Set();
    for (const etf of activeEtfs) {
      for (const h of etf.holdings) {
        unique.add(h.ticker !== 'N/A' ? h.ticker : h.name);
      }
    }
    return Math.max(10, unique.size);
  }, [etfs]);

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

  const tabs: Array<
    'Overview' | 'Deep Dive' | '3D Visuals' | 'Fund Details' | 'Risk Analysis' | 'Savings Plan'
  > = ['Overview', 'Fund Details', 'Risk Analysis', 'Deep Dive', '3D Visuals', 'Savings Plan'];

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
      <div className="flex gap-1 overflow-x-auto whitespace-nowrap bg-muted/50 p-1.5 rounded-xl w-full shadow-sm scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-5 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
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
          <OverviewTab
            topHoldings={topHoldings}
            etfAllocationData={etfAllocationData}
            sectorData={sectorData}
            geoData={geoData}
            currencyData={currencyData}
          />
        )}

        {activeTab === 'Deep Dive' && (
          <div className="lg:col-span-2 animate-in fade-in duration-300">
            <DeepDiveTab etfs={etfs} />
          </div>
        )}

        {activeTab === 'Fund Details' && (
          <FundDetailsTab
            providerData={providerData}
            domicileData={domicileData}
            fundSizeData={fundSizeData}
            fundAgeData={fundAgeData}
          />
        )}

        {activeTab === 'Risk Analysis' && (
          <RiskAnalysisTab
            concentrationData={concentrationData}
            weightDistributionData={weightDistributionData}
            replicationData={replicationData}
            profitData={profitData}
          />
        )}

        {activeTab === 'Savings Plan' && (
          <div className="lg:col-span-2 transition-transform duration-300 animate-in fade-in">
            <SavingsPlanCalculator etfs={etfs} totalWeight={totalWeight} />
          </div>
        )}

        {activeTab === '3D Visuals' && (
          <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300 animate-in fade-in bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex justify-end mb-4">
              <div className="bg-muted p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setActive3DVisual('Globe')}
                  className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${active3DVisual === 'Globe' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
                >
                  Exposure Globe
                </button>
                <button
                  onClick={() => setActive3DVisual('Network')}
                  className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${active3DVisual === 'Network' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
                >
                  Concentration Network
                </button>
              </div>
            </div>
            {active3DVisual === 'Globe' ? (
              <ExposureGlobe data={geoData} />
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between gap-6 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
                        Top Holdings Rendered
                      </Label>
                      <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {networkLimit[0] >= maxHoldings ? 'ALL' : networkLimit[0]}
                      </span>
                    </div>
                    <Slider
                      value={networkLimit}
                      onValueChange={(val) =>
                        setNetworkLimit(Array.isArray(val) ? [...val] : [val])
                      }
                      max={maxHoldings}
                      min={10}
                      step={10}
                      className="py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-2 min-w-37.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
                      Concentration Physics
                    </Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Switch
                        id="physics-mode"
                        checked={networkLivePhysics}
                        onCheckedChange={setNetworkLivePhysics}
                      />
                      <Label
                        htmlFor="physics-mode"
                        className="text-xs text-muted-foreground cursor-pointer font-medium"
                      >
                        Live Physics Engine
                      </Label>
                    </div>
                  </div>
                </div>
                <NetworkGraph etfs={etfs} limit={networkLimit} livePhysics={networkLivePhysics} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
