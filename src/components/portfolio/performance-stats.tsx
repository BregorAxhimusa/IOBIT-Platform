'use client';

import type { PerformanceStats } from '@/lib/hyperliquid/types';
import { cn } from '@/lib/utils/cn';

interface PerformanceStatsProps {
  stats: PerformanceStats | null;
  isLoading: boolean;
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

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

interface StatCardProps {
  label: string;
  value: string;
  colorClass?: string;
}

function StatCard({ label, value, colorClass = 'text-white' }: StatCardProps) {
  return (
    <div className="bg-[#1a2028] rounded-lg p-3">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className={cn('text-sm font-semibold', colorClass)}>{value}</p>
    </div>
  );
}

export function PerformanceStatsSection({ stats, isLoading }: PerformanceStatsProps) {
  if (isLoading) {
    return (
      <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Performance Analytics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-[#1a2028] rounded-lg p-3 animate-pulse">
              <div className="h-3 bg-gray-700 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-700 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Performance Analytics</h3>
        <p className="text-gray-500 text-sm">Connect wallet to view performance stats</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-3">Performance Analytics</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* PnL Section */}
        <StatCard
          label="Net PnL"
          value={formatCurrency(stats.netPnl)}
          colorClass={stats.netPnl >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="Realized PnL"
          value={formatCurrency(stats.totalRealizedPnl)}
          colorClass={stats.totalRealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="Funding"
          value={formatCurrency(stats.totalFunding)}
          colorClass={stats.totalFunding >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="Total Fees"
          value={formatCurrency(stats.totalFees)}
          colorClass="text-red-400"
        />
        <StatCard
          label="Total Volume"
          value={formatCurrency(stats.totalVolume)}
        />

        {/* Trade Stats */}
        <StatCard
          label="Total Trades"
          value={stats.totalTrades.toLocaleString()}
        />
        <StatCard
          label="Win Rate"
          value={formatPercent(stats.winRate)}
          colorClass={stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="Profit Factor"
          value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
          colorClass={stats.profitFactor >= 1 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="Avg Win"
          value={formatCurrency(stats.avgWin)}
          colorClass="text-green-400"
        />
        <StatCard
          label="Avg Loss"
          value={formatCurrency(stats.avgLoss)}
          colorClass="text-red-400"
        />

        {/* Additional Stats */}
        <StatCard
          label="Largest Win"
          value={formatCurrency(stats.largestWin)}
          colorClass="text-green-400"
        />
        <StatCard
          label="Largest Loss"
          value={formatCurrency(stats.largestLoss)}
          colorClass="text-red-400"
        />
        <StatCard
          label="Winning Trades"
          value={stats.winningTrades.toLocaleString()}
          colorClass="text-green-400"
        />
        <StatCard
          label="Losing Trades"
          value={stats.losingTrades.toLocaleString()}
          colorClass="text-red-400"
        />
        <StatCard
          label="Avg Trade Size"
          value={formatCurrency(stats.avgTradeSize)}
        />
      </div>
    </div>
  );
}
