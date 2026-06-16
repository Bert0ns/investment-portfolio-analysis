import { EtfConfig } from '@/lib/types';
import { RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import EtfForm from '@/components/EtfForm';

export function EmptyPortfolioState({
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
        <p className="font-medium text-muted-foreground">
          {t.pages.analyzer.components.portfolioSliders.noEtfsAdded}
        </p>
        <p className="text-sm mt-1 text-muted-foreground/80 mb-6">
          {t.pages.analyzer.components.portfolioSliders.uploadCsvToStart}
        </p>
        <EtfForm onAddEtf={onAddEtf} />
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full mt-3 flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          {t.pages.analyzer.components.portfolioSliders.loadDefaultPortfolio}
        </Button>
      </CardContent>
    </Card>
  );
}
