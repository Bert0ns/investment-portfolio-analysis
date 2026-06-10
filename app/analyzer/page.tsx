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
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">
          {isLoadingDefaults ? 'Parsing default ETF CSVs...' : 'Loading portfolio...'}
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 p-6 md:p-10 font-sans text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analyzer Workspace</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Upload your ETF holdings CSVs, configure weights, and analyze your true underlying
              exposure.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 relative">
            <div className="lg:sticky lg:top-24 space-y-6 lg:max-h-[calc(100vh-6rem)] flex flex-col">
              <EtfForm onAddEtf={addEtf} />
              <div className="flex-1 lg:overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-200">
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
          <div className="lg:col-span-2">
            <Dashboard etfs={etfs} totalWeight={totalWeight} />
          </div>
        </div>
      </div>
    </main>
  );
}
