'use client';

import { usePortfolio } from '@/hooks/usePortfolio';
import EtfForm from '@/components/EtfForm';
import PortfolioSliders from '@/components/PortfolioSliders';
import Dashboard from '@/components/Dashboard';

export default function Analyzer() {
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
          {isLoadingDefaults ? 'Parsing Default Nodes...' : 'Initializing Workspace...'}
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background p-6 md:p-10 font-sans text-foreground w-full">
      <div className="max-w-7xl mx-auto space-y-8 w-full">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-widest uppercase text-white">
              Analyzer{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                Workspace
              </span>
            </h1>
            <p className="text-slate-400 mt-2 font-light tracking-wide">
              Upload your ETF holdings CSVs, configure weights, and analyze your true underlying
              exposure.
            </p>
          </div>
        </header>

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
