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
} from 'recharts';

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
  const topHoldings = useMemo(() => aggregateTopHoldings(etfs, 10), [etfs]);
  const avgTer = useMemo(() => calculateAverageTer(etfs), [etfs]);

  if (etfs.length === 0 || totalWeight === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center text-gray-500 min-h-[400px] h-full">
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Data to Display</h3>
        <p>Add ETFs and allocate weight to see your portfolio analysis.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 border border-gray-100 shadow-lg rounded-lg text-sm">
          <p className="font-medium text-gray-800">{payload[0].name}</p>
          <p className="text-blue-600 font-semibold">{payload[0].value.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Weighted Avg TER</h3>
          <p className="text-3xl font-bold text-gray-800">{avgTer.toFixed(2)}%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Assets Analyzed</h3>
          <p className="text-3xl font-bold text-gray-800">
            {etfs.reduce((sum, etf) => sum + etf.holdings.length, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active ETFs</h3>
          <p className="text-3xl font-bold text-gray-800">
            {etfs.filter((e) => e.globalWeight > 0).length}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Holdings Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Top 10 Holdings</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topHoldings}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  unit="%"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={28}>
                  {topHoldings.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic Exposure */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Geographic Exposure</h3>
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Exposure */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Sector Exposure</h3>
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
