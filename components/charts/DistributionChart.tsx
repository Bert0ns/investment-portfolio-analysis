import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartContainer, CustomTooltip } from '@/components/charts/Shared';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface DistributionChartProps {
  data: { name: string; value: number }[];
}

export function DistributionChart({ data }: DistributionChartProps) {
  const { t } = useTranslation();

  return (
    <Card className="lg:col-span-2">
      <ChartContainer
        title={t.pages.analyzer.dashboard.widgets.charts.distributionTitle}
        info={t.pages.analyzer.dashboard.widgets.charts.distributionInfo}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="name"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="number"
              unit="%"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)' }} />
            <Bar dataKey="value" fill="var(--chart-2)" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
}
