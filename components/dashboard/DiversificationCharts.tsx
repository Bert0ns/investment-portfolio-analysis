import React, { useMemo } from 'react';
import { EtfConfig } from '@/lib/types';
import { generateOverlapMatrix, calculateUniqueness } from '@/lib/math';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from 'recharts';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface DiversificationChartsProps {
  etfs: EtfConfig[];
}

// Helper for bar chart colors based on uniqueness score
const getUniquenessColor = (score: number) => {
  if (score >= 50) return '#10b981'; // emerald-500
  if (score >= 20) return '#f59e0b'; // amber-500
  return '#ef4444'; // red-500
};

// Helper for heatmap colors based on overlap percentage
const getHeatmapColor = (overlap: number) => {
  if (overlap === 100) return 'bg-muted text-muted-foreground font-bold';
  if (overlap >= 80) return 'bg-destructive/90 text-destructive-foreground';
  if (overlap >= 50) return 'bg-destructive/60 text-foreground';
  if (overlap >= 25) return 'bg-orange-500/40 text-foreground';
  if (overlap >= 10) return 'bg-yellow-500/20 text-foreground';
  return 'bg-background text-muted-foreground';
};

export function DiversificationCharts({ etfs }: DiversificationChartsProps) {
  const { t } = useTranslation();

  // Ensure active ETFs only
  const activeEtfs = useMemo(() => etfs.filter((e) => e.globalWeight > 0), [etfs]);

  const uniquenessResults = useMemo(() => calculateUniqueness(activeEtfs), [activeEtfs]);
  const overlapMatrix = useMemo(() => generateOverlapMatrix(activeEtfs), [activeEtfs]);

  // Build a 2D array for the matrix
  const matrix = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const item of overlapMatrix) {
      if (!map[item.etfId1]) map[item.etfId1] = {};
      map[item.etfId1][item.etfId2] = item.overlapPercent;
    }
    return map;
  }, [overlapMatrix]);

  // If there's only 1 or 0 ETFs, the matrix and uniqueness aren't very useful
  if (activeEtfs.length <= 1) {
    return (
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {t.pages.analyzer.dashboard.widgets.diversification.analysisTitle}
            </CardTitle>
            <CardDescription>
              {t.pages.analyzer.dashboard.widgets.diversification.needTwoEtfs}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Uniqueness Score Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t.pages.analyzer.dashboard.widgets.diversification.uniquenessTitle}
          </CardTitle>
          <CardDescription>
            {t.pages.analyzer.dashboard.widgets.diversification.uniquenessDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 256, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={uniquenessResults}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis
                  type="number"
                  unit="%"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="etfName"
                  type="category"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                  tickFormatter={(val) => (val.length > 15 ? val.substring(0, 15) + '...' : val)}
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <Card className="px-3 py-2 border-border shadow-lg rounded-lg text-sm border">
                          <p className="font-medium text-foreground">
                            {payload[0].payload.etfName}
                          </p>
                          <p
                            className="font-semibold"
                            style={{ color: getUniquenessColor(payload[0].value as number) }}
                          >
                            {(payload[0].value as number).toFixed(1)}{' '}
                            {t.pages.analyzer.dashboard.widgets.diversification.uniqueSuffix}
                          </p>
                        </Card>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="uniquenessPercent" radius={[0, 4, 4, 0]} barSize={32}>
                  {uniquenessResults.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getUniquenessColor(entry.uniquenessPercent)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Correlation Matrix Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t.pages.analyzer.dashboard.widgets.diversification.matrixTitle}</CardTitle>
          <CardDescription>
            {t.pages.analyzer.dashboard.widgets.diversification.matrixDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm text-center border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground border-b border-r border-border">
                  {t.pages.analyzer.dashboard.widgets.diversification.etfColumn}
                </th>
                {activeEtfs.map((e) => (
                  <th
                    key={e.id}
                    className="p-3 font-medium text-muted-foreground border-b border-border min-w-[80px]"
                  >
                    <div className="truncate w-24 mx-auto" title={e.name}>
                      {e.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeEtfs.map((e1) => (
                <tr key={e1.id}>
                  <td className="p-3 text-left font-medium border-b border-r border-border">
                    <div className="truncate w-32 md:w-48" title={e1.name}>
                      {e1.name}
                    </div>
                  </td>
                  {activeEtfs.map((e2) => {
                    const overlap = matrix[e1.id]?.[e2.id] ?? 0;
                    return (
                      <td
                        key={`${e1.id}-${e2.id}`}
                        className={`p-3 border-b border-border border-l transition-colors ${getHeatmapColor(overlap)}`}
                      >
                        {overlap === 100 ? '-' : `${overlap.toFixed(1)}%`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
