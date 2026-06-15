import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { EtfConfig } from '@/lib/types';

interface DashboardKpiRowProps {
  avgTer: number;
  etfs: EtfConfig[];
}

export function DashboardKpiRow({ avgTer, etfs }: DashboardKpiRowProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 pb-2 md:pb-0 w-full">
      <Card className="hover:shadow-md transition-shadow py-3 md:py-6 flex flex-col justify-center text-center md:text-left">
        <CardContent className="px-2 md:px-6 pt-0 flex flex-col justify-center pb-0">
          <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground mb-0.5 line-clamp-2 md:line-clamp-1 leading-tight">
            {t.overviewTab.weightedAvgTer}
          </h3>
          <p className="text-lg md:text-3xl font-bold text-foreground">{avgTer.toFixed(2)}%</p>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition-shadow py-3 md:py-6 flex flex-col justify-center text-center md:text-left">
        <CardContent className="px-2 md:px-6 pt-0 flex flex-col justify-center pb-0">
          <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground mb-0.5 line-clamp-2 md:line-clamp-1 leading-tight">
            {t.overviewTab.totalAssets}
          </h3>
          <p className="text-lg md:text-3xl font-bold text-foreground">
            {etfs.reduce((sum, etf) => sum + etf.holdings.length, 0).toLocaleString()}
          </p>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition-shadow py-3 md:py-6 flex flex-col justify-center text-center md:text-left">
        <CardContent className="px-2 md:px-6 pt-0 flex flex-col justify-center pb-0">
          <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground mb-0.5 line-clamp-2 md:line-clamp-1 leading-tight">
            {t.overviewTab.activeEtfs}
          </h3>
          <p className="text-lg md:text-3xl font-bold text-foreground">
            {etfs.filter((e) => e.globalWeight > 0).length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
