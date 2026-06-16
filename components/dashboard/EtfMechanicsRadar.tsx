import React, { useMemo } from 'react';
import { EtfConfig } from '@/lib/types';
import { calculateMechanicsData } from '@/lib/math/mechanics';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface EtfMechanicsRadarProps {
  etfs: EtfConfig[];
}

const COLORS = [
  'var(--primary)',
  '#f59e0b', // amber
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export function EtfMechanicsRadar({ etfs }: EtfMechanicsRadarProps) {
  const { t } = useTranslation();

  const { data, topEtfs } = useMemo(() => {
    const { topEtfs: top, axesData } = calculateMechanicsData(etfs);

    if (top.length === 0) {
      return { data: [], topEtfs: [] };
    }

    const localizedAxes: Record<string, string> = {
      cost: t.pages.analyzer.dashboard.tabs.riskAnalysisTab.axisCostEfficiency,
      diversification: t.pages.analyzer.dashboard.tabs.riskAnalysisTab.axisDiversification,
      size: t.pages.analyzer.dashboard.tabs.riskAnalysisTab.axisFundSize,
      age: t.pages.analyzer.dashboard.tabs.riskAnalysisTab.axisFundAge,
      weight: t.pages.analyzer.dashboard.tabs.riskAnalysisTab.axisPortfolioWeight,
    };

    const formattedData = axesData.map((axis) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axisFormatted: any = { subject: localizedAxes[axis.key] };
      for (const [etfName, score] of Object.entries(axis.scores)) {
        axisFormatted[etfName] = score;
      }
      return axisFormatted;
    });

    return { data: formattedData, topEtfs: top };
  }, [etfs, t]);

  if (etfs.length === 0) return null;

  return (
    <Card className="h-full lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
      <CardHeader>
        <CardTitle>{t.pages.analyzer.dashboard.tabs.riskAnalysisTab.etfMechanicsTitle}</CardTitle>
        <CardDescription>
          {t.pages.analyzer.dashboard.tabs.riskAnalysisTab.etfMechanicsInfo}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 400, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: 'var(--foreground)', fontSize: '13px' }}
                labelStyle={{ fontWeight: 'bold', color: 'var(--foreground)', marginBottom: '4px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {topEtfs.map((etf, index) => (
                <Radar
                  key={etf.id}
                  name={etf.name.length > 20 ? etf.name.substring(0, 20) + '...' : etf.name}
                  dataKey={etf.name}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.3}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
