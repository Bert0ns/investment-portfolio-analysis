import React from 'react';
import { EtfConfig } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { EtfDeepDive } from '@/components/EtfDeepDive';

export function EtfSliderRow({
  etf,
  onUpdateWeight,
  onRemove,
}: {
  etf: EtfConfig;
  onUpdateWeight: (id: string, weight: number) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [localWeight, setLocalWeight] = React.useState<number | string>(
    Math.round(etf.globalWeight || 0)
  );

  // Sync from parent if it changes externally (e.g., Reset Defaults)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalWeight(Math.round(etf.globalWeight || 0));
  }, [etf.globalWeight]);

  // Sync to parent with a debounce to prevent React infinite update loops
  React.useEffect(() => {
    const handler = setTimeout(() => {
      onUpdateWeight(etf.id, Number(localWeight) || 0);
    }, 50);
    return () => clearTimeout(handler);
  }, [localWeight, etf.id, onUpdateWeight]);

  const sliderValue = React.useMemo(() => [Number(localWeight) || 0], [localWeight]);

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
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="flex items-center">
            <Input
              type="number"
              min={0}
              max={100}
              value={localWeight}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setLocalWeight('');
                } else {
                  setLocalWeight(Math.max(0, Math.min(100, Number(val))));
                }
              }}
              className="w-[4rem] sm:w-[4.5rem] h-8 text-right font-semibold text-sm pr-1 sm:pr-2"
            />
            <span className="font-semibold text-sm ml-1">%</span>
          </div>
          <EtfDeepDive etf={etf} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(etf.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            title={t.pages.analyzer.components.portfolioSliders.removeEtf}
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
