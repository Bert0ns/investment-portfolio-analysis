'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EtfConfig } from '@/lib/types';
import { useDashboardData } from '@/hooks/useDashboardData';

// Extracted UI Components
import { DashboardEmptyState } from './DashboardEmptyState';
import { DashboardKpiRow } from './DashboardKpiRow';
import { DashboardTabsNav, DashboardTabType } from './DashboardTabsNav';

// Tab Views
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { FundDetailsTab } from '@/components/dashboard/FundDetailsTab';
import { RiskAnalysisTab } from '@/components/dashboard/RiskAnalysisTab';
import { DeepDiveTab } from '@/components/dashboard/DeepDiveTab';
import { VisualsTab } from '@/components/dashboard/VisualsTab';

// Other features
import { SavingsPlanCalculator } from '@/components/SavingsPlanCalculator';

interface DashboardProps {
  etfs: EtfConfig[];
  totalWeight: number;
}

export default function Dashboard({ etfs, totalWeight }: DashboardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useLocalStorage<DashboardTabType>(
    'dashboard_active_tab',
    'Overview'
  );

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
    return <DashboardEmptyState />;
  }

  return (
    <div
      className={`space-y-6 animate-in fade-in duration-500 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6 overflow-auto' : ''}`}
    >
      {/* KPI Row */}
      <DashboardKpiRow avgTer={avgTer} etfs={etfs} />

      {/* Tabs Navigator */}
      <DashboardTabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 animate-in slide-in-from-bottom-2 fade-in duration-500">
        {activeTab === 'Overview' && (
          <OverviewTab
            topHoldings={topHoldings}
            etfAllocationData={etfAllocationData}
            sectorData={sectorData}
            geoData={geoData}
            currencyData={currencyData}
          />
        )}

        <div
          className={`lg:col-span-2 ${activeTab === 'Deep Dive' ? 'animate-in fade-in duration-300' : 'hidden'}`}
        >
          <DeepDiveTab etfs={etfs} />
        </div>

        {activeTab === 'Fund Details' && (
          <FundDetailsTab
            providerData={providerData}
            domicileData={domicileData}
            fundSizeData={fundSizeData}
            fundAgeData={fundAgeData}
            replicationData={replicationData}
            profitData={profitData}
          />
        )}

        {activeTab === 'Risk Analysis' && (
          <RiskAnalysisTab
            concentrationData={concentrationData}
            weightDistributionData={weightDistributionData}
            etfs={etfs}
          />
        )}

        <div
          className={`lg:col-span-2 transition-transform duration-300 ${activeTab === 'Savings Plan' ? 'animate-in fade-in' : 'hidden'}`}
        >
          <SavingsPlanCalculator etfs={etfs} totalWeight={totalWeight} />
        </div>

        <div
          className={`${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-background' : 'lg:col-span-2'} ${activeTab === '3D Visuals' ? '' : 'hidden'}`}
        >
          <VisualsTab
            etfs={etfs}
            geoData={geoData}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            isActive={activeTab === '3D Visuals'}
          />
        </div>
      </div>
    </div>
  );
}
