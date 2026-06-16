import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function WeightValidation({
  totalWeight,
  onReset,
}: {
  totalWeight: number;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const isOverweight = totalWeight > 100;
  const isUnderweight = totalWeight < 100;

  return (
    <div className="pt-0 border-t">
      <div className="flex justify-between items-end mb-0">
        <span className="text-sm font-medium text-muted-foreground">
          {t.pages.analyzer.components.portfolioSliders.totalAllocation}
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
        {isOverweight && t.pages.analyzer.components.portfolioSliders.exceeds100}
        {isUnderweight &&
          `${t.pages.analyzer.components.portfolioSliders.youHave}${(100 - totalWeight).toFixed(1)}% ${t.pages.analyzer.components.portfolioSliders.leftToAllocate}`}
        {!isOverweight &&
          !isUnderweight &&
          t.pages.analyzer.components.portfolioSliders.perfectlyAllocated}
      </div>

      <div className="mt-2">
        <Button
          variant="outline"
          className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-dashed"
          onClick={() => {
            if (window.confirm(t.pages.analyzer.components.portfolioSliders.resetWarning)) {
              onReset();
            }
          }}
        >
          <RotateCcw size={14} className="mr-2" />
          {t.pages.analyzer.components.portfolioSliders.resetToDefault}
        </Button>
        <p className="text-[10px] text-center text-muted-foreground mt-2 opacity-70">
          {t.pages.analyzer.components.portfolioSliders.noteDeleteConfig}
        </p>
      </div>
    </div>
  );
}
