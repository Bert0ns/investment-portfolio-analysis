'use client';

import { usePortfolio } from '@/hooks/usePortfolio';
import EtfForm from '@/components/EtfForm';
import PortfolioSliders from '@/components/PortfolioSliders';
import Dashboard from '@/components/Dashboard';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export default function AnalyzerContent() {
  const { t } = useTranslation();
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
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
        <p className="text-primary font-bold tracking-widest uppercase animate-pulse">
          {isLoadingDefaults ? t.analyzer.parsingDefaults : t.analyzer.initializing}
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background p-6 md:p-10 font-sans text-foreground w-full">
      <div className="max-w-7xl mx-auto space-y-8 w-full">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 relative">
            <div className="xl:sticky xl:top-24 space-y-8 xl:max-h-[calc(100vh-6rem)] flex flex-col">
              <EtfForm onAddEtf={addEtf} />
              <div className="flex-1 xl:overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-primary/20">
                <PortfolioSliders
                  etfs={etfs}
                  totalWeight={totalWeight}
                  onUpdateWeight={updateEtfWeight}
                  onRemove={removeEtf}
                  onReset={loadDefaults}
                />
              </div>
            </div>
          </div>
          <div className="xl:col-span-2">
            <Dashboard etfs={etfs} totalWeight={totalWeight} />
          </div>
        </div>
      </div>
    </main>
  );
}
