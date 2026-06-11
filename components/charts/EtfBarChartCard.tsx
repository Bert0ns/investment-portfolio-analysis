import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader } from '../ui/card';
import { COLORS, ChartTitleWithInfo } from './Shared';

type ChartData = { name: string; value: number };

interface EtfBarChartCardProps {
  title: string;
  info: string;
  data: ChartData[];
  unit: string;
  colorOffset?: number;
}

const CustomTooltip = ({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: readonly {
    payload?: ChartData;
    value?: number | string | readonly (number | string)[];
  }[];
  unit: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <Card className="px-3 py-2 border-border shadow-lg rounded-lg text-sm border">
        <p className="font-medium text-foreground">{payload[0].payload?.name}</p>
        <p className="text-primary font-semibold">
          {payload[0].value?.toLocaleString()} {unit}
        </p>
      </Card>
    );
  }
  return null;
};

export function EtfBarChartCard({
  title,
  info,
  data,
  unit,
  colorOffset = 0,
}: EtfBarChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <ChartTitleWithInfo title={title} info={info} />
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 256, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val.length > 10 ? val.substring(0, 10) + '...' : val)}
              />
              <YAxis
                type="number"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip
                content={(props) => <CustomTooltip {...props} unit={unit} />}
                cursor={{ fill: 'var(--muted)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[(index + colorOffset) % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
