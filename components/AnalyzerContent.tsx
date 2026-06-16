'use client';

import { usePortfolio } from '@/hooks/usePortfolio';

import PortfolioSliders from '@/components/PortfolioSliders';
import Dashboard from '@/components/dashboard';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

function LoadingState({ isLoadingDefaults }: { isLoadingDefaults: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
      <p className="text-primary font-bold tracking-widest uppercase animate-pulse">
        {isLoadingDefaults
          ? t.pages.analyzer.main.parsingDefaults
          : t.pages.analyzer.main.initializing}
      </p>
    </div>
  );
}

export default function AnalyzerContent() {
  const { t } = useTranslation();
  const [isSlidersOpen, setIsSlidersOpen] = useState(true);
  const {
    etfs,
    isLoaded,
    isLoadingDefaults,
    totalWeight,
    addEtf,
    removeEtf,
    updateEtfWeight,
    loadDefaults,
  } = usePortfolio();

  if (!isLoaded || isLoadingDefaults) {
    return <LoadingState isLoadingDefaults={isLoadingDefaults} />;
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background p-2 md:p-4 font-sans text-foreground w-full">
      <div className="mx-auto ">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 transition-all duration-500 ease-in-out">
          <div
            className={`transition-all duration-500 ease-in-out ${isSlidersOpen ? 'xl:col-span-4' : 'xl:col-span-12'}`}
          >
            <div className={'flex flex-col'}>
              <button
                onClick={() => setIsSlidersOpen(!isSlidersOpen)}
                className={`shrink-0 flex items-center justify-between w-full mb-0 py-3 px-4 text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-sm ${
                  isSlidersOpen
                    ? 'text-foreground bg-muted/30 border border-border hover:bg-muted/60'
                    : 'text-primary-foreground bg-primary border-transparent hover:bg-primary/90 ring-2 ring-primary/20'
                }`}
              >
                <span>
                  {isSlidersOpen
                    ? t.pages.analyzer.main.hidePortfolioSetup
                    : t.pages.analyzer.main.managePortfolio}
                </span>
                {isSlidersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isSlidersOpen && (
                <div className="flex-1 min-h-0 mt-2 flex flex-col animate-in fade-in slide-in-from-top-4 duration-500">
                  <PortfolioSliders
                    etfs={etfs}
                    totalWeight={totalWeight}
                    onUpdateWeight={updateEtfWeight}
                    onRemove={removeEtf}
                    onReset={loadDefaults}
                    onAddEtf={addEtf}
                  />
                </div>
              )}
            </div>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out ${isSlidersOpen ? 'xl:col-span-8' : 'xl:col-span-12'}`}
          >
            <Dashboard etfs={etfs} totalWeight={totalWeight} />
          </div>
        </div>
      </div>
    </main>
  );
}
