import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChartTitleWithInfo, CustomTooltip } from '@/components/charts/Shared';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface ConcentrationChartProps {
  data: { name: string; value: number }[];
}

export function ConcentrationChart({ data }: ConcentrationChartProps) {
  const { t } = useTranslation();

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <ChartTitleWithInfo title={t.charts.concentrationTitle} info={t.charts.concentrationInfo} />
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 256, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                type="number"
                unit="%"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 'dataMax']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
