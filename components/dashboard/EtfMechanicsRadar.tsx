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

  const data = useMemo(() => {
    // Only take the top 5 ETFs by global weight to avoid clutter
    const topEtfs = [...etfs].sort((a, b) => b.globalWeight - a.globalWeight).slice(0, 5);

    // Calculate maximums for relative scaling
    const maxTer = Math.max(0.5, ...topEtfs.map((e) => e.ter));
    const maxHoldings = Math.max(500, ...topEtfs.map((e) => e.holdings.length));
    const maxAge = Math.max(10, ...topEtfs.map((e) => e.fundAge));
    const maxSize = Math.max(5000, ...topEtfs.map((e) => e.fundSize));
    const maxWeight = Math.max(20, ...topEtfs.map((e) => e.globalWeight));

    // Radar axes definition
    const axes = [
      { name: t.riskAnalysisTab.axisCostEfficiency, key: 'cost' },
      { name: t.riskAnalysisTab.axisDiversification, key: 'diversification' },
      { name: t.riskAnalysisTab.axisFundSize, key: 'size' },
      { name: t.riskAnalysisTab.axisFundAge, key: 'age' },
      { name: t.riskAnalysisTab.axisPortfolioWeight, key: 'weight' },
    ];

    // Build the data array formatted for Recharts
    // Each object represents an AXIS, and contains the value for each ETF
    return axes.map((axis) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axisData: any = { subject: axis.name };

      topEtfs.forEach((etf) => {
        let score = 0;
        switch (axis.key) {
          case 'cost':
            // Lower TER is better, invert the scale
            score = Math.max(0, 100 - (etf.ter / maxTer) * 100);
            break;
          case 'diversification':
            score = (etf.holdings.length / maxHoldings) * 100;
            break;
          case 'size':
            score = (etf.fundSize / maxSize) * 100;
            break;
          case 'age':
            score = (etf.fundAge / maxAge) * 100;
            break;
          case 'weight':
            score = (etf.globalWeight / maxWeight) * 100;
            break;
        }
        axisData[etf.name] = Math.round(score);
      });

      return axisData;
    });
  }, [etfs, t]);

  const topEtfs = useMemo(() => {
    return [...etfs].sort((a, b) => b.globalWeight - a.globalWeight).slice(0, 5);
  }, [etfs]);

  if (etfs.length === 0) return null;

  return (
    <Card className="h-full lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
      <CardHeader>
        <CardTitle>{t.riskAnalysisTab.etfMechanicsTitle}</CardTitle>
        <CardDescription>{t.riskAnalysisTab.etfMechanicsInfo}</CardDescription>
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
