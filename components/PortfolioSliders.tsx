'use client';

import React from 'react';
import { EtfConfig } from '../lib/types';
import { Trash2, RotateCcw } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Slider } from './ui/slider';
import { Button } from './ui/button';

interface PortfolioSlidersProps {
  etfs: EtfConfig[];
  totalWeight: number;
  onUpdateWeight: (id: string, weight: number) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
}

function EtfSliderRow({
  etf,
  onUpdateWeight,
  onRemove,
}: {
  etf: EtfConfig;
  onUpdateWeight: (id: string, weight: number) => void;
  onRemove: (id: string) => void;
}) {
  const [localWeight, setLocalWeight] = React.useState(Math.round(etf.globalWeight || 0));

  // Sync from parent if it changes externally (e.g., Reset Defaults)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalWeight(Math.round(etf.globalWeight || 0));
  }, [etf.globalWeight]);

  // Sync to parent with a debounce to prevent React infinite update loops
  React.useEffect(() => {
    const handler = setTimeout(() => {
      onUpdateWeight(etf.id, localWeight);
    }, 50);
    return () => clearTimeout(handler);
  }, [localWeight, etf.id, onUpdateWeight]);

  const sliderValue = React.useMemo(() => [localWeight], [localWeight]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
            {etf.name}
            {etf.isin && (
              <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                {etf.isin}
              </span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {etf.issuer} • TER: {etf.ter}%
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-sm w-12 text-right">{localWeight}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(etf.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Remove ETF"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
      <Slider
        value={sliderValue}
        max={100}
        step={1}
        onValueChange={(val) => {
          const newWeight = Array.isArray(val) ? val[0] : val;
          setLocalWeight(Math.round(newWeight ?? 0));
        }}
        className="py-2"
      />
    </div>
  );
}

export default function PortfolioSliders({
  etfs,
  totalWeight,
  onUpdateWeight,
  onRemove,
  onReset,
}: PortfolioSlidersProps) {
  if (etfs.length === 0) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center min-h-75 border-dashed">
        <CardContent className="pt-6">
          <p className="font-medium text-muted-foreground">No ETFs added yet.</p>
          <p className="text-sm mt-1 text-muted-foreground/80">
            Upload a CSV to start building your portfolio.
          </p>
          <Button onClick={onReset} variant="outline" className="mt-6 flex items-center gap-2">
            <RotateCcw size={16} />
            Load Default Portfolio
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isOverweight = totalWeight > 100;
  const isUnderweight = totalWeight < 100;

  return (
    <Card className="h-full flex flex-col min-h-75">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Portfolio Weights</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0 space-y-6">
        <div className="flex-1 space-y-6 pr-2">
          {etfs.map((etf) => (
            <EtfSliderRow
              key={etf.id}
              etf={etf}
              onUpdateWeight={onUpdateWeight}
              onRemove={onRemove}
            />
          ))}
        </div>

        {/* Total Weight Validation */}
        <div className="pt-6 mt-auto border-t">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Allocation</span>
            <span
              className={`text-2xl font-bold ${
                isOverweight
                  ? 'text-destructive'
                  : isUnderweight
                    ? 'text-amber-500'
                    : 'text-emerald-600'
              }`}
            >
              {totalWeight.toFixed(1)}%
            </span>
          </div>

          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-300 ${
                isOverweight ? 'bg-destructive' : isUnderweight ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(totalWeight, 100)}%` }}
            />
          </div>

          <div className="mt-2 text-xs text-center text-muted-foreground min-h-4">
            {isOverweight && 'Your portfolio exceeds 100%. Please reduce some weights.'}
            {isUnderweight && `You have ${(100 - totalWeight).toFixed(1)}% left to allocate.`}
            {!isOverweight && !isUnderweight && 'Perfectly allocated.'}
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-dashed"
              onClick={() => {
                if (
                  window.confirm(
                    'Warning: This will permanently delete your current portfolio configuration and replace it with the default sample ETFs. Continue?'
                  )
                ) {
                  onReset();
                }
              }}
            >
              <RotateCcw size={14} className="mr-2" />
              Reset to Default Portfolio
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-2 opacity-70">
              Note: This will delete your current configuration.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
