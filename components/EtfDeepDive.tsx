import React, { useState } from 'react';
import { EtfConfig } from '@/lib/types';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { TopHoldingsChart } from '@/components/charts/TopHoldingsChart';
import { PieChartCard } from '@/components/charts/PieChartCard';
import { HoldingsTable } from '@/components/HoldingsTable';

function DeepDiveData({ etf }: { etf: EtfConfig }) {
  const { t } = useTranslation();
  // We feed it an array with a single ETF, artificially setting globalWeight to 100
  // so the math functions calculate exposure strictly relative to this fund's total.
  const isolatedData = useDashboardData([{ ...etf, globalWeight: 100 }]);

  return (
    <div className="space-y-6 pb-12">
      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-muted/30 p-3 rounded-md border border-border">
          <div
            className="text-xs text-muted-foreground uppercase tracking-widest mb-1 truncate"
            title={t.pages.analyzer.components.etfForm.ter}
          >
            {t.pages.analyzer.components.etfForm.ter}
          </div>
          <div className="font-semibold text-primary">{etf.ter}%</div>
        </div>
        <div className="bg-muted/30 p-3 rounded-md border border-border">
          <div
            className="text-xs text-muted-foreground uppercase tracking-widest mb-1 truncate"
            title={t.pages.analyzer.components.etfForm.fundSize}
          >
            {t.pages.analyzer.components.etfForm.fundSize}
          </div>
          <div className="font-semibold text-primary">${etf.fundSize}M</div>
        </div>
        <div className="bg-muted/30 p-3 rounded-md border border-border">
          <div
            className="text-xs text-muted-foreground uppercase tracking-widest mb-1 truncate"
            title={t.pages.analyzer.components.etfForm.replication}
          >
            {t.pages.analyzer.components.etfForm.replication}
          </div>
          <div className="font-semibold text-primary">
            {t.data.etfProperties[etf.replicationMethod as keyof typeof t.data.etfProperties] ||
              etf.replicationMethod}
          </div>
        </div>
        <div className="bg-muted/30 p-3 rounded-md border border-border">
          <div
            className="text-xs text-muted-foreground uppercase tracking-widest mb-1 truncate"
            title={t.pages.analyzer.components.etfForm.useOfProfit}
          >
            {t.pages.analyzer.components.etfForm.useOfProfit}
          </div>
          <div className="font-semibold text-primary">
            {t.data.etfProperties[etf.useOfProfit as keyof typeof t.data.etfProperties] ||
              etf.useOfProfit}
          </div>
        </div>
      </div>

      <div className="w-full">
        <TopHoldingsChart data={isolatedData.topHoldings} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="w-full">
          <PieChartCard
            title={t.pages.analyzer.dashboard.tabs.overviewTab.sectorExposureTitle}
            info={t.pages.analyzer.dashboard.tabs.overviewTab.sectorExposureInfo}
            data={isolatedData.sectorData}
          />
        </div>
        <div className="w-full">
          <PieChartCard
            title={t.pages.analyzer.dashboard.tabs.overviewTab.geoExposureTitle}
            info={t.pages.analyzer.dashboard.tabs.overviewTab.geoExposureInfo}
            data={isolatedData.geoData}
          />
        </div>
      </div>

      <HoldingsTable holdings={etf.holdings} />
    </div>
  );
}

export function EtfDeepDive({ etf }: { etf: EtfConfig }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="ETF Deep Dive"
          />
        }
      >
        <Search size={16} />
      </SheetTrigger>
      <SheetContent className="!w-full !max-w-full sm:!max-w-2xl lg:!max-w-3xl xl:!max-w-4xl p-4 sm:p-6 overflow-y-auto bg-background/95 backdrop-blur-xl border-l-border">
        <SheetHeader className="mb-2 mt-4 sm:mt-0 text-left">
          <SheetTitle className="text-xl sm:text-2xl font-black tracking-widest uppercase flex items-center gap-3">
            <Search className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            <span className="text-foreground">{etf.name}</span>
          </SheetTitle>
          <SheetDescription className="font-mono text-xs sm:text-sm text-muted-foreground ml-9">
            {etf.isin ? `ISIN: ${etf.isin}` : 'No ISIN'} • {etf.issuer}
          </SheetDescription>
        </SheetHeader>

        {/* We only mount the data crunching component when the sheet is open for performance */}
        {isOpen && <DeepDiveData etf={etf} />}
      </SheetContent>
    </Sheet>
  );
}
