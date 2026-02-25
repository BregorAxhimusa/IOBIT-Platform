'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useVaultDetails } from '@/hooks/use-vault-details';
import { useVaultStore } from '@/store/vault-store';
import { VaultChart } from '@/components/vaults/vault-chart';
import { VaultFollowers } from '@/components/vaults/vault-followers';
import { VaultDepositModal } from '@/components/vaults/vault-deposit-modal';
import { cn } from '@/lib/utils/cn';
import { formatAddress } from '@/lib/utils/format';
import { useAppKitAccount } from '@reown/appkit/react';

type Tab = 'positions' | 'followers' | 'performance';

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export default function VaultDetailPage() {
  const params = useParams();
  const vaultAddress = params.address as string;
  const [tab, setTab] = useState<Tab>('positions');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const { isConnected } = useAppKitAccount();

  const { vault, isLoading, refetch } = useVaultDetails(vaultAddress);
  const getUserVaultEquity = useVaultStore((state) => state.getUserVaultEquity);
  const userEquity = getUserVaultEquity(vaultAddress);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0e11] text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-700 rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4 mt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-700 rounded-lg" />
              ))}
            </div>
            <div className="h-[200px] bg-gray-700 rounded-lg mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-[#0b0e11] text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link href="/vaults" className="text-[#14b8a6] text-sm hover:underline mb-4 inline-block">
            &larr; Back to Vaults
          </Link>
          <div className="flex items-center justify-center py-16 text-gray-500">
            Vault not found
          </div>
        </div>
      </div>
    );
  }

  const { summary, followers, portfolio } = vault;
  const totalPnl = parseFloat(summary.pnl || '0');
  const tvl = parseFloat(summary.tvl || '0');
  const isPnlPositive = totalPnl >= 0;
  const currentUserEquity = userEquity ? parseFloat(userEquity.equity) : 0;

  const tabs: { value: Tab; label: string }[] = [
    { value: 'positions', label: `Positions (${portfolio?.length || 0})` },
    { value: 'followers', label: `Followers (${followers?.length || 0})` },
    { value: 'performance', label: 'Performance' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Link href="/vaults" className="text-[#14b8a6] text-sm hover:underline mb-4 inline-block">
          &larr; Back to Vaults
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">{summary.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-gray-400 text-xs">
                Leader: {formatAddress(summary.leader)}
              </span>
              <span className="text-gray-400 text-xs">
                Commission: {(summary.leaderCommission * 100).toFixed(0)}%
              </span>
              {summary.isClosed && (
                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full">
                  Closed
                </span>
              )}
            </div>
            {summary.description && (
              <p className="text-gray-400 text-sm mt-2 max-w-lg">{summary.description}</p>
            )}
          </div>

          {/* Deposit Button */}
          {!summary.isClosed && (
            <button
              onClick={() => setShowDepositModal(true)}
              disabled={!isConnected}
              className="px-6 py-2.5 bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentUserEquity > 0 ? 'Manage' : 'Deposit'}
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">TVL</p>
            <p className="text-white text-sm font-semibold">{formatCurrency(tvl)}</p>
          </div>
          <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">All-time PnL</p>
            <p
              className={cn(
                'text-sm font-semibold',
                isPnlPositive ? 'text-green-400' : 'text-red-400'
              )}
            >
              {isPnlPositive ? '+' : ''}
              {formatCurrency(totalPnl)}
            </p>
          </div>
          <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">APR</p>
            <p
              className={cn(
                'text-sm font-semibold',
                summary.apr >= 0 ? 'text-green-400' : 'text-red-400'
              )}
            >
              {summary.apr >= 0 ? '+' : ''}
              {summary.apr.toFixed(1)}%
            </p>
          </div>
          <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Followers</p>
            <p className="text-white text-sm font-semibold">
              {summary.followerCount?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* User Equity Banner */}
        {currentUserEquity > 0 && userEquity && (
          <div className="bg-[#14b8a6]/10 border border-[#14b8a6]/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#14b8a6] text-xs font-medium">Your Position</p>
                <p className="text-white text-lg font-semibold">
                  {formatCurrency(currentUserEquity)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Your PnL</p>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    parseFloat(userEquity.pnl) >= 0 ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {parseFloat(userEquity.pnl) >= 0 ? '+' : ''}
                  {formatCurrency(parseFloat(userEquity.pnl))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        {summary.portfolioPeriods && summary.portfolioPeriods.length > 0 && (
          <div className="bg-[#0f1419] border border-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold text-sm mb-3">Performance</h3>
            <VaultChart periods={summary.portfolioPeriods} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-4">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                'px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px',
                tab === t.value
                  ? 'border-[#14b8a6] text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-[#0f1419] border border-gray-800 rounded-lg">
          {tab === 'positions' && (
            <div className="overflow-x-auto">
              {portfolio && portfolio.length > 0 ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left py-2 px-3 font-medium">Coin</th>
                      <th className="text-right py-2 px-3 font-medium">Size</th>
                      <th className="text-right py-2 px-3 font-medium">Entry Price</th>
                      <th className="text-right py-2 px-3 font-medium">Position Value</th>
                      <th className="text-right py-2 px-3 font-medium">Unrealized PnL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((pos) => {
                      const unrealizedPnl = parseFloat(pos.unrealizedPnl);
                      const size = parseFloat(pos.szi);
                      const isBuy = size > 0;

                      return (
                        <tr
                          key={pos.coin}
                          className="border-b border-gray-800/50 hover:bg-[#1a2028]/50 transition-colors"
                        >
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{pos.coin}</span>
                              <span
                                className={cn(
                                  'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                                  isBuy
                                    ? 'bg-[#14b8a6]/10 text-[#14b8a6]'
                                    : 'bg-[#ef4444]/10 text-[#ef4444]'
                                )}
                              >
                                {isBuy ? 'LONG' : 'SHORT'}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right text-white">
                            {Math.abs(size).toFixed(4)}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-300">
                            ${parseFloat(pos.entryPx).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-300">
                            ${parseFloat(pos.positionValue).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span
                              className={cn(
                                'font-medium',
                                unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'
                              )}
                            >
                              {unrealizedPnl >= 0 ? '+' : ''}
                              {formatCurrency(unrealizedPnl)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
                  No open positions
                </div>
              )}
            </div>
          )}

          {tab === 'followers' && (
            <VaultFollowers followers={followers || []} />
          )}

          {tab === 'performance' && (
            <div className="p-4">
              {summary.portfolioPeriods && summary.portfolioPeriods.length > 0 ? (
                <div className="space-y-2">
                  {summary.portfolioPeriods.map((period) => {
                    const pnl = parseFloat(period.pnl);
                    return (
                      <div
                        key={period.period}
                        className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
                      >
                        <span className="text-gray-400 text-xs">{period.period}</span>
                        <div className="flex items-center gap-6">
                          <span className="text-gray-400 text-xs">
                            APR: <span className={cn(
                              period.apr >= 0 ? 'text-green-400' : 'text-red-400'
                            )}>{period.apr.toFixed(1)}%</span>
                          </span>
                          <span className="text-gray-400 text-xs">
                            PnL:{' '}
                            <span
                              className={cn(
                                'font-medium',
                                pnl >= 0 ? 'text-green-400' : 'text-red-400'
                              )}
                            >
                              {pnl >= 0 ? '+' : ''}
                              {formatCurrency(pnl)}
                            </span>
                          </span>
                          <span className="text-gray-400 text-xs">
                            Vol: {formatCurrency(parseFloat(period.vlm))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
                  No performance data available
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      <VaultDepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        vaultAddress={vaultAddress}
        vaultName={summary.name}
        currentEquity={currentUserEquity}
        lockedUntil={userEquity?.lockedUntil}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
