'use client';

import Image from 'next/image';
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
    <div className="bg-[#0a0a0a] border border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="text-white text-xs mb-1">{label}</p>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <span className="text-white text-xs">PnL</span>
          <span
            className={cn(
              'text-xs font-normal',
              item.value >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]'
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
      <div className="h-[200px] flex flex-col items-center justify-center">
        <Image
          src="/iobit/landingpage/nofound.svg"
          alt="No data"
          width={40}
          height={40}
          className="mb-2 opacity-50"
        />
        <span className="text-[#8A8A8E] text-sm">No performance data available</span>
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
              <stop offset="5%" stopColor="#16DE93" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#16DE93" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="vaultPnlNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f6465d" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f6465d" stopOpacity={0} />
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
            stroke={isPositive ? '#16DE93' : '#f6465d'}
            fill={isPositive ? 'url(#vaultPnlPos)' : 'url(#vaultPnlNeg)'}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
