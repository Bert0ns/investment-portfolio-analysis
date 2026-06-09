'use client';

import { usePortfolio } from '../hooks/usePortfolio';
import EtfForm from '../components/EtfForm';
import PortfolioSliders from '../components/PortfolioSliders';
import Dashboard from '../components/Dashboard';

export default function Home() {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">
          {isLoadingDefaults ? 'Parsing default ETF CSVs...' : 'Loading portfolio...'}
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            ETF Portfolio Analyzer
          </h1>
          <p className="text-gray-500 mt-2">
            Upload your ETF holdings CSVs, configure weights, and analyze your true underlying
            exposure.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form & Sliders */}
          <div className="lg:col-span-1 space-y-8 flex flex-col">
            <EtfForm onAddEtf={addEtf} />
            <div className="flex-1 min-h-[400px]">
              <PortfolioSliders
                etfs={etfs}
                totalWeight={totalWeight}
                onUpdateWeight={updateEtfWeight}
                onRemove={removeEtf}
                onReset={loadDefaults}
              />
            </div>
          </div>

          {/* Right Column: Dashboard */}
          <div className="lg:col-span-2">
            <Dashboard etfs={etfs} totalWeight={totalWeight} />
          </div>
        </div>
      </div>
    </main>
  );
}
