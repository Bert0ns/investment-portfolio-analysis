'use client';

import { useMemo } from 'react';
import { EtfConfig } from '../lib/types';
import { aggregateBy, aggregateTopHoldings, calculateAverageTer } from '../lib/math';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Info } from 'lucide-react';

function ChartTitleWithInfo({ title, info }: { title: string; info: string }) {
  return (
    <div className="flex items-center gap-2">
      <CardTitle>{title}</CardTitle>
      <UITooltip delay={200}>
        <TooltipTrigger className="inline-flex outline-none focus:ring-2 focus:ring-ring rounded-full">
          <Info
            size={16}
            className="text-muted-foreground hover:text-foreground cursor-help transition-colors"
          />
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px] text-center leading-relaxed">
          <p>{info}</p>
        </TooltipContent>
      </UITooltip>
    </div>
  );
}

interface DashboardProps {
  etfs: EtfConfig[];
  totalWeight: number;
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#64748b',
  '#ec4899',
  '#14b8a6',
];

export default function Dashboard({ etfs, totalWeight }: DashboardProps) {
  const geoData = useMemo(() => aggregateBy(etfs, 'country').slice(0, 10), [etfs]);
  const sectorData = useMemo(() => aggregateBy(etfs, 'sector').slice(0, 10), [etfs]);
  const currencyData = useMemo(() => aggregateBy(etfs, 'currency').slice(0, 5), [etfs]);
  const etfAllocationData = useMemo(() => {
    return etfs
      .filter((e) => e.globalWeight > 0)
      .map((e) => ({
        name: e.name,
        value: e.globalWeight,
      }))
      .sort((a, b) => b.value - a.value);
  }, [etfs]);
  const topHoldings = useMemo(() => aggregateTopHoldings(etfs, 10), [etfs]);
  const avgTer = useMemo(() => calculateAverageTer(etfs), [etfs]);

  const concentrationData = useMemo(() => {
    const allHoldings = aggregateTopHoldings(etfs, 50);
    let cumulative = 0;
    return allHoldings.map((h, i) => {
      cumulative += h.value;
      return {
        name: `Top ${i + 1}`,
        value: cumulative,
      };
    });
  }, [etfs]);

  const weightDistributionData = useMemo(() => {
    const allHoldings = aggregateTopHoldings(etfs, 10000);
    const bins = { '> 1%': 0, '0.5% - 1%': 0, '0.1% - 0.5%': 0, '< 0.1%': 0 };
    for (const h of allHoldings) {
      if (h.value >= 1) bins['> 1%'] += h.value;
      else if (h.value >= 0.5) bins['0.5% - 1%'] += h.value;
      else if (h.value >= 0.1) bins['0.1% - 0.5%'] += h.value;
      else bins['< 0.1%'] += h.value;
    }
    return [
      { name: '> 1%', value: bins['> 1%'] },
      { name: '0.5% - 1%', value: bins['0.5% - 1%'] },
      { name: '0.1% - 0.5%', value: bins['0.1% - 0.5%'] },
      { name: '< 0.1%', value: bins['< 0.1%'] },
    ];
  }, [etfs]);

  if (etfs.length === 0 || totalWeight === 0) {
    return (
      <Card className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[400px] h-full border-dashed">
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium text-foreground mb-2">No Data to Display</h3>
          <p>Add ETFs and allocate weight to see your portfolio analysis.</p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { name: string; value: number }[];
  }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="px-3 py-2 border-border shadow-lg rounded-lg text-sm border">
          <p className="font-medium text-foreground">{payload[0].name}</p>
          <p className="text-primary font-semibold">{payload[0].value.toFixed(2)}%</p>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Weighted Avg TER</h3>
            <p className="text-3xl font-bold text-foreground">{avgTer.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Total Assets Analyzed
            </h3>
            <p className="text-3xl font-bold text-foreground">
              {etfs.reduce((sum, etf) => sum + etf.holdings.length, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Active ETFs</h3>
            <p className="text-3xl font-bold text-foreground">
              {etfs.filter((e) => e.globalWeight > 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Holdings Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <ChartTitleWithInfo
              title="Top 10 Holdings"
              info="The 10 largest individual companies you own across all your active ETFs, aggregated by their proportional weight."
            />
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topHoldings}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
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
                    dataKey="name"
                    type="category"
                    width={150}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)' }} />
                  <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={28}>
                    {topHoldings.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Exposure */}
        <Card>
          <CardHeader>
            <ChartTitleWithInfo
              title="Geographic Exposure"
              info="A breakdown of the physical country locations of the underlying companies in your portfolio."
            />
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {geoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sector Exposure */}
        <Card>
          <CardHeader>
            <ChartTitleWithInfo
              title="Sector Exposure"
              info="The industry breakdown (e.g., Technology, Healthcare) of the underlying companies in your portfolio."
            />
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        {/* Currency Exposure */}
        <Card>
          <CardHeader>
            <ChartTitleWithInfo
              title="Currency Exposure"
              info="Your risk exposure to different foreign exchange currencies based on the trading currency of your underlying assets."
            />
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currencyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {currencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ETF Allocation */}
        <Card>
          <CardHeader>
            <ChartTitleWithInfo
              title="ETF Allocation"
              info="A macro-level breakdown of the weights you assigned to each individual ETF in your portfolio."
            />
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={etfAllocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {etfAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 6) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        {/* Portfolio Concentration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <ChartTitleWithInfo
              title="Portfolio Concentration (Top 50 Holdings)"
              info="A cumulative sum of your top 50 holdings. Helps identify if your portfolio is top-heavy (e.g., your top 5 stocks making up 30% of your net worth)."
            />
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={concentrationData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
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

        {/* Weight Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <ChartTitleWithInfo
              title="Holdings Weight Distribution"
              info="Groups your underlying stocks by their individual size. Determines if you hold a few large positions vs thousands of tiny fractional positions."
            />
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weightDistributionData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
