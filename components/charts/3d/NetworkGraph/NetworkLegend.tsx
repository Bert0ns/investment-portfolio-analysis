import { useTranslation } from '@/lib/i18n/LanguageContext';

interface NetworkLegendProps {
  etfColor: string;
  holdingColor: string;
}

export function NetworkLegend({ etfColor, holdingColor }: NetworkLegendProps) {
  const { t } = useTranslation();

  return (
    <div className="absolute top-4 left-4 pointer-events-none bg-background/90 backdrop-blur-md px-4 py-3 rounded-xl border border-border shadow-lg flex flex-col gap-3 min-w-70">
      <p className="text-xs font-bold uppercase tracking-widest text-foreground">
        {t.threeDVisuals.legend}
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: etfColor, boxShadow: `0 0 8px ${etfColor}` }}
          />
          <span className="text-xs text-muted-foreground font-medium">{t.threeDVisuals.etfs}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: holdingColor, boxShadow: `0 0 8px ${holdingColor}` }}
          />
          <span className="text-xs text-muted-foreground font-medium">
            {t.threeDVisuals.overlappingHoldings}
          </span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground/80 max-w-62.5 leading-tight mt-1">
        {t.threeDVisuals.networkLegendDesc}
      </p>
    </div>
  );
}
