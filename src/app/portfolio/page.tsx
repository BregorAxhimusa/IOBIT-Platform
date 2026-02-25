'use client';

import { useState } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { usePositionsStore } from '@/store/positions-store';
import { usePortfolioStats } from '@/hooks/use-account-balance';
import { usePortfolioPnL } from '@/hooks/use-portfolio-pnl';
import { PortfolioChart } from '@/components/portfolio/portfolio-chart';
import { PerformanceStatsSection } from '@/components/portfolio/performance-stats';
import { FundingHistory } from '@/components/portfolio/funding-history';
import { SpotBalancesTable } from '@/components/trading/spot/spot-balances-table';
import { TradeHistoryTable } from '@/components/trading/trade-history/trade-history-table';
import { FeeSavingsCard } from '@/components/portfolio/fee-savings-card';
import { cn } from '@/lib/utils/cn';

type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';
type PortfolioTab = 'overview' | 'positions' | 'spot' | 'funding' | 'trades';

export default function PortfolioPage() {
  const { isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const positions = usePositionsStore((state) => state.positions);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeTab, setActiveTab] = useState<PortfolioTab>('overview');

  const {
    accountValue,
    availableBalance,
    totalMargin,
    totalUnrealizedPnl,
    isLoading: isStatsLoading,
  } = usePortfolioStats();

  const {
    pnlData,
    stats,
    funding,
    isLoading: isPnlLoading,
  } = usePortfolioPnL(timeRange);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-normal text-white mb-4">Portfolio</h1>
          <p className="text-gray-400 mb-6">Connect your wallet to view your portfolio</p>
          <button
            onClick={() => open()}
            className="px-6 py-2.5 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-normal transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (isStatsLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14b8a6] mx-auto mb-4" />
          <p className="text-gray-400">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  const allTimeReturnPct = accountValue > 0 ? (totalUnrealizedPnl / accountValue) * 100 : 0;

  const TABS: { value: PortfolioTab; label: string }[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'positions', label: `Positions (${positions.length})` },
    { value: 'spot', label: 'Spot Balances' },
    { value: 'funding', label: 'Funding' },
    { value: 'trades', label: 'Trade History' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] page-enter">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <h1 className="text-2xl font-normal text-white mb-6">Portfolio</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger-children" aria-live="polite">
          {/* Account Value */}
          <div className="bg-[#0f1419] border border-gray-800 p-4">
            <div className="text-xs text-gray-400 mb-1">Account Value</div>
            <div className="text-xl font-normal text-white">
              ${accountValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div
              className={cn(
                'text-xs mt-1',
                allTimeReturnPct >= 0 ? 'text-green-400' : 'text-red-400'
              )}
            >
              {allTimeReturnPct >= 0 ? '+' : ''}
              {allTimeReturnPct.toFixed(2)}% Unrealized
            </div>
          </div>

          {/* Available Balance */}
          <div className="bg-[#0f1419] border border-gray-800 p-4">
            <div className="text-xs text-gray-400 mb-1">Available Balance</div>
            <div className="text-xl font-normal text-white">
              ${availableBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-xs text-gray-500 mt-1">Withdrawable</div>
          </div>

          {/* Margin Used */}
          <div className="bg-[#0f1419] border border-gray-800 p-4">
            <div className="text-xs text-gray-400 mb-1">Margin Used</div>
            <div className="text-xl font-normal text-white">
              ${totalMargin.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {positions.length} position{positions.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Unrealized PnL */}
          <div className="bg-[#0f1419] border border-gray-800 p-4">
            <div className="text-xs text-gray-400 mb-1">Unrealized PnL</div>
            <div
              className={cn(
                'text-xl font-normal',
                totalUnrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'
              )}
            >
              {totalUnrealizedPnl >= 0 ? '+' : ''}$
              {Math.abs(totalUnrealizedPnl).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div
              className={cn(
                'text-xs mt-1',
                totalUnrealizedPnl >= 0 ? 'text-green-400/70' : 'text-red-400/70'
              )}
            >
              {totalUnrealizedPnl >= 0 ? '+' : ''}
              {accountValue > 0 ? ((totalUnrealizedPnl / accountValue) * 100).toFixed(2) : '0.00'}%
            </div>
          </div>
        </div>

        {/* Fee Status Card */}
        <div className="mb-6">
          <FeeSavingsCard />
        </div>

        {/* Portfolio Chart */}
        <div className="mb-6">
          <PortfolioChart
            data={pnlData}
            isLoading={isPnlLoading}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>

        {/* Performance Analytics */}
        <div className="mb-6">
          <PerformanceStatsSection stats={stats} isLoading={isPnlLoading} />
        </div>

        {/* Tabs */}
        <div className="bg-[#0f1419] border border-gray-800 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex overflow-x-auto border-b border-gray-800 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'px-4 py-3 text-sm font-normal whitespace-nowrap transition-colors',
                  activeTab === tab.value
                    ? 'text-white border-b-2 border-[#14b8a6] bg-[#1a2028]'
                    : 'text-white/70 hover:text-white hover:bg-[#1a2028]/50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 min-h-[300px]">
            {activeTab === 'overview' && (
              <OverviewTab positions={positions} accountValue={accountValue} />
            )}
            {activeTab === 'positions' && (
              <PositionsTab positions={positions} accountValue={accountValue} />
            )}
            {activeTab === 'spot' && <SpotBalancesTable />}
            {activeTab === 'funding' && (
              <FundingHistory funding={funding} isLoading={isPnlLoading} />
            )}
            {activeTab === 'trades' && <TradeHistoryTable />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Overview Tab =====

interface Position {
  symbol: string;
  side: string;
  size: string;
  leverage: number;
  entryPrice: string;
  markPrice: string;
  unrealizedPnl: string;
}

interface OverviewTabProps {
  positions: Position[];
  accountValue: number;
}

function OverviewTab({ positions, accountValue }: OverviewTabProps) {
  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
        No open positions. Start trading to see your portfolio overview.
      </div>
    );
  }

  // Sort positions by value descending
  const sortedPositions = [...positions].sort((a, b) => {
    const valueA = Math.abs(parseFloat(a.size) * parseFloat(a.markPrice));
    const valueB = Math.abs(parseFloat(b.size) * parseFloat(b.markPrice));
    return valueB - valueA;
  });

  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-3">Asset Allocation</h3>
      <div className="space-y-2">
        {sortedPositions.map((position) => {
          const posValue = Math.abs(parseFloat(position.size) * parseFloat(position.markPrice));
          const pnl = parseFloat(position.unrealizedPnl);
          const allocation = accountValue > 0 ? (posValue / accountValue) * 100 : 0;

          return (
            <div key={position.symbol} className="bg-[#1a2028] p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white font-normal text-sm">{position.symbol}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                      position.side === 'long'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    )}
                  >
                    {position.side.toUpperCase()} {position.leverage}x
                  </span>
                </div>
                <div className="text-right">
                  <span className={cn('text-sm font-normal', pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                  <div
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      position.side === 'long' ? 'bg-green-500' : 'bg-red-500'
                    )}
                    style={{ width: `${Math.min(allocation, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-12 text-right">{allocation.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Positions Tab =====

function PositionsTab({ positions, accountValue }: OverviewTabProps) {
  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
        No open positions
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 border-b border-gray-800">
            <th className="text-left py-2 px-3 font-normal">Symbol</th>
            <th className="text-left py-2 px-3 font-normal">Side</th>
            <th className="text-right py-2 px-3 font-normal">Size</th>
            <th className="text-right py-2 px-3 font-normal">Entry Price</th>
            <th className="text-right py-2 px-3 font-normal">Mark Price</th>
            <th className="text-right py-2 px-3 font-normal">Value</th>
            <th className="text-right py-2 px-3 font-normal">PnL</th>
            <th className="text-right py-2 px-3 font-normal">Allocation</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => {
            const posValue = Math.abs(parseFloat(position.size) * parseFloat(position.markPrice));
            const pnl = parseFloat(position.unrealizedPnl);
            const allocation = accountValue > 0 ? (posValue / accountValue) * 100 : 0;

            return (
              <tr
                key={position.symbol}
                className="border-b border-gray-800/50 hover:bg-[#1a2028]/50 transition-colors"
              >
                <td className="py-2.5 px-3 font-normal text-white">{position.symbol}</td>
                <td className="py-2.5 px-3">
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                      position.side === 'long'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    )}
                  >
                    {position.side.toUpperCase()} {position.leverage}x
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right text-white">{position.size}</td>
                <td className="py-2.5 px-3 text-right text-gray-300">
                  ${parseFloat(position.entryPrice).toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right text-gray-300">
                  ${parseFloat(position.markPrice).toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right text-white">
                  ${posValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className={cn('font-normal', pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right text-gray-400">
                  {allocation.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
