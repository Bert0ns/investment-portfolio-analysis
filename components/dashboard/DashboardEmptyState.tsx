import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function DashboardEmptyState() {
  const { t } = useTranslation();
  return (
    <Card className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-100 h-full border-dashed">
      <CardContent className="pt-6">
        <h3 className="text-xl font-medium text-foreground mb-2">{t.dashboard.emptyState}</h3>
        <p>{t.dashboard.emptyStateDesc}</p>
      </CardContent>
    </Card>
  );
}
