'use client';

import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { usePositionsStore } from '@/store/positions-store';
import { usePortfolioStats } from '@/hooks/use-account-balance';
import { cn } from '@/lib/utils/cn';

export default function PortfolioPage() {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const positions = usePositionsStore((state) => state.positions);

  // Real data from Hyperliquid API
  const {
    accountValue,
    availableBalance,
    totalMargin,
    totalUnrealizedPnl,
    dailyPnl,
    weeklyPnl,
    monthlyPnl,
    isLoading,
  } = usePortfolioStats();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Portfolio</h1>
          <p className="text-gray-400 mb-6">Connect your wallet to view your portfolio</p>
          <button
            onClick={() => open()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  // Calculate all-time return percentage
  const allTimeReturnPct = accountValue > 0 ? (totalUnrealizedPnl / accountValue) * 100 : 0;

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Portfolio</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Portfolio Value */}
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Account Value</div>
            <div className="text-2xl font-bold text-white mb-1">
              ${accountValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div
              className={cn(
                'text-xs',
                allTimeReturnPct >= 0 ? 'text-green-400' : 'text-red-400'
              )}
            >
              {allTimeReturnPct >= 0 ? '+' : ''}
              {allTimeReturnPct.toFixed(2)}% Unrealized
            </div>
          </div>

          {/* Available Balance */}
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Available Balance</div>
            <div className="text-2xl font-bold text-white mb-1">
              ${availableBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-xs text-gray-400">Withdrawable</div>
          </div>

          {/* Total Margin */}
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Margin Used</div>
            <div className="text-2xl font-bold text-white mb-1">
              ${totalMargin.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-xs text-gray-400">
              {positions.length} position{positions.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Unrealized PnL */}
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Unrealized PnL</div>
            <div
              className={cn(
                'text-2xl font-bold mb-1',
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
                'text-xs',
                totalUnrealizedPnl >= 0 ? 'text-green-400/70' : 'text-red-400/70'
              )}
            >
              {totalUnrealizedPnl >= 0 ? '+' : ''}
              {accountValue > 0 ? ((totalUnrealizedPnl / accountValue) * 100).toFixed(2) : '0.00'}%
            </div>
          </div>
        </div>

        {/* PnL Timeline */}
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-2">24h PnL (Est.)</div>
              <div
                className={cn(
                  'text-xl font-semibold',
                  dailyPnl >= 0 ? 'text-green-400' : 'text-red-400'
                )}
              >
                {dailyPnl >= 0 ? '+' : ''}$
                {Math.abs(dailyPnl).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div
                className={cn(
                  'text-xs',
                  dailyPnl >= 0 ? 'text-green-400/70' : 'text-red-400/70'
                )}
              >
                {dailyPnl >= 0 ? '+' : ''}
                {accountValue > 0 ? ((dailyPnl / accountValue) * 100).toFixed(2) : '0.00'}%
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-2">7d PnL (Est.)</div>
              <div
                className={cn(
                  'text-xl font-semibold',
                  weeklyPnl >= 0 ? 'text-green-400' : 'text-red-400'
                )}
              >
                {weeklyPnl >= 0 ? '+' : ''}$
                {Math.abs(weeklyPnl).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div
                className={cn(
                  'text-xs',
                  weeklyPnl >= 0 ? 'text-green-400/70' : 'text-red-400/70'
                )}
              >
                {weeklyPnl >= 0 ? '+' : ''}
                {accountValue > 0 ? ((weeklyPnl / accountValue) * 100).toFixed(2) : '0.00'}%
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-2">30d PnL (Est.)</div>
              <div
                className={cn(
                  'text-xl font-semibold',
                  monthlyPnl >= 0 ? 'text-green-400' : 'text-red-400'
                )}
              >
                {monthlyPnl >= 0 ? '+' : ''}$
                {Math.abs(monthlyPnl).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div
                className={cn(
                  'text-xs',
                  monthlyPnl >= 0 ? 'text-green-400/70' : 'text-red-400/70'
                )}
              >
                {monthlyPnl >= 0 ? '+' : ''}
                {accountValue > 0 ? ((monthlyPnl / accountValue) * 100).toFixed(2) : '0.00'}%
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            * Historical PnL estimates based on current unrealized PnL. Full historical tracking coming soon.
          </div>
        </div>

        {/* Portfolio Chart Placeholder */}
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Portfolio Value Chart</h2>
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-lg mb-2">📊</div>
              <p>Portfolio value chart coming soon</p>
              <p className="text-xs mt-2">Will display historical portfolio value over time</p>
            </div>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Open Positions</h2>
          {positions.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              No open positions
            </div>
          ) : (
            <div className="space-y-4">
              {positions.map((position) => {
                const positionValue = parseFloat(position.size) * parseFloat(position.markPrice);
                const allocation = accountValue > 0 ? (positionValue / accountValue) * 100 : 0;
                const pnl = parseFloat(position.unrealizedPnl);

                return (
                  <div key={position.symbol} className="border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-white text-lg">{position.symbol}</span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium',
                            position.side === 'long'
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-red-500/10 text-red-400'
                          )}
                        >
                          {position.side.toUpperCase()} {position.leverage}x
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-300">
                          ${positionValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs text-gray-500">{allocation.toFixed(1)}% of portfolio</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Size</div>
                        <div className="text-white">{position.size}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Entry</div>
                        <div className="text-white">
                          ${parseFloat(position.entryPrice).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Mark</div>
                        <div className="text-white">
                          ${parseFloat(position.markPrice).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">PnL</div>
                        <div
                          className={cn(
                            'font-medium',
                            pnl >= 0 ? 'text-green-400' : 'text-red-400'
                          )}
                        >
                          {pnl >= 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                      <div
                        className={cn(
                          'h-2 rounded-full',
                          position.side === 'long' ? 'bg-green-500' : 'bg-red-500'
                        )}
                        style={{ width: `${Math.min(allocation, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
