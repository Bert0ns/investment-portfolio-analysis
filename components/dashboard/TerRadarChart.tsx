import React, { useMemo } from 'react';
import { EtfConfig } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { useTranslation } from '@/lib/i18n/LanguageContext';

interface TerRadarChartProps {
  etfs: EtfConfig[];
}

export function TerRadarChart({ etfs }: TerRadarChartProps) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    return etfs.map((etf) => ({
      subject: etf.name.length > 15 ? etf.name.substring(0, 15) + '...' : etf.name,
      fullName: etf.name,
      ter: etf.ter,
    }));
  }, [etfs]);

  // A radar chart needs at least 3 points to form a polygon
  if (etfs.length < 3) {
    return null;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t.pages.analyzer.dashboard.tabs.fundDetailsTab.terRadarTitle}</CardTitle>
        <CardDescription>
          {t.pages.analyzer.dashboard.tabs.fundDetailsTab.terRadarInfo}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, (dataMax: number) => Math.max(dataMax, 0.01)]}
                tick={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <Card className="px-3 py-2 border-border shadow-lg rounded-lg text-sm border bg-background">
                        <p className="font-medium text-foreground">{payload[0].payload.fullName}</p>
                        <p className="font-semibold text-primary">
                          TER: {Number(payload[0].value).toFixed(2)}%
                        </p>
                      </Card>
                    );
                  }
                  return null;
                }}
              />
              <Radar
                name="TER"
                dataKey="ter"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
