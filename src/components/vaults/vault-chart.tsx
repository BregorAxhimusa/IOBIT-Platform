'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils/cn';
import type { VaultPortfolioPeriod } from '@/lib/hyperliquid/types';

interface VaultChartProps {
  periods: VaultPortfolioPeriod[];
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
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
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <span className="text-gray-400 text-xs">PnL</span>
          <span
            className={cn(
              'text-xs font-medium',
              item.value >= 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function VaultChart({ periods }: VaultChartProps) {
  if (!periods || periods.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
        No performance data available
      </div>
    );
  }

  const chartData = periods.map((p) => ({
    period: p.period,
    pnl: parseFloat(p.pnl),
    apr: p.apr,
    volume: parseFloat(p.vlm),
  }));

  const lastPnl = chartData[chartData.length - 1]?.pnl || 0;
  const isPositive = lastPnl >= 0;

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="vaultPnlPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="vaultPnlNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2028" />
          <XAxis
            dataKey="period"
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={{ stroke: '#1a2028' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={{ stroke: '#1a2028' }}
            tickLine={false}
            tickFormatter={(v: number) => formatCurrency(v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="pnl"
            stroke={isPositive ? '#14b8a6' : '#ef4444'}
            fill={isPositive ? 'url(#vaultPnlPos)' : 'url(#vaultPnlNeg)'}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
