import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from './utils';

export function SavingsPlanChart({
  chartData,
  years,
  t,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartData: any[];
  years: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>
          {t.savingsPlan.growthProjection} {years} {t.savingsPlan.years}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 350, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="year"
                tickFormatter={(val) => `${t.savingsPlan.year} ${val}`}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                formatter={(value: string | number | readonly (string | number)[] | undefined) =>
                  formatCurrency(Number(value) || 0)
                }
                labelFormatter={(label) => `${t.savingsPlan.year} ${label}`}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                name={t.savingsPlan.totalValue}
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey="invested"
                name={t.savingsPlan.investedCapital}
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorInvested)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
