'use client';

import React from 'react';
import { EtfConfig } from '../lib/types';
import { Trash2, RotateCcw } from 'lucide-react';

import { Card, CardContent } from './ui/card';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { useTranslation } from '../lib/i18n/LanguageContext';
import EtfForm from './EtfForm';

interface PortfolioSlidersProps {
  etfs: EtfConfig[];
  totalWeight: number;
  onUpdateWeight: (id: string, weight: number) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
  onAddEtf: (etf: EtfConfig) => void;
}

function EmptyPortfolioState({
  onAddEtf,
  onReset,
}: {
  onAddEtf: (etf: EtfConfig) => void;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card className="flex-1 w-full flex flex-col items-center justify-center text-center min-h-75 border-dashed">
      <CardContent className="pt-6">
        <p className="font-medium text-muted-foreground">{t.portfolioSliders.noEtfsAdded}</p>
        <p className="text-sm mt-1 text-muted-foreground/80 mb-6">
          {t.portfolioSliders.uploadCsvToStart}
        </p>
        <EtfForm onAddEtf={onAddEtf} />
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full mt-3 flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          {t.portfolioSliders.loadDefaultPortfolio}
        </Button>
      </CardContent>
    </Card>
  );
}

function WeightValidation({ totalWeight, onReset }: { totalWeight: number; onReset: () => void }) {
  const { t } = useTranslation();
  const isOverweight = totalWeight > 100;
  const isUnderweight = totalWeight < 100;

  return (
    <div className="pt-0 border-t">
      <div className="flex justify-between items-end mb-0">
        <span className="text-sm font-medium text-muted-foreground">
          {t.portfolioSliders.totalAllocation}
        </span>
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
        {isOverweight && t.portfolioSliders.exceeds100}
        {isUnderweight &&
          `${t.portfolioSliders.youHave}${(100 - totalWeight).toFixed(1)}% ${t.portfolioSliders.leftToAllocate}`}
        {!isOverweight && !isUnderweight && t.portfolioSliders.perfectlyAllocated}
      </div>

      <div className="mt-2">
        <Button
          variant="outline"
          className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-dashed"
          onClick={() => {
            if (window.confirm(t.portfolioSliders.resetWarning)) {
              onReset();
            }
          }}
        >
          <RotateCcw size={14} className="mr-2" />
          {t.portfolioSliders.resetToDefault}
        </Button>
        <p className="text-[10px] text-center text-muted-foreground mt-2 opacity-70">
          {t.portfolioSliders.noteDeleteConfig}
        </p>
      </div>
    </div>
  );
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
  const { t } = useTranslation();
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
            title={t.portfolioSliders.removeEtf}
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
  onAddEtf,
}: PortfolioSlidersProps) {
  if (etfs.length === 0) {
    return <EmptyPortfolioState onAddEtf={onAddEtf} onReset={onReset} />;
  }

  return (
    <Card className="flex-1 w-full flex flex-col min-h-0">
      <CardContent className="flex-1 flex flex-col pt-0 space-y-6 min-h-0">
        <div className="pt-0">
          <EtfForm onAddEtf={onAddEtf} />
        </div>
        <div className="flex-1 overflow-y-auto space-y-6 pr-4 pb-4 scrollbar-thin scrollbar-thumb-primary/20">
          {etfs.map((etf) => (
            <EtfSliderRow
              key={etf.id}
              etf={etf}
              onUpdateWeight={onUpdateWeight}
              onRemove={onRemove}
            />
          ))}
        </div>

        <WeightValidation totalWeight={totalWeight} onReset={onReset} />
      </CardContent>
    </Card>
  );
}
