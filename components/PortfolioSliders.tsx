'use client';

import { EtfConfig } from '../lib/types';
import { Trash2 } from 'lucide-react';

interface PortfolioSlidersProps {
  etfs: EtfConfig[];
  totalWeight: number;
  onUpdateWeight: (id: string, weight: number) => void;
  onRemove: (id: string) => void;
}

export default function PortfolioSliders({
  etfs,
  totalWeight,
  onUpdateWeight,
  onRemove,
}: PortfolioSlidersProps) {
  if (etfs.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-full text-gray-500 min-h-[300px]">
        <p className="font-medium text-gray-700">No ETFs added yet.</p>
        <p className="text-sm mt-1">Upload a CSV to start building your portfolio.</p>
      </div>
    );
  }

  const isOverweight = totalWeight > 100;
  const isUnderweight = totalWeight < 100;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col min-h-[300px]">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Portfolio Weights</h2>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {etfs.map((etf) => (
          <div key={etf.id} className="group relative">
            <div className="flex justify-between items-center mb-2">
              <div className="pr-12">
                <h3 className="font-medium text-gray-800 truncate">{etf.name}</h3>
                <p className="text-xs text-gray-500">
                  {etf.issuer} • {etf.ter}% TER
                </p>
              </div>
              <div className="flex items-center space-x-2 absolute right-0 top-0">
                <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-sm">
                  {etf.globalWeight}%
                </span>
                <button
                  onClick={() => onRemove(etf.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove ETF"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={etf.globalWeight}
              onChange={(e) => onUpdateWeight(etf.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-gray-600">Total Allocation</span>
          <span
            className={`text-2xl font-bold ${isOverweight ? 'text-red-500' : isUnderweight ? 'text-amber-500' : 'text-emerald-500'}`}
          >
            {totalWeight}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${isOverweight ? 'bg-red-500' : isUnderweight ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(totalWeight, 100)}%` }}
          />
        </div>
        {isOverweight && (
          <p className="text-red-500 text-xs mt-2 font-medium">Total weight exceeds 100%!</p>
        )}
        {isUnderweight && (
          <p className="text-amber-500 text-xs mt-2 font-medium">
            Allocate {100 - totalWeight}% more to reach 100%
          </p>
        )}
      </div>
    </div>
  );
}
