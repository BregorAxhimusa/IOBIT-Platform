'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from 'recharts';
import type { PnLData } from '@/lib/hyperliquid/types';
import { cn } from '@/lib/utils/cn';

type ChartMode = 'cumulative' | 'daily';
type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';

interface PortfolioChartProps {
  data: PnLData[];
  isLoading: boolean;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: 'all', label: 'ALL' },
];

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-[#1a2028] border border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="text-gray-400 text-xs mb-2">{label}</p>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <span className="text-gray-400 text-xs capitalize">
            {item.dataKey === 'cumulativePnl' ? 'Cumulative PnL' :
             item.dataKey === 'totalPnl' ? 'Daily PnL' :
             item.dataKey === 'realizedPnl' ? 'Realized' :
             item.dataKey === 'fundingPnl' ? 'Funding' :
             item.dataKey}
          </span>
          <span className={cn('text-xs font-medium', item.value >= 0 ? 'text-green-400' : 'text-red-400')}>
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PortfolioChart({
  data,
  isLoading,
  timeRange,
  onTimeRangeChange,
}: PortfolioChartProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('cumulative');

  if (isLoading) {
    return (
      <div className="bg-[#0f1419] border border-gray-800 p-4">
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#0f1419] border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Portfolio Performance</h3>
        </div>
        <div className="h-[350px] flex items-center justify-center">
          <p className="text-gray-500">No trading data available for this period</p>
        </div>
      </div>
    );
  }

  // Format data for chart display
  const chartData = data.map((d) => ({
    ...d,
    date: formatDate(d.date),
  }));

  const lastPoint = data[data.length - 1];
  const totalPnl = lastPoint?.cumulativePnl || 0;
  const isPositive = totalPnl >= 0;

  return (
    <div className="bg-[#0f1419] border border-gray-800 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-white font-semibold">Portfolio Performance</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn('text-lg font-bold', isPositive ? 'text-green-400' : 'text-red-400')}>
              {isPositive ? '+' : ''}{formatCurrency(totalPnl)}
            </span>
            <span className="text-gray-500 text-sm">cumulative PnL</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart Mode Toggle */}
          <div className="flex bg-[#1a2028] rounded-lg p-0.5">
            <button
              onClick={() => setChartMode('cumulative')}
              className={cn(
                'px-3 py-1 text-xs rounded-md transition-colors',
                chartMode === 'cumulative'
                  ? 'bg-[#14b8a6] text-white'
                  : 'text-white/70 hover:text-white'
              )}
            >
              Cumulative
            </button>
            <button
              onClick={() => setChartMode('daily')}
              className={cn(
                'px-3 py-1 text-xs rounded-md transition-colors',
                chartMode === 'daily'
                  ? 'bg-[#14b8a6] text-white'
                  : 'text-white/70 hover:text-white'
              )}
            >
              Daily
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex bg-[#1a2028] rounded-lg p-0.5">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => onTimeRangeChange(range.value)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md transition-colors',
                  timeRange === range.value
                    ? 'bg-[#14b8a6] text-white'
                    : 'text-white/70 hover:text-white'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'cumulative' ? (
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="pnlGradientPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pnlGradientNeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2028" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: '#1a2028' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: '#1a2028' }}
                tickLine={false}
                tickFormatter={(value: number) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativePnl"
                stroke={isPositive ? '#14b8a6' : '#ef4444'}
                fill={isPositive ? 'url(#pnlGradientPos)' : 'url(#pnlGradientNeg)'}
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2028" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: '#1a2028' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: '#1a2028' }}
                tickLine={false}
                tickFormatter={(value: number) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="realizedPnl"
                fill="#14b8a6"
                opacity={0.6}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="fundingPnl"
                fill="#8b5cf6"
                opacity={0.6}
                radius={[2, 2, 0, 0]}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
