'use client';

import React, { useState } from 'react';
import { EtfConfig } from '../lib/types';
import { useDashboardData } from '../hooks/useDashboardData';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Maximize2, Minimize2 } from 'lucide-react';

// Extracted Tab Components
import { OverviewTab } from './dashboard/OverviewTab';
import { FundDetailsTab } from './dashboard/FundDetailsTab';
import { RiskAnalysisTab } from './dashboard/RiskAnalysisTab';
import { DeepDiveTab } from './dashboard/DeepDiveTab';

// Other features
import { SavingsPlanCalculator } from './SavingsPlanCalculator';
import dynamic from 'next/dynamic';

import { VisualsTab } from './dashboard/VisualsTab';

import { useTranslation } from '../lib/i18n/LanguageContext';

interface DashboardProps {
  etfs: EtfConfig[];
  totalWeight: number;
}

export default function Dashboard({ etfs, totalWeight }: DashboardProps) {
  const { t } = useTranslation();
  const [networkLimit, setNetworkLimit] = useState<number[]>([100]);
  const [networkLivePhysics, setNetworkLivePhysics] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Deep Dive' | '3D Visuals' | 'Fund Details' | 'Risk Analysis' | 'Savings Plan'
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
          <h3 className="text-xl font-medium text-foreground mb-2">{t.dashboard.emptyState}</h3>
          <p>{t.dashboard.emptyStateDesc}</p>
        </CardContent>
      </Card>
    );
  }

  const tabs: Array<
    'Overview' | 'Deep Dive' | '3D Visuals' | 'Fund Details' | 'Risk Analysis' | 'Savings Plan'
  > = ['Overview', 'Fund Details', 'Risk Analysis', 'Deep Dive', '3D Visuals', 'Savings Plan'];

  const renderTabName = (tab: string) => {
    switch (tab) {
      case 'Overview':
        return t.overviewTab.tabOverview;
      case 'Deep Dive':
        return t.overviewTab.tabDeepDive;
      case 'Fund Details':
        return t.overviewTab.tabFundDetails;
      case 'Risk Analysis':
        return t.overviewTab.tabRiskAnalysis;
      case 'Savings Plan':
        return t.overviewTab.tabSavingsPlan;
      case '3D Visuals':
        return t.overviewTab.tab3DVisuals;
      default:
        return tab;
    }
  };

  return (
    <div
      className={`space-y-6 animate-in fade-in duration-500 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6 overflow-auto' : ''}`}
    >
      {/* KPI Row - Compact Badges on Mobile, Cards on Desktop */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 pb-2 md:pb-0 w-full">
        <Card className="hover:shadow-md transition-shadow py-3 md:py-6 flex flex-col justify-center text-center md:text-left">
          <CardContent className="px-2 md:px-6 pt-0 flex flex-col justify-center pb-0">
            <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground mb-0.5 line-clamp-2 md:line-clamp-1 leading-tight">
              {t.overviewTab.weightedAvgTer}
            </h3>
            <p className="text-lg md:text-3xl font-bold text-foreground">{avgTer.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow py-3 md:py-6 flex flex-col justify-center text-center md:text-left">
          <CardContent className="px-2 md:px-6 pt-0 flex flex-col justify-center pb-0">
            <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground mb-0.5 line-clamp-2 md:line-clamp-1 leading-tight">
              {t.overviewTab.totalAssets}
            </h3>
            <p className="text-lg md:text-3xl font-bold text-foreground">
              {etfs.reduce((sum, etf) => sum + etf.holdings.length, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow py-3 md:py-6 flex flex-col justify-center text-center md:text-left">
          <CardContent className="px-2 md:px-6 pt-0 flex flex-col justify-center pb-0">
            <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground mb-0.5 line-clamp-2 md:line-clamp-1 leading-tight">
              {t.overviewTab.activeEtfs}
            </h3>
            <p className="text-lg md:text-3xl font-bold text-foreground">
              {etfs.filter((e) => e.globalWeight > 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigator - Dropdown on Mobile, Tabs on Desktop */}
      <div className="md:hidden">
        <Select value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
          <SelectTrigger className="w-full text-base py-6 bg-muted/50 font-medium">
            <SelectValue placeholder="Select tab" />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab} value={tab} className="text-base py-3">
                {renderTabName(tab)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden md:flex gap-1 overflow-x-auto whitespace-nowrap bg-muted/50 p-1.5 rounded-xl w-full shadow-sm scrollbar-thin">
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
            {renderTabName(tab)}
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
          <div
            className={`${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-background' : 'lg:col-span-2'}`}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
            <VisualsTab etfs={etfs} geoData={geoData} />
          </div>
        )}
      </div>
    </div>
  );
}
